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
    saleNumber: string // Format: SALE-YYYY-NNN
    tableId: string // Reference to source table (no FK constraint)
    tableName: string // Snapshot of table name
    itemId: string // Reference to source item (no FK constraint)
    itemSnapshot: string // Complete item JSON at time of sale
    customerId: string // External customer identifier
    quantitySold: number
    unitPrice: number // Decimal(10,2)
    totalAmount: number // Decimal(10,2)
    saleStatus: SaleStatus
    paymentMethod: string | null
    notes: string | null
    createdAt: Date
    updatedAt: Date
}

/**
 * Parsed item snapshot data structure
 */
export interface ItemSnapshot {
    price?: number // Should exist in for_sale items
    qty?: number // Should exist in for_sale items

    [columnName: string]: any
}

/**
 * Sale with parsed item snapshot
 */
export interface SaleWithSnapshot extends Omit<Sale, 'itemSnapshot'> {
    itemSnapshot: ItemSnapshot
}

/**
 * Create sale request payload (API endpoint)
 */
export interface CreateSaleRequest {
    tableId: string
    itemId: string
    customerId: string
    quantitySold?: number // Defaults to 1
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
    // Note: Cannot update financial or item data for audit compliance
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
    dateFrom?: string // ISO date string
    dateTo?: string // ISO date string
    search?: string // Search in saleNumber, customerId, notes
    sortBy?: 'createdAt' | 'updatedAt' | 'totalAmount' | 'saleNumber'
    sortOrder?: 'asc' | 'desc'
}

/**
 * Sale list response
 */
export interface SaleListResponse {
    data: SaleWithSnapshot[]
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
 * Sales analytics data
 */
export interface SalesAnalytics {
    totalSales: number
    totalRevenue: number
    totalItemsSold: number
    averageSaleAmount: number
    salesByStatus: Record<SaleStatus, number>
    revenueByStatus: Record<SaleStatus, number>
    topSellingItems: Array<{
        itemId: string
        tableName: string
        itemName: string // From item snapshot
        quantitySold: number
        totalRevenue: number
    }>
    salesByDate: Array<{
        date: string // YYYY-MM-DD
        salesCount: number
        revenue: number
    }>
}

/**
 * Sale number generation helper
 */
export interface SaleNumberGenerator {
    year: number
    sequence: number
    saleNumber: string
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
    partialAmount?: number // For partial refunds
}

/**
 * Sale export options
 */
export interface SaleExportOptions {
    format: 'csv' | 'xlsx' | 'json'
    dateFrom?: string
    dateTo?: string
    tableId?: string
    saleStatus?: SaleStatus[]
    includeItemDetails: boolean
}

/**
 * Inventory item availability check
 */
export interface ItemAvailability {
    available: boolean
    currentQuantity: number
    requestedQuantity: number
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
        saleNumber: saleNumber
    }
}
