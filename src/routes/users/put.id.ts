import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { getPrismaClient } from '@/lib/database.js';
import { adminOnlyMiddleware } from '@/middleware/admin.js';
import { formatApiDate } from '@/lib/date-utils.js';
import { validateAdminCount } from '@/lib/security-utils.js';
import { UpdateUserSchema } from '@/const/schemas/users.js';

const app = new Hono();

/**
 * Update user (Admin only + Admin protection)
 * PUT /api/users/:id
 */
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

export default app;
