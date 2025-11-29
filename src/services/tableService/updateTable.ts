import type { Context } from 'hono'
import type { UserContext } from '@/types/database.js'
import type { UpdateTableRequest, TableType, hasSpecialColumns, getProtectedColumns } from '@/types/dynamic-tables.js'
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

    // Handle conversion to special table types - validate columns exist or auto-create them
    const newTableType = data.tableType as TableType | undefined
    if (newTableType && newTableType !== 'default' && newTableType !== currentTable.tableType) {
      console.log(`🔄 Converting table to "${newTableType}" type`)

      // Check if required columns exist for the new table type
      const columnsExist = await repository.checkTypeColumnsExist(tableId, newTableType)

      if (!columnsExist) {
        // Auto-create missing columns for the table type
        console.log(`📦 Creating missing columns for "${newTableType}" type`)
        await repository.createMissingTypeColumns(tableId, newTableType)
      }

      console.log(`✅ Table type "${newTableType}" columns validated/created successfully`)
    }

    // Legacy support: Handle forSale boolean for backward compatibility
    if (data.forSale !== undefined && data.tableType === undefined) {
      console.log('⚠️ Using deprecated forSale field - please use tableType instead')
      // Convert forSale to tableType
      ;(data as any).tableType = data.forSale ? 'sale' : 'default'
      delete data.forSale
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