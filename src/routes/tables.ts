import { Hono } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { readAuthMiddleware, writeAuthMiddleware } from '@/middleware/auth.js'
import { TableService } from '@/services/tableService/index.js'
import { parseImportFile } from '@/services/fileParserService/index.js'
import type { Bindings } from '@/types/bindings.js'
import type { UserContext } from '@/types/database.js'

/**
 * Table Management CRUD Routes
 * Handles operations for user-created dynamic tables: Create, Read, Update, Delete
 * All routes are protected with appropriate authentication middleware
 * Uses raw SQL queries since tables are not in Prisma schema
 */
const tablesRoutes = new Hono<{
  Bindings: Bindings
  Variables: { user: UserContext }
}>()

/**
 * List all tables accessible to user (own tables + public tables)
 * GET /api/tables
 */
tablesRoutes.get('/api/tables', readAuthMiddleware, async (c) => {
  const service = new TableService(c.env)
  const user = c.get('user')

  const query = {
    page: parseInt(c.req.query('page') || '1', 10),
    limit: parseInt(c.req.query('limit') || '10', 10),
    sort: c.req.query('sort') || 'updated_at',
    direction: c.req.query('direction') || 'desc',
    filter_name: c.req.query('filter_name') || '',
    filter_description: c.req.query('filter_description') || '',
    filter_owner: c.req.query('filter_owner') || '',
    filter_visibility: c.req.query('filter_visibility') || '',
    filter_created_at: c.req.query('filter_created_at') || '',
    filter_updated_at: c.req.query('filter_updated_at') || ''
  }

  const result = await service.listTables(c, user, query)

  return c.json(result.response, result.status as ContentfulStatusCode)
})

/**
 * Get specific table with its columns
 * GET /api/tables/:id
 */
tablesRoutes.get('/api/tables/:id', readAuthMiddleware, async (c) => {
  const service = new TableService(c.env)
  const user = c.get('user')
  const tableId = c.req.param('id')

  const result = await service.getTable(c, user, tableId)

  return c.json(result.response, result.status as ContentfulStatusCode)
})

/**
 * Create new table with columns
 * POST /api/tables
 */
tablesRoutes.post('/api/tables', writeAuthMiddleware, async (c) => {
  const service = new TableService(c.env)
  const user = c.get('user')
  const body = await c.req.json()

  const result = await service.createTable(c, user, body)

  return c.json(result.response, result.status as ContentfulStatusCode)
})

/**
 * Update table metadata (name, description, publicity)
 * PUT /api/tables/:id
 */
tablesRoutes.put('/api/tables/:id', writeAuthMiddleware, async (c) => {
  const service = new TableService(c.env)
  const user = c.get('user')
  const tableId = c.req.param('id')
  const body = await c.req.json()

  const result = await service.updateTable(c, user, tableId, body)

  return c.json(result.response, result.status as ContentfulStatusCode)
})

/**
 * Update table metadata (name, description, publicity) - PATCH method for inline editing
 * PATCH /api/tables/:id
 */
tablesRoutes.patch('/api/tables/:id', writeAuthMiddleware, async (c) => {
  try {
    const service = new TableService(c.env)
    const user = c.get('user')
    const tableId = c.req.param('id')

    console.log('🔍 PATCH Tables Route Debug:')
    console.log('  - tableId:', tableId)
    console.log('  - user:', user ? { id: user.id, permissions: user.permissions } : 'none')

    const body = await c.req.json()
    console.log('  - body:', JSON.stringify(body, null, 2))
    console.log('  - bodyType:', typeof body)

    const result = await service.updateTable(c, user, tableId, body)

    return c.json(result.response, result.status as ContentfulStatusCode)
  } catch (error) {
    console.log('❌ PATCH Tables Route Error:', error)
    console.log('❌ Error stack:', error instanceof Error ? error.stack : 'No stack')
    return c.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, 500)
  }
})

/**
 * Delete table and all its data
 * DELETE /api/tables/:id
 */
tablesRoutes.delete('/api/tables/:id', writeAuthMiddleware, async (c) => {
  const service = new TableService(c.env)
  const user = c.get('user')
  const tableId = c.req.param('id')

  const result = await service.deleteTable(c, user, tableId)

  return c.json(result.response, result.status as ContentfulStatusCode)
})

/**
 * Mass action for tables (make public/private, delete)
 * POST /api/tables/mass-action
 */
tablesRoutes.post('/api/tables/mass-action', writeAuthMiddleware, async (c) => {
  const service = new TableService(c.env)
  const user = c.get('user')
  const body = await c.req.json()

  const result = await service.executeMassAction(c, user, body.action, body.ids)

  return c.json(result.response, result.status as ContentfulStatusCode)
})

/**
 * Add new column to table
 * POST /api/tables/:id/columns
 */
