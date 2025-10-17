/**
 * Delete data row
 */

import type { Context } from 'hono'
import type { UserContext } from '@/types/database.js'
import type { TableDataRepository } from '@/repositories/tableDataRepository.js'
import type { ZodCompatibleValidator } from '@/validators/zodCompatibleValidator.js'
import { getUserInfo, createErrorResponse, createSuccessResponse } from '@/utils/common.js'
import { InventoryTrackingService } from '@/services/inventoryTrackingService/index.js'

export async function deleteDataRow(
  repository: TableDataRepository,
  validator: ZodCompatibleValidator,
  c: Context,
  user: UserContext,
  tableId: string,
  rowId: string
) {
  try {
    const { userId } = getUserInfo(c, user)

    // Validate IDs
    const idValidation = validator.validateIds(tableId, rowId)
    if (!idValidation.valid) {
      return createErrorResponse('Validation failed', idValidation.errors.join(', '), 400)
    }

    // Check table access
    const hasAccess = await repository.checkTableAccess(tableId, userId, user)
    if (!hasAccess) {
      return createErrorResponse(
        'Table not found',
        `Table with ID ${tableId} does not exist or you don't have access`,
        404
      )
    }

    // Get row data before deletion for inventory tracking
    const existingRow = await repository.findDataRowById(rowId, tableId)
    if (!existingRow) {
      return createErrorResponse(
        'Row not found',
        `Row with ID ${rowId} does not exist in this table`,
        404
      )
    }

    // Get table info to check for_sale status
    const tableInfo = await repository.getTableInfo(tableId)

    // Delete data row
    const deletedRow = await repository.deleteDataRow(rowId, tableId)

    // Track inventory for for_sale tables
    if (tableInfo?.forSale && existingRow) {
      try {
        const inventoryService = new InventoryTrackingService(c.env.DB)
        await inventoryService.trackItemDeletion(
          tableId,
          tableInfo.name,
          rowId,
          existingRow.data,
          getUserInfo(c, user).userEmail
        )
      } catch (inventoryError) {
        console.error('⚠️ Failed to track item deletion in inventory:', inventoryError)
        // Continue without failing the main operation
      }
    }

    return createSuccessResponse(
      { row: deletedRow },
      'Data row deleted successfully'
    )
  } catch (error) {
    return createErrorResponse(
      'Failed to delete data row',
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
}