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
  saleNumber: string // Format: SALE-YYYY-NNN
  tableId: string
  tableName: string
  itemId: string
  itemSnapshot: ItemSnapshot
  customerId: string
  quantitySold: number
  unitPrice: number
  totalAmount: number
  saleStatus: SaleStatus
  paymentMethod: string | null
  notes: string | null
  createdAt: string // ISO date string
  updatedAt: string // ISO date string
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
  tableId: string
  itemId: string
  customerId: string
  quantitySold?: number
  paymentMethod?: string
  notes?: string
}

/**
 * Update sale request payload (Admin only)
 */
export interface UpdateSaleRequest {
  saleStatus?: SaleStatus
  paymentMethod?: string
  notes?: string
}

/**
 * Sale list query parameters
 */
export interface SaleListQuery {
  page?: number
  limit?: number
  tableId?: string
  customerId?: string
  saleStatus?: SaleStatus
  dateFrom?: string // YYYY-MM-DD
  dateTo?: string // YYYY-MM-DD
  search?: string
  sortBy?: 'createdAt' | 'updatedAt' | 'totalAmount' | 'saleNumber'
  sortOrder?: 'asc' | 'desc'
}

/**
 * Sales analytics data (frontend representation)
 */
export interface SalesAnalytics {
  totalSales: number
  totalRevenue: number
  totalItemsSold: number
  averageSaleAmount: number
  salesByStatus: Record<SaleStatus, number>
  revenueByStatus: Record<SaleStatus, number>
  topSellingItems: TopSellingItem[]
  salesByDate: SalesByDate[]
}

/**
 * Top selling item data
 */
export interface TopSellingItem {
  itemId: string
  tableName: string
  itemName: string
  quantitySold: number
  totalRevenue: number
}

/**
 * Sales by date data point
 */
export interface SalesByDate {
  date: string // YYYY-MM-DD
  salesCount: number
  revenue: number
}

/**
 * Sales summary for dashboard
 */
export interface SalesSummary {
  today: PeriodSummary
  thisWeek: PeriodSummary
  thisMonth: PeriodSummary
  allTime: AllTimeSummary
  topSellingItems: TopSellingItem[]
  recentSalesByDate: SalesByDate[]
}

/**
 * Period summary data
 */
export interface PeriodSummary {
  totalSales: number
  totalRevenue: number
  totalItemsSold: number
}

/**
 * All-time summary data
 */
export interface AllTimeSummary extends PeriodSummary {
  averageSaleAmount: number
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
  'creditCard',
  'debitCard',
  'paypal',
  'stripe',
  'bankTransfer',
  'other'
] as const

export type PaymentMethod = typeof PAYMENT_METHODS[number]

/**
 * Payment method display labels
 */
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  creditCard: 'Credit Card',
  debitCard: 'Debit Card',
  paypal: 'PayPal',
  stripe: 'Stripe',
  bankTransfer: 'Bank Transfer',
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