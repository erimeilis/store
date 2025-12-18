/**
 * Refactored Inventory Tracking Service
 * Handles automatic tracking of inventory changes for "for sale" tables
 * This class serves as a facade that maintains the same interface while
 * delegating all operations to focused, single-purpose functions.
 */

import type { Bindings } from '@/types/bindings.js'
import { InventoryRepository } from '@/repositories/inventoryRepository.js'

// Import all the functions
import { logInventoryTransaction, type InventoryTransactionData } from './logInventoryTransaction.js'
import { trackTableCreation } from './trackTableCreation.js'
import { trackBulkImport } from './trackBulkImport.js'
import { trackItemCreation } from './trackItemCreation.js'
import { trackItemUpdate } from './trackItemUpdate.js'
import { trackItemDeletion } from './trackItemDeletion.js'
import { isForSaleTable, getTableName } from './tableHelpers.js'

// Re-export the interface for backward compatibility
export type { InventoryTransactionData }

export class InventoryTrackingService {
  private inventoryRepo: InventoryRepository

  constructor(private env: Bindings) {
    this.inventoryRepo = new InventoryRepository(env)
  }

  /**
   * Log an inventory transaction using InventoryRepository
   */
  async logInventoryTransaction(data: InventoryTransactionData): Promise<void> {
    return logInventoryTransaction(this.inventoryRepo, data)
  }

  /**
   * Track table creation for for_sale tables
   */
  async trackTableCreation(
    tableId: string,
    tableName: string,
    createdBy: string
  ): Promise<void> {
    return trackTableCreation(this.inventoryRepo, tableId, tableName, createdBy)
  }

  /**
   * Track bulk import of items
   */
  async trackBulkImport(
    tableId: string,
    tableName: string,
    importedRows: any[],
    createdBy: string,
    importMode: 'add' | 'replace' = 'add'
  ): Promise<void> {
    return trackBulkImport(this.inventoryRepo, tableId, tableName, importedRows, createdBy, importMode)
  }

  /**
   * Track item creation
   */
  async trackItemCreation(
    tableId: string,
    tableName: string,
    itemId: string,
    itemData: any,
    createdBy: string
  ): Promise<void> {
    return trackItemCreation(this.inventoryRepo, tableId, tableName, itemId, itemData, createdBy)
  }

  /**
   * Track item update
   */
  async trackItemUpdate(
    tableId: string,
    tableName: string,
    itemId: string,
    previousData: any,
    newData: any,
    createdBy: string
  ): Promise<void> {
    return trackItemUpdate(this.inventoryRepo, tableId, tableName, itemId, previousData, newData, createdBy)
  }

  /**
   * Track item deletion
   */
  async trackItemDeletion(
    tableId: string,
    tableName: string,
    itemId: string,
    itemData: any,
    createdBy: string
  ): Promise<void> {
    return trackItemDeletion(this.inventoryRepo, tableId, tableName, itemId, itemData, createdBy)
  }

  /**
   * Check if a table is a "for sale" table that requires inventory tracking
   */
  async isForSaleTable(tableId: string): Promise<boolean> {
    return isForSaleTable(this.env, tableId)
  }

  /**
   * Get table name for inventory tracking
   */
  async getTableName(tableId: string): Promise<string> {
    return getTableName(this.env, tableId)
  }
}