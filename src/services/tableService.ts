import { TableRepository } from '@/repositories/tableRepository.js'
import { ZodCompatibleValidator } from '@/validators/zodCompatibleValidator.js'
import type { Bindings } from '../../types/bindings.js'
import type { UserContext } from '@/types/database.js'
import type { CreateTableRequest, UpdateTableRequest, TableMassAction, TableSchema, UserTable } from '@/types/dynamic-tables.js'
import type { Context } from 'hono'
import { getUserInfo, isUserAdmin, createErrorResponse, createSuccessResponse, buildPaginationInfo } from '@/utils/common.js'

/**
 * Table service - business logic for table operations
 */
export class TableService {
  private repository: TableRepository
  private validator: ZodCompatibleValidator

  constructor(env: Bindings) {
    this.repository = new TableRepository(env)
    this.validator = new ZodCompatibleValidator()
  }

  /**
   * List tables with filtering and pagination
   */
  async listTables(
    c: any,
    user: UserContext,
    query: {
      page?: number
      limit?: number
      sort?: string
      direction?: string
      filter_name?: string
      filter_description?: string
      filter_owner?: string
      filter_visibility?: string
      filter_created_at?: string
      filter_updated_at?: string
    }
  ) {
    try {
      const { userId, userEmail } = getUserInfo(c, user)

      const page = query.page || 1
      const limit = query.limit || 10
      const offset = (page - 1) * limit

      const filters: {
        name?: string
        description?: string
        owner?: string
        visibility?: string
        createdAt?: string
        updatedAt?: string
      } = {}

      if (query.filter_name !== undefined) filters.name = query.filter_name
      if (query.filter_description !== undefined) filters.description = query.filter_description
      if (query.filter_owner !== undefined) filters.owner = query.filter_owner
      if (query.filter_visibility !== undefined) filters.visibility = query.filter_visibility
      if (query.filter_created_at !== undefined) filters.createdAt = query.filter_created_at
      if (query.filter_updated_at !== undefined) filters.updatedAt = query.filter_updated_at

      const sort = {
        column: query.sort || 'updated_at',
        direction: query.direction || 'desc'
      }

      const { tables, totalCount } = await this.repository.findTables(
        userId,
        userEmail,
        filters,
        sort,
        { page, limit, offset }
      )

      const pagination = buildPaginationInfo(page, limit, totalCount)

      return createSuccessResponse({
        tables,
        pagination
      })
    } catch (error) {
      return createErrorResponse(
        'Failed to fetch tables',
        error instanceof Error ? error.message : 'Unknown error'
      )
    }
  }

  /**
   * Get specific table with columns
   */
  async getTable(c: any, user: UserContext, tableId: string) {
    try {
      const { userId } = getUserInfo(c, user)

      // Validate table ID
      const validation = this.validator.validateTableId(tableId)
      if (!validation.valid) {
        return createErrorResponse('Validation failed', validation.errors.join(', '), 400)
      }

      // Get table
      const table = await this.repository.findTableById(tableId, userId)
      if (!table) {
        return createErrorResponse(
          'Table not found',
          `Table with ID ${tableId} does not exist or you don't have access`,
          404
        )
      }

      // Get columns
      const columns = await this.repository.getTableColumns(tableId)

      const tableSchema: TableSchema = { table, columns }

      return createSuccessResponse({ table: tableSchema })
    } catch (error) {
      return createErrorResponse(
        'Failed to fetch table',
        error instanceof Error ? error.message : 'Unknown error'
      )
    }
  }

