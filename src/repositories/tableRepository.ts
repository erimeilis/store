import { getPrismaClient } from '@/lib/database.js'
import type { Bindings } from '@/types/bindings.js'
import type { UserTable, TableColumn, TableSchema, CreateTableRequest, UpdateTableRequest, TableMassAction, TableVisibility } from '@/types/dynamic-tables.js'
import type { PrismaClient } from '@prisma/client'
import { validateSortColumn, validateSortDirection } from '@/utils/common.js'

/**
 * Repository for table operations
 */
export class TableRepository {
  private prisma: PrismaClient

  constructor(env: Bindings) {
    this.prisma = getPrismaClient(env)
  }

  /**
   * Find tables accessible to user with filtering and pagination using Prisma ORM
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
      forSale?: string
    },
    sort: { column: string; direction: string },
    pagination: { page: number; limit: number; offset: number },
    isAdmin: boolean = false
  ): Promise<{ tables: UserTable[]; totalCount: number }> {
    const allowedSortColumns = ['name', 'description', 'createdBy', 'isPublic', 'forSale', 'createdAt', 'updatedAt']
    // Note: rowCount sorting is not supported as it's computed after the query
    const safeSortColumn = validateSortColumn(sort.column, allowedSortColumns)
    const safeSortDirection = validateSortDirection(sort.direction)

    // Build Prisma where clause - admin users can see all tables
    const where: any = isAdmin ? {} : {
      OR: [
        { userId: userId },
        { isPublic: true }
      ]
    }

    // Apply filters
    if (filters.name) {
      where.name = { contains: filters.name }
    }

    if (filters.description) {
      where.description = { contains: filters.description }
    }

    if (filters.owner) {
      where.OR = [
        { createdBy: { contains: filters.owner } },
        ...(userEmail && !userEmail.startsWith('token:') ? [{
          AND: [
            { createdBy: `user:${userId}` },
            // Additional owner filter logic can be added here
          ]
        }] : [])
      ]
    }

    if (filters.visibility === 'true' || filters.visibility === 'Public') {
      where.isPublic = true
    } else if (filters.visibility === 'false' || filters.visibility === 'Private') {
      where.isPublic = false
    }

    if (filters.createdAt) {
      const date = new Date(filters.createdAt)
      const nextDay = new Date(date)
      nextDay.setDate(date.getDate() + 1)
      where.createdAt = {
        gte: date,
        lt: nextDay
      }
    }

    if (filters.updatedAt) {
      const date = new Date(filters.updatedAt)
      const nextDay = new Date(date)
      nextDay.setDate(date.getDate() + 1)
      where.updatedAt = {
        gte: date,
        lt: nextDay
      }
    }

    if (filters.forSale === 'true') {
      where.forSale = true
    } else if (filters.forSale === 'false') {
      where.forSale = false
    }

    // Get tables and total count
    const [tables, totalCount] = await Promise.all([
      this.prisma.userTable.findMany({
        where,
        orderBy: { [safeSortColumn]: safeSortDirection },
        skip: pagination.offset,
        take: pagination.limit
      }),
      this.prisma.userTable.count({ where })
    ])

    // Get row counts for all tables in parallel
    const rowCounts = await Promise.all(
      tables.map(table =>
        this.prisma.tableData.count({
          where: { tableId: table.id }
        })
      )
    )

    // Add owner display name and row count logic with proper type casting
    const tablesWithOwner = tables.map((table, index) => ({
      ...table,
      visibility: table.visibility as TableVisibility,
      ownerDisplayName: this.getOwnerDisplayName(table.createdBy, userId, userEmail),
      rowCount: rowCounts[index]
    })) as UserTable[]

    return { tables: tablesWithOwner, totalCount }
  }

  /**
   * Helper to get owner display name
   */
  private getOwnerDisplayName(createdBy: string, userId: string, userEmail: string): string {
    if (createdBy === `user:${userId}` && !userEmail.startsWith('token:')) {
      return userEmail
    }
    if (createdBy.startsWith('token:')) {
      return createdBy.substring(6)
    }
    if (createdBy.startsWith('user:')) {
      return createdBy.substring(5)
    }
    return createdBy
  }

