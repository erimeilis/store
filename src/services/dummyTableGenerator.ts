/**
 * Dummy Table Generator Service
 * Generates realistic test tables with faker data for development/testing
 */

import { faker } from '@faker-js/faker'
import type { Bindings } from '@/types/bindings'
import type { ColumnType, CreateTableRequest, CreateColumnRequest, TableType } from '@/types/dynamic-tables'
import { DEFAULT_SALE_COLUMNS, DEFAULT_RENT_COLUMNS, getDefaultColumns } from '@/types/dynamic-tables'
import { getPrismaClient } from '@/lib/database'

/**
 * Available column types with their faker generators
 * IMPORTANT: Only includes types allowed by DB CHECK constraint:
 * 'text', 'number', 'date', 'boolean', 'email', 'url', 'textarea', 'country'
 */
const COLUMN_TYPES: ColumnType[] = [
  'text', 'textarea', 'email', 'url', 'country',
  'number', 'date', 'boolean'
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
 * Returns proper types (string, number, boolean) for JSON storage
 */
function generateFakerValue(type: ColumnType): string | number | boolean {
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

    // Numeric types - return actual numbers for JSON storage
    case 'integer':
      return faker.number.int({ min: 1, max: 1000 })
    case 'float':
      return faker.number.float({ min: 0.1, max: 100, fractionDigits: 2 })
    case 'currency':
      return faker.number.float({ min: 0.99, max: 999.99, fractionDigits: 2 })
    case 'percentage':
      return faker.number.int({ min: 0, max: 100 })
    case 'number': // deprecated - use integer or float
      return faker.number.int({ min: 1, max: 1000 })

    // Date/Time types
    case 'date':
      return faker.date.past().toISOString().split('T')[0] || faker.date.past().toISOString()
    case 'time':
      return faker.date.recent().toISOString().split('T')[1]?.substring(0, 5) || '12:00'
    case 'datetime':
      return faker.date.past().toISOString()

    // Other types
    case 'boolean':
      return faker.datatype.boolean()
    case 'select':
      // Should not be called for select type (requires options)
      return faker.lorem.word()
    case 'rating':
      return faker.number.int({ min: 1, max: 5 })
    case 'color':
      return faker.color.rgb({ format: 'hex' })

    default:
      return faker.lorem.word()
  }
}

/**
 * Generate required columns based on table type
 * For 'sale' tables: price, qty
 * For 'rent' tables: price, used, available
 */
function generateTypeColumns(tableType: TableType, startPosition: number, existingNames: Set<string>): CreateColumnRequest[] {
  if (tableType === 'default') return []

  const defaultColumns = getDefaultColumns(tableType)

  return defaultColumns.map((col, index) => {
    existingNames.add(col.name)
    const result: CreateColumnRequest = {
      name: col.name,
      type: col.type,
      isRequired: col.isRequired,
      allowDuplicates: col.allowDuplicates ?? true,
      position: startPosition + index
    }
    if (col.defaultValue !== undefined) {
      result.defaultValue = col.defaultValue
    }
    return result
  })
}

/**
 * @deprecated Use generateTypeColumns instead
 * Generate required sale columns (price and qty) for sale tables
 */
function generateSaleColumns(startPosition: number, existingNames: Set<string>): CreateColumnRequest[] {
  return generateTypeColumns('sale', startPosition, existingNames)
}

/**
 * Phone number provider names for realistic data
 */
const PHONE_PROVIDERS = [
  'Twilio', 'Vonage', 'Bandwidth', 'Plivo', 'Telnyx', 'Sinch',
  'MessageBird', 'Infobip', 'Clickatell', 'Nexmo', 'RingCentral',
  'Grasshopper', 'Google Voice', 'Skype', 'Zoom Phone'
]

/**
 * Generate phone number table columns
 * Includes conditional columns based on voice/sms/tollfree settings
 * @param tableType - 'sale' or 'rent' - determines which protected columns to include
 */
