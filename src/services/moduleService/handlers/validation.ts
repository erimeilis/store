/**
 * Built-in Validation Handlers
 * These handle all validation logic - modules just reference them by name
 */

import type { ValidationRule, ValidationResult } from '@/types/modules.js'

/**
 * Phone number validation patterns by country
 */
const PHONE_PATTERNS: Record<string, RegExp> = {
  US: /^\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/,
  GB: /^\+?44?[-.\s]?0?[0-9]{2,5}[-.\s]?[0-9]{3,4}[-.\s]?[0-9]{3,4}$/,
  DE: /^\+?49?[-.\s]?0?[0-9]{2,5}[-.\s]?[0-9]{3,8}$/,
  FR: /^\+?33?[-.\s]?0?[0-9][-.\s]?[0-9]{2}[-.\s]?[0-9]{2}[-.\s]?[0-9]{2}[-.\s]?[0-9]{2}$/,
  AU: /^\+?61?[-.\s]?0?[0-9][-.\s]?[0-9]{4}[-.\s]?[0-9]{4}$/,
  JP: /^\+?81?[-.\s]?0?[0-9]{1,4}[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{4}$/,
  // Generic international format
  INTL: /^\+[1-9]\d{6,14}$/,
}

/**
 * Email validation pattern
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * URL validation pattern
 */
const URL_PATTERN = /^https?:\/\/[^\s/$.?#].[^\s]*$/i

/**
 * Validate a value against a validation rule
 */
export function validate(
  value: unknown,
  rule: ValidationRule,
  options?: Record<string, unknown>
): ValidationResult {
  // Null/undefined handling - most validators allow empty unless 'required'
  if (value === null || value === undefined || value === '') {
    if (rule.handler === 'required') {
      return { valid: false, error: 'This field is required' }
    }
    return { valid: true }
  }

  switch (rule.handler) {
    case 'required':
      return validateRequired(value)

    case 'regex':
      return validateRegex(value, rule.pattern, rule.message)

    case 'phone':
      return validatePhone(value, options?.country as string, rule.allowExtension)

    case 'email':
      return validateEmail(value)

    case 'url':
      return validateUrl(value)

    case 'range':
      return validateRange(value, rule.min, rule.max)

    case 'length':
      return validateLength(value, rule.min, rule.max)

    case 'enum':
      return validateEnum(value, rule.values)

    case 'json-schema':
      return validateJsonSchema(value, rule.schema)

    case 'composite':
      return validateComposite(value, rule.rules, rule.mode, options)

    default:
      return { valid: true }
  }
}

function validateRequired(value: unknown): ValidationResult {
  if (value === null || value === undefined || value === '') {
    return { valid: false, error: 'This field is required' }
  }
  if (Array.isArray(value) && value.length === 0) {
    return { valid: false, error: 'This field is required' }
  }
  return { valid: true }
}

function validateRegex(value: unknown, pattern: string, message?: string): ValidationResult {
  const str = String(value)
  const regex = new RegExp(pattern)

  if (!regex.test(str)) {
    return { valid: false, error: message || `Value does not match pattern: ${pattern}` }
  }
  return { valid: true }
}

function validatePhone(
  value: unknown,
  country?: string,
  allowExtension?: boolean
): ValidationResult {
  let str = String(value)

  // Handle extension
  const extMatch = str.match(/\s*[xX]\.?\s*(\d+)$/)
  if (extMatch) {
    if (!allowExtension) {
      return { valid: false, error: 'Extension numbers are not allowed' }
    }
    // Remove extension from the string for pattern matching
    str = str.slice(0, -extMatch[0].length)
  }

  // Try country-specific pattern first
  if (country && PHONE_PATTERNS[country]) {
    if (PHONE_PATTERNS[country].test(str)) {
      return { valid: true }
    }
  }

  // Try international format
  const intlPattern = PHONE_PATTERNS['INTL']
  if (intlPattern && intlPattern.test(str.replace(/[-.\s()]/g, ''))) {
    return { valid: true }
  }

  // Try all patterns
  for (const pattern of Object.values(PHONE_PATTERNS)) {
    if (pattern.test(str)) {
      return { valid: true }
    }
  }

  return { valid: false, error: 'Invalid phone number format' }
}

function validateEmail(value: unknown): ValidationResult {
  const str = String(value)

  if (!EMAIL_PATTERN.test(str)) {
    return { valid: false, error: 'Invalid email address' }
  }
  return { valid: true }
}

function validateUrl(value: unknown): ValidationResult {
  const str = String(value)

  if (!URL_PATTERN.test(str)) {
    return { valid: false, error: 'Invalid URL' }
  }
  return { valid: true }
}

function validateRange(value: unknown, min?: number, max?: number): ValidationResult {
  const num = Number(value)

  if (isNaN(num)) {
    return { valid: false, error: 'Value must be a number' }
  }

  if (min !== undefined && num < min) {
    return { valid: false, error: `Value must be at least ${min}` }
  }

  if (max !== undefined && num > max) {
    return { valid: false, error: `Value must be at most ${max}` }
  }

  return { valid: true }
}

function validateLength(value: unknown, min?: number, max?: number): ValidationResult {
  const str = String(value)
  const len = str.length

  if (min !== undefined && len < min) {
    return { valid: false, error: `Must be at least ${min} characters` }
  }

  if (max !== undefined && len > max) {
    return { valid: false, error: `Must be at most ${max} characters` }
  }

  return { valid: true }
}

function validateEnum(value: unknown, values: string[]): ValidationResult {
  const str = String(value)

  if (!values.includes(str)) {
    return { valid: false, error: `Value must be one of: ${values.join(', ')}` }
  }

  return { valid: true }
}

function validateJsonSchema(
  value: unknown,
  _schema: Record<string, unknown>
): ValidationResult {
  // Basic JSON schema validation
  // For full schema validation, would need a library like Ajv
  // For now, just check if value is valid JSON
  if (typeof value === 'object') {
    return { valid: true }
  }

  try {
    if (typeof value === 'string') {
      JSON.parse(value)
      return { valid: true }
    }
  } catch {
    return { valid: false, error: 'Invalid JSON' }
  }

  return { valid: true }
}

function validateComposite(
  value: unknown,
  rules: ValidationRule[],
  mode: 'all' | 'any',
  options?: Record<string, unknown>
): ValidationResult {
  const results = rules.map(rule => validate(value, rule, options))

  if (mode === 'all') {
    const failed = results.find(r => !r.valid)
    if (failed) {
      return failed
    }
    return { valid: true }
  }

  // mode === 'any'
  const passed = results.find(r => r.valid)
  if (passed) {
    return { valid: true }
  }

  return { valid: false, error: 'Value does not match any validation rule' }
}

/**
 * Get all available validation handler names
 */
export function getValidationHandlers(): string[] {
  return [
    'required',
    'regex',
    'phone',
    'email',
    'url',
    'range',
    'length',
    'enum',
    'json-schema',
    'composite',
  ]
}
