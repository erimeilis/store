import type { Context, Next } from 'hono'
import type { Bindings } from '@/types/bindings.js'
import { getPrismaClient } from '@/lib/database.js'
import type { UserContext } from '@/types/database.js'
import type { UserTable, TableAccessLevel } from '@/types/dynamic-tables.js'

type Variables = {
  user: UserContext
  tableAccess?: {
    table: UserTable
    accessLevel: TableAccessLevel
    canRead: boolean
    canWrite: boolean
    canDelete: boolean
    canManage: boolean
  }
}

/**
 * Determines user's access level for a table
 */
function determineAccessLevel(table: UserTable, userId: string): TableAccessLevel {
  // Owner has admin access - check both createdBy and userId fields
  // createdBy might be "token:admin-token" while userId is the actual user ID
  if (table.createdBy === userId || table.userId === userId) {
    return 'admin'
  }

  // Handle visibility-based access control
  switch (table.visibility) {
    case 'shared':
      // Shared tables allow write access to all authenticated users
      return 'write'
    case 'public':
      // Public tables allow write access to authenticated users (backwards compatibility)
      return 'write'
    case 'private':
    default:
      // Private tables only allow read access to non-owners
      return 'read'
  }
}

/**
 * Check permissions based on access level
 */
function getPermissions(accessLevel: TableAccessLevel) {
  switch (accessLevel) {
    case 'admin':
      return {
        canRead: true,
        canWrite: true,
        canDelete: true,
        canManage: true
      }
    case 'write':
      return {
        canRead: true,
        canWrite: true,
        canDelete: true,
        canManage: false
      }
    case 'read':
      return {
        canRead: true,
        canWrite: false,
        canDelete: false,
        canManage: false
      }
    case 'none':
    default:
      return {
        canRead: false,
        canWrite: false,
        canDelete: false,
        canManage: false
      }
  }
}

/**
 * Check if token has access to specific table
 * Standalone tokens (admin-token, frontend-token) have unrestricted access
 */
function hasTokenTableAccess(user: UserContext, tableId: string): boolean {
  // Standalone tokens have unrestricted access
  if (user.tokenId === 'admin-token' || user.tokenId === 'frontend-token') {
    return true
  }

  // Check if token has explicit table access
  if (user.token && user.token.tableAccess) {
    try {
      const allowedTables = JSON.parse(user.token.tableAccess)
      return allowedTables.includes(tableId)
    } catch (error) {
      console.error('Error parsing token table access:', error)
      return false
    }
  }

  return false
}

/**
 * Table Access Control Middleware Factory
 * Validates user's access to a specific table and sets access context
 *
 * @param requiredPermission - The minimum permission required ('read' | 'write' | 'delete' | 'manage')
 * @param tableIdParam - The parameter name containing the table ID (default: 'tableId')
 * @returns Hono middleware function
 */
export const createTableAccessMiddleware = (
  requiredPermission: 'read' | 'write' | 'delete' | 'manage',
  tableIdParam: string = 'tableId'
) => {
  return async (c: Context<{ Bindings: Bindings; Variables: Variables }>, next: Next) => {
    const tableId = c.req.param(tableIdParam)
    const user = c.get('user')

    if (!tableId) {
      return c.json({
        error: 'Bad Request',
        message: `Table ID parameter '${tableIdParam}' is required`
      }, 400)
    }

    if (!user) {
      return c.json({
        error: 'Unauthorized',
        message: 'Authentication required'
      }, 401)
    }

    try {
      const prisma = getPrismaClient(c.env)
      const userId = user.id

      // Get table information using Prisma ORM
      const table = await prisma.userTable.findUnique({
        where: { id: tableId },
        select: {
          id: true,
          name: true,
          description: true,
          createdBy: true,
          userId: true,
          visibility: true,
          forSale: true,
          createdAt: true,
          updatedAt: true,
        }
      }) as UserTable | null

      if (!table) {
        return c.json({
          error: 'Not Found',
          message: `Table with ID '${tableId}' does not exist`
        }, 404)
      }

      // Check token table access for non-standalone tokens
      if (!hasTokenTableAccess(user, tableId)) {
        return c.json({
          error: 'Forbidden',
          message: 'You do not have access to this table'
        }, 403)
      }

      // Determine access level
      const accessLevel = determineAccessLevel(table, userId)
      const permissions = getPermissions(accessLevel)

      // Check if user has required permission
      switch (requiredPermission) {
        case 'read':
          if (!permissions.canRead) {
            return c.json({
              error: 'Forbidden',
              message: 'You do not have read access to this table'
            }, 403)
          }
          break
        case 'write':
          if (!permissions.canWrite) {
            return c.json({
              error: 'Forbidden',
              message: 'You do not have write access to this table'
            }, 403)
          }
          break
        case 'delete':
          if (!permissions.canDelete) {
            return c.json({
              error: 'Forbidden',
              message: 'You do not have delete access to this table'
            }, 403)
          }
          break
        case 'manage':
          if (!permissions.canManage) {
            return c.json({
              error: 'Forbidden',
              message: 'You do not have management access to this table'
            }, 403)
          }
          break
      }

      // Set table access context for downstream handlers
      c.set('tableAccess', {
        table,
        accessLevel,
        ...permissions
      })

      return next()
    } catch (error) {
      console.error('Table access validation error:', error)
      return c.json({
        error: 'Internal Server Error',
        message: 'Table access validation failed'
      }, 500)
    }
  }
}

/**
 * Pre-configured middleware instances for common table operations
 */
export const tableReadAccess = (tableIdParam?: string) => 
  createTableAccessMiddleware('read', tableIdParam)

export const tableWriteAccess = (tableIdParam?: string) => 
  createTableAccessMiddleware('write', tableIdParam)

export const tableDeleteAccess = (tableIdParam?: string) => 
  createTableAccessMiddleware('delete', tableIdParam)

export const tableManageAccess = (tableIdParam?: string) => 
  createTableAccessMiddleware('manage', tableIdParam)

/**
 * Combined middleware that requires both authentication and table access
 * This is a convenience function that combines auth + table access checks
 */
export const createAuthenticatedTableAccessMiddleware = (
  requiredPermission: 'read' | 'write' | 'delete' | 'manage',
  tableIdParam: string = 'tableId'
) => {
  // Note: This assumes the auth middleware has already been applied
  // The routes should apply auth middleware first, then this middleware
  return createTableAccessMiddleware(requiredPermission, tableIdParam)
}
