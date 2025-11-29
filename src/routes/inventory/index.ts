import { Hono } from 'hono';
import type { Bindings } from '@/types/bindings.js';
import type { UserContext } from '@/types/database.js';

// Import individual route handlers
import getTransactions from './get.transactions.js';
import getAnalytics from './get.analytics.js';
import getItemInventory from './get.items.tableId.itemId.js';
import getTableInventory from './get.tables.tableId.js';
import postStockCheck from './post.stock-check.js';
import getStockCheck from './get.stock-check.js';
import getSaleTransactions from './get.sales.saleId.transactions.js';
import deleteClearAll from './delete.clear-all.js';

/**
 * Inventory Management API Routes
 * Handles inventory tracking and analytics for "for sale" tables
 * Admin-only endpoints for inventory management and reporting
 */
const app = new Hono<{
  Bindings: Bindings;
  Variables: { user: UserContext };
}>();

// Mount routes - order matters for path matching
// Static paths first, then dynamic paths
app.route('/', getTransactions);      // /transactions
app.route('/', getAnalytics);         // /analytics
app.route('/', postStockCheck);       // POST /stock-check
app.route('/', getStockCheck);        // GET /stock-check
app.route('/', deleteClearAll);       // /clear-all
app.route('/', getSaleTransactions);  // /sales/:saleId/transactions (before /:id patterns)
app.route('/', getTableInventory);    // /tables/:tableId
app.route('/', getItemInventory);     // /items/:tableId/:itemId

export default app;
