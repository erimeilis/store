/**
 * Track item creation
 */

import { InventoryRepository } from '@/repositories/inventoryRepository.js'
import { logInventoryTransaction } from './logInventoryTransaction.js'
import { extractQuantity } from './utils.js'

export async function trackItemCreation(
  inventoryRepo: InventoryRepository,
  tableId: string,
  tableName: string,
  itemId: string,
  itemData: any,
  createdBy: string
): Promise<void> {
  const qtyValue = extractQuantity(itemData)

  await logInventoryTransaction(inventoryRepo, {
    tableId: tableId,
    tableName: tableName,
    itemId: itemId,
    transactionType: 'add',
    quantityChange: qtyValue,
    newData: itemData,
    createdBy: createdBy
  })
}