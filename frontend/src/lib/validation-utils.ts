/**
 * Client-Side Validation Utilities
 * Mirrors backend validation service for "Warn-Don't-Block" pattern
 * Provides visual feedback on data quality without blocking saves
 */

export interface ValidationResult {
  isValid: boolean
  error?: string
  suggestion?: string
}

/**
 * Validate a single value against a column type
 * Client-side implementation matching backend validationService.ts
 */
export function validateValue(value: unknown, columnType: string): ValidationResult {
  // Empty values are valid (required check is separate)
  if (value === null || value === undefined || value === '') {
    return { isValid: true }
  }

  // For module types like "@store/phone-numbers:phone", extract the base type
  const baseType = columnType.includes(':') ? columnType.split(':').pop() : columnType

  switch (baseType) {
    case 'text':
    case 'textarea':
    case 'select':
      return { isValid: true }

    case 'email':
      return validateEmail(value)

    case 'url':
      return validateUrl(value)

    case 'phone':
      return validatePhone(value)

    case 'country':
      return validateCountry(value)

    case 'number':
    case 'integer':
    case 'float':
      return validateNumber(value, baseType)

    case 'currency':
      return validateCurrency(value)

    case 'percentage':
      return validatePercentage(value)

    case 'date':
      return validateDate(value)

    case 'time':
      return validateTime(value)

    case 'datetime':
      return validateDateTime(value)

    case 'boolean':
      return validateBoolean(value)

    case 'rating':
      return validateRating(value)

    case 'color':
      return validateColor(value)

    default:
      // Unknown types accept anything
      return { isValid: true }
  }
}

function validateEmail(value: unknown): ValidationResult {
  const strValue = String(value)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(strValue)) {
    const result: ValidationResult = {
      isValid: false,
      error: 'Invalid email format'
    }
    if (!strValue.includes('@')) {
      result.suggestion = 'Add @ symbol and domain (e.g., user@example.com)'
    }
    return result
  }

  return { isValid: true }
}

function validateUrl(value: unknown): ValidationResult {
  const strValue = String(value)

  try {
    new URL(strValue)
    return { isValid: true }
  } catch {
    const result: ValidationResult = {
      isValid: false,
      error: 'Invalid URL format'
    }
    if (!strValue.startsWith('http')) {
      result.suggestion = `Try adding https:// prefix: https://${strValue}`
    }
    return result
  }
}

function validatePhone(value: unknown): ValidationResult {
  const strValue = String(value)
  const phoneRegex = /^[+]?[0-9\s\-().]{7,20}$/

  if (!phoneRegex.test(strValue)) {
    return {
      isValid: false,
      error: 'Invalid phone number format',
      suggestion: 'Use format: +1234567890 or (123) 456-7890'
    }
  }

  return { isValid: true }
}

function validateCountry(value: unknown): ValidationResult {
  const strValue = String(value)
  const countryRegex = /^[A-Z]{2,3}$/i

  if (!countryRegex.test(strValue)) {
    return {
      isValid: false,
      error: 'Must be 2-3 letter country code',
      suggestion: 'Use 2-letter ISO code (e.g., US, GB, DE)'
    }
  }

  return { isValid: true }
}

function validateNumber(value: unknown, type: string): ValidationResult {
  const numValue = Number(value)

  if (isNaN(numValue)) {
    return {
      isValid: false,
      error: 'Must be a number',
      suggestion: 'Remove non-numeric characters'
    }
  }

  if (type === 'integer' && !Number.isInteger(numValue)) {
    return {
      isValid: false,
      error: 'Must be an integer'
    }
  }

  return { isValid: true }
}

function validateCurrency(value: unknown): ValidationResult {
  const numValue = Number(value)

  if (isNaN(numValue)) {
    return {
      isValid: false,
      error: 'Must be a number',
      suggestion: 'Remove non-numeric characters'
    }
  }

  // Check max 2 decimal places
  if (Math.round(numValue * 100) !== numValue * 100) {
    return {
      isValid: false,
      error: 'Currency must have at most 2 decimal places'
    }
  }

  return { isValid: true }
}

