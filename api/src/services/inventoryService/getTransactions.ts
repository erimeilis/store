import type { Context } from 'hono'
import type { Bindings } from '@/types/bindings.js'
import type { UserContext } from '@/types/database.js'
import type {
  InventoryTransactionListQuery,
  InventoryTransactionListResponse,
  InventoryAnalytics,
  ItemInventorySummary,
  TableInventorySummary,
  StockLevelCheckRequest,
  StockLevelCheckResponse
} from '@/types/inventory.js'
import { InventoryRepository } from '@/repositories/inventoryRepository.js'
import { isUserAdmin } from '@/utils/common.js'

/**
 * Get inventory transactions with filtering, sorting, and pagination
 * Admin-only endpoint for inventory management
 */
export async function getInventoryTransactions(
  env: Bindings,
  c: Context,
  user: UserContext,
  query: InventoryTransactionListQuery
): Promise<InventoryTransactionListResponse | Response> {
  const inventoryRepo = new InventoryRepository(env)

  try {
    // Admin check
    if (!isUserAdmin(user)) {
      return c.json({ error: 'Admin access required' }, 403)
    }

    const result = await inventoryRepo.findTransactions(query)
    return result

  } catch (error) {
    console.error('Error fetching inventory transactions:', error)
    return c.json({ error: 'Failed to fetch inventory transactions' }, 500)
  }
}

/**
 * Get inventory analytics
 */
export async function getInventoryAnalytics(
  env: Bindings,
  c: Context,
  user: UserContext,
  dateFrom?: string,
  dateTo?: string,
  tableId?: string
): Promise<InventoryAnalytics | Response> {
  const inventoryRepo = new InventoryRepository(env)

  try {
    // Admin check
    if (!isUserAdmin(user)) {
      return c.json({ error: 'Admin access required' }, 403)
    }

    // Validate date parameters
    if (dateFrom && !isValidDate(dateFrom)) {
      return c.json({ error: 'Invalid date_from format. Use YYYY-MM-DD' }, 400)
    }

    if (dateTo && !isValidDate(dateTo)) {
      return c.json({ error: 'Invalid date_to format. Use YYYY-MM-DD' }, 400)
    }

    const analytics = await inventoryRepo.getInventoryAnalytics(dateFrom, dateTo, tableId)
    return analytics

  } catch (error) {
    console.error('Error fetching inventory analytics:', error)
    return c.json({ error: 'Failed to fetch inventory analytics' }, 500)
  }
}

/**
 * Get inventory summary for a specific item
 */
export async function getItemInventorySummary(
  env: Bindings,
  c: Context,
  user: UserContext,
  tableId: string,
  itemId: string
): Promise<Response> {
  const inventoryRepo = new InventoryRepository(env)

  try {
    // Admin check
    if (!isUserAdmin(user)) {
      return c.json({ error: 'Admin access required' }, 403)
    }

    const summary = await inventoryRepo.getItemInventorySummary(tableId, itemId)
    if (!summary) {
      return c.json({ error: 'No inventory data found for this item' }, 404)
    }

    return c.json({ summary })

  } catch (error) {
    console.error('Error fetching item inventory summary:', error)
    return c.json({ error: 'Failed to fetch item inventory summary' }, 500)
  }
}

/**
 * Get inventory summary for a specific table
 */
export async function getTableInventorySummary(
  env: Bindings,
  c: Context,
  user: UserContext,
  tableId: string
): Promise<Response> {
  const inventoryRepo = new InventoryRepository(env)

  try {
    // Admin check
    if (!isUserAdmin(user)) {
      return c.json({ error: 'Admin access required' }, 403)
    }

    const summary = await inventoryRepo.getTableInventorySummary(tableId)
    if (!summary) {
      return c.json({ error: 'No inventory data found for this table' }, 404)
    }

    return c.json({ summary })

  } catch (error) {
    console.error('Error fetching table inventory summary:', error)
    return c.json({ error: 'Failed to fetch table inventory summary' }, 500)
  }
}

/**
 * Check stock levels and get alerts
 */
export async function checkStockLevels(
  env: Bindings,
  c: Context,
  user: UserContext,
  request: StockLevelCheckRequest
): Promise<StockLevelCheckResponse | Response> {
  const inventoryRepo = new InventoryRepository(env)

  try {
    // Admin check
    if (!isUserAdmin(user)) {
      return c.json({ error: 'Admin access required' }, 403)
    }

    const response = await inventoryRepo.checkStockLevels(request)
    return response

  } catch (error) {
    console.error('Error checking stock levels:', error)
    return c.json({ error: 'Failed to check stock levels' }, 500)
  }
}

/**
 * Get transactions for a specific sale
 */
export async function getTransactionsBySale(
  env: Bindings,
  c: Context,
  user: UserContext,
  saleId: string
): Promise<Response> {
  const inventoryRepo = new InventoryRepository(env)

  try {
    // Admin check
    if (!isUserAdmin(user)) {
      return c.json({ error: 'Admin access required' }, 403)
    }

    const transactions = await inventoryRepo.findTransactionsBySale(saleId)
    return c.json({ transactions })

  } catch (error) {
    console.error('Error fetching sale transactions:', error)
    return c.json({ error: 'Failed to fetch sale transactions' }, 500)
  }
}

/**
 * Clear all transactions with filtering
 */
export async function clearAllTransactions(
  env: Bindings,
  c: Context,
  user: UserContext,
  query: InventoryTransactionListQuery
): Promise<Response> {
  const inventoryRepo = new InventoryRepository(env)

  try {
    // Admin check
    if (!isUserAdmin(user)) {
      return c.json({ error: 'Admin access required' }, 403)
    }

    const deletedCount = await inventoryRepo.clearTransactions(query)

    return c.json({
      message: 'Transactions cleared successfully',
      deletedCount
    })

  } catch (error) {
    console.error('Error clearing inventory transactions:', error)
    return c.json({ error: 'Failed to clear transactions. Please try again.' }, 500)
  }
}

/**
 * Validate date string format (YYYY-MM-DD)
 */
function isValidDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(dateString)) {
    return false
  }

  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}