import { Hono } from 'hono'
import { adminDeleteAuthMiddleware } from '@/middleware/auth.js'
import { TableService } from '@/services/tableService/index.js'
import { TableDataService } from '@/services/tableDataService/index.js'
import { validateDataset } from '@/services/validationService.js'
import { getPrismaClient } from '@/lib/database.js'
import type { Bindings } from '@/types/bindings.js'
import type { UserContext } from '@/types/database.js'

const app = new Hono<{
  Bindings: Bindings
  Variables: { user: UserContext }
}>()

/**
 * DELETE /tables/:id/invalid-rows
 * Delete all rows that have validation errors
 * Part of "Warn-Don't-Block" pattern - allows cleanup of bad data
 */
app.delete('/:id/invalid-rows', adminDeleteAuthMiddleware, async (c) => {
  try {
    const tableId = c.req.param('id')

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

    // Get ALL table data (we need to validate all rows to find invalid ones)
    // Use a high limit to get all rows
    const dataResult = await dataService.listTableData(c, user, tableId, {
      limit: 10000,
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

    // Transform columns for validation service
    const columnDefs = columns.map((col: { name: string; type: string; isRequired: boolean }) => ({
      name: col.name,
      type: col.type,
      isRequired: col.isRequired
    }))

    // Validate dataset
    const validationResult = validateDataset(rows, columnDefs)

    // Get IDs of invalid rows
    const invalidRowIds = validationResult.rows
      .filter(row => !row.isValid)
      .map(row => String(row.rowId))

    if (invalidRowIds.length === 0) {
      return c.json({
        data: {
          deletedCount: 0,
          message: 'No invalid rows found'
        },
        message: 'No invalid rows to delete'
      })
    }

    // Delete invalid rows using Prisma transaction
    const prisma = getPrismaClient(c.env)

    const deleteResult = await prisma.tableData.deleteMany({
      where: {
        id: { in: invalidRowIds },
        tableId: tableId
      }
    })

    return c.json({
      data: {
        deletedCount: deleteResult.count,
        invalidRowsFound: invalidRowIds.length,
        totalRowsChecked: rows.length
      },
      message: `Successfully deleted ${deleteResult.count} invalid row(s)`
    })
  } catch (error) {
    console.error('Error deleting invalid rows:', error)
    return c.json({
      error: 'Failed to delete invalid rows',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

export default app
