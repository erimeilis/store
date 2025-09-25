import { Hono } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { readAuthMiddleware } from '@/middleware/auth.js'
import type { Bindings } from '@/types/bindings.js'
import type { UserContext } from '@/types/database.js'
import type { CreateSaleRequest } from '@/types/sales.js'
import { PublicSalesService } from '@/services/publicSalesService/index.js'

/**
 * Public Sales API Routes
 * Public endpoints for browsing and purchasing items from "for sale" tables
 * No authentication required for browsing, minimal authentication for purchasing
 */
const publicSalesRoutes = new Hono<{
  Bindings: Bindings
  Variables: { user?: UserContext }
}>()

/**
 * Get list of "for sale" tables
 * GET /api/public/tables
 *
 * Returns public tables that are configured for sales (for_sale = true)
 */
publicSalesRoutes.get('/api/public/tables', async (c) => {
  const service = new PublicSalesService(c.env)

  try {
    const tables = await service.getForSaleTables(c)
    return c.json({
      tables,
      count: tables.length
    })

  } catch (error) {
    console.error('Error fetching for sale tables:', error)
    return c.json({ error: 'Failed to fetch available tables' }, 500)
  }
})

/**
 * Get items from a specific "for sale" table
 * GET /api/public/tables/:tableId/items
 *
 * Returns all available items from a public for-sale table
 * Includes price, quantity, and other item details
 */
publicSalesRoutes.get('/api/public/tables/:tableId/items', async (c) => {
  const service = new PublicSalesService(c.env)
  const tableId = c.req.param('tableId')

  try {
    const result = await service.getTableItems(c, tableId)

    if ('error' in result) {
      return c.json({ error: result.error }, (result.status || 404) as any)
    }

    return c.json(result)

  } catch (error) {
    console.error('Error fetching table items:', error)
    return c.json({ error: 'Failed to fetch table items' }, 500)
  }
})

/**
 * Get specific item details
 * GET /api/public/tables/:tableId/items/:itemId
 *
 * Returns detailed information about a specific item
 */
publicSalesRoutes.get('/api/public/tables/:tableId/items/:itemId', async (c) => {
  const service = new PublicSalesService(c.env)
  const tableId = c.req.param('tableId')
  const itemId = c.req.param('itemId')

  try {
    const result = await service.getItem(c, tableId, itemId)

    if ('error' in result) {
      return c.json({ error: result.error }, (result.status || 404) as any)
    }

    return c.json(result)

  } catch (error) {
    console.error('Error fetching item details:', error)
    return c.json({ error: 'Failed to fetch item details' }, 500)
  }
})

/**
 * Purchase an item
 * POST /api/public/buy
 *
 * Creates a sale transaction for an item
 * Requires read authentication (API token) to prevent abuse
 */
publicSalesRoutes.post('/api/public/buy', readAuthMiddleware, async (c) => {
  const service = new PublicSalesService(c.env)
  const user = c.get('user')

  try {
    const data = await c.req.json()

    // Validate required fields
    if (!data.tableId || !data.itemId || !data.customerId) {
      return c.json({
        error: 'Missing required fields: tableId, itemId, customerId'
      }, 400)
    }

    if (!data.quantitySold || data.quantitySold < 1) {
      return c.json({
        error: 'quantitySold must be a positive number'
      }, 400)
    }

    const purchaseRequest: CreateSaleRequest = {
      tableId: data.tableId,
      itemId: data.itemId,
      customerId: data.customerId,
      quantitySold: data.quantitySold,
      paymentMethod: data.paymentMethod,
      notes: data.notes
    }

    const result = await service.purchaseItem(c, user!, purchaseRequest)

    if ('error' in result) {
      return c.json({ error: result.error }, (result.status || 400) as any)
    }

    return c.json({
      message: 'Purchase completed successfully',
      sale: result.sale
    }, 201)

  } catch (error) {
    console.error('Error processing purchase:', error)
    return c.json({ error: 'Failed to process purchase' }, 500)
  }
})

/**
 * Check item availability
 * GET /api/public/tables/:tableId/items/:itemId/availability
 *
 * Check if an item is available for purchase and get current stock
 */
publicSalesRoutes.get('/api/public/tables/:tableId/items/:itemId/availability', async (c) => {
  const service = new PublicSalesService(c.env)
  const tableId = c.req.param('tableId')
  const itemId = c.req.param('itemId')
  const quantity = parseInt(c.req.query('quantity') || '1')

  try {
    const result = await service.checkAvailability(c, tableId, itemId, quantity)

    if ('error' in result) {
      return c.json({ error: result.error }, (result.status || 404) as any)
    }

    return c.json(result)

  } catch (error) {
    console.error('Error checking availability:', error)
    return c.json({ error: 'Failed to check availability' }, 500)
  }
})

export default publicSalesRoutes