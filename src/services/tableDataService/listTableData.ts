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

    // Check table access
    const hasAccess = await repository.checkTableAccess(tableId, userId)
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

    // Extract filters from query parameters
    const queryParams = new URL(c.req.url).searchParams
    const filters = validator.extractFilters(queryParams)

    // Get table data
    const { data, totalCount } = await repository.findTableData(
      tableId,
      filters,
      { page, limit, offset }
    )

    // Get table and columns for metadata
    const tableColumns = await repository.getTableColumns(tableId)
    const tableInfo = await tableRepository.findTableById(tableId, userId)

    if (!tableInfo) {
      return createErrorResponse(
        'Table not found',
        `Table with ID ${tableId} does not exist or you don't have access`,
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