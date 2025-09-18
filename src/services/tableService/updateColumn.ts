import type { Context } from 'hono'
import type { UserContext } from '@/types/database.js'
import type { UpdateColumnRequest } from '@/types/table-queries.js'
import type { TableRepository } from '@/repositories/tableRepository.js'
import type { ZodCompatibleValidator } from '@/validators/zodCompatibleValidator.js'
import { getUserInfo, isUserAdmin, createErrorResponse, createSuccessResponse } from '@/utils/common.js'

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

    // Check if trying to rename a protected column
    if (data.name !== undefined && data.name !== column.name) {
      const isProtected = await repository.isColumnProtected(tableId, column.name)
      if (isProtected) {
        return createErrorResponse(
          'Column protected',
          `Cannot rename protected column "${column.name}" while table is marked for sale. Change table to non-sale mode first.`,
          403
        )
      }
    }

    // Update column
    const updateData: any = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.type !== undefined) updateData.type = data.type
    if (data.is_required !== undefined) updateData.is_required = data.is_required
    if (data.default_value !== undefined && data.default_value !== null) {
      updateData.default_value = data.default_value
    }

    const result = await repository.updateColumn(tableId, columnId, updateData)

    return createSuccessResponse(
      { column: result },
      'Column updated successfully'
    )
  } catch (error) {
    return createErrorResponse(
      'Failed to update column',
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
}