import { Hono } from 'hono'
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
 * Health check endpoint
 * GET /health
 */
healthRoutes.get('/health', (c) => {
  return c.json({ 
    status: 'healthy',
    message: 'Store CRUD API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'backend-api'
  })
})

export { healthRoutes }