function generatePhoneTableColumns(existingNames: Set<string>, tableType: TableType = 'sale'): CreateColumnRequest[] {
  const columns: CreateColumnRequest[] = []
  let position = 0

  // Protected columns based on table type
  // Using 'number' type as it's the only numeric type allowed by DB CHECK constraint
  columns.push({
    name: 'price',
    type: 'number',
    isRequired: true,
    allowDuplicates: true,
    position: position++
  })
  existingNames.add('price')

  if (tableType === 'sale') {
    // Sale tables have qty column
    columns.push({
      name: 'qty',
      type: 'number',
      isRequired: true,
      allowDuplicates: true,
      defaultValue: '1',
      position: position++
    })
    existingNames.add('qty')
  } else if (tableType === 'rent') {
    // Rent tables have fee, used, and available columns
    columns.push({
      name: 'fee',
      type: 'number',
      isRequired: true,
      allowDuplicates: true,
      defaultValue: '0',
      position: position++
    })
    existingNames.add('fee')

    columns.push({
      name: 'used',
      type: 'boolean',
      isRequired: true,
      allowDuplicates: true,
      defaultValue: 'false',
      position: position++
    })
    existingNames.add('used')

    columns.push({
      name: 'available',
      type: 'boolean',
      isRequired: true,
      allowDuplicates: true,
      defaultValue: 'true',
      position: position++
    })
    existingNames.add('available')
  }

  // Core phone columns
  columns.push({
    name: 'number',
    type: 'text',
    isRequired: true,
    allowDuplicates: false, // Phone numbers should be unique
    position: position++
  })
  existingNames.add('number')

  columns.push({
    name: 'country',
    type: 'country',
    isRequired: true,
    allowDuplicates: true,
    position: position++
  })
  existingNames.add('country')

  columns.push({
    name: 'area',
    type: 'text',
    isRequired: false,
    allowDuplicates: true,
    position: position++
  })
  existingNames.add('area')

  // Boolean feature columns
  columns.push({
    name: 'voice',
    type: 'boolean',
    isRequired: true,
    allowDuplicates: true,
    defaultValue: 'true',
    position: position++
  })
  existingNames.add('voice')

  columns.push({
    name: 'sms',
    type: 'boolean',
    isRequired: true,
    allowDuplicates: true,
    defaultValue: 'false',
    position: position++
  })
  existingNames.add('sms')

  // Conditional columns - these will be included but data generation handles the logic
  columns.push({
    name: 'reg',
    type: 'boolean',
    isRequired: false,
    allowDuplicates: true,
    position: position++
  })
  existingNames.add('reg')

  columns.push({
    name: 'tollfree',
    type: 'boolean',
    isRequired: false,
    allowDuplicates: true,
    position: position++
  })
  existingNames.add('tollfree')

  // Rate columns (using 'number' type for DB compatibility)
  columns.push({
    name: 'incomingPerMinute',
    type: 'number',
    isRequired: false,
    allowDuplicates: true,
    position: position++
  })
  existingNames.add('incomingPerMinute')

  columns.push({
    name: 'incomingRateSms',
    type: 'number',
    isRequired: false,
    allowDuplicates: true,
    position: position++
  })
  existingNames.add('incomingRateSms')

  // Info columns
  columns.push({
    name: 'docs',
    type: 'url',
    isRequired: false,
    allowDuplicates: true,
    position: position++
  })
  existingNames.add('docs')

  columns.push({
    name: 'description',
    type: 'textarea',
    isRequired: false,
    allowDuplicates: true,
    position: position++
  })
  existingNames.add('description')

  columns.push({
    name: 'providerName',
    type: 'text',
    isRequired: true,
    allowDuplicates: true,
    position: position++
  })
  existingNames.add('providerName')

  return columns
}

/**
 * Generate data row for phone number table with conditional logic
 * @param tableType - 'sale' or 'rent' - determines which protected columns to generate
 */
