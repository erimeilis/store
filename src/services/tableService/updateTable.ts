import type { Context } from 'hono'
import type { UserContext } from '@/types/database.js'
import type { UpdateTableRequest } from '@/types/dynamic-tables.js'
import type { TableRepository } from '@/repositories/tableRepository.js'
import type { ZodCompatibleValidator } from '@/validators/zodCompatibleValidator.js'
import { getUserInfo, isUserAdmin, createErrorResponse, createSuccessResponse } from '@/utils/common.js'

/**
 * Update table
 */
export async function updateTable(
  repository: TableRepository,
  validator: ZodCompatibleValidator,
  c: Context,
  user: UserContext,
  tableId: string,
  data: UpdateTableRequest
) {
  try {
    const { userId, userEmail } = getUserInfo(c, user)
    const isAdmin = isUserAdmin(user)

    console.log('🔍 TableService.updateTable Debug:')
    console.log('  - tableId:', tableId)
    console.log('  - data:', JSON.stringify(data, null, 2))
    console.log('  - dataType:', typeof data)
    console.log('  - dataKeys:', Object.keys(data || {}))
    console.log('  - data values:', Object.values(data || {}))
    console.log('  - visibility value:', data?.visibility)
    console.log('  - visibility type:', typeof data?.visibility)

    // Validate request
    const validation = validator.validateTableId(tableId)
    if (!validation.valid) {
      console.log('❌ Table ID validation failed:', validation.errors)
      return createErrorResponse('Validation failed', validation.errors.join(', '), 400)
    }

    const updateValidation = validator.validateUpdateTableRequest(data)
    if (!updateValidation.valid) {
      console.log('❌ Update validation failed:', {
        data,
        errors: updateValidation.errors
      })
      return createErrorResponse('Validation failed', updateValidation.errors.join(', '), 400)
    }

    console.log('✅ Validation passed, proceeding with update')

    // Check ownership
    const isOwner = await repository.checkTableOwnership(tableId, userEmail, userId)
    if (!isAdmin && !isOwner) {
      return createErrorResponse('Access denied', 'You can only edit tables you created', 403)
    }

    // Get current table state to check for sale mode conversion
    const currentTable = await repository.findTableByIdInternal(tableId)
    if (!currentTable) {
      return createErrorResponse('Table not found', 'Table does not exist', 404)
    }

    // Handle conversion to "for sale" mode - validate columns exist with correct settings
    if (data.forSale === true && !currentTable.forSale) {
      console.log('🔄 Validating conversion to "for sale" mode')

      // Check if price and qty columns exist with correct settings
      const columns = await repository.getTableColumns(tableId)
      const priceColumn = columns.find(col => col.name === 'price')
      const qtyColumn = columns.find(col => col.name === 'qty')

      const missingColumns: string[] = []
      const invalidColumns: string[] = []

      // Validate price column
      if (!priceColumn) {
        missingColumns.push('price')
      } else {
        if (priceColumn.type !== 'number') {
          invalidColumns.push(`price (must be type "number", got "${priceColumn.type}")`)
        }
        if (!priceColumn.isRequired) {
          invalidColumns.push('price (must be required)')
        }
      }

      // Validate qty column
      if (!qtyColumn) {
        missingColumns.push('qty')
      } else {
        if (qtyColumn.type !== 'number') {
          invalidColumns.push(`qty (must be type "number", got "${qtyColumn.type}")`)
        }
        if (!qtyColumn.isRequired) {
          invalidColumns.push('qty (must be required)')
        }
      }

      // Return error if columns are missing or invalid
      if (missingColumns.length > 0 || invalidColumns.length > 0) {
        const errors: string[] = []
        if (missingColumns.length > 0) {
          errors.push(`Missing required columns: ${missingColumns.join(', ')}`)
        }
        if (invalidColumns.length > 0) {
          errors.push(`Invalid column configuration: ${invalidColumns.join(', ')}`)
        }
        return createErrorResponse(
          'Cannot mark table as "for sale"',
          `Tables marked for sale require "price" and "qty" columns with type "number" and required=true. ${errors.join('. ')}. Please add or fix these columns before enabling "for sale" mode.`,
          400
        )
      }

      console.log('✅ Sale columns validated successfully')
    }

    // Update table
    const tableSchema = await repository.updateTable(tableId, data)

    return createSuccessResponse(
      { table: tableSchema },
      'Table updated successfully'
    )
  } catch (error) {
    if (error instanceof SyntaxError) {
      return createErrorResponse('Invalid JSON', 'Request body must be valid JSON', 400)
    }

    return createErrorResponse(
      'Failed to update table',
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
}