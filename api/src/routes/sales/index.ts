import { Hono } from 'hono';
import type { Bindings } from '@/types/bindings.js';
import type { UserContext } from '@/types/database.js';

// Import individual route handlers
import postSale from './post.js';
import getSales from './get.js';
import getSaleById from './get.id.js';
import updateSale from './put.id.js';
import deleteSale from './delete.id.js';
import getSalesByCustomer from './get.customer.id.js';
import getSalesByTable from './get.table.id.js';
import getAnalytics from './get.analytics.js';
import getSummary from './get.summary.js';

/**
 * Sales Management API Routes
 * Handles sales transactions for "for sale" tables
 * External API for recording sales + Admin panel for management
 */
const app = new Hono<{
  Bindings: Bindings;
  Variables: { user: UserContext };
}>();

// Mount routes - order matters for path matching
// Static paths first, then dynamic paths
app.route('/', getSalesByCustomer);  // /customer/:customerId before /:id
app.route('/', getSalesByTable);     // /table/:tableId before /:id
app.route('/', getAnalytics);        // /analytics before /:id
app.route('/', getSummary);          // /summary before /:id
app.route('/', getSales);            // GET /
app.route('/', postSale);            // POST /
app.route('/', getSaleById);         // GET /:id
app.route('/', updateSale);          // PUT /:id
app.route('/', deleteSale);          // DELETE /:id

export default app;
