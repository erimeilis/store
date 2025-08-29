import { cors } from 'hono/cors'
import type { Context } from 'hono'
import type { Bindings } from '../../types/bindings.js'

/**
 * CORS Configuration Middleware
 * Handles Cross-Origin Resource Sharing with support for:
 * - Environment-based allowed origins
 * - Cloudflare Pages preview deployments
 * - Workers dev deployments
 * - Dynamic origin validation
 */
export const corsMiddleware = cors({
  origin: (origin: string | undefined, c: Context<{ Bindings: Bindings }>) => {
    // Get allowed origins from environment variables
    const allowedOriginsEnv = c.env?.ALLOWED_ORIGINS || ''
    const allowedOrigins = allowedOriginsEnv.split(',').filter(Boolean)
    
    if (!origin) return '*'
    if (allowedOrigins.includes(origin)) return origin
    
    // Allow Cloudflare Pages preview deployments
    if (origin.match(/^https:\/\/[a-zA-Z0-9-]+\.store-crud-front\.pages\.dev$/)) return origin
    // Allow Workers dev deployments  
    if (origin.match(/^https:\/\/[a-zA-Z0-9-]+\.workers\.dev$/)) return origin
    // Allow other Pages deployments
    if (origin.match(/^https:\/\/[a-zA-Z0-9-]+\.pages\.dev$/)) return origin
    
    return null
  },
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
})