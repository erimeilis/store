import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { getPrismaClient } from '@/lib/database.js';
import { adminWriteAuthMiddleware } from '@/middleware/auth.js';
import { validateEmailAllowed } from '@/lib/security-utils.js';
import { ValidateEmailSchema } from '@/const/schemas/allowed-emails.js';

const app = new Hono();

/**
 * Email validation endpoint (for OAuth callback)
 * POST /api/allowed-emails/validate
 */
app.post('/validate', adminWriteAuthMiddleware, zValidator('json', ValidateEmailSchema), async (c) => {
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
