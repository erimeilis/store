/**
 * Helper functions for table metadata access
 * Note: These still use raw DB access since table metadata is not part of inventory repository
 */

import type { Bindings } from '@/types/bindings.js'

/**
 * Check if a table is a "for sale" table that requires inventory tracking
 */
export async function isForSaleTable(env: Bindings, tableId: string): Promise<boolean> {
  try {
    // Import database utilities dynamically to avoid circular dependencies
    const { getPrismaClient } = await import('@/lib/database.js')
    const prisma = getPrismaClient(env)

    const result = await prisma.userTable.findUnique({
      where: { id: tableId },
      select: { forSale: true }
    })

    return Boolean(result?.forSale)
  } catch (error) {
    console.error('❌ Failed to check forSale status:', error)
    return false
  }
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