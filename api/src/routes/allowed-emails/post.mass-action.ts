import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { getPrismaClient } from '@/lib/database.js';
import { adminWriteAuthMiddleware } from '@/middleware/auth.js';
import { AllowedEmailMassActionSchema } from '@/const/schemas/allowed-emails.js';

const app = new Hono();

/**
 * Mass actions endpoint
 * POST /api/allowed-emails/mass-action
 */
app.post('/mass-action', adminWriteAuthMiddleware, zValidator('json', AllowedEmailMassActionSchema), async (c) => {
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

export default app;
