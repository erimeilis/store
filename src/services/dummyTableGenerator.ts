/**
 * Dummy Table Generator Service
 * Generates realistic test tables with faker data for development/testing
 */

import { faker } from '@faker-js/faker'
import type { Bindings } from '@/types/bindings'
import type { ColumnType, CreateTableRequest, CreateColumnRequest } from '@/types/dynamic-tables'
import { getPrismaClient } from '@/lib/database'

/**
 * Available column types with their faker generators
 * Note: Excludes 'select' (requires options config) and deprecated 'number'
 */
const COLUMN_TYPES: ColumnType[] = [
  'text', 'textarea', 'email', 'url', 'phone', 'country',
  'integer', 'float', 'currency', 'percentage',
  'date', 'time', 'datetime',
  'boolean', 'rating', 'color'
]

/**
 * Sample column names for different types
 */
const COLUMN_NAME_TEMPLATES: Record<ColumnType, string[]> = {
  // Text types
  text: ['title', 'name', 'status', 'category', 'type', 'label', 'tag'],
  textarea: ['description', 'notes', 'summary', 'content', 'bio'],
  email: ['email', 'contactEmail', 'supportEmail'],
  url: ['website', 'homepage', 'link', 'profileUrl'],
  phone: ['phone', 'mobile', 'fax', 'contactPhone'],
  country: ['country', 'location', 'origin', 'destination'],
  // Numeric types
  integer: ['quantity', 'count', 'views', 'likes', 'stock'],
  float: ['weight', 'height', 'length', 'distance'],
  currency: ['price', 'cost', 'amount', 'fee', 'total'],
  percentage: ['discount', 'progress', 'completion', 'rate'],
  number: ['value', 'score', 'points'], // deprecated
  // Date/Time types
  date: ['createdDate', 'publishedDate', 'startDate', 'endDate', 'dueDate'],
  time: ['startTime', 'endTime', 'scheduledTime'],
  datetime: ['createdAt', 'updatedAt', 'publishedAt', 'scheduledAt'],
  // Other types
  boolean: ['isActive', 'isPublished', 'isFeatured', 'isVerified', 'enabled'],
  select: ['type', 'category', 'status'], // not used in generation
  rating: ['rating', 'stars', 'quality', 'satisfaction'],
  color: ['color', 'backgroundColor', 'accentColor', 'theme']
}

/**
 * Generate random realistic column name for a given type
 */
function generateColumnName(type: ColumnType, existingNames: Set<string>): string {
  const templates = COLUMN_NAME_TEMPLATES[type]
  let name = faker.helpers.arrayElement(templates)

  // Ensure unique name by adding suffix if needed
  let counter = 1
  let uniqueName = name
  while (existingNames.has(uniqueName)) {
    uniqueName = `${name}${counter}`
    counter++
  }

  existingNames.add(uniqueName)
  return uniqueName
}

/**
 * Generate realistic column definition
 */
function generateColumn(position: number, existingNames: Set<string>): CreateColumnRequest {
  const type = faker.helpers.arrayElement(COLUMN_TYPES)
  const name = generateColumnName(type, existingNames)

  const hasDefaultValue = faker.datatype.boolean(0.2)
  const defaultValue = hasDefaultValue ? generateFakerValue(type) : undefined

  return {
    name,
    type,
    isRequired: faker.datatype.boolean(0.3), // 30% required
    allowDuplicates: faker.datatype.boolean(0.8), // 80% allow duplicates
    ...(defaultValue !== undefined && { defaultValue }), // Only include if defined
    position
  }
}

/**
 * Generate faker value based on column type
 */
