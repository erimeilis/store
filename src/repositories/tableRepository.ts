import { getPrismaClient } from '@/lib/database.js'
import type { Bindings } from '@/types/bindings.js'
import type { UserTable, TableColumn, TableSchema, CreateTableRequest, UpdateTableRequest, TableMassAction } from '@/types/dynamic-tables.js'
import { Prisma, type PrismaClient } from '@prisma/client'
import { sanitizeForSQL, validateSortColumn, validateSortDirection } from '@/utils/common.js'

/**
 * Repository for table operations
 */
export class TableRepository {
  private prisma: PrismaClient

  constructor(env: Bindings) {
    this.prisma = getPrismaClient(env)
  }

  /**
   * Find tables accessible to user with filtering and pagination
   */
  async findTables(
    userId: string,
    userEmail: string,
    filters: {
      name?: string
      description?: string
      owner?: string
      visibility?: string
      createdAt?: string
      updatedAt?: string
    },
    sort: { column: string; direction: string },
    pagination: { page: number; limit: number; offset: number }
  ): Promise<{ tables: UserTable[]; totalCount: number }> {
    const allowedSortColumns = ['name', 'description', 'created_by', 'is_public', 'for_sale', 'created_at', 'updated_at']
    const safeSortColumn = validateSortColumn(sort.column, allowedSortColumns)
    const safeSortDirection = validateSortDirection(sort.direction)

    // Build WHERE conditions
    let additionalFilters = ''

    if (filters.name) {
      additionalFilters += ` AND ut.name LIKE '%${sanitizeForSQL(filters.name)}%'`
    }

    if (filters.description) {
      additionalFilters += ` AND ut.description LIKE '%${sanitizeForSQL(filters.description)}%'`
    }

    if (filters.owner) {
      additionalFilters += ` AND (
        ut.created_by LIKE '%${sanitizeForSQL(filters.owner)}%' OR
        (ut.created_by = 'user:${userId}' AND '${userEmail}' NOT LIKE 'token:%' AND '${userEmail}' LIKE '%${sanitizeForSQL(filters.owner)}%')
      )`
    }

    if (filters.visibility === 'true' || filters.visibility === 'Public') {
      additionalFilters += ` AND ut.is_public = 1`
    } else if (filters.visibility === 'false' || filters.visibility === 'Private') {
      additionalFilters += ` AND ut.is_public = 0`
    }

    if (filters.createdAt) {
      additionalFilters += ` AND DATE(ut.created_at) = '${sanitizeForSQL(filters.createdAt)}'`
    }

    if (filters.updatedAt) {
      additionalFilters += ` AND DATE(ut.updated_at) = '${sanitizeForSQL(filters.updatedAt)}'`
    }

    // Get tables
    const tables = await this.prisma.$queryRaw<UserTable[]>`
      SELECT
        ut.id,
        ut.name,
        ut.description,
        ut.created_by,
        ut.is_public,
        ut.for_sale,
        ut.created_at,
        ut.updated_at,
        CASE
          WHEN ut.created_by = ${`user:${userId}`} AND ${userEmail} NOT LIKE 'token:%' THEN ${userEmail}
          WHEN ut.created_by LIKE 'token:%' THEN SUBSTR(ut.created_by, 7)
          WHEN ut.created_by LIKE 'user:%' THEN SUBSTR(ut.created_by, 6)
          ELSE ut.created_by
        END as owner_display_name
      FROM user_tables ut
      WHERE (ut.user_id = ${userId} OR ut.is_public = true) ${Prisma.raw(additionalFilters)}
      ORDER BY ut.${Prisma.raw(safeSortColumn)} ${Prisma.raw(safeSortDirection)}
      LIMIT ${pagination.limit} OFFSET ${pagination.offset}
    `

    // Get total count
    const [countResult] = await this.prisma.$queryRaw<[{ count: number }]>`
      SELECT COUNT(*) as count FROM user_tables ut
      WHERE (ut.user_id = ${userId} OR ut.is_public = true) ${Prisma.raw(additionalFilters)}
    `

    return { tables, totalCount: countResult.count }
  }

