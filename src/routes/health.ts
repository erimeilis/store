import { Hono } from 'hono'
import { getPrismaClient, checkDatabaseHealth } from '@/lib/database.js'
import type { Bindings } from '../../types/bindings.js'

/**
 * Health Check Routes
 * Provides service status, version information, and basic connectivity tests
 */
const healthRoutes = new Hono<{ Bindings: Bindings }>()

/**
 * Root endpoint - redirects to health check
 * GET /
 */
healthRoutes.get('/', (c) => {
  return c.json({ 
    status: 'healthy',
    message: 'Store CRUD API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'backend-api'
  })
})

/**
 * Health check endpoint with database connectivity test
 * GET /health
 */
healthRoutes.get('/health', async (c) => {
  const timestamp = new Date().toISOString()
  
  try {
    const prisma = getPrismaClient(c.env)
    const dbHealthy = await checkDatabaseHealth(prisma)
    
    if (dbHealthy) {
      return c.json({ 
        status: 'healthy',
        message: 'Store CRUD API is running',
        timestamp,
        version: '1.0.0',
        service: 'backend-api',
        database: {
          status: 'connected',
          type: 'Prisma + D1/SQLite'
        }
      })
    } else {
      return c.json({ 
        status: 'unhealthy',
        message: 'Database connection failed',
        timestamp,
        version: '1.0.0',
        service: 'backend-api',
        database: {
          status: 'disconnected',
          type: 'Prisma + D1/SQLite'
        }
      }, 503)
    }
  } catch (error) {
    return c.json({ 
      status: 'unhealthy',
      message: 'Health check failed',
      timestamp,
      version: '1.0.0',
      service: 'backend-api',
      database: {
        status: 'error',
        type: 'Prisma + D1/SQLite',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }, 503)
  }
})

export { healthRoutes }