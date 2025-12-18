import type { PrismaClient, Token as PrismaToken } from '@prisma/client'
import type {
  Token,
  UserContext,
  TokenValidationResult,
  IpCheckResult,
  DomainCheckResult,
  TokenPermissions
} from '@/types/database.js'
import { CacheService } from '@/lib/cache-service.js'

/**
 * Token Service
 * Handles token validation, IP/domain whitelist checking, and permission management
 * Uses KV cache for high-performance token lookups (Phase 1 optimization)
 */

/**
 * Check if IP address matches whitelist patterns
 * Supports individual IPs and CIDR ranges
 */
export function checkIpWhitelist(clientIp: string, allowedIps: string | null): IpCheckResult {
  if (!allowedIps) {
    return { allowed: true } // No restrictions
  }

  try {
    const patterns: string[] = JSON.parse(allowedIps)
    
    for (const pattern of patterns) {
      if (pattern === '0.0.0.0/0') {
        return { allowed: true, matchedPattern: pattern } // Allow all
      }
      
      if (pattern === clientIp) {
        return { allowed: true, matchedPattern: pattern } // Exact match
      }
      
      // CIDR range matching (basic implementation)
      if (pattern.includes('/')) {
        // For production, use a proper CIDR library like 'ip-range-check'
        // This is a simplified version for common cases
        if (pattern === '127.0.0.0/8' && clientIp.startsWith('127.')) {
          return { allowed: true, matchedPattern: pattern }
        }
        if (pattern === '192.168.0.0/16' && clientIp.startsWith('192.168.')) {
          return { allowed: true, matchedPattern: pattern }
        }
        if (pattern === '10.0.0.0/8' && clientIp.startsWith('10.')) {
          return { allowed: true, matchedPattern: pattern }
        }
        if (pattern === '172.16.0.0/12' && clientIp.match(/^172\.(1[6-9]|2[0-9]|3[01])\./)) {
          return { allowed: true, matchedPattern: pattern }
        }
      }
    }
    
    return { allowed: false }
  } catch (error) {
    console.error('IP whitelist parsing error:', error)
    return { allowed: false }
  }
}

/**
 * Check if domain matches whitelist patterns
 * Supports wildcards and exact matches
 */
export function checkDomainWhitelist(domain: string, allowedDomains: string | null): DomainCheckResult {
  if (!allowedDomains || !domain) {
    return { allowed: true } // No restrictions or no domain
  }

  try {
    const patterns: string[] = JSON.parse(allowedDomains)
    
    for (const pattern of patterns) {
      // Exact match
      if (pattern === domain) {
        return { allowed: true, matchedPattern: pattern }
      }
      
      // Wildcard matching
      if (pattern.startsWith('*.')) {
        const baseDomain = pattern.substring(2)
        if (domain.endsWith(baseDomain)) {
          return { allowed: true, matchedPattern: pattern }
        }
      }
      
      // Port wildcard matching (e.g., localhost:* matches localhost:57951)
      if (pattern.includes(':*')) {
        const basePattern = pattern.replace(':*', '')
        if (domain.startsWith(basePattern + ':')) {
          return { allowed: true, matchedPattern: pattern }
        }
      }
      
      // Subdomain matching
      if (domain.endsWith(`.${pattern}`)) {
        return { allowed: true, matchedPattern: pattern }
      }
    }
    
    return { allowed: false }
  } catch (error) {
    console.error('Domain whitelist parsing error:', error)
    return { allowed: false }
  }
}

/**
 * Extract client IP from Cloudflare Workers request
 */
export function getClientIp(request: Request): string {
  // Cloudflare provides real client IP in CF-Connecting-IP header
  return request.headers.get('CF-Connecting-IP') || 
         request.headers.get('x-forwarded-for')?.split(',')[0] || 
         '127.0.0.1'
}

/**
 * Extract domain from request headers
 */
