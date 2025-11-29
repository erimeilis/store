import type { Context } from 'hono'
import type { UserContext } from '@/types/database.js'
import type { UpdateColumnRequest } from '@/types/table-queries.js'
import type { TableRepository } from '@/repositories/tableRepository.js'
import type { ZodCompatibleValidator } from '@/validators/zodCompatibleValidator.js'
import { getUserInfo, isUserAdmin, createErrorResponse, createSuccessResponse } from '@/utils/common.js'
import { validateColumnName } from '@/utils/column-name-utils.js'

/**
 * Update column in table
 */
export async function updateColumn(
  repository: TableRepository,
  validator: ZodCompatibleValidator,
  c: Context,
  user: UserContext,
  tableId: string,
  columnId: string,
  data: UpdateColumnRequest
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

    // Get column details to check if it's protected
    const column = await repository.getColumn(tableId, columnId)
    if (!column) {
      return createErrorResponse('Column not found', 'Column does not exist', 404)
    }

    // Check if this is a protected column based on table type (price/qty for sale, price/used/available for rent)
    const isProtected = await repository.isColumnProtectedByType(tableId, column.name)

    // Validate and convert column name if renaming
    let internalName: string | undefined
    let oldColumnName: string | undefined
    if (data.name !== undefined && data.name !== column.name) {
      // Validate new column name
      const nameValidation = validateColumnName(data.name)
      if (!nameValidation.valid) {
        return createErrorResponse('Invalid column name', nameValidation.error || 'Invalid column name', 400)
      }
      internalName = nameValidation.internalName
      oldColumnName = column.name // Save old name for data migration

      // Check if trying to rename a protected column
      if (isProtected) {
        return createErrorResponse(
          'Column protected',
          `Cannot rename protected column "${column.name}" while table has a special type (sale/rent). Change table to default type first.`,
          403
        )
      }
    }

    // Check if trying to modify protected column properties (isRequired, allowDuplicates)
    if (isProtected) {
      if (data.isRequired !== undefined && data.isRequired !== column.isRequired) {
        return createErrorResponse(
          'Column protected',
          `Cannot modify "required" setting for protected column "${column.name}" while table has a special type. Protected columns must remain required.`,
          403
        )
      }
      if (data.allowDuplicates !== undefined && data.allowDuplicates !== column.allowDuplicates) {
        return createErrorResponse(
          'Column protected',
          `Cannot modify "allow duplicates" setting for protected column "${column.name}" while table has a special type.`,
          403
        )
      }
    }

    // Handle position updates separately to avoid constraint violations
    if (data.position !== undefined) {
      console.log(`🔧 Using safe position update: tableId=${tableId}, columnId=${columnId}, newPosition=${data.position}`)
      // Use safe position update method
      await repository.updateColumnPositionSafe(tableId, columnId, data.position)
      console.log(`✅ Safe position update completed`)

      // Run recount immediately instead of setTimeout (Cloudflare Workers limitation)
      console.log(`🔄 Running immediate recount for table ${tableId}`)
      try {
        await repository.recountColumnPositions(tableId)
        console.log(`✅ Immediate recount completed for table ${tableId}`)
      } catch (error) {
        console.error(`❌ Immediate recount failed for table ${tableId}:`, error)
      }
    }

    // Update other fields if provided
    const updateData: any = {}
    if (internalName !== undefined) updateData.name = internalName
    if (data.type !== undefined) updateData.type = data.type
    if (data.isRequired !== undefined) updateData.isRequired = data.isRequired
    if (data.allowDuplicates !== undefined) updateData.allowDuplicates = data.allowDuplicates
    if (data.defaultValue !== undefined && data.defaultValue !== null) {
      updateData.defaultValue = data.defaultValue
    }

    // Only update non-position fields if there are any
    let result
    if (Object.keys(updateData).length > 0) {
      result = await repository.updateColumn(tableId, columnId, updateData)

      // CRITICAL: If column was renamed, also update all data rows to use the new column name
      if (oldColumnName && internalName && oldColumnName !== internalName) {
        const rowsUpdated = await repository.renameColumnInData(tableId, oldColumnName, internalName)
        console.log(`✅ Renamed column "${oldColumnName}" → "${internalName}" (${rowsUpdated} data rows updated)`)
      }
    } else {
      // If only position was updated, get the updated column
      result = await repository.getColumn(tableId, columnId)
    }

    return createSuccessResponse(
      { column: result },
      'Column updated successfully'
    )
  } catch (error) {
    // Handle specific database constraint errors
    if (error instanceof Error) {
      const errorMessage = error.message
      // Check for unique constraint on tableId + name
      if (errorMessage.includes('Unique constraint failed') &&
          (errorMessage.includes('tableId') || errorMessage.includes('name'))) {
        return createErrorResponse(
          'Duplicate column name',
          `A column with the name "${data.name}" already exists in this table. Please choose a different name.`,
          409
        )
      }
    }

    return createErrorResponse(
      'Failed to update column',
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
}