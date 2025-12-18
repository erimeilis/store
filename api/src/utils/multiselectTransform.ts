/**
 * Utility functions for transforming grouped multiselect values in API responses
 *
 * Grouped multiselect values are stored as comma-separated strings with :personal/:business suffixes
 * e.g., "address:personal,name-lastname:business,address-city:business"
 *
 * This transforms them to structured objects:
 * { "personal": ["address"], "business": ["name-lastname", "address-city"] }
 */

/**
 * Check if a value looks like a multiselect docs string
 * Matches any comma-separated list or single doc value that could be a docs field
 */
export function isMultiselectDocsValue(value: unknown, fieldName?: string): boolean {
  if (typeof value !== 'string' || !value) return false
  // If field name is 'docs', always transform
  if (fieldName === 'docs') return true
  // Otherwise only transform if it has :personal or :business suffixes
  return value.includes(':personal') || value.includes(':business')
}

/**
 * @deprecated Use isMultiselectDocsValue instead
 */
export function isGroupedMultiselectValue(value: unknown): boolean {
  if (typeof value !== 'string' || !value) return false
  return value.includes(':personal') || value.includes(':business')
}

/**
 * Parse a grouped multiselect value into structured object
 * Input: "address:personal,name-lastname:business,address-city:business"
 * Output: { personal: ["address"], business: ["name-lastname", "address-city"] }
 */
export function parseGroupedMultiselect(value: string): { personal: string[]; business: string[] } {
  const result: { personal: string[]; business: string[] } = {
    personal: [],
    business: []
  }

  if (!value) return result

  const items = value.split(',').map(v => v.trim()).filter(Boolean)

  for (const item of items) {
    if (item.endsWith(':personal')) {
      result.personal.push(item.replace(/:personal$/, ''))
    } else if (item.endsWith(':business')) {
      result.business.push(item.replace(/:business$/, ''))
    } else {
      // No suffix - could be legacy data, add to personal
      result.personal.push(item)
    }
  }

  return result
}

/**
 * Transform all grouped multiselect values in a data object
 * - Always transforms 'docs' field to structured format
 * - Transforms other fields only if they have :personal/:business suffixes
 */
export function transformGroupedMultiselectData<T extends Record<string, any>>(data: T): T {
  if (!data || typeof data !== 'object') return data

  const transformed = { ...data } as Record<string, any>

  for (const [key, value] of Object.entries(data)) {
    if (isMultiselectDocsValue(value, key)) {
      transformed[key] = parseGroupedMultiselect(value as string)
    }
  }

  return transformed as T
}
