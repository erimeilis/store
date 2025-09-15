import { Hono } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { readAuthMiddleware, writeAuthMiddleware } from '@/middleware/auth.js'
import { TableService } from '@/services/tableService.js'
import type { Bindings } from '../../types/bindings.js'
import type { UserContext } from '@/types/database.js'

/**
 * Table Management CRUD Routes
 * Handles operations for user-created dynamic tables: Create, Read, Update, Delete
 * All routes are protected with appropriate authentication middleware
 * Uses raw SQL queries since tables are not in Prisma schema
 */
const tablesRoutes = new Hono<{
  Bindings: Bindings
  Variables: { user: UserContext }
}>()

/**
 * List all tables accessible to user (own tables + public tables)
 * GET /api/tables
 */
tablesRoutes.get('/api/tables', readAuthMiddleware, async (c) => {
  const service = new TableService(c.env)
  const user = c.get('user')

  const query = {
    page: parseInt(c.req.query('page') || '1', 10),
    limit: parseInt(c.req.query('limit') || '10', 10),
    sort: c.req.query('sort') || 'updated_at',
    direction: c.req.query('direction') || 'desc',
    filter_name: c.req.query('filter_name') || '',
    filter_description: c.req.query('filter_description') || '',
    filter_owner: c.req.query('filter_owner') || '',
    filter_visibility: c.req.query('filter_visibility') || '',
    filter_created_at: c.req.query('filter_created_at') || '',
    filter_updated_at: c.req.query('filter_updated_at') || ''
  }

  const result = await service.listTables(c, user, query)

  return c.json(result.response, result.status as ContentfulStatusCode)
})

/**
 * Get specific table with its columns
 * GET /api/tables/:id
 */
tablesRoutes.get('/api/tables/:id', readAuthMiddleware, async (c) => {
  const service = new TableService(c.env)
  const user = c.get('user')
  const tableId = c.req.param('id')

  const result = await service.getTable(c, user, tableId)

  return c.json(result.response, result.status as ContentfulStatusCode)
})

/**
 * Create new table with columns
 * POST /api/tables
 */
tablesRoutes.post('/api/tables', writeAuthMiddleware, async (c) => {
  const service = new TableService(c.env)
  const user = c.get('user')
  const body = await c.req.json()

  const result = await service.createTable(c, user, body)

  return c.json(result.response, result.status as ContentfulStatusCode)
})

/**
 * Update table metadata (name, description, publicity)
 * PUT /api/tables/:id
 */
tablesRoutes.put('/api/tables/:id', writeAuthMiddleware, async (c) => {
  const service = new TableService(c.env)
  const user = c.get('user')
  const tableId = c.req.param('id')
  const body = await c.req.json()

  const result = await service.updateTable(c, user, tableId, body)

  return c.json(result.response, result.status as ContentfulStatusCode)
})

/**
 * Update table metadata (name, description, publicity) - PATCH method for inline editing
 * PATCH /api/tables/:id
 */
tablesRoutes.patch('/api/tables/:id', writeAuthMiddleware, async (c) => {
  try {
    const service = new TableService(c.env)
    const user = c.get('user')
    const tableId = c.req.param('id')

    console.log('🔍 PATCH Tables Route Debug:')
    console.log('  - tableId:', tableId)
    console.log('  - user:', user ? { id: user.id, permissions: user.permissions } : 'none')

    const body = await c.req.json()
    console.log('  - body:', JSON.stringify(body, null, 2))
    console.log('  - bodyType:', typeof body)

    const result = await service.updateTable(c, user, tableId, body)

    return c.json(result.response, result.status as ContentfulStatusCode)
  } catch (error) {
    console.log('❌ PATCH Tables Route Error:', error)
    console.log('❌ Error stack:', error instanceof Error ? error.stack : 'No stack')
    return c.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, 500)
  }
})

/**
 * Delete table and all its data
 * DELETE /api/tables/:id
 */
tablesRoutes.delete('/api/tables/:id', writeAuthMiddleware, async (c) => {
  const service = new TableService(c.env)
  const user = c.get('user')
  const tableId = c.req.param('id')

  const result = await service.deleteTable(c, user, tableId)

  return c.json(result.response, result.status as ContentfulStatusCode)
})

/**
 * Mass action for tables (make public/private, delete)
 * POST /api/tables/mass-action
 */
tablesRoutes.post('/api/tables/mass-action', writeAuthMiddleware, async (c) => {
  const service = new TableService(c.env)
  const user = c.get('user')
  const body = await c.req.json()

  const result = await service.executeMassAction(c, user, body.action, body.ids)

  return c.json(result.response, result.status as ContentfulStatusCode)
})

/**
 * Add new column to table
 * POST /api/tables/:id/columns
 */
tablesRoutes.post('/api/tables/:id/columns', writeAuthMiddleware, async (c) => {
  const service = new TableService(c.env)
  const user = c.get('user')
  const tableId = c.req.param('id')
  const body = await c.req.json()

  const result = await service.addColumn(c, user, tableId, body)

  return c.json(result.response, result.status as ContentfulStatusCode)
})

/**
 * Update column in table
 * PATCH /api/tables/:id/columns/:columnId
 */
tablesRoutes.patch('/api/tables/:id/columns/:columnId', writeAuthMiddleware, async (c) => {
  const service = new TableService(c.env)
  const user = c.get('user')
  const tableId = c.req.param('id')
  const columnId = c.req.param('columnId')
  const body = await c.req.json()

  const result = await service.updateColumn(c, user, tableId, columnId, body)

  return c.json(result.response, result.status as ContentfulStatusCode)
})

/**
 * Delete column from table
 * DELETE /api/tables/:id/columns/:columnId
 */
tablesRoutes.delete('/api/tables/:id/columns/:columnId', writeAuthMiddleware, async (c) => {
  const service = new TableService(c.env)
  const user = c.get('user')
  const tableId = c.req.param('id')
  const columnId = c.req.param('columnId')

  const result = await service.deleteColumn(c, user, tableId, columnId)

  return c.json(result.response, result.status as ContentfulStatusCode)
})

/**
 * Execute mass action on columns
 * POST /api/tables/:id/columns/mass-action
 */
tablesRoutes.post('/api/tables/:id/columns/mass-action', writeAuthMiddleware, async (c) => {
  const service = new TableService(c.env)
  const user = c.get('user')
  const tableId = c.req.param('id')
  const body = await c.req.json()

  // Expected body format: { action: 'make_required' | 'make_optional' | 'delete', columnIds: string[] }
  const result = await service.executeColumnMassAction(c, user, tableId, body)

  return c.json(result.response, result.status as ContentfulStatusCode)
})

export { tablesRoutes }
