import { TableDataRepository } from '@/repositories/tableDataRepository.js'
import { TableRepository } from '@/repositories/tableRepository.js'
import { ZodCompatibleValidator } from '@/validators/zodCompatibleValidator.js'
import type { Bindings } from '../../types/bindings.js'
import type { UserContext } from '@/types/database.js'
import type { AddTableDataRequest, UpdateTableDataRequest, TableDataMassAction, TableDataRow, UserTable, TableColumn } from '@/types/dynamic-tables.js'
import type { Context } from 'hono'
import { getUserInfo, createErrorResponse, createSuccessResponse, buildPaginationInfo } from '@/utils/common.js'

/**
 * Table data service - business logic for table data operations
 */
export class TableDataService {
  private repository: TableDataRepository
  private tableRepository: TableRepository
  private validator: ZodCompatibleValidator

  constructor(env: Bindings) {
    this.repository = new TableDataRepository(env)
    this.tableRepository = new TableRepository(env)
    this.validator = new ZodCompatibleValidator()
  }

  /**
   * List table data with filtering and pagination
   */
  async listTableData(
    c: any,
    user: UserContext,
    tableId: string,
    query: {
      page?: number
      limit?: number
    }
  ) {
    try {
      const { userId } = getUserInfo(c, user)

      // Validate table ID
      const idValidation = this.validator.validateIds(tableId)
      if (!idValidation.valid) {
        return createErrorResponse('Validation failed', idValidation.errors.join(', '), 400)
      }

      // Check table access
      const hasAccess = await this.repository.checkTableAccess(tableId, userId)
      if (!hasAccess) {
        return createErrorResponse(
          'Table not found',
          `Table with ID ${tableId} does not exist or you don't have access`,
          404
        )
      }

      const page = query.page || 1
      const limit = query.limit || 10
      const offset = (page - 1) * limit

      // Extract filters from query parameters
      const queryParams = new URL(c.req.url).searchParams
      const filters = this.validator.extractFilters(queryParams)

      // Get table data
      const { data, totalCount } = await this.repository.findTableData(
        tableId,
        filters,
        { page, limit, offset }
      )

      // Get table and columns for metadata
      const tableColumns = await this.repository.getTableColumns(tableId)
      const tableInfo = await this.tableRepository.findTableById(tableId, userId)

      if (!tableInfo) {
        return createErrorResponse(
          'Table not found',
          `Table with ID ${tableId} does not exist or you don't have access`,
          404
        )
      }

      const pagination = buildPaginationInfo(page, limit, totalCount)

      return createSuccessResponse({
        data,
        pagination,
        _meta: {
          table: tableInfo,
          columns: tableColumns
        }
      })
    } catch (error) {
      return createErrorResponse(
        'Failed to fetch table data',
        error instanceof Error ? error.message : 'Unknown error'
      )
    }
  }

  /**
   * Get specific data row
   */
  async getDataRow(c: any, user: UserContext, tableId: string, rowId: string) {
    try {
      const { userId } = getUserInfo(c, user)

      // Validate IDs
      const idValidation = this.validator.validateIds(tableId, rowId)
      if (!idValidation.valid) {
        return createErrorResponse('Validation failed', idValidation.errors.join(', '), 400)
      }

      // Check table access
      const hasAccess = await this.repository.checkTableAccess(tableId, userId)
      if (!hasAccess) {
        return createErrorResponse(
          'Table not found',
          `Table with ID ${tableId} does not exist or you don't have access`,
          404
        )
      }

      // Get data row
      const dataRow = await this.repository.findDataRowById(rowId, tableId)
      if (!dataRow) {
        return createErrorResponse(
          'Row not found',
          `Row with ID ${rowId} does not exist in this table`,
          404
        )
      }

      return createSuccessResponse({ row: dataRow })
    } catch (error) {
      return createErrorResponse(
        'Failed to fetch data row',
        error instanceof Error ? error.message : 'Unknown error'
      )
    }
  }

