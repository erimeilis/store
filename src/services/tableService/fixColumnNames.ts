import type { Context } from 'hono'
import type { UserContext } from '@/types/database.js'
import type { TableRepository } from '@/repositories/tableRepository.js'
import type { ZodCompatibleValidator } from '@/validators/zodCompatibleValidator.js'
import { getUserInfo, isUserAdmin, createErrorResponse, createSuccessResponse } from '@/utils/common.js'
import { hasColumnNameIssues, fixColumnName } from '@/utils/column-name-utils.js'

/**
 * Fix all column names in a table to use proper camelCase format
 * Also migrates existing data to use the new column names
 */
export async function fixColumnNames(
  repository: TableRepository,
  validator: ZodCompatibleValidator,
  c: Context,
  user: UserContext,
  tableId: string
) {
  try {
    const { userId, userEmail } = getUserInfo(c, user)
    const isAdmin = isUserAdmin(user)

    // Validate table ID
    const validation = validator.validateTableId(tableId)
    if (!validation.valid) {
      return createErrorResponse('Validation failed', validation.errors.join(', '), 400)
    }

    // Check ownership
    const isOwner = await repository.checkTableOwnership(tableId, userEmail, userId)
    if (!isAdmin && !isOwner) {
      return createErrorResponse('Access denied', 'You can only modify tables you created', 403)
    }

    // Get all columns for this table
    const columns = await repository.getTableColumns(tableId)

    let fixed = 0
    let failed = 0
    let dataRowsUpdated = 0
    const errors: string[] = []

    for (const column of columns) {
      if (hasColumnNameIssues(column.name)) {
        const oldName = column.name
        try {
          // Generate the fixed name
          let newName = fixColumnName(oldName)

          // Check if fixed name would create a duplicate
          const existingWithName = columns.find(
            col => col.id !== column.id && col.name.toLowerCase() === newName.toLowerCase()
          )

          if (existingWithName) {
            // Append a number to make it unique
            let counter = 2
            let uniqueName = `${newName}${counter}`
            while (columns.find(col => col.id !== column.id && col.name.toLowerCase() === uniqueName.toLowerCase())) {
              counter++
              uniqueName = `${newName}${counter}`
            }
            newName = uniqueName
          }

          // Update the column definition
          await repository.updateColumn(tableId, column.id, { name: newName })

          // CRITICAL: Also update all data rows to use the new column name
          const rowsUpdated = await repository.renameColumnInData(tableId, oldName, newName)
          dataRowsUpdated += rowsUpdated

          // Update the column in our local array for future duplicate checks
          column.name = newName

          fixed++
          console.log(`✅ Fixed column "${oldName}" → "${newName}" (${rowsUpdated} data rows updated)`)
        } catch (error) {
          failed++
          errors.push(`Failed to fix "${oldName}": ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
    }

    return createSuccessResponse(
      {
        fixed,
        failed,
        dataRowsUpdated,
        errors: errors.length > 0 ? errors : undefined
      },
      `Fixed ${fixed} column name(s), updated ${dataRowsUpdated} data row(s)${failed > 0 ? `, ${failed} failed` : ''}`
    )
  } catch (error) {
    return createErrorResponse(
      'Failed to fix column names',
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
}
