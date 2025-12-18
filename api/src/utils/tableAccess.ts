import type { UserContext } from '@/types/database.js'
import type { UserTable } from '@/types/dynamic-tables.js'

/**
 * Utility functions for checking table access in public API
 */

/**
 * Check if a user (token) has access to a specific table
 * Access is granted if:
 * 1. Token is admin/frontend (unrestricted access)
 * 2. Token has explicit tableAccess including this table
 * 3. Table is public/shared (fallback for any token)
 */
export function hasTableAccess(
  user: UserContext | undefined,
  table: UserTable
): boolean {
  // Admin and frontend tokens have unrestricted access
  if (user?.tokenId === 'admin-token' || user?.tokenId === 'frontend-token') {
    return true
  }

  // Check if token has explicit tableAccess for this table
  if (user?.token?.tableAccess) {
    try {
      const allowedTableIds = JSON.parse(user.token.tableAccess)
      if (Array.isArray(allowedTableIds) && allowedTableIds.includes(table.id)) {
        return true
      }
    } catch (e) {
      console.error('Error parsing tableAccess:', e)
    }
  }

  // Fallback: check visibility
  return ['public', 'shared'].includes(table.visibility)
}

/**
 * Get allowed table IDs from token's tableAccess
 * Returns null for unrestricted access (admin/frontend)
 * Returns empty array if token has no tableAccess
 */
export function getAllowedTableIds(user: UserContext | undefined): string[] | null {
  // Admin and frontend tokens have unrestricted access
  if (user?.tokenId === 'admin-token' || user?.tokenId === 'frontend-token') {
    return null
  }

  // Parse tableAccess from token
  if (user?.token?.tableAccess) {
    try {
      const allowedTableIds = JSON.parse(user.token.tableAccess)
      if (Array.isArray(allowedTableIds)) {
        return allowedTableIds
      }
    } catch (e) {
      console.error('Error parsing tableAccess:', e)
    }
  }

  // Token has no tableAccess - empty array means no explicit access
  return []
}

/**
 * Check if table type is supported for public API
 */
export function isSupportedTableType(tableType: string): boolean {
  return ['sale', 'rent'].includes(tableType)
}
