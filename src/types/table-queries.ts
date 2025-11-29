/**
 * Query interfaces for table operations
 */

export interface ListTablesQuery {
    page?: number
    limit?: number
    sort?: string
    direction?: string
    filterName?: string | undefined
    filterDescription?: string | undefined
    filterOwner?: string | undefined
    filterVisibility?: string | undefined
    filterCreatedAt?: string | undefined
    filterUpdatedAt?: string | undefined
    filterTableType?: string | undefined
    tableType?: string | undefined
    /** @deprecated Use filterTableType instead */
    filterForSale?: string | undefined
    /** @deprecated Use tableType instead */
    forSale?: string | undefined
}

export interface TableFilters {
    name?: string
    description?: string
    owner?: string
    visibility?: string
    createdAt?: string
    updatedAt?: string
    tableType?: string
    /** @deprecated Use tableType instead */
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
    allowDuplicates?: boolean | string
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
