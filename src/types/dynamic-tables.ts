// Dynamic Tables System Types
// Based on migration 004_dynamic_tables.sql schema

/**
 * Supported column types for user-created tables
 */
export type ColumnType = 'text' | 'number' | 'date' | 'boolean' | 'email' | 'url' | 'textarea' | 'country'

/**
 * Table visibility levels
 */
export type TableVisibility = 'private' | 'public' | 'shared'

/**
 * User-created table metadata
 * Corresponds to user_tables table
 */
export interface UserTable {
  id: string
  name: string
  description: string | null
  createdBy: string // User email or token ID
  userId: string | null // Session user ID (OAuth user ID from users table) - nullable for API token users
  visibility: TableVisibility // 'private' | 'public' | 'shared'
  forSale: boolean // Whether table is configured for e-commerce with protected price/qty columns
  createdAt: Date
  updatedAt: Date
}

/**
 * Column definition for user tables
 * Corresponds to table_columns table
 */
export interface TableColumn {
  id: string
  tableId: string
  name: string
  type: ColumnType
  isRequired: boolean
  allowDuplicates: boolean
  defaultValue: string | null
  position: number
  createdAt: Date
}

/**
 * Dynamic table data row
 * Corresponds to table_data table
 */
export interface TableDataRow {
  id: string
  tableId: string
  data: string // JSON blob with column data
  createdBy: string | null // User email
  createdAt: Date
  updatedAt: Date
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
  visibility: TableVisibility // 'private' | 'public' | 'shared'
  forSale?: boolean // Whether to create table as "for sale" with auto price/qty columns
  userId?: string  // Optional user ID for session-based creation
  columns: CreateColumnRequest[]
}

/**
 * Create column request payload
 */
export interface CreateColumnRequest {
  name: string
  type: ColumnType
  isRequired: boolean
  allowDuplicates?: boolean
  defaultValue?: string
  position: number
}

/**
 * Update table request payload
 */
export interface UpdateTableRequest {
  name?: string
  description?: string
  visibility?: TableVisibility // 'private' | 'public' | 'shared'
  forSale?: boolean // Whether to convert table to/from "for sale" mode
}

/**
 * Update column request payload
 */
export interface UpdateColumnRequest {
  name?: string
  type?: ColumnType
  isRequired?: boolean
  allowDuplicates?: boolean
  defaultValue?: string
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
  tableId: string
  importType: 'csv' | 'xls' | 'xlsx' | 'google_sheets' | 'text'
  fileData?: string // Base64 encoded file data
  googleSheetsUrl?: string
  columnMapping: { [importColumn: string]: string } // Maps import columns to table columns
  skipHeader?: boolean
}

/**
 * Import preview response
 */
export interface ImportPreview {
  headers: string[]
  sampleRows: any[][]
  totalRows: number
  suggestedMapping: { [importColumn: string]: string }
}

/**
 * Import result response
 */
export interface ImportResult {
  success: boolean
  importedRows: number
  errors: string[]
  skippedRows: number
}

/**
 * Table access permission levels
 */
export type TableAccessLevel = 'none' | 'read' | 'write' | 'admin'

/**
 * Table access check result
 */
export interface TableAccess {
  canRead: boolean
  canWrite: boolean
  canDelete: boolean
  canManage: boolean // Modify schema, permissions, etc.
  accessLevel: TableAccessLevel
}

/**
 * Column validation result
 */
export interface ColumnValidationResult {
  valid: boolean
  error?: string
  convertedValue?: any
}

/**
 * Table data validation result
 */
export interface TableDataValidationResult {
  valid: boolean
  errors: { [columnName: string]: string }
  validatedData: ParsedTableData
}

/**
 * Mass action types for tables
 */
export type TableMassAction = 'make_public' | 'make_private' | 'make_shared' | 'delete'

/**
 * Table cloning request payload
 */
export interface CloneTableRequest {
  sourceTableId: string
  newTableName: string
  description?: string
  visibility?: TableVisibility // Defaults to 'private'
  forSale?: boolean // Defaults to false
}

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
 * Check if a column is protected based on table forSale status
 */
export function isProtectedSaleColumn(columnName: string, tableForSale: boolean): boolean {
  return tableForSale && PROTECTED_SALE_COLUMNS.includes(columnName as ProtectedSaleColumn)
}

/**
 * Default column definitions for "for sale" tables
 */
export const DEFAULT_SALE_COLUMNS: Omit<CreateColumnRequest, 'position'>[] = [
  {
    name: 'price',
    type: 'number',
    isRequired: true,
    allowDuplicates: true,
    // no defaultValue for price (undefined, not null)
  },
  {
    name: 'qty',
    type: 'number',
    isRequired: true,
    allowDuplicates: true,
    defaultValue: '1',
  }
]
