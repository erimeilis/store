import { Hono } from 'hono'
import { adminReadAuthMiddleware } from '@/middleware/auth.js'
import { TableService } from '@/services/tableService/index.js'
import { TableDataService } from '@/services/tableDataService/index.js'
import { validateDataset, getValidationRules } from '@/services/validationService.js'
import type { Bindings } from '@/types/bindings.js'
import type { UserContext } from '@/types/database.js'

const app = new Hono<{
  Bindings: Bindings
  Variables: { user: UserContext }
}>()

/**
 * GET /tables/:id/validate
 * Validate all data in a table and return validation issues
 * Returns warnings for invalid data without blocking
 */
app.get('/:id/validate', adminReadAuthMiddleware, async (c) => {
  try {
    const tableId = c.req.param('id')
    const limit = parseInt(c.req.query('limit') || '500', 10)
    const page = parseInt(c.req.query('page') || '1', 10)

    const tableService = new TableService(c.env)
    const dataService = new TableDataService(c.env)
    const user = c.get('user')

    // Get table with columns
    const tableResult = await tableService.getTable(c, user, tableId)
    if (tableResult.status !== 200 || !tableResult.response?.table) {
      return c.json({
        error: 'Table not found',
        message: 'Table does not exist or you do not have access'
      }, 404)
    }

    const columns = tableResult.response.table.columns || []

    // Get table data
    const dataResult = await dataService.listTableData(c, user, tableId, {
      limit,
      page
    })

    if (dataResult.status !== 200 || !dataResult.response?.data) {
      return c.json({
        error: 'Failed to fetch table data',
        message: 'Could not retrieve table data for validation'
      }, 500)
    }

    // Transform data for validation service
    const rows = dataResult.response.data.map((row: { id: string; data: Record<string, unknown> }) => ({
      id: row.id,
      data: row.data
    }))

    // Transform columns for validation service
    const columnDefs = columns.map((col: { name: string; type: string; isRequired: boolean }) => ({
      name: col.name,
      type: col.type,
      isRequired: col.isRequired
    }))

    // Validate dataset
    const validationResult = validateDataset(rows, columnDefs)

    return c.json({
      data: {
        ...validationResult,
        pagination: dataResult.response.pagination || {
          page,
          limit,
          total: rows.length,
          totalPages: 1
        }
      },
      message: validationResult.invalidRows > 0
        ? `Found ${validationResult.totalWarnings} validation warnings in ${validationResult.invalidRows} rows`
        : 'All data is valid'
    })
  } catch (error) {
    console.error('Error in table validation:', error)
    return c.json({
      error: 'Failed to validate table data',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

/**
 * GET /tables/:id/validate/rules
 * Get validation rules for all column types
 * Useful for displaying validation help in the UI
 */
app.get('/:id/validate/rules', adminReadAuthMiddleware, async (c) => {
  try {
    const rules = getValidationRules()
    return c.json({
      data: rules,
      message: 'Validation rules retrieved successfully'
    })
  } catch (error) {
    console.error('Error getting validation rules:', error)
    return c.json({
      error: 'Failed to get validation rules',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

export default app