  /**
   * Find table by ID with access check
   */
  async findTableById(tableId: string, userId: string): Promise<UserTable | null> {
    const [table] = await this.prisma.$queryRaw<UserTable[]>`
      SELECT id, name, description, created_by, user_id, is_public, for_sale, created_at, updated_at
      FROM user_tables
      WHERE id = ${tableId} AND (user_id = ${userId} OR is_public = true)
    `
    return table || null
  }

  /**
   * Find table by ID without access check (for internal use)
   */
  async findTableByIdInternal(tableId: string): Promise<UserTable | null> {
    const [table] = await this.prisma.$queryRaw<UserTable[]>`
      SELECT id, name, description, created_by, user_id, is_public, for_sale, created_at, updated_at
      FROM user_tables
      WHERE id = ${tableId}
    `
    return table || null
  }

  /**
   * Get table columns
   */
  async getTableColumns(tableId: string): Promise<TableColumn[]> {
    const columns = await this.prisma.$queryRaw<any[]>`
      SELECT id, table_id, name, type, is_required, default_value, position, created_at
      FROM table_columns
      WHERE table_id = ${tableId}
      ORDER BY position ASC
    `

    // Convert SQLite integers/strings to proper booleans
    return columns.map(column => ({
      ...column,
      is_required: column.is_required === true || column.is_required === 1 || column.is_required === '1' || column.is_required === 'true'
    })) as TableColumn[]
  }

  /**
   * Get individual column
   */
  async getColumn(tableId: string, columnId: string): Promise<TableColumn | null> {
    const columns = await this.prisma.$queryRaw<any[]>`
      SELECT id, table_id, name, type, is_required, default_value, position, created_at
      FROM table_columns
      WHERE table_id = ${tableId} AND id = ${columnId}
      LIMIT 1
    `

    if (columns.length === 0) {
      return null
    }

    const column = columns[0]

    // Convert SQLite integers/strings to proper booleans
    return {
      ...column,
      is_required: column.is_required === true || column.is_required === 1 || column.is_required === '1' || column.is_required === 'true'
    } as TableColumn
  }

  /**
   * Create new table with columns
   */
  async createTable(tableData: CreateTableRequest, userId: string, userEmail: string): Promise<TableSchema> {
    const tableId = crypto.randomUUID()

    // Use user_id from request data if provided (OAuth users), otherwise fall back to userId parameter (API token users)
    const finalUserId = (tableData as any).user_id || userId

    console.log('🔧 TableRepository.createTable:', {
      tableId,
      tableName: tableData.name,
      requestUserId: (tableData as any).user_id,
      paramUserId: userId,
      finalUserId,
      userEmail
    })

    // Create table
    await this.prisma.$queryRaw`
      INSERT INTO user_tables (id, name, description, created_by, user_id, is_public, for_sale)
      VALUES (${tableId}, ${tableData.name.trim()}, ${tableData.description || null}, ${userEmail}, ${finalUserId}, ${tableData.is_public}, ${tableData.for_sale || false})
    `

    // Create columns
    for (let i = 0; i < tableData.columns.length; i++) {
      const col = tableData.columns[i]
      if (!col) continue

      const columnId = crypto.randomUUID()

      await this.prisma.$queryRaw`
        INSERT INTO table_columns (id, table_id, name, type, is_required, default_value, position)
        VALUES (${columnId}, ${tableId}, ${col.name.trim()}, ${col.type}, ${col.is_required || false}, ${col.default_value || null}, ${col.position || i})
      `
    }

    // Fetch created table and columns
    const table = await this.findTableByIdInternal(tableId)
    const columns = await this.getTableColumns(tableId)

    if (!table) {
      throw new Error('Created table could not be retrieved')
    }

    return { table, columns }
  }

