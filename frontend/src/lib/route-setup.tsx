/**
 * Route Setup
 * Centralized route registration system for Hono app
 */

import type { Hono } from 'hono'
import { routes } from '../config/routes.js'
import { createAuthMiddleware } from '../middleware/auth.js'
import { themeMiddleware } from './middleware.js'
import type { Env, Variables } from '../types/hono.js'

/**
 * Register all routes with the Hono app
 */
export function registerRoutes(app: Hono<{ Bindings: Env; Variables: Variables }>) {
  for (const route of routes) {
    // Apply theme middleware to ALL routes first
    if (route.requiresAuth) {
      app.get(route.path, themeMiddleware, createAuthMiddleware(), route.handler)
    } else {
      app.get(route.path, themeMiddleware, route.handler)
    }
  }
}

/**
 * Register catch-all 404 route (MUST BE CALLED LAST after all other routes)
 */
export function registerCatchAllRoute(app: Hono<{ Bindings: Env; Variables: Variables }>) {
  // Add catch-all 404 route (must be last)
  app.get('*', themeMiddleware, async (c) => {
    console.log('🔴 404 Route: Handling request for', c.req.path, {
      method: c.req.method,
      url: c.req.url,
      headers: {
        'user-agent': c.req.header('User-Agent')?.substring(0, 50),
        'referer': c.req.header('Referer')
      }
    });
    
    // Create a new URL with error query params
    const errorUrl = new URL('/error', c.req.url)
    errorUrl.searchParams.set('code', '404')
    errorUrl.searchParams.set('message', `The page "${c.req.path}" was not found or has been moved to another location.`)
    
    console.log('🔄 Redirecting to:', errorUrl.toString())
    return c.redirect(errorUrl.toString())
  })
}

/**
 * Register OAuth callback routes (static routes that don't follow the pattern)
 */
export function registerAuthRoutes(app: Hono<{ Bindings: Env; Variables: Variables }>) {
  // OAuth callback route - Google OAuth (with theme middleware)
  app.get('/auth/callback/google', themeMiddleware, async (c) => {
    const { handleOAuthCallback } = await import('../handlers/auth.js')
    return handleOAuthCallback(c)
  })

  // Logout route (with theme middleware)
  app.get('/auth/logout', themeMiddleware, async (c) => {
    const { handleLogout } = await import('../handlers/auth.js')
    return handleLogout(c)
  })
}

/**
 * Register API proxy routes to forward requests to backend
 */
export function registerApiProxyRoutes(app: Hono<{ Bindings: Env; Variables: Variables }>) {
  // Get API URL from environment
  const getApiUrl = (c: any) => {
    return c.env?.API_URL || 'http://localhost:8787'
  }

  // Get admin token for API authentication
  const getApiToken = (c: any) => {
    return c.env?.ADMIN_ACCESS_TOKEN
  }

  // Generic API proxy handler
  const apiProxyHandler = async (c: any) => {
    const apiUrl = getApiUrl(c)
    const apiToken = getApiToken(c)
    const path = c.req.path
    const method = c.req.method
    
    try {
      // Forward the request to backend
      const backendUrl = `${apiUrl}${path}`
      
      // Get request body if it exists
      let body = undefined
      if (method !== 'GET' && method !== 'HEAD') {
        try {
          body = await c.req.text()
        } catch {
          // No body or body already consumed
        }
      }

      const response = await fetch(backendUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(apiToken && { 'Authorization': `Bearer ${apiToken}` }),
          // Forward other important headers
          ...(c.req.header('User-Agent') && { 'User-Agent': c.req.header('User-Agent') }),
        },
        ...(body && { body }),
      })

      // Forward the response
      const responseBody = await response.text()
      
      return new Response(responseBody, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'application/json',
          // Forward CORS headers if present
          ...(response.headers.get('Access-Control-Allow-Origin') && {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin')!
          }),
        },
      })
    } catch (error) {
      console.error('API proxy error:', error)
      return c.json({ error: 'API proxy error' }, 500)
    }
  }

  // Register API routes with all HTTP methods
  const apiMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const
  
  apiMethods.forEach(method => {
    app.on(method, '/api/*', apiProxyHandler)
  })
}