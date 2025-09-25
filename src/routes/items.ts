import { Hono } from 'hono'
import { readAuthMiddleware, writeAuthMiddleware } from '@/middleware/auth.js'
import { getPrismaClient } from '@/lib/database.js'
import type { Bindings } from '@/types/bindings.js'
import type { UserContext } from '@/types/database.js'

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
 * List all items with pagination
 * GET /api/items
 */
itemsRoutes.get('/api/items', readAuthMiddleware, async (c) => {
  try {
    const prisma = getPrismaClient(c.env)
    
    // Extract pagination parameters
    const page = parseInt(c.req.query('page') || '1', 10)
    const limit = parseInt(c.req.query('limit') || '10', 10)
    const sort = c.req.query('sort') || 'updatedAt'
    const direction = c.req.query('direction') || 'desc'
    
    // Extract filter parameters
    const filterName = c.req.query('filter_name') || ''
    const filterDescription = c.req.query('filter_description') || ''
    const filterPrice = c.req.query('filter_price') || ''
    const filterQuantity = c.req.query('filter_quantity') || ''
    const filterCategory = c.req.query('filter_category') || ''
    const filterUpdated = c.req.query('filter_updatedAt') || ''
    
    // Debug: Log all filter parameters
    console.log('🔍 Items API Debug - Filter parameters:', {
      filterName,
      filterDescription,
      filterPrice,
      filterQuantity,
      filterCategory,
      filterUpdated,
      query: c.req.url
    })
    
    // Calculate offset
    const offset = (page - 1) * limit
    
    // Build WHERE conditions for filtering
    const where: any = {}
    
    // Text filters (SQLite/D1 compatible)
    if (filterName) {
      where.name = {
        contains: filterName
      }
    }
    
    if (filterDescription) {
      where.description = {
        contains: filterDescription
      }
    }
    
    // JSON field filters using simple string contains (works better with SQLite)
    if (filterCategory) {
      where.data = {
        contains: `"category":"${filterCategory}"`
      }
    }
    
    if (filterPrice) {
      // Handle price filtering - search for the price value in JSON
      const priceValue = parseFloat(filterPrice)
      if (!isNaN(priceValue)) {
        const priceCondition = { data: { contains: `"price":${priceValue}` } }
        
        if (where.data) {
          // Combine with existing data filter using AND
          where.AND = [{ data: where.data }, priceCondition]
          delete where.data
        } else {
          where.data = priceCondition.data
        }
      }
    }
    
    if (filterQuantity) {
      // Handle quantity filtering - search for the quantity value in JSON
      const quantityValue = parseInt(filterQuantity)
      if (!isNaN(quantityValue)) {
        const quantityCondition = { data: { contains: `"quantity":${quantityValue}` } }
        
        if (where.AND) {
          where.AND.push(quantityCondition)
        } else if (where.data) {
          where.AND = [{ data: where.data }, quantityCondition]
          delete where.data
        } else {
          where.data = quantityCondition.data
        }
      }
    }
    
    // Date filter for updatedAt
    if (filterUpdated) {
      where.updatedAt = {
        gte: new Date(filterUpdated + 'T00:00:00.000Z'),
        lt: new Date(filterUpdated + 'T23:59:59.999Z')
      }
    }
    
    console.log('🔍 Items API Debug - Where conditions:', JSON.stringify(where, null, 2))
    
    // Determine sort field and direction
    const orderBy: any = {}
    if (sort === 'updatedAt') {
      orderBy.updatedAt = direction === 'asc' ? 'asc' : 'desc'
    } else if (sort === 'createdAt') {
      orderBy.createdAt = direction === 'asc' ? 'asc' : 'desc'
    } else if (sort === 'name') {
      orderBy.name = direction === 'asc' ? 'asc' : 'desc'
    } else {
      orderBy.updatedAt = 'desc'
    }
    
    // Get total count for pagination metadata with same filters
    const totalCount = await prisma.item.count({ where })
    
    // Get paginated items with filtering
    const items = await prisma.item.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy
    })
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit)
    
    return c.json({ 
      items,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
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
 * Partially update item (inline editing)
 * PATCH /api/items/:id
 */
itemsRoutes.patch('/api/items/:id', writeAuthMiddleware, async (c) => {
  try {
    const id = c.req.param('id')

    if (!id) {
      return c.json({
        error: 'Invalid item ID',
        message: 'Item ID is required'
      }, 400)
    }

    const body = await c.req.json()

    // For PATCH, we allow partial updates - no required fields
    if (Object.keys(body).length === 0) {
      return c.json({
        error: 'Validation failed',
        message: 'At least one field must be provided for update'
      }, 400)
    }

    const prisma = getPrismaClient(c.env)

    try {
      // First, get the current item to merge data
      const currentItem = await prisma.item.findUnique({
        where: { id }
      })

      if (!currentItem) {
        return c.json({
          error: 'Item not found',
          message: `Item with ID ${id} does not exist`
        }, 404)
      }

      // Parse current data
      let currentData: any = {}
      try {
        currentData = JSON.parse(currentItem.data || '{}')
      } catch {
        currentData = {}
      }

      // Prepare update data
      const updateData: any = {}

      // Handle direct field updates
      if (body.name !== undefined) {
        if (typeof body.name !== 'string' || body.name.trim() === '') {
          return c.json({
            error: 'Validation failed',
            message: 'Name must be a non-empty string'
          }, 400)
        }
        updateData.name = body.name.trim()
      }

      if (body.description !== undefined) {
        updateData.description = body.description || null
      }

      // Handle JSON data field updates (for price, quantity, category)
      if (body.price !== undefined || body.quantity !== undefined || body.category !== undefined) {
        const newData = { ...currentData }

        if (body.price !== undefined) {
          const price = parseFloat(body.price)
          if (isNaN(price)) {
            return c.json({
              error: 'Validation failed',
              message: 'Price must be a valid number'
            }, 400)
          }
          newData.price = price
        }

        if (body.quantity !== undefined) {
          const quantity = parseInt(body.quantity)
          if (isNaN(quantity) || quantity < 0) {
            return c.json({
              error: 'Validation failed',
              message: 'Quantity must be a non-negative integer'
            }, 400)
          }
          newData.quantity = quantity
        }

        if (body.category !== undefined) {
          newData.category = body.category || ''
        }

        updateData.data = JSON.stringify(newData)
      }

      // Update item using Prisma
      const item = await prisma.item.update({
        where: { id },
        data: updateData
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