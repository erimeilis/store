// Inventory Tracking System Types
// Based on migration 009_sales_tracking.sql schema

/**
 * Inventory transaction types
 */
export type InventoryTransactionType = 'sale' | 'rent' | 'release' | 'add' | 'remove' | 'update' | 'adjust'

/**
 * Inventory transaction record
 * Corresponds to inventory_transactions table
 */
export interface InventoryTransaction {
  id: string
  tableId: string // Reference to source table (no FK constraint)
  tableName: string // Snapshot of table name
  itemId: string // Reference to source item (no FK constraint)
  transactionType: InventoryTransactionType
  quantityChange: number | null // +/- values for sales/adjustments
  previousData: string | null // Previous item state JSON
  newData: string | null // New item state JSON
  referenceId: string | null // sale_id for sales, null for other changes
  createdBy: string // User email or system identifier
  createdAt: Date
}

/**
 * Parsed inventory transaction data
 */
export interface ParsedInventoryData {
  [columnName: string]: any
  price?: number
  qty?: number
  // Rental-specific fields
  used?: boolean
  available?: boolean
}

/**
 * Inventory transaction with parsed data
 */
export interface InventoryTransactionWithData extends Omit<InventoryTransaction, 'previousData' | 'newData'> {
  previousData: ParsedInventoryData | null
  newData: ParsedInventoryData | null
}

/**
 * Create inventory transaction request
 */
export interface CreateInventoryTransactionRequest {
  tableId: string
  tableName: string
  itemId: string
  transactionType: InventoryTransactionType
  quantityChange?: number
  previousData?: ParsedInventoryData
  newData?: ParsedInventoryData
  referenceId?: string // For linking to sales
  createdBy: string
}

/**
 * Inventory transaction list query parameters
 */
export interface InventoryTransactionListQuery {
  page?: number
  limit?: number
  tableId?: string
  itemId?: string
  transactionType?: InventoryTransactionType
  createdBy?: string
  dateFrom?: string // ISO date string
  dateTo?: string // ISO date string
  referenceId?: string // Filter by sale ID
  // Text search parameters
  tableNameSearch?: string // Search in table names
  itemSearch?: string // Search in item data (names, descriptions, etc.)
  quantityChange?: string // Filter by quantity change value
  sortBy?: 'createdAt' | 'transactionType' | 'quantityChange'
  sortOrder?: 'asc' | 'desc'
}

/**
 * Inventory transaction list response
 */
export interface InventoryTransactionListResponse {
  data: InventoryTransactionWithData[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

/**
 * Inventory analytics data
 */
export interface InventoryAnalytics {
  totalTransactions: number
  transactionsByType: Record<InventoryTransactionType, number>
  quantityChangesByType: Record<InventoryTransactionType, number>
  mostActiveTables: Array<{
    tableId: string
    tableName: string
    transactionCount: number
  }>
  mostActiveItems: Array<{
    itemId: string
    tableName: string
    itemName: string // From item data
    transactionCount: number
  }>
  activityByDate: Array<{
    date: string // YYYY-MM-DD
    transactionCount: number
    quantityChange: number
  }>
}

/**
 * Inventory summary for a specific item
 */
export interface ItemInventorySummary {
  itemId: string
  tableId: string
  tableName: string
  currentQuantity: number
  totalAdded: number
  totalRemoved: number
  totalSold: number
  totalAdjustments: number
  lastTransactionDate: Date
  transactionCount: number
}

/**
 * Inventory summary for a specific table
 */
export interface TableInventorySummary {
  tableId: string
  tableName: string
  totalItems: number
  totalQuantity: number
  totalTransactions: number
  items: ItemInventorySummary[]
}

/**
 * Bulk inventory adjustment request
 */
export interface BulkInventoryAdjustmentRequest {
  adjustments: Array<{
    tableId: string
    itemId: string
    quantityChange: number
    reason?: string
  }>
  createdBy: string
}

/**
 * Inventory adjustment result
 */
export interface InventoryAdjustmentResult {
  success: boolean
  processedCount: number
  errors: Array<{
    itemId: string
    error: string
  }>
  transactionIds: string[]
}

/**
 * Inventory alert thresholds
 */
export interface InventoryAlert {
  itemId: string
  tableId: string
  tableName: string
  itemName: string
  currentQuantity: number
  threshold: number
  alertType: 'low_stock' | 'out_of_stock' | 'negative_stock'
}

/**
 * Stock level check request
 */
export interface StockLevelCheckRequest {
  tableId?: string // Check specific table or all tables
  lowStockThreshold?: number // Default: 5
}

/**
 * Stock level check response
 */
export interface StockLevelCheckResponse {
  alerts: InventoryAlert[]
  totalItemsChecked: number
  lowStockCount: number
  outOfStockCount: number
  negativeStockCount: number
}

/**
 * Helper function to calculate quantity change description
 */
export function getQuantityChangeDescription(transaction: InventoryTransaction): string {
  const change = transaction.quantityChange
  if (change === null) return 'No quantity change'
  if (change > 0) return `+${change}`
  if (change < 0) return `${change}`
  return '0'
}

/**
 * Helper function to get transaction type display name
 */
export function getTransactionTypeDisplayName(type: InventoryTransactionType): string {
  switch (type) {
    case 'sale': return 'Sale'
    case 'rent': return 'Rented'
    case 'release': return 'Released'
    case 'add': return 'Added'
    case 'remove': return 'Removed'
    case 'update': return 'Updated'
    case 'adjust': return 'Adjustment'
    default: return type
  }
}