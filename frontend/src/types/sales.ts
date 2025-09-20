// Sales Tracking Frontend Types
// Frontend types for sales management and analytics

/**
 * Sales transaction status options
 */
export type SaleStatus = 'pending' | 'completed' | 'cancelled' | 'refunded'

/**
 * Sales transaction record (frontend representation)
 */
export interface Sale {
  id: string
  sale_number: string // Format: SALE-YYYY-NNN
  table_id: string
  table_name: string
  item_id: string
  item_snapshot: ItemSnapshot
  customer_id: string
  quantity_sold: number
  unit_price: number
  total_amount: number
  sale_status: SaleStatus
  payment_method: string | null
  notes: string | null
  created_at: string // ISO date string
  updated_at: string // ISO date string
}

/**
 * Item snapshot data structure (from sale)
 */
export interface ItemSnapshot {
  [columnName: string]: any
  name?: string
  price?: number
  qty?: number
}

/**
 * Create sale request payload
 */
export interface CreateSaleRequest {
  table_id: string
  item_id: string
  customer_id: string
  quantity_sold?: number
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
  date_from?: string // YYYY-MM-DD
  date_to?: string // YYYY-MM-DD
  search?: string
  sort_by?: 'created_at' | 'updated_at' | 'total_amount' | 'sale_number'
  sort_order?: 'asc' | 'desc'
}

/**
 * Sales analytics data (frontend representation)
 */
export interface SalesAnalytics {
  total_sales: number
  total_revenue: number
  total_items_sold: number
  average_sale_amount: number
  sales_by_status: Record<SaleStatus, number>
  revenue_by_status: Record<SaleStatus, number>
  top_selling_items: TopSellingItem[]
  sales_by_date: SalesByDate[]
}

/**
 * Top selling item data
 */
export interface TopSellingItem {
  item_id: string
  table_name: string
  item_name: string
  quantity_sold: number
  total_revenue: number
}

/**
 * Sales by date data point
 */
export interface SalesByDate {
  date: string // YYYY-MM-DD
  sales_count: number
  revenue: number
}

/**
 * Sales summary for dashboard
 */
export interface SalesSummary {
  today: PeriodSummary
  this_week: PeriodSummary
  this_month: PeriodSummary
  all_time: AllTimeSummary
  top_selling_items: TopSellingItem[]
  recent_sales_by_date: SalesByDate[]
}

/**
 * Period summary data
 */
export interface PeriodSummary {
  total_sales: number
  total_revenue: number
  total_items_sold: number
}

/**
 * All-time summary data
 */
export interface AllTimeSummary extends PeriodSummary {
  average_sale_amount: number
}

/**
 * Sale status display configuration
 */
export const SALE_STATUS_CONFIG: Record<SaleStatus, {
  label: string
  className: string
  badgeClass: string
}> = {
  pending: {
    label: 'Pending',
    className: 'text-warning',
    badgeClass: 'badge-warning'
  },
  completed: {
    label: 'Completed',
    className: 'text-success',
    badgeClass: 'badge-success'
  },
  cancelled: {
    label: 'Cancelled',
    className: 'text-error',
    badgeClass: 'badge-error'
  },
  refunded: {
    label: 'Refunded',
    className: 'text-info',
    badgeClass: 'badge-info'
  }
}

/**
 * Payment method options for UI
 */
export const PAYMENT_METHODS = [
  'cash',
  'credit_card',
  'debit_card',
  'paypal',
  'stripe',
  'bank_transfer',
  'other'
] as const

export type PaymentMethod = typeof PAYMENT_METHODS[number]

/**
 * Payment method display labels
 */
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  credit_card: 'Credit Card',
  debit_card: 'Debit Card',
  paypal: 'PayPal',
  stripe: 'Stripe',
  bank_transfer: 'Bank Transfer',
  other: 'Other'
}

/**
 * Chart data point for sales visualization
 */
export interface ChartDataPoint {
  x: string | number
  y: number
  label?: string
}

/**
 * Chart configuration for sales analytics
 */
export interface SalesChartConfig {
  type: 'line' | 'bar' | 'pie' | 'doughnut'
  data: ChartDataPoint[]
  labels?: string[]
  title?: string
  color?: string
  colors?: string[]
}