import { Hono } from 'hono'
import { writeAuthMiddleware } from '@/middleware/auth.js'
import { parseFileContent } from '@/utils/file-parser.js'
import { bulkInsertItems } from '@/utils/database.js'
import type { Bindings } from '@/types/bindings.js'

/**
 * File Upload Routes
 * Handles CSV/Excel file uploads with processing and bulk data insertion
 * Includes R2 storage integration and data validation
 */
const uploadRoutes = new Hono<{ Bindings: Bindings }>()

/**
 * Upload and process CSV/Excel files
 * POST /api/upload
 */
uploadRoutes.post('/api/upload', writeAuthMiddleware, async (c) => {
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
    const allowedTypes = [
      'text/csv', 
      'application/vnd.ms-excel', 
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
    
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(csv|xls|xlsx)$/i)) {
      return c.json({
        error: 'Invalid file type',
        message: 'Only CSV and Excel files are allowed'
      }, 400)
    }

    // Generate unique filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `uploads/${timestamp}-${file.name}`

    // Store file in R2 bucket
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

export { uploadRoutes }