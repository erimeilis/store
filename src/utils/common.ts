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
 * Build pagination info in Laravel-style format for frontend compatibility
 */
export function buildPaginationInfo(page: number, limit: number, totalCount: number) {
  const totalPages = Math.ceil(totalCount / limit)
  const from = totalCount > 0 ? (page - 1) * limit + 1 : null
  const to = totalCount > 0 ? Math.min(page * limit, totalCount) : null

  // Build links array for pagination buttons
  const links = []

  // Previous link
  links.push({
    url: page > 1 ? `?page=${page - 1}` : null,
    label: '&laquo; Previous',
    active: false
  })

  // Page number links
  for (let i = 1; i <= totalPages; i++) {
    links.push({
      url: `?page=${i}`,
      label: i.toString(),
      active: i === page
    })
  }

  // Next link
  links.push({
    url: page < totalPages ? `?page=${page + 1}` : null,
    label: 'Next &raquo;',
    active: false
  })

  return {
    currentPage: page,
    lastPage: totalPages,
    perPage: limit,
    total: totalCount,
    from,
    to,
    links,
    prevPageUrl: page > 1 ? `?page=${page - 1}` : null,
    nextPageUrl: page < totalPages ? `?page=${page + 1}` : null,
    lastPageUrl: totalPages > 0 ? `?page=${totalPages}` : null
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
  if (!direction) return 'desc'
  return direction.toLowerCase() === 'asc' ? 'asc' : 'desc'
}
