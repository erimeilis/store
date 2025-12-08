/**
 * Column Types Configuration
 * Central source of truth for built-in column types
 */

export const BUILT_IN_COLUMN_TYPES = [
  // Text types
  'text',
  'textarea',
  'email',
  'url',
  'phone',
  'country',
  // Number types
  'number',
  'integer',
  'float',
  'currency',
  'percentage',
  // Date/time types
  'date',
  'time',
  'datetime',
  // Other types
  'boolean',
  'select',
  'rating',
  'color'
] as const

export type BuiltInColumnType = typeof BUILT_IN_COLUMN_TYPES[number]

/**
 * Check if a type is a built-in column type
 */
export function isBuiltInColumnType(type: string): type is BuiltInColumnType {
  return (BUILT_IN_COLUMN_TYPES as readonly string[]).includes(type)
}
