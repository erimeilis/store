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

export interface ImportValidationWarning {
    row: number
    column: string
    value: unknown
    error: string
    suggestion?: string | undefined
}

export interface ImportResult {
    importedRows: number
    skippedRows: number
    errors: string[]
    warnings?: ImportValidationWarning[] | undefined
    validationSummary?: {
        totalWarnings: number
        columnWarnings: Record<string, number>
    } | undefined
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