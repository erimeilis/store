/**
 * Get specific data row
 */

import type { Context } from 'hono'
import type { UserContext } from '@/types/database.js'
import type { TableDataRepository } from '@/repositories/tableDataRepository.js'
import type { ZodCompatibleValidator } from '@/validators/zodCompatibleValidator.js'
import { getUserInfo, createErrorResponse, createSuccessResponse } from '@/utils/common.js'

export async function getDataRow(
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

    // Get data row
    const dataRow = await repository.findDataRowById(rowId, tableId)
    if (!dataRow) {
      return createErrorResponse(
        'Row not found',
        `Row with ID ${rowId} does not exist in this table`,
        404
      )
    }

    return createSuccessResponse({ row: dataRow })
  } catch (error) {
    return createErrorResponse(
      'Failed to fetch data row',
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
}