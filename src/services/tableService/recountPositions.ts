import type { Context } from 'hono'
import type { UserContext } from '@/types/database.js'
import type { TableRepository } from '@/repositories/tableRepository.js'
import type { ZodCompatibleValidator } from '@/validators/zodCompatibleValidator.js'
import { getUserInfo, isUserAdmin, createErrorResponse, createSuccessResponse } from '@/utils/common.js'

/**
 * Recount column positions to ensure proper sequential ordering (0, 1, 2, 3...)
 */
export async function recountPositions(
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

    // Recount positions
    await repository.recountColumnPositions(tableId)

    return createSuccessResponse(
      { message: 'Column positions recounted successfully' },
      'Column positions recounted'
    )
  } catch (error) {
    return createErrorResponse(
      'Failed to recount column positions',
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
}