// Dynamic Tables System Types
// Based on migration 002_dynamic_tables.sql schema

/**
 * Supported column types for user-created tables
 *
 * Text Types:
 * - text: Single line string
 * - textarea: Multi-line text
 * - email: Email address with validation
 * - url: Web address with protocol validation
 * - phone: Phone number (allows + ( ) - spaces digits)
 * - country: ISO 3166-1 alpha-2 code (2 letters)
 *
 * Numeric Types:
 * - integer: Whole numbers only
 * - float: Decimal numbers
 * - currency: Money amount (2 decimal places)
 * - percentage: Percent value (0-100, stored as decimal)
 * - number: @deprecated Use 'integer' or 'float' instead
 *
 * Date/Time Types:
 * - date: Calendar date (YYYY-MM-DD)
 * - time: Time only (HH:MM)
 * - datetime: Date + time (ISO format)
 *
 * Other Types:
 * - boolean: True/false toggle
 * - select: Dropdown options (requires options config)
 * - rating: Star rating (1-5 integer)
 * - color: Color picker (hex format)
 */
export type ColumnType =
  // Text types
  | 'text'
  | 'textarea'
  | 'email'
  | 'url'
  | 'phone'
  | 'country'
  // Numeric types
  | 'integer'
  | 'float'
  | 'currency'
  | 'percentage'
  | 'number' // @deprecated - use 'integer' or 'float'
  // Date/Time types
  | 'date'
  | 'time'
  | 'datetime'
  // Other types
  | 'boolean'
  | 'select'
  | 'rating'
  | 'color'

/**
 * Table visibility levels
 */
export type TableVisibility = 'private' | 'public' | 'shared'

/**
 * Table type - determines special behavior and protected columns
 * - 'default': Regular table with no special behavior
 * - 'sale': E-commerce table with price/qty columns, supports purchasing
 * - 'rent': Rental table with price/fee/used/available columns, supports renting/releasing
 */
export type TableType = 'default' | 'sale' | 'rent'

/**
 * Rental period options for rent-type tables
 */
export type RentalPeriod = 'hour' | 'day' | 'week' | 'month' | 'year'

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
  tableType: TableType // 'default' | 'sale' | 'rent'
  productIdColumn: string | null // Column name that serves as product identifier/title for e-commerce tables
  rentalPeriod: RentalPeriod | null // Billing period for rent tables (default: 'month')
  createdAt: Date
  updatedAt: Date
  rowCount?: number // Optional: Total number of data rows in this table
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
 * Dynamic table data row (raw from database)
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
 * Dynamic table data row with parsed data
 * Used when data is already parsed by repository methods
 */
export interface ParsedTableDataRow {
  id: string
  tableId: string
  data: ParsedTableData // Already parsed JSON data
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
  tableType?: TableType // 'default' | 'sale' | 'rent' - determines auto-created columns
  productIdColumn?: string // Column name that serves as product identifier/title
  rentalPeriod?: RentalPeriod // Billing period for rent tables (default: 'month')
  /** @deprecated Use tableType instead. Will be converted to tableType='sale' if true */
  forSale?: boolean
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
  defaultValue?: string | number | boolean
  position: number
}

/**
 * Update table request payload
 */
export interface UpdateTableRequest {
  name?: string
  description?: string
  visibility?: TableVisibility // 'private' | 'public' | 'shared'
  tableType?: TableType // 'default' | 'sale' | 'rent' - can convert between types
  productIdColumn?: string | null // Column name that serves as product identifier/title
  rentalPeriod?: RentalPeriod // Billing period for rent tables
  /** @deprecated Use tableType instead. Will be converted to tableType='sale' if true */
  forSale?: boolean
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
  tableType?: TableType // Defaults to 'default'
}

/**
 * Mass action types for table data
 */
export type TableDataMassAction = 'delete' | 'export' | 'set_field_value'

/**
 * Mass action request with optional value for populate actions
 */
export interface TableDataMassActionRequest {
  action: TableDataMassAction
  ids: string[]
  /** Field name to update (for set_field_value action) */
  fieldName?: string
  /** Value to set (for set_field_value action) */
  value?: string | number
}

/**
 * Mass action result
 */
export interface MassActionResult {
  count: number
  data?: TableDataRow[]
}

// ============================================================================
// SALE TABLE TYPE - Protected columns and defaults
// ============================================================================

/**
 * Protected column names for 'sale' type tables
 */
export const PROTECTED_SALE_COLUMNS = ['price', 'qty'] as const

/**
 * Type for protected sale column names
 */
export type ProtectedSaleColumn = typeof PROTECTED_SALE_COLUMNS[number]

/**
 * Default column definitions for 'sale' type tables
 */
export const DEFAULT_SALE_COLUMNS: Omit<CreateColumnRequest, 'position'>[] = [
  {
    name: 'price',
    type: 'number',  // Use 'number' - DB CHECK constraint doesn't allow 'currency'
    isRequired: true,
    allowDuplicates: true,
  },
  {
    name: 'qty',
    type: 'integer',
    isRequired: true,
    allowDuplicates: true,
    defaultValue: '1',
  }
]

