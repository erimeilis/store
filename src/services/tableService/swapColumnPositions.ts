import type { Context } from 'hono'
import type { UserContext } from '@/types/database.js'
import type { TableRepository } from '@/repositories/tableRepository.js'
import type { ZodCompatibleValidator } from '@/validators/zodCompatibleValidator.js'
import { getUserInfo, isUserAdmin, createErrorResponse, createSuccessResponse } from '@/utils/common.js'

/**
 * Swap positions between two columns
 */
export async function swapColumnPositions(
  repository: TableRepository,
  validator: ZodCompatibleValidator,
  c: Context,
  user: UserContext,
  tableId: string,
  columnId1: string,
  columnId2: string
) {
  try {
    const { userId, userEmail } = getUserInfo(c, user)
    const isAdmin = isUserAdmin(user)

    // Validate inputs
    const tableValidation = validator.validateTableId(tableId)
    if (!tableValidation.valid) {
      return createErrorResponse('Validation failed', tableValidation.errors.join(', '), 400)
    }

    if (!columnId1 || !columnId2) {
      return createErrorResponse('Validation failed', 'Both columnId1 and columnId2 are required', 400)
    }

    if (columnId1 === columnId2) {
      return createErrorResponse('Validation failed', 'Cannot swap column with itself', 400)
    }

    // Check ownership
    const isOwner = await repository.checkTableOwnership(tableId, userEmail, userId)
    if (!isAdmin && !isOwner) {
      return createErrorResponse('Access denied', 'You can only modify tables you created', 403)
    }

    // Swap column positions
    await repository.swapColumnPositions(tableId, columnId1, columnId2)

    return createSuccessResponse(
      { message: 'Column positions swapped successfully' },
      'Column positions swapped'
    )
  } catch (error) {
    return createErrorResponse(
      'Failed to swap column positions',
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
}