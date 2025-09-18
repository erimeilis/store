// Dynamic Tables System Types
// Based on migration 004_dynamic_tables.sql schema

/**
 * Supported column types for user-created tables
 */
export type ColumnType = 'text' | 'number' | 'date' | 'boolean' | 'email' | 'url' | 'textarea'

/**
 * User-created table metadata
 * Corresponds to user_tables table
 */
export interface UserTable {
  id: string
  name: string
  description: string | null
  created_by: string // User email or token ID
  user_id: string // Session user ID (OAuth user ID from users table)
  is_public: boolean
  for_sale: boolean // Whether table is configured for e-commerce with protected price/qty columns
  created_at: Date
  updated_at: Date
}

/**
 * Column definition for user tables
 * Corresponds to table_columns table
 */
export interface TableColumn {
  id: string
  table_id: string
  name: string
  type: ColumnType
  is_required: boolean
  default_value: string | null
  position: number
  created_at: Date
}

/**
 * Dynamic table data row
 * Corresponds to table_data table
 */
export interface TableDataRow {
  id: string
  table_id: string
  data: string // JSON blob with column data
  created_by: string | null // User email
  created_at: Date
  updated_at: Date
}

/**
 * Parsed table data structure
 */
export interface ParsedTableData {
  [columnName: string]: any
}

/**
 * Complete table schema with columns
 */
export interface TableSchema {
  table: UserTable
  columns: TableColumn[]
}

/**
 * Table with data rows
 */
export interface TableWithData {
  table: UserTable
  columns: TableColumn[]
  data: TableDataRow[]
}

/**
 * Create table request payload
 */
export interface CreateTableRequest {
  name: string
  description?: string
  is_public: boolean
  for_sale?: boolean // Whether to create table as "for sale" with auto price/qty columns
  user_id?: string  // Optional user ID for session-based creation
  columns: CreateColumnRequest[]
}

/**
 * Create column request payload
 */
export interface CreateColumnRequest {
  name: string
  type: ColumnType
  is_required: boolean
  default_value?: string
  position: number
}

/**
 * Update table request payload
 */
export interface UpdateTableRequest {
  name?: string
  description?: string
  is_public?: boolean
  for_sale?: boolean // Whether to convert table to/from "for sale" mode
}

/**
 * Update column request payload
 */
export interface UpdateColumnRequest {
  name?: string
  type?: ColumnType
  is_required?: boolean
  default_value?: string
  position?: number
}

/**
 * Add table data request payload
 */
export interface AddTableDataRequest {
  data: ParsedTableData
}

/**
 * Update table data request payload
 */
export interface UpdateTableDataRequest {
  data: ParsedTableData
}

/**
 * Import data request payload
 */
export interface ImportDataRequest {
  table_id: string
  import_type: 'csv' | 'xls' | 'xlsx' | 'google_sheets' | 'text'
  file_data?: string // Base64 encoded file data
  google_sheets_url?: string
  column_mapping: { [importColumn: string]: string } // Maps import columns to table columns
  skip_header?: boolean
}

/**
 * Import preview response
 */
export interface ImportPreview {
  headers: string[]
  sample_rows: any[][]
  total_rows: number
  suggested_mapping: { [importColumn: string]: string }
}

/**
 * Import result response
 */
export interface ImportResult {
  success: boolean
  imported_rows: number
  errors: string[]
  skipped_rows: number
}

/**
 * Table access permission levels
 */
export type TableAccessLevel = 'none' | 'read' | 'write' | 'admin'

/**
 * Table access check result
 */
export interface TableAccess {
  can_read: boolean
  can_write: boolean
  can_delete: boolean
  can_manage: boolean // Modify schema, permissions, etc.
  access_level: TableAccessLevel
}

/**
 * Column validation result
 */
export interface ColumnValidationResult {
  valid: boolean
  error?: string
  converted_value?: any
}

/**
 * Table data validation result
 */
export interface TableDataValidationResult {
  valid: boolean
  errors: { [columnName: string]: string }
  validated_data: ParsedTableData
}

/**
 * Mass action types for tables
 */
export type TableMassAction = 'make_public' | 'make_private' | 'delete'

/**
 * Mass action types for table data
 */
export type TableDataMassAction = 'delete' | 'export'

/**
 * Mass action result
 */
export interface MassActionResult {
  count: number
  data?: TableDataRow[]
}

/**
 * Special column names that are protected when table is for_sale
 */
export const PROTECTED_SALE_COLUMNS = ['price', 'qty'] as const

/**
 * Type for protected column names
 */
export type ProtectedSaleColumn = typeof PROTECTED_SALE_COLUMNS[number]

/**
 * Check if a column is protected based on table for_sale status
 */
export function isProtectedSaleColumn(columnName: string, tableForSale: boolean): boolean {
  return tableForSale && PROTECTED_SALE_COLUMNS.includes(columnName as ProtectedSaleColumn)
}

/**
 * Default column definitions for "for sale" tables
 */
export const DEFAULT_SALE_COLUMNS: CreateColumnRequest[] = [
  {
    name: 'price',
    type: 'number',
    is_required: true,
    // no default_value for price (undefined, not null)
    position: 999
  },
  {
    name: 'qty',
    type: 'number',
    is_required: true,
    default_value: '1',
    position: 1000
  }
]
