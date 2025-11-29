// Rental Tracking System Types
// Based on migration 004_commerce.sql schema

/**
 * Rental transaction status options
 * - active: Item is currently rented out
 * - released: Item has been returned/released (becomes used)
 * - cancelled: Rental was cancelled before use
 */
export type RentalStatus = 'active' | 'released' | 'cancelled'

/**
 * Rental transaction record
 * Corresponds to rentals table
 */
export interface Rental {
    id: string
    rentalNumber: string // Format: RENT-YYYY-NNN
    tableId: string // Reference to source table (no FK constraint)
    tableName: string // Snapshot of table name
    itemId: string // Reference to source item (no FK constraint)
    itemSnapshot: string // Complete item JSON at time of rental
    customerId: string // External customer identifier
    unitPrice: number // Decimal(10,2) - rental price
    rentalStatus: RentalStatus
    rentedAt: Date // When the item was rented
    releasedAt: Date | null // When the item was released (null if still active)
    notes: string | null
    createdAt: Date
    updatedAt: Date
}

/**
 * Parsed item snapshot data structure for rental items
 */
export interface RentalItemSnapshot {
    price?: number // Rental price
    used?: boolean // Whether item was previously used
    available?: boolean // Whether item was available when rented

    [columnName: string]: any
}

/**
 * Rental with parsed item snapshot
 */
export interface RentalWithSnapshot extends Omit<Rental, 'itemSnapshot'> {
    itemSnapshot: RentalItemSnapshot
}

/**
 * Create rental request payload (API endpoint - rent an item)
 */
export interface CreateRentalRequest {
    tableId: string
    itemId: string
    customerId: string
    notes?: string
}

/**
 * Release rental request payload (API endpoint - release/return an item)
 */
export interface ReleaseRentalRequest {
    rentalId?: string // Either rentalId or itemId required
    itemId?: string // Can release by itemId for simpler API
    tableId?: string // Required if releasing by itemId
    notes?: string
}

/**
 * Update rental request payload (Admin only)
 */
export interface UpdateRentalRequest {
    rentalStatus?: RentalStatus
    notes?: string
    // Note: Cannot update financial or item data for audit compliance
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
    dateFrom?: string // ISO date string
    dateTo?: string // ISO date string
    search?: string // Search in rentalNumber, customerId, notes
    sortBy?: 'rentedAt' | 'releasedAt' | 'createdAt' | 'updatedAt' | 'unitPrice' | 'rentalNumber'
    sortOrder?: 'asc' | 'desc'
}

/**
 * Rental list response
 */
export interface RentalListResponse {
    data: RentalWithSnapshot[]
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
 * Rental analytics data
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
    topRentedItems: Array<{
        itemId: string
        tableName: string
        itemName: string // From item snapshot
        rentalCount: number
        totalRevenue: number
    }>
    rentalsByDate: Array<{
        date: string // YYYY-MM-DD
        rentalsCount: number
        releasesCount: number
        revenue: number
    }>
}

/**
 * Rental number generation helper
 */
export interface RentalNumberGenerator {
    year: number
    sequence: number
    rentalNumber: string
}

/**
 * Rental validation result
 */
export interface RentalValidationResult {
    valid: boolean
    errors: string[]
    warnings: string[]
}

/**
 * Rental item availability check
 */
export interface RentalItemAvailability {
    available: boolean // Can be rented
    used: boolean // Has been used before
    currentlyRented: boolean // Is currently rented out
    rentalPrice: number
    activeRentalId?: string // ID of active rental if currently rented
}

/**
 * Rental export options
 */
export interface RentalExportOptions {
    format: 'csv' | 'xlsx' | 'json'
    dateFrom?: string
    dateTo?: string
    tableId?: string
    rentalStatus?: RentalStatus[]
    includeItemDetails: boolean
}

/**
 * Generate rental number helper function
 */
export function generateRentalNumber(year: number, sequence: number): string {
    return `RENT-${year}-${sequence.toString().padStart(3, '0')}`
}

/**
 * Parse rental number helper function
 */
export function parseRentalNumber(rentalNumber: string): RentalNumberGenerator | null {
    const match = rentalNumber.match(/^RENT-(\d{4})-(\d{3})$/)
    if (!match || !match[1] || !match[2]) return null

    const year = parseInt(match[1])
    const sequence = parseInt(match[2])

    return {
        year,
        sequence,
        rentalNumber: rentalNumber
    }
}

/**
 * Rental lifecycle state machine
 * Defines valid state transitions for rental items
 *
 * Item states (stored in tableData.data):
 * - used=false, available=true  → Can be rented (initial state)
 * - used=false, available=false → Currently rented (first rental)
 * - used=true, available=false  → Released, cannot be rented again
 *
 * Valid transitions:
 * 1. Rent: (used=false, available=true) → (used=false, available=false)
 * 2. Release: (used=false, available=false) → (used=true, available=false)
 *
 * Invalid transitions (must be prevented):
 * - Cannot rent an item that is not available
 * - Cannot rent an item that is used
 * - Cannot make an item available again once used
 * - Cannot change used from true to false
 */
export const RENTAL_STATE_MACHINE = {
    INITIAL: { used: false, available: true },
    RENTED: { used: false, available: false },
    RELEASED: { used: true, available: false },
} as const

/**
 * Check if an item can be rented based on its current state
 */
export function canRentItem(used: boolean, available: boolean): boolean {
    return !used && available
}

/**
 * Check if an item can be released based on its current state
 */
export function canReleaseItem(used: boolean, available: boolean): boolean {
    return !used && !available // Item must be rented (not used, not available)
}

/**
 * Get the next state after renting an item
 */
export function getStateAfterRent(): { used: boolean; available: boolean } {
    return { used: false, available: false }
}

/**
 * Get the next state after releasing an item
 */
export function getStateAfterRelease(): { used: boolean; available: boolean } {
    return { used: true, available: false }
}
