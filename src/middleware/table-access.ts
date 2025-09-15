import type { Context, Next } from 'hono'
import type { Bindings } from '../../types/bindings.js'
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
  // Owner has admin access - check both created_by and user_id fields
  // created_by might be "token:admin-token" while user_id is the actual user ID
  if (table.created_by === userId || table.user_id === userId) {
    return 'admin'
  }

  // Public tables allow write access to authenticated users
  if (table.is_public) {
    return 'write'
  }

  // Private tables only allow read access to non-owners for now
  // In future could add explicit permissions table
  return 'read'
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
      
      // Get table information
      const [table] = await prisma.$queryRaw<UserTable[]>`
        SELECT id, name, description, created_by, user_id, is_public, created_at, updated_at
        FROM user_tables
        WHERE id = ${tableId}
      `
      
      if (!table) {
        return c.json({
          error: 'Not Found',
          message: `Table with ID '${tableId}' does not exist`
        }, 404)
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