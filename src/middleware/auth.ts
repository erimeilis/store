import type { Context, Next } from 'hono'
import type { Bindings } from '../../types/bindings.js'

// Define context variables type
type Variables = {
  user: UserContext
}

/**
 * User Context Interface
 * Represents the authenticated user information
 */
export interface UserContext {
  id: string
  permissions: string[]
  tokenId?: string | number
}

/**
 * Bearer Token Authentication Middleware Factory
 * Creates middleware that validates bearer tokens against D1 database
 * with fallback to environment variables for backward compatibility
 * 
 * @param requiredPermission - The permission level required ('read' | 'write')
 * @returns Hono middleware function
 */
export const createBearerAuthMiddleware = (requiredPermission: 'read' | 'write') => {
  return async (c: Context<{ Bindings: Bindings; Variables: Variables }>, next: Next) => {
    const authHeader = c.req.header('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized', message: 'Bearer token required' }, 401)
    }
    
    const token = authHeader.replace('Bearer ', '')
    
    try {
      // Query D1 database for token
      const tokenResult = await c.env.DB.prepare(
        'SELECT * FROM tokens WHERE token = ? AND (expires_at IS NULL OR expires_at > datetime("now"))'
      ).bind(token).first()
      
      if (!tokenResult) {
        // Fallback to environment variables for backward compatibility
        const fullAccessToken = c.env?.FULL_ACCESS_TOKEN || 'dev-full-access-token'
        const readOnlyToken = c.env?.READ_ONLY_TOKEN || 'dev-read-only-token'
        
        let hasPermission = false
        let userContext: UserContext = { id: 'anonymous', permissions: [] }
        
        if (token === fullAccessToken) {
          hasPermission = true
          userContext = { id: 'full-access-user', permissions: ['read', 'write'] }
        } else if (token === readOnlyToken) {
          hasPermission = requiredPermission === 'read'
          userContext = { id: 'read-only-user', permissions: ['read'] }
        }
        
        if (!hasPermission) {
          return c.json({ 
            error: 'Unauthorized', 
            message: 'Invalid or expired token' 
          }, 401)
        }
        
        c.set('user', userContext)
        return next()
      }
      
      // Check permissions from D1 token
      let hasPermission = false
      let userContext: UserContext = { 
        id: String(tokenResult.owner || 'unknown'), 
        permissions: [],
        tokenId: tokenResult.id as string | number
      }
      
      if (String(tokenResult.type) === 'full') {
        hasPermission = true
        userContext.permissions = ['read', 'write']
      } else if (String(tokenResult.type) === 'read') {
        hasPermission = requiredPermission === 'read'
        userContext.permissions = ['read']
      }
      
      if (!hasPermission) {
        return c.json({ 
          error: 'Forbidden', 
          message: `Insufficient permissions. Required: ${requiredPermission}` 
        }, 403)
      }
      
      // Set user context for downstream handlers
      c.set('user', userContext)
      
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
 * Pre-configured middleware instances for common use cases
 */
export const readAuthMiddleware = createBearerAuthMiddleware('read')
export const writeAuthMiddleware = createBearerAuthMiddleware('write')