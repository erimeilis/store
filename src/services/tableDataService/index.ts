/**
 * Table Data Service
 * Business logic for table data operations
 * Main entry point that delegates to specialized functions
 */

import { TableDataRepository } from '@/repositories/tableDataRepository.js'
import { TableRepository } from '@/repositories/tableRepository.js'
import { ZodCompatibleValidator } from '@/validators/zodCompatibleValidator.js'
import type { Bindings } from '@/types/bindings.js'
import type { UserContext } from '@/types/database.js'
import type { AddTableDataRequest, UpdateTableDataRequest, TableDataMassAction } from '@/types/dynamic-tables.js'
import type { Context } from 'hono'

// Import individual functions
import { listTableData } from './listTableData.js'
import { getDataRow } from './getDataRow.js'
import { createDataRow } from './createDataRow.js'
import { updateDataRow } from './updateDataRow.js'
import { deleteDataRow } from './deleteDataRow.js'
import { executeMassAction } from './executeMassAction.js'

/**
 * Table data service class that maintains the same interface
 * while delegating to specialized functions
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
    c: Context,
    user: UserContext,
    tableId: string,
    query: {
      page?: number
      limit?: number
    }
  ) {
    return listTableData(
      this.repository,
      this.tableRepository,
      this.validator,
      c,
      user,
      tableId,
      query
    )
  }

  /**
   * Get specific data row
   */
  async getDataRow(c: Context, user: UserContext, tableId: string, rowId: string) {
    return getDataRow(this.repository, this.validator, c, user, tableId, rowId)
  }

  /**
   * Create data row
   */
  async createDataRow(c: Context, user: UserContext, tableId: string, data: AddTableDataRequest) {
    return createDataRow(this.repository, this.validator, c, user, tableId, data)
  }

  /**
   * Update data row
   */
  async updateDataRow(c: Context, user: UserContext, tableId: string, rowId: string, data: UpdateTableDataRequest) {
    return updateDataRow(this.repository, this.validator, c, user, tableId, rowId, data)
  }

  /**
   * Delete data row
   */
  async deleteDataRow(c: Context, user: UserContext, tableId: string, rowId: string) {
    return deleteDataRow(this.repository, this.validator, c, user, tableId, rowId)
  }

  /**
   * Execute mass action on table data
   */
  async executeMassAction(c: Context, user: UserContext, tableId: string, action: TableDataMassAction, ids: string[]) {
    return executeMassAction(this.repository, this.validator, c, user, tableId, action, ids)
  }
}

// Re-export individual functions for direct use if needed
export { listTableData } from './listTableData.js'
export { getDataRow } from './getDataRow.js'
export { createDataRow } from './createDataRow.js'
export { updateDataRow } from './updateDataRow.js'
export { deleteDataRow } from './deleteDataRow.js'
export { executeMassAction } from './executeMassAction.js'