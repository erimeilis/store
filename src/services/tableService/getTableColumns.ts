import type { Context } from 'hono'
import type { UserContext } from '@/types/database.js'
import type { TableRepository } from '@/repositories/tableRepository.js'
import { getUserInfo, createErrorResponse, createSuccessResponse } from '@/utils/common.js'

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

    // Get table and verify ownership or public access
    const table = await repository.getTable(tableId, userId)
    if (!table) {
      return createErrorResponse('Table not found', 'Table not found or access denied', 404)
    }

    const columns = await repository.getTableColumns(tableId)

    // Convert columns object to array format expected by frontend
    const columnsArray = Object.values(columns)

    return createSuccessResponse({ data: columnsArray }, 'Columns retrieved successfully')
  } catch (error) {
    return createErrorResponse(
      'Failed to get table columns',
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
}