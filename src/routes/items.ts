import { Hono } from 'hono'
import { readAuthMiddleware, writeAuthMiddleware } from '../middleware/auth.js'
import type { Bindings } from '../../types/bindings.js'

/**
 * Items CRUD Routes
 * Handles all operations for store items: Create, Read, Update, Delete
 * All routes are protected with appropriate authentication middleware
 */
const itemsRoutes = new Hono<{ Bindings: Bindings }>()

/**
 * List all items
 * GET /api/items
 */
itemsRoutes.get('/api/items', readAuthMiddleware, async (c) => {
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

/**
 * Get specific item by ID
 * GET /api/items/:id
 */
itemsRoutes.get('/api/items/:id', readAuthMiddleware, async (c) => {
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

/**
 * Create new item
 * POST /api/items
 */
itemsRoutes.post('/api/items', writeAuthMiddleware, async (c) => {
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

/**
 * Update existing item
 * PUT /api/items/:id
 */
itemsRoutes.put('/api/items/:id', writeAuthMiddleware, async (c) => {
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

/**
 * Delete item
 * DELETE /api/items/:id
 */
itemsRoutes.delete('/api/items/:id', writeAuthMiddleware, async (c) => {
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

export { itemsRoutes }