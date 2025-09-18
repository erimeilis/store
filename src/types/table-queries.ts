/**
 * Query interfaces for table operations
 */

export interface ListTablesQuery {
  page?: number
  limit?: number
  sort?: string
  direction?: string
  filter_name?: string
  filter_description?: string
  filter_owner?: string
  filter_visibility?: string
  filter_created_at?: string
  filter_updated_at?: string
}

export interface TableFilters {
  name?: string
  description?: string
  owner?: string
  visibility?: string
  createdAt?: string
  updatedAt?: string
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
  is_required: boolean
  default_value: string | null
}

export interface AddColumnRequest {
  name: string
  type: string
  is_required?: boolean | string
  default_value?: string | null
  position?: number
}

export interface UpdateColumnRequest {
  name?: string
  type?: string
  is_required?: boolean
  default_value?: string | null
}