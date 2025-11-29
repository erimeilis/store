import { Hono } from 'hono';
import { getPrismaClient } from '@/lib/database.js';
import { adminOnlyMiddleware } from '@/middleware/admin.js';
import { validateAdminCount } from '@/lib/security-utils.js';

const app = new Hono();

/**
 * Delete user (Admin only + Admin protection)
 * DELETE /api/users/:id
 */
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

export default app;
