import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { getPrismaClient } from '@/lib/database.js';
import { writeAuthMiddleware } from '@/middleware/auth.js';
import { formatApiDate } from '@/lib/date-utils.js';
import { buildPaginationInfo } from '@/utils/common.js';
import { PostmanGeneratorService } from '@/services/postman-generator.js';

const app = new Hono();

// Token validation schemas
const CreateTokenSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  permissions: z.string().default('read'), // comma-separated: read,write,delete,admin
  allowedIps: z.string().nullable().optional(), // JSON array of IPs/CIDR ranges
  allowedDomains: z.string().nullable().optional(), // JSON array of domain patterns
  tableAccess: z.array(z.string()).default([]), // Array of table IDs the token can access
  expiresAt: z.string().datetime().nullable().optional(),
});

const UpdateTokenSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  permissions: z.string().optional(),
  allowedIps: z.string().nullable().optional(),
  allowedDomains: z.string().nullable().optional(),
  tableAccess: z.array(z.string()).optional(),
  expiresAt: z.string().datetime().nullable().optional(),
});

const MassActionSchema = z.object({
  action: z.enum(['regenerate', 'delete', 'extend_expiry']),
  ids: z.array(z.string()),
});

// Generate secure token using Web Crypto API
function generateSecureToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Get all tokens with pagination, filtering, and sorting
app.get('/', writeAuthMiddleware, async (c) => {
  try {
    const database = getPrismaClient(c.env);
    const user = c.get('user');
    const { page = '1', limit = '10', sort, direction = 'asc', ...filters } = c.req.query();

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Build where clause from filters
    const whereConditions: any = {};

    // Non-admin users can only see their own tokens
    if (!user.permissions.includes('admin')) {
      whereConditions.id = {
        notIn: ['admin-token', 'frontend-token'] // Exclude system tokens for non-admins
      };
    }

    // Handle column filters (filter_name, filter_permissions, etc.)
    Object.entries(filters).forEach(([key, value]) => {
      if (key.startsWith('filter_') && value) {
        const column = key.replace('filter_', '');
        if (column === 'name') {
          whereConditions[column] = {
            contains: value
          };
        } else if (column === 'permissions') {
          whereConditions.permissions = {
            contains: value
          };
        } else if (column === 'createdAt') {
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
        } else if (column === 'expiresAt') {
          // Handle expiry date filtering
          const date = new Date(value as string);
          if (!isNaN(date.getTime())) {
            const nextDay = new Date(date);
            nextDay.setDate(date.getDate() + 1);
            whereConditions.expiresAt = {
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
      if (sort === 'createdAt') {
        orderBy = { createdAt: sortDirection };
      } else if (sort === 'updatedAt') {
        orderBy = { updatedAt: sortDirection };
      } else if (sort === 'expiresAt') {
        orderBy = { expiresAt: sortDirection };
      } else if (['name', 'permissions'].includes(sort)) {
        orderBy = { [sort]: sortDirection };
      }
    }

    // Get tokens with pagination
    const [tokens, totalCount] = await Promise.all([
      database.token.findMany({
        where: whereConditions,
        orderBy,
        skip: offset,
        take: limitNum,
        select: {
          id: true,
          token: true,
          name: true,
          permissions: true,
          allowedIps: true,
          allowedDomains: true,
          tableAccess: true,
          expiresAt: true,
          createdAt: true,
          updatedAt: true,
        }
      }),
      database.token.count({ where: whereConditions })
    ]);

    // Format response
    const pagination = buildPaginationInfo(pageNum, limitNum, totalCount);
    const response = {
      data: tokens.map(token => ({
        ...token,
        allowed_ips: token.allowedIps,
        allowed_domains: token.allowedDomains,
        expires_at: token.expiresAt ? formatApiDate(token.expiresAt) : null,
        createdAt: formatApiDate(token.createdAt),
        updatedAt: formatApiDate(token.updatedAt),
      })),
      pagination
    };

    return c.json(response);
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return c.json({ error: 'Failed to fetch tokens' }, 500);
  }
});

// Get single token by ID
app.get('/:id', writeAuthMiddleware, async (c) => {
  try {
    const database = getPrismaClient(c.env);
    const { id } = c.req.param();
    
    if (!id) {
      return c.json({ error: 'Token ID is required' }, 400);
    }
    
    const token = await database.token.findUnique({
      where: { id },
      select: {
        id: true,
        token: true,
        name: true,
        permissions: true,
        allowedIps: true,
        allowedDomains: true,
        tableAccess: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!token) {
      return c.json({ error: 'Token not found' }, 404);
    }

    const response = {
      ...token,
      allowedIps: token.allowedIps,
      allowedDomains: token.allowedDomains,
      tableAccess: token.tableAccess ? JSON.parse(token.tableAccess) : [],
      expiresAt: token.expiresAt ? token.expiresAt.toISOString() : null,
      createdAt: formatApiDate(token.createdAt),
      updatedAt: formatApiDate(token.updatedAt),
    };

    return c.json(response);
  } catch (error) {
    console.error('Error fetching token:', error);
    return c.json({ error: 'Failed to fetch token' }, 500);
  }
});

// Generate Postman collection for a token
app.get('/:id/postman', writeAuthMiddleware, async (c) => {
  try {
    const database = getPrismaClient(c.env);
    const { id } = c.req.param();

    if (!id) {
      return c.json({ error: 'Token ID is required' }, 400);
    }

    // Get token details
    const token = await database.token.findUnique({
      where: { id },
      select: {
        id: true,
        token: true,
        name: true,
        permissions: true,
        allowedIps: true,
        allowedDomains: true,
        tableAccess: true,
        expiresAt: true,
      }
    });

    if (!token) {
      return c.json({ error: 'Token not found' }, 404);
    }

    // Get all tables to filter based on token access
    const tables = await database.userTable.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        forSale: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Generate Postman collection
    const apiUrl = c.env?.API_URL || 'http://localhost:8787';
    const postmanService = new PostmanGeneratorService(apiUrl);

    const tokenWithParsedAccess = {
      ...token,
      tableAccess: token.tableAccess ? JSON.parse(token.tableAccess) : null,
    };

    const collection = await postmanService.generateCollection(tokenWithParsedAccess, tables);

    // Set response headers for file download
    c.header('Content-Type', 'application/json');
    c.header('Content-Disposition', `attachment; filename="${token.name.replace(/[^a-z0-9]/gi, '_')}_collection.json"`);

    return c.json(collection);
  } catch (error) {
    console.error('Error generating Postman collection:', error);
    return c.json({ error: 'Failed to generate Postman collection' }, 500);
  }
});

// Create new token
app.post('/', writeAuthMiddleware, zValidator('json', CreateTokenSchema), async (c) => {
  try {
    const database = getPrismaClient(c.env);
    const tokenData = c.req.valid('json');
    
    // Generate secure token
    const tokenValue = generateSecureToken();
    
    // Check if name already exists
    const existingToken = await database.token.findFirst({
      where: { name: tokenData.name }
    });

    if (existingToken) {
      return c.json({ 
        error: 'Name already exists',
        errors: { name: 'This token name is already in use' }
      }, 400);
    }

    // Validate that at least one table is selected (unless no tables exist in system)
    if (!tokenData.tableAccess || tokenData.tableAccess.length === 0) {
      // Check if there are any tables in the system
      const tablesCount = await database.userTable.count();
      if (tablesCount > 0) {
        return c.json({
          error: 'Table access required',
          errors: { tableAccess: 'At least one table must be selected for token access' }
        }, 400);
      }
    }

    const token = await database.token.create({
      data: {
        token: tokenValue,
        name: tokenData.name,
        permissions: tokenData.permissions || 'read',
        allowedIps: tokenData.allowedIps || null,
        allowedDomains: tokenData.allowedDomains || null,
        tableAccess: JSON.stringify(tokenData.tableAccess),
        expiresAt: tokenData.expiresAt ? new Date(tokenData.expiresAt) : null,
      },
      select: {
        id: true,
        token: true,
        name: true,
        permissions: true,
        allowedIps: true,
        allowedDomains: true,
        tableAccess: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    const response = {
      ...token,
      allowed_ips: token.allowedIps,
      allowed_domains: token.allowedDomains,
      table_access: token.tableAccess ? JSON.parse(token.tableAccess) : [],
      expires_at: token.expiresAt ? formatApiDate(token.expiresAt) : null,
      createdAt: formatApiDate(token.createdAt),
      updatedAt: formatApiDate(token.updatedAt),
    };

    return c.json(response, 201);
  } catch (error) {
    console.error('Error creating token:', error);
    return c.json({ error: 'Failed to create token' }, 500);
  }
});

// Update token
app.put('/:id', writeAuthMiddleware, zValidator('json', UpdateTokenSchema), async (c) => {
  try {
    const database = getPrismaClient(c.env);
    const { id } = c.req.param();
    const tokenData = c.req.valid('json');
    
    if (!id) {
      return c.json({ error: 'Token ID is required' }, 400);
    }
    
    // Check if token exists
    const existingToken = await database.token.findUnique({
      where: { id }
    });

    if (!existingToken) {
      return c.json({ error: 'Token not found' }, 404);
    }

    // Check name uniqueness if name is being updated
    if (tokenData.name && tokenData.name !== existingToken.name) {
      const nameExists = await database.token.findFirst({
        where: { name: tokenData.name }
      });

      if (nameExists) {
        return c.json({ 
          error: 'Name already exists',
          errors: { name: 'This token name is already in use' }
        }, 400);
      }
    }

    const token = await database.token.update({
      where: { id },
      data: {
        ...(tokenData.name && { name: tokenData.name }),
        ...(tokenData.permissions && { permissions: tokenData.permissions }),
        ...(tokenData.allowedIps !== undefined && { allowedIps: tokenData.allowedIps }),
        ...(tokenData.allowedDomains !== undefined && { allowedDomains: tokenData.allowedDomains }),
        ...(tokenData.tableAccess !== undefined && { tableAccess: JSON.stringify(tokenData.tableAccess) }),
        ...(tokenData.expiresAt !== undefined && {
          expiresAt: tokenData.expiresAt ? new Date(tokenData.expiresAt) : null
        }),
      },
      select: {
        id: true,
        token: true,
        name: true,
        permissions: true,
        allowedIps: true,
        allowedDomains: true,
        tableAccess: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    const response = {
      ...token,
      allowed_ips: token.allowedIps,
      allowed_domains: token.allowedDomains,
      table_access: token.tableAccess ? JSON.parse(token.tableAccess) : [],
      expires_at: token.expiresAt ? formatApiDate(token.expiresAt) : null,
      createdAt: formatApiDate(token.createdAt),
      updatedAt: formatApiDate(token.updatedAt),
    };

    return c.json(response);
  } catch (error) {
    console.error('Error updating token:', error);
    return c.json({ error: 'Failed to update token' }, 500);
  }
});

// Patch token (for inline editing)
app.patch('/:id', writeAuthMiddleware, async (c) => {
  try {
    const database = getPrismaClient(c.env);
    const { id } = c.req.param();
    const updates = await c.req.json();
    
    if (!id) {
      return c.json({ error: 'Token ID is required' }, 400);
    }
    
    // Check if token exists
    const existingToken = await database.token.findUnique({
      where: { id }
    });

    if (!existingToken) {
      return c.json({ error: 'Token not found' }, 404);
    }

    // Validate specific field updates for inline editing
    const allowedFields = ['name', 'permissions', 'allowedIps', 'allowedDomains', 'expiresAt'];
    const updateData: any = {};

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        if (key === 'name') {
          // Check name uniqueness
          if (value !== existingToken.name) {
            const nameExists = await database.token.findFirst({
              where: { name: value as string }
            });
            if (nameExists) {
              return c.json({ error: 'Token name already exists' }, 400);
            }
          }
          updateData[key] = value;
        } else if (key === 'permissions') {
          updateData[key] = value;
        } else if (key === 'allowedIps' || key === 'allowedDomains') {
          updateData[key] = value || null;
        } else if (key === 'tableAccess') {
          updateData[key] = value ? JSON.stringify(value) : null;
        } else if (key === 'expiresAt') {
          updateData[key] = value ? new Date(value as string) : null;
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return c.json({ error: 'No valid fields to update' }, 400);
    }

    const token = await database.token.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        token: true,
        name: true,
        permissions: true,
        allowedIps: true,
        allowedDomains: true,
        tableAccess: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    const response = {
      ...token,
      allowed_ips: token.allowedIps,
      allowed_domains: token.allowedDomains,
      table_access: token.tableAccess ? JSON.parse(token.tableAccess) : [],
      expires_at: token.expiresAt ? formatApiDate(token.expiresAt) : null,
      createdAt: formatApiDate(token.createdAt),
      updatedAt: formatApiDate(token.updatedAt),
    };

    return c.json(response);
  } catch (error) {
    console.error('Error patching token:', error);
    return c.json({ error: 'Failed to update token' }, 500);
  }
});

// Delete token
app.delete('/:id', writeAuthMiddleware, async (c) => {
  try {
    const database = getPrismaClient(c.env);
    const { id } = c.req.param();
    
    if (!id) {
      return c.json({ error: 'Token ID is required' }, 400);
    }
    
    // Check if token exists
    const existingToken = await database.token.findUnique({
      where: { id }
    });

    if (!existingToken) {
      return c.json({ error: 'Token not found' }, 404);
    }

    // Delete token
    await database.token.delete({
      where: { id }
    });

    return c.json({ message: 'Token deleted successfully' });
  } catch (error) {
    console.error('Error deleting token:', error);
    return c.json({ error: 'Failed to delete token' }, 500);
  }
});

// Mass actions endpoint
app.post('/mass-action', writeAuthMiddleware, zValidator('json', MassActionSchema), async (c) => {
  try {
    const database = getPrismaClient(c.env);
    const { action, ids } = c.req.valid('json');
    
    if (ids.length === 0) {
      return c.json({ error: 'No tokens selected' }, 400);
    }

    let result;
    
    switch (action) {
      case 'regenerate':
        // Regenerate tokens for selected items
        const tokens = await database.token.findMany({
          where: { id: { in: ids } }
        });
        
        for (const token of tokens) {
          await database.token.update({
            where: { id: token.id },
            data: { token: generateSecureToken() }
          });
        }
        
        result = { count: tokens.length };
        break;
        
      case 'extend_expiry':
        // Extend expiry by 1 year for tokens that have an expiry
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        
        result = await database.token.updateMany({
          where: { 
            id: { in: ids },
            expiresAt: { not: null }
          },
          data: { expiresAt: oneYearFromNow }
        });
        break;
        
      case 'delete':
        result = await database.token.deleteMany({
          where: { id: { in: ids } }
        });
        break;
        
      default:
        return c.json({ error: 'Invalid action' }, 400);
    }

    return c.json({ 
      message: `Successfully ${action.replace('_', ' ')}ed ${result.count} token(s)`,
      count: result.count 
    });
  } catch (error) {
    console.error('Error executing mass action:', error);
    return c.json({ error: 'Failed to execute mass action' }, 500);
  }
});

export default app;
