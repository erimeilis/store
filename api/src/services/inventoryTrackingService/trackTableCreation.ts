/**
 * Track table creation for forSale tables
 */

import { InventoryRepository } from '@/repositories/inventoryRepository.js'
import { logInventoryTransaction } from './logInventoryTransaction.js'

export async function trackTableCreation(
  inventoryRepo: InventoryRepository,
  tableId: string,
  tableName: string,
  createdBy: string
): Promise<void> {
  await logInventoryTransaction(inventoryRepo, {
    tableId: tableId,
    tableName: tableName,
    itemId: 'table-creation',
    transactionType: 'add',
    quantityChange: 0,
    newData: { action: 'tableCreated', tableType: 'sale' },
    createdBy: createdBy
  })
}