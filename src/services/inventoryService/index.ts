import type { Context } from 'hono'
import type { Bindings } from '@/types/bindings.js'
import type { UserContext } from '@/types/database.js'
import type {
  InventoryTransactionListQuery,
  StockLevelCheckRequest,
  ParsedInventoryData
} from '@/types/inventory.js'

// Import all the functions
import {
  trackInventoryChange,
  trackItemAdded,
  trackItemRemoved,
  trackItemUpdated,
  trackInventoryAdjustment,
  trackSale
} from './trackInventoryChange.js'
import {
  getInventoryTransactions,
  getInventoryAnalytics,
  getItemInventorySummary,
  getTableInventorySummary,
  checkStockLevels,
  getTransactionsBySale
} from './getTransactions.js'

/**
 * Inventory service - facade for inventory tracking operations
 * Maintains the same interface while delegating to focused, single-purpose functions
 */
export class InventoryService {
  private env: Bindings

  constructor(env: Bindings) {
    this.env = env
  }

  // Transaction retrieval operations
  async getInventoryTransactions(c: Context, user: UserContext, query: InventoryTransactionListQuery) {
    return getInventoryTransactions(this.env, c, user, query)
  }

  async getInventoryAnalytics(
    c: Context,
    user: UserContext,
    dateFrom?: string,
    dateTo?: string,
    tableId?: string
  ) {
    return getInventoryAnalytics(this.env, c, user, dateFrom, dateTo, tableId)
  }

  async getItemInventorySummary(c: Context, user: UserContext, tableId: string, itemId: string) {
    return getItemInventorySummary(this.env, c, user, tableId, itemId)
  }

  async getTableInventorySummary(c: Context, user: UserContext, tableId: string) {
    return getTableInventorySummary(this.env, c, user, tableId)
  }

  async checkStockLevels(c: Context, user: UserContext, request: StockLevelCheckRequest) {
    return checkStockLevels(this.env, c, user, request)
  }

  async getTransactionsBySale(c: Context, user: UserContext, saleId: string) {
    return getTransactionsBySale(this.env, c, user, saleId)
  }

  // Inventory tracking operations (used internally by other services)
  async trackItemAdded(
    tableId: string,
    tableName: string,
    itemId: string,
    itemData: ParsedInventoryData,
    createdBy: string
  ) {
    return trackItemAdded(this.env, tableId, tableName, itemId, itemData, createdBy)
  }

  async trackItemRemoved(
    tableId: string,
    tableName: string,
    itemId: string,
    itemData: ParsedInventoryData,
    createdBy: string
  ) {
    return trackItemRemoved(this.env, tableId, tableName, itemId, itemData, createdBy)
  }

  async trackItemUpdated(
    tableId: string,
    tableName: string,
    itemId: string,
    previousData: ParsedInventoryData,
    newData: ParsedInventoryData,
    createdBy: string
  ) {
    return trackItemUpdated(this.env, tableId, tableName, itemId, previousData, newData, createdBy)
  }

  async trackInventoryAdjustment(
    tableId: string,
    tableName: string,
    itemId: string,
    quantityChange: number,
    previousData: ParsedInventoryData,
    newData: ParsedInventoryData,
    createdBy: string,
    reason?: string
  ) {
    return trackInventoryAdjustment(
      this.env,
      tableId,
      tableName,
      itemId,
      quantityChange,
      previousData,
      newData,
      createdBy,
      reason
    )
  }

  async trackSale(
    tableId: string,
    tableName: string,
    itemId: string,
    quantitySold: number,
    previousData: ParsedInventoryData,
    newData: ParsedInventoryData,
    saleId: string,
    createdBy: string
  ) {
    return trackSale(
      this.env,
      tableId,
      tableName,
      itemId,
      quantitySold,
      previousData,
      newData,
      saleId,
      createdBy
    )
  }
}