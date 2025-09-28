import type { Context } from 'hono'
import type { UserContext } from '@/types/database.js'
import type { TableMassAction } from '@/types/dynamic-tables.js'
import { createErrorResponse, createSuccessResponse } from '@/utils/common.js'
import { deleteTable } from './deleteTable.js'
import { updateTable } from './updateTable.js'
import type { TableRepository } from '@/repositories/tableRepository.js'
import type { ZodCompatibleValidator } from '@/validators/zodCompatibleValidator.js'

/**
 * Execute mass action on multiple tables
 */
export async function executeMassAction(
  repository: TableRepository,
  validator: ZodCompatibleValidator,
  c: Context,
  user: UserContext,
  action: TableMassAction,
  ids: string[]
) {
  try {
    const results = await Promise.all(
      ids.map(async (id) => {
        switch (action) {
          case 'delete':
            return deleteTable(repository, validator, c, user, id)
          case 'make_public':
            return updateTable(repository, validator, c, user, id, { visibility: 'public' })
          case 'make_private':
            return updateTable(repository, validator, c, user, id, { visibility: 'private' })
          case 'make_shared':
            return updateTable(repository, validator, c, user, id, { visibility: 'shared' })
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