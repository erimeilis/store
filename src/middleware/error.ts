import type { Context, ErrorHandler, NotFoundHandler } from 'hono'
import type { Bindings } from '../../types/bindings.js'

/**
 * 404 Not Found Handler
 * Returns standardized JSON response for unknown endpoints
 */
export const notFoundHandler: NotFoundHandler = (c: Context<{ Bindings: Bindings }>) => {
  return c.json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist'
  }, 404)
}

/**
 * Global Error Handler
 * Catches unhandled errors and returns standardized JSON response
 * Logs error details for debugging while hiding sensitive information from client
 */
export const globalErrorHandler: ErrorHandler = (err: Error, c: Context<{ Bindings: Bindings }>) => {
  console.error('Unhandled error:', err)
  return c.json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred'
  }, 500)
}