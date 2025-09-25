import type { Context } from 'hono'
import type { UserContext } from '@/types/database.js'
import type { CreateTableRequest } from '@/types/dynamic-tables.js'
import type { TableRepository } from '@/repositories/tableRepository.js'
import type { ZodCompatibleValidator } from '@/validators/zodCompatibleValidator.js'
import { getUserInfo, createErrorResponse, createSuccessResponse } from '@/utils/common.js'
import { DEFAULT_SALE_COLUMNS } from '@/types/dynamic-tables.js'
import { InventoryTrackingService } from '@/services/inventoryTrackingService/index.js'

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
    if (data.forSale) {
      const existingPriceCol = data.columns.find(col => col.name === 'price')
      const existingQtyCol = data.columns.find(col => col.name === 'qty')

      // Calculate next available positions following 10, 20, 30, 40... pattern
      const maxPosition = Math.max(...data.columns.map(col => col.position || 0))
      const nextPosition = maxPosition + 10

      // Add missing sale columns with proper positions
      if (!existingPriceCol) {
        data.columns.push({
          ...DEFAULT_SALE_COLUMNS[0]!,
          position: nextPosition
        })
      }
      if (!existingQtyCol) {
        data.columns.push({
          ...DEFAULT_SALE_COLUMNS[1]!,
          position: nextPosition + 10
        })
      }
    }

    // Create table
    const tableSchema = await repository.createTable(data, userId, userEmail)

    // Track inventory for for_sale tables
    if (data.forSale) {
      try {
        const inventoryService = new InventoryTrackingService(c.env.DB)
        await inventoryService.trackTableCreation(
          tableSchema.table.id,
          tableSchema.table.name,
          userEmail
        )
      } catch (inventoryError) {
        console.error('⚠️ Failed to track table creation in inventory:', inventoryError)
        // Continue without failing the main operation
      }
    }

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