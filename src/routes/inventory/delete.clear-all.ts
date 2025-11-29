import { Hono } from 'hono';
import { adminWriteAuthMiddleware } from '@/middleware/auth.js';
import { InventoryService } from '@/services/inventoryService/index.js';
import type { Bindings } from '@/types/bindings.js';
import type { UserContext } from '@/types/database.js';
import type { InventoryTransactionListQuery } from '@/types/inventory.js';

const app = new Hono<{
  Bindings: Bindings;
  Variables: { user: UserContext };
}>();

/**
 * Clear all inventory transactions
 * DELETE /api/inventory/clear-all
 *
 * Admin-only endpoint for clearing transaction history
 */
app.delete('/clear-all', adminWriteAuthMiddleware, async (c) => {
  const service = new InventoryService(c.env);
  const user = c.get('user');

  // Extract filter parameters to limit clearing to specific transactions
  const query: InventoryTransactionListQuery = {
    page: 1,
    limit: 999999, // Large number to get all matching transactions
    sortBy: 'createdAt',
    sortOrder: 'desc'
  };

  // Add optional parameters only if they exist (same as GET endpoint)
  const tableId = c.req.query('tableId');
  if (tableId) query.tableId = tableId;

  const itemId = c.req.query('itemId');
  if (itemId) query.itemId = itemId;

  const transactionType = c.req.query('transactionType');
  if (transactionType) query.transactionType = transactionType as any;

  const createdBy = c.req.query('createdBy');
  if (createdBy) query.createdBy = createdBy;

  const referenceId = c.req.query('referenceId');
  if (referenceId) query.referenceId = referenceId;

  const dateFrom = c.req.query('dateFrom');
  if (dateFrom) query.dateFrom = dateFrom;

  const dateTo = c.req.query('dateTo');
  if (dateTo) query.dateTo = dateTo;

  const tableNameSearch = c.req.query('tableNameSearch');
  if (tableNameSearch) query.tableNameSearch = tableNameSearch;

  const itemSearch = c.req.query('itemSearch');
  if (itemSearch) query.itemSearch = itemSearch;

  const quantityChange = c.req.query('quantityChange');
  if (quantityChange) query.quantityChange = quantityChange;

  const result = await service.clearAllTransactions(c, user, query);

  if (result instanceof Response) {
    return result;
  }

  return c.json(result);
});

export default app;
