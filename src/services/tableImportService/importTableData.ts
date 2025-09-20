/**
 * Import data into dynamic tables
 * Main import logic with transaction handling and validation
 */

import type { Bindings } from '@/types/bindings.js'
import type { ImportOptions, ImportResult, ColumnInfo, TableColumn } from '@/types/table-import.js'
import { convertValueToColumnType } from './convertValueToColumnType.js'

export async function importTableData(
    env: Bindings,
    options: ImportOptions
): Promise<ImportResult> {
    const { tableId, data, columnMappings, importMode } = options

    // Validate table exists and get for_sale status
    const tableCheck = await env.DB.prepare(
        'SELECT id, for_sale FROM user_tables WHERE id = ?'
    ).bind(tableId).first()

    if (!tableCheck) {
        throw new Error('Table not found')
    }

    const isForSaleTable = !!tableCheck.for_sale

    // Get table columns for validation
    const columnsResult = await env.DB.prepare(
        'SELECT name, type, is_required, default_value FROM table_columns WHERE table_id = ? ORDER BY order_index'
    ).bind(tableId).all()

    const tableColumns = (columnsResult.results || []) as unknown as TableColumn[]
    const columnMap = new Map<string, ColumnInfo>(
        tableColumns.map((col) => [col.name, { type: col.type, required: !!col.is_required, defaultValue: col.default_value }])
    )

    // Validate column mappings
    const validMappings = columnMappings.filter(mapping => {
        const exists = columnMap.has(mapping.targetColumn)
        if (!exists) {
            console.warn(`Column '${mapping.targetColumn}' does not exist in table`)
        }
        return exists
    })

    if (validMappings.length === 0) {
        throw new Error('No valid column mappings found')
    }

    let importedRows = 0
    let skippedRows = 0
    const errors: string[] = []

    try {
        // Start transaction
        await env.DB.exec('BEGIN TRANSACTION')

        // If replace mode, clear existing data
        if (importMode === 'replace') {
            await env.DB.prepare('DELETE FROM table_data WHERE table_id = ?')
                .bind(tableId)
                .run()
        }

        // Process each data row
        for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
            const row = data[rowIndex]

            try {
                // Build the row data object
                const rowData: Record<string, any> = {}
                let hasValidData = false

                for (const mapping of validMappings) {
                    const sourceIndex = columnMappings.findIndex(m => m.sourceColumn === mapping.sourceColumn)
                    if (sourceIndex === -1) continue

                    const cellValue = row?.[sourceIndex]
                    const targetColumn = mapping.targetColumn
                    const columnInfo = columnMap.get(targetColumn)

                    if (!columnInfo) continue

                    // Validate and convert the value
                    const convertedValue = convertValueToColumnType(cellValue, columnInfo.type)

                    // Check required fields (skip validation if field has a default value)
                    const hasDefaultValue = columnInfo.defaultValue && columnInfo.defaultValue !== 'null'
                    if (columnInfo.required && !hasDefaultValue && (convertedValue === null || convertedValue === undefined || convertedValue === '')) {
                        throw new Error(`Required field '${targetColumn}' is missing or empty`)
                    }

                    if (convertedValue !== null && convertedValue !== undefined) {
                        hasValidData = true
                        rowData[targetColumn] = convertedValue
                    }
                }

                // Apply default values for required fields that have defaults but are missing/empty
                for (const [columnName, columnInfo] of columnMap.entries()) {
                    const hasDefaultValue = columnInfo.defaultValue && columnInfo.defaultValue !== 'null'
                    if (columnInfo.required && hasDefaultValue &&
                        (rowData[columnName] === undefined || rowData[columnName] === null || rowData[columnName] === '')) {
                        const convertedDefault = convertValueToColumnType(columnInfo.defaultValue, columnInfo.type)
                        if (convertedDefault !== null && convertedDefault !== undefined) {
                            rowData[columnName] = convertedDefault
                            hasValidData = true
                        }
                    }
                }

                // Skip rows with no valid data
                if (!hasValidData) {
                    skippedRows++
                    continue
                }

                // Add default values for "for sale" tables if price/qty columns exist but weren't mapped
                if (isForSaleTable) {
                    const hasPriceColumn = tableColumns.some(col => col.name.toLowerCase() === 'price')
                    const hasQtyColumn = tableColumns.some(col => col.name.toLowerCase() === 'qty')
                    const priceIsMapped = validMappings.some(m => m.targetColumn.toLowerCase() === 'price')
                    const qtyIsMapped = validMappings.some(m => m.targetColumn.toLowerCase() === 'qty')

                    // Set default price = 0 if price column exists but wasn't mapped
                    if (hasPriceColumn && !priceIsMapped && rowData.price === undefined) {
                        rowData.price = 0
                    }

                    // Set default qty = 1 if qty column exists but wasn't mapped
                    if (hasQtyColumn && !qtyIsMapped && rowData.qty === undefined) {
                        rowData.qty = 1
                    }
                }

                // Generate UUID for the row
                const rowId = crypto.randomUUID()

                // Insert the row
                await env.DB.prepare(
                    'INSERT INTO table_data (id, table_id, data, created_at) VALUES (?, ?, ?, datetime("now"))'
                ).bind(
                    rowId,
                    tableId,
                    JSON.stringify(rowData)
                ).run()

                importedRows++

            } catch (error) {
                const errorMsg = `Row ${rowIndex + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`
                errors.push(errorMsg)
                skippedRows++

                // Continue processing other rows instead of failing completely
                console.warn(errorMsg)
            }
        }

        // Commit transaction
        await env.DB.exec('COMMIT')

    } catch (error) {
        // Rollback on any critical error
        await env.DB.exec('ROLLBACK')
        throw error
    }

    // Return results
    const result: ImportResult = {
        importedRows,
        skippedRows,
        errors: errors.slice(0, 10) // Limit errors to first 10
    }

    if (importedRows === 0 && errors.length > 0) {
        throw new Error(`Import failed: ${errors[0]}`)
    }

    return result
}