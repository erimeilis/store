import { Hono } from 'hono';
import type { Bindings } from '@/types/bindings.js';
import type { UserContext } from '@/types/database.js';

// Import individual route handlers
import getRentals from './get.js';
import getRentalById from './get.id.js';
import updateRental from './put.id.js';
import deleteRental from './delete.id.js';
import getRentalsByCustomer from './get.customer.id.js';
import getRentalsByTable from './get.table.id.js';
import getAnalytics from './get.analytics.js';

/**
 * Rentals Management API Routes
 * Admin endpoints for managing rental transactions
 * Public rent/release endpoints are in public/ folder
 */
const app = new Hono<{
  Bindings: Bindings;
  Variables: { user: UserContext };
}>();

// Mount routes - order matters for path matching
// Static paths first, then dynamic paths
app.route('/', getRentalsByCustomer);  // /customer/:customerId before /:id
app.route('/', getRentalsByTable);     // /table/:tableId before /:id
app.route('/', getAnalytics);          // /analytics before /:id
app.route('/', getRentals);            // GET /
app.route('/', getRentalById);         // GET /:id
app.route('/', updateRental);          // PUT /:id
app.route('/', deleteRental);          // DELETE /:id

export default app;
