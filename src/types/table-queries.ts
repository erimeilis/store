/**
 * Query interfaces for table operations
 */

export interface ListTablesQuery {
    page?: number
    limit?: number
    sort?: string
    direction?: string
    filterName?: string
    filterDescription?: string
    filterOwner?: string
    filterVisibility?: string
    filterCreatedAt?: string
    filterUpdatedAt?: string
    forSale?: string
}

export interface TableFilters {
    name?: string
    description?: string
    owner?: string
    visibility?: string
    createdAt?: string
    updatedAt?: string
    forSale?: string
}

export interface TableSort {
    column: string
    direction: string
}

export interface TablePagination {
    page: number
    limit: number
    offset: number
}

export interface ImportTableDataRequest {
    data: any[][]
    columnMappings: { sourceColumn: string; targetColumn: string }[]
    importMode: 'add' | 'replace'
    hasHeaders: boolean
    headers?: string[]
}

export interface ImportResult {
    importedRows: number
    errors: string[]
    totalErrors: number
}

export interface ColumnData {
    name: string
    type: string
    isRequired: boolean
    defaultValue: string | null
}

export interface AddColumnRequest {
    name: string
    type: string
    isRequired?: boolean | string
    defaultValue?: string | null
    position?: number
}

export interface UpdateColumnRequest {
    name?: string
    type?: string
    isRequired?: boolean
    allowDuplicates?: boolean
    defaultValue?: string | null
    position?: number
}
