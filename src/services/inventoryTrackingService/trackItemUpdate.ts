/**
 * Track item update
 */

import { InventoryRepository } from '@/repositories/inventoryRepository.js'
import { logInventoryTransaction } from './logInventoryTransaction.js'
import { extractQuantity } from './utils.js'

export async function trackItemUpdate(
  inventoryRepo: InventoryRepository,
  tableId: string,
  tableName: string,
  itemId: string,
  previousData: any,
  newData: any,
  createdBy: string
): Promise<void> {
  const previousQty = extractQuantity(previousData)
  const newQty = extractQuantity(newData)
  const quantityChange = (newQty || 0) - (previousQty || 0)

  // Determine transaction type based on changes
  let transactionType: 'update' | 'adjust' = 'update'

  // If only quantity changed, it's an adjustment
  const otherFieldsChanged = Object.keys(newData).some(key => {
    if (key === 'qty') return false
    return JSON.stringify(previousData[key]) !== JSON.stringify(newData[key])
  })

  if (!otherFieldsChanged && quantityChange !== 0) {
    transactionType = 'adjust'
  }

  await logInventoryTransaction(inventoryRepo, {
    tableId: tableId,
    tableName: tableName,
    itemId: itemId,
    transactionType: transactionType,
    quantityChange: quantityChange !== 0 ? quantityChange : undefined,
    previousData: previousData,
    newData: newData,
    createdBy: createdBy
  })
}