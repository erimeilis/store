import { BaseModel } from './models'
import { isValidCountryCode } from '@/lib/country-utils'

/**
 * Supported column types for user-created tables (matching backend)
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

// Access level definitions matching backend
export type TableAccessLevel = 'none' | 'read' | 'write' | 'admin'

// Visibility level definitions matching backend
export type TableVisibility = 'private' | 'public' | 'shared'

// Table type for commerce mode
export type TableType = 'default' | 'sale' | 'rent'

// Rental period options for rent-type tables
export type RentalPeriod = 'hour' | 'day' | 'week' | 'month' | 'year'

// Frontend interfaces matching backend types
export interface UserTable extends BaseModel {
  id: string
  name: string
  description?: string | null
  createdBy: string
  visibility: TableVisibility
  forSale: boolean // Legacy: Whether table is configured for e-commerce with protected price/qty columns
  tableType?: TableType // New: Table type (default, sale, rent)
  productIdColumn?: string | null // Column name that serves as product identifier/title
  rentalPeriod?: RentalPeriod | null // Billing period for rent tables (default: 'month')
  createdAt: string
  updatedAt: string
  ownerDisplayName?: string // Friendly display name for the owner
  rowCount?: number // Total number of data rows in this table
}

export interface TableColumn extends BaseModel {
  id: string
  tableId: string
  name: string
  type: ColumnType
  isRequired: boolean
  allowDuplicates: boolean
  defaultValue?: string | null
  position: number
  createdAt: string
}

export interface TableDataRow extends BaseModel {
  id: string
  tableId: string
  data: ParsedTableData // JSON object with column data
  createdBy?: string | null
  createdAt: string
  updatedAt: string
}

// Table schema combining table with columns
export interface TableSchema {
  table: UserTable
  columns: TableColumn[]
}

// Table with data for display
export interface TableWithData {
  table: UserTable
  columns: TableColumn[]
  data: TableDataRow[]
}

// Dynamic data structure (key-value pairs)
export interface ParsedTableData {
  [columnName: string]: any
}

// API Request/Response types
export interface CreateTableRequest {
  name: string
  description?: string
  visibility?: TableVisibility
  tableType?: TableType
  productIdColumn?: string
  rentalPeriod?: RentalPeriod
  forSale?: boolean // @deprecated Use tableType instead
  columns: CreateColumnRequest[]
}

export interface CreateColumnRequest {
  name: string
  type: ColumnType
  isRequired?: boolean
  allowDuplicates?: boolean
  defaultValue?: string
  position?: number
}

export interface UpdateTableRequest {
  name?: string
  description?: string
  visibility?: TableVisibility
  tableType?: TableType
  productIdColumn?: string | null
  rentalPeriod?: RentalPeriod
  forSale?: boolean // @deprecated Use tableType instead
}

export interface AddTableDataRequest {
  data: ParsedTableData
}

export interface UpdateTableDataRequest {
  data: ParsedTableData
}

export interface CloneTableRequest {
  sourceTableId: string
  newTableName: string
  description?: string
  visibility?: TableVisibility
  forSale?: boolean
}

// API Response types
export interface TableListResponse {
  tables: UserTable[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface TableDataResponse {
  table: TableWithData
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

// Table access context for frontend
export interface TableAccess {
  table: UserTable
  accessLevel: TableAccessLevel
  canRead: boolean
  canWrite: boolean
  canDelete: boolean
  canManage: boolean
}

// Form validation types
export interface TableFormData {
  name: string
  description: string
  visibility: TableVisibility
  tableType: TableType
  productIdColumn: string
  rentalPeriod: RentalPeriod
  forSale: boolean // @deprecated Use tableType instead
  columns: ColumnFormData[]
}

export interface ColumnFormData {
  name: string
  type: ColumnType
  isRequired: boolean
  allowDuplicates: boolean
  defaultValue: string
  position: number
}

// UI State types
export interface TableCreateState {
  formData: TableFormData
  isSubmitting: boolean
  errors: Record<string, string>
}

export interface TableEditState {
  table: TableSchema | null
  isLoading: boolean
  isSubmitting: boolean
  errors: Record<string, string>
}

export interface TableDataState {
  tableWithData: TableWithData | null
  isLoading: boolean
  selectedRows: string[]
  editingRow: string | null
  addingRow: boolean
  filters: Record<string, any>
  sortBy: string | null
  sortDirection: 'asc' | 'desc'
}

// Column type options for UI
export interface ColumnTypeOption {
  value: ColumnType
  label: string
  description: string
  icon?: string
}

export const COLUMN_TYPE_OPTIONS: ColumnTypeOption[] = [
  { value: 'text', label: 'Text', description: 'Short text input (max 255 chars)' },
  { value: 'textarea', label: 'Long Text', description: 'Multi-line text area' },
  { value: 'number', label: 'Number', description: 'Numeric value (integer or decimal)' },
  { value: 'date', label: 'Date', description: 'Date picker input' },
  { value: 'boolean', label: 'Boolean', description: 'True/false checkbox' },
  { value: 'email', label: 'Email', description: 'Email address with validation' },
  { value: 'url', label: 'URL', description: 'Web address with validation' },
  { value: 'country', label: 'Country', description: 'Country selector with name, ISO codes, and phone prefix' }
]

// Helper functions for type checking
export function isValidColumnType(type: string): type is ColumnType {
  return [
    'text', 'textarea', 'email', 'url', 'phone', 'country',
    'integer', 'float', 'currency', 'percentage', 'number',
    'date', 'time', 'datetime',
    'boolean', 'select', 'rating', 'color'
  ].includes(type)
}

export function getColumnTypeLabel(type: ColumnType): string {
  const option = COLUMN_TYPE_OPTIONS.find(opt => opt.value === type)
  return option?.label || type
}

/**
 * @deprecated Use isProtectedColumn instead
 */
