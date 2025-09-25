/**
 * Table import types and interfaces
 */

export interface ImportOptions {
    tableId: string
    data: any[][]
    columnMappings: Array<{ sourceColumn: string; targetColumn: string }>
    importMode: 'add' | 'replace'
    hasHeaders: boolean
}

export interface ImportResult {
    importedRows: number
    skippedRows: number
    errors: string[]
}

export interface ColumnInfo {
    type: string
    required: boolean
    defaultValue?: string | null | undefined
}

export interface TableColumn {
    name: string
    type: string
    isRequired: boolean
    defaultValue?: string | null
    orderIndex: number
}