function generatePhoneDataRow(tableType: TableType = 'sale'): Record<string, any> {
  const row: Record<string, any> = {}

  // Price - common to both sale and rent
  row.price = faker.commerce.price({ min: 0.50, max: 50.00, dec: 2 })

  if (tableType === 'sale') {
    // Sale tables have qty
    row.qty = faker.number.int({ min: 1, max: 1000 })
  } else if (tableType === 'rent') {
    // Rent tables have fee, used, and available
    // Fee is a deposit or one-time rental fee
    row.fee = faker.number.float({ min: 5, max: 50, fractionDigits: 2 })
    // Fresh inventory: all items are unused and available
    row.used = false
    row.available = true
  }

  // Generate phone number (just digits)
  const countryCode = faker.helpers.arrayElement(['1', '44', '49', '33', '39', '34', '81', '86', '91', '7'])
  const areaCode = faker.string.numeric(3)
  const localNumber = faker.string.numeric(7)
  row.number = `${countryCode}${areaCode}${localNumber}`

  // Country (use ISO code matching the country code when possible)
  const countryMap: Record<string, string> = {
    '1': 'US', '44': 'GB', '49': 'DE', '33': 'FR', '39': 'IT',
    '34': 'ES', '81': 'JP', '86': 'CN', '91': 'IN', '7': 'RU'
  }
  row.country = countryMap[countryCode] || faker.location.countryCode('alpha-2')

  // Area name
  row.area = faker.location.city()

  // Boolean features with realistic distribution
  const voice = faker.datatype.boolean(0.7) // 70% have voice
  const sms = faker.datatype.boolean(0.5) // 50% have SMS
  row.voice = voice
  row.sms = sms

  // Conditional: reg only if sms is true
  let reg = false
  if (sms) {
    reg = faker.datatype.boolean(0.6) // 60% of SMS numbers support registration
    row.reg = reg
  }

  // Conditional: tollfree only if voice, sms, and reg are ALL false
  let tollfree = false
  if (!voice && !sms && !reg) {
    tollfree = true // If no other features, make it tollfree
    row.tollfree = true
  } else if (!voice && !sms) {
    tollfree = faker.datatype.boolean(0.3) // 30% chance otherwise
    row.tollfree = tollfree
  }

  // Conditional: incomingPerMinute only if voice or tollfree
  if (voice || tollfree) {
    row.incomingPerMinute = faker.commerce.price({ min: 0.01, max: 0.10, dec: 2 })
  }

  // Conditional: incomingRateSms only if sms
  if (sms) {
    row.incomingRateSms = faker.commerce.price({ min: 0.01, max: 0.05, dec: 2 })
  }

  // Documentation URL
  if (faker.datatype.boolean(0.7)) {
    row.docs = faker.internet.url()
  }

  // Description
  if (faker.datatype.boolean(0.6)) {
    const features = []
    if (voice) features.push('voice calls')
    if (sms) features.push('SMS')
    if (tollfree) features.push('toll-free')
    row.description = `Phone number for ${row.area}, ${row.country}. Supports ${features.join(', ') || 'basic features'}.`
  }

  // Provider name
  row.providerName = faker.helpers.arrayElement(PHONE_PROVIDERS)

  return row
}

/**
 * Generate a phone number table
 * @param tableType - 'sale' or 'rent' - determines which protected columns to include
 */
function generatePhoneTable(userId: string, index: number, tableType: TableType = 'sale'): CreateTableRequest {
  const existingNames = new Set<string>()
  const columns = generatePhoneTableColumns(existingNames, tableType)

  const phoneTypes = [
    'Phone Numbers', 'Virtual Numbers', 'DID Numbers', 'VoIP Numbers',
    'Business Phone', 'Mobile Numbers', 'Toll-Free Numbers', 'Local Numbers'
  ]

  // Add rent-specific names
  if (tableType === 'rent') {
    phoneTypes.push('Rental Numbers', 'Temporary Numbers', 'Short-Term Numbers')
  }

  const phoneType = faker.helpers.arrayElement(phoneTypes)
  const timestamp = Date.now().toString(36).slice(-5).toUpperCase()

  const result: CreateTableRequest = {
    name: `${phoneType} #${index}-${timestamp}`,
    description: `${phoneType} ${tableType === 'rent' ? 'rental' : 'inventory'} with voice, SMS, and pricing information`,
    visibility: faker.helpers.arrayElement(['private', 'public', 'shared'] as const),
    tableType: tableType,
    userId,
    columns
  }

  // Phone tables use 'number' column as the product identifier
  if (tableType === 'sale' || tableType === 'rent') {
    result.productIdColumn = 'number'
  }

  return result
}

/**
 * Generate a complete table with random schema
 * @param userId - Owner user ID
 * @param index - Table index for naming
 * @param forceTableType - Force a specific table type ('sale', 'rent', or 'default')
 */
