import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { getPrismaClient } from '@/lib/database.js';
import { writeAuthMiddleware } from '@/middleware/auth.js';
import { formatApiDate } from '@/lib/date-utils.js';
import { validateEmailAllowed } from '@/lib/security-utils.js';
import { buildPaginationInfo } from '@/utils/common.js';

const app = new Hono();

// AllowedEmail validation schemas
const CreateAllowedEmailSchema = z.object({
  type: z.enum(['email', 'domain'], {
    message: 'Type is required and must be either "email" or "domain"'
  }),
  email: z.string().email('Invalid email address').nullable().optional(),
  domain: z.string().min(1, 'Domain is required').nullable().optional(),
}).refine(
  (data) => {
    if (data.type === 'email' && !data.email) {
      return false;
    }
    if (data.type === 'domain' && !data.domain) {
      return false;
    }
    return true;
  },
  {
    message: 'Email is required when type is "email", domain is required when type is "domain"',
    path: ['email', 'domain'],
  }
);

const UpdateAllowedEmailSchema = z.object({
  type: z.enum(['email', 'domain']).optional(),
  email: z.string().email('Invalid email address').nullable().optional(),
  domain: z.string().min(1, 'Domain is required').nullable().optional(),
});

const MassActionSchema = z.object({
  action: z.enum(['delete']),
  ids: z.array(z.string()),
});

const ValidateEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// Get all allowed emails with pagination, filtering, and sorting
app.get('/', writeAuthMiddleware, async (c) => {
  try {
    const database = getPrismaClient(c.env);
    const { page = '1', limit = '10', sort, direction = 'asc', ...filters } = c.req.query();
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Build where clause from filters
    const whereConditions: any = {};
    
    // Handle column filters (filter_email, filter_domain, etc.)
    Object.entries(filters).forEach(([key, value]) => {
      if (key.startsWith('filter_') && value) {
        const column = key.replace('filter_', '');
        if (column === 'email' && value) {
          whereConditions.email = {
            contains: value
          };
        } else if (column === 'domain' && value) {
          whereConditions.domain = {
            contains: value
          };
        } else if (column === 'type' && value) {
          whereConditions.type = value;
        } else if (column === 'created_at') {
          // Handle date filtering
          const date = new Date(value as string);
          if (!isNaN(date.getTime())) {
            const nextDay = new Date(date);
            nextDay.setDate(date.getDate() + 1);
            whereConditions.createdAt = {
              gte: date,
              lt: nextDay
            };
          }
        }
      }
    });

    // Build orderBy clause
    let orderBy: any = { createdAt: 'desc' }; // default
    if (sort) {
      const sortDirection = direction === 'desc' ? 'desc' : 'asc';
      if (sort === 'created_at') {
        orderBy = { createdAt: sortDirection };
      } else if (['email', 'domain', 'type'].includes(sort)) {
        orderBy = { [sort]: sortDirection };
      }
    }

    // Get allowed emails with pagination
    const [allowedEmails, totalCount] = await Promise.all([
      database.allowedEmail.findMany({
        where: whereConditions,
        orderBy,
        skip: offset,
        take: limitNum,
        select: {
          id: true,
          email: true,
          domain: true,
          type: true,
          createdAt: true,
        }
      }),
      database.allowedEmail.count({ where: whereConditions })
    ]);

    // Format response
    const pagination = buildPaginationInfo(pageNum, limitNum, totalCount);
    const response = {
      data: allowedEmails.map(allowedEmail => ({
        ...allowedEmail,
        created_at: formatApiDate(allowedEmail.createdAt),
      })),
      pagination
    };

    return c.json(response);
  } catch (error) {
    console.error('Error fetching allowed emails:', error);
    return c.json({ error: 'Failed to fetch allowed emails' }, 500);
  }
});

// Get single allowed email by ID
app.get('/:id', writeAuthMiddleware, async (c) => {
  try {
    const database = getPrismaClient(c.env);
    const { id } = c.req.param();
    
    if (!id) {
      return c.json({ error: 'Allowed email ID is required' }, 400);
    }
    
    const allowedEmail = await database.allowedEmail.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        domain: true,
        type: true,
        createdAt: true,
      }
    });

    if (!allowedEmail) {
      return c.json({ error: 'Allowed email not found' }, 404);
    }

    const response = {
      ...allowedEmail,
      created_at: formatApiDate(allowedEmail.createdAt),
    };

    return c.json(response);
  } catch (error) {
    console.error('Error fetching allowed email:', error);
    return c.json({ error: 'Failed to fetch allowed email' }, 500);
  }
});

