import type { Context } from 'hono'
import type { Bindings } from '@/types/bindings.js'
import type { UserContext } from '@/types/database.js'
import type { SaleListQuery, SaleListResponse } from '@/types/sales.js'
import { SalesRepository } from '@/repositories/salesRepository.js'
import { isUserAdmin, createErrorResponse, createSuccessResponse } from '@/utils/common.js'

/**
 * Get sales list with filtering, sorting, and pagination
 * Admin-only endpoint for sales management
 */
export async function getSales(
  env: Bindings,
  c: Context,
  user: UserContext,
  query: SaleListQuery
) {
  const salesRepo = new SalesRepository(env)

  try {
    // Admin check
    if (!isUserAdmin(user)) {
      return createErrorResponse('Access denied', 'Admin access required', 403)
    }

    // Get sales with filtering and pagination
    const result = await salesRepo.findSales(query)

    return result

  } catch (error) {
    console.error('Error fetching sales:', error)
    return createErrorResponse('Server error', 'Failed to fetch sales', 500)
  }
}

/**
 * Get sales for a specific customer
 */
export async function getSalesByCustomer(
  env: Bindings,
  c: Context,
  user: UserContext,
  customerId: string,
  limit = 50
) {
  const salesRepo = new SalesRepository(env)

  try {
    const sales = await salesRepo.findSalesByCustomer(customerId, limit)
    return c.json({ sales })

  } catch (error) {
    console.error('Error fetching customer sales:', error)
    return c.json({ error: 'Failed to fetch customer sales' }, 500)
  }
}

/**
 * Get sales for a specific table
 */
export async function getSalesByTable(
  env: Bindings,
  c: Context,
  user: UserContext,
  tableId: string,
  limit = 50
) {
  const salesRepo = new SalesRepository(env)

  try {
    const sales = await salesRepo.findSalesByTable(tableId, limit)
    return c.json({ sales })

  } catch (error) {
    console.error('Error fetching table sales:', error)
    return c.json({ error: 'Failed to fetch table sales' }, 500)
  }
}