import { Hono } from 'hono';
import type { Bindings } from '@/types/bindings.js';

// Import individual route handlers
import getRoot from './get.root.js';
import getHealth from './get.health.js';

/**
 * Health Check Routes
 * Provides service status, version information, and basic connectivity tests
 */
const app = new Hono<{ Bindings: Bindings }>();

// Mount routes
app.route('/', getRoot);
app.route('/', getHealth);

export default app;