  /**
   * Find table by ID with access check using Prisma ORM
   */
  async findTableById(tableId: string, userId: string): Promise<UserTable | null> {
    const table = await this.prisma.userTable.findFirst({
      where: {
        id: tableId,
        OR: [
          { userId: userId },
          { visibility: { in: ['public', 'shared'] } }
        ]
      }
    })
    return table ? { ...table, visibility: table.visibility as TableVisibility } as UserTable : null
  }

  /**
   * Find table by ID without access check (for internal use) using Prisma ORM
   */
  async findTableByIdInternal(tableId: string): Promise<UserTable | null> {
    const table = await this.prisma.userTable.findUnique({
      where: { id: tableId }
    })
    return table ? { ...table, visibility: table.visibility as TableVisibility } as UserTable : null
  }

  /**
   * Get table columns using Prisma ORM
   */
  async getTableColumns(tableId: string): Promise<TableColumn[]> {
    const columns = await this.prisma.tableColumn.findMany({
      where: { tableId },
      orderBy: { position: 'asc' }
    })

    return columns.map(column => ({
      ...column,
      type: column.type as any // Type assertion for ColumnType
    }))
  }

  /**
   * Get individual column using Prisma ORM
   */
  async getColumn(tableId: string, columnId: string): Promise<TableColumn | null> {
    const column = await this.prisma.tableColumn.findFirst({
      where: {
        tableId,
        id: columnId
      }
    })

    if (!column) return null

    return {
      ...column,
      type: column.type as any // Type assertion for ColumnType
    }
  }

  /**
   * Create new table with columns using Prisma ORM
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

    // Create table first
    const table = await this.prisma.userTable.create({
      data: {
        id: tableId,
        name: tableData.name.trim(),
        description: tableData.description || null,
        createdBy: userEmail,
        userId: finalUserId,
        visibility: tableData.visibility,
        forSale: tableData.forSale || false
      }
    })

    // Create columns using batch transaction
    const columnCreates = tableData.columns.map((col, i) => {
      if (!col) return null
      return this.prisma.tableColumn.create({
        data: {
          id: crypto.randomUUID(),
          tableId: tableId,
          name: col.name.trim(),
          type: col.type,
          isRequired: col.isRequired || false,
          allowDuplicates: col.allowDuplicates ?? true,
          defaultValue: col.defaultValue || null,
          position: col.position || i
        }
      })
    }).filter(Boolean) as any[]

    // Execute column creation in batch
    const columns = await this.prisma.$transaction(columnCreates)

    const result = {
      table: { ...table, visibility: table.visibility as TableVisibility } as UserTable,
      columns: columns.map(col => ({
        ...col,
        type: col.type as any // Type assertion for ColumnType
      })) as TableColumn[]
    }

    return result
  }

  /**
   * Update table metadata using Prisma ORM
   */
  async updateTable(tableId: string, updates: UpdateTableRequest): Promise<TableSchema> {
    console.log('🔧 TableRepository.updateTable called:')
    console.log('  - tableId:', tableId)
    console.log('  - updates:', JSON.stringify(updates, null, 2))
    console.log('  - updates keys:', Object.keys(updates || {}))

    // Build update data object only for provided fields
    const updateData: any = {}

    if (updates.name !== undefined) {
      updateData.name = updates.name
    }

    if (updates.description !== undefined) {
      updateData.description = updates.description
    }

    if (updates.visibility !== undefined) {
      updateData.visibility = updates.visibility
    }

    if (updates.forSale !== undefined) {
      updateData.forSale = updates.forSale
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error('No fields to update')
    }

    // Always update the timestamp
    updateData.updatedAt = new Date()

    console.log('🔧 About to execute Prisma update:')
    console.log('  - Update data:', updateData)

    // Execute update using Prisma
    const table = await this.prisma.userTable.update({
      where: { id: tableId },
      data: updateData
    })

    // Fetch columns
    const columns = await this.getTableColumns(tableId)

    return { table: { ...table, visibility: table.visibility as TableVisibility } as UserTable, columns }
  }

  /**
   * Delete table using Prisma ORM
   */
  async deleteTable(tableId: string): Promise<UserTable> {
    const table = await this.findTableByIdInternal(tableId)
    if (!table) {
      throw new Error('Table not found')
    }

    // Delete table (CASCADE will handle columns and data)
    await this.prisma.userTable.delete({
      where: { id: tableId }
    })

    return table
  }

