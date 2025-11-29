import type { Context, Next } from 'hono'
import type { Bindings } from '@/types/bindings.js'
import { getPrismaClient } from '@/lib/database.js'
import { validateToken, hasPermission } from '@/lib/token-service.js'
import type { UserContext, TokenPermissions } from '@/types/database.js'

// Define context variables type
type Variables = {
  user: UserContext
}

/**
 * Bearer Token Authentication Middleware Factory
 * Creates middleware that validates bearer tokens using Prisma with IP/domain whitelist support
 *
 * @param requiredPermission - The permission level required
 * @param requireAdmin - If true, requires isAdmin=true (for non-public routes)
 * @returns Hono middleware function
 */
export const createBearerAuthMiddleware = (requiredPermission: TokenPermissions, requireAdmin: boolean = false) => {
  return async (c: Context<{ Bindings: Bindings; Variables: Variables }>, next: Next) => {
    const authHeader = c.req.header('Authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized', message: 'Bearer token required' }, 401)
    }

    const tokenString = authHeader.replace('Bearer ', '')

    try {
      // Get Prisma client
      const prisma = getPrismaClient(c.env)

      // Validate token with IP/domain whitelist checks
      const validation = await validateToken(prisma, tokenString, c.req.raw)

      if (!validation.valid || !validation.user) {
        return c.json({
          error: 'Unauthorized',
          message: validation.error || 'Invalid token'
        }, 401)
      }

      // Check if admin access is required (non-public routes)
      if (requireAdmin && !validation.user.isAdmin) {
        return c.json({
          error: 'Forbidden',
          message: 'This endpoint requires admin token access. Regular API tokens can only access /api/public/* routes.'
        }, 403)
      }

      // Check if user has required permission
      if (!hasPermission(validation.user.permissions, requiredPermission)) {
        return c.json({
          error: 'Forbidden',
          message: `Insufficient permissions. Required: ${requiredPermission}`
        }, 403)
      }

      // Set user context for downstream handlers
      c.set('user', validation.user)

      return next()
    } catch (error) {
      console.error('Token validation error:', error)
      return c.json({
        error: 'Internal Server Error',
        message: 'Token validation failed'
      }, 500)
    }
  }
}

/**
 * Pre-configured middleware for PUBLIC routes (/api/public/*)
 * These endpoints can be accessed by ANY valid token (admin or regular)
 */
export const readAuthMiddleware = createBearerAuthMiddleware('read', false)
export const writeAuthMiddleware = createBearerAuthMiddleware('write', false)

/**
 * Pre-configured middleware for NON-PUBLIC routes
 * These endpoints require admin tokens (isAdmin=true) - typically frontend/admin tokens
 * Regular API tokens issued from admin panel cannot access these routes
 */
export const adminReadAuthMiddleware = createBearerAuthMiddleware('read', true)
export const adminWriteAuthMiddleware = createBearerAuthMiddleware('write', true)
export const adminDeleteAuthMiddleware = createBearerAuthMiddleware('delete', true)