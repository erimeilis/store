import { Hono } from 'hono'
import { adminReadAuthMiddleware } from '@/middleware/auth.js'
import { TableService } from '@/services/tableService/index.js'
import { TableDataService } from '@/services/tableDataService/index.js'
import { previewTypeChange } from '@/services/validationService.js'
import type { Bindings } from '@/types/bindings.js'
import type { UserContext } from '@/types/database.js'

const app = new Hono<{
  Bindings: Bindings
  Variables: { user: UserContext }
}>()

/**
 * POST /tables/:id/columns/:columnId/preview-type
 * Preview impact of changing a column's data type
 * Returns validation results showing which values would become invalid
 */
app.post('/:id/columns/:columnId/preview-type', adminReadAuthMiddleware, async (c) => {
  try {
    const tableId = c.req.param('id')
    const columnId = c.req.param('columnId')

    // Parse request
    const body = await c.req.json() as { newType: string }
    const { newType } = body

    if (!newType) {
      return c.json({
        error: 'Invalid request',
        message: 'newType is required'
      }, 400)
    }

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
    const column = columns.find((col: { id: string }) => col.id === columnId)

    if (!column) {
      return c.json({
        error: 'Column not found',
        message: 'Column does not exist in this table'
      }, 404)
    }

    // Get table data for validation
    const dataResult = await dataService.listTableData(c, user, tableId, {
      limit: 1000, // Check first 1000 rows
      page: 1
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

    // Preview the type change
    const preview = previewTypeChange(
      rows,
      column.name,
      column.type,
      newType
    )

    return c.json({
      data: preview,
      message: preview.incompatibleRows > 0
        ? `${preview.incompatibleRows} rows have data incompatible with the new type`
        : 'All existing data is compatible with the new type'
    })
  } catch (error) {
    console.error('Error in column type preview:', error)
    return c.json({
      error: 'Failed to preview column type change',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

export default app
