import type { Context } from 'hono'
import type { UserContext } from '@/types/database.js'
import type { TableMassAction } from '@/types/dynamic-tables.js'
import { getUserInfo, isUserAdmin, createErrorResponse, createSuccessResponse } from '@/utils/common.js'
import { deleteTable } from './deleteTable.js'
import { updateTable } from './updateTable.js'
import type { TableRepository } from '@/repositories/tableRepository.js'
import type { ZodCompatibleValidator } from '@/validators/zodCompatibleValidator.js'

export interface TableMassActionOptions {
  /** When true, apply action to ALL tables the user owns (Gmail-style select all) */
  selectAll?: boolean
}

/**
 * Execute mass action on multiple tables
 */
export async function executeMassAction(
  repository: TableRepository,
  validator: ZodCompatibleValidator,
  c: Context,
  user: UserContext,
  action: TableMassAction,
  ids: string[],
  options?: TableMassActionOptions
) {
  try {
    const { userId, userEmail } = getUserInfo(c, user)
    const isAdmin = isUserAdmin(user)

    // Handle selectAll flag - fetch all table IDs for the user
    let targetIds = ids
    if (options?.selectAll) {
      targetIds = await repository.getAllTableIds(userId, userEmail, isAdmin)
      if (targetIds.length === 0) {
        return createErrorResponse('No tables found', 'You have no tables to process', 400)
      }
      console.log(`📋 selectAll: Fetched ${targetIds.length} table IDs for mass action`)
    }

    const results = await Promise.all(
      targetIds.map(async (id) => {
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
      { results, count: targetIds.length },
      `Mass action ${action} completed on ${targetIds.length} table(s)`
    )
  } catch (error) {
    return createErrorResponse(
      'Mass action failed',
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
}