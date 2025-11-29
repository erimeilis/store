import { Hono } from 'hono';
import type { Bindings } from '@/types/bindings.js';

const app = new Hono<{ Bindings: Bindings }>();

/**
 * Root endpoint - redirects to health check
 * GET /
 */
app.get('/', (c) => {
  return c.json({
    status: 'healthy',
    message: 'Store API is running',
    timestamp: new Date().toISOString(),
    version: c.env.APP_VERSION || '0.0.0',
    environment: c.env.NODE_ENV || 'unknown',
    service: 'backend-api'
  });
});

export default app;
