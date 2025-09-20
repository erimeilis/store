import type { Bindings } from '@/types/bindings.js'
import type {
  CreateInventoryTransactionRequest,
  InventoryTransaction,
  InventoryTransactionType,
  ParsedInventoryData
} from '@/types/inventory.js'
import { InventoryRepository } from '@/repositories/inventoryRepository.js'

/**
 * Track inventory changes for "for sale" table items
 * This should be called whenever items in for_sale tables are modified
 */
export async function trackInventoryChange(
  env: Bindings,
  tableId: string,
  tableName: string,
  itemId: string,
  transactionType: InventoryTransactionType,
  createdBy: string,
  options: {
    quantityChange?: number
    previousData?: ParsedInventoryData
    newData?: ParsedInventoryData
    referenceId?: string // For linking to sales
  } = {}
): Promise<InventoryTransaction> {
  const inventoryRepo = new InventoryRepository(env)

  const request: CreateInventoryTransactionRequest = {
    table_id: tableId,
    table_name: tableName,
    item_id: itemId,
    transaction_type: transactionType,
    quantity_change: options.quantityChange,
    previous_data: options.previousData,
    new_data: options.newData,
    reference_id: options.referenceId,
    created_by: createdBy
  }

  return await inventoryRepo.createTransaction(request)
}

/**
 * Track when an item is added to a for_sale table
 */
export async function trackItemAdded(
  env: Bindings,
  tableId: string,
  tableName: string,
  itemId: string,
  itemData: ParsedInventoryData,
  createdBy: string
): Promise<InventoryTransaction> {
  return trackInventoryChange(env, tableId, tableName, itemId, 'add', createdBy, {
    quantityChange: itemData.qty || 1,
    newData: itemData
  })
}

/**
 * Track when an item is removed from a for_sale table
 */
export async function trackItemRemoved(
  env: Bindings,
  tableId: string,
  tableName: string,
  itemId: string,
  itemData: ParsedInventoryData,
  createdBy: string
): Promise<InventoryTransaction> {
  return trackInventoryChange(env, tableId, tableName, itemId, 'remove', createdBy, {
    quantityChange: -(itemData.qty || 1),
    previousData: itemData
  })
}

/**
 * Track when an item is updated in a for_sale table
 */
export async function trackItemUpdated(
  env: Bindings,
  tableId: string,
  tableName: string,
  itemId: string,
  previousData: ParsedInventoryData,
  newData: ParsedInventoryData,
  createdBy: string
): Promise<InventoryTransaction> {
  // Calculate quantity change if both have qty fields
  let quantityChange: number | undefined
  if (typeof previousData.qty === 'number' && typeof newData.qty === 'number') {
    quantityChange = newData.qty - previousData.qty
  }

  return trackInventoryChange(env, tableId, tableName, itemId, 'update', createdBy, {
    quantityChange,
    previousData,
    newData
  })
}

/**
 * Track manual inventory adjustments
 */
export async function trackInventoryAdjustment(
  env: Bindings,
  tableId: string,
  tableName: string,
  itemId: string,
  quantityChange: number,
  previousData: ParsedInventoryData,
  newData: ParsedInventoryData,
  createdBy: string,
  reason?: string
): Promise<InventoryTransaction> {
  return trackInventoryChange(env, tableId, tableName, itemId, 'adjust', createdBy, {
    quantityChange,
    previousData,
    newData
  })
}

/**
 * Track sale transactions (called from sales service)
 */
export async function trackSale(
  env: Bindings,
  tableId: string,
  tableName: string,
  itemId: string,
  quantitySold: number,
  previousData: ParsedInventoryData,
  newData: ParsedInventoryData,
  saleId: string,
  createdBy: string
): Promise<InventoryTransaction> {
  return trackInventoryChange(env, tableId, tableName, itemId, 'sale', createdBy, {
    quantityChange: -quantitySold, // Negative for sale
    previousData,
    newData,
    referenceId: saleId
  })
}