import type { Context } from 'hono'
import type { UserContext } from '@/types/database.js'
import type { CreateTableRequest } from '@/types/dynamic-tables.js'
import type { TableRepository } from '@/repositories/tableRepository.js'
import type { ZodCompatibleValidator } from '@/validators/zodCompatibleValidator.js'
import { getUserInfo, createErrorResponse, createSuccessResponse } from '@/utils/common.js'
import { DEFAULT_SALE_COLUMNS } from '@/types/dynamic-tables.js'

/**
 * Create new table
 */
export async function createTable(
  repository: TableRepository,
  validator: ZodCompatibleValidator,
  c: Context,
  user: UserContext,
  data: CreateTableRequest
) {
  try {
    // Validate request
    const validation = validator.validateCreateRequest(data)
    if (!validation.valid) {
      return createErrorResponse('Validation failed', validation.errors.join(', '), 400)
    }

    const { userId, userEmail } = getUserInfo(c, user)

    // If table is marked for sale, automatically add price/qty columns if not present
    if (data.for_sale) {
      const existingPriceCol = data.columns.find(col => col.name === 'price')
      const existingQtyCol = data.columns.find(col => col.name === 'qty')

      // Add missing sale columns
      if (!existingPriceCol) {
        data.columns.push(DEFAULT_SALE_COLUMNS[0]!) // price column
      }
      if (!existingQtyCol) {
        data.columns.push(DEFAULT_SALE_COLUMNS[1]!) // qty column
      }
    }

    // Create table
    const tableSchema = await repository.createTable(data, userId, userEmail)

    return createSuccessResponse(
      { table: tableSchema },
      'Table created successfully',
      201
    )
  } catch (error) {
    if (error instanceof SyntaxError) {
      return createErrorResponse('Invalid JSON', 'Request body must be valid JSON', 400)
    }

    return createErrorResponse(
      'Failed to create table',
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
}