tablesRoutes.post('/api/tables/:id/columns', writeAuthMiddleware, async (c) => {
  const service = new TableService(c.env)
  const user = c.get('user')
  const tableId = c.req.param('id')
  const body = await c.req.json()

  const result = await service.addColumn(c, user, tableId, body)

  return c.json(result.response, result.status as ContentfulStatusCode)
})

/**
 * Update column in table
 * PATCH /api/tables/:id/columns/:columnId
 */
tablesRoutes.patch('/api/tables/:id/columns/:columnId', writeAuthMiddleware, async (c) => {
  const service = new TableService(c.env)
  const user = c.get('user')
  const tableId = c.req.param('id')
  const columnId = c.req.param('columnId')
  const body = await c.req.json()

  const result = await service.updateColumn(c, user, tableId, columnId, body)

  return c.json(result.response, result.status as ContentfulStatusCode)
})

/**
 * Delete column from table
 * DELETE /api/tables/:id/columns/:columnId
 */
tablesRoutes.delete('/api/tables/:id/columns/:columnId', writeAuthMiddleware, async (c) => {
  const service = new TableService(c.env)
  const user = c.get('user')
  const tableId = c.req.param('id')
  const columnId = c.req.param('columnId')

  const result = await service.deleteColumn(c, user, tableId, columnId)

  return c.json(result.response, result.status as ContentfulStatusCode)
})

/**
 * Execute mass action on columns
 * POST /api/tables/:id/columns/mass-action
 */
tablesRoutes.post('/api/tables/:id/columns/mass-action', writeAuthMiddleware, async (c) => {
  const service = new TableService(c.env)
  const user = c.get('user')
  const tableId = c.req.param('id')
  const body = await c.req.json()

  // Expected body format: { action: 'make_required' | 'make_optional' | 'delete', columnIds: string[] }
  const result = await service.executeColumnMassAction(c, user, tableId, body.action, body.ids)

  return c.json(result.response, result.status as ContentfulStatusCode)
})

/**
 * Get columns for table import
 * GET /api/tables/:id/columns
 */
tablesRoutes.get('/api/tables/:id/columns', readAuthMiddleware, async (c) => {
  const service = new TableService(c.env)
  const user = c.get('user')
  const tableId = c.req.param('id')

  const result = await service.getTableColumns(c, user, tableId)

  return c.json(result.response, result.status as ContentfulStatusCode)
})

/**
 * Get individual column
 * GET /api/tables/:id/columns/:columnId
 */
tablesRoutes.get('/api/tables/:id/columns/:columnId', readAuthMiddleware, async (c) => {
  const service = new TableService(c.env)
  const user = c.get('user')
  const tableId = c.req.param('id')
  const columnId = c.req.param('columnId')

  const result = await service.getColumn(c, user, tableId, columnId)

  return c.json(result.response, result.status as ContentfulStatusCode)
})

/**
 * Parse uploaded file for import preview
 * POST /api/tables/:id/parse-import-file
 */
tablesRoutes.post('/api/tables/:id/parse-import-file', writeAuthMiddleware, async (c) => {
  try {
    const tableId = c.req.param('id')

    // Get the uploaded file and optional parameters
    const formData = await c.req.formData()
    const file = formData.get('file') as File
    const skipRowsParam = formData.get('skipRows') as string | null

    if (!file) {
      return c.json({
        error: 'No file provided',
        message: 'Please select a file to upload'
      }, 400)
    }

    // Parse skipRows parameter
    const skipRows = skipRowsParam ? parseInt(skipRowsParam, 10) : 0
    if (isNaN(skipRows) || skipRows < 0) {
      return c.json({
        error: 'Invalid skipRows parameter',
        message: 'skipRows must be a non-negative integer'
      }, 400)
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return c.json({
        error: 'File too large',
        message: 'File size must be less than 10MB'
      }, 400)
    }

    // Validate file type
    const allowedTypes = ['text/plain', 'text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
    const allowedExtensions = ['.txt', '.csv', '.xls', '.xlsx']

    const hasValidType = allowedTypes.includes(file.type) ||
                       allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))

    if (!hasValidType) {
      return c.json({
        error: 'Invalid file type',
        message: 'Only TXT, CSV, XLS, and XLSX files are supported'
      }, 400)
    }

    // Parse the file using our comprehensive file parser service
    const fileParseResult = await parseImportFile(file, { skipRows })

    // Get table columns for intelligent column mapping
    const service = new TableService(c.env)
    const user = c.get('user')
    const tableColumns = await service.getTableColumns(c, user, tableId)

    const parsedData = {
      headers: fileParseResult.headers,
      rows: fileParseResult.rows,
      hasHeaders: fileParseResult.hasHeaders,
      fileType: fileParseResult.fileType,
      fileName: fileParseResult.fileName,
      skipRows: fileParseResult.skipRows,
      detectedColumnMappings: generateColumnMappings(fileParseResult.headers, tableColumns.response?.data || [])
    }

    return c.json({ data: parsedData, message: 'File parsed successfully' })

  } catch (error) {
    console.error('Error parsing import file:', error)
    return c.json({
      error: 'Parse failed',
      message: error instanceof Error ? error.message : 'Failed to parse the uploaded file'
    }, 500)
  }
})

