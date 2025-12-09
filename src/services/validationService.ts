/**
 * Validation Service
 * "Warn-Don't-Block" pattern - validates data and returns warnings without blocking save
 * Similar to Google Sheets behavior
 */

import { z } from 'zod'
import { BUILT_IN_COLUMN_TYPES, type BuiltInColumnType } from '@/config/columnTypes.js'

/**
 * Validation result for a single value
 */
export interface ValueValidationResult {
  isValid: boolean
  value: unknown
  columnName: string
  columnType: string
  error?: string
  suggestion?: string
}

/**
 * Validation result for a row
 */
export interface RowValidationResult {
  rowId: string | number
  isValid: boolean
  invalidCount: number
  warnings: ValueValidationResult[]
}

/**
 * Validation result for a dataset
 */
export interface DatasetValidationResult {
  totalRows: number
  validRows: number
  invalidRows: number
  totalWarnings: number
  rows: RowValidationResult[]
  summary: ColumnValidationSummary[]
}

/**
 * Summary of validation issues per column
 */
export interface ColumnValidationSummary {
  columnName: string
  columnType: string
  invalidCount: number
  validCount: number
  sampleErrors: string[]
}

/**
 * Type change preview result
 */
export interface TypeChangePreviewResult {
  columnName: string
  currentType: string
  newType: string
  totalRows: number
  compatibleRows: number
  incompatibleRows: number
  sampleIssues: Array<{
    rowId: string | number
    currentValue: unknown
    issue: string
  }>
}

/**
 * Zod schemas for each built-in column type
 * These provide "soft" validation - they don't block saves, just report issues
 */
const columnTypeSchemas: Record<string, z.ZodSchema> = {
  // Text types
  text: z.string(),
  textarea: z.string(),

  // Email with proper format
  email: z.string().email('Invalid email format'),

  // URL with protocol
  url: z.string().url('Invalid URL format'),

  // Phone number (international format with + or digits)
  phone: z.string().regex(
    /^[\+]?[0-9\s\-\(\)\.]{7,20}$/,
    'Invalid phone number format'
  ),

  // Country code (2-3 letter ISO code)
  country: z.string().regex(
    /^[A-Z]{2,3}$/i,
    'Must be 2-3 letter country code'
  ),

  // Number types
  number: z.coerce.number({ message: 'Must be a number' }),
  integer: z.coerce.number().int('Must be an integer'),
  float: z.coerce.number({ message: 'Must be a decimal number' }),

  // Currency (number with max 2 decimal places)
  currency: z.coerce.number().refine(
    (val) => Math.round(val * 100) === val * 100,
    'Currency must have at most 2 decimal places'
  ),

  // Percentage (0-100 or 0-1)
  percentage: z.coerce.number().refine(
    (val) => val >= 0 && val <= 100,
    'Percentage must be between 0 and 100'
  ),

  // Date types
  date: z.string().refine(
    (val) => /^\d{4}-\d{2}-\d{2}$/.test(val) || !isNaN(Date.parse(val)),
    'Invalid date format (use YYYY-MM-DD)'
  ),
  time: z.string().regex(
    /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/,
    'Invalid time format (use HH:MM or HH:MM:SS)'
  ),
  datetime: z.string().refine(
    (val) => !isNaN(Date.parse(val)),
    'Invalid datetime format'
  ),

  // Boolean (handles various truthy/falsy values)
  boolean: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        const lower = val.toLowerCase()
        if (['true', '1', 'yes', 'on'].includes(lower)) return true
        if (['false', '0', 'no', 'off', ''].includes(lower)) return false
      }
      return val
    },
    z.boolean({ message: 'Must be true/false, yes/no, or 1/0' })
  ),

  // Select (any string value - actual options validated separately)
  select: z.string(),

  // Rating (1-5 by default)
  rating: z.coerce.number().int().min(1).max(5).or(
    z.coerce.number().min(0).max(1) // Also allow 0-1 scale
  ),

  // Color (hex format)
  color: z.string().regex(
    /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/,
    'Invalid color format (use #RGB, #RRGGBB, or #RRGGBBAA)'
  )
}

/**
 * Get Zod schema for a column type
 */
