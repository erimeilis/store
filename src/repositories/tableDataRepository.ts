import {getPrismaClient} from '@/lib/database.js'
import type {Bindings} from '@/types/bindings.js'
import type {ParsedTableData, TableColumn, TableDataMassAction, TableDataRow} from '@/types/dynamic-tables.js'
import type {PrismaClient} from '@prisma/client'

/**
 * Repository for table data operations
 */
export class TableDataRepository {
    private prisma: PrismaClient

    constructor(env: Bindings) {
        this.prisma = getPrismaClient(env)
    }

    /**
     * Find table data with filtering and pagination using Prisma ORM
     */
    async findTableData(
        tableId: string,
        filters: { [key: string]: string },
        pagination: { page: number; limit: number; offset: number }
    ): Promise<{ data: TableDataRow[]; totalCount: number }> {
        // Build Prisma where clause
        const where: any = {
            tableId: tableId
        }

        // Apply filters to JSON data using Prisma's string contains
        // Since JSON is stored as string, we search within the string representation
        // Modified to support partial text matching for string values
        if (Object.keys(filters).length > 0) {
            const filterConditions = Object.entries(filters).map(([columnName, filterValue]) => {
                // Check if filter value is numeric/boolean for exact matching
                const numericValue = parseFloat(filterValue)
                const isNumeric = !isNaN(numericValue) && filterValue.trim() !== ''
                const isBooleanLike = filterValue.toLowerCase() === 'true' || filterValue.toLowerCase() === 'false'

                if (isNumeric || isBooleanLike) {
                    // For numeric/boolean values, use exact matching
                    return {
                        OR: [
                            // Numeric values without quotes
                            {data: {contains: `"${columnName}":${filterValue}`}},
                            // String representation with quotes (for backwards compatibility)
                            {data: {contains: `"${columnName}":"${filterValue}"`}}
                        ]
                    }
                } else {
                    // For string values, implement partial matching
                    // We need to find JSON like: "columnName":"somevalue containing filterValue"
                    // Since SQLite contains is case-sensitive, we'll use a simpler approach

                    // Use raw SQL query for more flexible matching
                    // This will match any JSON that contains the column and partial value
                    return {
                        AND: [
                            // Must have the column
                            {data: {contains: `"${columnName}":`}},
                            // Must contain the search value somewhere in the JSON
                            {data: {contains: filterValue}}
                        ]
                    }
                }
            })

            // Use AND logic - all filters must match
            if (filterConditions.length > 0) {
                where.AND = filterConditions
            }
        }

        // Get data rows using Prisma
        const [dataRows, totalCount] = await Promise.all([
            this.prisma.tableData.findMany({
                where,
                orderBy: {updatedAt: 'desc'},
                skip: pagination.offset,
                take: pagination.limit
            }),
            this.prisma.tableData.count({where})
        ])

        // Parse JSON data and convert to camelCase
        const parsedData = dataRows.map(row => ({
            id: row.id,
            tableId: row.tableId,
            data: JSON.parse(row.data),
            createdBy: row.createdBy,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt
        })) as TableDataRow[]

        return {data: parsedData, totalCount}
    }

    /**
     * Find data row by ID using Prisma ORM
     */
    async findDataRowById(rowId: string, tableId: string): Promise<TableDataRow | null> {
        const row = await this.prisma.tableData.findUnique({
            where: {
                id: rowId,
                tableId: tableId
            }
        })

        if (!row) return null

        return {
            id: row.id,
            tableId: row.tableId,
            data: JSON.parse(row.data),
            createdBy: row.createdBy,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt
        } as TableDataRow
    }

    /**
     * Create data row using Prisma ORM
     */
    async createDataRow(tableId: string, data: ParsedTableData, createdBy: string): Promise<TableDataRow> {
        const dataJson = JSON.stringify(data)

        const createdRow = await this.prisma.tableData.create({
            data: {
                tableId: tableId,
                data: dataJson,
                createdBy: createdBy
            }
        })

        return {
            id: createdRow.id,
            tableId: createdRow.tableId,
            data: JSON.parse(createdRow.data),
            createdBy: createdRow.createdBy,
            createdAt: createdRow.createdAt,
            updatedAt: createdRow.updatedAt
        } as TableDataRow
    }

