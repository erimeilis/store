import { Context, Next } from 'hono'
import { Env, Variables } from '../types/hono'
import { getCookie } from 'hono/cookie'
import { authConfig } from './auth'

// Simple session interface
interface UserSession {
  id: string
  name: string
  email: string
  image?: string
  exp: number // expiration timestamp
}

// Authentication middleware to check if user is logged in
export const authMiddleware = async (c: Context<{ Bindings: Env; Variables: Variables }>, next: Next) => {
  try {
    // Get session cookie
    const sessionCookie = getCookie(c, authConfig.session.cookieName)
    
    if (!sessionCookie) {
      // No session cookie, redirect to login
      return c.redirect('/login')
    }

    // Decode session (in production, you'd use JWT or encrypt this)
    let session: UserSession
    try {
      session = JSON.parse(atob(sessionCookie)) as UserSession
    } catch {
      // Invalid session format, redirect to login
      return c.redirect('/login')
    }

    // Check if session is expired
    if (session.exp < Date.now()) {
      // Session expired, redirect to login
      return c.redirect('/login')
    }

    // Add user to context for use in routes
    c.set('user', {
      id: session.id,
      name: session.name,
      email: session.email,
      image: session.image
    })
    
    await next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    // On error, redirect to login
    return c.redirect('/login')
  }
}

// Helper function to create session cookie
export const createSessionCookie = (user: { id: string; name: string; email: string; image?: string }): string => {
  const session: UserSession = {
    ...user,
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
