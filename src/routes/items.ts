import { Hono } from 'hono'
import { readAuthMiddleware, writeAuthMiddleware } from '../middleware/auth.js'
import { getPrismaClient } from '../lib/database.js'
import type { Bindings } from '../../types/bindings.js'
import type { UserContext } from '../types/database.js'

/**
 * Items CRUD Routes
 * Handles all operations for store items: Create, Read, Update, Delete
 * All routes are protected with appropriate authentication middleware
 * Now using Prisma ORM with type-safe database operations
 */
const itemsRoutes = new Hono<{ 
  Bindings: Bindings
  Variables: { user: UserContext }
}>()

/**
 * List all items
 * GET /api/items
 */
itemsRoutes.get('/api/items', readAuthMiddleware, async (c) => {
  try {
    const prisma = getPrismaClient(c.env)
    
    const items = await prisma.item.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return c.json({ 
      items,
      count: items.length
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
    const id = c.req.param('id')
    
    if (!id) {
      return c.json({
        error: 'Invalid item ID',
        message: 'Item ID is required'
      }, 400)
    }

    const prisma = getPrismaClient(c.env)
    
    const item = await prisma.item.findUnique({
      where: { id }
    })
    
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

    const prisma = getPrismaClient(c.env)
    
    // Create item using Prisma
    const item = await prisma.item.create({
      data: {
        name: body.name.trim(),
        description: body.description || null,
        data: body.data ? JSON.stringify(body.data) : '{}'
      }
    })

    return c.json({ 
      item,
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
    const id = c.req.param('id')
    
    if (!id) {
      return c.json({
        error: 'Invalid item ID',
        message: 'Item ID is required'
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

    const prisma = getPrismaClient(c.env)

    try {
      // Update item using Prisma (will throw if item doesn't exist)
      const item = await prisma.item.update({
        where: { id },
        data: {
          name: body.name.trim(),
          description: body.description || null,
          data: body.data ? JSON.stringify(body.data) : '{}'
        }
      })

      return c.json({
        item,
        message: 'Item updated successfully'
      })
    } catch (prismaError: any) {
      if (prismaError.code === 'P2025') {
        return c.json({
          error: 'Item not found',
          message: `Item with ID ${id} does not exist`
        }, 404)
      }
      throw prismaError
    }
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
    const id = c.req.param('id')
    
    if (!id) {
      return c.json({
        error: 'Invalid item ID',
        message: 'Item ID is required'
      }, 400)
    }

    const prisma = getPrismaClient(c.env)

    try {
      // Delete item using Prisma (will throw if item doesn't exist)
      const item = await prisma.item.delete({
        where: { id }
      })

      return c.json({
        item,
        message: 'Item deleted successfully'
      })
    } catch (prismaError: any) {
      if (prismaError.code === 'P2025') {
        return c.json({
          error: 'Item not found',
          message: `Item with ID ${id} does not exist`
        }, 404)
      }
      throw prismaError
    }
  } catch (error) {
    return c.json({
      error: 'Failed to delete item',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

export { itemsRoutes }