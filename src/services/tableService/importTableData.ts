import type { Context } from 'hono'
import type { UserContext } from '@/types/database.js'
import type { ImportTableDataRequest, ImportResult } from '@/types/table-queries.js'
import type { TableRepository } from '@/repositories/tableRepository.js'
import { getUserInfo, createErrorResponse, createSuccessResponse } from '@/utils/common.js'

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
    if (table.created_by !== getUserInfo(c, user).userEmail) {
      return createErrorResponse('Access denied', 'Only table owners can import data', 403)
    }

    // Get table columns for validation
    const columns = await repository.getTableColumns(tableId)
    const columnMap = new Map(columns.map(col => [col.name, col]))

    // Clear existing data if replace mode
    if (importData.importMode === 'replace') {
      await repository.clearTableData(tableId)
    }

    let importedRows = 0
    const errors: string[] = []

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

    // Process each data row
    for (let rowIndex = dataStartIndex; rowIndex < importData.data.length; rowIndex++) {
      const rowData = importData.data[rowIndex]
      if (!rowData) continue

      const processedData: any = {}

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
                  default:
                    value = String(value)
                }
              } catch (conversionError) {
                errors.push(`Row ${rowIndex - dataStartIndex + 1}, Column "${mapping.targetColumn}": ${conversionError instanceof Error ? conversionError.message : 'Conversion failed'}`)
                continue
              }
            }

            processedData[mapping.targetColumn] = value
          }
        }
      }

      // Validate required fields
      let hasRequiredFieldsError = false
      for (const column of columns) {
        if (column.is_required && (processedData[column.name] === undefined || processedData[column.name] === null || processedData[column.name] === '')) {
          errors.push(`Row ${rowIndex - dataStartIndex + 1}: Required field "${column.name}" is missing or empty`)
          hasRequiredFieldsError = true
        }
      }

      // Skip this row if validation failed
      if (hasRequiredFieldsError) {
        continue
      }

      // Insert row
      try {
        await repository.insertTableData(tableId, processedData, userId)
        importedRows++
      } catch (insertError) {
        errors.push(`Row ${rowIndex + 1}: ${insertError instanceof Error ? insertError.message : 'Insert failed'}`)
      }
    }

    const result: ImportResult = {
      importedRows,
      errors: errors.slice(0, 10), // Limit to first 10 errors
      totalErrors: errors.length
    }

    if (importedRows === 0) {
      return createErrorResponse(
        'Import failed',
        `No rows were imported. ${errors.length > 0 ? 'First error: ' + errors[0] : ''}`,
        400
      )
    }

    return createSuccessResponse(
      result,
      `Successfully imported ${importedRows} rows${errors.length > 0 ? ` (${errors.length} errors)` : ''}`
    )
  } catch (error) {
    return createErrorResponse(
      'Import failed',
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
}