/**
 * Get individual column
 */

import type { Context } from 'hono'
import type { UserContext } from '@/types/database.js'
import type { TableRepository } from '@/repositories/tableRepository.js'
import { getUserInfo, isUserAdmin, createErrorResponse, createSuccessResponse } from '@/utils/common.js'

export async function getColumn(
  repository: TableRepository,
  c: Context,
  user: UserContext,
  tableId: string,
  columnId: string
) {
  try {
    const { userId } = getUserInfo(c, user)
    const isAdmin = isUserAdmin(user)

    // Check table access by trying to find the table (admins have full access)
    const table = await repository.findTableById(tableId, userId)
    if (!table && !isAdmin) {
      return createErrorResponse(
        'Table not found',
        `Table with ID ${tableId} does not exist or you don't have access`,
        404
      )
    }

    // If admin but table not found via regular access, verify table exists
    if (!table && isAdmin) {
      const directTable = await repository.findTableByIdInternal(tableId)
      if (!directTable) {
        return createErrorResponse('Table not found', 'Table does not exist', 404)
      }
    }

    // Get column
    const column = await repository.getColumn(tableId, columnId)
    if (!column) {
      return createErrorResponse(
        'Column not found',
        `Column with ID ${columnId} does not exist in this table`,
        404
      )
    }

    return createSuccessResponse({ column })
  } catch (error) {
    return createErrorResponse(
      'Failed to fetch column',
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
}