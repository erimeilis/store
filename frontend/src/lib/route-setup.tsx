/**
 * Route Setup
 * Centralized route registration system for Hono app
 */

import type { Hono } from 'hono'
import { routes } from '../config/routes.js'
import { createAuthMiddleware } from '../middleware/auth.js'
import { themeMiddleware } from './middleware.js'

/**
 * Register all routes with the Hono app
 */
export function registerRoutes(app: Hono) {
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
export function registerCatchAllRoute(app: Hono) {
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
export function registerAuthRoutes(app: Hono) {
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