function validatePercentage(value: unknown): ValidationResult {
  const numValue = Number(value)

  if (isNaN(numValue)) {
    return {
      isValid: false,
      error: 'Must be a number',
      suggestion: 'Remove non-numeric characters'
    }
  }

  if (numValue < 0 || numValue > 100) {
    return {
      isValid: false,
      error: 'Percentage must be between 0 and 100'
    }
  }

  return { isValid: true }
}

function validateDate(value: unknown): ValidationResult {
  const strValue = String(value)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/

  if (!dateRegex.test(strValue) && isNaN(Date.parse(strValue))) {
    return {
      isValid: false,
      error: 'Invalid date format',
      suggestion: 'Use format: YYYY-MM-DD (e.g., 2024-01-15)'
    }
  }

  return { isValid: true }
}

function validateTime(value: unknown): ValidationResult {
  const strValue = String(value)
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/

  if (!timeRegex.test(strValue)) {
    return {
      isValid: false,
      error: 'Invalid time format',
      suggestion: 'Use format: HH:MM or HH:MM:SS (e.g., 14:30)'
    }
  }

  return { isValid: true }
}

function validateDateTime(value: unknown): ValidationResult {
  const strValue = String(value)

  if (isNaN(Date.parse(strValue))) {
    return {
      isValid: false,
      error: 'Invalid datetime format'
    }
  }

  return { isValid: true }
}

function validateBoolean(value: unknown): ValidationResult {
  if (typeof value === 'boolean') {
    return { isValid: true }
  }

  if (typeof value === 'string') {
    const lower = value.toLowerCase()
    if (['true', '1', 'yes', 'on', 'false', '0', 'no', 'off', ''].includes(lower)) {
      return { isValid: true }
    }
  }

  if (typeof value === 'number' && (value === 0 || value === 1)) {
    return { isValid: true }
  }

  return {
    isValid: false,
    error: 'Must be true/false, yes/no, or 1/0'
  }
}

function validateRating(value: unknown): ValidationResult {
  const numValue = Number(value)

  if (isNaN(numValue)) {
    return {
      isValid: false,
      error: 'Must be a number'
    }
  }

  // Accept 1-5 scale or 0-1 scale
  const isValidScale = (Number.isInteger(numValue) && numValue >= 1 && numValue <= 5) ||
                       (numValue >= 0 && numValue <= 1)

  if (!isValidScale) {
    return {
      isValid: false,
      error: 'Rating must be 1-5 or 0-1'
    }
  }

  return { isValid: true }
}

function validateColor(value: unknown): ValidationResult {
  const strValue = String(value)
  const colorRegex = /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/

  if (!colorRegex.test(strValue)) {
    return {
      isValid: false,
      error: 'Invalid color format',
      suggestion: 'Use hex format: #RGB or #RRGGBB (e.g., #ff0000)'
    }
  }

  return { isValid: true }
}

/**
 * Validate entire row data against column definitions
 */
export function validateRow(
  data: Record<string, unknown>,
  columns: Array<{ name: string; type: string; isRequired: boolean; defaultValue?: unknown }>
): Map<string, ValidationResult> {
  const results = new Map<string, ValidationResult>()

  for (const column of columns) {
    const value = data[column.name]

    // Check required fields
    if (column.isRequired && (value === null || value === undefined || value === '')) {
      // Skip if has default value
      if (column.defaultValue !== null && column.defaultValue !== undefined) {
        results.set(column.name, { isValid: true })
        continue
      }

      results.set(column.name, {
        isValid: false,
        error: 'Required field is empty'
      })
      continue
    }

    // Validate value against type
    const result = validateValue(value, column.type)
    results.set(column.name, result)
  }

  return results
}
