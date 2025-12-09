import type { Context } from 'hono'
import type { UserContext } from '@/types/database.js'
import type { CreateTableRequest } from '@/types/dynamic-tables.js'
import type { TableRepository } from '@/repositories/tableRepository.js'
import type { ZodCompatibleValidator } from '@/validators/zodCompatibleValidator.js'
import { getUserInfo, createErrorResponse, createSuccessResponse } from '@/utils/common.js'
import { DEFAULT_SALE_COLUMNS, DEFAULT_RENT_COLUMNS, TableType, getDefaultColumns, hasSpecialColumns } from '@/types/dynamic-tables.js'
import { InventoryTrackingService } from '@/services/inventoryTrackingService/index.js'
import { ModuleRepository } from '@/repositories/moduleRepository.js'

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
    // Get module column types for validation
    const moduleRepo = new ModuleRepository(c.env)
    const moduleColumnTypes = await moduleRepo.getAllColumnTypeIds()

    // Validate request with module column types
    const validation = validator.validateCreateRequestWithModuleTypes(data, moduleColumnTypes)
    if (!validation.valid) {
      return createErrorResponse('Validation failed', validation.errors.join(', '), 400)
    }

    // Validate that all module column types are properly configured
    // This prevents creating tables with columns that reference unconfigured modules
    const moduleColumnTypeIds = data.columns
      .map(col => col.type)
      .filter(type => type.includes(':'))

    if (moduleColumnTypeIds.length > 0) {
      const configValidationResults = await moduleRepo.validateColumnTypeConfigurations(moduleColumnTypeIds)

      const configErrors: string[] = []
      for (const [typeId, result] of configValidationResults) {
        if (!result.valid && result.error) {
          configErrors.push(result.error)
        }
      }

      if (configErrors.length > 0) {
        return createErrorResponse(
          'Module configuration error',
          configErrors.join('; '),
          400
        )
      }
    }

    const { userId, userEmail } = getUserInfo(c, user)

    // Handle legacy forSale field - convert to tableType
    if (data.forSale !== undefined && data.tableType === undefined) {
      console.log('⚠️ Using deprecated forSale field - please use tableType instead')
      ;(data as any).tableType = data.forSale ? 'sale' : 'default'
    }

    const tableType = (data.tableType || 'default') as TableType

    // If table has a special type, automatically add required columns if not present
    if (hasSpecialColumns(tableType)) {
      const defaultColumns = getDefaultColumns(tableType)
      const maxPosition = Math.max(...data.columns.map(col => col.position || 0))
      let nextPosition = maxPosition + 10

      // Add missing type-specific columns
      for (const defaultCol of defaultColumns) {
        const exists = data.columns.find(col => col.name === defaultCol.name)
        if (!exists) {
          data.columns.push({
            ...defaultCol,
            position: nextPosition
          })
          nextPosition += 10
        }
      }
    }

    // Create table
    const tableSchema = await repository.createTable(data, userId, userEmail)

    // Track inventory for 'sale' type tables
    if (tableType === 'sale') {
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