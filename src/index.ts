import { Hono } from 'hono'
import type { Bindings } from '@/types/bindings'

// Import middleware
import { corsMiddleware } from '@/middleware/cors'
import { notFoundHandler, globalErrorHandler } from '@/middleware/error'

// Import route groups (decomposed folder structure)
import healthRoutes from '@/routes/health/index.js'
import usersRoutes from '@/routes/users/index.js'
import { auth } from '@/routes/auth'
import tokensRoutes from '@/routes/tokens/index.js'
import allowedEmailsRoutes from '@/routes/allowed-emails/index.js'
import tablesRoutes from '@/routes/tables/index.js'
import tableDataRoutes from '@/routes/table-data/index.js'
import myTablesRoutes from '@/routes/my-tables/index.js'
import salesRoutes from '@/routes/sales/index.js'
import rentalsRoutes from '@/routes/rentals/index.js'
import inventoryRoutes from '@/routes/inventory/index.js'
import importRoutes from '@/routes/import/index.js'
import uploadRoutes from '@/routes/upload/index.js'
import publicRoutes from '@/routes/public/index.js'
import adminRoutes from '@/routes/admin/index.js'
import { generateOpenAPISpec } from '@/openapi/spec.js'

/**
 * Store API - Backend Server
 *
 * Serverless inventory management on Cloudflare's edge.
 * Dynamic tables, sales, rentals, and API access.
 *
 * Stack: Hono + D1 + R2 + KV
 */

// Create Hono app with bindings
const app = new Hono<{ Bindings: Bindings }>()

// =============================================================================
// MIDDLEWARE REGISTRATION
// =============================================================================

// Apply CORS middleware to all routes
app.use('*', corsMiddleware)

// =============================================================================
// HEALTH CHECK
// =============================================================================

// Health check routes (from decomposed folder)
app.route('/', healthRoutes)

// Serve OpenAPI specification
app.get('/api/openapi.json', (c) => {
  const baseUrl = new URL(c.req.url).origin
  const version = c.env.APP_VERSION || '1.0.0'
  return c.json(generateOpenAPISpec(baseUrl, version))
})

// =============================================================================
// API ROUTES
// =============================================================================

// Users and authentication
app.route('/api/users', usersRoutes)
app.route('/api/auth', auth)

// Tokens and allowed emails
app.route('/api/tokens', tokensRoutes)
app.route('/api/allowed-emails', allowedEmailsRoutes)

// Dynamic tables management
app.route('/api/tables', tablesRoutes)
app.route('/api/tables', tableDataRoutes)  // Mounted at /api/tables/:tableId/data/*
app.route('/api/my-tables', myTablesRoutes)

// Sales, rentals, and inventory
app.route('/api/sales', salesRoutes)
app.route('/api/rentals', rentalsRoutes)
app.route('/api/inventory', inventoryRoutes)

// Import and upload
app.route('/api/import', importRoutes)
app.route('/api/upload', uploadRoutes)

// Public API (unified sales and rentals)
app.route('/api/public', publicRoutes)

// Admin operations
app.route('/api/admin', adminRoutes)

// =============================================================================
// ERROR HANDLING
// =============================================================================

// 404 handler for unknown routes
app.notFound(notFoundHandler)

// Global error handler for uncaught exceptions
app.onError(globalErrorHandler)

// =============================================================================
// EXPORT APPLICATION
// =============================================================================

export default app