export function getRequestDomain(request: Request): string | null {
  const origin = request.headers.get('Origin') || null
  const referer = request.headers.get('Referer') || null
  const host = request.headers.get('Host') || null
  
  // Extract domain from Origin header (strips protocol)
  if (origin) {
    const match = origin.match(/https?:\/\/([^\/]+)/)
    if (match && match[1]) return match[1]
  }
  
  // Extract domain from Referer header (strips protocol)  
  if (referer) {
    const match = referer.match(/https?:\/\/([^\/]+)/)
    if (match && match[1]) return match[1]
  }
  
  // Host header is already domain-only
  return host || null
}

/**
 * Parse token permissions from comma-separated string
 */
export function parseTokenPermissions(permissionsString: string): TokenPermissions[] {
  if (!permissionsString) {
    console.error('parseTokenPermissions called with undefined/null permissions')
    return ['read'] as TokenPermissions[] // Safe default
  }
  return permissionsString.split(',').map(p => p.trim()) as TokenPermissions[]
}

/**
 * Check if user has required permission
 */
export function hasPermission(userPermissions: TokenPermissions[], required: TokenPermissions): boolean {
  // Admin has all permissions
  if (userPermissions.includes('admin')) {
    return true
  }
  
  // Write permission includes read
  if (required === 'read' && userPermissions.includes('write')) {
    return true
  }
  
  return userPermissions.includes(required)
}

/**
 * Validate token with IP/domain whitelist checks
 * Uses KV cache for high-performance lookups (cache forever, invalidate on change)
 *
 * @param prisma - Prisma client for DB queries
 * @param tokenString - Bearer token string
 * @param request - Request object for IP/domain extraction
 * @param cache - Optional KV namespace for caching
 */
export async function validateToken(
  prisma: PrismaClient,
  tokenString: string,
  request: Request,
  cache?: KVNamespace
): Promise<TokenValidationResult> {
  try {
    let token: PrismaToken | null = null

    // 1. Check KV cache first (if available)
    if (cache) {
      const cacheService = new CacheService(cache)
      token = await cacheService.getToken(tokenString)
    }

    // 2. Query DB only on cache miss
    if (!token) {
      token = await prisma.token.findUnique({
        where: { token: tokenString }
      })

      // Cache the token for future requests (forever - invalidate on change)
      if (token && cache) {
        const cacheService = new CacheService(cache)
        await cacheService.setToken(tokenString, token)
      }
    }

    if (!token) {
      return { valid: false, error: 'Token not found' }
    }

    // Check if token is expired
    if (token.expiresAt && token.expiresAt < new Date()) {
      return { valid: false, error: 'Token expired' }
    }

    // Extract client information
    const clientIp = getClientIp(request)
    const requestDomain = getRequestDomain(request)

    // Check IP whitelist
    const ipCheck = checkIpWhitelist(clientIp, token.allowedIps)
    if (!ipCheck.allowed) {
      return {
        valid: false,
        error: `IP address ${clientIp} not allowed for this token`
      }
    }

    // Check domain whitelist
    const domainCheck = checkDomainWhitelist(requestDomain || '', token.allowedDomains)
    if (!domainCheck.allowed) {
      return {
        valid: false,
        error: `Domain ${requestDomain} not allowed for this token`
      }
    }

    // Create user context
    const permissions = parseTokenPermissions(token.permissions)
    const userContext: UserContext = {
      id: token.id,
      permissions,
      isAdmin: Boolean(token.isAdmin), // Admin tokens can access all routes
      tokenId: token.id,
      token
    }

    return { valid: true, user: userContext }
  } catch (error) {
    console.error('Token validation error:', error)
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Token validation failed'
    }
  }
}

/**
 * Invalidate token cache (call on token create/update/delete)
 * @param cache - KV namespace
 * @param tokenString - The token string to invalidate
 */
export async function invalidateTokenCache(cache: KVNamespace, tokenString: string): Promise<void> {
  const cacheService = new CacheService(cache)
  await cacheService.invalidateToken(tokenString)
}