// Create new allowed email
app.post('/', writeAuthMiddleware, zValidator('json', CreateAllowedEmailSchema), async (c) => {
  try {
    const database = getPrismaClient(c.env);
    const allowedEmailData = c.req.valid('json');
    
    // Check for duplicates
    if (allowedEmailData.type === 'email' && allowedEmailData.email) {
      const existingEmail = await database.allowedEmail.findFirst({
        where: { 
          type: 'email',
          email: allowedEmailData.email 
        }
      });

      if (existingEmail) {
        return c.json({ 
          error: 'Email already exists',
          errors: { email: 'This email is already in the allowed list' }
        }, 400);
      }
    }

    if (allowedEmailData.type === 'domain' && allowedEmailData.domain) {
      const existingDomain = await database.allowedEmail.findFirst({
        where: { 
          type: 'domain',
          domain: allowedEmailData.domain 
        }
      });

      if (existingDomain) {
        return c.json({ 
          error: 'Domain already exists',
          errors: { domain: 'This domain is already in the allowed list' }
        }, 400);
      }
    }

    const allowedEmail = await database.allowedEmail.create({
      data: {
        type: allowedEmailData.type,
        email: allowedEmailData.type === 'email' ? allowedEmailData.email! : null,
        domain: allowedEmailData.type === 'domain' ? allowedEmailData.domain! : null,
      },
      select: {
        id: true,
        email: true,
        domain: true,
        type: true,
        createdAt: true,
      }
    });

    const response = {
      ...allowedEmail,
      created_at: formatApiDate(allowedEmail.createdAt),
    };

    return c.json(response, 201);
  } catch (error) {
    console.error('Error creating allowed email:', error);
    return c.json({ error: 'Failed to create allowed email' }, 500);
  }
});

// Update allowed email
app.put('/:id', writeAuthMiddleware, zValidator('json', UpdateAllowedEmailSchema), async (c) => {
  try {
    const database = getPrismaClient(c.env);
    const { id } = c.req.param();
    const allowedEmailData = c.req.valid('json');
    
    if (!id) {
      return c.json({ error: 'Allowed email ID is required' }, 400);
    }
    
    // Check if allowed email exists
    const existingAllowedEmail = await database.allowedEmail.findUnique({
      where: { id }
    });

    if (!existingAllowedEmail) {
      return c.json({ error: 'Allowed email not found' }, 404);
    }

    // Validate data consistency
    if (allowedEmailData.type === 'email' && !allowedEmailData.email) {
      return c.json({ 
        error: 'Validation failed',
        errors: { email: 'Email is required when type is "email"' }
      }, 400);
    }

    if (allowedEmailData.type === 'domain' && !allowedEmailData.domain) {
      return c.json({ 
        error: 'Validation failed',
        errors: { domain: 'Domain is required when type is "domain"' }
      }, 400);
    }

    // Check for duplicates
    if (allowedEmailData.type === 'email' && allowedEmailData.email) {
      const duplicateEmail = await database.allowedEmail.findFirst({
        where: { 
          type: 'email',
          email: allowedEmailData.email,
          id: { not: id }
        }
      });

      if (duplicateEmail) {
        return c.json({ 
          error: 'Email already exists',
          errors: { email: 'This email is already in the allowed list' }
        }, 400);
      }
    }

    if (allowedEmailData.type === 'domain' && allowedEmailData.domain) {
      const duplicateDomain = await database.allowedEmail.findFirst({
        where: { 
          type: 'domain',
          domain: allowedEmailData.domain,
          id: { not: id }
        }
      });

      if (duplicateDomain) {
        return c.json({ 
          error: 'Domain already exists',
          errors: { domain: 'This domain is already in the allowed list' }
        }, 400);
      }
    }

    const updateData: any = {};
    
    if (allowedEmailData.type) {
      updateData.type = allowedEmailData.type;
      if (allowedEmailData.type === 'email') {
        updateData.email = allowedEmailData.email || null;
        updateData.domain = null;
      } else if (allowedEmailData.type === 'domain') {
        updateData.domain = allowedEmailData.domain || null;
        updateData.email = null;
      }
    } else {
      // Update only the relevant field based on existing type
      if (existingAllowedEmail.type === 'email' && allowedEmailData.email !== undefined) {
        updateData.email = allowedEmailData.email;
      }
      if (existingAllowedEmail.type === 'domain' && allowedEmailData.domain !== undefined) {
        updateData.domain = allowedEmailData.domain;
      }
    }

    const allowedEmail = await database.allowedEmail.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        domain: true,
        type: true,
        createdAt: true,
      }
    });

    const response = {
      ...allowedEmail,
      created_at: formatApiDate(allowedEmail.createdAt),
    };

    return c.json(response);
  } catch (error) {
    console.error('Error updating allowed email:', error);
    return c.json({ error: 'Failed to update allowed email' }, 500);
  }
});

