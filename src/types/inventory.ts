// Inventory Tracking System Types
// Based on migration 009_sales_tracking.sql schema

/**
 * Inventory transaction types
 */
export type InventoryTransactionType = 'sale' | 'add' | 'remove' | 'update' | 'adjust'

/**
 * Inventory transaction record
 * Corresponds to inventory_transactions table
 */
export interface InventoryTransaction {
  id: string
  table_id: string // Reference to source table (no FK constraint)
  table_name: string // Snapshot of table name
  item_id: string // Reference to source item (no FK constraint)
  transaction_type: InventoryTransactionType
  quantity_change: number | null // +/- values for sales/adjustments
  previous_data: string | null // Previous item state JSON
  new_data: string | null // New item state JSON
  reference_id: string | null // sale_id for sales, null for other changes
  created_by: string // User email or system identifier
  created_at: Date
}

/**
 * Parsed inventory transaction data
 */
export interface ParsedInventoryData {
  [columnName: string]: any
  price?: number
  qty?: number
}

/**
 * Inventory transaction with parsed data
 */
export interface InventoryTransactionWithData extends Omit<InventoryTransaction, 'previous_data' | 'new_data'> {
  previous_data: ParsedInventoryData | null
  new_data: ParsedInventoryData | null
}

/**
 * Create inventory transaction request
 */
export interface CreateInventoryTransactionRequest {
  table_id: string
  table_name: string
  item_id: string
  transaction_type: InventoryTransactionType
  quantity_change?: number
  previous_data?: ParsedInventoryData
  new_data?: ParsedInventoryData
  reference_id?: string // For linking to sales
  created_by: string
}

/**
 * Inventory transaction list query parameters
 */
export interface InventoryTransactionListQuery {
  page?: number
  limit?: number
  table_id?: string
  item_id?: string
  transaction_type?: InventoryTransactionType
  created_by?: string
  date_from?: string // ISO date string
  date_to?: string // ISO date string
  reference_id?: string // Filter by sale ID
  sort_by?: 'created_at' | 'transaction_type' | 'quantity_change'
  sort_order?: 'asc' | 'desc'
}

/**
 * Inventory transaction list response
 */
export interface InventoryTransactionListResponse {
  data: InventoryTransactionWithData[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * Inventory analytics data
 */
export interface InventoryAnalytics {
  total_transactions: number
  transactions_by_type: Record<InventoryTransactionType, number>
  quantity_changes_by_type: Record<InventoryTransactionType, number>
  most_active_tables: Array<{
    table_id: string
    table_name: string
    transaction_count: number
  }>
  most_active_items: Array<{
    item_id: string
    table_name: string
    item_name: string // From item data
    transaction_count: number
  }>
  activity_by_date: Array<{
    date: string // YYYY-MM-DD
    transaction_count: number
    quantity_change: number
  }>
}

/**
 * Inventory summary for a specific item
 */
export interface ItemInventorySummary {
  item_id: string
  table_id: string
  table_name: string
  current_quantity: number
  total_added: number
  total_removed: number
  total_sold: number
  total_adjustments: number
  last_transaction_date: Date
  transaction_count: number
}

/**
 * Inventory summary for a specific table
 */
export interface TableInventorySummary {
  table_id: string
  table_name: string
  total_items: number
  total_quantity: number
  total_transactions: number
  items: ItemInventorySummary[]
}

/**
 * Bulk inventory adjustment request
 */
export interface BulkInventoryAdjustmentRequest {
  adjustments: Array<{
    table_id: string
    item_id: string
    quantity_change: number
    reason?: string
  }>
  created_by: string
}

/**
 * Inventory adjustment result
 */
export interface InventoryAdjustmentResult {
  success: boolean
  processed_count: number
  errors: Array<{
    item_id: string
    error: string
  }>
  transaction_ids: string[]
}

/**
 * Inventory alert thresholds
 */
export interface InventoryAlert {
  item_id: string
  table_id: string
  table_name: string
  item_name: string
  current_quantity: number
  threshold: number
  alert_type: 'low_stock' | 'out_of_stock' | 'negative_stock'
}

/**
 * Stock level check request
 */
export interface StockLevelCheckRequest {
  table_id?: string // Check specific table or all tables
  low_stock_threshold?: number // Default: 5
}

/**
 * Stock level check response
 */
export interface StockLevelCheckResponse {
  alerts: InventoryAlert[]
  total_items_checked: number
  low_stock_count: number
  out_of_stock_count: number
  negative_stock_count: number
}

/**
 * Helper function to calculate quantity change description
 */
export function getQuantityChangeDescription(transaction: InventoryTransaction): string {
  const change = transaction.quantity_change
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
    case 'add': return 'Added'
    case 'remove': return 'Removed'
    case 'update': return 'Updated'
    case 'adjust': return 'Adjustment'
    default: return type
  }
}