import {getPrismaClient} from '@/lib/database.js'
import {CacheService} from '@/lib/cache-service.js'
import type {Bindings} from '@/types/bindings.js'
import type {ParsedTableData, ParsedTableDataRow, TableColumn, TableDataMassAction, TableDataRow} from '@/types/dynamic-tables.js'
import type {PrismaClient} from '@prisma/client'

/**
 * Repository for table data operations
 * Uses KV caching for high-performance lookups with invalidation on change
 */
export class TableDataRepository {
    private prisma: PrismaClient
    private cache: CacheService | null

    constructor(env: Bindings) {
        this.prisma = getPrismaClient(env)
        this.cache = env.KV ? new CacheService(env.KV) : null
    }

    /**
     * Find table data with filtering, pagination, and sorting using Prisma ORM
     * Returns parsed data rows (data field is already parsed from JSON)
     */
    async findTableData(
        tableId: string,
        filters: { [key: string]: string },
        pagination: { page: number; limit: number; offset: number },
        sort?: { column: string; direction: string }
    ): Promise<{ data: ParsedTableDataRow[]; totalCount: number }> {
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
                    // For string values, use proper JSON value matching
                    // Match exact value in the specific column: "columnName":"value"
                    // This prevents matching substrings in other fields (e.g., "AT" in "Rotterdam")
                    return {
                        data: {contains: `"${columnName}":"${filterValue}"`}
                    }
                }
            })

            // Use AND logic - all filters must match
            if (filterConditions.length > 0) {
                where.AND = filterConditions
            }
        }

        // Determine sort order
        const sortColumn = sort?.column || 'updatedAt'
        const sortDirection = (sort?.direction?.toLowerCase() === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc'

        // Check if sorting by a system column or a data column
        const systemColumns = ['id', 'tableId', 'createdBy', 'createdAt', 'updatedAt']
        let orderBy: any

        if (systemColumns.includes(sortColumn)) {
            // Sort by system column directly
            orderBy = { [sortColumn]: sortDirection }
        } else {
            // For data columns, we need to fetch all matching records and sort in memory
            // This is a limitation of SQLite JSON columns - they don't support efficient sorting
            // For better performance with large datasets, consider a different approach
            orderBy = { updatedAt: 'desc' } // Fallback to default sorting
        }

        // Get data rows using Prisma
        const findManyOptions: any = {
            where,
            orderBy,
            skip: systemColumns.includes(sortColumn) ? pagination.offset : 0
        }

        if (systemColumns.includes(sortColumn) && pagination.limit) {
            findManyOptions.take = pagination.limit
        }

        let [dataRows, totalCount] = await Promise.all([
            this.prisma.tableData.findMany(findManyOptions),
            this.prisma.tableData.count({where})
        ])

        // If sorting by data column, sort in memory after fetching
        if (!systemColumns.includes(sortColumn)) {
            // Parse and sort
            const parsedRows = dataRows.map(row => ({
                ...row,
                parsedData: JSON.parse(row.data)
            }))

            parsedRows.sort((a, b) => {
                const aValue = a.parsedData[sortColumn]
                const bValue = b.parsedData[sortColumn]

                // Handle null/undefined values
                if (aValue == null && bValue == null) return 0
                if (aValue == null) return sortDirection === 'asc' ? -1 : 1
                if (bValue == null) return sortDirection === 'asc' ? 1 : -1

                // Compare values
                let comparison = 0
                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    comparison = aValue - bValue
                } else {
                    comparison = String(aValue).localeCompare(String(bValue))
                }

                return sortDirection === 'asc' ? comparison : -comparison
            })

            // Apply pagination after sorting
            dataRows = parsedRows
                .slice(pagination.offset, pagination.offset + pagination.limit)
                .map(({ parsedData, ...row }) => row)
        }

        // Parse JSON data and convert to camelCase
        const parsedData = dataRows.map(row => ({
            id: row.id,
            tableId: row.tableId,
            data: JSON.parse(row.data),
            createdBy: row.createdBy,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt
        })) as ParsedTableDataRow[]

        return {data: parsedData, totalCount}
    }

    /**
     * Find data row by ID using Prisma ORM
     * Returns parsed data row with data already parsed from JSON
     * Uses KV cache for high-performance lookups
     */
    async findDataRowById(rowId: string, tableId: string): Promise<ParsedTableDataRow | null> {
        // Check cache first
        if (this.cache) {
            const cached = await this.cache.getItemData(tableId, rowId)
            if (cached) {
                return cached
            }
        }

        // Cache miss - fetch from DB
        const row = await this.prisma.tableData.findUnique({
            where: {
                id: rowId,
                tableId: tableId
            }
        })

        if (!row) return null

        const result = {
            id: row.id,
            tableId: row.tableId,
            data: JSON.parse(row.data),
            createdBy: row.createdBy,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt
        }

        // Cache for future requests
        if (this.cache) {
            await this.cache.setItemData(tableId, result)
        }

        return result
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

        // Invalidate row count cache since a row was added
        if (this.cache) {
            await this.cache.invalidateRowCount(tableId)
        }

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

        // Invalidate item cache since data changed
        if (this.cache) {
            await this.cache.invalidateItemData(tableId, rowId)
        }

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
    async deleteDataRow(rowId: string, tableId: string): Promise<ParsedTableDataRow> {
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

        // Invalidate caches since row was deleted
        if (this.cache) {
            await Promise.all([
                this.cache.invalidateItemData(tableId, rowId),
                this.cache.invalidateRowCount(tableId)
            ])
        }

        return existingRow
    }

    /**
     * Check table access using Prisma ORM
     * Now supports token-based table access control
     * Uses KV cache for high-performance permission checks
     */
    async checkTableAccess(tableId: string, userId: string, userContext?: any): Promise<boolean> {
        // Check if token has explicit table access (no caching needed - token data already validated)
        if (userContext?.token?.tableAccess) {
            try {
                const allowedTables = JSON.parse(userContext.token.tableAccess)
                if (Array.isArray(allowedTables) && allowedTables.includes(tableId)) {
                    return true // Token has explicit access to this table
                }
            } catch (error) {
                console.error('Error parsing token tableAccess:', error)
            }
        }

        // Check if it's a standalone token (admin-token, frontend-token)
        if (userContext?.tokenId === 'admin-token' || userContext?.tokenId === 'frontend-token') {
            return true // Standalone tokens have unrestricted access
        }

        // Check cache for user+table access decision
        if (this.cache) {
            const cachedAccess = await this.cache.getAccess(userId, tableId)
            if (cachedAccess !== null) {
                return cachedAccess
            }
        }

        // Fall back to standard user/visibility check
        const table = await this.prisma.userTable.findFirst({
            where: {
                id: tableId,
                OR: [
                    {userId: userId},
                    {visibility: { in: ['public', 'shared'] }}
                ]
            },
            select: {id: true}
        })

        const hasAccess = !!table

        // Cache the access decision
        if (this.cache) {
            await this.cache.setAccess(userId, tableId, hasAccess)
        }

        return hasAccess
    }

    /**
     * Get all row IDs for a table (used for "select all" functionality)
     */
    async getAllRowIds(tableId: string): Promise<string[]> {
        const rows = await this.prisma.tableData.findMany({
            where: { tableId },
            select: { id: true }
        })
        return rows.map(row => row.id)
    }

    /**
     * Execute mass action on table data using Prisma ORM
     */
    async executeMassAction(
        tableId: string,
        action: TableDataMassAction,
        rowIds: string[],
        options?: { fieldName?: string; value?: string | number }
    ): Promise<{ count: number; data?: TableDataRow[] }> {
        const where = {
            id: {in: rowIds},
            tableId: tableId
        }

        switch (action) {
            case 'delete':
                const deleteResult = await this.prisma.tableData.deleteMany({where})

                // Invalidate caches for deleted rows
                if (this.cache && deleteResult.count > 0) {
                    await Promise.all([
                        // Invalidate item caches
                        ...rowIds.map(rowId => this.cache!.invalidateItemData(tableId, rowId)),
                        // Invalidate row count
                        this.cache.invalidateRowCount(tableId)
                    ])
                }

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

            case 'set_field_value':
                if (!options?.fieldName || options?.value === undefined) {
                    throw new Error('Field name and value are required for set_field_value action')
                }

                // Get all rows to update
                const rowsToUpdate = await this.prisma.tableData.findMany({
                    where,
                    select: { id: true, data: true }
                })

                // Update each row's JSON data with the new field value
                let updatedCount = 0
                for (const row of rowsToUpdate) {
                    const currentData = JSON.parse(row.data)
                    currentData[options.fieldName] = options.value

                    await this.prisma.tableData.update({
                        where: { id: row.id },
                        data: {
                            data: JSON.stringify(currentData),
                            updatedAt: new Date()
                        }
                    })
                    updatedCount++
                }

                // Invalidate item caches for updated rows
                if (this.cache && updatedCount > 0) {
                    await Promise.all(
                        rowIds.map(rowId => this.cache!.invalidateItemData(tableId, rowId))
                    )
                }

                return { count: updatedCount }

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
     * Get table info including tableType using Prisma ORM
     */
    async getTableInfo(tableId: string): Promise<{ tableType: string; name: string; forSale: boolean } | null> {
        const table = await this.prisma.userTable.findUnique({
            where: {id: tableId},
            select: {tableType: true, name: true}
        })
        if (!table) return null
        return {
            tableType: table.tableType,
            name: table.name,
            // Legacy compatibility: forSale is true when tableType is 'sale'
            forSale: table.tableType === 'sale'
        }
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

    /**
     * Get all data rows for a table (without pagination) - used for bulk operations
     */
    async getAllDataForTable(tableId: string): Promise<{ id: string; data: any }[]> {
        const rows = await this.prisma.tableData.findMany({
            where: { tableId },
            select: { id: true, data: true }
        })

        return rows.map(row => ({
            id: row.id,
            data: row.data
        }))
    }

    /**
     * Update data row directly by ID (for bulk operations)
     */
    async updateDataRowDirect(rowId: string, data: any): Promise<void> {
        await this.prisma.tableData.update({
            where: { id: rowId },
            data: {
                data: JSON.stringify(data),
                updatedAt: new Date()
            }
        })
    }

    /**
     * Get distinct values for a specific column using optimized SQL
     * Uses json_extract() to directly query JSON column values
     * Much faster than fetching all rows and extracting in memory
     *
     * @param tableId - The table to query
     * @param columnName - The JSON column name to extract
     * @param filters - Optional filters to apply (column:value pairs)
     * @returns Array of distinct values
     */
    async getDistinctColumnValues(
        tableId: string,
        columnName: string,
        filters?: Record<string, string>
    ): Promise<any[]> {
        // Build the SQL query with json_extract
        // SQLite's json_extract returns the value at the given path
        let sql = `
            SELECT DISTINCT json_extract(data, '$.${columnName}') as value
            FROM tableData
            WHERE tableId = ?
            AND json_extract(data, '$.${columnName}') IS NOT NULL
            AND json_extract(data, '$.${columnName}') != ''
        `;

        const params: any[] = [tableId];

        // Add filter conditions
        if (filters && Object.keys(filters).length > 0) {
            for (const [filterCol, filterValue] of Object.entries(filters)) {
                sql += ` AND (
                    LOWER(json_extract(data, '$.${filterCol}')) = LOWER(?)
                    OR json_extract(data, '$.${filterCol}') = ?
                )`;
                params.push(filterValue, filterValue);
            }
        }

        sql += ' LIMIT 10000'; // Safety limit

        try {
            const results = await this.prisma.$queryRawUnsafe<Array<{ value: any }>>(sql, ...params);
            return results
                .map(r => r.value)
                .filter(v => v !== null && v !== undefined && v !== '');
        } catch (error) {
            console.error('getDistinctColumnValues error:', error);
            // Fallback to null - caller should handle by using legacy method
            return [];
        }
    }

    /**
     * Get distinct values for a column across multiple tables
     * Optimized batch query that combines results from multiple tables
     *
     * @param tableIds - Array of table IDs to query
     * @param columnName - The JSON column name to extract
     * @param filters - Optional filters to apply
     * @returns Array of distinct values (deduplicated across all tables)
     */
    async getDistinctColumnValuesMultiTable(
        tableIds: string[],
        columnName: string,
        filters?: Record<string, string>
    ): Promise<any[]> {
        if (tableIds.length === 0) return [];

        // For a single table, use the simpler method
        if (tableIds.length === 1 && tableIds[0]) {
            return this.getDistinctColumnValues(tableIds[0], columnName, filters);
        }

        // Build placeholders for table IDs
        const placeholders = tableIds.map(() => '?').join(',');

        let sql = `
            SELECT DISTINCT json_extract(data, '$.${columnName}') as value
            FROM tableData
            WHERE tableId IN (${placeholders})
            AND json_extract(data, '$.${columnName}') IS NOT NULL
            AND json_extract(data, '$.${columnName}') != ''
        `;

        const params: any[] = [...tableIds];

        // Add filter conditions
        if (filters && Object.keys(filters).length > 0) {
            for (const [filterCol, filterValue] of Object.entries(filters)) {
                sql += ` AND (
                    LOWER(json_extract(data, '$.${filterCol}')) = LOWER(?)
                    OR json_extract(data, '$.${filterCol}') = ?
                )`;
                params.push(filterValue, filterValue);
            }
        }

        sql += ' LIMIT 10000'; // Safety limit

        try {
            const results = await this.prisma.$queryRawUnsafe<Array<{ value: any }>>(sql, ...params);
            return results
                .map(r => r.value)
                .filter(v => v !== null && v !== undefined && v !== '');
        } catch (error) {
            console.error('getDistinctColumnValuesMultiTable error:', error);
            return [];
        }
    }
}
