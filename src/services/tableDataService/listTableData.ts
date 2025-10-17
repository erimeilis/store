/**
 * List table data with filtering and pagination
 */

import type { Context } from 'hono'
import type { UserContext } from '@/types/database.js'
import type { TableDataRepository } from '@/repositories/tableDataRepository.js'
import type { TableRepository } from '@/repositories/tableRepository.js'
import type { ZodCompatibleValidator } from '@/validators/zodCompatibleValidator.js'
import { getUserInfo, createErrorResponse, createSuccessResponse, buildPaginationInfo } from '@/utils/common.js'

interface ListTableDataQuery {
  page?: number
  limit?: number
  sort?: string
  direction?: string
}

export async function listTableData(
  repository: TableDataRepository,
  tableRepository: TableRepository,
  validator: ZodCompatibleValidator,
  c: Context,
  user: UserContext,
  tableId: string,
  query: ListTableDataQuery
) {
  try {
    const { userId } = getUserInfo(c, user)

    // Validate table ID
    const idValidation = validator.validateIds(tableId)
    if (!idValidation.valid) {
      return createErrorResponse('Validation failed', idValidation.errors.join(', '), 400)
    }

    // Check table access (pass user context for token-based access)
    const hasAccess = await repository.checkTableAccess(tableId, userId, user)
    if (!hasAccess) {
      return createErrorResponse(
        'Table not found',
        `Table with ID ${tableId} does not exist or you don't have access`,
        404
      )
    }

    const page = query.page || 1
    const limit = query.limit || 10
    const offset = (page - 1) * limit
    const sort = query.sort || 'updatedAt'
    const direction = query.direction || 'desc'

    // Extract filters from query parameters
    const queryParams = new URL(c.req.url).searchParams
    const filters = validator.extractFilters(queryParams)

    // Get table data
    const { data, totalCount } = await repository.findTableData(
      tableId,
      filters,
      { page, limit, offset },
      { column: sort, direction }
    )

    // Get table and columns for metadata
    // Use internal method since we already validated access above
    const tableColumns = await repository.getTableColumns(tableId)
    const tableInfo = await tableRepository.findTableByIdInternal(tableId)

    if (!tableInfo) {
      return createErrorResponse(
        'Table not found',
        `Table with ID ${tableId} does not exist`,
        404
      )
    }

    const pagination = buildPaginationInfo(page, limit, totalCount)

    return createSuccessResponse({
      data,
      pagination,
      _meta: {
        table: tableInfo,
        columns: tableColumns
      }
    })
  } catch (error) {
    return createErrorResponse(
      'Failed to fetch table data',
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
}