import type { Context } from 'hono'
import type { Bindings } from '@/types/bindings.js'
import type { UserContext } from '@/types/database.js'
import type { CreateSaleRequest, Sale } from '@/types/sales.js'
import type { ParsedTableData } from '@/types/dynamic-tables.js'
import { TableRepository } from '@/repositories/tableRepository.js'
import { TableDataRepository } from '@/repositories/tableDataRepository.js'
import { SalesService } from '@/services/salesService/index.js'

/**
 * Check item availability for purchase
 */
export async function checkAvailability(
  env: Bindings,
  c: Context,
  tableId: string,
  itemId: string,
  quantity: number = 1
): Promise<{ available: boolean; currentQty: number; maxAvailable: number } | { error: string; status?: number }> {
  const tableRepo = new TableRepository(env)
  const dataRepo = new TableDataRepository(env)

  try {
    // Verify table exists and is public for sale
    const table = await tableRepo.findTableByIdInternal(tableId)
    if (!table) {
      return { error: 'Table not found', status: 404 }
    }

    if (!['public', 'shared'].includes(table.visibility) || !table.forSale) {
      return { error: 'Table is not available for public sales', status: 403 }
    }

    // Get the specific item
    const row = await dataRepo.findDataRowById(itemId, tableId)
    if (!row) {
      return { error: 'Item not found', status: 404 }
    }

    const parsedData = row.data

    // Extract current quantity
    const qtyValue = parsedData.qty
    const priceValue = parsedData.price

    const currentQty = typeof qtyValue === 'number' ? qtyValue : parseInt(String(qtyValue || '0'))
    const price = typeof priceValue === 'number' ? priceValue : parseFloat(String(priceValue || '0'))

    if (price <= 0) {
      return { error: 'Item is not available for sale', status: 403 }
    }

    return {
      available: currentQty >= quantity,
      currentQty: currentQty,
      maxAvailable: currentQty
    }

  } catch (error) {
    console.error('Error checking availability:', error)
    throw new Error('Failed to check item availability')
  }
}

/**
 * Purchase an item (create sale and update inventory)
 */
export async function purchaseItem(
  env: Bindings,
  c: Context,
  user: UserContext,
  data: CreateSaleRequest
): Promise<{ sale: Sale } | { error: string; status?: number }> {
  const tableRepo = new TableRepository(env)
  const dataRepo = new TableDataRepository(env)
  const salesService = new SalesService(env)

  try {
    // Verify table exists and is public for sale
    const table = await tableRepo.findTableByIdInternal(data.tableId)
    if (!table) {
      return { error: 'Table not found', status: 404 }
    }

    if (!['public', 'shared'].includes(table.visibility) || !table.forSale) {
      return { error: 'Table is not available for public sales', status: 403 }
    }

    // Get the specific item and check availability
    const row = await dataRepo.findDataRowById(data.itemId, data.tableId)
    if (!row) {
      return { error: 'Item not found', status: 404 }
    }

    // row.data is already parsed by findDataRowById
    const parsedData = row.data

    // Extract current quantity and price
    const qtyValue = parsedData.qty
    const priceValue = parsedData.price

    const currentQty = typeof qtyValue === 'number' ? qtyValue : parseInt(String(qtyValue || '0'))
    const price = typeof priceValue === 'number' ? priceValue : parseFloat(String(priceValue || '0'))

    if (price <= 0) {
      return { error: 'Item is not available for sale', status: 403 }
    }

    const quantitySold = data.quantitySold || 1
    if (currentQty < quantitySold) {
      return {
        error: `Insufficient quantity. Available: ${currentQty}, Requested: ${quantitySold}`,
        status: 400
      }
    }

    // Calculate sale details
    const saleData: CreateSaleRequest = {
      ...data
    }

    // Create the sale using the existing sales service
    const saleResult = await salesService.createSale(c, user, saleData)

    // Check if sale creation failed
    if (saleResult && typeof saleResult === 'object' && 'error' in saleResult) {
      return { error: 'Failed to create sale transaction', status: 500 }
    }

    // Update item quantity (reduce by sold amount)
    const newQty = currentQty - quantitySold
    const updatedData = {
      ...parsedData,
      qty: newQty
    }

    try {
      await dataRepo.updateDataRow(data.itemId, data.tableId, updatedData)
    } catch (updateError) {
      console.error('Error updating item quantity after sale:', updateError)
      // Sale was created but quantity update failed
      // In a production system, you might want to implement compensation logic
      // For now, we'll log the error but still return success
    }

    return { sale: saleResult as Sale }

  } catch (error) {
    console.error('Error processing purchase:', error)
    throw new Error('Failed to process purchase')
  }
}