    /**
     * Update data row using Prisma ORM
     */
    async updateDataRow(rowId: string, tableId: string, data: ParsedTableData): Promise<TableDataRow> {
        const dataJson = JSON.stringify(data)

        const updatedRow = await this.prisma.tableData.update({
            where: {
                id: rowId,
                tableId: tableId
            },
            data: {
                data: dataJson,
                updatedAt: new Date()
            }
        })

        return {
            id: updatedRow.id,
            tableId: updatedRow.tableId,
            data: JSON.parse(updatedRow.data),
            createdBy: updatedRow.createdBy,
            createdAt: updatedRow.createdAt,
            updatedAt: updatedRow.updatedAt
        } as TableDataRow
    }

    /**
     * Delete data row using Prisma ORM
     */
    async deleteDataRow(rowId: string, tableId: string): Promise<TableDataRow> {
        const existingRow = await this.findDataRowById(rowId, tableId)
        if (!existingRow) {
            throw new Error('Row not found')
        }

        await this.prisma.tableData.delete({
            where: {
                id: rowId,
                tableId: tableId
            }
        })

        return existingRow
    }

    /**
     * Check table access using Prisma ORM
     */
    async checkTableAccess(tableId: string, userId: string): Promise<boolean> {
        const table = await this.prisma.userTable.findFirst({
            where: {
                id: tableId,
                OR: [
                    {userId: userId},
                    {isPublic: true}
                ]
            },
            select: {id: true}
        })
        return !!table
    }

    /**
     * Execute mass action on table data using Prisma ORM
     */
    async executeMassAction(
        tableId: string,
        action: TableDataMassAction,
        rowIds: string[]
    ): Promise<{ count: number; data?: TableDataRow[] }> {
        const where = {
            id: {in: rowIds},
            tableId: tableId
        }

        switch (action) {
            case 'delete':
                const deleteResult = await this.prisma.tableData.deleteMany({where})
                return {count: deleteResult.count}

            case 'export':
                const exportRows = await this.prisma.tableData.findMany({
                    where,
                    orderBy: {createdAt: 'desc'}
                })

                // Parse JSON data and convert to camelCase
                const parsedExportData = exportRows.map(row => ({
                    id: row.id,
                    tableId: row.tableId,
                    data: JSON.parse(row.data),
                    createdBy: row.createdBy,
                    createdAt: row.createdAt,
                    updatedAt: row.updatedAt
                })) as TableDataRow[]

                return {
                    count: exportRows.length,
                    data: parsedExportData
                }

            default:
                throw new Error('Invalid action')
        }
    }

    /**
     * Get table columns for validation using Prisma ORM
     */
    async getTableColumns(tableId: string): Promise<TableColumn[]> {
        const columns = await this.prisma.tableColumn.findMany({
            where: {tableId},
            orderBy: {position: 'asc'}
        })

        return columns.map(column => ({
            id: column.id,
            tableId: column.tableId,
            name: column.name,
            type: column.type as any,
            isRequired: column.isRequired,
            allowDuplicates: column.allowDuplicates,
            defaultValue: column.defaultValue,
            position: column.position,
            createdAt: column.createdAt
        })) as TableColumn[]
    }

    /**
     * Get table info including forSale status using Prisma ORM
     */
    async getTableInfo(tableId: string): Promise<{ forSale: boolean; name: string } | null> {
        const table = await this.prisma.userTable.findUnique({
            where: {id: tableId},
            select: {forSale: true, name: true}
        })
        return table ? {forSale: table.forSale, name: table.name} : null
    }

    /**
     * Find rows that have a specific value in a specific column (for duplicate checking) using Prisma ORM
     */
    async findRowsWithColumnValue(
        tableId: string,
        columnName: string,
        value: any,
        excludeRowId?: string
    ): Promise<TableDataRow[]> {
        // Convert value to string for JSON comparison
        const stringValue = String(value)

        // Build Prisma where clause
        const where: any = {
            tableId: tableId,
            OR: [
                // Search for "columnName":"stringValue" (string values)
                {data: {contains: `"${columnName}":"${stringValue}"`}},
                // Search for "columnName":value (numeric/boolean values)
                {data: {contains: `"${columnName}":${value}`}}
            ]
        }

        // Exclude a specific row if provided (useful for updates)
        if (excludeRowId) {
            where.id = {not: excludeRowId}
        }

        const rows = await this.prisma.tableData.findMany({where})

        // Parse the JSON data for each row and convert to camelCase
        return rows.map(row => ({
            id: row.id,
            tableId: row.tableId,
            data: JSON.parse(row.data),
            createdBy: row.createdBy,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt
        })) as TableDataRow[]
    }
}
