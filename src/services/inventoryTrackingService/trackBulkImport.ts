/**
 * Track bulk import of items
 */

import { InventoryRepository } from '@/repositories/inventoryRepository.js'
import { logInventoryTransaction } from './logInventoryTransaction.js'
import { extractQuantity } from './utils.js'

export async function trackBulkImport(
  inventoryRepo: InventoryRepository,
  tableId: string,
  tableName: string,
  importedRows: any[],
  createdBy: string,
  importMode: 'add' | 'replace' = 'add'
): Promise<void> {
  // If replace mode, log the clearing
  if (importMode === 'replace') {
    await logInventoryTransaction(inventoryRepo, {
      tableId: tableId,
      tableName: tableName,
      itemId: 'bulk-clear',
      transactionType: 'remove',
      quantityChange: 0,
      previousData: { action: 'tableCleared', mode: 'replace' },
      createdBy: createdBy
    })
  }

  // Log each imported item
  for (const row of importedRows) {
    const qtyValue = extractQuantity(row)

    await logInventoryTransaction(inventoryRepo, {
      tableId: tableId,
      tableName: tableName,
      itemId: `import-${crypto.randomUUID()}`, // Use a unique ID for bulk imports
      transactionType: 'add',
      quantityChange: qtyValue,
      newData: row,
      createdBy: createdBy
    })
  }
}