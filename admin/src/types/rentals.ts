// Rental Tracking Frontend Types
// Frontend types for rental management and analytics

/**
 * Rental transaction status options
 */
export type RentalStatus = 'active' | 'released' | 'cancelled'

/**
 * Rental transaction record (frontend representation)
 */
export interface Rental {
  id: string
  rentalNumber: string // Format: RENT-YYYY-NNN
  tableId: string
  tableName: string
  itemId: string
  itemSnapshot: RentalItemSnapshot
  customerId: string
  unitPrice: number
  rentalStatus: RentalStatus
  rentedAt: string // ISO date string
  releasedAt: string | null // ISO date string
  notes: string | null
  createdAt: string // ISO date string
  updatedAt: string // ISO date string
}

/**
 * Item snapshot data structure (from rental)
 */
export interface RentalItemSnapshot {
  [columnName: string]: any
  name?: string
  price?: number
  used?: boolean
  available?: boolean
}

/**
 * Create rental request payload
 */
export interface CreateRentalRequest {
  tableId: string
  itemId: string
  customerId: string
  notes?: string
}

/**
 * Release rental request payload
 */
export interface ReleaseRentalRequest {
  rentalId?: string
  itemId?: string
  tableId?: string
  notes?: string
}

/**
 * Update rental request payload (Admin only)
 */
export interface UpdateRentalRequest {
  rentalStatus?: RentalStatus
  notes?: string
}

/**
 * Rental list query parameters
 */
export interface RentalListQuery {
  page?: number
  limit?: number
  tableId?: string
  customerId?: string
  rentalStatus?: RentalStatus
  dateFrom?: string // YYYY-MM-DD
  dateTo?: string // YYYY-MM-DD
  search?: string
  sortBy?: 'rentedAt' | 'releasedAt' | 'createdAt' | 'updatedAt' | 'unitPrice' | 'rentalNumber'
  sortOrder?: 'asc' | 'desc'
}

/**
 * Rental analytics data (frontend representation)
 */
export interface RentalAnalytics {
  totalRentals: number
  activeRentals: number
  releasedRentals: number
  cancelledRentals: number
  totalRevenue: number
  averageRentalPrice: number
  rentalsByStatus: Record<RentalStatus, number>
  revenueByStatus: Record<RentalStatus, number>
  topRentedItems: TopRentedItem[]
  rentalsByDate: RentalsByDate[]
}

/**
 * Top rented item data
 */
export interface TopRentedItem {
  itemId: string
  tableName: string
  itemName: string
  rentalCount: number
  totalRevenue: number
}

/**
 * Rentals by date data point
 */
export interface RentalsByDate {
  date: string // YYYY-MM-DD
  rentalsCount: number
  releasesCount: number
  revenue: number
}

/**
 * Rental status display configuration
 */
export const RENTAL_STATUS_CONFIG: Record<RentalStatus, {
  label: string
  className: string
  badgeClass: string
}> = {
  active: {
    label: 'Active',
    className: 'text-success',
    badgeClass: 'badge-success'
  },
  released: {
    label: 'Released',
    className: 'text-secondary',
    badgeClass: 'badge-secondary'
  },
  cancelled: {
    label: 'Cancelled',
    className: 'text-error',
    badgeClass: 'badge-error'
  }
}

/**
 * Unified transaction type for combined sales/rentals view
 */
export type TransactionType = 'sale' | 'rental'

/**
 * Event type for rentals (rent vs release)
 */
export type RentalEventType = 'rent' | 'release'

/**
 * Unified transaction record combining sales and rentals
 */
export interface UnifiedTransaction {
  id: string
  transactionNumber: string // saleNumber or rentalNumber
  transactionType: TransactionType
  eventType?: RentalEventType // 'rent' or 'release' for rentals
  tableId: string
  tableName: string
  itemId: string
  itemName: string
  itemSnapshot?: Record<string, any> // Full item data for display
  customerId: string
  unitPrice: number
  quantity: number // quantitySold for sales, 1 for rentals
  totalAmount: number
  status: string // saleStatus or rentalStatus
  paymentMethod?: string | null
  notes: string | null
  transactionDate: string // createdAt for sales, rentedAt for rentals
  releasedAt?: string | null // only for rentals
  relatedTransactionId?: string // For linking rent/release events
  createdAt: string
  updatedAt: string
}
