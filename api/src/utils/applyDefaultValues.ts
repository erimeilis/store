/**
 * Apply default values to data based on table column definitions
 * Shared utility to keep default value logic DRY between createDataRow and import
 */

import type { TableColumn } from '@/types/dynamic-tables.js'

export function applyDefaultValues(
  data: Record<string, any>,
  tableColumns: Array<{ name: string; type: string; isRequired: boolean; defaultValue: any }>
): Record<string, any> {
  const processedData = { ...data }

  console.log('🔍 Apply Defaults - Original data:', JSON.stringify(processedData, null, 2))

  // Apply actual column default values for any missing/empty fields
  for (const column of tableColumns) {
    const fieldValue = processedData[column.name]
    const isEmpty = fieldValue === undefined || fieldValue === null || fieldValue === ''

    if (isEmpty && column.defaultValue !== null && column.defaultValue !== undefined) {
      // Convert default value to appropriate type
      let defaultValue = column.defaultValue
      if (column.type === 'number') {
        defaultValue = Number(column.defaultValue)
      } else if (column.type === 'boolean') {
        defaultValue = Boolean(column.defaultValue)
      }

      console.log(`🔍 Applying default for ${column.name}: ${defaultValue} (was: ${fieldValue})`)
      processedData[column.name] = defaultValue
    }
  }

  console.log('🔍 Apply Defaults - Data after defaults:', JSON.stringify(processedData, null, 2))
  return processedData
}