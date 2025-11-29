import { Hono } from 'hono'
import { adminWriteAuthMiddleware } from '@/middleware/auth.js'
import { TableService } from '@/services/tableService/index.js'
import type { Bindings } from '@/types/bindings.js'
import type { UserContext } from '@/types/database.js'
import {
  TableType,
  TypeChangeApplyRequest,
  getDefaultColumns,
  RentalPeriod
} from '@/types/dynamic-tables.js'
import type { AddColumnRequest, UpdateColumnRequest } from '@/types/table-queries.js'

const app = new Hono<{
  Bindings: Bindings
  Variables: { user: UserContext }
}>()

/**
 * POST /tables/:id/apply-type-change
 * Apply table type change with column mappings
 */
app.post('/:id/apply-type-change', adminWriteAuthMiddleware, async (c) => {
  try {
    const tableId = c.req.param('id')

    // Parse request
    const body = await c.req.json() as TypeChangeApplyRequest
    const { targetType, columnMappings, rentalPeriod } = body

    if (!targetType || !['default', 'sale', 'rent'].includes(targetType)) {
      return c.json({ error: 'Invalid target type', message: 'targetType must be "default", "sale", or "rent"' }, 400)
    }

    const service = new TableService(c.env)
    const user = c.get('user')

    // Get table with columns to verify access and get existing state
    const tableResult = await service.getTable(c, user, tableId)
    if (tableResult.status !== 200 || !tableResult.response?.table) {
      return c.json({ error: 'Table not found', message: 'Table does not exist or you do not have access' }, 404)
    }

    const existingColumns = tableResult.response.table.columns || []
    const existingColumnMap = new Map(existingColumns.map((col: { id: string; name: string }) => [col.id, col]))

    // Get required columns for target type
    const defaultColumns = getDefaultColumns(targetType)
    const requiredColumnNames = defaultColumns.map(c => c.name)

    // Validate mappings - all required columns must be mapped (except for 'default' type)
    if (targetType !== 'default') {
      const mappedRequiredColumns = columnMappings.map(m => m.requiredColumn)
      const missingMappings = requiredColumnNames.filter(name => !mappedRequiredColumns.includes(name))

      if (missingMappings.length > 0) {
        return c.json({
          error: 'Missing column mappings',
          message: `All required columns must be mapped: ${missingMappings.join(', ')}`
        }, 400)
      }
    }

    // Get max position for new columns
    const maxPosition = existingColumns.reduce((max: number, col: { position: number }) =>
      Math.max(max, col.position), 0)
    let nextPosition = maxPosition + 10

    // Track changes for response
    const renamedColumns: string[] = []
    const createdColumns: string[] = []
    const modifiedColumns: string[] = []

    // Process mappings
    for (const mapping of columnMappings) {
      const requiredColDef = defaultColumns.find(c => c.name === mapping.requiredColumn)
      if (!requiredColDef) continue

      if (mapping.existingColumnId) {
        // Map existing column - rename if needed and update settings
        const existingCol = existingColumnMap.get(mapping.existingColumnId) as { id: string; name: string; defaultValue?: string | null } | undefined
        if (!existingCol) {
          return c.json({
            error: 'Invalid mapping',
            message: `Column ID ${mapping.existingColumnId} not found`
          }, 400)
        }

        // Check if we need to rename
        const needsRename = existingCol.name !== mapping.requiredColumn

        // Prepare update data
        const updateData: UpdateColumnRequest = {
          name: mapping.requiredColumn, // Rename to required name
          isRequired: requiredColDef.isRequired,
          allowDuplicates: requiredColDef.allowDuplicates ?? true
        }

        // Set default value if column didn't have one
        if (!existingCol.defaultValue && requiredColDef.defaultValue != null) {
          updateData.defaultValue = String(requiredColDef.defaultValue)
        }

        // Update column via service
        const updateResult = await service.updateColumn(c, user, tableId, mapping.existingColumnId, updateData)
        if ('error' in updateResult) {
          console.error('Failed to update column:', updateResult)
          // Continue with other mappings, don't fail entirely
        }

        if (needsRename) {
          renamedColumns.push(`${existingCol.name} → ${mapping.requiredColumn}`)
        } else {
          modifiedColumns.push(mapping.requiredColumn)
        }
      } else {
        // Create new column
        const addData: AddColumnRequest = {
          name: requiredColDef.name,
          type: requiredColDef.type,
          isRequired: requiredColDef.isRequired,
          allowDuplicates: requiredColDef.allowDuplicates ?? true,
          defaultValue: requiredColDef.defaultValue != null ? String(requiredColDef.defaultValue) : null,
          position: nextPosition
        }

        const addResult = await service.addColumn(c, user, tableId, addData)
        if ('error' in addResult) {
          console.error('Failed to add column:', addResult)
          // Continue with other columns
        }

        nextPosition += 10
        createdColumns.push(requiredColDef.name)
      }
    }

    // Update table type
    const updateTableData: { tableType: TableType; rentalPeriod?: RentalPeriod } = {
      tableType: targetType
    }

    if (targetType === 'rent' && rentalPeriod) {
      updateTableData.rentalPeriod = rentalPeriod
    }

    const updateResult = await service.updateTable(c, user, tableId, updateTableData)
    if ('error' in updateResult) {
      return c.json({
        error: 'Failed to update table type',
        message: 'Column mappings were applied but table type update failed'
      }, 500)
    }

    // Get final table state
    const finalResult = await service.getTable(c, user, tableId)
    const finalTable = finalResult.response?.table

    return c.json({
      data: {
        table: finalTable?.table || null,
        columns: finalTable?.columns || [],
        changes: {
          renamedColumns,
          createdColumns,
          modifiedColumns
        }
      },
      message: `Table type changed to "${targetType}" successfully`
    })
  } catch (error) {
    console.error('Error in apply-type-change:', error)
    return c.json({
      error: 'Failed to apply type change',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

export default app