  /**
   * Update table metadata
   */
  async updateTable(tableId: string, updates: UpdateTableRequest): Promise<TableSchema> {
    console.log('🔧 TableRepository.updateTable called:')
    console.log('  - tableId:', tableId)
    console.log('  - updates:', JSON.stringify(updates, null, 2))
    console.log('  - updates keys:', Object.keys(updates || {}))

    // Build dynamic SET clauses only for provided fields
    const setClauses: string[] = []
    const setValues: any[] = []

    if (updates.name !== undefined) {
      setClauses.push('name = ?')
      setValues.push(updates.name)
    }

    if (updates.description !== undefined) {
      setClauses.push('description = ?')
      setValues.push(updates.description)
    }

    if (updates.is_public !== undefined) {
      setClauses.push('is_public = ?')
      setValues.push(updates.is_public)
    }

    if (updates.for_sale !== undefined) {
      setClauses.push('for_sale = ?')
      setValues.push(updates.for_sale)
    }

    // Always update the timestamp
    setClauses.push('updated_at = CURRENT_TIMESTAMP')

    if (setClauses.length === 1) { // Only timestamp
      throw new Error('No fields to update')
    }

    // Execute dynamic update
    const setClause = setClauses.join(', ')
    setValues.push(tableId) // For WHERE clause

    console.log('🔧 About to execute SQL:')
    console.log('  - SET clause:', setClause)
    console.log('  - Values:', setValues)
    console.log('  - Full SQL:', `UPDATE user_tables SET ${setClause} WHERE id = ?`)

    await this.prisma.$executeRawUnsafe(`
      UPDATE user_tables
      SET ${setClause}
      WHERE id = ?
    `, ...setValues)

    // Fetch updated table and columns
    const table = await this.findTableByIdInternal(tableId)
    const columns = await this.getTableColumns(tableId)

    if (!table) {
      throw new Error('Updated table could not be retrieved')
    }

    return { table, columns }
  }

  /**
   * Delete table
   */
  async deleteTable(tableId: string): Promise<UserTable> {
    const table = await this.findTableByIdInternal(tableId)
    if (!table) {
      throw new Error('Table not found')
    }

    // Delete table (CASCADE will handle columns and data)
    await this.prisma.$executeRaw`
      DELETE FROM user_tables WHERE id = ${tableId}
    `

    return table
  }

  /**
   * Check if user owns table
   */
  async checkTableOwnership(tableId: string, userEmail: string, userId: string): Promise<boolean> {
    const [table] = await this.prisma.$queryRaw<UserTable[]>`
      SELECT id, created_by FROM user_tables
      WHERE id = ${tableId}
    `

    if (!table) return false

    return table.created_by === userEmail || table.created_by === userId
  }

  /**
   * Execute mass action on tables
   */
  async executeMassAction(
    action: TableMassAction,
    tableIds: string[],
    userEmail: string,
    userId: string,
    isAdmin: boolean
  ): Promise<{ count: number }> {
    let query: string
    let params: any[]

    // Create placeholders for IN clause
    const placeholders = tableIds.map(() => '?').join(',')
    const inClause = `(${placeholders})`

    switch (action) {
      case 'make_public':
        if (isAdmin) {
          query = `UPDATE user_tables SET is_public = true, updated_at = CURRENT_TIMESTAMP WHERE id IN ${inClause}`
          params = [...tableIds]
        } else {
          query = `UPDATE user_tables SET is_public = true, updated_at = CURRENT_TIMESTAMP WHERE id IN ${inClause} AND (created_by = ? OR created_by = ?)`
          params = [...tableIds, userEmail, userId]
        }
        break

      case 'make_private':
        if (isAdmin) {
          query = `UPDATE user_tables SET is_public = false, updated_at = CURRENT_TIMESTAMP WHERE id IN ${inClause}`
          params = [...tableIds]
        } else {
          query = `UPDATE user_tables SET is_public = false, updated_at = CURRENT_TIMESTAMP WHERE id IN ${inClause} AND (created_by = ? OR created_by = ?)`
          params = [...tableIds, userEmail, userId]
        }
        break

      case 'delete':
        if (isAdmin) {
          query = `DELETE FROM user_tables WHERE id IN ${inClause}`
          params = [...tableIds]
        } else {
          query = `DELETE FROM user_tables WHERE id IN ${inClause} AND (created_by = ? OR created_by = ?)`
          params = [...tableIds, userEmail, userId]
        }
        break

      default:
        throw new Error('Invalid action')
    }

    await this.prisma.$executeRawUnsafe(query, ...params)

    return { count: tableIds.length }
  }

