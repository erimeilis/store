import { BaseModel } from './models'

// Column type definitions matching backend
export type ColumnType = 'text' | 'number' | 'date' | 'boolean' | 'email' | 'url' | 'textarea'

// Access level definitions matching backend
export type TableAccessLevel = 'none' | 'read' | 'write' | 'admin'

// Frontend interfaces matching backend types
export interface UserTable extends BaseModel {
  id: string
  name: string
  description?: string | null
  created_by: string
  is_public: boolean
  for_sale: boolean // Whether table is configured for e-commerce with protected price/qty columns
  created_at: string
  updated_at: string
  owner_display_name?: string // Friendly display name for the owner
}

export interface TableColumn extends BaseModel {
  id: string
  table_id: string
  name: string
  type: ColumnType
  is_required: boolean
  default_value?: string | null
  position: number
  created_at: string
}

export interface TableDataRow extends BaseModel {
  id: string
  table_id: string
  data: ParsedTableData // JSON object with column data
  created_by?: string | null
  created_at: string
  updated_at: string
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
  is_public?: boolean
  columns: CreateColumnRequest[]
}

export interface CreateColumnRequest {
  name: string
  type: ColumnType
  is_required?: boolean
  default_value?: string
  position?: number
}

export interface UpdateTableRequest {
  name?: string
  description?: string
  is_public?: boolean
  for_sale?: boolean
}

export interface AddTableDataRequest {
  data: ParsedTableData
}

export interface UpdateTableDataRequest {
  data: ParsedTableData
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
  is_public: boolean
  for_sale: boolean
  columns: ColumnFormData[]
}

export interface ColumnFormData {
  name: string
  type: ColumnType
  is_required: boolean
  default_value: string
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
  { value: 'url', label: 'URL', description: 'Web address with validation' }
]

// Helper functions for type checking
export function isValidColumnType(type: string): type is ColumnType {
  return ['text', 'number', 'date', 'boolean', 'email', 'url', 'textarea'].includes(type)
}

export function getColumnTypeLabel(type: ColumnType): string {
  const option = COLUMN_TYPE_OPTIONS.find(opt => opt.value === type)
  return option?.label || type
}

export function isProtectedSaleColumn(columnName: string, tableForSale: boolean): boolean {
  const PROTECTED_SALE_COLUMNS = ['price', 'qty'];
  return tableForSale && PROTECTED_SALE_COLUMNS.includes(columnName.toLowerCase());
}

export function validateColumnValue(value: any, column: TableColumn): { valid: boolean; error?: string } {
  // Basic required validation
  if (column.is_required && (value === null || value === undefined || value === '')) {
    if (column.default_value) {
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

    case 'text':
    case 'textarea':
      // Text validation can be extended here
      break
  }

  return { valid: true }
}