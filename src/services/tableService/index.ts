import { TableRepository } from '@/repositories/tableRepository.js'
import { ZodCompatibleValidator } from '@/validators/zodCompatibleValidator.js'
import type { Bindings } from '@/types/bindings.js'
import type { UserContext } from '@/types/database.js'
import type { CreateTableRequest, UpdateTableRequest, TableMassAction } from '@/types/dynamic-tables.js'
import type { ListTablesQuery, ImportTableDataRequest, AddColumnRequest, UpdateColumnRequest } from '@/types/table-queries.js'
import type { Context } from 'hono'

// Import all the functions
import { listTables } from './listTables.js'
import { getTable } from './getTable.js'
import { createTable } from './createTable.js'
import { updateTable } from './updateTable.js'
import { deleteTable } from './deleteTable.js'
import { executeMassAction } from './executeMassAction.js'
import { importTableData } from './importTableData.js'
import { getTableColumns } from './getTableColumns.js'
import { getColumn } from './getColumn.js'
import { addColumn } from './addColumn.js'
import { updateColumn } from './updateColumn.js'
import { deleteColumn } from './deleteColumn.js'
import { executeColumnMassAction } from './executeColumnMassAction.js'
import { recountPositions } from './recountPositions.js'
import { swapColumnPositions } from './swapColumnPositions.js'

/**
 * Refactored Table service - delegates to individual function modules
 * This class serves as a facade that maintains the same interface while
 * delegating all operations to focused, single-purpose functions.
 */
export class TableService {
  private repository: TableRepository
  private validator: ZodCompatibleValidator

  constructor(env: Bindings) {
    this.repository = new TableRepository(env)
    this.validator = new ZodCompatibleValidator()
  }

  // Core table operations
  async listTables(c: Context, user: UserContext, query: ListTablesQuery) {
    return listTables(this.repository, c, user, query)
  }

  async getTable(c: Context, user: UserContext, tableId: string) {
    return getTable(this.repository, this.validator, c, user, tableId)
  }

  async createTable(c: Context, user: UserContext, data: CreateTableRequest) {
    return createTable(this.repository, this.validator, c, user, data)
  }

  async updateTable(c: Context, user: UserContext, tableId: string, data: UpdateTableRequest) {
    return updateTable(this.repository, this.validator, c, user, tableId, data)
  }

  async deleteTable(c: Context, user: UserContext, tableId: string) {
    return deleteTable(this.repository, this.validator, c, user, tableId)
  }

  async executeMassAction(c: Context, user: UserContext, action: TableMassAction, ids: string[]) {
    return executeMassAction(this.repository, this.validator, c, user, action, ids)
  }

  // Data operations
  async importTableData(c: Context, user: UserContext, tableId: string, data: ImportTableDataRequest) {
    return importTableData(this.repository, c, user, tableId, data)
  }

  // Column operations
  async getTableColumns(c: Context, user: UserContext, tableId: string) {
    return getTableColumns(this.repository, c, user, tableId)
  }

  async getColumn(c: Context, user: UserContext, tableId: string, columnId: string) {
    return getColumn(this.repository, c, user, tableId, columnId)
  }

  async addColumn(c: Context, user: UserContext, tableId: string, data: AddColumnRequest) {
    return addColumn(this.repository, this.validator, c, user, tableId, data)
  }

  async updateColumn(c: Context, user: UserContext, tableId: string, columnId: string, data: UpdateColumnRequest) {
    return updateColumn(this.repository, this.validator, c, user, tableId, columnId, data)
  }

  async deleteColumn(c: Context, user: UserContext, tableId: string, columnId: string) {
    return deleteColumn(this.repository, this.validator, c, user, tableId, columnId)
  }

  async executeColumnMassAction(c: Context, user: UserContext, tableId: string, action: string, ids: string[]) {
    return executeColumnMassAction(this.repository, this.validator, c, user, tableId, action, ids)
  }

  async recountPositions(c: Context, user: UserContext, tableId: string) {
    return recountPositions(this.repository, this.validator, c, user, tableId)
  }

  async swapColumnPositions(c: Context, user: UserContext, tableId: string, columnId1: string, columnId2: string) {
    return swapColumnPositions(this.repository, this.validator, c, user, tableId, columnId1, columnId2)
  }
}