/**
 * Import data into table
 * POST /api/tables/:id/import-data
 */
tablesRoutes.post('/api/tables/:id/import-data', writeAuthMiddleware, async (c) => {
  try {
    const tableId = c.req.param('id')
    const { data, headers, columnMappings, importMode, hasHeaders } = await c.req.json()

    if (!data || !Array.isArray(data) || data.length === 0) {
      return c.json({
        error: 'No data provided',
        message: 'Please provide data to import'
      }, 400)
    }

    if (!columnMappings || !Array.isArray(columnMappings) || columnMappings.length === 0) {
      return c.json({
        error: 'No column mappings',
        message: 'Please map at least one column'
      }, 400)
    }

    const service = new TableService(c.env)
    const user = c.get('user')

    const result = await service.importTableData(c, user, tableId, {
      data,
      headers,
      columnMappings,
      importMode: importMode || 'add',
      hasHeaders: hasHeaders || false
    })

    return c.json(result.response, result.status as ContentfulStatusCode)

  } catch (error) {
    console.error('Error importing table data:', error)
    return c.json({
      error: 'Import failed',
      message: error instanceof Error ? error.message : 'Failed to import data'
    }, 500)
  }
})

/**
 * Intelligent header detection by comparing first row with table columns
 * Uses multiple comparison strategies as suggested by user
 */
function detectHeaders(potentialHeaders: string[], tableColumns: any[]): boolean {
  if (!potentialHeaders.length || !tableColumns.length) return false

  // Extract column names from table columns
  const columnNames = tableColumns.map(col => col.name || col)

  let matchCount = 0

  for (const header of potentialHeaders) {
    const normalizedHeader = String(header).trim()

    for (const columnName of columnNames) {
      const normalizedColumn = String(columnName).trim()

      // Strategy 1: Both lowercase
      if (normalizedHeader.toLowerCase() === normalizedColumn.toLowerCase()) {
        matchCount++
        break
      }

      // Strategy 2: Both lowercase without spaces
      const headerNoSpaces = normalizedHeader.toLowerCase().replace(/\s+/g, '')
      const columnNoSpaces = normalizedColumn.toLowerCase().replace(/\s+/g, '')
      if (headerNoSpaces === columnNoSpaces) {
        matchCount++
        break
      }

      // Strategy 3: Both lowercase with only letters
      const headerLettersOnly = normalizedHeader.toLowerCase().replace(/[^a-z]/g, '')
      const columnLettersOnly = normalizedColumn.toLowerCase().replace(/[^a-z]/g, '')
      if (headerLettersOnly === columnLettersOnly && headerLettersOnly.length > 0) {
        matchCount++
        break
      }
    }
  }

  // Consider it has headers if at least one column matches
  return matchCount > 0
}

/**
 * Generate column mappings when headers match table columns
 */
function generateColumnMappings(headers: string[], tableColumns: any[]): Array<{sourceColumn: string, targetColumn: string}> {
  const mappings: Array<{sourceColumn: string, targetColumn: string}> = []
  const columnNames = tableColumns.map(col => col.name || col)

  for (const header of headers) {
    const normalizedHeader = String(header).trim()
    let bestMatch: string | null = null

    for (const columnName of columnNames) {
      const normalizedColumn = String(columnName).trim()

      // Strategy 1: Both lowercase
      if (normalizedHeader.toLowerCase() === normalizedColumn.toLowerCase()) {
        bestMatch = columnName
        break
      }

      // Strategy 2: Both lowercase without spaces
      const headerNoSpaces = normalizedHeader.toLowerCase().replace(/\s+/g, '')
      const columnNoSpaces = normalizedColumn.toLowerCase().replace(/\s+/g, '')
      if (headerNoSpaces === columnNoSpaces) {
        bestMatch = columnName
        break
      }

      // Strategy 3: Both lowercase with only letters
      const headerLettersOnly = normalizedHeader.toLowerCase().replace(/[^a-z]/g, '')
      const columnLettersOnly = normalizedColumn.toLowerCase().replace(/[^a-z]/g, '')
      if (headerLettersOnly === columnLettersOnly && headerLettersOnly.length > 0) {
        bestMatch = columnName
        break
      }
    }

    if (bestMatch) {
      mappings.push({
        sourceColumn: header,
        targetColumn: bestMatch
      })
    }
  }

  return mappings
}

export { tablesRoutes }
