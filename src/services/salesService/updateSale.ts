import type { Context } from 'hono'
import type { Bindings } from '@/types/bindings.js'
import type { UserContext } from '@/types/database.js'
import type { UpdateSaleRequest, Sale } from '@/types/sales.js'
import { SalesRepository } from '@/repositories/salesRepository.js'
import { isUserAdmin } from '@/utils/common.js'

/**
 * Update sale (Admin only)
 * Limited to status, payment method, and notes for audit compliance
 */
export async function updateSale(
  env: Bindings,
  c: Context,
  user: UserContext,
  saleId: string,
  updateData: UpdateSaleRequest
): Promise<Sale | Response> {
  const salesRepo = new SalesRepository(env)

  try {
    // Admin check
    if (!isUserAdmin(user)) {
      return c.json({ error: 'Admin access required' }, 403)
    }

    // Check if sale exists
    const existingSale = await salesRepo.findSaleById(saleId)
    if (!existingSale) {
      return c.json({ error: 'Sale not found' }, 404)
    }

    // Validate update data
    if (Object.keys(updateData).length === 0) {
      return c.json({ error: 'No update data provided' }, 400)
    }

    // Update the sale
    const updatedSale = await salesRepo.updateSale(saleId, updateData)

    return updatedSale

  } catch (error) {
    console.error('Error updating sale:', error)

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return c.json({ error: error.message }, 404)
      }
      if (error.message.includes('No fields to update')) {
        return c.json({ error: error.message }, 400)
      }
    }

    return c.json({ error: 'Failed to update sale' }, 500)
  }
}

/**
 * Get single sale by ID
 */
export async function getSale(
  env: Bindings,
  c: Context,
  user: UserContext,
  saleId: string
) {
  const salesRepo = new SalesRepository(env)

  try {
    // Admin check
    if (!isUserAdmin(user)) {
      return c.json({ error: 'Admin access required' }, 403)
    }

    const sale = await salesRepo.findSaleById(saleId)
    if (!sale) {
      return c.json({ error: 'Sale not found' }, 404)
    }

    // Parse item snapshot
    const saleWithSnapshot = {
      ...sale,
      itemSnapshot: typeof sale.itemSnapshot === 'string'
        ? JSON.parse(sale.itemSnapshot)
        : sale.itemSnapshot
    }

    return c.json({ sale: saleWithSnapshot })

  } catch (error) {
    console.error('Error fetching sale:', error)
    return c.json({ error: 'Failed to fetch sale' }, 500)
  }
}

/**
 * Delete sale (Admin only)
 * Note: This should be used with caution for audit compliance
 */
export async function deleteSale(
  env: Bindings,
  c: Context,
  user: UserContext,
  saleId: string
) {
  const salesRepo = new SalesRepository(env)

  try {
    // Admin check
    if (!isUserAdmin(user)) {
      return c.json({ error: 'Admin access required' }, 403)
    }

    const deletedSale = await salesRepo.deleteSale(saleId)

    return c.json({
      message: 'Sale deleted successfully',
      sale: deletedSale
    })

  } catch (error) {
    console.error('Error deleting sale:', error)

    if (error instanceof Error && error.message.includes('not found')) {
      return c.json({ error: 'Sale not found' }, 404)
    }

    return c.json({ error: 'Failed to delete sale' }, 500)
  }
}