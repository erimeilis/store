/**
 * Authentication Middleware
 * Centralized auth logic for protected routes
 */

import type { Context } from 'hono'
import { createMiddleware } from 'hono/factory'

/**
 * Create authentication middleware
 */
export function createAuthMiddleware() {
  return createMiddleware(async (c: Context, next) => {
    // Import auth config when needed (lazy loading)
    const { createAuthConfig } = await import('@/lib/auth')
    const authConfig = createAuthConfig(c.env)
    
    // Check if user is authenticated via session cookie
    const { getCookie } = await import('hono/cookie')
    const { parseSessionCookie } = await import('@/lib/middleware')
    
    const sessionCookie = getCookie(c, authConfig.session.cookieName)
    console.log('🔒 Auth middleware check:', {
      path: c.req.path,
      cookieName: authConfig.session.cookieName,
      hasCookie: !!sessionCookie,
      cookiePreview: sessionCookie ? sessionCookie.substring(0, 20) + '...' : 'none',
      userAgent: c.req.header('User-Agent')?.substring(0, 50)
    })
    
    if (!sessionCookie) {
      console.log('❌ No session cookie, redirecting to /')
      return c.redirect('/')
    }

    // Verify session is valid
    let user
    try {
      user = parseSessionCookie(sessionCookie)
      console.log('✅ Session parsed:', { userId: user?.id, userEmail: user?.email })
    } catch (error) {
      console.log('❌ Session parse error:', error)
      return c.redirect('/')
    }

    if (!user) {
      console.log('❌ No user found in session')
      return c.redirect('/')
    }

    // Store user in context for use in handlers
    c.set('user', user)
    await next()
  })
}