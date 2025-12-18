/**
 * Built-in Generation Handlers
 * These handle all fake data generation - modules just reference them by name
 */

import type { GenerationRule } from '@/types/modules.js'
import { faker } from '@faker-js/faker'

/**
 * Context passed to generation handlers
 */
export interface GenerationContext {
  index: number
  total: number
  row: Record<string, unknown>
  /** Maps column type id to array of values (for from-source handler) */
  sourceData?: Record<string, unknown[]>
  /** Current column's type (for from-source handler) */
  columnType?: string
}

/**
 * Generate a value according to a generation rule
 */
export function generate(rule: GenerationRule, context: GenerationContext): unknown {
  switch (rule.handler) {
    case 'static':
      return rule.value

    case 'faker':
      return generateFaker(rule.method, rule.args)

    case 'random-int':
      return generateRandomInt(rule.min, rule.max)

    case 'random-float':
      return generateRandomFloat(rule.min, rule.max, rule.decimals)

    case 'random-boolean':
      return generateRandomBoolean(rule.probability)

    case 'random-enum':
      return generateRandomEnum(rule.values)

    case 'from-source':
      return generateFromSource(context)

    case 'sequence':
      return generateSequence(context.index, rule.start, rule.step)

    case 'pattern':
      return generatePattern(rule.pattern)

    case 'template':
      return generateTemplate(rule.template, rule.data, context)

    default:
      return null
  }
}

/**
 * Generate using Faker.js
 * Method format: 'category.method' e.g., 'phone.number', 'company.name'
 */
function generateFaker(method: string, args?: unknown[]): unknown {
  const parts = method.split('.')

  if (parts.length !== 2) {
    console.warn(`Invalid faker method format: ${method}`)
    return null
  }

  const category = parts[0]
  const methodName = parts[1]

  if (!category || !methodName) {
    console.warn(`Invalid faker method format: ${method}`)
    return null
  }

  // Access faker category using type assertion
  const fakerObj = faker as unknown as Record<string, Record<string, unknown>>
  const fakerCategory = fakerObj[category]
  if (!fakerCategory || typeof fakerCategory !== 'object') {
    console.warn(`Unknown faker category: ${category}`)
    return null
  }

  // Access method
  const fakerMethod = fakerCategory[methodName]
  if (typeof fakerMethod !== 'function') {
    console.warn(`Unknown faker method: ${method}`)
    return null
  }

  try {
    return args ? (fakerMethod as (...args: unknown[]) => unknown)(...args) : (fakerMethod as () => unknown)()
  } catch (error) {
    console.warn(`Error calling faker.${method}:`, error)
    return null
  }
}

/**
 * Generate random integer between min and max (inclusive)
 */
function generateRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Generate random float between min and max
 */
function generateRandomFloat(min: number, max: number, decimals?: number): number {
  const value = Math.random() * (max - min) + min
  if (decimals !== undefined) {
    const factor = Math.pow(10, decimals)
    return Math.round(value * factor) / factor
  }
  return value
}

/**
 * Generate random boolean with optional probability
 */
function generateRandomBoolean(probability?: number): boolean {
  const p = probability ?? 0.5
  return Math.random() < p
}

/**
 * Pick random value from array
 */
function generateRandomEnum(values: unknown[]): unknown {
  if (!values.length) return null
  return values[Math.floor(Math.random() * values.length)]
}

/**
 * Generate a value from pre-fetched source data
 * Looks up the column type in context.sourceData and picks a random value
 */
function generateFromSource(context: GenerationContext): unknown {
  const { columnType, sourceData } = context

  if (!columnType || !sourceData) {
    console.warn('from-source handler requires columnType and sourceData in context')
    return null
  }

  const values = sourceData[columnType]
  if (!values || !values.length) {
    console.warn(`No source data found for column type: ${columnType}`)
    return null
  }

  return values[Math.floor(Math.random() * values.length)]
}

/**
 * Generate sequential value
 */
function generateSequence(index: number, start?: number, step?: number): number {
  const s = start ?? 1
  const st = step ?? 1
  return s + index * st
}

/**
 * Generate value from pattern
 * Supports:
 *   # - random digit (0-9)
 *   A - random uppercase letter
 *   a - random lowercase letter
 *   * - random alphanumeric
 *   {...} - literal text
 */
function generatePattern(pattern: string): string {
  let result = ''
  let inLiteral = false
  let literalText = ''

  for (let i = 0; i < pattern.length; i++) {
    const char = pattern[i]

    if (char === '{') {
      inLiteral = true
      literalText = ''
      continue
    }

    if (char === '}') {
      inLiteral = false
      result += literalText
      continue
    }

    if (inLiteral) {
      literalText += char
      continue
    }

    switch (char) {
      case '#':
        result += String(Math.floor(Math.random() * 10))
        break
      case 'A':
        result += String.fromCharCode(65 + Math.floor(Math.random() * 26))
        break
      case 'a':
        result += String.fromCharCode(97 + Math.floor(Math.random() * 26))
        break
      case '*':
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
        result += chars[Math.floor(Math.random() * chars.length)]
        break
      default:
        result += char
    }
  }

  return result
}

/**
 * Generate value from template with nested rules
 */
function generateTemplate(
  template: string,
  data?: Record<string, GenerationRule>,
  context?: GenerationContext
): string {
  let result = template

  if (data && context) {
    for (const [key, rule] of Object.entries(data)) {
      const value = generate(rule, context)
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value))
    }
  }

  return result
}

/**
 * Generate a complete row of data using column definitions
 */
export function generateRow(
  columns: Array<{ name: string; type?: string; generate?: GenerationRule }>,
  context: GenerationContext
): Record<string, unknown> {
  const row: Record<string, unknown> = {}

  for (const column of columns) {
    if (column.generate) {
      // Update context with current row state and column type (for from-source handler)
      const colContext: GenerationContext = {
        ...context,
        row,
        ...(column.type !== undefined && { columnType: column.type }),
      }
      row[column.name] = generate(column.generate, colContext)
    } else {
      row[column.name] = null
    }
  }

  return row
}

/**
 * Generate multiple rows
 * @param columns - Column definitions with type info for from-source handler
 * @param count - Number of rows to generate
 * @param sourceData - Pre-fetched source data mapped by column type id
 */
export function generateRows(
  columns: Array<{ name: string; type?: string; generate?: GenerationRule }>,
  count: number,
  sourceData?: Record<string, unknown[]>
): Record<string, unknown>[] {
  const rows: Record<string, unknown>[] = []

  for (let i = 0; i < count; i++) {
    const context: GenerationContext = {
      index: i,
      total: count,
      row: {},
      ...(sourceData !== undefined && { sourceData }),
    }
    rows.push(generateRow(columns, context))
  }

  return rows
}

/**
 * Get all available generation handler names
 */
export function getGenerationHandlers(): string[] {
  return [
    'static',
    'faker',
    'random-int',
    'random-float',
    'random-boolean',
    'random-enum',
    'from-source',
    'sequence',
    'pattern',
    'template',
  ]
}

/**
 * Get commonly used faker methods
 */
export function getCommonFakerMethods(): string[] {
  return [
    'person.firstName',
    'person.lastName',
    'person.fullName',
    'internet.email',
    'phone.number',
    'company.name',
    'location.city',
    'location.country',
    'location.streetAddress',
    'location.zipCode',
    'commerce.price',
    'commerce.productName',
    'date.past',
    'date.future',
    'lorem.sentence',
    'lorem.paragraph',
    'string.uuid',
    'string.alphanumeric',
  ]
}
