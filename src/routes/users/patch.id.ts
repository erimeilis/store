import { Hono } from 'hono';
import { getPrismaClient } from '@/lib/database.js';
import { adminOnlyMiddleware } from '@/middleware/admin.js';
import { formatApiDate } from '@/lib/date-utils.js';
import { validateAdminCount } from '@/lib/security-utils.js';

const app = new Hono();

/**
 * Patch user (for inline editing - Admin only + Admin protection)
 * PATCH /api/users/:id
 */
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

export default app;