export function generateDummyTable(userId: string, index: number, forceTableType?: TableType): CreateTableRequest {
  // Determine table type: forced, or random (20% sale, 10% rent, 70% default)
  let tableType: TableType = 'default'
  if (forceTableType !== undefined) {
    tableType = forceTableType
  } else {
    const random = faker.number.float({ min: 0, max: 1 })
    if (random < 0.2) {
      tableType = 'sale'
    } else if (random < 0.3) {
      tableType = 'rent'
    }
  }

  // For "sale" or "rent" tables, 50% chance to generate phone table
  if ((tableType === 'sale' || tableType === 'rent') && faker.datatype.boolean(0.5)) {
    return generatePhoneTable(userId, index, tableType)
  }

  const columnCount = faker.number.int({ min: 3, max: 8 })
  const existingNames = new Set<string>()

  const columns: CreateColumnRequest[] = []
  let positionOffset = 0

  // For special table types, add required columns first
  if (tableType !== 'default') {
    const typeColumns = generateTypeColumns(tableType, 0, existingNames)
    columns.push(...typeColumns)
    positionOffset = typeColumns.length
  }

  // Generate random columns after type-specific columns
  for (let i = 0; i < columnCount; i++) {
    columns.push(generateColumn(i + positionOffset, existingNames))
  }

  const tableNames = [
    'Products', 'Customers', 'Orders', 'Inventory', 'Employees',
    'Projects', 'Tasks', 'Events', 'Contacts', 'Assets',
    'Campaigns', 'Reports', 'Analytics', 'Feedback', 'Leads'
  ]

  // Add type-specific table names
  if (tableType === 'rent') {
    tableNames.push('Equipment', 'Vehicles', 'Tools', 'Machinery', 'Spaces', 'Rooms')
  }

  const tableName = faker.helpers.arrayElement(tableNames)
  const timestamp = Date.now().toString(36).slice(-5).toUpperCase()

  const result: CreateTableRequest = {
    name: `${tableName} #${index}-${timestamp}`,
    description: faker.company.catchPhrase(),
    visibility: faker.helpers.arrayElement(['private', 'public', 'shared'] as const),
    tableType: tableType,
    userId,
    columns
  }

  // For sale/rent tables, find a suitable text column as productIdColumn
  // Prefer 'title' or 'name' columns, otherwise use first text column
  if (tableType !== 'default') {
    const textColumns = columns.filter(col => col.type === 'text')
    const preferredColumn = textColumns.find(col =>
      col.name.toLowerCase().includes('title') ||
      col.name.toLowerCase().includes('name')
    )
    const productIdColumn = preferredColumn?.name || textColumns[0]?.name
    if (productIdColumn) {
      result.productIdColumn = productIdColumn
    }
  }

  return result
}

/**
 * Generate sale-specific value for price or qty columns
 */
function generateSaleValue(columnName: string): string | number {
  if (columnName === 'price') {
    // Generate realistic price between $0.99 and $999.99
    return faker.number.float({ min: 0.99, max: 999.99, fractionDigits: 2 })
  } else if (columnName === 'qty') {
    // Generate realistic quantity between 1 and 100
    return faker.number.int({ min: 1, max: 100 })
  }
  return faker.number.int({ min: 1, max: 1000 })
}

/**
 * Generate rent-specific value for price, fee, used, and available columns
 * All generated items are fresh inventory: used=false, available=true
 */
function generateRentValue(columnName: string): string | number | boolean {
  if (columnName === 'price') {
    // Generate realistic rental price between $5 and $500
    return faker.number.float({ min: 5, max: 500, fractionDigits: 2 })
  } else if (columnName === 'fee') {
    // Generate realistic deposit/one-time fee between $5 and $50
    return faker.number.float({ min: 5, max: 50, fractionDigits: 2 })
  } else if (columnName === 'used') {
    // Fresh inventory: never been rented before
    return false
  } else if (columnName === 'available') {
    // Fresh inventory: ready to rent
    return true
  }
  return faker.datatype.boolean()
}

/**
 * Generate data row for a table based on its columns
 * @param columns - Column definitions
 * @param tableType - Type of table ('default', 'sale', 'rent') for specialized value generation
 */