function getSchemaForType(columnType: string): z.ZodSchema | null {
  // For module types like "@store/phone-numbers:phone", extract the base type
  const baseType = columnType.includes(':') ? columnType.split(':').pop() : columnType

  if (baseType && columnTypeSchemas[baseType]) {
    return columnTypeSchemas[baseType]
  }

  // For unknown types, allow any value
  return null
}

/**
 * Validate a single value against a column type
 */
export function validateValue(
  value: unknown,
  columnName: string,
  columnType: string
): ValueValidationResult {
  const schema = getSchemaForType(columnType)

  // If no schema, consider valid (unknown type accepts anything)
  if (!schema) {
    return {
      isValid: true,
      value,
      columnName,
      columnType
    }
  }

  // Empty values are valid (required check is separate)
  if (value === null || value === undefined || value === '') {
    return {
      isValid: true,
      value,
      columnName,
      columnType
    }
  }

  const result = schema.safeParse(value)

  if (result.success) {
    return {
      isValid: true,
      value: result.data,
      columnName,
      columnType
    }
  }

  // Extract error message
  const error = result.error.issues[0]?.message || 'Invalid value'
  const suggestion = getSuggestion(value, columnType)

  const result2: ValueValidationResult = {
    isValid: false,
    value,
    columnName,
    columnType,
    error
  }

  if (suggestion) {
    result2.suggestion = suggestion
  }

  return result2
}

/**
 * Generate helpful suggestion for fixing invalid value
 */
function getSuggestion(value: unknown, columnType: string): string | undefined {
  const baseType = columnType.includes(':') ? columnType.split(':').pop() : columnType
  const strValue = String(value)

  switch (baseType) {
    case 'email':
      if (!strValue.includes('@')) {
        return 'Add @ symbol and domain (e.g., user@example.com)'
      }
      break

    case 'phone':
      return 'Use format: +1234567890 or (123) 456-7890'

    case 'url':
      if (!strValue.startsWith('http')) {
        return `Try adding https:// prefix: https://${strValue}`
      }
      break

    case 'date':
      return 'Use format: YYYY-MM-DD (e.g., 2024-01-15)'

    case 'time':
      return 'Use format: HH:MM or HH:MM:SS (e.g., 14:30)'

    case 'color':
      return 'Use hex format: #RGB or #RRGGBB (e.g., #ff0000)'

    case 'country':
      return 'Use 2-letter ISO code (e.g., US, GB, DE)'

    case 'number':
    case 'integer':
    case 'float':
    case 'currency':
      if (isNaN(Number(strValue))) {
        return 'Remove non-numeric characters'
      }
      break
  }

  return undefined
}

/**
 * Validate a row against column definitions
 */
export function validateRow(
  row: Record<string, unknown>,
  rowId: string | number,
  columns: Array<{ name: string; type: string; isRequired: boolean }>
): RowValidationResult {
  const warnings: ValueValidationResult[] = []

  for (const column of columns) {
    const value = row[column.name]

    // Check required fields
    if (column.isRequired && (value === null || value === undefined || value === '')) {
      warnings.push({
        isValid: false,
        value,
        columnName: column.name,
        columnType: column.type,
        error: 'Required field is empty'
      })
      continue
    }

    // Validate value against type
    const result = validateValue(value, column.name, column.type)
    if (!result.isValid) {
      warnings.push(result)
    }
  }

  return {
    rowId,
    isValid: warnings.length === 0,
    invalidCount: warnings.length,
    warnings
  }
}

/**
 * Validate entire dataset against column definitions
 */
