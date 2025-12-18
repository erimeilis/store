/**
 * Validate duplicate values for columns that don't allow duplicates
 */

import type { TableColumn, ParsedTableData } from '@/types/dynamic-tables.js'
import type { TableDataRepository } from '@/repositories/tableDataRepository.js'
import type { TableRepository } from '@/repositories/tableRepository.js'

export interface DuplicateValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Check for duplicate values in columns that don't allow duplicates
 * @param tableId - The table ID to check duplicates in
 * @param tableColumns - Array of table column definitions
 * @param newData - The new data being inserted
 * @param repository - Repository for database queries
 * @param excludeRowId - Optional row ID to exclude from duplicate check (for updates)
 */
export async function validateDuplicates(
  tableId: string,
  tableColumns: TableColumn[],
  newData: ParsedTableData,
  repository: TableDataRepository | TableRepository,
  excludeRowId?: string
): Promise<DuplicateValidationResult> {
  const errors: string[] = []

  // Find columns that don't allow duplicates
  const noDuplicateColumns = tableColumns.filter(col => !col.allowDuplicates)

  if (noDuplicateColumns.length === 0) {
    // No columns have duplicate restrictions
    return { valid: true, errors: [] }
  }

  // Check each non-duplicate column
  for (const column of noDuplicateColumns) {
    const columnName = column.name
    const newValue = newData[columnName]

    // Skip validation if the new value is null/undefined/empty
    if (newValue === null || newValue === undefined || newValue === '') {
      continue
    }

    try {
      // Check if this value already exists in the table
      const existingRows = await repository.findRowsWithColumnValue(
        tableId,
        columnName,
        newValue,
        excludeRowId
      )

      if (existingRows.length > 0) {
        errors.push(`Column "${columnName}" does not allow duplicate values. Value "${newValue}" already exists.`)
      }
    } catch (error) {
      console.error(`Error checking duplicates for column ${columnName}:`, error)
      errors.push(`Failed to validate duplicates for column "${columnName}".`)
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}