import { Hono } from 'hono';
import type { Bindings } from '@/types/bindings.js';
import type { HonoVariables } from '@/types/hono.js';

// Import individual route handlers
import postGenerateDummyTables from './post.generate-dummy-tables.js';
import getStats from './get.stats.js';

/**
 * Admin Routes
 * Administrative endpoints for system management
 */
const app = new Hono<{ Bindings: Bindings; Variables: HonoVariables }>();

// Mount routes
app.route('/', postGenerateDummyTables);
app.route('/', getStats);

export default app;
