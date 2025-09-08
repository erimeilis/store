import { Hono } from 'hono'
import type { Bindings } from '../types/bindings.js'

// Import middleware
import { corsMiddleware } from './middleware/cors.js'
import { notFoundHandler, globalErrorHandler } from './middleware/error.js'

// Import route groups
import { healthRoutes } from './routes/health.js'
import { itemsRoutes } from './routes/items.js'
import { uploadRoutes } from './routes/upload.js'
import { importRoutes } from './routes/import.js'
import usersRoutes from './routes/users.js'
import { auth } from './routes/auth.js'
import tokensRoutes from './routes/tokens.js'
import allowedEmailsRoutes from './routes/allowed-emails.js'

/**
 * Store CRUD API - Backend Server
 * 
 * A clean, modular Hono application with organized route groups and middleware.
 * Provides CRUD operations for store items with authentication, file upload,
 * and Google Sheets import capabilities.
 * 
 * Architecture:
 * - Middleware: CORS, Authentication, Error handling
 * - Routes: Health, Items CRUD, Upload, Import, Users Management, Tokens, Allowed Emails
 * - Storage: Cloudflare D1 (SQLite), R2 (File storage)
 * - Authentication: Bearer token with D1 database + env fallback
 */

// Create Hono app with bindings
const app = new Hono<{ Bindings: Bindings }>()

// =============================================================================
// MIDDLEWARE REGISTRATION
// =============================================================================

// Apply CORS middleware to all routes
app.use('*', corsMiddleware)

// =============================================================================
// ROUTE GROUPS REGISTRATION
// =============================================================================

// Health check and service status routes
app.route('/', healthRoutes)

// Items CRUD operations (protected with auth middleware)
app.route('/', itemsRoutes)

// File upload and processing (protected with auth middleware)
app.route('/', uploadRoutes)

// Data import from external sources (protected with auth middleware)
app.route('/', importRoutes)

// Users management operations (protected with auth middleware)
app.route('/api/users', usersRoutes)
// Authentication operations (user registration after OAuth)
app.route('/api/auth', auth)

// Tokens management operations (protected with auth middleware)
app.route('/api/tokens', tokensRoutes)
// Allowed emails management operations (protected with auth middleware)
app.route('/api/allowed-emails', allowedEmailsRoutes)

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
