import { Context, Next } from 'hono'
import { createMiddleware } from 'hono/factory'
import { Env, Variables } from '@/types/hono'
import { getCookie } from 'hono/cookie'
import { authConfig } from './auth'

// Simple session interface
interface UserSession {
  id: string
  name: string
  email: string
  image?: string
  role: string // User role from database
  exp: number // expiration timestamp
}

// Authentication middleware to check if user is logged in
export const authMiddleware = async (c: Context<{ Bindings: Env; Variables: Variables }>, next: Next) => {
  try {
    // Get session cookie
    const sessionCookie = getCookie(c, authConfig.session.cookieName)

    if (!sessionCookie) {
      // No session cookie, redirect to home/login
      return c.redirect('/')
    }

    // Decode session (in production, you'd use JWT or encrypt this)
    let session: UserSession
    try {
      session = JSON.parse(atob(sessionCookie)) as UserSession
    } catch {
      // Invalid session format, redirect to home/login
      return c.redirect('/')
    }

    // Check if session is expired
    if (session.exp < Date.now()) {
      // Session expired, redirect to home/login
      return c.redirect('/')
    }

    // CRITICAL: Validate user exists in database
    // Session cookies can persist even after database resets
    try {
      const apiUrl = c.env?.API_URL || 'http://localhost:8787'
      const adminToken = c.env?.ADMIN_ACCESS_TOKEN || ''

      const userResponse = await fetch(
        `${apiUrl}/api/users?filterEmail=${encodeURIComponent(session.email)}&exact=true`,
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!userResponse.ok) {
        console.error('❌ Auth middleware - failed to verify user in database')
        return c.redirect('/')
      }

      const userResult = await userResponse.json() as any

      // Check if user actually exists in database
      if (!userResult.data || userResult.data.length === 0) {
        console.error('❌ Auth middleware - user not found in database:', session.email)
        return c.redirect('/')
      }

      // User exists - use database role (not cookie role for security)
      const dbUser = userResult.data[0]

      // Add user to context with database-verified role
      c.set('user', {
        id: session.id,
        name: session.name,
        email: session.email,
        image: session.image,
        role: dbUser.role || 'user' // Use database role, not cookie role
      })
    } catch (dbError) {
      console.error('❌ Auth middleware - database validation error:', dbError)
      return c.redirect('/')
    }

    await next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    // On error, redirect to home/login
    return c.redirect('/')
  }
}

// Helper function to create session cookie
export const createSessionCookie = (user: { id: string; name: string; email: string; image?: string; role?: string }): string => {
  const session: UserSession = {
    ...user,
    role: user.role || 'user', // Default to user role if not provided
    exp: Date.now() + (authConfig.session.maxAge * 1000) // Convert to milliseconds
  }
  
  // In production, you should encrypt this or use JWT
  return btoa(JSON.stringify(session))
}

// Helper function to check if user is authenticated (for client-side use)
export const isAuthenticated = (sessionCookie: string | undefined): boolean => {
  if (!sessionCookie) return false
  
  try {
    const session = JSON.parse(atob(sessionCookie)) as UserSession
    return session.exp > Date.now()
  } catch {
    return false
  }
}

// Helper function to get current user from cookie
export const getCurrentUser = (sessionCookie: string | undefined): UserSession | null => {
  if (!sessionCookie) return null
  
  try {
    const session = JSON.parse(atob(sessionCookie)) as UserSession
    return session.exp > Date.now() ? session : null
  } catch {
    return null
  }
}

// Alias for getCurrentUser
export const parseSessionCookie = getCurrentUser

// Theme detection middleware - handles theme for ALL pages
export const themeMiddleware = createMiddleware<{ Bindings: Env; Variables: Variables }>(async (c, next) => {
  // Cookie parser utility
  const getCookieValue = (cookieString: string, name: string): string | null => {
    if (!cookieString) return null
    const cookies = cookieString.split(';').map(cookie => cookie.trim())
    const cookie = cookies.find(cookie => cookie.startsWith(`${name}=`))
    return cookie ? decodeURIComponent(cookie.split('=')[1]) : null
  }

  // Read theme from cookies with better error handling
  const cookieString = c.req.header('cookie') || ''
  const themeFromCookie = getCookieValue(cookieString, 'theme')
  let theme: 'dim' | 'nord' = 'dim' // Default fallback
  
  if (themeFromCookie && (themeFromCookie === 'dim' || themeFromCookie === 'nord')) {
    theme = themeFromCookie
  }

  // Set theme in context for all handlers to use
  c.set('theme', theme)
  
  await next()
})
