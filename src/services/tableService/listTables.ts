import type { Context } from 'hono'
import type { UserContext } from '@/types/database.js'
import type { ListTablesQuery, TableFilters, TableSort, TablePagination } from '@/types/table-queries.js'
import type { TableRepository } from '@/repositories/tableRepository.js'
import { getUserInfo, createErrorResponse, createSuccessResponse, buildPaginationInfo } from '@/utils/common.js'

/**
 * List tables with filtering and pagination
 */
export async function listTables(
  repository: TableRepository,
  c: Context,
  user: UserContext,
  query: ListTablesQuery
) {
  try {
    const { userId, userEmail } = getUserInfo(c, user)

    const page = query.page || 1
    const limit = query.limit || 10
    const offset = (page - 1) * limit

    const filters: TableFilters = {}

    if (query.filter_name !== undefined) filters.name = query.filter_name
    if (query.filter_description !== undefined) filters.description = query.filter_description
    if (query.filter_owner !== undefined) filters.owner = query.filter_owner
    if (query.filter_visibility !== undefined) filters.visibility = query.filter_visibility
    if (query.filter_created_at !== undefined) filters.createdAt = query.filter_created_at
    if (query.filter_updated_at !== undefined) filters.updatedAt = query.filter_updated_at

    const sort: TableSort = {
      column: query.sort || 'updated_at',
      direction: query.direction || 'desc'
    }

    const pagination: TablePagination = { page, limit, offset }

    const { tables, totalCount } = await repository.findTables(
      userId,
      userEmail,
      filters,
      sort,
      pagination
    )

    const paginationInfo = buildPaginationInfo(page, limit, totalCount)

    return createSuccessResponse({
      tables,
      pagination: paginationInfo
    })
  } catch (error) {
    return createErrorResponse(
      'Failed to fetch tables',
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
}