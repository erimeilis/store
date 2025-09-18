/**
 * Table Import Service
 * Handles importing data into dynamic tables
 * Main entry point that delegates to specialized functions
 */

import type { Bindings } from '@/types/bindings.js'
import type { ImportOptions, ImportResult } from '@/types/table-import.js'
import { importTableData } from './importTableData.js'

/**
 * Main entry point for importing data into tables
 * Delegates to specialized import function
 */
export async function importTableDataService(
    env: Bindings,
    options: ImportOptions
): Promise<ImportResult> {
    return importTableData(env, options)
}

// Re-export utility functions for direct use if needed
export { convertValueToColumnType } from './convertValueToColumnType.js'
export { parseDate } from './parseDate.js'
export { importTableData } from './importTableData.js'