  /**
   * Create data row
   */
  async createDataRow(c: any, user: UserContext, tableId: string, data: AddTableDataRequest) {
    try {
      const { userId } = getUserInfo(c, user)
      const userEmail = `token:${user.id}`

      // Validate request
      const requestValidation = this.validator.validateAddRequest(data)
      if (!requestValidation.valid) {
        return createErrorResponse('Validation failed', requestValidation.errors.join(', '), 400)
      }

      // Validate table ID
      const idValidation = this.validator.validateIds(tableId)
      if (!idValidation.valid) {
        return createErrorResponse('Validation failed', idValidation.errors.join(', '), 400)
      }

      // Check table access
      const hasAccess = await this.repository.checkTableAccess(tableId, userId)
      if (!hasAccess) {
        return createErrorResponse(
          'Table not found',
          `Table with ID ${tableId} does not exist or you don't have access`,
          404
        )
      }

      // Get table columns for validation
      const tableColumns = await this.repository.getTableColumns(tableId)

      // Validate data against schema
      const dataValidation = await this.validator.validateTableData(tableColumns, data.data)
      if (!dataValidation.valid) {
        return createErrorResponse(
          'Validation failed',
          'Data validation errors',
          400,
          dataValidation.errors
        )
      }

      // Create data row
      const createdRow = await this.repository.createDataRow(
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

  /**
   * Update data row
   */
  async updateDataRow(c: any, user: UserContext, tableId: string, rowId: string, data: UpdateTableDataRequest) {
    try {
      const { userId } = getUserInfo(c, user)

      // Validate request
      const requestValidation = this.validator.validateUpdateRequest(data)
      if (!requestValidation.valid) {
        return createErrorResponse('Validation failed', requestValidation.errors.join(', '), 400)
      }

      // Validate IDs
      const idValidation = this.validator.validateIds(tableId, rowId)
      if (!idValidation.valid) {
        return createErrorResponse('Validation failed', idValidation.errors.join(', '), 400)
      }

      // Check table access
      const hasAccess = await this.repository.checkTableAccess(tableId, userId)
      if (!hasAccess) {
        return createErrorResponse(
          'Table not found',
          `Table with ID ${tableId} does not exist or you don't have access`,
          404
        )
      }

      // Check if row exists
      const existingRow = await this.repository.findDataRowById(rowId, tableId)
      if (!existingRow) {
        return createErrorResponse(
          'Row not found',
          `Row with ID ${rowId} does not exist in this table`,
          404
        )
      }

      // Get table columns for validation
      const tableColumns = await this.repository.getTableColumns(tableId)

      // Validate data against schema
      const dataValidation = await this.validator.validateTableData(tableColumns, data.data)
      if (!dataValidation.valid) {
        return createErrorResponse(
          'Validation failed',
          'Data validation errors',
          400,
          dataValidation.errors
        )
      }

      // Update data row
      const updatedRow = await this.repository.updateDataRow(
        rowId,
        tableId,
        dataValidation.validatedData!
      )

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

  /**
   * Delete data row
   */
  async deleteDataRow(c: any, user: UserContext, tableId: string, rowId: string) {
    try {
      const { userId } = getUserInfo(c, user)

      // Validate IDs
      const idValidation = this.validator.validateIds(tableId, rowId)
      if (!idValidation.valid) {
        return createErrorResponse('Validation failed', idValidation.errors.join(', '), 400)
      }

      // Check table access
      const hasAccess = await this.repository.checkTableAccess(tableId, userId)
      if (!hasAccess) {
        return createErrorResponse(
          'Table not found',
          `Table with ID ${tableId} does not exist or you don't have access`,
          404
        )
      }

      // Delete data row
      const deletedRow = await this.repository.deleteDataRow(rowId, tableId)

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

  /**
   * Execute mass action on table data
   */
  async executeMassAction(c: any, user: UserContext, tableId: string, action: TableDataMassAction, ids: string[]) {
    try {
      const { userId } = getUserInfo(c, user)

      // Validate request
      const validation = this.validator.validateMassAction(action, ids)
      if (!validation.valid) {
        return createErrorResponse('Validation failed', validation.errors.join(', '), 400)
      }

      // Validate table ID
      const idValidation = this.validator.validateIds(tableId)
      if (!idValidation.valid) {
        return createErrorResponse('Validation failed', idValidation.errors.join(', '), 400)
      }

      // Check table access
      const hasAccess = await this.repository.checkTableAccess(tableId, userId)
      if (!hasAccess) {
        return createErrorResponse(
          'Table not found',
          `Table with ID ${tableId} does not exist or you don't have access`,
          404
        )
      }

      // Execute mass action
      const result = await this.repository.executeMassAction(tableId, action, ids)

      const response: any = {
        message: `Successfully ${action}d ${result.count} row(s)`,
        count: result.count
      }

      // Note: Export functionality can be added later if needed

      return createSuccessResponse(response)
    } catch (error) {
      return createErrorResponse(
        'Failed to execute mass action',
        error instanceof Error ? error.message : 'Unknown error'
      )
    }
  }
}
