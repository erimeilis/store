/**
 * Built-in Format Handlers
 * These handle all formatting logic - modules just reference them by name
 */

import type { FormatRule } from '@/types/modules.js'

/**
 * Phone number formatting templates by country
 */
const PHONE_FORMATS: Record<string, (digits: string) => string> = {
  US: digits => {
    const d = digits.replace(/\D/g, '').slice(-10)
    if (d.length !== 10) return digits
    return `+1 (${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
  },
  GB: digits => {
    const d = digits.replace(/\D/g, '').replace(/^44/, '').replace(/^0/, '')
    return `+44 ${d.slice(0, 4)} ${d.slice(4)}`
  },
  DE: digits => {
    const d = digits.replace(/\D/g, '').replace(/^49/, '').replace(/^0/, '')
    return `+49 ${d.slice(0, 3)} ${d.slice(3)}`
  },
  FR: digits => {
    const d = digits.replace(/\D/g, '').replace(/^33/, '').replace(/^0/, '')
    if (d.length < 9) return digits
    return `+33 ${d[0]} ${d.slice(1, 3)} ${d.slice(3, 5)} ${d.slice(5, 7)} ${d.slice(7)}`
  },
  AU: digits => {
    const d = digits.replace(/\D/g, '').replace(/^61/, '').replace(/^0/, '')
    if (d.length < 9) return digits
    return `+61 ${d[0]} ${d.slice(1, 5)} ${d.slice(5)}`
  },
  JP: digits => {
    const d = digits.replace(/\D/g, '').replace(/^81/, '').replace(/^0/, '')
    return `+81 ${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`
  },
}

/**
 * Format a value according to a format rule
 */
export function format(
  value: unknown,
  rule: FormatRule,
  options?: Record<string, unknown>
): string {
  if (value === null || value === undefined) {
    return ''
  }

  switch (rule.handler) {
    case 'none':
      return String(value)

    case 'phone':
      return formatPhone(value, rule.style, options?.country as string)

    case 'currency':
      return formatCurrency(value, rule.currency, rule.decimals)

    case 'number':
      return formatNumber(value, rule.decimals, rule.thousandsSeparator)

    case 'date':
      return formatDate(value, rule.format)

    case 'boolean':
      return formatBoolean(value, rule.trueLabel, rule.falseLabel)

    case 'json':
      return formatJson(value, rule.pretty)

    case 'uppercase':
      return String(value).toUpperCase()

    case 'lowercase':
      return String(value).toLowerCase()

    case 'template':
      return formatTemplate(value, rule.template)

    default:
      return String(value)
  }
}

function formatPhone(
  value: unknown,
  style?: 'e164' | 'national' | 'international',
  country?: string
): string {
  const str = String(value)
  const digits = str.replace(/\D/g, '')

  if (style === 'e164') {
    // E.164: Just digits with + prefix
    if (digits.startsWith('1') && digits.length === 11) {
      return `+${digits}`
    }
    // Assume US if 10 digits
    if (digits.length === 10) {
      return `+1${digits}`
    }
    return `+${digits}`
  }

  // Detect country from number if not specified
  let detectedCountry = country
  if (!detectedCountry) {
    if (digits.startsWith('1') && (digits.length === 11 || digits.length === 10)) {
      detectedCountry = 'US'
    } else if (digits.startsWith('44')) {
      detectedCountry = 'GB'
    } else if (digits.startsWith('49')) {
      detectedCountry = 'DE'
    } else if (digits.startsWith('33')) {
      detectedCountry = 'FR'
    } else if (digits.startsWith('61')) {
      detectedCountry = 'AU'
    } else if (digits.startsWith('81')) {
      detectedCountry = 'JP'
    } else {
      detectedCountry = 'US' // Default
    }
  }

  const formatter = PHONE_FORMATS[detectedCountry] || PHONE_FORMATS['US']
  if (!formatter) {
    return str // Fallback to original string
  }
  return formatter(str)
}

function formatCurrency(value: unknown, currency?: string, decimals?: number): string {
  const num = Number(value)
  if (isNaN(num)) return String(value)

  const dec = decimals ?? 2
  const cur = currency ?? 'USD'

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: cur,
      minimumFractionDigits: dec,
      maximumFractionDigits: dec,
    }).format(num)
  } catch {
    // Fallback if currency code is invalid
    return `${cur} ${num.toFixed(dec)}`
  }
}

function formatNumber(
  value: unknown,
  decimals?: number,
  thousandsSeparator?: boolean
): string {
  const num = Number(value)
  if (isNaN(num)) return String(value)

  if (thousandsSeparator !== false) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals ?? 0,
      maximumFractionDigits: decimals ?? 2,
    }).format(num)
  }

  return decimals !== undefined ? num.toFixed(decimals) : String(num)
}

function formatDate(value: unknown, formatStr?: string): string {
  let date: Date

  if (value instanceof Date) {
    date = value
  } else if (typeof value === 'string' || typeof value === 'number') {
    date = new Date(value)
  } else {
    return String(value)
  }

  if (isNaN(date.getTime())) {
    return String(value)
  }

  // Simple format string replacement
  const fmt = formatStr ?? 'YYYY-MM-DD'

  const replacements: Record<string, string> = {
    YYYY: String(date.getFullYear()),
    YY: String(date.getFullYear()).slice(-2),
    MM: String(date.getMonth() + 1).padStart(2, '0'),
    M: String(date.getMonth() + 1),
    DD: String(date.getDate()).padStart(2, '0'),
    D: String(date.getDate()),
    HH: String(date.getHours()).padStart(2, '0'),
    H: String(date.getHours()),
    mm: String(date.getMinutes()).padStart(2, '0'),
    m: String(date.getMinutes()),
    ss: String(date.getSeconds()).padStart(2, '0'),
    s: String(date.getSeconds()),
  }

  let result = fmt
  for (const [key, val] of Object.entries(replacements)) {
    result = result.replace(new RegExp(key, 'g'), val)
  }

  return result
}

function formatBoolean(value: unknown, trueLabel?: string, falseLabel?: string): string {
  const bool = Boolean(value)
  return bool ? (trueLabel ?? 'Yes') : (falseLabel ?? 'No')
}

function formatJson(value: unknown, pretty?: boolean): string {
  try {
    if (typeof value === 'string') {
      // Try to parse and re-stringify for formatting
      const parsed = JSON.parse(value)
      return pretty ? JSON.stringify(parsed, null, 2) : JSON.stringify(parsed)
    }
    return pretty ? JSON.stringify(value, null, 2) : JSON.stringify(value)
  } catch {
    return String(value)
  }
}

function formatTemplate(value: unknown, template: string): string {
  // Simple template replacement: {value}, {0}, {1}, etc.
  let result = template

  // Replace {value} with the actual value
  result = result.replace(/\{value\}/g, String(value))

  // If value is an array or object, allow indexed/keyed access
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      result = result.replace(new RegExp(`\\{${i}\\}`, 'g'), String(value[i]))
    }
  } else if (typeof value === 'object' && value !== null) {
    for (const [key, val] of Object.entries(value)) {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(val))
    }
  }

  return result
}

/**
 * Get all available format handler names
 */
export function getFormatHandlers(): string[] {
  return [
    'none',
    'phone',
    'currency',
    'number',
    'date',
    'boolean',
    'json',
    'uppercase',
    'lowercase',
    'template',
  ]
}
