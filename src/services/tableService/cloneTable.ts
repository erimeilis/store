import type { Bindings } from '@/types/bindings.js'
import type { Context } from 'hono'
import type { UserContext } from '@/types/database.js'
import type { CloneTableRequest, TableSchema, TableVisibility } from '@/types/dynamic-tables.js'
import { TableRepository } from '@/repositories/tableRepository.js'
import { isUserAdmin, getUserInfo } from '@/utils/common.js'

/**
 * Clone a table structure without data ("hollow clone")
 * Creates a new table with the same column definitions but no data rows
 */
export async function cloneTable(
  env: Bindings,
  c: Context,
  user: UserContext,
  request: CloneTableRequest
): Promise<TableSchema | Response> {
  console.log('🔄 cloneTable service called with:', { user, request })
  const tableRepo = new TableRepository(env)

  try {
    // Get user information including email
    const { userId, userEmail } = getUserInfo(c, user)

    // Check if user has access to the source table
    const sourceTable = await tableRepo.findTableById(request.sourceTableId, userId)
    if (!sourceTable) {
      return c.json({ error: 'Source table not found' }, 404)
    }

    // Check user permissions for source table
    const canReadSource = await hasTableReadAccess(sourceTable, user)
    if (!canReadSource) {
      return c.json({ error: 'You do not have access to the source table' }, 403)
    }

    // Get source table schema (columns)
    const sourceColumns = await tableRepo.getTableColumns(request.sourceTableId)
    if (!sourceColumns) {
      return c.json({ error: 'Source table schema not found' }, 404)
    }

    const sourceSchema = {
      table: sourceTable,
      columns: sourceColumns
    }

    // Generate unique table name if needed
    const finalTableName = await generateUniqueTableName(
      tableRepo,
      userId,
      request.newTableName
    )

    // Prepare clone data
    const cloneData = {
      name: finalTableName,
      description: request.description || `Clone of ${sourceSchema.table.name}`,
      visibility: request.visibility || 'private' as TableVisibility,
      forSale: request.forSale || false,
      userId: userId,
      columns: sourceSchema.columns.map((col: any) => ({
        name: col.name,
        type: col.type,
        isRequired: col.isRequired,
        allowDuplicates: col.allowDuplicates,
        defaultValue: col.defaultValue,
        position: col.position
      }))
    }

    // Create the cloned table (without data)
    const clonedTable = await tableRepo.createTable(cloneData, userId, userEmail)
    return clonedTable

  } catch (error) {
    console.error('Error cloning table:', error)
    return c.json({ error: 'Failed to clone table' }, 500)
  }
}

/**
 * Check if user has read access to a table based on visibility
 */
function hasTableReadAccess(table: any, user: UserContext): boolean {
  // Owner always has access
  if (table.createdBy === `user:${user.id}` || table.userId === user.id) {
    return true
  }

  // Admin always has access
  if (isUserAdmin(user)) {
    return true
  }

  // Check visibility-based access
  switch (table.visibility) {
    case 'shared':
    case 'public':
      return true // Anyone can read
    case 'private':
    default:
      return false // Only owner/admin
  }
}

/**
 * Generate a unique table name by appending numbers if needed
 */
async function generateUniqueTableName(
  tableRepo: TableRepository,
  userId: string,
  baseName: string
): Promise<string> {
  // Check if base name is available - using a different approach
  // For now, we'll use findTableByIdInternal approach but need to query all user tables
  // This is a simplified version for the clone functionality
  const existingNames: string[] = [] // TODO: Implement proper table name checking

  if (!existingNames.includes(baseName.toLowerCase())) {
    return baseName
  }

  // Try "Table Copy" format first
  const copyName = `${baseName} Copy`
  if (!existingNames.includes(copyName.toLowerCase())) {
    return copyName
  }

  // Try "Table Copy 2", "Table Copy 3", etc.
  let counter = 2
  let candidateName = `${baseName} Copy ${counter}`

  while (existingNames.includes(candidateName.toLowerCase())) {
    counter++
    candidateName = `${baseName} Copy ${counter}`
  }

  return candidateName
}