  /**
   * Check if user owns table using Prisma ORM
   */
  async checkTableOwnership(tableId: string, userEmail: string, userId: string): Promise<boolean> {
    const table = await this.prisma.userTable.findUnique({
      where: { id: tableId },
      select: { createdBy: true }
    })

    if (!table) return false

    return table.createdBy === userEmail || table.createdBy === userId
  }

  /**
   * Execute mass action on tables using Prisma ORM
   */
  async executeMassAction(
    action: TableMassAction,
    tableIds: string[],
    userEmail: string,
    userId: string,
    isAdmin: boolean
  ): Promise<{ count: number }> {
    // Build where clause based on admin status
    const where: any = {
      id: { in: tableIds }
    }

    if (!isAdmin) {
      where.OR = [
        { createdBy: userEmail },
        { createdBy: userId }
      ]
    }

    let result: any

    switch (action) {
      case 'make_public':
        result = await this.prisma.userTable.updateMany({
          where,
          data: {
            visibility: 'public',
            updatedAt: new Date()
          }
        })
        break

      case 'make_private':
        result = await this.prisma.userTable.updateMany({
          where,
          data: {
            visibility: 'private',
            updatedAt: new Date()
          }
        })
        break

      case 'make_shared':
        result = await this.prisma.userTable.updateMany({
          where,
          data: {
            visibility: 'shared',
            updatedAt: new Date()
          }
        })
        break

      case 'delete':
        result = await this.prisma.userTable.deleteMany({ where })
        break

      default:
        throw new Error('Invalid action')
    }

    return { count: result.count }
  }

  /**
   * Add column to table using Prisma ORM
   */
  async addColumn(
    tableId: string,
    columnData: { name: string; type: string; isRequired: boolean; allowDuplicates?: boolean; defaultValue?: string; position?: number }
  ): Promise<TableColumn> {
    let position = columnData.position

    if (position === undefined) {
      // If no position specified, add at the end
      const maxPosResult = await this.prisma.tableColumn.aggregate({
        where: { tableId },
        _max: { position: true }
      })
      position = (maxPosResult._max.position ?? -1) + 1
    } else {
      // If a specific position is requested, we need to make space
      // Get all columns at or after the target position
      const columnsToShift = await this.prisma.tableColumn.findMany({
        where: {
          tableId,
          position: { gte: position }
        },
        orderBy: { position: 'desc' },
        select: { id: true, position: true }
      })

      // Shift each column one position to the right, starting from the highest position
      for (const col of columnsToShift) {
        await this.prisma.tableColumn.update({
          where: { id: col.id },
          data: { position: col.position + 1 }
        })
      }
    }

    // Create the new column
    const column = await this.prisma.tableColumn.create({
      data: {
        id: crypto.randomUUID(),
        tableId: tableId,
        name: columnData.name.trim(),
        type: columnData.type,
        isRequired: columnData.isRequired,
        allowDuplicates: columnData.allowDuplicates ?? true,
        defaultValue: columnData.defaultValue || null,
        position: position
      }
    })

    return {
      ...column,
      type: column.type as any // Type assertion for ColumnType
    }
  }

  /**
   * Update column in table using Prisma ORM
   */
  async updateColumn(
    tableId: string,
    columnId: string,
    updates: { name?: string; type?: string; isRequired?: boolean; allowDuplicates?: boolean; defaultValue?: string; position?: number }
  ): Promise<TableColumn> {
    // Build update data object only for provided fields
    const updateData: any = {}

    if (updates.name !== undefined) {
      updateData.name = updates.name.trim()
    }

    if (updates.type !== undefined) {
      updateData.type = updates.type
    }

    if (updates.isRequired !== undefined) {
      updateData.isRequired = updates.isRequired
    }

    if (updates.allowDuplicates !== undefined) {
      updateData.allowDuplicates = updates.allowDuplicates
    }

    if (updates.defaultValue !== undefined) {
      updateData.defaultValue = updates.defaultValue || null
    }

    if (updates.position !== undefined) {
      updateData.position = updates.position
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error('No fields to update')
    }

    // Execute update using Prisma
    const column = await this.prisma.tableColumn.update({
      where: {
        id: columnId,
        tableId: tableId
      },
      data: updateData
    })

    return {
      ...column,
      type: column.type as any // Type assertion for ColumnType
    }
  }

