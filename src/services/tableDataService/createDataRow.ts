/**
 * Create data row
 */

import type { Context } from 'hono'
import type { UserContext } from '@/types/database.js'
import type { AddTableDataRequest } from '@/types/dynamic-tables.js'
import type { TableDataRepository } from '@/repositories/tableDataRepository.js'
import type { ZodCompatibleValidator } from '@/validators/zodCompatibleValidator.js'
import { getUserInfo, createErrorResponse, createSuccessResponse } from '@/utils/common.js'
import { applyDefaultValues } from '@/utils/applyDefaultValues.js'
import { validateDuplicates } from '@/utils/validateDuplicates.js'
import { InventoryTrackingService } from '@/services/inventoryTrackingService/index.js'

export async function createDataRow(
  repository: TableDataRepository,
  validator: ZodCompatibleValidator,
  c: Context,
  user: UserContext,
  tableId: string,
  data: AddTableDataRequest
) {
  try {
    const { userId } = getUserInfo(c, user)
    const userEmail = `token:${user.id}`

    // Validate request
    const requestValidation = validator.validateAddRequest(data)
    if (!requestValidation.valid) {
      return createErrorResponse('Validation failed', requestValidation.errors.join(', '), 400)
    }

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
      repository
    )

    if (!duplicateValidation.valid) {
      console.log('🔍 Create Data Row - DUPLICATE VALIDATION FAILED:', duplicateValidation.errors)
      return createErrorResponse(
        'Duplicate value not allowed',
        duplicateValidation.errors.join('. '),
        400,
        duplicateValidation.errors
      )
    }

    // Validate data against schema
    const dataValidation = await validator.validateTableData(tableColumns, processedData)
    console.log('🔍 Create Data Row - Validation result:', JSON.stringify({
      valid: dataValidation.valid,
      errors: dataValidation.errors,
      validatedData: dataValidation.validatedData
    }, null, 2))

    if (!dataValidation.valid) {
      console.log('🔍 Create Data Row - VALIDATION FAILED:', dataValidation.errors)
      return createErrorResponse(
        'Validation failed',
        'Data validation errors',
        400,
        dataValidation.errors
      )
    }

    // Create data row
    const createdRow = await repository.createDataRow(
      tableId,
      dataValidation.validatedData!,
      userEmail
    )

    // Track inventory for for_sale tables
    if (tableInfo?.forSale) {
      try {
        const inventoryService = new InventoryTrackingService(c.env.DB)
        await inventoryService.trackItemCreation(
          tableId,
          tableInfo.name,
          createdRow.id,
          createdRow.data,
          userEmail
        )
      } catch (inventoryError) {
        console.error('⚠️ Failed to track item creation in inventory:', inventoryError)
        // Continue without failing the main operation
      }
    }

    return createSuccessResponse(
      { row: createdRow },
      'Data row created successfully',
      201
    )
  } catch (error) {
    if (error instanceof SyntaxError) {
      return createErrorResponse('Invalid JSON', 'Request body must be valid JSON', 400)
    }

    return createErrorResponse(
      'Failed to create data row',
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
}