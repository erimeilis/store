import type { Context } from 'hono'
import type { UserContext } from '@/types/database.js'
import type { TableSchema } from '@/types/dynamic-tables.js'
import type { TableRepository } from '@/repositories/tableRepository.js'
import type { ZodCompatibleValidator } from '@/validators/zodCompatibleValidator.js'
import { getUserInfo, isUserAdmin, createErrorResponse, createSuccessResponse } from '@/utils/common.js'

/**
 * Get specific table with columns
 */
export async function getTable(
  repository: TableRepository,
  validator: ZodCompatibleValidator,
  c: Context,
  user: UserContext,
  tableId: string
) {
  try {
    const { userId } = getUserInfo(c, user)
    const isAdmin = isUserAdmin(user)

    console.log('🔍 getTable debug:', {
      tableId,
      type: typeof tableId,
      isNaN: isNaN(Number(tableId)),
      userId,
      isAdmin
    })

    // Validate table ID
    const validation = validator.validateTableId(tableId)
    if (!validation.valid) {
      console.error('❌ Table ID validation failed:', { tableId, errors: validation.errors })
      return createErrorResponse('Validation failed', validation.errors.join(', '), 400)
    }

    // Get table (admins have full access)
    const table = await repository.findTableById(tableId, userId)
    if (!table && !isAdmin) {
      return createErrorResponse(
        'Table not found',
        `Table with ID ${tableId} does not exist or you don't have access`,
        404
      )
    }

    // If admin but table not found via regular access, verify table exists
    let tableData = table
    if (!table && isAdmin) {
      tableData = await repository.findTableByIdInternal(tableId)
      if (!tableData) {
        return createErrorResponse('Table not found', 'Table does not exist', 404)
      }
    }

    // Get columns
    const columns = await repository.getTableColumns(tableId)

    const tableSchema: TableSchema = { table: tableData!, columns }

    return createSuccessResponse({ table: tableSchema })
  } catch (error) {
    return createErrorResponse(
      'Failed to fetch table',
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
}