import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { getPrismaClient } from '../lib/database.js';
import { writeAuthMiddleware } from '../middleware/auth.js';

const app = new Hono();

// User validation schemas
const CreateUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().nullable().optional(),
  picture: z.string().url().nullable().optional(),
  role: z.enum(['user', 'admin']).default('user'),
});

const UpdateUserSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  name: z.string().nullable().optional(),
  picture: z.string().url().nullable().optional(),
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
    const { page = '1', limit = '10', sort, direction = 'asc', ...filters } = c.req.query();
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Build where clause from filters
    const whereConditions: any = {};
    
    // Handle column filters (filter_email, filter_name, etc.)
    Object.entries(filters).forEach(([key, value]) => {
      if (key.startsWith('filter_') && value) {
        const column = key.replace('filter_', '');
        if (column === 'email' || column === 'name') {
          whereConditions[column] = {
            contains: value,
            mode: 'insensitive'
          };
        } else if (column === 'role') {
          whereConditions.role = value;
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
      } else if (sort === 'updated_at') {
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
    const response = {
      data: users.map(user => ({
        ...user,
        created_at: user.createdAt.toISOString(),
        updated_at: user.updatedAt.toISOString(),
      })),
      current_page: pageNum,
      last_page: Math.ceil(totalCount / limitNum),
      per_page: limitNum,
      total: totalCount,
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
      created_at: user.createdAt.toISOString(),
      updated_at: user.updatedAt.toISOString(),
    };

    return c.json(response);
  } catch (error) {
    console.error('Error fetching user:', error);
    return c.json({ error: 'Failed to fetch user' }, 500);
  }
});

// Create new user
app.post('/', writeAuthMiddleware, zValidator('json', CreateUserSchema), async (c) => {
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

    const user = await database.user.create({
      data: {
        email: userData.email,
        name: userData.name || null,
        picture: userData.picture || null,
        role: userData.role,
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
      created_at: user.createdAt.toISOString(),
      updated_at: user.updatedAt.toISOString(),
    };

    return c.json(response, 201);
  } catch (error) {
    console.error('Error creating user:', error);
    return c.json({ error: 'Failed to create user' }, 500);
  }
});

// Update user
app.put('/:id', writeAuthMiddleware, zValidator('json', UpdateUserSchema), async (c) => {
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
      created_at: user.createdAt.toISOString(),
      updated_at: user.updatedAt.toISOString(),
    };

    return c.json(response);
  } catch (error) {
    console.error('Error updating user:', error);
    return c.json({ error: 'Failed to update user' }, 500);
  }
});

// Patch user (for inline editing)
app.patch('/:id', writeAuthMiddleware, async (c) => {
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
      created_at: user.createdAt.toISOString(),
      updated_at: user.updatedAt.toISOString(),
    };

    return c.json(response);
  } catch (error) {
    console.error('Error patching user:', error);
    return c.json({ error: 'Failed to update user' }, 500);
  }
});

// Delete user
app.delete('/:id', writeAuthMiddleware, async (c) => {
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

    // Delete user (cascade will handle related records)
    await database.user.delete({
      where: { id }
    });

    return c.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return c.json({ error: 'Failed to delete user' }, 500);
  }
});

// Mass actions endpoint
app.post('/mass-action', writeAuthMiddleware, zValidator('json', MassActionSchema), async (c) => {
  try {
    const database = getPrismaClient(c.env);
    const { action, ids } = c.req.valid('json');
    
    if (ids.length === 0) {
      return c.json({ error: 'No users selected' }, 400);
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
      count: result.count 
    });
  } catch (error) {
    console.error('Error executing mass action:', error);
    return c.json({ error: 'Failed to execute mass action' }, 500);
  }
});

export default app;