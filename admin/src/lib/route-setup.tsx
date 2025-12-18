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

  // DEV ONLY: Backdoor login for local development (bypasses Google OAuth)
  app.get('/auth/dev-login', themeMiddleware, async (c) => {
    const url = new URL(c.req.url)

    // SECURITY: Only allow on localhost
    if (!url.hostname.includes('localhost') && !url.hostname.includes('127.0.0.1')) {
      return c.text('Dev login only available on localhost', 403)
    }

    const { createSessionCookie } = await import('@/lib/middleware')
    const { setCookie } = await import('hono/cookie')
    const { createAuthConfig } = await import('@/lib/auth')

    const devAuthConfig = createAuthConfig(c.env)
    const apiUrl = c.env?.API_URL || 'http://localhost:8787'
    const adminToken = c.env?.ADMIN_ACCESS_TOKEN || ''

    console.log('🔓 Dev login: Checking for existing admin user...')

    // Try to find or create a dev admin user
    let devUser = {
      id: 'dev-admin-001',
      name: 'Dev Admin',
      email: 'admin@localhost.dev',
      role: 'admin'
    }

    try {
      // Check if dev admin user exists
      const userResponse = await fetch(
        `${apiUrl}/api/users?filterEmail=${encodeURIComponent(devUser.email)}&exact=true`,
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (userResponse.ok) {
        const userResult = await userResponse.json() as any
        if (userResult.data && userResult.data.length > 0) {
          // Use existing user
          const dbUser = userResult.data[0]
          devUser = {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            role: dbUser.role || 'admin'
          }
          console.log('✅ Dev login: Found existing dev user:', devUser.email)
        } else {
          // Create dev admin user
          console.log('📝 Dev login: Creating dev admin user...')
          const createResponse = await fetch(`${apiUrl}/api/users`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${adminToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: devUser.email,
              name: devUser.name,
              role: 'admin'
            })
          })

          if (createResponse.ok) {
            const newUser = await createResponse.json() as any
            devUser.id = newUser.id
            devUser.role = newUser.role || 'admin'
            console.log('✅ Dev login: Created dev admin user')
          } else {
            // User creation might fail due to email restrictions, that's ok
            // We'll still create the session with mock data
            console.log('⚠️ Dev login: Could not create user in DB, using mock session')
          }
        }
      }
    } catch (error) {
      console.log('⚠️ Dev login: DB check failed, using mock session:', error)
    }

    // Create session cookie
    const sessionCookie = createSessionCookie(devUser)

    setCookie(c, devAuthConfig.session.cookieName, sessionCookie, {
      httpOnly: true,
      secure: false, // Local dev doesn't need secure
      sameSite: 'Lax',
      maxAge: devAuthConfig.session.maxAge,
      path: '/'
    })

    console.log('🎯 Dev login: Session created, redirecting to dashboard...')
    return c.redirect('/dashboard')
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

      // Get request body and handle different content types
      let body = undefined
      let isFormData = false
      let contentType = 'application/json'

      if (method !== 'GET' && method !== 'HEAD') {
        try {
          // Check if this is a multipart/form-data request (file upload)
          const originalContentType = c.req.header('Content-Type') || ''
          isFormData = originalContentType.includes('multipart/form-data')

          if (isFormData) {
            // For FormData, pass the raw body and let browser set Content-Type with boundary
            body = await c.req.arrayBuffer()
            contentType = originalContentType
          } else {
            // For JSON requests, handle as before
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
          }
        } catch {
          // No body or body already consumed
        }
      }

      const headers: Record<string, string> = {
        ...(apiToken && { 'Authorization': `Bearer ${apiToken}` }),
        // Pass OAuth user information to backend for all requests
        ...(user && {
          'X-User-Id': user.id,
          'X-User-Email': user.email || '',
          'X-User-Name': user.name || ''
        }),
        // Forward other important headers
        ...(c.req.header('User-Agent') && { 'User-Agent': c.req.header('User-Agent') }),
      }

      // Only set Content-Type for non-FormData requests
      if (!isFormData) {
        headers['Content-Type'] = contentType
      } else {
        // For FormData, forward the original Content-Type with boundary
        headers['Content-Type'] = contentType
      }

      const response = await fetch(backendUrl, {
        method,
        headers,
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