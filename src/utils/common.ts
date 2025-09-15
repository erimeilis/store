import type { Context } from 'hono'
import type { UserContext } from '@/types/database.js'

/**
 * Common utilities for table operations
 */

/**
 * Extract user information from context
 */
export function getUserInfo(c: Context, user: UserContext) {
  const sessionUserId = c.req.header('X-User-Id')
  const userEmail = c.req.header('X-User-Email') || `token:${user.id}`
  const userName = c.req.header('X-User-Name') || user.token?.name || 'Unknown User'
  const userId = sessionUserId || user.id

  return { userId, userEmail, userName }
}

/**
 * Check if user is admin
 */
export function isUserAdmin(user: UserContext): boolean {
  return user.permissions?.includes('admin') || false
}

/**
 * Standard error response
 */
export function createErrorResponse(
  error: string,
  message: string,
  status: number = 500,
  details?: any
): { response: any; status: number } {
  const response: any = { error, message }
  if (details) response.details = details
  return { response, status }
}

/**
 * Standard success response
 */
export function createSuccessResponse(data: any, message?: string, status: number = 200): { response: any; status: number } {
  const response: any = { ...data }
  if (message) response.message = message
  return { response, status }
}

/**
 * Validate required fields
 */
export function validateRequired(value: any, fieldName: string): string | null {
  if (value === undefined || value === null || value === '') {
    return `${fieldName} is required`
  }
  return null
}

/**
 * Validate string field
 */
export function validateString(value: any, fieldName: string): string | null {
  if (value !== undefined && typeof value !== 'string') {
    return `${fieldName} must be a string`
  }
  return null
}

/**
 * Validate array field
 */
export function validateArray(value: any, fieldName: string): string | null {
  if (value !== undefined && !Array.isArray(value)) {
    return `${fieldName} must be an array`
  }
  return null
}

/**
 * Sanitize string for SQL LIKE queries
 */
export function sanitizeForSQL(value: string): string {
  return value.replace(/'/g, "''")
}

/**
 * Build pagination info
 */
export function buildPaginationInfo(page: number, limit: number, totalCount: number) {
  const totalPages = Math.ceil(totalCount / limit)
  return {
    page,
    limit,
    total: totalCount,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  }
}

/**
 * Validate sort column against allowed columns
 */
export function validateSortColumn(sortColumn: string, allowedColumns: string[]): string {
  return allowedColumns.includes(sortColumn) ? sortColumn : (allowedColumns[0] || 'id')
}

/**
 * Validate sort direction
 */
export function validateSortDirection(direction: string | undefined): string {
  if (!direction) return 'DESC'
  return direction.toLowerCase() === 'asc' ? 'ASC' : 'DESC'
}
