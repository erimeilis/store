// Database Types - Auto-generated types from Prisma schema
// These types should match the generated Prisma types

/**
 * User model from Prisma schema
 */
export interface User {
  id: string
  email: string
  name: string | null
  picture: string | null
  role: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Session model from Prisma schema
 */
export interface Session {
  id: string
  userId: string
  sessionToken: string
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}

/**
 * Token model from Prisma schema with IP/domain whitelist
 */
export interface Token {
  id: string
  token: string
  name: string
  permissions: string // Comma-separated: read,write,delete,admin
  allowedIps: string | null // JSON array of IPs/CIDR ranges
  allowedDomains: string | null // JSON array of domain patterns
  expiresAt: Date | null
  createdAt: Date
  updatedAt: Date
}

/**
 * Table metadata model for user-created custom tables
 */
export interface Table {
  id: string
  name: string
  ownerId: string
  schema: string // JSON - column definitions, types, constraints
  permissions: string | null // JSON - user permissions per table
  createdAt: Date
  updatedAt: Date
}

/**
 * AllowedEmail model for access control whitelist
 */
export interface AllowedEmail {
  id: string
  email: string | null // Specific email address
  domain: string | null // Domain pattern (e.g., @company.com)
  type: string // "email" or "domain"
  createdAt: Date
}

/**
 * Item model - Test table with fake data
 */
export interface Item {
  id: string
  name: string
  description: string | null
  data: string // JSON - price, category, stock, etc.
  createdAt: Date
  updatedAt: Date
}

/**
 * Parsed token permissions
 */
export type TokenPermissions = 'read' | 'write' | 'delete' | 'admin'

/**
 * User context for authentication
 */
export interface UserContext {
  id: string
  permissions: TokenPermissions[]
  tokenId?: string
  token?: Token
}

/**
 * IP whitelist check result
 */
export interface IpCheckResult {
  allowed: boolean
  matchedPattern?: string
}

/**
 * Domain whitelist check result
 */
export interface DomainCheckResult {
  allowed: boolean
  matchedPattern?: string
}

/**
 * Token validation result
 */
export interface TokenValidationResult {
  valid: boolean
  user?: UserContext
  error?: string
}

/**
 * Parsed item data structure (example)
 */
export interface ItemData {
  price: number
  quantity: number
  category: string
  sku: string
  brand: string
  weight: number
  inStock: boolean
  rating: number
  features: string[]
}