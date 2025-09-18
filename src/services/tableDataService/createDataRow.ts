/**
 * Create data row
 */

import type { Context } from 'hono'
import type { UserContext } from '@/types/database.js'
import type { AddTableDataRequest } from '@/types/dynamic-tables.js'
import type { TableDataRepository } from '@/repositories/tableDataRepository.js'
import type { ZodCompatibleValidator } from '@/validators/zodCompatibleValidator.js'
import { getUserInfo, createErrorResponse, createSuccessResponse } from '@/utils/common.js'

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

    // Apply default values for "for sale" tables
    let processedData = { ...data.data }
    if (tableInfo?.for_sale) {
      // Set default price to 0 if not provided
      if (processedData.price === undefined || processedData.price === null || processedData.price === '') {
        processedData.price = 0
      }

      // Set default qty to 1 if not provided
      if (processedData.qty === undefined || processedData.qty === null || processedData.qty === '') {
        processedData.qty = 1
      }
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

    // Create data row
    const createdRow = await repository.createDataRow(
      tableId,
      dataValidation.validatedData!,
      userEmail
    )

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