import type { Context } from 'hono'
import type { UserContext } from '@/types/database.js'
import { createErrorResponse, createSuccessResponse } from '@/utils/common.js'
import { deleteColumn } from './deleteColumn.js'
import type { TableRepository } from '@/repositories/tableRepository.js'
import type { ZodCompatibleValidator } from '@/validators/zodCompatibleValidator.js'

/**
 * Execute mass action on table columns
 */
export async function executeColumnMassAction(
  repository: TableRepository,
  validator: ZodCompatibleValidator,
  c: Context,
  user: UserContext,
  tableId: string,
  action: string,
  ids: string[]
) {
  try {
    // For delete action, check protected columns upfront
    if (action === 'delete') {
      const protectedColumns: string[] = []

      for (const id of ids) {
        const column = await repository.getColumn(tableId, id)
        if (column) {
          const isProtected = await repository.isColumnProtected(tableId, column.name)
          if (isProtected) {
            protectedColumns.push(column.name)
          }
        }
      }

      if (protectedColumns.length > 0) {
        return createErrorResponse(
          'Protected columns selected',
          `Cannot delete protected columns: ${protectedColumns.join(', ')}. These columns are protected because the table is configured for sale. Change table to non-sale mode first.`,
          403
        )
      }
    }

    const results = await Promise.all(
      ids.map(async (id) => {
        switch (action) {
          case 'delete':
            return deleteColumn(repository, validator, c, user, tableId, id)
          case 'make_required':
            // Update column to be required
            return repository.updateColumn(tableId, id, { is_required: true })
          case 'make_optional':
            // Update column to be optional
            return repository.updateColumn(tableId, id, { is_required: false })
          default:
            return createErrorResponse('Invalid action', `Action ${action} is not supported`, 400)
        }
      })
    )

    return createSuccessResponse(
      { results },
      `Mass action ${action} completed`
    )
  } catch (error) {
    return createErrorResponse(
      'Mass action failed',
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
}