/**
 * Admin Routes
 * Administrative endpoints for system management
 */

import { Hono } from 'hono'
import type { Bindings } from '@/types/bindings'
import type { HonoVariables } from '@/types/hono'
import { adminOnlyMiddleware } from '@/middleware/admin'
import { generateDummyTables } from '@/services/dummyTableGenerator'

const admin = new Hono<{ Bindings: Bindings; Variables: HonoVariables }>()

/**
 * POST /api/admin/generate-dummy-tables
 * Generate test tables with faker data (admin only)
 */
admin.post('/generate-dummy-tables', adminOnlyMiddleware, async (c) => {
  try {
    // Get parameters from request body
    const body = await c.req.json().catch(() => ({}))
    const tableCount = body.tableCount || 100
    const rowsPerTable = body.rowsPerTable || 200
    const userId = body.userId
    const forSaleOnly = body.forSaleOnly || false

    console.log('🎲 Admin dummy table generation request:', { tableCount, rowsPerTable, userId, forSaleOnly })

    // Validate parameters
    if (!userId) {
      return c.json({
        error: 'userId is required',
        details: 'Must provide userId to assign table ownership'
      }, 400)
    }

    if (tableCount < 1 || tableCount > 500) {
      return c.json({
        error: 'Invalid tableCount',
        details: 'tableCount must be between 1 and 500'
      }, 400)
    }

    if (rowsPerTable < 1 || rowsPerTable > 1000) {
      return c.json({
        error: 'Invalid rowsPerTable',
        details: 'rowsPerTable must be between 1 and 1000'
      }, 400)
    }

    // Generate tables
    const result = await generateDummyTables(c.env, userId, tableCount, rowsPerTable, forSaleOnly)

    if (!result.success) {
      return c.json({
        error: 'Table generation failed',
        details: result.error
      }, 500)
    }

    return c.json({
      message: 'Dummy tables generated successfully',
      tablesCreated: result.tablesCreated,
      rowsCreated: result.rowsCreated,
      averageRowsPerTable: Math.round(result.rowsCreated / result.tablesCreated)
    }, 200)

  } catch (error) {
    console.error('❌ Admin dummy table generation error:', error)
    return c.json({
      error: 'Failed to generate dummy tables',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

/**
 * GET /api/admin/stats
 * Get system statistics (admin only)
 */
admin.get('/stats', adminOnlyMiddleware, async (c) => {
  try {
    const { getPrismaClient } = await import('@/lib/database')
    const database = getPrismaClient(c.env)

    // Get counts
    const [userCount, tableCount, tokenCount] = await Promise.all([
      database.user.count(),
      database.table.count(),
      database.token.count()
    ])

    // Get table data row count (aggregate from table_data)
    const dataRowCountResult = await database.$queryRaw<[{ count: number }]>`
      SELECT COUNT(*) as count FROM table_data
    `
    const dataRowCount = dataRowCountResult[0]?.count || 0

    return c.json({
      users: userCount,
      tables: tableCount,
      tokens: tokenCount,
      dataRows: dataRowCount
    }, 200)

  } catch (error) {
    console.error('❌ Admin stats error:', error)
    return c.json({
      error: 'Failed to fetch system statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

export default admin
