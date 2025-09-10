/**
 * Admin-Only Access Middleware
 * Ensures only users with admin role can access protected endpoints
 */

import type { Context, Next } from 'hono'
import type { Bindings } from '../../types/bindings.js'
import type { HonoVariables } from '../types/hono.js'
import { getPrismaClient } from '../lib/database.js'

/**
 * Middleware to ensure only admin users can access the endpoint
 */
export const adminOnlyMiddleware = async (c: Context<{ Bindings: Bindings; Variables: HonoVariables }>, next: Next) => {
  try {
    // Get the authorization header
    const authHeader = c.req.header('Authorization')
    console.log('🔍 Admin middleware - Auth header:', authHeader ? `${authHeader.substring(0, 20)}...` : 'MISSING')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Admin middleware - No valid Bearer token')
      return c.json({ error: 'Admin access required - missing or invalid token' }, 401)
    }

    const token = authHeader.split(' ')[1]
    if (!token) {
      console.log('❌ Admin middleware - Token extraction failed')
      return c.json({ error: 'Admin access required - missing token' }, 401)
    }

    // Check if token is the admin access token from environment
    const adminAccessToken = c.env?.ADMIN_ACCESS_TOKEN
    console.log('🔍 Admin middleware - Token comparison:', {
      providedToken: `${token.substring(0, 10)}...`,
      adminToken: adminAccessToken ? `${adminAccessToken.substring(0, 10)}...` : 'MISSING',
      matches: adminAccessToken && token === adminAccessToken
    })
    
    if (adminAccessToken && token === adminAccessToken) {
      // Admin access token from environment - allow access
      console.log('✅ Admin middleware - Admin token accepted')
      c.set('tokenType', 'admin')
      c.set('tokenData', { name: 'Admin Access Token', permissions: 'full' })
      return next()
    }

    const database = getPrismaClient(c.env)

    // Check if token exists in tokens table (API tokens)
    const apiToken = await database.token.findUnique({
      where: { token },
      select: { 
        id: true, 
        permissions: true,
        name: true 
      }
    })

    if (apiToken) {
      // Check if token has admin permissions - handle different permission formats
      const hasAdminAccess = apiToken.permissions === 'full' || 
                           (typeof apiToken.permissions === 'string' && apiToken.permissions.includes('admin'))
      
      console.log('🔍 Admin middleware - Permission check:', {
        permissions: apiToken.permissions,
        hasAdminAccess,
        tokenName: apiToken.name
      })
      
      if (!hasAdminAccess) {
        return c.json({ 
          error: 'Admin access required - insufficient permissions',
          details: `Token "${apiToken.name}" does not have admin permissions. Required: 'full' or permissions containing 'admin'`
        }, 403)
      }
      // API token with admin permissions - allow access
      c.set('tokenType', 'api')
      c.set('tokenData', apiToken)
      return next()
    }

    // Check if it's a user session token (for user-based admin access)
    // This would require session token validation - for now, we'll focus on API tokens
    // Future enhancement: Add user session admin validation here

    return c.json({ 
      error: 'Admin access required - invalid token',
      details: 'Token not found or not authorized for admin operations'
    }, 401)

  } catch (error) {
    console.error('Admin middleware error:', error)
    return c.json({ 
      error: 'Admin access validation failed',
      details: 'Internal error during admin authorization check'
    }, 500)
  }
}

/**
 * Enhanced admin middleware that also validates user role for user-based operations
 */
export const adminOrOwnerMiddleware = async (c: Context<{ Bindings: Bindings; Variables: HonoVariables }>, next: Next) => {
  try {
    const authHeader = c.req.header('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Authentication required' }, 401)
    }

    const token = authHeader.split(' ')[1]
    if (!token) {
      return c.json({ error: 'Authentication required - missing token' }, 401)
    }

    // Check if token is the admin access token from environment
    const adminAccessToken = c.env?.ADMIN_ACCESS_TOKEN
    if (adminAccessToken && token === adminAccessToken) {
      // Admin access token from environment = admin access
      c.set('userRole', 'admin')
      c.set('tokenType', 'admin')
      c.set('tokenData', { name: 'Admin Access Token', permissions: 'full' })
      return next()
    }

    const database = getPrismaClient(c.env)

    // Check API token from database
    const apiToken = await database.token.findUnique({
      where: { token },
      select: { 
        id: true, 
        permissions: true,
        name: true 
      }
    })

    if (apiToken) {
      // Check if token has admin permissions - handle different permission formats
      const hasAdminAccess = apiToken.permissions === 'full' || 
                           (typeof apiToken.permissions === 'string' && apiToken.permissions.includes('admin'))
      
      if (hasAdminAccess) {
        // Full API permissions = admin access
        c.set('userRole', 'admin')
        c.set('tokenType', 'api')
        c.set('tokenData', apiToken)
        return next()
      } else {
        // Read-only API token - limited access
        c.set('userRole', 'user') 
        c.set('tokenType', 'api')
        c.set('tokenData', apiToken)
        return next()
      }
    }

    // If not an API token, could be user session token
    // For now, deny access - future enhancement: add user session validation
    return c.json({ 
      error: 'Invalid authentication token',
      details: 'Token not recognized as valid API or session token'
    }, 401)

  } catch (error) {
    console.error('Admin/Owner middleware error:', error)
    return c.json({ 
      error: 'Authentication validation failed',
      details: 'Internal error during authorization check'
    }, 500)
  }
}