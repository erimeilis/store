import { Hono } from 'hono'
import { cors } from 'hono/cors'

// Import types
import type { Bindings } from '../types/bindings.js'
import type { Item } from '../types/item.js'
import type { GoogleSheetsResponse } from '../types/google-sheets.js'

// Import utility functions
import { parseGoogleSheetsData } from '../utils/sheets-parser.js'
import { parseFileContent } from '../utils/file-parser.js'
import { bulkInsertItems } from '../utils/database.js'

// Create Hono app with bindings
const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for all routes
app.use('*', cors({
  origin: (origin) => {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:8787', 
      'https://store-crud-front.pages.dev'
    ]
    if (!origin) return '*'
    if (allowedOrigins.includes(origin)) return origin
    if (origin.match(/^https:\/\/[a-zA-Z0-9-]+\.store-crud-front\.pages\.dev$/)) return origin
    if (origin.match(/^https:\/\/[a-zA-Z0-9-]+\.workers\.dev$/)) return origin
    if (origin.match(/^https:\/\/[a-zA-Z0-9-]+\.pages\.dev$/)) return origin
    return false
  },
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}))

// Bearer token authentication middleware
const createBearerAuthMiddleware = (requiredPermission: 'read' | 'write') => {
  return async (c: any, next: any) => {
    const authHeader = c.req.header('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized', message: 'Bearer token required' }, 401)
    }
    
    const token = authHeader.replace('Bearer ', '')
    
    // Get tokens from environment variables
    const fullAccessToken = c.env?.FULL_ACCESS_TOKEN || 'dev-full-access-token'
    const readOnlyToken = c.env?.READ_ONLY_TOKEN || 'dev-read-only-token'
    
    let hasPermission = false
    let userContext = { id: 'anonymous', permissions: [] as string[] }
    
    if (token === fullAccessToken) {
      hasPermission = true
      userContext = { id: 'full-access-user', permissions: ['read', 'write'] }
    } else if (token === readOnlyToken) {
      hasPermission = requiredPermission === 'read'
      userContext = { id: 'read-only-user', permissions: ['read'] }
    }
    
    if (!hasPermission) {
      return c.json({ 
        error: 'Forbidden', 
        message: `Insufficient permissions. Required: ${requiredPermission}` 
      }, 403)
    }
    
    // Set user context for downstream handlers
    c.set('user', userContext)
    
    return next()
  }
}

// Create specific middleware instances
const readAuthMiddleware = createBearerAuthMiddleware('read')
const writeAuthMiddleware = createBearerAuthMiddleware('write')

// =============================================================================
// API ROUTES
// =============================================================================

// Root endpoint - redirects to health check
app.get('/', (c) => {
  return c.json({ 
    status: 'healthy',
    message: 'Store CRUD API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'backend-api'
  })
})

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ 
    status: 'healthy',
    message: 'Store CRUD API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'backend-api'
  })
})

