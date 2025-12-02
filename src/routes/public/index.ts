import { Hono } from 'hono';
import type { Bindings } from '@/types/bindings.js';
import type { UserContext } from '@/types/database.js';
import { readAuthMiddleware, writeAuthMiddleware } from '@/middleware/auth.js';

// Import individual route handlers
import getTables from './get.tables.js';
import getTablesSearch from './get.tables.search.js';
import getTableItems from './get.tables.id.items.js';
import getTableItem from './get.tables.id.items.id.js';
import getItemAvailability from './get.tables.id.items.id.availability.js';
import getValues from './get.values.js';
import getRecords from './get.records.js';
import postBuy from './post.buy.js';
import postRent from './post.rent.js';
import postRelease from './post.release.js';

/**
 * Public API routes composition
 * Unified public endpoints for browsing and purchasing/renting items
 * All routes require Bearer token authentication
 * Token's tableAccess array controls which tables are visible
 *
 * New endpoints:
 * - GET /api/public/tables/search?columns=number,country  - Find tables by column presence
 * - GET /api/public/values/:columnName                    - Get distinct column values
 * - GET /api/public/values/:columnName?where[col]=val     - Get values with conditions
 * - GET /api/public/records?where[col]=val                - Get records with filtering
 */
const app = new Hono<{
  Bindings: Bindings;
  Variables: { user?: UserContext };
}>();

// Apply read auth middleware to all browse routes
app.use('/tables', readAuthMiddleware);
app.use('/tables/*', readAuthMiddleware);
app.use('/values/*', readAuthMiddleware);
app.use('/records', readAuthMiddleware);

// Browse routes (read auth required)
app.route('/', getTables);
app.route('/', getTablesSearch);      // Search tables by columns - must be before getTableItems
app.route('/', getItemAvailability);  // Must come before getTableItem due to path matching
app.route('/', getTableItem);         // Must come before getTableItems due to path matching
app.route('/', getTableItems);
app.route('/', getValues);            // Get distinct column values with optional filtering
app.route('/', getRecords);           // Get records with filtering and flattened data

// Transaction routes (write auth required)
app.route('/', postBuy);
app.route('/', postRent);
app.route('/', postRelease);

export default app;
