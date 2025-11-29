import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { getPrismaClient } from '@/lib/database.js';
import { adminOnlyMiddleware } from '@/middleware/admin.js';
import { formatApiDate } from '@/lib/date-utils.js';
import { validateEmailAllowed } from '@/lib/security-utils.js';
import { CreateUserSchema } from '@/const/schemas/users.js';

const app = new Hono();

/**
 * Create new user (Admin only + Email validation)
 * POST /api/users
 */
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

export default app;