function generateFakerValue(type: ColumnType): string {
  switch (type) {
    // Text types
    case 'text':
      return faker.helpers.arrayElement([
        faker.commerce.productName(),
        faker.company.name(),
        faker.lorem.word(),
        faker.commerce.department()
      ])
    case 'textarea':
      return faker.lorem.paragraph()
    case 'email':
      return faker.internet.email()
    case 'url':
      return faker.internet.url()
    case 'phone':
      return faker.phone.number()
    case 'country':
      // Use ISO 3166-1 alpha-2 country codes (e.g., "US", "GB", "DE") for proper display with flags
      return faker.location.countryCode('alpha-2')

    // Numeric types
    case 'integer':
      return faker.number.int({ min: 1, max: 1000 }).toString()
    case 'float':
      return faker.number.float({ min: 0.1, max: 100, fractionDigits: 2 }).toString()
    case 'currency':
      return faker.number.float({ min: 0.99, max: 999.99, fractionDigits: 2 }).toString()
    case 'percentage':
      return faker.number.int({ min: 0, max: 100 }).toString()
    case 'number': // deprecated - use integer or float
      return faker.number.int({ min: 1, max: 1000 }).toString()

    // Date/Time types
    case 'date':
      return faker.date.past().toISOString().split('T')[0] || faker.date.past().toISOString()
    case 'time':
      return faker.date.recent().toISOString().split('T')[1]?.substring(0, 5) || '12:00'
    case 'datetime':
      return faker.date.past().toISOString()

    // Other types
    case 'boolean':
      return faker.datatype.boolean().toString()
    case 'select':
      // Should not be called for select type (requires options)
      return faker.lorem.word()
    case 'rating':
      return faker.number.int({ min: 1, max: 5 }).toString()
    case 'color':
      return faker.color.rgb({ format: 'hex' })

    default:
      return faker.lorem.word()
  }
}

/**
 * Generate required sale columns (price and qty) for forSale tables
 * These columns are always required and allow duplicates
 */
function generateSaleColumns(startPosition: number, existingNames: Set<string>): CreateColumnRequest[] {
  // Mark these names as used
  existingNames.add('price')
  existingNames.add('qty')

  return [
    {
      name: 'price',
      type: 'number',
      isRequired: true,
      allowDuplicates: true,
      position: startPosition
    },
    {
      name: 'qty',
      type: 'number',
      isRequired: true,
      allowDuplicates: true,
      defaultValue: '1',
      position: startPosition + 1
    }
  ]
}

/**
 * Generate a complete table with random schema
 */
export function generateDummyTable(userId: string, index: number, forceForSale?: boolean): CreateTableRequest {
  const columnCount = faker.number.int({ min: 3, max: 8 })
  const existingNames = new Set<string>()
  const isForSale = forceForSale !== undefined ? forceForSale : faker.datatype.boolean(0.2)

  const columns: CreateColumnRequest[] = []
  let positionOffset = 0

  // For "for sale" tables, add required price/qty columns first
  if (isForSale) {
    const saleColumns = generateSaleColumns(0, existingNames)
    columns.push(...saleColumns)
    positionOffset = saleColumns.length
  }

  // Generate random columns after sale columns
  for (let i = 0; i < columnCount; i++) {
    columns.push(generateColumn(i + positionOffset, existingNames))
  }

  const tableTypes = [
    'Products', 'Customers', 'Orders', 'Inventory', 'Employees',
    'Projects', 'Tasks', 'Events', 'Contacts', 'Assets',
    'Campaigns', 'Reports', 'Analytics', 'Feedback', 'Leads'
  ]

  const tableType = faker.helpers.arrayElement(tableTypes)

  return {
    name: `${tableType} Test ${index}`,
    description: faker.company.catchPhrase(),
    visibility: faker.helpers.arrayElement(['private', 'public', 'shared'] as const),
    forSale: isForSale,
    userId,
    columns
  }
}

/**
 * Generate sale-specific value for price or qty columns
 */
function generateSaleValue(columnName: string): string {
  if (columnName === 'price') {
    // Generate realistic price between $0.99 and $999.99
    return faker.commerce.price({ min: 0.99, max: 999.99, dec: 2 })
  } else if (columnName === 'qty') {
    // Generate realistic quantity between 1 and 100
    return faker.number.int({ min: 1, max: 100 }).toString()
  }
  return faker.number.int({ min: 1, max: 1000 }).toString()
}