export function validateDataset(
  rows: Array<{ id: string | number; data: Record<string, unknown> }>,
  columns: Array<{ name: string; type: string; isRequired: boolean }>
): DatasetValidationResult {
  const rowResults: RowValidationResult[] = []
  const columnStats: Map<string, { invalid: number; valid: number; errors: string[] }> = new Map()

  // Initialize column stats
  for (const column of columns) {
    columnStats.set(column.name, { invalid: 0, valid: 0, errors: [] })
  }

  // Validate each row
  for (const row of rows) {
    const result = validateRow(row.data, row.id, columns)
    rowResults.push(result)

    // Update column stats
    for (const column of columns) {
      const stats = columnStats.get(column.name)!
      const warning = result.warnings.find(w => w.columnName === column.name)

      if (warning) {
        stats.invalid++
        if (stats.errors.length < 3 && warning.error) {
          stats.errors.push(`${warning.value}: ${warning.error}`)
        }
      } else {
        stats.valid++
      }
    }
  }

  // Build summary
  const summary: ColumnValidationSummary[] = columns.map(column => {
    const stats = columnStats.get(column.name)!
    return {
      columnName: column.name,
      columnType: column.type,
      invalidCount: stats.invalid,
      validCount: stats.valid,
      sampleErrors: stats.errors
    }
  })

  const validRows = rowResults.filter(r => r.isValid).length
  const invalidRows = rowResults.filter(r => !r.isValid).length
  const totalWarnings = rowResults.reduce((sum, r) => sum + r.invalidCount, 0)

  return {
    totalRows: rows.length,
    validRows,
    invalidRows,
    totalWarnings,
    rows: rowResults,
    summary
  }
}

/**
 * Preview impact of changing a column's type
 */
export function previewTypeChange(
  rows: Array<{ id: string | number; data: Record<string, unknown> }>,
  columnName: string,
  currentType: string,
  newType: string
): TypeChangePreviewResult {
  const sampleIssues: TypeChangePreviewResult['sampleIssues'] = []
  let incompatibleCount = 0

  for (const row of rows) {
    const value = row.data[columnName]

    // Skip empty values
    if (value === null || value === undefined || value === '') {
      continue
    }

    // Validate against new type
    const result = validateValue(value, columnName, newType)

    if (!result.isValid) {
      incompatibleCount++

      // Collect sample issues (max 10)
      if (sampleIssues.length < 10) {
        sampleIssues.push({
          rowId: row.id,
          currentValue: value,
          issue: result.error || 'Incompatible with new type'
        })
      }
    }
  }

  return {
    columnName,
    currentType,
    newType,
    totalRows: rows.length,
    compatibleRows: rows.length - incompatibleCount,
    incompatibleRows: incompatibleCount,
    sampleIssues
  }
}

/**
 * Check if a value can be coerced to a target type
 */
export function canCoerceValue(value: unknown, targetType: string): boolean {
  const result = validateValue(value, '', targetType)
  return result.isValid
}

/**
 * Get validation schema for a column type (for external use)
 */
export function getValidationSchema(columnType: string): z.ZodSchema | null {
  return getSchemaForType(columnType)
}

/**
 * List all supported column types with their validation rules
 */
export function getValidationRules(): Array<{
  type: string
  description: string
  example: string
}> {
  return [
    { type: 'text', description: 'Any text value', example: 'Hello World' },
    { type: 'textarea', description: 'Multi-line text', example: 'Line 1\\nLine 2' },
    { type: 'email', description: 'Valid email address', example: 'user@example.com' },
    { type: 'url', description: 'Valid URL with protocol', example: 'https://example.com' },
    { type: 'phone', description: 'Phone number (international format)', example: '+1 (555) 123-4567' },
    { type: 'country', description: '2-3 letter ISO country code', example: 'US' },
    { type: 'number', description: 'Any numeric value', example: '123.45' },
    { type: 'integer', description: 'Whole number only', example: '42' },
    { type: 'float', description: 'Decimal number', example: '3.14159' },
    { type: 'currency', description: 'Number with max 2 decimals', example: '99.99' },
    { type: 'percentage', description: 'Number 0-100', example: '75' },
    { type: 'date', description: 'Date in YYYY-MM-DD format', example: '2024-01-15' },
    { type: 'time', description: 'Time in HH:MM format', example: '14:30' },
    { type: 'datetime', description: 'ISO datetime', example: '2024-01-15T14:30:00Z' },
    { type: 'boolean', description: 'true/false, yes/no, 1/0', example: 'true' },
    { type: 'select', description: 'Selection from options', example: 'Option A' },
    { type: 'rating', description: 'Rating 1-5', example: '4' },
    { type: 'color', description: 'Hex color code', example: '#ff0000' }
  ]
}
