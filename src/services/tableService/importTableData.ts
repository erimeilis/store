import type { Context } from 'hono'
import type { UserContext } from '@/types/database.js'
import type { ImportTableDataRequest, ImportResult } from '@/types/table-queries.js'
import type { TableRepository } from '@/repositories/tableRepository.js'
import { getUserInfo, createErrorResponse, createSuccessResponse } from '@/utils/common.js'
import { convertToCountryCode } from '@/utils/countryConverter.js'
import { validateDuplicates } from '@/utils/validateDuplicates.js'
import { InventoryTrackingService } from '@/services/inventoryTrackingService/index.js'

/**
 * Import data into table
 */
export async function importTableData(
  repository: TableRepository,
  c: Context,
  user: UserContext,
  tableId: string,
  importData: ImportTableDataRequest
): Promise<any> {
  try {
    const { userId } = getUserInfo(c, user)

    // Get table and verify ownership
    const table = await repository.getTable(tableId, userId)
    if (!table) {
      return createErrorResponse('Table not found', 'Table not found or access denied', 404)
    }

    // Verify user owns the table (import requires ownership)
    if (table.createdBy !== getUserInfo(c, user).userEmail) {
      return createErrorResponse('Access denied', 'Only table owners can import data', 403)
    }

    // Get table columns for validation
    const columns = await repository.getTableColumns(tableId)
    const columnMap = new Map(columns.map(col => [col.name, col]))

    // Build header-to-index mapping
    let headerIndexMap = new Map<string, number>()
    let dataStartIndex = 0

    if (importData.hasHeaders && importData.headers) {
      // Headers are provided separately (already extracted by parser)
      importData.headers.forEach((header: string, index: number) => {
        headerIndexMap.set(String(header), index)
      })
      dataStartIndex = 0 // All rows in data array are data rows (headers already removed)
    } else if (importData.hasHeaders && importData.data.length > 0) {
      // Legacy: Headers are in first row of data array
      const headers = importData.data[0]
      if (headers) {
        headers.forEach((header: string, index: number) => {
          headerIndexMap.set(String(header), index)
        })
      }
      dataStartIndex = 1 // Skip header row when processing data
    } else {
      // No headers, use column indices (Column 1, Column 2, etc.)
      if (importData.data.length > 0 && importData.data[0]) {
        importData.data[0].forEach((_, index: number) => {
          headerIndexMap.set(`Column ${index + 1}`, index)
        })
      }
      dataStartIndex = 0 // Process all rows as data
    }

    console.log('🔍 Import Debug - Raw Import Data:', {
      hasHeaders: importData.hasHeaders,
      headers: importData.headers,
      dataLength: importData.data.length,
      firstRow: importData.data[0],
      secondRow: importData.data[1],
      columnMappings: importData.columnMappings
    })
    console.log('🔍 Import Debug - Header Index Map:', Object.fromEntries(headerIndexMap))
    console.log('🔍 Import Debug - Data Start Index:', dataStartIndex)

    // PHASE 1: VALIDATE ALL ROWS FIRST (without inserting anything)
    console.log('🔍 Import: Starting validation phase...')
    const processedRows: any[] = []
    const validationErrors: string[] = []
    const allValuesToCheck = new Map<string, Set<any>>() // Track values within the import for duplicate checking

    for (let rowIndex = dataStartIndex; rowIndex < importData.data.length; rowIndex++) {
      const rowData = importData.data[rowIndex]
      if (!rowData) continue

      let processedData: any = {}

      // Map columns according to mapping
      for (const mapping of importData.columnMappings) {
        const sourceIndex = headerIndexMap.get(mapping.sourceColumn)

        if (sourceIndex !== undefined && rowData[sourceIndex] !== undefined) {
          const targetColumn = columnMap.get(mapping.targetColumn)
          if (targetColumn) {
            let value = rowData[sourceIndex]

            // Type conversion based on column type
            if (value !== null && value !== undefined && value !== '') {
              try {
                switch (targetColumn.type) {
                  case 'number':
                    value = parseFloat(String(value))
                    if (isNaN(value)) throw new Error('Invalid number')
                    break
                  case 'boolean':
                    const str = String(value).toLowerCase()
                    value = ['true', '1', 'yes', 'y', 'on'].includes(str)
                    break
                  case 'date':
                    // Basic date parsing - could be enhanced
                    const date = new Date(String(value))
                    if (isNaN(date.getTime())) throw new Error('Invalid date')
                    value = date.toISOString()
                    break
                  case 'country':
                    // Use the comprehensive country converter that handles names, ISO2, ISO3, and aliases
                    try {
                      value = convertToCountryCode(String(value))
                    } catch (countryError) {
                      throw new Error(`Invalid country: "${value}". ${countryError instanceof Error ? countryError.message : 'Country not recognized'}`)
                    }
                    break
                  default:
                    value = String(value)
                }
              } catch (conversionError) {
                const errorMessage = `Row ${rowIndex - dataStartIndex + 1}, Column "${mapping.targetColumn}": ${conversionError instanceof Error ? conversionError.message : 'Conversion failed'}`
                console.log(`❌ Validation Error - ${errorMessage}`)
                validationErrors.push(errorMessage)
                continue // Continue processing other rows to collect all errors
              }
            }

            processedData[mapping.targetColumn] = value
          }
        }
      }

      // Apply default values using shared utility
      const { applyDefaultValues } = await import('@/utils/applyDefaultValues.js')
      processedData = applyDefaultValues(processedData, columns)

      // Validate required fields
      for (const column of columns) {
        const hasDefaultValue = column.defaultValue !== null && column.defaultValue !== undefined
        if (column.isRequired && !hasDefaultValue && (processedData[column.name] === undefined || processedData[column.name] === null || processedData[column.name] === '')) {
          const errorMessage = `Row ${rowIndex - dataStartIndex + 1}: Required field "${column.name}" is missing or empty`
          validationErrors.push(errorMessage)
        }
      }

      // Check for duplicates within the import data itself AND against existing data
      for (const column of columns) {
        if (!column.allowDuplicates && processedData[column.name] !== undefined && processedData[column.name] !== null && processedData[column.name] !== '') {
          const columnName = column.name
          const value = processedData[columnName]

          // Initialize tracking for this column if not exists
          if (!allValuesToCheck.has(columnName)) {
            allValuesToCheck.set(columnName, new Set())
          }

          const valuesForColumn = allValuesToCheck.get(columnName)!

          // Check for duplicates within the import data
          if (valuesForColumn.has(value)) {
            const errorMessage = `Row ${rowIndex - dataStartIndex + 1}: Column "${columnName}" does not allow duplicate values. Value "${value}" appears multiple times in the import data.`
            validationErrors.push(errorMessage)
          } else {
            valuesForColumn.add(value)
          }

          // Check for duplicates against existing data (only if not in replace mode, since replace clears all data)
          if (importData.importMode !== 'replace') {
            const duplicateValidation = await validateDuplicates(
              tableId,
              columns,
              { [columnName]: value },
              repository
            )

            if (!duplicateValidation.valid) {
              const errorMessage = `Row ${rowIndex - dataStartIndex + 1}: ${duplicateValidation.errors.join('. ')}`
              validationErrors.push(errorMessage)
            }
          }
        }
      }

      processedRows.push(processedData)
    }

    // If any validation errors occurred, fail the entire import
    if (validationErrors.length > 0) {
      console.log(`❌ Import validation failed with ${validationErrors.length} errors`)
      return createErrorResponse(
        'Import failed',
        validationErrors[0] || 'Unknown validation error', // Return first error as primary message
        400
      )
    }

    console.log(`✅ Import validation passed for all ${processedRows.length} rows`)

    // PHASE 2: CLEAR EXISTING DATA IF REPLACE MODE (only after validation passes)
    if (importData.importMode === 'replace') {
      console.log('🔄 Clearing existing data (replace mode)...')
      await repository.clearTableData(tableId)
    }

    // PHASE 3: INSERT ALL VALIDATED ROWS
    console.log('💾 Starting data insertion phase...')
    let importedRows = 0
    const insertErrors: string[] = []

    for (let i = 0; i < processedRows.length; i++) {
      const processedData = processedRows[i]
      try {
        await repository.insertTableData(tableId, processedData, userId)
        importedRows++
      } catch (insertError) {
        const errorMessage = `Row ${i + 1}: ${insertError instanceof Error ? insertError.message : 'Insert failed'}`
        insertErrors.push(errorMessage)
        console.log(`❌ Insert Error - ${errorMessage}`)
      }
    }

    const result: ImportResult = {
      importedRows,
      errors: insertErrors.slice(0, 10), // Limit to first 10 errors
      totalErrors: insertErrors.length
    }

    if (importedRows === 0) {
      return createErrorResponse(
        'Import failed',
        `No rows were imported. ${insertErrors.length > 0 ? 'First error: ' + insertErrors[0] : ''}`,
        400
      )
    }

    // Track inventory for 'sale' type tables
    if (table.tableType === 'sale' && importedRows > 0) {
      try {
        const inventoryService = new InventoryTrackingService(c.env.DB)
        const successfulRows = processedRows.slice(0, importedRows) // Only track successfully imported rows

        await inventoryService.trackBulkImport(
          tableId,
          table.name,
          successfulRows,
          getUserInfo(c, user).userEmail,
          importData.importMode
        )
      } catch (inventoryError) {
        console.error('⚠️ Failed to track import in inventory:', inventoryError)
        // Continue without failing the main operation
      }
    }

    return createSuccessResponse(
      result,
      `Successfully imported ${importedRows} rows${insertErrors.length > 0 ? ` (${insertErrors.length} errors)` : ''}`
    )
  } catch (error) {
    return createErrorResponse(
      'Import failed',
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
}