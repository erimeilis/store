/**
 * Update data row
 */

import type { Context } from 'hono'
import type { UserContext } from '@/types/database.js'
import type { UpdateTableDataRequest } from '@/types/dynamic-tables.js'
import type { TableDataRepository } from '@/repositories/tableDataRepository.js'
import type { ZodCompatibleValidator } from '@/validators/zodCompatibleValidator.js'
import { getUserInfo, createErrorResponse, createSuccessResponse } from '@/utils/common.js'
import { applyDefaultValues } from '@/utils/applyDefaultValues.js'
import { validateDuplicates } from '@/utils/validateDuplicates.js'
import { InventoryTrackingService } from '@/services/inventoryTrackingService/index.js'

export async function updateDataRow(
  repository: TableDataRepository,
  validator: ZodCompatibleValidator,
  c: Context,
  user: UserContext,
  tableId: string,
  rowId: string,
  data: UpdateTableDataRequest
) {
  try {
    const { userId } = getUserInfo(c, user)

    // Validate request
    const requestValidation = validator.validateUpdateRequest(data)
    if (!requestValidation.valid) {
      return createErrorResponse('Validation failed', requestValidation.errors.join(', '), 400)
    }

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

    // Check if row exists
    const existingRow = await repository.findDataRowById(rowId, tableId)
    if (!existingRow) {
      return createErrorResponse(
        'Row not found',
        `Row with ID ${rowId} does not exist in this table`,
        404
      )
    }

    // Get table columns for validation
    const tableColumns = await repository.getTableColumns(tableId)

    // Get table info to check for_sale status
    const tableInfo = await repository.getTableInfo(tableId)

    // Apply default values from column definitions
    const processedData = applyDefaultValues(data.data, tableColumns)

    // Check for duplicate values in columns that don't allow duplicates
    const duplicateValidation = await validateDuplicates(
      tableId,
      tableColumns,
      processedData,
      repository,
      rowId // Exclude the current row from duplicate check
    )

    if (!duplicateValidation.valid) {
      console.log('🔍 Update Data Row - DUPLICATE VALIDATION FAILED:', duplicateValidation.errors)
      return createErrorResponse(
        'Duplicate value not allowed',
        duplicateValidation.errors.join('. '),
        400,
        duplicateValidation.errors
      )
    }

    // Validate data against schema
    const dataValidation = await validator.validateTableData(tableColumns, processedData)
    if (!dataValidation.valid) {
      return createErrorResponse(
        'Validation failed',
        'Data validation errors',
        400,
        dataValidation.errors
      )
    }

    // Update data row
    const updatedRow = await repository.updateDataRow(
      rowId,
      tableId,
      dataValidation.validatedData!
    )

    // Track inventory for for_sale tables
    if (tableInfo?.forSale) {
      try {
        const inventoryService = new InventoryTrackingService(c.env.DB)
        await inventoryService.trackItemUpdate(
          tableId,
          tableInfo.name,
          rowId,
          existingRow.data,
          updatedRow.data,
          getUserInfo(c, user).userEmail
        )
      } catch (inventoryError) {
        console.error('⚠️ Failed to track item update in inventory:', inventoryError)
        // Continue without failing the main operation
      }
    }

    return createSuccessResponse(
      { row: updatedRow },
      'Data row updated successfully'
    )
  } catch (error) {
    if (error instanceof SyntaxError) {
      return createErrorResponse('Invalid JSON', 'Request body must be valid JSON', 400)
    }

    return createErrorResponse(
      'Failed to update data row',
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
}