export function generateDataRow(
  columns: Array<{ name: string; type: ColumnType; isRequired: boolean; defaultValue: string | number | boolean | null }>,
  tableType: TableType = 'default'
): Record<string, any> {
  const row: Record<string, any> = {}

  for (const column of columns) {
    // Skip if not required and randomly decide to omit (20% chance)
    if (!column.isRequired && faker.datatype.boolean(0.2)) {
      continue
    }

    // Special handling for sale columns (price, qty) - generate realistic values
    if (tableType === 'sale' && (column.name === 'price' || column.name === 'qty')) {
      row[column.name] = generateSaleValue(column.name)
      continue
    }

    // Special handling for rent columns (price, fee, used, available) - generate realistic values
    if (tableType === 'rent' && (column.name === 'price' || column.name === 'fee' || column.name === 'used' || column.name === 'available')) {
      row[column.name] = generateRentValue(column.name)
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
 * @param forceTableType - Force a specific table type for all generated tables (default: undefined = random mix)
 */
export async function generateDummyTables(
  env: Bindings,
  userId: string,
  tableCount: number = 100,
  rowsPerTable: number = 200,
  forceTableType?: TableType
): Promise<{ success: true; tablesCreated: number; rowsCreated: number } | { success: false; error: string }> {
  try {
    const database = getPrismaClient(env)
    let totalTablesCreated = 0
    let totalRowsCreated = 0

    const typeLabel = forceTableType ? ` (${forceTableType.toUpperCase()} ONLY)` : ''
    console.log(`🎲 Starting generation of ${tableCount} tables with ${rowsPerTable} rows each${typeLabel}...`)

    for (let i = 1; i <= tableCount; i++) {
      try {
        // Generate table schema
        const tableRequest = generateDummyTable(userId, i, forceTableType)

        // Create UserTable in database
        const userTable = await database.userTable.create({
          data: {
            name: tableRequest.name,
            description: tableRequest.description || null,
            createdBy: 'system', // System generated
            userId: userId, // Assign to admin user
            visibility: tableRequest.visibility,
            tableType: tableRequest.tableType || 'default',
            productIdColumn: tableRequest.productIdColumn || null
          }
        })

        totalTablesCreated++

        // Create table columns in batch (reduces DB operations)
        const columnData = tableRequest.columns.map(column => ({
          tableId: userTable.id,
          name: column.name,
          type: column.type,
          isRequired: column.isRequired,
          allowDuplicates: column.allowDuplicates !== undefined ? column.allowDuplicates : true,
          // Convert defaultValue to string for DB storage
          defaultValue: column.defaultValue != null ? String(column.defaultValue) : null,
          position: column.position
        }))
        await database.tableColumn.createMany({ data: columnData })

        // Detect if this is a phone table by checking for phone-related name keywords
        const isPhoneTable = /phone|virtual|did|voip|toll-?free|mobile|local/i.test(tableRequest.name)

        if (isPhoneTable) {
          console.log(`📱 Creating phone table: ${tableRequest.name}`)
        }

        // Get table type for proper data generation
        const currentTableType = (tableRequest.tableType || 'default') as TableType

        // Generate data rows in batch (critical for avoiding Worker timeout)
        const dataRows = []
        for (let j = 0; j < rowsPerTable; j++) {
          // Use phone data generator for phone tables, standard generator for others
          const rowData = isPhoneTable
            ? generatePhoneDataRow(currentTableType)
            : generateDataRow(
                tableRequest.columns.map(col => ({
                  name: col.name,
                  type: col.type,
                  isRequired: col.isRequired,
                  defaultValue: col.defaultValue || null
                })),
                currentTableType
              )

          dataRows.push({
            tableId: userTable.id,
            data: JSON.stringify(rowData),
            createdBy: 'system'
          })
        }

        // Insert all rows in one batch operation
        await database.tableData.createMany({ data: dataRows })
        totalRowsCreated += rowsPerTable

        // Log progress every 10 tables
        if (i % 10 === 0) {
          console.log(`✅ Progress: ${i}/${tableCount} tables created (${totalRowsCreated} rows total)`)
        }
      } catch (tableError) {
        const errorMsg = tableError instanceof Error ? tableError.message : String(tableError)
        console.error(`❌ Error creating table ${i}/${tableCount}:`, errorMsg)
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
