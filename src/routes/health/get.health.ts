import { Hono } from 'hono';
import { getPrismaClient, checkDatabaseHealth } from '@/lib/database.js';
import type { Bindings } from '@/types/bindings.js';

const app = new Hono<{ Bindings: Bindings }>();

/**
 * Health check endpoint with database connectivity test
 * GET /health
 */
app.get('/health', async (c) => {
  const timestamp = new Date().toISOString();

  try {
    const prisma = getPrismaClient(c.env);
    const dbHealthy = await checkDatabaseHealth(prisma);

    if (dbHealthy) {
      return c.json({
        status: 'healthy',
        message: 'Store API is running',
        timestamp,
        version: c.env.APP_VERSION || '0.0.0',
        environment: c.env.NODE_ENV || 'unknown',
        service: 'backend-api',
        database: {
          status: 'connected',
          type: 'Prisma + D1/SQLite'
        }
      });
    } else {
      return c.json({
        status: 'unhealthy',
        message: 'Database connection failed',
        timestamp,
        version: c.env.APP_VERSION || '0.0.0',
        environment: c.env.NODE_ENV || 'unknown',
        service: 'backend-api',
        database: {
          status: 'disconnected',
          type: 'Prisma + D1/SQLite'
        }
      }, 503);
    }
  } catch (error) {
    return c.json({
      status: 'unhealthy',
      message: 'Health check failed',
      timestamp,
      version: c.env.APP_VERSION || '0.0.0',
      environment: c.env.NODE_ENV || 'unknown',
      service: 'backend-api',
      database: {
        status: 'error',
        type: 'Prisma + D1/SQLite',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }, 503);
  }
});

export default app;
