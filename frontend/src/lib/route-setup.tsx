/**
 * Route Setup
 * Centralized route registration system for Hono app
 */

import type { Hono } from 'hono'
import { routes } from '@/config/routes'
import { createAuthMiddleware } from '@/middleware/auth'
import { themeMiddleware } from './middleware.js'
import type { Env, Variables } from '@/types/hono'

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
    const { handleOAuthCallback } = await import('@/handlers/auth')
    return handleOAuthCallback(c)
  })

  // Logout route (with theme middleware)
  app.get('/auth/logout', themeMiddleware, async (c) => {
    const { handleLogout } = await import('@/handlers/auth')
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
      // Get user information from session context if available
      const user = c.get('user')

      // Get query parameters from the original request
      const url = new URL(c.req.url)
      const queryParams = url.search // This includes the '?' if there are parameters

      // Debug log the user context and query parameters
      console.log('🔍 API Proxy Debug:', {
        path,
        queryParams,
        fullUrl: c.req.url,
        hasUser: !!user,
        userEmail: user?.email || 'none',
        userName: user?.name || 'none',
        userId: user?.id || 'none'
      })

      // Forward the request to backend with query parameters
      const backendUrl = `${apiUrl}${path}${queryParams}`
      console.log('🚀 Forwarding request to backend:', backendUrl)

      // Get request body if it exists and modify it for table creation
      let body = undefined
      if (method !== 'GET' && method !== 'HEAD') {
        try {
          const originalBody = await c.req.text()

          // For table creation, inject user_id into the request body
          if (path === '/api/tables' && method === 'POST' && user) {
            const requestData = JSON.parse(originalBody)
            requestData.user_id = user.id // Add session user ID
            body = JSON.stringify(requestData)
            console.log('🔧 Modified table creation request with user_id:', user.id)
          } else {
            body = originalBody
          }
        } catch {
          // No body or body already consumed
        }
      }

      const response = await fetch(backendUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(apiToken && { 'Authorization': `Bearer ${apiToken}` }),
          // Pass OAuth user information to backend for all requests
          ...(user && {
            'X-User-Id': user.id,
            'X-User-Email': user.email || '',
            'X-User-Name': user.name || ''
          }),
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
  
  // Handle table creation with session user
  app.post('/api/tables/create', themeMiddleware, createAuthMiddleware(), async (c) => {
    const user = c.get('user')
    
    try {
      const formData = await c.req.formData()
      const tableDataString = formData.get('tableData') as string
      const tableData = JSON.parse(tableDataString)
      
      // Add user_id from session
      const requestData = {
        ...tableData,
        user_id: user.id  // Use session user ID
      }
      
      // Forward to backend API
      const apiUrl = getApiUrl(c)
      const apiToken = getApiToken(c)
      
      const response = await fetch(`${apiUrl}/api/tables`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiToken}`,
          // Pass OAuth user information for table creation
          'X-User-Id': user.id,
          'X-User-Email': user.email || '',
          'X-User-Name': user.name || ''
        },
        body: JSON.stringify(requestData)
      })
      
      const responseBody = await response.text()
      
      // If successful, modify response to include tableId for frontend redirect
      if (response.ok) {
        const data = JSON.parse(responseBody)
        const modifiedData = {
          ...data,
          tableId: data.table?.table?.id || data.table?.id  // Add tableId for frontend compatibility
        }
        
        return new Response(JSON.stringify(modifiedData), {
          status: response.status,
          headers: {
            'Content-Type': 'application/json'
          }
        })
      }
      
      return new Response(responseBody, {
        status: response.status,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    } catch (error) {
      console.error('Table creation error:', error)
      return c.json({ error: 'Failed to create table' }, 500)
    }
  })

  apiMethods.forEach(method => {
    app.on(method, '/api/*', themeMiddleware, createAuthMiddleware(), apiProxyHandler)
  })
}