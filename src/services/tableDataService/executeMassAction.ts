/**
 * Execute mass action on table data
 */

import type { Context } from 'hono'
import type { UserContext } from '@/types/database.js'
import type { TableDataMassAction } from '@/types/dynamic-tables.js'
import type { TableDataRepository } from '@/repositories/tableDataRepository.js'
import type { ZodCompatibleValidator } from '@/validators/zodCompatibleValidator.js'
import { getUserInfo, createErrorResponse, createSuccessResponse } from '@/utils/common.js'

export async function executeMassAction(
  repository: TableDataRepository,
  validator: ZodCompatibleValidator,
  c: Context,
  user: UserContext,
  tableId: string,
  action: TableDataMassAction,
  ids: string[]
) {
  try {
    const { userId } = getUserInfo(c, user)

    // Validate request
    const validation = validator.validateMassAction(action, ids)
    if (!validation.valid) {
      return createErrorResponse('Validation failed', validation.errors.join(', '), 400)
    }

    // Validate table ID
    const idValidation = validator.validateIds(tableId)
    if (!idValidation.valid) {
      return createErrorResponse('Validation failed', idValidation.errors.join(', '), 400)
    }

    // Check table access
    const hasAccess = await repository.checkTableAccess(tableId, userId, user)
    if (!hasAccess) {
      return createErrorResponse(
        'Table not found',
        `Table with ID ${tableId} does not exist or you don't have access`,
        404
      )
    }

    // Execute mass action
    const result = await repository.executeMassAction(tableId, action, ids)

    const response: any = {
      message: `Successfully ${action}d ${result.count} row(s)`,
      count: result.count
    }

    // Note: Export functionality can be added later if needed

    return createSuccessResponse(response)
  } catch (error) {
    return createErrorResponse(
      'Failed to execute mass action',
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
}