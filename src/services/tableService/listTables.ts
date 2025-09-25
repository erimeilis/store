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

    if (query.filterName !== undefined) filters.name = query.filterName
    if (query.filterDescription !== undefined) filters.description = query.filterDescription
    if (query.filterOwner !== undefined) filters.owner = query.filterOwner
    if (query.filterVisibility !== undefined) filters.visibility = query.filterVisibility
    if (query.filterCreatedAt !== undefined) filters.createdAt = query.filterCreatedAt
    if (query.filterUpdatedAt !== undefined) filters.updatedAt = query.filterUpdatedAt
    if (query.forSale !== undefined) filters.forSale = query.forSale

    const sort: TableSort = {
      column: query.sort || 'updatedAt',
      direction: query.direction || 'desc'
    }

    const pagination: TablePagination = { page, limit, offset }

    // Check if user has admin permissions
    const isAdmin = user.permissions.includes('admin')

    const { tables, totalCount } = await repository.findTables(
      userId,
      userEmail,
      filters,
      sort,
      pagination,
      isAdmin
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