  /**
   * Delete column from table using Prisma ORM
   */
  async deleteColumn(tableId: string, columnId: string): Promise<TableColumn> {
    // Get column before deletion
    const column = await this.prisma.tableColumn.findFirst({
      where: {
        id: columnId,
        tableId: tableId
      }
    })

    if (!column) {
      throw new Error('Column not found')
    }

    // Delete column
    await this.prisma.tableColumn.delete({
      where: {
        id: columnId
      }
    })

    return {
      ...column,
      type: column.type as any // Type assertion for ColumnType
    }
  }

  /**
   * Get table by ID with user access check (alias for findTableById)
   */
  getTable(tableId: string, userId: string): Promise<UserTable | null> {
    return this.findTableById(tableId, userId)
  }

  /**
   * Clear all data from table using Prisma ORM
   */
  async clearTableData(tableId: string): Promise<void> {
    await this.prisma.tableData.deleteMany({
      where: { tableId }
    })
  }

  /**
   * Insert data into table using Prisma ORM
   */
  async insertTableData(tableId: string, data: any, userId: string): Promise<void> {
    const dataJson = JSON.stringify(data)
    const createdBy = `token:admin-token` // This should be replaced with proper user identification

    await this.prisma.tableData.create({
      data: {
        id: crypto.randomUUID(),
        tableId: tableId,
        data: dataJson,
        createdBy: createdBy
      }
    })
  }

  /**
   * Check if required sale columns (price, qty) exist in table
   */
  async checkSaleColumnsExist(tableId: string): Promise<{ hasPrice: boolean; hasQty: boolean }> {
    const columns = await this.getTableColumns(tableId)
    return {
      hasPrice: columns.some(col => col.name === 'price'),
      hasQty: columns.some(col => col.name === 'qty')
    }
  }

  /**
   * Create missing sale columns for a table using Prisma ORM
   */
  async createMissingSaleColumns(tableId: string): Promise<void> {
    const { hasPrice, hasQty } = await this.checkSaleColumnsExist(tableId)

    // Get the current max position to add sale columns at the end following 10, 20, 30, 40... pattern
    const maxPositionResult = await this.prisma.tableColumn.aggregate({
      where: { tableId },
      _max: { position: true }
    })
    const nextPosition = (maxPositionResult._max.position ?? 0) + 10
    const columnsToCreate = []

    if (!hasPrice) {
      columnsToCreate.push({
        id: crypto.randomUUID(),
        tableId: tableId,
        name: 'price',
        type: 'number',
        isRequired: true,
        allowDuplicates: true,
        defaultValue: null,
        position: nextPosition
      })
    }

    if (!hasQty) {
      // If price was just added, qty position should be nextPosition + 10, otherwise nextPosition
      const qtyPosition = !hasPrice ? nextPosition + 10 : nextPosition
      columnsToCreate.push({
        id: crypto.randomUUID(),
        tableId: tableId,
        name: 'qty',
        type: 'number',
        isRequired: true,
        allowDuplicates: true,
        defaultValue: '1',
        position: qtyPosition
      })
    }

    // Create all missing columns
    if (columnsToCreate.length > 0) {
      await this.prisma.tableColumn.createMany({
        data: columnsToCreate
      })
    }
  }

  /**
   * Check if a column is protected (price/qty for for_sale tables)
   */
  async isColumnProtected(tableId: string, columnName: string): Promise<boolean> {
    const table = await this.findTableByIdInternal(tableId)
    if (!table || !table.forSale) {
      return false
    }

    return columnName === 'price' || columnName === 'qty'
  }

