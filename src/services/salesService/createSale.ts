import type { Context } from 'hono'
import type { Bindings } from '@/types/bindings.js'
import type { UserContext } from '@/types/database.js'
import type { CreateSaleRequest, Sale, ItemSnapshot, ItemAvailability } from '@/types/sales.js'
import type { CreateInventoryTransactionRequest } from '@/types/inventory.js'
import { SalesRepository } from '@/repositories/salesRepository.js'
import { InventoryRepository } from '@/repositories/inventoryRepository.js'
import { TableRepository } from '@/repositories/tableRepository.js'
import { TableDataRepository } from '@/repositories/tableDataRepository.js'
import { getUserInfo } from '@/utils/common.js'

/**
 * Create a new sale transaction
 * This handles the complete sale flow including inventory tracking
 */
export async function createSale(
  env: Bindings,
  c: Context,
  user: UserContext,
  saleData: CreateSaleRequest
): Promise<Sale> {
  const salesRepo = new SalesRepository(env)
  const inventoryRepo = new InventoryRepository(env)
  const tableRepo = new TableRepository(env)
  const tableDataRepo = new TableDataRepository(env)

  try {
    // 1. Validate that table exists and is for_sale
    const table = await tableRepo.findTableByIdInternal(saleData.tableId)
    if (!table) {
      throw new Error('Table not found')
    }

    if (!table.forSale) {
      throw new Error('Table is not configured for sales')
    }

    // 2. Get the item data
    const item = await tableDataRepo.findDataRowById(saleData.itemId, saleData.tableId)
    if (!item) {
      throw new Error('Item not found')
    }

    // 3. Parse item data and validate it has required fields
    let itemData: ItemSnapshot
    try {
      itemData = typeof item.data === 'string' ? JSON.parse(item.data) : item.data
    } catch (error) {
      throw new Error('Invalid item data format')
    }

    if (!itemData.price || itemData.price <= 0) {
      throw new Error('Item has invalid price')
    }

    if (!itemData.qty || itemData.qty < 0) {
      throw new Error('Item has invalid quantity')
    }

    // 4. Check item availability
    const requestedQuantity = saleData.quantitySold || 1
    const availability = await checkItemAvailability(itemData, requestedQuantity)

    if (!availability.available) {
      throw new Error(`Insufficient quantity available. Available: ${availability.currentQuantity}, Requested: ${availability.requestedQuantity}`)
    }

    // 5. Calculate sale amounts
    const unitPrice = itemData.price
    const totalAmount = unitPrice * requestedQuantity

    // 6. Generate sale number
    const currentYear = new Date().getFullYear()
    const saleNumber = await salesRepo.getNextSaleNumber(currentYear)

    // 7. Create the sale record
    const sale = await salesRepo.createSale(
      saleData,
      { id: table.id, name: table.name },
      { id: item.id, data: itemData },
      saleNumber,
      unitPrice,
      totalAmount
    )

    // 8. Update item quantity
    const newQuantity = itemData.qty - requestedQuantity
    const updatedItemData = {
      ...itemData,
      qty: newQuantity
    }

    await tableDataRepo.updateDataRow(
      saleData.itemId,
      saleData.tableId,
      updatedItemData
    )

    // 9. Create inventory transaction
    // Get user information for audit trail
    const { userEmail } = getUserInfo(c, user)

    const inventoryTransaction: CreateInventoryTransactionRequest = {
      tableId: table.id,
      tableName: table.name,
      itemId: item.id,
      transactionType: 'sale',
      quantityChange: -requestedQuantity, // Negative for sale
      previousData: itemData,
      newData: updatedItemData,
      referenceId: sale.id,
      createdBy: userEmail
    }

    await inventoryRepo.createTransaction(inventoryTransaction)

    // 10. Return the created sale
    return sale

  } catch (error) {
    console.error('Error creating sale:', error)
    throw error
  }
}

/**
 * Check if item has sufficient quantity for sale
 */
function checkItemAvailability(itemData: ItemSnapshot, requestedQuantity: number): ItemAvailability {
  const currentQuantity = itemData.qty || 0

  if (currentQuantity >= requestedQuantity) {
    return {
      available: true,
      currentQuantity: currentQuantity,
      requestedQuantity: requestedQuantity
    }
  }

  return {
    available: false,
    currentQuantity: currentQuantity,
    requestedQuantity: requestedQuantity,
    shortage: requestedQuantity - currentQuantity
  }
}