import { Hono } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { readAuthMiddleware, writeAuthMiddleware } from '@/middleware/auth.js'
import { SalesService } from '@/services/salesService/index.js'
import type { Bindings } from '@/types/bindings.js'
import type { UserContext } from '@/types/database.js'
import type { CreateSaleRequest, UpdateSaleRequest, SaleListQuery } from '@/types/sales.js'

/**
 * Sales Management API Routes
 * Handles sales transactions for "for sale" tables
 * External API for recording sales + Admin panel for management
 */
const salesRoutes = new Hono<{
  Bindings: Bindings
  Variables: { user: UserContext }
}>()

/**
 * Create a new sale (External API endpoint)
 * POST /api/sales
 *
 * This is the main endpoint used by external systems to record sales
 * Requires full API token permissions
 */
salesRoutes.post('/api/sales', writeAuthMiddleware, async (c) => {
  const service = new SalesService(c.env)
  const user = c.get('user')

  try {
    const data: CreateSaleRequest = await c.req.json()

    // Validate required fields
    if (!data.table_id || !data.item_id || !data.customer_id) {
      return c.json({
        error: 'Missing required fields: table_id, item_id, customer_id'
      }, 400)
    }

    const result = await service.createSale(c, user, data)

    // Handle response based on result type
    if (result && typeof result === 'object' && 'error' in result) {
      return result // Service already returns proper Response
    }

    return c.json({
      message: 'Sale created successfully',
      sale: result
    }, 201)

  } catch (error) {
    console.error('Error in POST /api/sales:', error)
    return c.json({ error: 'Invalid request data' }, 400)
  }
})

/**
 * List sales with admin filtering and pagination
 * GET /api/sales
 *
 * Admin-only endpoint for sales management
 */
salesRoutes.get('/api/sales', readAuthMiddleware, async (c) => {
  const service = new SalesService(c.env)
  const user = c.get('user')

  const query: SaleListQuery = {
    page: parseInt(c.req.query('page') || '1', 10),
    limit: parseInt(c.req.query('limit') || '50', 10),
    table_id: c.req.query('table_id') || undefined,
    customer_id: c.req.query('customer_id') || undefined,
    sale_status: c.req.query('sale_status') as any || undefined,
    date_from: c.req.query('date_from') || undefined,
    date_to: c.req.query('date_to') || undefined,
    search: c.req.query('search') || undefined,
    sort_by: c.req.query('sort_by') as any || 'created_at',
    sort_order: c.req.query('sort_order') as any || 'desc'
  }

  const result = await service.getSales(c, user, query)

  // Handle response based on result type
  if (result && typeof result === 'object' && 'error' in result) {
    return result // Service already returns proper Response
  }

  return c.json(result)
})

/**
 * Get specific sale by ID
 * GET /api/sales/:id
 *
 * Admin-only endpoint
 */
salesRoutes.get('/api/sales/:id', readAuthMiddleware, async (c) => {
  const service = new SalesService(c.env)
  const user = c.get('user')
  const saleId = c.req.param('id')

  const result = await service.getSale(c, user, saleId)

  // Handle response based on result type
  if (result && typeof result === 'object' && 'error' in result) {
    return result // Service already returns proper Response
  }

  return result
})

/**
 * Update sale (Admin only)
 * PUT /api/sales/:id
 *
 * Limited to status, payment method, and notes for audit compliance
 */
salesRoutes.put('/api/sales/:id', writeAuthMiddleware, async (c) => {
  const service = new SalesService(c.env)
  const user = c.get('user')
  const saleId = c.req.param('id')

  try {
    const data: UpdateSaleRequest = await c.req.json()

    const result = await service.updateSale(c, user, saleId, data)

    // Handle response based on result type
    if (result && typeof result === 'object' && 'error' in result) {
      return result // Service already returns proper Response
    }

    return c.json({
      message: 'Sale updated successfully',
      sale: result
    })

  } catch (error) {
    console.error('Error in PUT /api/sales/:id:', error)
    return c.json({ error: 'Invalid request data' }, 400)
  }
})

/**
 * Delete sale (Admin only)
 * DELETE /api/sales/:id
 *
 * Use with caution for audit compliance
 */
salesRoutes.delete('/api/sales/:id', writeAuthMiddleware, async (c) => {
  const service = new SalesService(c.env)
  const user = c.get('user')
  const saleId = c.req.param('id')

  const result = await service.deleteSale(c, user, saleId)

  // Handle response based on result type
  if (result && typeof result === 'object' && 'error' in result) {
    return result // Service already returns proper Response
  }

  return result
})

/**
 * Get sales for specific customer
 * GET /api/sales/customer/:customerId
 */
salesRoutes.get('/api/sales/customer/:customerId', readAuthMiddleware, async (c) => {
  const service = new SalesService(c.env)
  const user = c.get('user')
  const customerId = c.req.param('customerId')
  const limit = parseInt(c.req.query('limit') || '50', 10)

  const result = await service.getSalesByCustomer(c, user, customerId, limit)

  // Handle response based on result type
  if (result && typeof result === 'object' && 'error' in result) {
    return result // Service already returns proper Response
  }

  return result
})

/**
 * Get sales for specific table
 * GET /api/sales/table/:tableId
 */
salesRoutes.get('/api/sales/table/:tableId', readAuthMiddleware, async (c) => {
  const service = new SalesService(c.env)
  const user = c.get('user')
  const tableId = c.req.param('tableId')
  const limit = parseInt(c.req.query('limit') || '50', 10)

  const result = await service.getSalesByTable(c, user, tableId, limit)

  // Handle response based on result type
  if (result && typeof result === 'object' && 'error' in result) {
    return result // Service already returns proper Response
  }

  return result
})

/**
 * Get sales analytics
 * GET /api/sales/analytics
 *
 * Admin-only endpoint for sales reporting
 */
salesRoutes.get('/api/sales/analytics', readAuthMiddleware, async (c) => {
  const service = new SalesService(c.env)
  const user = c.get('user')

  const dateFrom = c.req.query('date_from') || undefined
  const dateTo = c.req.query('date_to') || undefined
  const tableId = c.req.query('table_id') || undefined

  const result = await service.getSalesAnalytics(c, user, dateFrom, dateTo, tableId)

  // Handle response based on result type
  if (result && typeof result === 'object' && 'error' in result) {
    return result // Service already returns proper Response
  }

  return c.json(result)
})

/**
 * Get sales summary for dashboard
 * GET /api/sales/summary
 *
 * Admin-only endpoint for dashboard overview
 */
salesRoutes.get('/api/sales/summary', readAuthMiddleware, async (c) => {
  const service = new SalesService(c.env)
  const user = c.get('user')

  const result = await service.getSalesSummary(c, user)

  // Handle response based on result type
  if (result && typeof result === 'object' && 'error' in result) {
    return result // Service already returns proper Response
  }

  return result
})

export default salesRoutes