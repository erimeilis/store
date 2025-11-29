import { Hono } from 'hono';
import type { Bindings } from '@/types/bindings.js';
import type { UserContext } from '@/types/database.js';
import { readAuthMiddleware, writeAuthMiddleware } from '@/middleware/auth.js';

// Import individual route handlers
import getTables from './get.tables.js';
import getTableItems from './get.tables.id.items.js';
import getTableItem from './get.tables.id.items.id.js';
import getItemAvailability from './get.tables.id.items.id.availability.js';
import postBuy from './post.buy.js';
import postRent from './post.rent.js';
import postRelease from './post.release.js';

/**
 * Public API routes composition
 * Unified public endpoints for browsing and purchasing/renting items
 * All routes require Bearer token authentication
 * Token's tableAccess array controls which tables are visible
 */
const app = new Hono<{
  Bindings: Bindings;
  Variables: { user?: UserContext };
}>();

// Apply read auth middleware to all browse routes
app.use('/tables', readAuthMiddleware);
app.use('/tables/*', readAuthMiddleware);

// Browse routes (read auth required)
app.route('/', getTables);
app.route('/', getItemAvailability);  // Must come before getTableItem due to path matching
app.route('/', getTableItem);         // Must come before getTableItems due to path matching
app.route('/', getTableItems);

// Transaction routes (write auth required)
app.route('/', postBuy);
app.route('/', postRent);
app.route('/', postRelease);

export default app;
