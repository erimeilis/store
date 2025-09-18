/**
 * Delete data row
 */

import type { Context } from 'hono'
import type { UserContext } from '@/types/database.js'
import type { TableDataRepository } from '@/repositories/tableDataRepository.js'
import type { ZodCompatibleValidator } from '@/validators/zodCompatibleValidator.js'
import { getUserInfo, createErrorResponse, createSuccessResponse } from '@/utils/common.js'

export async function deleteDataRow(
  repository: TableDataRepository,
  validator: ZodCompatibleValidator,
  c: Context,
  user: UserContext,
  tableId: string,
  rowId: string
) {
  try {
    const { userId } = getUserInfo(c, user)

    // Validate IDs
    const idValidation = validator.validateIds(tableId, rowId)
    if (!idValidation.valid) {
      return createErrorResponse('Validation failed', idValidation.errors.join(', '), 400)
    }

    // Check table access
    const hasAccess = await repository.checkTableAccess(tableId, userId)
    if (!hasAccess) {
      return createErrorResponse(
        'Table not found',
        `Table with ID ${tableId} does not exist or you don't have access`,
        404
      )
    }

    // Delete data row
    const deletedRow = await repository.deleteDataRow(rowId, tableId)

    return createSuccessResponse(
      { row: deletedRow },
      'Data row deleted successfully'
    )
  } catch (error) {
    return createErrorResponse(
      'Failed to delete data row',
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
}