// ============================================================================
// RENT TABLE TYPE - Protected columns and defaults
// ============================================================================

/**
 * Protected column names for 'rent' type tables
 * - price: Rental price per period
 * - fee: One-time rental fee/deposit
 * - used: Whether item has been used (rented at least once and released)
 * - available: Whether item is currently available for rent
 *
 * Rental lifecycle:
 * 1. Initial state: used=false, available=true
 * 2. When rented (via API): available=false (used stays same)
 * 3. When released (via API/admin): used=true, available=false
 * 4. Cannot make available again once used (one-time rental items)
 */
export const PROTECTED_RENT_COLUMNS = ['price', 'fee', 'used', 'available'] as const

/**
 * Type for protected rent column names
 */
export type ProtectedRentColumn = typeof PROTECTED_RENT_COLUMNS[number]

/**
 * Default column definitions for 'rent' type tables
 */
export const DEFAULT_RENT_COLUMNS: Omit<CreateColumnRequest, 'position'>[] = [
  {
    name: 'price',
    type: 'number',  // Use 'number' - DB CHECK constraint doesn't allow 'currency'
    isRequired: true,
    allowDuplicates: true,
  },
  {
    name: 'fee',
    type: 'number',  // One-time rental fee/deposit
    isRequired: true,
    allowDuplicates: true,
    defaultValue: '0',
  },
  {
    name: 'used',
    type: 'boolean',
    isRequired: true,
    allowDuplicates: true,
    defaultValue: 'false',
  },
  {
    name: 'available',
    type: 'boolean',
    isRequired: true,
    allowDuplicates: true,
    defaultValue: 'true',
  }
]

// ============================================================================
// Helper functions for table type handling
// ============================================================================

/**
 * Check if a column is protected based on table type
 */
export function isProtectedColumn(columnName: string, tableType: TableType): boolean {
  if (tableType === 'sale') {
    return PROTECTED_SALE_COLUMNS.includes(columnName as ProtectedSaleColumn)
  }
  if (tableType === 'rent') {
    return PROTECTED_RENT_COLUMNS.includes(columnName as ProtectedRentColumn)
  }
  return false
}

/**
 * Get protected columns for a table type
 */
export function getProtectedColumns(tableType: TableType): readonly string[] {
  if (tableType === 'sale') {
    return PROTECTED_SALE_COLUMNS
  }
  if (tableType === 'rent') {
    return PROTECTED_RENT_COLUMNS
  }
  return []
}

/**
 * Get default columns for a table type
 */
export function getDefaultColumns(tableType: TableType): Omit<CreateColumnRequest, 'position'>[] {
  if (tableType === 'sale') {
    return DEFAULT_SALE_COLUMNS
  }
  if (tableType === 'rent') {
    return DEFAULT_RENT_COLUMNS
  }
  return []
}

/**
 * Check if table type requires special columns
 */
export function hasSpecialColumns(tableType: TableType): boolean {
  return tableType === 'sale' || tableType === 'rent'
}

// ============================================================================
// Legacy compatibility - deprecated, use tableType instead
// ============================================================================

/**
 * @deprecated Use isProtectedColumn(columnName, tableType) instead
 */
export function isProtectedSaleColumn(columnName: string, tableForSale: boolean): boolean {
  return tableForSale && PROTECTED_SALE_COLUMNS.includes(columnName as ProtectedSaleColumn)
}

// ============================================================================
// Type Change Preview & Mapping
// ============================================================================

/**
 * Request to preview a table type change
 */
export interface TypeChangePreviewRequest {
  targetType: TableType
}

/**
 * Required column info for type change preview
 */
export interface RequiredColumnInfo {
  name: string
  type: ColumnType
  isRequired: boolean
  defaultValue?: string | null
}

/**
 * Suggested mapping for a required column
 */
export interface TypeChangeMappingItem {
  /** Required column name for target type */
  requiredColumn: string
  /** Existing column ID to map (null = create new) */
  existingColumnId: string | null
  /** Existing column name (for display) */
  existingColumnName: string | null
  /** Match confidence score (0-100) */
  confidence: number
}

/**
 * Response from type change preview endpoint
 */
export interface TypeChangePreviewResponse {
  /** Current table type */
  currentType: TableType
  /** Target table type */
  targetType: TableType
  /** Required columns for target type */
  requiredColumns: RequiredColumnInfo[]
  /** Existing columns in the table */
  existingColumns: Array<{
    id: string
    name: string
    type: ColumnType
    isRequired: boolean
  }>
  /** Suggested mappings (pre-filled based on name matching) */
  suggestedMappings: TypeChangeMappingItem[]
  /** Whether all required columns have suggested matches */
  allMapped: boolean
}

/**
 * Request to apply type change with column mappings
 */
export interface TypeChangeApplyRequest {
  targetType: TableType
  /** Column mappings: requiredColumn -> existingColumnId (null = create new) */
  columnMappings: Array<{
    requiredColumn: string
    existingColumnId: string | null
  }>
  /** Optional: rental period for rent tables */
  rentalPeriod?: RentalPeriod
}
