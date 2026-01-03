/**
 * Execute mass action on table data
 */

import type { Context } from 'hono'
import type { UserContext } from '@/types/database.js'
import type { TableDataMassAction } from '@/types/dynamic-tables.js'
import type { TableDataRepository } from '@/repositories/tableDataRepository.js'
import type { ZodCompatibleValidator } from '@/validators/zodCompatibleValidator.js'
import { getUserInfo, createErrorResponse, createSuccessResponse } from '@/utils/common.js'

export interface MassActionOptions {
  fieldName?: string
  value?: string | number
  /** When true, apply action to ALL rows in the table (Gmail-style select all) */
  selectAll?: boolean
  /** Filters to apply when selectAll is true (respects current filter context) */
  filters?: Record<string, string>
}

export async function executeMassAction(
  repository: TableDataRepository,
  validator: ZodCompatibleValidator,
  c: Context,
  user: UserContext,
  tableId: string,
  action: TableDataMassAction,
  ids: string[],
  options?: MassActionOptions
) {
  try {
    const { userId } = getUserInfo(c, user)

    // Validate table ID
    const idValidation = validator.validateIds(tableId)
    if (!idValidation.valid) {
      return createErrorResponse('Validation failed', idValidation.errors.join(', '), 400)
    }

    // Check table access first (needed before fetching all IDs)
    const hasAccess = await repository.checkTableAccess(tableId, userId, user)
    if (!hasAccess) {
      return createErrorResponse(
        'Table not found',
        `Table with ID ${tableId} does not exist or you don't have access`,
        404
      )
    }

    // Handle selectAll flag - fetch all row IDs for the table (respecting filters if provided)
    let targetIds = ids
    if (options?.selectAll) {
      // Pass filters to getAllRowIds so mass action only affects filtered rows
      const allRows = await repository.getAllRowIds(tableId, options.filters)
      targetIds = allRows
      if (targetIds.length === 0) {
        return createErrorResponse('No rows found', 'The table has no rows to process (with current filters)', 400)
      }
    }

    // Validate request (skip ids validation if selectAll was used)
    if (!options?.selectAll) {
      const validation = validator.validateMassAction(action, ids)
      if (!validation.valid) {
        return createErrorResponse('Validation failed', validation.errors.join(', '), 400)
      }
    }

    // Additional validation for set_field_value action
    if (action === 'set_field_value') {
      if (!options?.fieldName) {
        return createErrorResponse('Validation failed', 'Field name is required for this action', 400)
      }
      if (options?.value === undefined || options?.value === null || options?.value === '') {
        return createErrorResponse('Validation failed', 'Value is required for this action', 400)
      }
    }

    // Execute mass action with resolved IDs
    const result = await repository.executeMassAction(tableId, action, targetIds, options)

    // Generate appropriate message based on action
    let message: string
    if (action === 'set_field_value' && options?.fieldName) {
      message = `Successfully updated ${options.fieldName} to ${options.value} for ${result.count} row(s)`
    } else {
      message = `Successfully ${action}d ${result.count} row(s)`
    }

    const response: any = {
      message,
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