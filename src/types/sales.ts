// Sales Tracking System Types
// Based on migration 009_sales_tracking.sql schema

/**
 * Sales transaction status options
 */
export type SaleStatus = 'pending' | 'completed' | 'cancelled' | 'refunded'

/**
 * Sales transaction record
 * Corresponds to sales table
 */
export interface Sale {
  id: string
  sale_number: string // Format: SALE-YYYY-NNN
  table_id: string // Reference to source table (no FK constraint)
  table_name: string // Snapshot of table name
  item_id: string // Reference to source item (no FK constraint)
  item_snapshot: string // Complete item JSON at time of sale
  customer_id: string // External customer identifier
  quantity_sold: number
  unit_price: number // Decimal(10,2)
  total_amount: number // Decimal(10,2)
  sale_status: SaleStatus
  payment_method: string | null
  notes: string | null
  created_at: Date
  updated_at: Date
}

/**
 * Parsed item snapshot data structure
 */
export interface ItemSnapshot {
  [columnName: string]: any
  price?: number // Should exist in for_sale items
  qty?: number // Should exist in for_sale items
}

/**
 * Sale with parsed item snapshot
 */
export interface SaleWithSnapshot extends Omit<Sale, 'item_snapshot'> {
  item_snapshot: ItemSnapshot
}

/**
 * Create sale request payload (API endpoint)
 */
export interface CreateSaleRequest {
  table_id: string
  item_id: string
  customer_id: string
  quantity_sold?: number // Defaults to 1
  payment_method?: string
  notes?: string
}

/**
 * Update sale request payload (Admin only)
 */
export interface UpdateSaleRequest {
  sale_status?: SaleStatus
  payment_method?: string
  notes?: string
  // Note: Cannot update financial or item data for audit compliance
}

/**
 * Sale list query parameters
 */
export interface SaleListQuery {
  page?: number
  limit?: number
  table_id?: string
  customer_id?: string
  sale_status?: SaleStatus
  date_from?: string // ISO date string
  date_to?: string // ISO date string
  search?: string // Search in sale_number, customer_id, notes
  sort_by?: 'created_at' | 'updated_at' | 'total_amount' | 'sale_number'
  sort_order?: 'asc' | 'desc'
}

/**
 * Sale list response
 */
export interface SaleListResponse {
  data: SaleWithSnapshot[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * Sales analytics data
 */
export interface SalesAnalytics {
  total_sales: number
  total_revenue: number
  total_items_sold: number
  average_sale_amount: number
  sales_by_status: Record<SaleStatus, number>
  revenue_by_status: Record<SaleStatus, number>
  top_selling_items: Array<{
    item_id: string
    table_name: string
    item_name: string // From item snapshot
    quantity_sold: number
    total_revenue: number
  }>
  sales_by_date: Array<{
    date: string // YYYY-MM-DD
    sales_count: number
    revenue: number
  }>
}

/**
 * Sale number generation helper
 */
export interface SaleNumberGenerator {
  year: number
  sequence: number
  sale_number: string
}

/**
 * Sale validation result
 */
export interface SaleValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Refund request payload
 */
export interface RefundSaleRequest {
  reason?: string
  partial_amount?: number // For partial refunds
}

/**
 * Sale export options
 */
export interface SaleExportOptions {
  format: 'csv' | 'xlsx' | 'json'
  date_from?: string
  date_to?: string
  table_id?: string
  sale_status?: SaleStatus[]
  include_item_details: boolean
}

/**
 * Inventory item availability check
 */
export interface ItemAvailability {
  available: boolean
  current_quantity: number
  requested_quantity: number
  shortage?: number
}

/**
 * Generate sale number helper function
 */
export function generateSaleNumber(year: number, sequence: number): string {
  return `SALE-${year}-${sequence.toString().padStart(3, '0')}`
}

/**
 * Parse sale number helper function
 */
export function parseSaleNumber(saleNumber: string): SaleNumberGenerator | null {
  const match = saleNumber.match(/^SALE-(\d{4})-(\d{3})$/)
  if (!match || !match[1] || !match[2]) return null

  const year = parseInt(match[1])
  const sequence = parseInt(match[2])

  return {
    year,
    sequence,
    sale_number: saleNumber
  }
}