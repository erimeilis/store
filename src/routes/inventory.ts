import { Hono } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { readAuthMiddleware, writeAuthMiddleware } from '@/middleware/auth.js'
import { InventoryService } from '@/services/inventoryService/index.js'
import type { Bindings } from '@/types/bindings.js'
import type { UserContext } from '@/types/database.js'
import type { InventoryTransactionListQuery, StockLevelCheckRequest } from '@/types/inventory.js'

/**
 * Inventory Management API Routes
 * Handles inventory tracking and analytics for "for sale" tables
 * Admin-only endpoints for inventory management and reporting
 */
const inventoryRoutes = new Hono<{
  Bindings: Bindings
  Variables: { user: UserContext }
}>()

/**
 * List inventory transactions with filtering and pagination
 * GET /api/inventory/transactions
 *
 * Admin-only endpoint for inventory audit trail
 */
inventoryRoutes.get('/api/inventory/transactions', readAuthMiddleware, async (c) => {
  const service = new InventoryService(c.env)
  const user = c.get('user')

  const query: InventoryTransactionListQuery = {
    page: parseInt(c.req.query('page') || '1', 10),
    limit: parseInt(c.req.query('limit') || '50', 10),
    ...(c.req.query('table_id') && { table_id: c.req.query('table_id') }),
    ...(c.req.query('item_id') && { item_id: c.req.query('item_id') }),
    ...(c.req.query('transaction_type') && { transaction_type: c.req.query('transaction_type') as any }),
    ...(c.req.query('created_by') && { created_by: c.req.query('created_by') }),
    ...(c.req.query('reference_id') && { reference_id: c.req.query('reference_id') }),
    ...(c.req.query('date_from') && { date_from: c.req.query('date_from') }),
    ...(c.req.query('date_to') && { date_to: c.req.query('date_to') }),
    sort_by: (c.req.query('sort_by') as any) || 'created_at',
    sort_order: (c.req.query('sort_order') as any) || 'desc'
  }

  const result = await service.getInventoryTransactions(c, user, query)

  // Handle response based on result type
  if (result && typeof result === 'object' && 'error' in result) {
    return result // Service already returns proper Response
  }

  return c.json(result)
})

/**
 * Get inventory analytics
 * GET /api/inventory/analytics
 *
 * Admin-only endpoint for inventory reporting
 */
inventoryRoutes.get('/api/inventory/analytics', readAuthMiddleware, async (c) => {
  const service = new InventoryService(c.env)
  const user = c.get('user')

  const dateFrom = c.req.query('date_from') || undefined
  const dateTo = c.req.query('date_to') || undefined
  const tableId = c.req.query('table_id') || undefined

  const result = await service.getInventoryAnalytics(c, user, dateFrom, dateTo, tableId)

  // Handle response based on result type
  if (result && typeof result === 'object' && 'error' in result) {
    return result // Service already returns proper Response
  }

  return c.json(result)
})

/**
 * Get inventory summary for a specific item
 * GET /api/inventory/items/:tableId/:itemId
 *
 * Admin-only endpoint for item-level inventory tracking
 */
inventoryRoutes.get('/api/inventory/items/:tableId/:itemId', readAuthMiddleware, async (c) => {
  const service = new InventoryService(c.env)
  const user = c.get('user')
  const tableId = c.req.param('tableId')
  const itemId = c.req.param('itemId')

  const result = await service.getItemInventorySummary(c, user, tableId, itemId)

  // Handle response based on result type
  if (result && typeof result === 'object' && 'error' in result) {
    return result // Service already returns proper Response
  }

  return result
})

/**
 * Get inventory summary for a specific table
 * GET /api/inventory/tables/:tableId
 *
 * Admin-only endpoint for table-level inventory overview
 */
inventoryRoutes.get('/api/inventory/tables/:tableId', readAuthMiddleware, async (c) => {
  const service = new InventoryService(c.env)
  const user = c.get('user')
  const tableId = c.req.param('tableId')

  const result = await service.getTableInventorySummary(c, user, tableId)

  // Handle response based on result type
  if (result && typeof result === 'object' && 'error' in result) {
    return result // Service already returns proper Response
  }

  return result
})

/**
 * Check stock levels and get alerts
 * POST /api/inventory/stock-check
 *
 * Admin-only endpoint for low stock alerts
 */
inventoryRoutes.post('/api/inventory/stock-check', readAuthMiddleware, async (c) => {
  const service = new InventoryService(c.env)
  const user = c.get('user')

  try {
    const data: StockLevelCheckRequest = await c.req.json().catch(() => ({}))

    // Provide defaults if no body is sent
    const request: StockLevelCheckRequest = {
      table_id: data.table_id || c.req.query('table_id') || undefined,
      low_stock_threshold: data.low_stock_threshold ||
                          parseInt(c.req.query('low_stock_threshold') || '5', 10)
    }

    const result = await service.checkStockLevels(c, user, request)

    // Handle response based on result type
    if (result && typeof result === 'object' && 'error' in result) {
      return result // Service already returns proper Response
    }

    return c.json(result)

  } catch (error) {
    console.error('Error in POST /api/inventory/stock-check:', error)
    return c.json({ error: 'Invalid request data' }, 400)
  }
})

/**
 * Get quick stock check via GET (alternative to POST)
 * GET /api/inventory/stock-check
 */
inventoryRoutes.get('/api/inventory/stock-check', readAuthMiddleware, async (c) => {
  const service = new InventoryService(c.env)
  const user = c.get('user')

  const request: StockLevelCheckRequest = {
    table_id: c.req.query('table_id') || undefined,
    low_stock_threshold: parseInt(c.req.query('low_stock_threshold') || '5', 10)
  }

  const result = await service.checkStockLevels(c, user, request)

  // Handle response based on result type
  if (result && typeof result === 'object' && 'error' in result) {
    return result // Service already returns proper Response
  }

  return c.json(result)
})

/**
 * Get inventory transactions for a specific sale
 * GET /api/inventory/sales/:saleId/transactions
 *
 * Admin-only endpoint for sale audit trail
 */
inventoryRoutes.get('/api/inventory/sales/:saleId/transactions', readAuthMiddleware, async (c) => {
  const service = new InventoryService(c.env)
  const user = c.get('user')
  const saleId = c.req.param('saleId')

  const result = await service.getTransactionsBySale(c, user, saleId)

  // Handle response based on result type
  if (result && typeof result === 'object' && 'error' in result) {
    return result // Service already returns proper Response
  }

  return result
})

export default inventoryRoutes