// GET /api/items - List all items (protected)
app.get('/api/items', readAuthMiddleware, async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM items ORDER BY created_at DESC'
    ).all()
    
    return c.json({ 
      items: results,
      count: results.length
    })
  } catch (error) {
    return c.json({ 
      error: 'Failed to fetch items',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// GET /api/items/:id - Get specific item (protected)
app.get('/api/items/:id', readAuthMiddleware, async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    
    if (isNaN(id)) {
      return c.json({
        error: 'Invalid item ID',
        message: 'Item ID must be a valid number'
      }, 400)
    }

    const item = await c.env.DB.prepare(
      'SELECT * FROM items WHERE id = ?'
    ).bind(id).first()
    
    if (!item) {
      return c.json({
        error: 'Item not found',
        message: `Item with ID ${id} does not exist`
      }, 404)
    }

    return c.json({ item })
  } catch (error) {
    return c.json({
      error: 'Failed to fetch item',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// POST /api/items - Create new item (protected)
app.post('/api/items', writeAuthMiddleware, async (c) => {
  try {
    const body = await c.req.json()
    
    // Validate required fields
    if (!body.name || typeof body.name !== 'string') {
      return c.json({
        error: 'Validation failed',
        message: 'Name is required and must be a string'
      }, 400)
    }

    // Insert into D1 database
    const result = await c.env.DB.prepare(
      'INSERT INTO items (name, description, data) VALUES (?, ?, ?)'
    ).bind(
      body.name.trim(),
      body.description || null,
      body.data ? JSON.stringify(body.data) : null
    ).run()

    // Fetch the created item
    const createdItem = await c.env.DB.prepare(
      'SELECT * FROM items WHERE id = ?'
    ).bind(result.meta.last_row_id).first()

    return c.json({ 
      item: createdItem,
      message: 'Item created successfully'
    }, 201)
  } catch (error) {
    if (error instanceof SyntaxError) {
      return c.json({
        error: 'Invalid JSON',
        message: 'Request body must be valid JSON'
      }, 400)
    }
    
    return c.json({
      error: 'Failed to create item',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// PUT /api/items/:id - Update existing item (protected)
app.put('/api/items/:id', writeAuthMiddleware, async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    
    if (isNaN(id)) {
      return c.json({
        error: 'Invalid item ID',
        message: 'Item ID must be a valid number'
      }, 400)
    }

    const body = await c.req.json()
    
    // Validate required fields
    if (!body.name || typeof body.name !== 'string') {
      return c.json({
        error: 'Validation failed',
        message: 'Name is required and must be a string'
      }, 400)
    }

    // Check if item exists
    const existingItem = await c.env.DB.prepare(
      'SELECT * FROM items WHERE id = ?'
    ).bind(id).first()
    
    if (!existingItem) {
      return c.json({
        error: 'Item not found',
        message: `Item with ID ${id} does not exist`
      }, 404)
    }

    // Update item in database
    await c.env.DB.prepare(
      'UPDATE items SET name = ?, description = ?, data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(
      body.name.trim(),
      body.description || null,
      body.data ? JSON.stringify(body.data) : null,
      id
    ).run()

    // Fetch updated item
    const updatedItem = await c.env.DB.prepare(
      'SELECT * FROM items WHERE id = ?'
    ).bind(id).first()

    return c.json({
      item: updatedItem,
      message: 'Item updated successfully'
    })
  } catch (error) {
    if (error instanceof SyntaxError) {
      return c.json({
        error: 'Invalid JSON',
        message: 'Request body must be valid JSON'
      }, 400)
    }
    
    return c.json({
      error: 'Failed to update item',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// DELETE /api/items/:id - Delete item (protected)
app.delete('/api/items/:id', writeAuthMiddleware, async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    
    if (isNaN(id)) {
      return c.json({
        error: 'Invalid item ID',
        message: 'Item ID must be a valid number'
      }, 400)
    }

    // Check if item exists and get it before deletion
    const existingItem = await c.env.DB.prepare(
      'SELECT * FROM items WHERE id = ?'
    ).bind(id).first()
    
    if (!existingItem) {
      return c.json({
        error: 'Item not found',
        message: `Item with ID ${id} does not exist`
      }, 404)
    }

    // Delete the item
    await c.env.DB.prepare(
      'DELETE FROM items WHERE id = ?'
    ).bind(id).run()

    return c.json({
      item: existingItem,
      message: 'Item deleted successfully'
    })
  } catch (error) {
    return c.json({
      error: 'Failed to delete item',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// POST /api/upload - Upload and process CSV/Excel files (protected)
app.post('/api/upload', writeAuthMiddleware, async (c) => {
  try {
    const formData = await c.req.formData()
    const fileData = formData.get('file')
    
    if (!fileData || typeof fileData === 'string') {
      return c.json({
        error: 'No file provided',
        message: 'Please select a file to upload'
      }, 400)
    }
    
    const file = fileData as File

    // Validate file type
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(csv|xls|xlsx)$/i)) {
      return c.json({
        error: 'Invalid file type',
        message: 'Only CSV and Excel files are allowed'
      }, 400)
    }

    // Generate unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `uploads/${timestamp}-${file.name}`

    // Store file in R2
    await c.env.BUCKET.put(filename, file.stream(), {
      httpMetadata: {
        contentType: file.type,
      },
      customMetadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      }
    })

    // Parse file content based on type
    const content = await file.text()
    const parsedData = parseFileContent(content, file.name)
    
    if (parsedData.length === 0) {
      return c.json({
        error: 'No valid data found',
        message: 'The uploaded file contains no valid data rows'
      }, 400)
    }

    // Bulk insert data into D1 database
    const insertedCount = await bulkInsertItems(c.env.DB, parsedData)

    return c.json({
      message: 'File uploaded and processed successfully',
      filename,
      totalRows: parsedData.length,
      insertedRows: insertedCount,
      url: `/api/files/${encodeURIComponent(filename)}`
    }, 201)

  } catch (error) {
    return c.json({
      error: 'File upload failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, 500)
  }
})

// POST /api/import/sheets - Import data from Google Sheets (protected)
app.post('/api/import/sheets', writeAuthMiddleware, async (c) => {
  try {
    const body = await c.req.json()
    
    // Validate required fields
    if (!body.spreadsheetId || typeof body.spreadsheetId !== 'string') {
      return c.json({
        error: 'Validation failed',
        message: 'spreadsheetId is required and must be a string'
      }, 400)
    }
    
    if (!body.range || typeof body.range !== 'string') {
      return c.json({
        error: 'Validation failed', 
        message: 'range is required and must be a string (e.g., "Sheet1!A1:C10")'
      }, 400)
    }

    // Get Google API key from environment
    const apiKey = c.env.GOOGLE_API_KEY
    if (!apiKey) {
      return c.json({
        error: 'Configuration error',
        message: 'Google Sheets API key not configured'
      }, 500)
    }

    // Construct Google Sheets API URL
    const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(body.spreadsheetId)}/values/${encodeURIComponent(body.range)}?key=${encodeURIComponent(apiKey)}`

    // Fetch data from Google Sheets API
    const response = await fetch(apiUrl)
    
    if (!response.ok) {
      const errorData = await response.text()
      return c.json({
        error: 'Google Sheets API error',
        message: `Failed to fetch data from Google Sheets: ${response.status} ${response.statusText}`,
        details: errorData
      }, response.status === 404 ? 404 : 500)
    }

    const sheetsData = await response.json() as GoogleSheetsResponse
    
    if (!sheetsData.values || !Array.isArray(sheetsData.values)) {
      return c.json({
        error: 'No data found',
        message: 'The specified range contains no data or is invalid'
      }, 400)
    }

    // Parse Google Sheets data
    const parsedData = parseGoogleSheetsData(sheetsData.values)
    
    if (parsedData.length === 0) {
      return c.json({
        error: 'No valid data found',
        message: 'The Google Sheets data contains no valid rows with required fields'
      }, 400)
    }

    // Bulk insert data into D1 database
    const insertedCount = await bulkInsertItems(c.env.DB, parsedData)

    return c.json({
      message: 'Google Sheets data imported successfully',
      spreadsheetId: body.spreadsheetId,
      range: body.range,
      totalRows: parsedData.length,
      insertedRows: insertedCount
    }, 201)

  } catch (error) {
    if (error instanceof SyntaxError) {
      return c.json({
        error: 'Invalid JSON',
        message: 'Request body must be valid JSON'
      }, 400)
    }
    
    return c.json({
      error: 'Import failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, 500)
  }
})


// 404 handler for unknown routes
app.notFound((c) => {
  return c.json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist'
  }, 404)
})

// Global error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err)
  return c.json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred'
  }, 500)
})

export default app
