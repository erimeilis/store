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
    limit: parseInt(c.req.query('limit') || '20', 10),
    sortBy: (c.req.query('sortBy') as any) || 'createdAt',
    sortOrder: (c.req.query('sortOrder') as any) || 'desc'
  }

  // Add optional parameters only if they exist
  const tableId = c.req.query('tableId')
  if (tableId) query.tableId = tableId

  const itemId = c.req.query('itemId')
  if (itemId) query.itemId = itemId

  const transactionType = c.req.query('transactionType')
  if (transactionType) query.transactionType = transactionType as any

  const createdBy = c.req.query('createdBy')
  if (createdBy) query.createdBy = createdBy

  const referenceId = c.req.query('referenceId')
  if (referenceId) query.referenceId = referenceId

  const dateFrom = c.req.query('dateFrom')
  if (dateFrom) query.dateFrom = dateFrom

  const dateTo = c.req.query('dateTo')
  if (dateTo) query.dateTo = dateTo

  const tableNameSearch = c.req.query('tableNameSearch')
  if (tableNameSearch) query.tableNameSearch = tableNameSearch

  const itemSearch = c.req.query('itemSearch')
  if (itemSearch) query.itemSearch = itemSearch

  const quantityChange = c.req.query('quantityChange')
  if (quantityChange) query.quantityChange = quantityChange

  const result = await service.getInventoryTransactions(c, user, query)

  // Handle response based on result type - check if it's a Response object
  if (result instanceof Response) {
    return result
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

  const dateFrom = c.req.query('dateFrom') || undefined
  const dateTo = c.req.query('dateTo') || undefined
  const tableId = c.req.query('tableId') || undefined

  const result = await service.getInventoryAnalytics(c, user, dateFrom, dateTo, tableId)

  // Handle response based on result type - check if it's a Response object
  if (result instanceof Response) {
    return result
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

  // Handle response based on result type - check if it's a Response object
  if (result instanceof Response) {
    return result
  }

  return c.json(result)
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

  // Handle response based on result type - check if it's a Response object
  if (result instanceof Response) {
    return result
  }

  return c.json(result)
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
      lowStockThreshold: data.lowStockThreshold ||
                          parseInt(c.req.query('lowStockThreshold') || '5', 10)
    }

    // Only add tableId if it exists
    const tableIdParam = data.tableId || c.req.query('tableId')
    if (tableIdParam) {
      request.tableId = tableIdParam
    }

    const result = await service.checkStockLevels(c, user, request)

    // Handle response based on result type - check if it's a Response object
    if (result instanceof Response) {
      return result
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
    lowStockThreshold: parseInt(c.req.query('lowStockThreshold') || '5', 10)
  }

  // Only add tableId if it exists
  const tableIdParam = c.req.query('tableId')
  if (tableIdParam) {
    request.tableId = tableIdParam
  }

  const result = await service.checkStockLevels(c, user, request)

  // Handle response based on result type - check if it's a Response object
  if (result instanceof Response) {
    return result
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

  // Handle response based on result type - check if it's a Response object
  if (result instanceof Response) {
    return result
  }

  return c.json(result)
})

/**
 * Clear all inventory transactions
 * DELETE /api/inventory/clear-all
 *
 * Admin-only endpoint for clearing transaction history
 */
inventoryRoutes.delete('/api/inventory/clear-all', writeAuthMiddleware, async (c) => {
  const service = new InventoryService(c.env)
  const user = c.get('user')

  // Extract filter parameters to limit clearing to specific transactions
  const query: InventoryTransactionListQuery = {
    page: 1,
    limit: 999999, // Large number to get all matching transactions
    sortBy: 'createdAt',
    sortOrder: 'desc'
  }

  // Add optional parameters only if they exist (same as GET endpoint)
  const tableId = c.req.query('tableId')
  if (tableId) query.tableId = tableId

  const itemId = c.req.query('itemId')
  if (itemId) query.itemId = itemId

  const transactionType = c.req.query('transactionType')
  if (transactionType) query.transactionType = transactionType as any

  const createdBy = c.req.query('createdBy')
  if (createdBy) query.createdBy = createdBy

  const referenceId = c.req.query('referenceId')
  if (referenceId) query.referenceId = referenceId

  const dateFrom = c.req.query('dateFrom')
  if (dateFrom) query.dateFrom = dateFrom

  const dateTo = c.req.query('dateTo')
  if (dateTo) query.dateTo = dateTo

  const tableNameSearch = c.req.query('tableNameSearch')
  if (tableNameSearch) query.tableNameSearch = tableNameSearch

  const itemSearch = c.req.query('itemSearch')
  if (itemSearch) query.itemSearch = itemSearch

  const quantityChange = c.req.query('quantityChange')
  if (quantityChange) query.quantityChange = quantityChange

  const result = await service.clearAllTransactions(c, user, query)

  // Handle response based on result type - check if it's a Response object
  if (result instanceof Response) {
    return result
  }

  return c.json(result)
})

export default inventoryRoutes