/**
 * Generate data row for a table based on its columns
 */
export function generateDataRow(columns: Array<{ name: string; type: ColumnType; isRequired: boolean; defaultValue: string | null }>): Record<string, any> {
  const row: Record<string, any> = {}

  for (const column of columns) {
    // Skip if not required and randomly decide to omit (20% chance)
    if (!column.isRequired && faker.datatype.boolean(0.2)) {
      continue
    }

    // Special handling for sale columns (price, qty) - generate realistic values
    if (column.name === 'price' || column.name === 'qty') {
      row[column.name] = generateSaleValue(column.name)
      continue
    }

    // Use default value if provided and randomly decide to use it (50% chance)
    if (column.defaultValue && faker.datatype.boolean(0.5)) {
      row[column.name] = column.defaultValue
      continue
    }

    // Generate faker value
    row[column.name] = generateFakerValue(column.type)
  }

  return row
}

/**
 * Generate multiple tables with data
 * @param env - Cloudflare environment bindings
 * @param userId - User ID to assign as table owner
 * @param tableCount - Number of tables to generate (default: 100)
 * @param rowsPerTable - Number of rows per table (default: 200)
 * @param forSaleOnly - If true, all generated tables will be marked as "for sale" (default: false)
 */
export async function generateDummyTables(
  env: Bindings,
  userId: string,
  tableCount: number = 100,
  rowsPerTable: number = 200,
  forSaleOnly: boolean = false
): Promise<{ success: true; tablesCreated: number; rowsCreated: number } | { success: false; error: string }> {
  try {
    const database = getPrismaClient(env)
    let totalTablesCreated = 0
    let totalRowsCreated = 0

    console.log(`🎲 Starting generation of ${tableCount} tables with ${rowsPerTable} rows each${forSaleOnly ? ' (FOR SALE ONLY)' : ''}...`)

    for (let i = 1; i <= tableCount; i++) {
      try {
        // Generate table schema
        const tableRequest = generateDummyTable(userId, i, forSaleOnly)

        // Create UserTable in database
        const userTable = await database.userTable.create({
          data: {
            name: tableRequest.name,
            description: tableRequest.description || null,
            createdBy: 'system', // System generated
            userId: userId, // Assign to admin user
            visibility: tableRequest.visibility,
            forSale: tableRequest.forSale || false
          }
        })

        totalTablesCreated++

        // Create table columns
        for (const column of tableRequest.columns) {
          await database.tableColumn.create({
            data: {
              tableId: userTable.id,
              name: column.name,
              type: column.type,
              isRequired: column.isRequired,
              allowDuplicates: column.allowDuplicates !== undefined ? column.allowDuplicates : true,
              defaultValue: column.defaultValue || null,
              position: column.position
            }
          })
        }

        // Generate and insert data rows
        for (let j = 0; j < rowsPerTable; j++) {
          const rowData = generateDataRow(
            tableRequest.columns.map(col => ({
              name: col.name,
              type: col.type,
              isRequired: col.isRequired,
              defaultValue: col.defaultValue || null
            }))
          )

          await database.tableData.create({
            data: {
              tableId: userTable.id,
              data: JSON.stringify(rowData),
              createdBy: 'system' // System generated
            }
          })

          totalRowsCreated++
        }

        // Log progress every 10 tables
        if (i % 10 === 0) {
          console.log(`✅ Progress: ${i}/${tableCount} tables created (${totalRowsCreated} rows total)`)
        }
      } catch (tableError) {
        console.error(`❌ Error creating table ${i}:`, tableError)
        // Continue with next table instead of failing completely
      }
    }

    console.log(`🎉 Generation complete! Created ${totalTablesCreated} tables with ${totalRowsCreated} total rows`)

    return {
      success: true,
      tablesCreated: totalTablesCreated,
      rowsCreated: totalRowsCreated
    }
  } catch (error) {
    console.error('❌ Dummy table generation failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during generation'
    }
  }
}
