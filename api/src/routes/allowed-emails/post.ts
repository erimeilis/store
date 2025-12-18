import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { getPrismaClient } from '@/lib/database.js';
import { adminWriteAuthMiddleware } from '@/middleware/auth.js';
import { formatApiDate } from '@/lib/date-utils.js';
import { CreateAllowedEmailSchema } from '@/const/schemas/allowed-emails.js';

const app = new Hono();

/**
 * Create new allowed email
 * POST /api/allowed-emails
 */
app.post('/', adminWriteAuthMiddleware, zValidator('json', CreateAllowedEmailSchema), async (c) => {
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
      createdAt: formatApiDate(allowedEmail.createdAt),
    };

    return c.json(response, 201);
  } catch (error) {
    console.error('Error creating allowed email:', error);
    return c.json({ error: 'Failed to create allowed email' }, 500);
  }
});

export default app;
