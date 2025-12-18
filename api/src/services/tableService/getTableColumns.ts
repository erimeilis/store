import type { Context } from 'hono'
import type { UserContext } from '@/types/database.js'
import type { TableRepository } from '@/repositories/tableRepository.js'
import { getUserInfo, isUserAdmin, createErrorResponse, createSuccessResponse } from '@/utils/common.js'

/**
 * Get table columns
 */
export async function getTableColumns(
  repository: TableRepository,
  c: Context,
  user: UserContext,
  tableId: string
) {
  try {
    const { userId } = getUserInfo(c, user)
    const isAdmin = isUserAdmin(user)

    // Get table and verify ownership or public access (admins have full access)
    const table = await repository.getTable(tableId, userId)
    if (!table && !isAdmin) {
      return createErrorResponse('Table not found', 'Table not found or access denied', 404)
    }

    // If admin but table not found via regular access, try direct lookup
    if (!table && isAdmin) {
      const directTable = await repository.findTableByIdInternal(tableId)
      if (!directTable) {
        return createErrorResponse('Table not found', 'Table does not exist', 404)
      }
    }

    const columns = await repository.getTableColumns(tableId)

    // Convert columns object to array format expected by frontend
    const columnsArray = Object.values(columns)

    // Sort by position for consistent ordering
    columnsArray.sort((a: any, b: any) => a.position - b.position)

    // Return with pagination structure for ModelList compatibility
    const total = columnsArray.length
    return createSuccessResponse({
      data: columnsArray,
      currentPage: 1,
      lastPage: 1,
      perPage: total,
      total,
      from: total > 0 ? 1 : 0,
      to: total,
      links: [],
      prevPageUrl: null,
      nextPageUrl: null,
      lastPageUrl: null
    }, 'Columns retrieved successfully')
  } catch (error) {
    return createErrorResponse(
      'Failed to get table columns',
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
}