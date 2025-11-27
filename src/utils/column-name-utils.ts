/**
 * Column Name Utilities
 *
 * Handles conversion between display names (Title Case with spaces)
 * and internal names (camelCase) for table columns.
 *
 * Rules:
 * - Only Latin letters (a-z, A-Z) and spaces allowed in input
 * - Internal storage: camelCase (e.g., "monthlyCost", "sellingSetupFee")
 * - Display: Title Case (e.g., "Monthly Cost", "Selling Setup Fee")
 */

/**
 * Regex pattern for valid column name input
 * Only allows Latin letters (a-z, A-Z) and spaces
 */
export const VALID_COLUMN_NAME_PATTERN = /^[a-zA-Z][a-zA-Z\s]*$/

/**
 * Check if a column name contains only valid characters (Latin letters and spaces)
 */
export function isValidColumnNameInput(name: string): boolean {
  if (!name || name.trim().length === 0) return false
  return VALID_COLUMN_NAME_PATTERN.test(name.trim())
}

/**
 * Convert a display name (Title Case with spaces) to internal camelCase format
 * Examples:
 *   "Monthly Cost" → "monthlyCost"
 *   "Selling Setup Fee" → "sellingSetupFee"
 *   "Qty" → "qty"
 *   "Price" → "price"
 */
export function toInternalName(displayName: string): string {
  if (!displayName) return ''

  // Trim and normalize spaces
  const normalized = displayName.trim().replace(/\s+/g, ' ')

  // Split by spaces
  const words = normalized.split(' ')

  // Convert to camelCase
  return words
    .map((word, index) => {
      const lower = word.toLowerCase()
      if (index === 0) {
        return lower
      }
      return lower.charAt(0).toUpperCase() + lower.slice(1)
    })
    .join('')
}

/**
 * Convert an internal camelCase name to display format (Title Case with spaces)
 * Examples:
 *   "monthlyCost" → "Monthly Cost"
 *   "sellingSetupFee" → "Selling Setup Fee"
 *   "qty" → "Qty"
 *   "price" → "Price"
 */
export function toDisplayName(internalName: string): string {
  if (!internalName) return ''

  // Insert space before each uppercase letter and split
  const words = internalName
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .split(' ')

  // Capitalize first letter of each word
  return words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Check if an existing column name has issues that need fixing
 * Issues include:
 *   - Contains non-Latin characters
 *   - Contains numbers
 *   - Contains special characters (except spaces)
 *   - Not in proper camelCase format
 */
export function hasColumnNameIssues(name: string): boolean {
  if (!name) return true

  // Check for non-Latin characters, numbers, or special characters
  // Valid internal names should only contain a-z and A-Z (no spaces in camelCase)
  const hasInvalidChars = /[^a-zA-Z]/.test(name)

  // Check if it's properly formatted camelCase (starts with lowercase, no spaces)
  const isProperCamelCase = /^[a-z][a-zA-Z]*$/.test(name)

  return hasInvalidChars || !isProperCamelCase
}

/**
 * Get a list of issues with a column name for display purposes
 */
export function getColumnNameIssues(name: string): string[] {
  const issues: string[] = []

  if (!name) {
    issues.push('Name is empty')
    return issues
  }

  // Check for numbers
  if (/\d/.test(name)) {
    issues.push('Contains numbers')
  }

  // Check for special characters (not letters or spaces)
  if (/[^a-zA-Z\s]/.test(name)) {
    issues.push('Contains special characters')
  }

  // Check for non-ASCII characters
  if (/[^\x00-\x7F]/.test(name)) {
    issues.push('Contains non-Latin characters')
  }

  // Check if starts with lowercase (for existing camelCase names, this is fine)
  // But if it has spaces and isn't Title Case, that's an issue
  if (/\s/.test(name)) {
    issues.push('Internal name contains spaces (should be camelCase)')
  }

  // Check if starts with uppercase (should start with lowercase in camelCase)
  if (/^[A-Z]/.test(name) && !/\s/.test(name)) {
    issues.push('Should start with lowercase letter')
  }

  return issues
}

/**
 * Fix a column name by:
 * 1. Removing non-Latin characters
 * 2. Converting to proper camelCase format
 */
export function fixColumnName(name: string): string {
  if (!name) return 'column'

  // Remove all non-Latin characters except spaces
  let cleaned = name.replace(/[^a-zA-Z\s]/g, '')

  // If empty after cleaning, return default
  if (!cleaned.trim()) return 'column'

  // Normalize spaces and convert to camelCase
  return toInternalName(cleaned)
}

/**
 * Validate column name for creation/update
 * Returns validation result with error message if invalid
 */
export function validateColumnName(name: string): { valid: boolean; error?: string; internalName?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Column name is required' }
  }

  const trimmed = name.trim()

  // Check length
  if (trimmed.length > 100) {
    return { valid: false, error: 'Column name must be 100 characters or less' }
  }

  // Check for valid characters
  if (!isValidColumnNameInput(trimmed)) {
    return {
      valid: false,
      error: 'Column name can only contain Latin letters (a-z, A-Z) and spaces'
    }
  }

  // Convert to internal format
  const internalName = toInternalName(trimmed)

  // Ensure internal name is not empty
  if (!internalName) {
    return { valid: false, error: 'Column name must contain at least one letter' }
  }

  return { valid: true, internalName }
}