export function isProtectedSaleColumn(columnName: string, tableForSale: boolean): boolean {
  const PROTECTED_SALE_COLUMNS = ['price', 'qty'];
  return tableForSale && PROTECTED_SALE_COLUMNS.includes(columnName.toLowerCase());
}

/**
 * Check if a column is protected based on table type
 * Sale tables: price, qty
 * Rent tables: price, fee, used, available
 *
 * @param columnName - The name of the column to check
 * @param tableType - The table type ('default', 'sale', 'rent')
 * @param forSale - Legacy forSale flag for backward compatibility
 */
export function isProtectedColumn(columnName: string, tableType: TableType, forSale?: boolean): boolean {
  const lowerName = columnName.toLowerCase();

  // Check new tableType first
  if (tableType === 'sale') {
    return ['price', 'qty'].includes(lowerName);
  }

  if (tableType === 'rent') {
    return ['price', 'fee', 'used', 'available'].includes(lowerName);
  }

  // Backward compatibility: if tableType is 'default' but forSale is true, treat as sale
  if (tableType === 'default' && forSale === true) {
    return ['price', 'qty'].includes(lowerName);
  }

  return false;
}

/**
 * Get protection reason for display
 *
 * @param columnName - The name of the column to check
 * @param tableType - The table type ('default', 'sale', 'rent')
 * @param forSale - Legacy forSale flag for backward compatibility
 */
export function getProtectionReason(columnName: string, tableType: TableType, forSale?: boolean): string | null {
  if (!isProtectedColumn(columnName, tableType, forSale)) {
    return null;
  }

  if (tableType === 'sale') {
    return 'For Sale';
  }

  if (tableType === 'rent') {
    return 'For Rent';
  }

  // Backward compatibility: if tableType is 'default' but forSale is true, treat as sale
  if (tableType === 'default' && forSale === true) {
    return 'For Sale';
  }

  return null;
}

// ============================================================================
// Type Change Preview & Mapping Types
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

/**
 * Response from type change apply endpoint
 */
export interface TypeChangeApplyResponse {
  table: UserTable | null
  columns: TableColumn[]
  changes: {
    renamedColumns: string[]
    createdColumns: string[]
    modifiedColumns: string[]
  }
}

export function validateColumnValue(value: any, column: TableColumn): { valid: boolean; error?: string } {
  // Basic required validation
  if (column.isRequired && (value === null || value === undefined || value === '')) {
    // A column is effectively optional if it has a default value (since the system will use the default when no value is provided)
    const hasDefaultValue = column.defaultValue !== null && column.defaultValue !== undefined;
    if (hasDefaultValue) {
      return { valid: true }
    }
    return { valid: false, error: `${column.name} is required` }
  }

  if (value === null || value === undefined || value === '') {
    return { valid: true }
  }

  // Type-specific validation
  switch (column.type) {
    case 'email': {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(String(value))) {
        return { valid: false, error: `${column.name} must be a valid email address` }
      }
      break
    }

    case 'url':
      try {
        new URL(String(value))
      } catch {
        return { valid: false, error: `${column.name} must be a valid URL` }
      }
      break

    case 'number':
      if (isNaN(Number(value))) {
        return { valid: false, error: `${column.name} must be a valid number` }
      }
      break

    case 'date': {
      const dateValue = new Date(value)
      if (isNaN(dateValue.getTime())) {
        return { valid: false, error: `${column.name} must be a valid date` }
      }
      break
    }

    case 'boolean':
      // Boolean values are typically handled by form components
      break

    case 'country':
      if (!isValidCountryCode(String(value))) {
        return { valid: false, error: `${column.name} must be a valid country code (ISO2 or ISO3)` }
      }
      break

    case 'text':
    case 'textarea':
      // Text validation can be extended here
      break
  }

  return { valid: true }
}