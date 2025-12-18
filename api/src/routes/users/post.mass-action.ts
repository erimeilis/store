import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { getPrismaClient } from '@/lib/database.js';
import { adminOnlyMiddleware } from '@/middleware/admin.js';
import { validateBulkAdminOperation } from '@/lib/security-utils.js';
import { UserMassActionSchema } from '@/const/schemas/users.js';

const app = new Hono();

/**
 * Mass actions endpoint (Admin only + Bulk admin protection)
 * POST /api/users/mass-action
 */
app.post('/mass-action', adminOnlyMiddleware, zValidator('json', UserMassActionSchema), async (c) => {
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
