/**
 * Import data into dynamic tables
 * Main import logic with transaction handling and validation
 * Refactored to use Prisma ORM instead of raw SQL
 * Enhanced with "Warn-Don't-Block" validation pattern
 */

import type { Bindings } from '@/types/bindings.js'
import type { ImportOptions, ImportResult, ColumnInfo, TableColumn, ImportValidationWarning } from '@/types/table-import.js'
import { convertValueToColumnType } from './convertValueToColumnType.js'
import { applyDefaultValues } from '@/utils/applyDefaultValues.js'
import { getPrismaClient } from '@/lib/database.js'
import { validateValue } from '@/services/validationService.js'

export async function importTableData(
    env: Bindings,
    options: ImportOptions
): Promise<ImportResult> {
    const { tableId, data, columnMappings, importMode } = options
    const prisma = getPrismaClient(env)

    // Validate table exists and get tableType status using Prisma
    const tableCheck = await prisma.userTable.findUnique({
        where: { id: tableId },
        select: { id: true, tableType: true }
    })

    if (!tableCheck) {
        throw new Error('Table not found')
    }

    const isSaleTable = tableCheck.tableType === 'sale'

    // Get table columns for validation using Prisma
    const rawColumns = await prisma.tableColumn.findMany({
        where: { tableId },
        select: {
            name: true,
            type: true,
            isRequired: true,
            defaultValue: true,
            position: true
        },
        orderBy: { position: 'asc' }
    })

    const tableColumns: TableColumn[] = rawColumns.map(col => ({
        name: col.name,
        type: col.type,
        isRequired: col.isRequired,
        defaultValue: col.defaultValue,
        orderIndex: col.position
    }))

    const columnMap = new Map<string, ColumnInfo>(
        tableColumns.map((col) => [col.name, { type: col.type, required: !!col.isRequired, defaultValue: col.defaultValue }])
    )

    console.log('🔍 Import Column Map:', Array.from(columnMap.entries()).map(([name, info]) => ({
        name,
        required: info.required,
        defaultValue: info.defaultValue,
        hasDefaultValue: info.defaultValue !== null && info.defaultValue !== undefined
    })))

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
    const warnings: ImportValidationWarning[] = []
    const columnWarnings: Record<string, number> = {}

    try {
        // Use Prisma transaction instead of raw SQL
        await prisma.$transaction(async (tx) => {
            // If replace mode, clear existing data using Prisma
            if (importMode === 'replace') {
                await tx.tableData.deleteMany({
                    where: { tableId }
                })
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

                        // For non-required country fields, allow null values (which come from empty-like input)
                        if (columnInfo.type === 'country' && !columnInfo.required && convertedValue === null) {
                            // Skip adding null country values to rowData for non-required fields
                            continue
                        }

                        if (convertedValue !== null && convertedValue !== undefined) {
                            hasValidData = true
                            rowData[targetColumn] = convertedValue

                            // Validate value against column type (Warn-Don't-Block pattern)
                            // Data is still imported, but warnings are collected
                            const validationResult = validateValue(convertedValue, targetColumn, columnInfo.type)
                            if (!validationResult.isValid) {
                                // Limit warnings to 100 max for performance
                                if (warnings.length < 100) {
                                    warnings.push({
                                        row: rowIndex + 1,
                                        column: targetColumn,
                                        value: convertedValue,
                                        error: validationResult.error || 'Invalid value',
                                        suggestion: validationResult.suggestion
                                    })
                                }
                                // Track per-column warning counts
                                columnWarnings[targetColumn] = (columnWarnings[targetColumn] || 0) + 1
                            }
                        }
                    }

                    // Apply default values using shared utility
                    console.log('🔍 Import Row Data BEFORE defaults:', JSON.stringify(rowData, null, 2))
                    // Map tableColumns to the format expected by applyDefaultValues
                    const mappedColumns = tableColumns.map(col => ({
                        name: col.name,
                        type: col.type,
                        isRequired: col.isRequired,
                        defaultValue: col.defaultValue ?? null
                    }))
                    const processedRowData = applyDefaultValues(rowData, mappedColumns)
                    console.log('🔍 Import Row Data AFTER defaults:', JSON.stringify(processedRowData, null, 2))

                    // Check if we have valid data after applying defaults
                    if (Object.keys(processedRowData).length > 0) {
                        hasValidData = true
                    }

                    // Now validate required fields after defaults have been applied
                    for (const [columnName, columnInfo] of columnMap.entries()) {
                        const hasDefaultValue = columnInfo.defaultValue !== null && columnInfo.defaultValue !== undefined
                        const finalValue = processedRowData[columnName]

                        if (columnInfo.required && !hasDefaultValue && (finalValue === null || finalValue === undefined || finalValue === '')) {
                            throw new Error(`Required field '${columnName}' is missing or empty`)
                        }
                    }

                    // Skip rows with no valid data
                    if (!hasValidData) {
                        skippedRows++
                        continue
                    }

                    // Add default values for "sale" type tables if price/qty columns exist but weren't mapped
                    if (isSaleTable) {
                        const hasPriceColumn = tableColumns.some(col => col.name.toLowerCase() === 'price')
                        const hasQtyColumn = tableColumns.some(col => col.name.toLowerCase() === 'qty')
                        const priceIsMapped = validMappings.some(m => m.targetColumn.toLowerCase() === 'price')
                        const qtyIsMapped = validMappings.some(m => m.targetColumn.toLowerCase() === 'qty')

                        // Set default price = 0 if price column exists but wasn't mapped
                        if (hasPriceColumn && !priceIsMapped && processedRowData.price === undefined) {
                            processedRowData.price = 0
                        }

                        // Set default qty = 1 if qty column exists but wasn't mapped
                        if (hasQtyColumn && !qtyIsMapped && processedRowData.qty === undefined) {
                            processedRowData.qty = 1
                        }
                    }

                    // Insert the row using Prisma instead of raw SQL
                    await tx.tableData.create({
                        data: {
                            tableId,
                            data: JSON.stringify(processedRowData)
                        }
                    })

                    importedRows++

                } catch (error) {
                    const errorMsg = `Row ${rowIndex + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`
                    errors.push(errorMsg)
                    skippedRows++

                    // Continue processing other rows instead of failing completely
                    console.warn(errorMsg)
                }
            }
        })

    } catch (error) {
        // Transaction will auto-rollback on error in Prisma
        throw error
    }

    // Return results with validation summary
    const totalWarnings = Object.values(columnWarnings).reduce((sum, count) => sum + count, 0)

    const result: ImportResult = {
        importedRows,
        skippedRows,
        errors: errors.slice(0, 10), // Limit errors to first 10
        warnings: warnings.slice(0, 50), // Limit detailed warnings to first 50
        validationSummary: totalWarnings > 0 ? {
            totalWarnings,
            columnWarnings
        } : undefined
    }

    if (importedRows === 0 && errors.length > 0) {
        throw new Error(`Import failed: ${errors[0]}`)
    }

    return result
}