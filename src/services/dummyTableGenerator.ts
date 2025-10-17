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
 */
const COLUMN_TYPES: ColumnType[] = ['text', 'number', 'date', 'boolean', 'email', 'url', 'textarea', 'country']

/**
 * Sample column names for different types
 */
const COLUMN_NAME_TEMPLATES = {
  text: ['title', 'name', 'status', 'category', 'type', 'label', 'tag'],
  number: ['quantity', 'price', 'rating', 'score', 'views', 'likes', 'count'],
  date: ['createdDate', 'publishedDate', 'startDate', 'endDate', 'dueDate'],
  boolean: ['isActive', 'isPublished', 'isFeatured', 'isVerified', 'enabled'],
  email: ['email', 'contactEmail', 'supportEmail'],
  url: ['website', 'homepage', 'link', 'profileUrl'],
  textarea: ['description', 'notes', 'summary', 'content', 'bio'],
  country: ['country', 'location', 'origin', 'destination']
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
    case 'text':
      return faker.helpers.arrayElement([
        faker.commerce.productName(),
        faker.company.name(),
        faker.lorem.word(),
        faker.commerce.department()
      ])
    case 'number':
      return faker.number.int({ min: 1, max: 1000 }).toString()
    case 'date':
      return faker.date.past().toISOString().split('T')[0] || faker.date.past().toISOString()
    case 'boolean':
      return faker.datatype.boolean().toString()
    case 'email':
      return faker.internet.email()
    case 'url':
      return faker.internet.url()
    case 'textarea':
      return faker.lorem.paragraph()
    case 'country':
      return faker.location.country()
    default:
      return faker.lorem.word()
  }
}

/**
 * Generate a complete table with random schema
 */
export function generateDummyTable(userId: string, index: number, forceForSale?: boolean): CreateTableRequest {
  const columnCount = faker.number.int({ min: 3, max: 8 })
  const existingNames = new Set<string>()

  const columns: CreateColumnRequest[] = []
  for (let i = 0; i < columnCount; i++) {
    columns.push(generateColumn(i, existingNames))
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
    forSale: forceForSale !== undefined ? forceForSale : faker.datatype.boolean(0.2), // Force forSale if specified, otherwise 20% chance
    userId,
    columns
  }
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