  /**
   * Add column to table
   */
  async addColumn(
    tableId: string,
    columnData: { name: string; type: string; is_required: boolean; default_value?: string; position?: number }
  ): Promise<TableColumn> {
    const columnId = crypto.randomUUID()

    let position = columnData.position
    if (position === undefined) {
      // If no position specified, add at the end
      const [maxPosResult] = await this.prisma.$queryRaw<[{ max_pos: number | null }]>`
        SELECT MAX(position) as max_pos FROM table_columns WHERE table_id = ${tableId}
      `
      position = (maxPosResult?.max_pos ?? -1) + 1
    } else {
      // If a specific position is requested, we need to make space
      // Use a transaction-like approach with careful ordering

      // First, get all columns at or after the target position
      const columnsToShift = await this.prisma.$queryRaw<{ id: string; position: number }[]>`
        SELECT id, position FROM table_columns
        WHERE table_id = ${tableId} AND position >= ${position}
        ORDER BY position DESC
      `

      // Shift each column one position to the right, starting from the highest position
      // This avoids constraint conflicts by working backwards
      for (const col of columnsToShift) {
        await this.prisma.$executeRaw`
          UPDATE table_columns
          SET position = ${col.position + 1}
          WHERE id = ${col.id} AND table_id = ${tableId}
        `
      }
    }

    // Now insert the new column
    await this.prisma.$queryRaw`
      INSERT INTO table_columns (id, table_id, name, type, is_required, default_value, position)
      VALUES (${columnId}, ${tableId}, ${columnData.name.trim()}, ${columnData.type}, ${columnData.is_required}, ${columnData.default_value || null}, ${position})
    `

    // Return the created column
    const [column] = await this.prisma.$queryRaw<any[]>`
      SELECT id, table_id, name, type, is_required, default_value, position, created_at
      FROM table_columns
      WHERE id = ${columnId}
    `

    if (!column) {
      throw new Error('Failed to create column')
    }

    // Convert SQLite integer/string to proper boolean
    return {
      ...column,
      is_required: column.is_required === true || column.is_required === 1 || column.is_required === '1' || column.is_required === 'true'
    } as TableColumn
  }

  /**
   * Update column in table
   */
  async updateColumn(
    tableId: string,
    columnId: string,
    updates: { name?: string; type?: string; is_required?: boolean; default_value?: string; position?: number }
  ): Promise<TableColumn> {
    // Build dynamic SET clauses only for provided fields
    const setClauses: string[] = []
    const setValues: any[] = []

    if (updates.name !== undefined) {
      setClauses.push('name = ?')
      setValues.push(updates.name.trim())
    }

    if (updates.type !== undefined) {
      setClauses.push('type = ?')
      setValues.push(updates.type)
    }

    if (updates.is_required !== undefined) {
      setClauses.push('is_required = ?')
      setValues.push(updates.is_required)
    }

    if (updates.default_value !== undefined) {
      setClauses.push('default_value = ?')
      setValues.push(updates.default_value || null)
    }

    if (updates.position !== undefined) {
      setClauses.push('position = ?')
      setValues.push(updates.position)
    }

    if (setClauses.length === 0) {
      throw new Error('No fields to update')
    }

    // Execute dynamic update
    const setClause = setClauses.join(', ')
    setValues.push(columnId, tableId) // For WHERE clause

    await this.prisma.$executeRawUnsafe(`
      UPDATE table_columns
      SET ${setClause}
      WHERE id = ? AND table_id = ?
    `, ...setValues)

    // Return updated column
    const [column] = await this.prisma.$queryRaw<any[]>`
      SELECT id, table_id, name, type, is_required, default_value, position, created_at
      FROM table_columns
      WHERE id = ${columnId} AND table_id = ${tableId}
    `

    if (!column) {
      throw new Error('Column not found after update')
    }

    // Convert SQLite integer/string to proper boolean
    return {
      ...column,
      is_required: column.is_required === true || column.is_required === 1 || column.is_required === '1' || column.is_required === 'true'
    } as TableColumn
  }

