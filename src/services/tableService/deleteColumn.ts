import type { Context } from 'hono'
import type { UserContext } from '@/types/database.js'
import type { TableRepository } from '@/repositories/tableRepository.js'
import type { ZodCompatibleValidator } from '@/validators/zodCompatibleValidator.js'
import { getUserInfo, isUserAdmin, createErrorResponse, createSuccessResponse } from '@/utils/common.js'

/**
 * Delete column from table
 */
export async function deleteColumn(
  repository: TableRepository,
  validator: ZodCompatibleValidator,
  c: Context,
  user: UserContext,
  tableId: string,
  columnId: string
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

    // Check if column is protected (price/qty for for_sale tables)
    const isProtected = await repository.isColumnProtected(tableId, column.name)
    if (isProtected) {
      return createErrorResponse(
        'Column protected',
        `Cannot delete protected column "${column.name}" while table is marked for sale. Change table to non-sale mode first.`,
        403
      )
    }

    // Delete column
    await repository.deleteColumn(tableId, columnId)

    return createSuccessResponse(
      { columnId },
      'Column deleted successfully'
    )
  } catch (error) {
    return createErrorResponse(
      'Failed to delete column',
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
}