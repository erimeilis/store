/**
 * Helper functions for table metadata access
 * Note: These still use raw DB access since table metadata is not part of inventory repository
 */

import type { Bindings } from '@/types/bindings.js'

/**
 * Check if a table is a "sale" type table that requires inventory tracking
 */
export async function isSaleTable(env: Bindings, tableId: string): Promise<boolean> {
  try {
    // Import database utilities dynamically to avoid circular dependencies
    const { getPrismaClient } = await import('@/lib/database.js')
    const prisma = getPrismaClient(env)

    const result = await prisma.userTable.findUnique({
      where: { id: tableId },
      select: { tableType: true }
    })

    return result?.tableType === 'sale'
  } catch (error) {
    console.error('❌ Failed to check tableType status:', error)
    return false
  }
}

/**
 * @deprecated Use isSaleTable instead
 */
export async function isForSaleTable(env: Bindings, tableId: string): Promise<boolean> {
  return isSaleTable(env, tableId)
}

/**
 * Get table name for inventory tracking
 */
export async function getTableName(env: Bindings, tableId: string): Promise<string> {
  try {
    // Import database utilities dynamically to avoid circular dependencies
    const { getPrismaClient } = await import('@/lib/database.js')
    const prisma = getPrismaClient(env)

    const result = await prisma.userTable.findUnique({
      where: { id: tableId },
      select: { name: true }
    })

    return result?.name || 'Unknown Table'
  } catch (error) {
    console.error('❌ Failed to get table name:', error)
    return 'Unknown Table'
  }
}