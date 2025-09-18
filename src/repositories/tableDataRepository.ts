import { getPrismaClient } from '@/lib/database.js'
import type { Bindings } from '@/types/bindings.js'
import type { TableDataRow, ParsedTableData, AddTableDataRequest, UpdateTableDataRequest, TableDataMassAction } from '@/types/dynamic-tables.js'
import { Prisma, type PrismaClient } from '@prisma/client'
import { sanitizeForSQL } from '@/utils/common.js'

/**
 * Repository for table data operations
 */
export class TableDataRepository {
  private prisma: PrismaClient

  constructor(env: Bindings) {
    this.prisma = getPrismaClient(env)
  }

  /**
   * Find table data with filtering and pagination
   */
  async findTableData(
    tableId: string,
    filters: { [key: string]: string },
    pagination: { page: number; limit: number; offset: number }
  ): Promise<{ data: TableDataRow[]; totalCount: number }> {
    // Build WHERE conditions for filtering JSON data
    let additionalFilters = ''
    const filterValues: string[] = []

    // Apply filters to JSON data using LIKE on the data column
    for (const [columnName, filterValue] of Object.entries(filters)) {
      // Use JSON path filtering - search for the exact field and value in JSON
      additionalFilters += ` AND (data LIKE '%"${sanitizeForSQL(columnName)}":%"${sanitizeForSQL(filterValue)}%"' OR data LIKE '%"${sanitizeForSQL(columnName)}":%${sanitizeForSQL(filterValue)}%')`
    }

    // Get data rows
    const dataQuery = `
      SELECT id, table_id, data, created_by, created_at, updated_at
      FROM table_data
      WHERE table_id = ?${additionalFilters}
      ORDER BY updated_at DESC
      LIMIT ? OFFSET ?
    `

    const dataRows = await this.prisma.$queryRawUnsafe<TableDataRow[]>(
      dataQuery,
      tableId,
      pagination.limit,
      pagination.offset
    )

    // Parse JSON data
    const parsedData = dataRows.map(row => ({
      ...row,
      data: JSON.parse(row.data)
    }))

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as count
      FROM table_data
      WHERE table_id = ?${additionalFilters}
    `

    const [countResult] = await this.prisma.$queryRawUnsafe<[{ count: number }]>(
      countQuery,
      tableId
    )

    return { data: parsedData, totalCount: countResult.count }
  }

  /**
   * Find data row by ID
   */
  async findDataRowById(rowId: string, tableId: string): Promise<TableDataRow | null> {
    const [row] = await this.prisma.$queryRaw<TableDataRow[]>`
      SELECT id, table_id, data, created_by, created_at, updated_at
      FROM table_data
      WHERE id = ${rowId} AND table_id = ${tableId}
    `

    if (!row) return null

    return {
      ...row,
      data: JSON.parse(row.data)
    }
  }

  /**
   * Create data row
   */
  async createDataRow(tableId: string, data: ParsedTableData, createdBy: string): Promise<TableDataRow> {
    const rowId = crypto.randomUUID()
    const dataJson = JSON.stringify(data)

    await this.prisma.$queryRaw`
      INSERT INTO table_data (id, table_id, data, created_by)
      VALUES (${rowId}, ${tableId}, ${dataJson}, ${createdBy})
    `

    // Fetch created row
    const createdRow = await this.findDataRowById(rowId, tableId)
    if (!createdRow) {
      throw new Error('Created row could not be retrieved')
    }

    return createdRow
  }

  /**
   * Update data row
   */
  async updateDataRow(rowId: string, tableId: string, data: ParsedTableData): Promise<TableDataRow> {
    const dataJson = JSON.stringify(data)

    await this.prisma.$executeRaw`
      UPDATE table_data
      SET data = ${dataJson}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${rowId} AND table_id = ${tableId}
    `

    // Fetch updated row
    const updatedRow = await this.findDataRowById(rowId, tableId)
    if (!updatedRow) {
      throw new Error('Updated row could not be retrieved')
    }

    return updatedRow
  }

  /**
   * Delete data row
   */
  async deleteDataRow(rowId: string, tableId: string): Promise<TableDataRow> {
    const existingRow = await this.findDataRowById(rowId, tableId)
    if (!existingRow) {
      throw new Error('Row not found')
    }

    await this.prisma.$executeRaw`
      DELETE FROM table_data
      WHERE id = ${rowId} AND table_id = ${tableId}
    `

    return existingRow
  }

  /**
   * Check table access
   */
  async checkTableAccess(tableId: string, userId: string): Promise<boolean> {
    const result = await this.prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM user_tables
      WHERE id = ${tableId} AND (user_id = ${userId} OR is_public = true)
    `
    return result.length > 0
  }

  /**
   * Execute mass action on table data
   */
  async executeMassAction(
    tableId: string,
    action: TableDataMassAction,
    rowIds: string[]
  ): Promise<{ count: number; data?: TableDataRow[] }> {
    // Create placeholders for IN clause
    const placeholders = rowIds.map(() => '?').join(',')
    const inClause = `(${placeholders})`

    switch (action) {
      case 'delete':
        const deleteQuery = `DELETE FROM table_data WHERE id IN ${inClause} AND table_id = ?`
        await this.prisma.$executeRawUnsafe(deleteQuery, ...rowIds, tableId)
        return { count: rowIds.length }

      case 'export':
        const exportQuery = `SELECT id, table_id, data, created_by, created_at, updated_at FROM table_data WHERE id IN ${inClause} AND table_id = ? ORDER BY created_at DESC`
        const exportRows = await this.prisma.$queryRawUnsafe<TableDataRow[]>(exportQuery, ...rowIds, tableId)

        // Parse JSON data
        const parsedExportData = exportRows.map(row => ({
          ...row,
          data: JSON.parse(row.data)
        }))

        return {
          count: exportRows.length,
          data: parsedExportData
        }

      default:
        throw new Error('Invalid action')
    }
  }

  /**
   * Get table columns for validation
   */
  async getTableColumns(tableId: string): Promise<Array<{ name: string; type: string; is_required: boolean; default_value: any }>> {
    return await this.prisma.$queryRaw`
      SELECT name, type, is_required, default_value
      FROM table_columns
      WHERE table_id = ${tableId}
    `
  }

  /**
   * Get table info including for_sale status
   */
  async getTableInfo(tableId: string): Promise<{ for_sale: boolean } | null> {
    const [table] = await this.prisma.$queryRaw<{ for_sale: boolean }[]>`
      SELECT for_sale
      FROM user_tables
      WHERE id = ${tableId}
    `
    return table || null
  }
}