  /**
   * Find public tables that are for sale using Prisma ORM
   */
  async findPublicSaleTables(limit: number = 1000): Promise<{ tables: UserTable[]; totalCount: number }> {
    const where = {
      visibility: { in: ['public', 'shared'] },
      forSale: true
    }

    const [tables, totalCount] = await Promise.all([
      this.prisma.userTable.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit
      }),
      this.prisma.userTable.count({ where })
    ])

    // Type cast the results
    const typedTables = tables.map(table => ({
      ...table,
      visibility: table.visibility as TableVisibility
    })) as UserTable[]

    return { tables: typedTables, totalCount }
  }

  /**
   * Recount column positions to ensure proper spaced ordering (10, 20, 30, 40...) using Prisma ORM
   * This provides room for position swapping in arrow buttons
   */
  async recountColumnPositions(tableId: string): Promise<void> {
    // Get all columns sorted by current position
    const columns = await this.prisma.tableColumn.findMany({
      where: { tableId },
      orderBy: { position: 'asc' },
      select: { id: true, position: true }
    })

    // First, assign all columns temporary unique negative positions to avoid conflicts
    for (let i = 0; i < columns.length; i++) {
      const column = columns[i]
      if (!column) continue

      const tempPosition = -1000 - i  // Use unique negative positions
      await this.prisma.tableColumn.update({
        where: { id: column.id },
        data: { position: tempPosition }
      })
    }

    // Then, assign proper spaced positions (10, 20, 30, 40, 50...)
    for (let i = 0; i < columns.length; i++) {
      const column = columns[i]
      if (!column) continue

      const spacedPosition = (i + 1) * 10  // Start from 10, not 0
      await this.prisma.tableColumn.update({
        where: { id: column.id },
        data: { position: spacedPosition }
      })
    }
  }

  /**
   * Safely update a column's position using intermediate values in spaced gaps using Prisma ORM
   */
  async updateColumnPositionSafe(tableId: string, columnId: string, newPosition: number): Promise<void> {
    console.log(`🔧 Safe position update: columnId=${columnId}, targetPosition=${newPosition}`)

    // Calculate simple intermediate value based on spacing pattern (10, 20, 30, 40...)
    // Use a small offset that won't conflict with existing positions
    const intermediatePosition = newPosition - 1

    console.log(`📍 Using intermediate position ${intermediatePosition} to avoid conflicts`)

    // Step 1: Move to intermediate position to avoid conflicts
    await this.prisma.tableColumn.update({
      where: { id: columnId },
      data: { position: intermediatePosition }
    })

    console.log(`✅ Column moved to intermediate position ${intermediatePosition}`)

    // Step 2: Move to final target position
    await this.prisma.tableColumn.update({
      where: { id: columnId },
      data: { position: newPosition }
    })

    console.log(`✅ Column moved to final position ${newPosition}`)
  }

  /**
   * Find rows that have a specific value in a specific column using Prisma ORM
   */
  async findRowsWithColumnValue(
    tableId: string,
    columnName: string,
    value: any,
    excludeRowId?: string
  ): Promise<any[]> {
    // Convert value to string for JSON comparison
    const stringValue = String(value)

    // Build Prisma where clause
    const where: any = {
      tableId: tableId,
      OR: [
        // Search for "columnName":"stringValue" (string values)
        { data: { contains: `"${columnName}":"${stringValue}"` } },
        // Search for "columnName":value (numeric/boolean values)
        { data: { contains: `"${columnName}":${value}` } }
      ]
    }

    // Exclude a specific row if provided (useful for updates)
    if (excludeRowId) {
      where.id = { not: excludeRowId }
    }

    const rows = await this.prisma.tableData.findMany({ where })
    return rows
  }

  /**
   * Swap positions between two columns using Prisma ORM
   * With non-unique positions, this is now a simple operation
   */
  async swapColumnPositions(tableId: string, columnId1: string, columnId2: string): Promise<void> {
    // Get current positions of both columns
    const columns = await this.prisma.tableColumn.findMany({
      where: {
        tableId: tableId,
        id: { in: [columnId1, columnId2] }
      },
      select: { id: true, position: true }
    })

    if (columns.length !== 2) {
      throw new Error('One or both columns not found')
    }

    const column1 = columns.find(col => col.id === columnId1)
    const column2 = columns.find(col => col.id === columnId2)

    if (!column1 || !column2) {
      throw new Error('One or both columns not found')
    }

    // Simply swap the position values - no intermediate steps needed with non-unique positions
    await Promise.all([
      this.prisma.tableColumn.update({
        where: { id: columnId1 },
        data: { position: column2.position }
      }),
      this.prisma.tableColumn.update({
        where: { id: columnId2 },
        data: { position: column1.position }
      })
    ])
  }
}