  /**
   * Create new table
   */
  async createTable(c: any, user: UserContext, data: CreateTableRequest) {
    try {
      // Validate request
      const validation = this.validator.validateCreateRequest(data)
      if (!validation.valid) {
        return createErrorResponse('Validation failed', validation.errors.join(', '), 400)
      }

      const { userId, userEmail } = getUserInfo(c, user)

      // Create table
      const tableSchema = await this.repository.createTable(data, userId, userEmail)

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

  /**
   * Update table
   */
  async updateTable(c: any, user: UserContext, tableId: string, data: UpdateTableRequest) {
    try {
      const { userId, userEmail } = getUserInfo(c, user)
      const isAdmin = isUserAdmin(user)

      console.log('🔍 TableService.updateTable Debug:')
      console.log('  - tableId:', tableId)
      console.log('  - data:', JSON.stringify(data, null, 2))
      console.log('  - dataType:', typeof data)
      console.log('  - dataKeys:', Object.keys(data || {}))
      console.log('  - data values:', Object.values(data || {}))
      console.log('  - is_public value:', data?.is_public)
      console.log('  - is_public type:', typeof data?.is_public)

      // Validate request
      const validation = this.validator.validateTableId(tableId)
      if (!validation.valid) {
        console.log('❌ Table ID validation failed:', validation.errors)
        return createErrorResponse('Validation failed', validation.errors.join(', '), 400)
      }

      const updateValidation = this.validator.validateUpdateTableRequest(data)
      if (!updateValidation.valid) {
        console.log('❌ Update validation failed:', {
          data,
          errors: updateValidation.errors
        })
        return createErrorResponse('Validation failed', updateValidation.errors.join(', '), 400)
      }

      console.log('✅ Validation passed, proceeding with update')

      // Check ownership
      const isOwner = await this.repository.checkTableOwnership(tableId, userEmail, userId)
      if (!isAdmin && !isOwner) {
        return createErrorResponse('Access denied', 'You can only edit tables you created', 403)
      }

      // Update table
      const tableSchema = await this.repository.updateTable(tableId, data)

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

  /**
   * Delete table
   */
  async deleteTable(c: any, user: UserContext, tableId: string) {
    try {
      const { userId, userEmail } = getUserInfo(c, user)
      const isAdmin = isUserAdmin(user)

      // Validate table ID
      const validation = this.validator.validateTableId(tableId)
      if (!validation.valid) {
        return createErrorResponse('Validation failed', validation.errors.join(', '), 400)
      }

      // Check ownership
      const isOwner = await this.repository.checkTableOwnership(tableId, userEmail, userId)
      if (!isAdmin && !isOwner) {
        return createErrorResponse('Access denied', 'You can only delete tables you created', 403)
      }

      // Delete table
      const deletedTable = await this.repository.deleteTable(tableId)

      return createSuccessResponse(
        { table: deletedTable },
        'Table deleted successfully'
      )
    } catch (error) {
      return createErrorResponse(
        'Failed to delete table',
        error instanceof Error ? error.message : 'Unknown error'
      )
    }
  }

  /**
   * Execute mass action on tables
   */
  async executeMassAction(c: any, user: UserContext, action: TableMassAction, ids: string[]) {
    try {
      const { userId, userEmail } = getUserInfo(c, user)
      const isAdmin = isUserAdmin(user)

      // Validate request
      const validation = this.validator.validateMassAction(action, ids)
      if (!validation.valid) {
        return createErrorResponse('Validation failed', validation.errors.join(', '), 400)
      }

      // Execute mass action
      const result = await this.repository.executeMassAction(action, ids, userEmail, userId, isAdmin)

      return createSuccessResponse(
        { count: result.count },
        `Successfully ${action.replace('_', ' ')}d ${result.count} table(s)`
      )
    } catch (error) {
      return createErrorResponse(
        'Failed to execute mass action',
        error instanceof Error ? error.message : 'Unknown error'
      )
    }
  }

  /**
   * Add column to table
   */
  async addColumn(c: any, user: UserContext, tableId: string, data: any) {
    try {
      const { userId, userEmail } = getUserInfo(c, user)
      const isAdmin = isUserAdmin(user)

      // Validate table ID
      const validation = this.validator.validateTableId(tableId)
      if (!validation.valid) {
        return createErrorResponse('Validation failed', validation.errors.join(', '), 400)
      }

      // Check ownership
      const isOwner = await this.repository.checkTableOwnership(tableId, userEmail, userId)
      if (!isAdmin && !isOwner) {
        return createErrorResponse('Access denied', 'You can only modify tables you created', 403)
      }

      // Validate column data
      if (!data.name || !data.type) {
        return createErrorResponse('Validation failed', 'Column name and type are required', 400)
      }

      // Add column
      const column = await this.repository.addColumn(tableId, {
        name: data.name,
        type: data.type,
        is_required: data.is_required === true || data.is_required === 'true',
        default_value: data.default_value,
        position: data.position
      })

      return createSuccessResponse(
        { column },
        'Column added successfully',
        201
      )
    } catch (error) {
      // Handle specific database constraint errors with human-readable messages
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase()

        // Check for UNIQUE constraint violation specifically for column names
        if (errorMessage.includes('unique constraint failed') && errorMessage.includes('table_columns.name')) {
          return createErrorResponse(
            'Column name already exists',
            `A column with the name "${data.name}" already exists in this table. Please choose a different name.`,
            409
          )
        }

        // Check for other UNIQUE constraint violations
        if (errorMessage.includes('unique constraint failed')) {
          return createErrorResponse(
            'Duplicate entry error',
            'This entry already exists. Please check your data and try again.',
            409
          )
        }
      }

      return createErrorResponse(
        'Failed to add column',
        error instanceof Error ? error.message : 'Unknown error'
      )
    }
  }

  /**
   * Update column in table
   */
  async updateColumn(c: any, user: UserContext, tableId: string, columnId: string, data: any) {
    try {
      const { userId, userEmail } = getUserInfo(c, user)
      const isAdmin = isUserAdmin(user)

      // Validate IDs
      const tableValidation = this.validator.validateTableId(tableId)
      const columnValidation = this.validator.validateTableId(columnId) // Reuse UUID validation
      if (!tableValidation.valid || !columnValidation.valid) {
        return createErrorResponse('Validation failed', 'Invalid table or column ID', 400)
      }

      // Check ownership
      const isOwner = await this.repository.checkTableOwnership(tableId, userEmail, userId)
      if (!isAdmin && !isOwner) {
        return createErrorResponse('Access denied', 'You can only modify tables you created', 403)
      }

      // Update column
      const column = await this.repository.updateColumn(tableId, columnId, {
        name: data.name,
        type: data.type,
        is_required: data.is_required,
        default_value: data.default_value,
        position: data.position
      })

      return createSuccessResponse(
        { column },
        'Column updated successfully'
      )
    } catch (error) {
      return createErrorResponse(
        'Failed to update column',
        error instanceof Error ? error.message : 'Unknown error'
      )
    }
  }

  /**
   * Delete column from table
   */
  async deleteColumn(c: any, user: UserContext, tableId: string, columnId: string) {
    try {
      const { userId, userEmail } = getUserInfo(c, user)
      const isAdmin = isUserAdmin(user)

      // Validate IDs
      const tableValidation = this.validator.validateTableId(tableId)
      const columnValidation = this.validator.validateTableId(columnId) // Reuse UUID validation
      if (!tableValidation.valid || !columnValidation.valid) {
        return createErrorResponse('Validation failed', 'Invalid table or column ID', 400)
      }

      // Check ownership
      const isOwner = await this.repository.checkTableOwnership(tableId, userEmail, userId)
      if (!isAdmin && !isOwner) {
        return createErrorResponse('Access denied', 'You can only modify tables you created', 403)
      }

      // Check if table would have at least one column remaining
      const columns = await this.repository.getTableColumns(tableId)
      if (columns.length <= 1) {
        return createErrorResponse('Validation failed', 'Cannot delete the last column - tables must have at least one column', 400)
      }

      // Delete column
      const column = await this.repository.deleteColumn(tableId, columnId)

      return createSuccessResponse(
        { column },
        'Column deleted successfully'
      )
    } catch (error) {
      return createErrorResponse(
        'Failed to delete column',
        error instanceof Error ? error.message : 'Unknown error'
      )
    }
  }

  /**
   * Execute mass action on columns
   */
  async executeColumnMassAction(
    c: any,
    user: UserContext,
    tableId: string,
    data: { action: string; columnIds: string[] }
  ) {
    try {
      const { userId, userEmail } = getUserInfo(c, user)
      const isAdmin = isUserAdmin(user)

      // Verify table ownership/access
      const table = await this.repository.findTableById(tableId, userId)
      if (!table) {
        return createErrorResponse('Table not found or access denied', 'Table not found or access denied', 404)
      }

      // For non-admin users, verify they own the table
      if (!isAdmin && !await this.repository.checkTableOwnership(tableId, userEmail, userId)) {
        return createErrorResponse('You do not have permission to modify this table', 'You do not have permission to modify this table', 403)
      }

      const { action, columnIds } = data

      if (!Array.isArray(columnIds) || columnIds.length === 0) {
        return createErrorResponse('No columns selected', 'No columns selected', 400)
      }

      let result: { count: number }

      switch (action) {
        case 'make_required':
          // Update columns to be required
          for (const columnId of columnIds) {
            await this.repository.updateColumn(tableId, columnId, { is_required: true })
          }
          result = { count: columnIds.length }
          break

        case 'make_optional':
          // Update columns to be optional
          for (const columnId of columnIds) {
            await this.repository.updateColumn(tableId, columnId, { is_required: false })
          }
          result = { count: columnIds.length }
          break

        case 'delete':
          // Delete columns
          for (const columnId of columnIds) {
            await this.repository.deleteColumn(tableId, columnId)
          }
          result = { count: columnIds.length }
          break

        default:
          return createErrorResponse('Invalid action', 'Invalid action', 400)
      }

      return createSuccessResponse(
        result,
        `Mass action "${action}" completed successfully on ${result.count} column(s)`
      )
    } catch (error) {
      return createErrorResponse(
        'Failed to execute mass action',
        error instanceof Error ? error.message : 'Unknown error'
      )
    }
  }
}
