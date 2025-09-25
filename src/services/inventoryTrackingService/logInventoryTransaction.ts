/**
 * Log an inventory transaction using InventoryRepository
 */

import { InventoryRepository } from '@/repositories/inventoryRepository.js'
import type {
  CreateInventoryTransactionRequest,
  InventoryTransactionType,
  ParsedInventoryData
} from '@/types/inventory.js'

export interface InventoryTransactionData {
  tableId: string
  tableName: string
  itemId: string
  transactionType: InventoryTransactionType
  quantityChange?: number | undefined
  previousData?: ParsedInventoryData
  newData?: ParsedInventoryData
  referenceId?: string | undefined
  createdBy: string
}

export async function logInventoryTransaction(
  inventoryRepo: InventoryRepository,
  data: InventoryTransactionData
): Promise<void> {
  try {
    const request: CreateInventoryTransactionRequest = {
      tableId: data.tableId,
      tableName: data.tableName,
      itemId: data.itemId,
      transactionType: data.transactionType,
      createdBy: data.createdBy
    }

    // Only add optional fields if they have values
    if (data.quantityChange !== undefined) {
      request.quantityChange = data.quantityChange
    }
    if (data.previousData !== undefined) {
      request.previousData = data.previousData
    }
    if (data.newData !== undefined) {
      request.newData = data.newData
    }
    if (data.referenceId !== undefined) {
      request.referenceId = data.referenceId
    }

    await inventoryRepo.createTransaction(request)

    console.log('📦 Inventory tracked:', {
      type: data.transactionType,
      table: data.tableName,
      item: data.itemId.substring(0, 8),
      qtyChange: data.quantityChange
    })
  } catch (error) {
    console.error('❌ Failed to log inventory transaction:', error)
    // Don't throw - inventory tracking shouldn't break the main operation
  }
}