import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { getPrismaClient } from '@/lib/database.js';
import { writeAuthMiddleware } from '@/middleware/auth.js';
import { adminOnlyMiddleware, adminOrOwnerMiddleware } from '@/middleware/admin.js';
import { formatApiDate } from '@/lib/date-utils.js';
import { validateAdminCount, validateEmailAllowed, validateBulkAdminOperation } from '@/lib/security-utils.js';
import { buildPaginationInfo } from '@/utils/common.js';

const app = new Hono();

// User validation schemas
const CreateUserSchema = z.object({
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address'),
  name: z.string().nullable().optional(),
  picture: z.string().regex(/^https?:\/\/.+/, 'Invalid URL').nullable().optional(),
  role: z.enum(['user', 'admin']).default('user'),
});

const UpdateUserSchema = z.object({
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address').optional(),
  name: z.string().nullable().optional(),
  picture: z.string().regex(/^https?:\/\/.+/, 'Invalid URL').nullable().optional(),
  role: z.enum(['user', 'admin']).optional(),
});

const MassActionSchema = z.object({
  action: z.enum(['make_admin', 'make_user', 'delete']),
  ids: z.array(z.string()),
});

// Get all users with pagination, filtering, and sorting
app.get('/', writeAuthMiddleware, async (c) => {
  try {
    const database = getPrismaClient(c.env);
    const { page = '1', limit = '10', sort, direction = 'asc', exact, ...filters } = c.req.query();
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Build where clause from filters
    const whereConditions: any = {};

    // Handle column filters (filterEmail, filterName, etc.) - camelCase
    Object.entries(filters).forEach(([key, value]) => {
      if (key.startsWith('filter') && value) {
        // Convert camelCase filter to column name (filterEmail -> email)
        const column = key.replace('filter', '').charAt(0).toLowerCase() + key.slice(7);
        if (column === 'email' || column === 'name') {
          if (exact && column === 'email') {
            // Exact match for email (used by OAuth callback)
            whereConditions[column] = value;
          } else {
            // Case-sensitive partial match for SQLite/D1 (no mode support)
            whereConditions[column] = {
              contains: value
            };
          }
        } else if (column === 'role') {
          whereConditions.role = value;
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
      } else if (['email', 'name', 'role'].includes(sort)) {
        orderBy = { [sort]: sortDirection };
      }
    }

    // Get users with pagination
    const [users, totalCount] = await Promise.all([
      database.user.findMany({
        where: whereConditions,
        orderBy,
        skip: offset,
        take: limitNum,
        select: {
          id: true,
          email: true,
          name: true,
          picture: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        }
      }),
      database.user.count({ where: whereConditions })
    ]);

    // Format response
    const pagination = buildPaginationInfo(pageNum, limitNum, totalCount);
    const response = {
      data: users.map(user => ({
        ...user,
        createdAt: formatApiDate(user.createdAt),
        updatedAt: formatApiDate(user.updatedAt),
      })),
      pagination
    };

    return c.json(response);
  } catch (error) {
    console.error('Error fetching users:', error);
    return c.json({ error: 'Failed to fetch users' }, 500);
  }
});

// Get single user by ID
app.get('/:id', writeAuthMiddleware, async (c) => {
  try {
    const database = getPrismaClient(c.env);
    const { id } = c.req.param();
    
    if (!id) {
      return c.json({ error: 'User ID is required' }, 400);
    }
    
    const user = await database.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        picture: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    const response = {
      ...user,
      createdAt: formatApiDate(user.createdAt),
      updatedAt: formatApiDate(user.updatedAt),
    };

    return c.json(response);
  } catch (error) {
    console.error('Error fetching user:', error);
    return c.json({ error: 'Failed to fetch user' }, 500);
  }
});

// Create new user (Admin only + Email validation)
app.post('/', adminOnlyMiddleware, zValidator('json', CreateUserSchema), async (c) => {
  try {
    const database = getPrismaClient(c.env);
    const userData = c.req.valid('json');
    
    // Check if email already exists
    const existingUser = await database.user.findUnique({
      where: { email: userData.email }
    });

    if (existingUser) {
      return c.json({ 
        error: 'Email already exists',
        errors: { email: 'This email is already registered' }
      }, 400);
    }

    // Check if this is the first user - if so, make them admin and bypass email validation
    const userCount = await database.user.count();
    const isFirstUser = userCount === 0;
    const finalRole = isFirstUser ? 'admin' : userData.role;

    // Validate email against allowed_emails (only for non-first users)
    if (!isFirstUser) {
      console.log('🔍 Validating email for non-first user:', userData.email);
      const emailValidation = await validateEmailAllowed(database, userData.email);
      console.log('📧 Email validation result:', emailValidation);

      if (!emailValidation.isAllowed && emailValidation.matchType !== 'grandfathered') {
        console.log('🚫 BLOCKING user creation - email not allowed:', {
          email: userData.email,
          reason: emailValidation.message
        });
        return c.json({
          error: 'Email not allowed',
          errors: { email: emailValidation.message },
          details: 'Only emails in the allowed_emails list can be used for new user accounts'
        }, 403);
      }
      console.log('✅ Email validation passed, proceeding with user creation');
    } else {
      console.log('🎉 First user - bypassing email validation, creating admin');
    }

    const user = await database.user.create({
      data: {
        email: userData.email,
        name: userData.name || null,
        picture: userData.picture || null,
        role: finalRole,
      },
      select: {
        id: true,
        email: true,
        name: true,
        picture: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    const response = {
      ...user,
      createdAt: formatApiDate(user.createdAt),
      updatedAt: formatApiDate(user.updatedAt),
    };

    return c.json(response, 201);
  } catch (error) {
    console.error('Error creating user:', error);
    return c.json({ error: 'Failed to create user' }, 500);
  }
});

// Update user (Admin only + Admin protection)
app.put('/:id', adminOnlyMiddleware, zValidator('json', UpdateUserSchema), async (c) => {
  try {
    const database = getPrismaClient(c.env);
    const { id } = c.req.param();
    const userData = c.req.valid('json');

    if (!id) {
      return c.json({ error: 'User ID is required' }, 400);
    }

    // Check if user exists
    const existingUser = await database.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return c.json({ error: 'User not found' }, 404);
    }

    // CRITICAL: Prevent editing other admin users
    // Only the first admin (by creation date) can edit other admins
    if (existingUser.role === 'admin') {
      // Find the first admin user
      const firstAdmin = await database.user.findFirst({
        where: { role: 'admin' },
        orderBy: { createdAt: 'asc' }
      });

      // Check if the current token represents the first admin
      // For now, we allow editing admins only via ADMIN_ACCESS_TOKEN
      const tokenType = c.get('tokenType');
      const isAdminToken = tokenType === 'admin';

      if (!isAdminToken) {
        return c.json({
          error: 'Permission denied',
          message: 'Only the primary admin can edit other admin users',
          details: 'Admin users can only be modified using the primary admin access token'
        }, 403);
      }
    }

    // Admin protection: prevent removing last admin
    if (userData.role && userData.role !== existingUser.role) {
      const adminValidation = await validateAdminCount(database, id, userData.role);
      if (!adminValidation.canProceed) {
        return c.json({
          error: 'Admin protection violation',
          message: adminValidation.message,
          details: 'Cannot modify admin role in a way that would leave the system without administrators'
        }, 403);
      }
    }

    // Check email uniqueness if email is being updated
    if (userData.email && userData.email !== existingUser.email) {
      const emailExists = await database.user.findUnique({
        where: { email: userData.email }
      });

      if (emailExists) {
        return c.json({ 
          error: 'Email already exists',
          errors: { email: 'This email is already registered' }
        }, 400);
      }

      // For existing users, allow email changes (grandfathered access)
      // New email validation only applies to new user creation
    }

    const user = await database.user.update({
      where: { id },
      data: {
        ...(userData.email && { email: userData.email }),
        ...(userData.name !== undefined && { name: userData.name }),
        ...(userData.picture !== undefined && { picture: userData.picture }),
        ...(userData.role && { role: userData.role }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        picture: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    const response = {
      ...user,
      createdAt: formatApiDate(user.createdAt),
      updatedAt: formatApiDate(user.updatedAt),
    };

    return c.json(response);
  } catch (error) {
    console.error('Error updating user:', error);
    return c.json({ error: 'Failed to update user' }, 500);
  }
});

// Patch user (for inline editing - Admin only + Admin protection)
app.patch('/:id', adminOnlyMiddleware, async (c) => {
  try {
    const database = getPrismaClient(c.env);
    const { id } = c.req.param();
    const updates = await c.req.json();

    if (!id) {
      return c.json({ error: 'User ID is required' }, 400);
    }

    // Check if user exists
    const existingUser = await database.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return c.json({ error: 'User not found' }, 404);
    }

    // CRITICAL: Prevent editing other admin users
    // Only the first admin (by creation date) can edit other admins
    if (existingUser.role === 'admin') {
      // Check if the current token represents the primary admin
      const tokenType = c.get('tokenType');
      const isAdminToken = tokenType === 'admin';

      if (!isAdminToken) {
        return c.json({
          error: 'Permission denied',
          message: 'Only the primary admin can edit other admin users',
          details: 'Admin users can only be modified using the primary admin access token'
        }, 403);
      }
    }

    // Admin protection: prevent role changes that would remove last admin
    if (updates.role && updates.role !== existingUser.role) {
      const adminValidation = await validateAdminCount(database, id, updates.role);
      if (!adminValidation.canProceed) {
        return c.json({
          error: 'Admin protection violation',
          message: adminValidation.message,
          details: 'Cannot modify admin role - would leave system without administrators'
        }, 403);
      }
    }

    // Validate specific field updates for inline editing
    const allowedFields = ['role', 'name', 'email'];
    const updateData: any = {};

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        if (key === 'role' && !['user', 'admin'].includes(value as string)) {
          return c.json({ error: 'Invalid role value' }, 400);
        }
        if (key === 'email') {
          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value as string)) {
            return c.json({ error: 'Invalid email format' }, 400);
          }
          // Check email uniqueness
          if (value !== existingUser.email) {
            const emailExists = await database.user.findUnique({
              where: { email: value as string }
            });
            if (emailExists) {
              return c.json({ error: 'Email already exists' }, 400);
            }
          }
        }
        updateData[key] = value;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return c.json({ error: 'No valid fields to update' }, 400);
    }

    const user = await database.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        picture: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    const response = {
      ...user,
      createdAt: formatApiDate(user.createdAt),
      updatedAt: formatApiDate(user.updatedAt),
    };

    return c.json(response);
  } catch (error) {
    console.error('Error patching user:', error);
    return c.json({ error: 'Failed to update user' }, 500);
  }
});

// Delete user (Admin only + Admin protection)
app.delete('/:id', adminOnlyMiddleware, async (c) => {
  try {
    const database = getPrismaClient(c.env);
    const { id } = c.req.param();

    if (!id) {
      return c.json({ error: 'User ID is required' }, 400);
    }

    // Check if user exists
    const existingUser = await database.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return c.json({ error: 'User not found' }, 404);
    }

    // CRITICAL: Prevent deleting admin users
    // Only the primary admin (via ADMIN_ACCESS_TOKEN) can delete admin users
    if (existingUser.role === 'admin') {
      const tokenType = c.get('tokenType');
      const isAdminToken = tokenType === 'admin';

      if (!isAdminToken) {
        return c.json({
          error: 'Permission denied',
          message: 'Only the primary admin can delete other admin users',
          details: 'Admin users can only be deleted using the primary admin access token'
        }, 403);
      }
    }

    // Admin protection: prevent deleting last admin
    const adminValidation = await validateAdminCount(database, id);
    if (!adminValidation.canProceed) {
      return c.json({
        error: 'Admin protection violation',
        message: adminValidation.message,
        details: 'Cannot delete the last admin user. At least one admin must exist.'
      }, 403);
    }

    // Delete user (cascade will handle related records)
    await database.user.delete({
      where: { id }
    });

    return c.json({ 
      message: 'User deleted successfully',
      details: `User ${existingUser.email} has been removed from the system`
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return c.json({ error: 'Failed to delete user' }, 500);
  }
});

// Mass actions endpoint (Admin only + Bulk admin protection)
app.post('/mass-action', adminOnlyMiddleware, zValidator('json', MassActionSchema), async (c) => {
  try {
    const database = getPrismaClient(c.env);
    const { action, ids } = c.req.valid('json');
    
    if (ids.length === 0) {
      return c.json({ error: 'No users selected' }, 400);
    }

    // Validate bulk admin operations
    const bulkValidation = await validateBulkAdminOperation(database, ids, action);
    if (!bulkValidation.canProceed) {
      return c.json({
        error: 'Bulk admin protection violation',
        message: bulkValidation.message,
        details: 'This operation would compromise admin access to the system'
      }, 403);
    }

    let result;
    
    switch (action) {
      case 'make_admin':
        result = await database.user.updateMany({
          where: { id: { in: ids } },
          data: { role: 'admin' }
        });
        break;
        
      case 'make_user':
        result = await database.user.updateMany({
          where: { id: { in: ids } },
          data: { role: 'user' }
        });
        break;
        
      case 'delete':
        result = await database.user.deleteMany({
          where: { id: { in: ids } }
        });
        break;
        
      default:
        return c.json({ error: 'Invalid action' }, 400);
    }

    return c.json({ 
      message: `Successfully ${action.replace('_', ' ')}ed ${result.count} user(s)`,
      count: result.count,
      details: bulkValidation.message 
    });
  } catch (error) {
    console.error('Error executing mass action:', error);
    return c.json({ error: 'Failed to execute mass action' }, 500);
  }
});

export default app;