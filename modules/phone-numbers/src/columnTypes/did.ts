import type { ModuleColumnType, ValidationResult } from '../../types.js'

/**
 * Country code patterns and formatting
 */
const COUNTRY_PATTERNS: Record<string, { code: string; pattern: RegExp; format: (n: string) => string }> = {
  US: {
    code: '+1',
    pattern: /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/,
    format: (n) => {
      const digits = n.replace(/\D/g, '').slice(-10)
      return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
    },
  },
  GB: {
    code: '+44',
    pattern: /^\+?44?[-.\s]?0?([0-9]{2,5})[-.\s]?([0-9]{3,4})[-.\s]?([0-9]{3,4})$/,
    format: (n) => {
      const digits = n.replace(/\D/g, '').replace(/^44/, '').replace(/^0/, '')
      return `+44 ${digits.slice(0, 4)} ${digits.slice(4)}`
    },
  },
  DE: {
    code: '+49',
    pattern: /^\+?49?[-.\s]?0?([0-9]{2,5})[-.\s]?([0-9]{3,8})$/,
    format: (n) => {
      const digits = n.replace(/\D/g, '').replace(/^49/, '').replace(/^0/, '')
      return `+49 ${digits.slice(0, 3)} ${digits.slice(3)}`
    },
  },
  FR: {
    code: '+33',
    pattern: /^\+?33?[-.\s]?0?([0-9])[-.\s]?([0-9]{2})[-.\s]?([0-9]{2})[-.\s]?([0-9]{2})[-.\s]?([0-9]{2})$/,
    format: (n) => {
      const digits = n.replace(/\D/g, '').replace(/^33/, '').replace(/^0/, '')
      return `+33 ${digits[0]} ${digits.slice(1, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}`
    },
  },
  AU: {
    code: '+61',
    pattern: /^\+?61?[-.\s]?0?([0-9])[-.\s]?([0-9]{4})[-.\s]?([0-9]{4})$/,
    format: (n) => {
      const digits = n.replace(/\D/g, '').replace(/^61/, '').replace(/^0/, '')
      return `+61 ${digits[0]} ${digits.slice(1, 5)} ${digits.slice(5)}`
    },
  },
  JP: {
    code: '+81',
    pattern: /^\+?81?[-.\s]?0?([0-9]{1,4})[-.\s]?([0-9]{1,4})[-.\s]?([0-9]{4})$/,
    format: (n) => {
      const digits = n.replace(/\D/g, '').replace(/^81/, '').replace(/^0/, '')
      return `+81 ${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
    },
  },
}

/**
 * DID (Direct Inward Dialing) column type
 * Specialized for telecom DID numbers with validation and formatting
 */
export const didColumnType: ModuleColumnType = {
  id: 'did',
  displayName: 'DID Number',
  description: 'Direct Inward Dialing phone number with country-specific formatting',
  icon: 'phone-forwarded',
  category: 'Telecom',

  options: [
    {
      id: 'country',
      type: 'select',
      displayName: 'Country',
      description: 'Country for validation and formatting',
      default: 'US',
      options: [
        { value: 'US', label: 'United States' },
        { value: 'GB', label: 'United Kingdom' },
        { value: 'DE', label: 'Germany' },
        { value: 'FR', label: 'France' },
        { value: 'AU', label: 'Australia' },
        { value: 'JP', label: 'Japan' },
      ],
    },
    {
      id: 'allowExtension',
      type: 'boolean',
      displayName: 'Allow Extension',
      description: 'Allow extension numbers (e.g., +1 555-123-4567 x123)',
      default: false,
    },
  ],

  validate(value: unknown, options?: Record<string, unknown>): ValidationResult {
    if (value === null || value === undefined || value === '') {
      return { valid: true }
    }

    if (typeof value !== 'string') {
      return { valid: false, error: 'DID must be a string' }
    }

    const country = (options?.country as string) || 'US'
    const countryConfig = COUNTRY_PATTERNS[country]

    if (!countryConfig) {
      return { valid: false, error: `Unsupported country: ${country}` }
    }

    // Extract extension if present
    let mainNumber = value
    let extension = ''
    const extMatch = value.match(/\s*[xX]\.?\s*(\d+)$/)
    if (extMatch) {
      extension = extMatch[1]
      mainNumber = value.slice(0, -extMatch[0].length)
    }

    // Check extension allowance
    if (extension && !options?.allowExtension) {
      return { valid: false, error: 'Extension numbers are not allowed' }
    }

    // Validate main number
    if (!countryConfig.pattern.test(mainNumber)) {
      return {
        valid: false,
        error: `Invalid ${country} phone number format`,
      }
    }

    return { valid: true }
  },

  format(value: unknown, options?: Record<string, unknown>): string {
    if (value === null || value === undefined || value === '') {
      return ''
    }

    const str = String(value)
    const country = (options?.country as string) || 'US'
    const countryConfig = COUNTRY_PATTERNS[country]

    if (!countryConfig) {
      return str
    }

    // Extract extension
    let mainNumber = str
    let extension = ''
    const extMatch = str.match(/\s*[xX]\.?\s*(\d+)$/)
    if (extMatch) {
      extension = extMatch[1]
      mainNumber = str.slice(0, -extMatch[0].length)
    }

    // Format the number
    const formatted = countryConfig.format(mainNumber)
    return extension ? `${formatted} x${extension}` : formatted
  },

  parse(input: string, options?: Record<string, unknown>): string {
    // Clean up the input
    const cleaned = input.trim()

    // If it starts with +, assume international format
    if (cleaned.startsWith('+')) {
      return cleaned
    }

    // Add country code if not present
    const country = (options?.country as string) || 'US'
    const countryConfig = COUNTRY_PATTERNS[country]

    if (countryConfig) {
      const digits = cleaned.replace(/\D/g, '')
      return `${countryConfig.code}${digits}`
    }

    return cleaned
  },

  getDefaultValue(options?: Record<string, unknown>): string {
    const country = (options?.country as string) || 'US'
    const countryConfig = COUNTRY_PATTERNS[country]
    return countryConfig?.code || '+1'
  },
}

/**
 * Generic phone column type
 * More flexible than DID, accepts any phone format
 */
export const phoneColumnType: ModuleColumnType = {
  id: 'phone',
  displayName: 'Phone Number',
  description: 'General phone number with flexible validation',
  icon: 'phone',
  category: 'Telecom',

  options: [
    {
      id: 'requireCountryCode',
      type: 'boolean',
      displayName: 'Require Country Code',
      description: 'Require international format with country code',
      default: false,
    },
  ],

  validate(value: unknown, options?: Record<string, unknown>): ValidationResult {
    if (value === null || value === undefined || value === '') {
      return { valid: true }
    }

    if (typeof value !== 'string') {
      return { valid: false, error: 'Phone number must be a string' }
    }

    // Basic validation: must have at least 7 digits
    const digits = value.replace(/\D/g, '')
    if (digits.length < 7) {
      return { valid: false, error: 'Phone number must have at least 7 digits' }
    }

    if (digits.length > 15) {
      return { valid: false, error: 'Phone number is too long (max 15 digits)' }
    }

    // Check for country code if required
    if (options?.requireCountryCode && !value.startsWith('+')) {
      return { valid: false, error: 'Country code is required (start with +)' }
    }

    return { valid: true }
  },

  format(value: unknown): string {
    if (value === null || value === undefined || value === '') {
      return ''
    }
    return String(value)
  },

  parse(input: string): string {
    return input.trim()
  },
}

/**
 * Carrier column type
 * For storing telecom carrier/provider names
 */
export const carrierColumnType: ModuleColumnType = {
  id: 'carrier',
  displayName: 'Carrier',
  description: 'Telecom carrier or service provider',
  icon: 'radio-tower',
  category: 'Telecom',

  dataSource: {
    type: 'static',
    values: [
      'AT&T',
      'Verizon',
      'T-Mobile',
      'Sprint',
      'US Cellular',
      'Vodafone',
      'O2',
      'EE',
      'Three',
      'Deutsche Telekom',
      'Orange',
      'SFR',
      'Bouygues',
      'Telstra',
      'Optus',
      'NTT Docomo',
      'SoftBank',
      'KDDI',
      'Other',
    ],
  },

  validate(value: unknown): ValidationResult {
    if (value === null || value === undefined || value === '') {
      return { valid: true }
    }

    if (typeof value !== 'string') {
      return { valid: false, error: 'Carrier must be a string' }
    }

    return { valid: true }
  },

  format(value: unknown): string {
    if (value === null || value === undefined || value === '') {
      return ''
    }
    return String(value)
  },

  parse(input: string): string {
    return input.trim()
  },
}
