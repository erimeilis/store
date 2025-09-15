import { Hono } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { readAuthMiddleware, writeAuthMiddleware } from '@/middleware/auth.js'
import { TableDataService } from '@/services/tableDataService.js'
import type { Bindings } from '../../types/bindings.js'
import type { UserContext } from '@/types/database.js'

/**
 * Table Data CRUD Routes
 * Handles operations for data within user-created dynamic tables
 * All routes are protected with appropriate authentication middleware
 * Includes data validation based on column definitions
 */
const tableDataRoutes = new Hono<{
  Bindings: Bindings
  Variables: { user: UserContext }
}>()



/**
 * List all data rows for a table with pagination
 * GET /api/tables/:tableId/data
 */
tableDataRoutes.get('/api/tables/:tableId/data', readAuthMiddleware, async (c) => {
  const service = new TableDataService(c.env)
  const user = c.get('user')
  const tableId = c.req.param('tableId')

  const query = {
    page: parseInt(c.req.query('page') || '1', 10),
    limit: parseInt(c.req.query('limit') || '10', 10)
  }

  const result = await service.listTableData(c, user, tableId, query)

  return c.json(result.response, result.status as ContentfulStatusCode)
})

/**
 * Get specific data row by ID
 * GET /api/tables/:tableId/data/:rowId
 */
tableDataRoutes.get('/api/tables/:tableId/data/:rowId', readAuthMiddleware, async (c) => {
  const service = new TableDataService(c.env)
  const user = c.get('user')
  const tableId = c.req.param('tableId')
  const rowId = c.req.param('rowId')

  const result = await service.getDataRow(c, user, tableId, rowId)

  return c.json(result.response, result.status as ContentfulStatusCode)
})

/**
 * Add new data row to table
 * POST /api/tables/:tableId/data
 */
tableDataRoutes.post('/api/tables/:tableId/data', writeAuthMiddleware, async (c) => {
  const service = new TableDataService(c.env)
  const user = c.get('user')
  const tableId = c.req.param('tableId')
  const body = await c.req.json()

  const result = await service.createDataRow(c, user, tableId, body)

  return c.json(result.response, result.status as ContentfulStatusCode)
})

/**
 * Update existing data row
 * PUT /api/tables/:tableId/data/:rowId
 */
tableDataRoutes.put('/api/tables/:tableId/data/:rowId', writeAuthMiddleware, async (c) => {
  const service = new TableDataService(c.env)
  const user = c.get('user')
  const tableId = c.req.param('tableId')
  const rowId = c.req.param('rowId')
  const body = await c.req.json()

  const result = await service.updateDataRow(c, user, tableId, rowId, body)

  return c.json(result.response, result.status as ContentfulStatusCode)
})

/**
 * Delete data row
 * DELETE /api/tables/:tableId/data/:rowId
 */
tableDataRoutes.delete('/api/tables/:tableId/data/:rowId', writeAuthMiddleware, async (c) => {
  const service = new TableDataService(c.env)
  const user = c.get('user')
  const tableId = c.req.param('tableId')
  const rowId = c.req.param('rowId')

  const result = await service.deleteDataRow(c, user, tableId, rowId)

  return c.json(result.response, result.status as ContentfulStatusCode)
})

/**
 * Mass action for table data (delete, export)
 * POST /api/tables/:tableId/data/mass-action
 */
tableDataRoutes.post('/api/tables/:tableId/data/mass-action', writeAuthMiddleware, async (c) => {
  const service = new TableDataService(c.env)
  const user = c.get('user')
  const tableId = c.req.param('tableId')
  const body = await c.req.json()

  const result = await service.executeMassAction(c, user, tableId, body.action, body.ids)

  return c.json(result.response, result.status as ContentfulStatusCode)
})

export { tableDataRoutes }
