/**
 * Track item deletion
 */

import { InventoryRepository } from '@/repositories/inventoryRepository.js'
import { logInventoryTransaction } from './logInventoryTransaction.js'
import { extractQuantity } from './utils.js'

export async function trackItemDeletion(
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
    transactionType: 'remove',
    quantityChange: qtyValue ? -qtyValue : undefined,
    previousData: itemData,
    createdBy: createdBy
  })
}