  /**
   * Delete column from table
   */
  async deleteColumn(tableId: string, columnId: string): Promise<TableColumn> {
    // Get column before deletion
    const [column] = await this.prisma.$queryRaw<any[]>`
      SELECT id, table_id, name, type, is_required, default_value, position, created_at
      FROM table_columns
      WHERE id = ${columnId} AND table_id = ${tableId}
    `

    if (!column) {
      throw new Error('Column not found')
    }

    // Delete column
    await this.prisma.$executeRaw`
      DELETE FROM table_columns WHERE id = ${columnId} AND table_id = ${tableId}
    `

    // Convert SQLite integer/string to proper boolean
    return {
      ...column,
      is_required: column.is_required === true || column.is_required === 1 || column.is_required === '1' || column.is_required === 'true'
    } as TableColumn
  }

  /**
   * Get table by ID with user access check
   */
  async getTable(tableId: string, userId: string): Promise<UserTable | null> {
    return this.findTableById(tableId, userId)
  }

  /**
   * Clear all data from table
   */
  async clearTableData(tableId: string): Promise<void> {
    await this.prisma.$executeRaw`
      DELETE FROM table_data WHERE table_id = ${tableId}
    `
  }

  /**
   * Insert data into table
   */
  async insertTableData(tableId: string, data: any, userId: string): Promise<void> {
    const rowId = crypto.randomUUID()
    const dataJson = JSON.stringify(data)
    const createdBy = `token:admin-token` // This should be replaced with proper user identification

    await this.prisma.$executeRaw`
      INSERT INTO table_data (id, table_id, data, created_by, created_at, updated_at)
      VALUES (${rowId}, ${tableId}, ${dataJson}, ${createdBy}, datetime('now'), datetime('now'))
    `
  }

  /**
   * Check if required sale columns (price, qty) exist in table
   */
  async checkSaleColumnsExist(tableId: string): Promise<{ hasPrice: boolean; hasQty: boolean }> {
    const columns = await this.getTableColumns(tableId)
    const hasPrice = columns.some(col => col.name === 'price')
    const hasQty = columns.some(col => col.name === 'qty')
    return { hasPrice, hasQty }
  }

  /**
   * Create missing sale columns for a table
   */
  async createMissingSaleColumns(tableId: string): Promise<void> {
    const { hasPrice, hasQty } = await this.checkSaleColumnsExist(tableId)

    if (!hasPrice) {
      const priceColumnId = crypto.randomUUID()
      await this.prisma.$queryRaw`
        INSERT INTO table_columns (id, table_id, name, type, is_required, default_value, position)
        VALUES (${priceColumnId}, ${tableId}, 'price', 'number', ${true}, ${null}, ${999})
      `
    }

    if (!hasQty) {
      const qtyColumnId = crypto.randomUUID()
      await this.prisma.$queryRaw`
        INSERT INTO table_columns (id, table_id, name, type, is_required, default_value, position)
        VALUES (${qtyColumnId}, ${tableId}, 'qty', 'number', ${true}, ${'1'}, ${1000})
      `
    }
  }

  /**
   * Check if a column is protected (price/qty for for_sale tables)
   */
  async isColumnProtected(tableId: string, columnName: string): Promise<boolean> {
    const table = await this.findTableByIdInternal(tableId)
    if (!table || !table.for_sale) {
      return false
    }

    return columnName === 'price' || columnName === 'qty'
  }
}