// Patch allowed email (for inline editing)
app.patch('/:id', writeAuthMiddleware, async (c) => {
  try {
    const database = getPrismaClient(c.env);
    const { id } = c.req.param();
    const updates = await c.req.json();
    
    if (!id) {
      return c.json({ error: 'Allowed email ID is required' }, 400);
    }
    
    // Check if allowed email exists
    const existingAllowedEmail = await database.allowedEmail.findUnique({
      where: { id }
    });

    if (!existingAllowedEmail) {
      return c.json({ error: 'Allowed email not found' }, 404);
    }

    // Validate specific field updates for inline editing
    const allowedFields = ['type', 'email', 'domain'];
    const updateData: any = {};

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        if (key === 'type' && ['email', 'domain'].includes(value as string)) {
          updateData.type = value;
        } else if (key === 'email') {
          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (value && !emailRegex.test(value as string)) {
            return c.json({ error: 'Invalid email format' }, 400);
          }
          
          // Check for duplicates
          if (value && value !== existingAllowedEmail.email) {
            const duplicateEmail = await database.allowedEmail.findFirst({
              where: { 
                type: 'email',
                email: value as string,
                id: { not: id }
              }
            });
            if (duplicateEmail) {
              return c.json({ error: 'Email already exists in allowed list' }, 400);
            }
          }
          updateData.email = value || null;
        } else if (key === 'domain') {
          // Check for duplicates
          if (value && value !== existingAllowedEmail.domain) {
            const duplicateDomain = await database.allowedEmail.findFirst({
              where: { 
                type: 'domain',
                domain: value as string,
                id: { not: id }
              }
            });
            if (duplicateDomain) {
              return c.json({ error: 'Domain already exists in allowed list' }, 400);
            }
          }
          updateData.domain = value || null;
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return c.json({ error: 'No valid fields to update' }, 400);
    }

    const allowedEmail = await database.allowedEmail.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        domain: true,
        type: true,
        createdAt: true,
      }
    });

    const response = {
      ...allowedEmail,
      created_at: formatApiDate(allowedEmail.createdAt),
    };

    return c.json(response);
  } catch (error) {
    console.error('Error patching allowed email:', error);
    return c.json({ error: 'Failed to update allowed email' }, 500);
  }
});

// Delete allowed email
app.delete('/:id', writeAuthMiddleware, async (c) => {
  try {
    const database = getPrismaClient(c.env);
    const { id } = c.req.param();
    
    if (!id) {
      return c.json({ error: 'Allowed email ID is required' }, 400);
    }
    
    // Check if allowed email exists
    const existingAllowedEmail = await database.allowedEmail.findUnique({
      where: { id }
    });

    if (!existingAllowedEmail) {
      return c.json({ error: 'Allowed email not found' }, 404);
    }

    // Delete allowed email
    await database.allowedEmail.delete({
      where: { id }
    });

    return c.json({ message: 'Allowed email deleted successfully' });
  } catch (error) {
    console.error('Error deleting allowed email:', error);
    return c.json({ error: 'Failed to delete allowed email' }, 500);
  }
});

// Mass actions endpoint
app.post('/mass-action', writeAuthMiddleware, zValidator('json', MassActionSchema), async (c) => {
  try {
    const database = getPrismaClient(c.env);
    const { action, ids } = c.req.valid('json');
    
    if (ids.length === 0) {
      return c.json({ error: 'No allowed emails selected' }, 400);
    }

    let result;
    
    switch (action) {
      case 'delete':
        result = await database.allowedEmail.deleteMany({
          where: { id: { in: ids } }
        });
        break;
        
      default:
        return c.json({ error: 'Invalid action' }, 400);
    }

    return c.json({ 
      message: `Successfully deleted ${result.count} allowed email(s)`,
      count: result.count 
    });
  } catch (error) {
    console.error('Error executing mass action:', error);
    return c.json({ error: 'Failed to execute mass action' }, 500);
  }
});

// Email validation endpoint (for OAuth callback)
app.post('/validate', writeAuthMiddleware, zValidator('json', ValidateEmailSchema), async (c) => {
  try {
    const database = getPrismaClient(c.env);
    const { email } = c.req.valid('json');

    console.log('🔍 Validating email access:', { email });

    // Check if this is the first user - if so, bypass email validation
    const userCount = await database.user.count();
    const isFirstUser = userCount === 0;

    if (isFirstUser) {
      console.log('✅ First user - bypassing email validation:', { email });
      return c.json({
        isAllowed: true,
        matchType: 'grandfathered',
        message: 'First user - automatically allowed'
      });
    }

    const validationResult = await validateEmailAllowed(database, email);

    console.log('✅ Email validation result:', {
      email,
      isAllowed: validationResult.isAllowed,
      matchType: validationResult.matchType,
      message: validationResult.message
    });

    return c.json(validationResult);
  } catch (error) {
    console.error('Error validating email:', error);
    return c.json({
      isAllowed: false,
      matchType: null,
      message: 'Failed to validate email due to server error'
    }, 500);
  }
});

export default app;