import { getPrismaClient } from '@/lib/database.js'
import type { Bindings } from '@/types/bindings.js'
import type {
  Rental,
  RentalWithSnapshot,
  RentalItemSnapshot,
  CreateRentalRequest,
  UpdateRentalRequest,
  RentalListQuery,
  RentalListResponse,
  RentalAnalytics,
  RentalStatus
} from '@/types/rentals.js'
import { type PrismaClient } from '@prisma/client'
import { validateSortColumn, validateSortDirection } from '@/utils/common.js'

/**
 * Repository for rental operations
 */
export class RentalRepository {
  private prisma: PrismaClient

  constructor(env: Bindings) {
    this.prisma = getPrismaClient(env)
  }

  /**
   * Create a new rental transaction
   */
  async createRental(
    rentalData: CreateRentalRequest,
    tableData: { id: string; name: string },
    itemData: { id: string; data: any },
    rentalNumber: string,
    unitPrice: number
  ): Promise<Rental> {
    return await this.prisma.rental.create({
      data: {
        rentalNumber,
        tableId: tableData.id,
        tableName: tableData.name,
        itemId: itemData.id,
        itemSnapshot: JSON.stringify(itemData.data),
        customerId: rentalData.customerId,
        unitPrice,
        rentalStatus: 'active',
        rentedAt: new Date(),
        notes: rentalData.notes || null
      }
    }) as Rental
  }

  /**
   * Find rental by ID
   */
  async findRentalById(rentalId: string): Promise<Rental | null> {
    return await this.prisma.rental.findUnique({
      where: { id: rentalId }
    }) as Rental | null
  }

  /**
   * Find rental by rental number
   */
  async findRentalByRentalNumber(rentalNumber: string): Promise<Rental | null> {
    return await this.prisma.rental.findUnique({
      where: { rentalNumber }
    }) as Rental | null
  }

  /**
   * Find active rental by item ID and table ID
   */
  async findActiveRentalByItem(tableId: string, itemId: string): Promise<Rental | null> {
    return await this.prisma.rental.findFirst({
      where: {
        tableId,
        itemId,
        rentalStatus: 'active'
      }
    }) as Rental | null
  }

  /**
   * List rentals with filtering, sorting, and pagination
   */
  async findRentals(query: RentalListQuery): Promise<RentalListResponse> {
    const page = query.page || 1
    const limit = Math.min(query.limit || 50, 100) // Max 100 items per page

    // Build WHERE conditions using Prisma
    const where: any = {}

    if (query.tableId) {
      where.tableId = query.tableId
    }

    if (query.customerId) {
      where.customerId = query.customerId
    }

    if (query.rentalStatus) {
      where.rentalStatus = query.rentalStatus
    }

    // Date filtering
    if (query.dateFrom || query.dateTo) {
      where.rentedAt = {}
      if (query.dateFrom) {
        where.rentedAt.gte = new Date(query.dateFrom)
      }
      if (query.dateTo) {
        where.rentedAt.lte = new Date(query.dateTo + 'T23:59:59.999Z')
      }
    }

    // Search across multiple fields
    if (query.search) {
      where.OR = [
        { rentalNumber: { contains: query.search } },
        { customerId: { contains: query.search } },
        { notes: { contains: query.search } }
      ]
    }

    // Build ORDER BY clause
    const allowedSortColumns = ['rentedAt', 'releasedAt', 'createdAt', 'updatedAt', 'unitPrice', 'rentalNumber']
    const sortColumn = validateSortColumn(query.sortBy || 'rentedAt', allowedSortColumns)
    const sortOrder = validateSortDirection(query.sortOrder || 'desc')

    const orderBy = { [sortColumn]: sortOrder }

    // Get rentals using Prisma
    const [rentals, total] = await Promise.all([
      this.prisma.rental.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.rental.count({ where })
    ])

    // Parse item snapshots
    const rentalsWithSnapshots: RentalWithSnapshot[] = rentals.map(rental => ({
      ...(rental as Rental),
      itemSnapshot: JSON.parse(rental.itemSnapshot) as RentalItemSnapshot
    }))

    return {
      data: rentalsWithSnapshots,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    }
  }

  /**
   * Update rental (for release or admin updates)
   */
  async updateRental(rentalId: string, updates: UpdateRentalRequest & { releasedAt?: Date }): Promise<Rental> {
    const updateData: any = {}

    if (updates.rentalStatus !== undefined) {
      updateData.rentalStatus = updates.rentalStatus
    }

    if (updates.releasedAt !== undefined) {
      updateData.releasedAt = updates.releasedAt
    }

    if (updates.notes !== undefined) {
      updateData.notes = updates.notes
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error('No fields to update')
    }

    // Always update timestamp
    updateData.updatedAt = new Date()

    return await this.prisma.rental.update({
      where: { id: rentalId },
      data: updateData
    }) as Rental
  }

  /**
   * Release a rental - mark as released and set releasedAt
   */
  async releaseRental(rentalId: string, notes?: string): Promise<Rental> {
    const now = new Date()
    return await this.prisma.rental.update({
      where: { id: rentalId },
      data: {
        rentalStatus: 'released',
        releasedAt: now,
        notes: notes || null,
        updatedAt: now
      }
    }) as Rental
  }

  /**
   * Delete rental (admin only)
   */
  async deleteRental(rentalId: string): Promise<Rental> {
    const rental = await this.findRentalById(rentalId)
    if (!rental) {
      throw new Error('Rental not found')
    }

    await this.prisma.rental.delete({
      where: { id: rentalId }
    })

    return rental
  }

  /**
   * Get next rental number for a given year
   */
  async getNextRentalNumber(year: number): Promise<string> {
    // Get all rentals for the year using Prisma
    const rentalsForYear = await this.prisma.rental.findMany({
      where: {
        rentalNumber: {
          startsWith: `RENT-${year}-`
        }
      },
      select: {
        rentalNumber: true
      }
    })

    // Extract sequence numbers and find the maximum
    let maxSequence = 0
    for (const rental of rentalsForYear) {
      const sequencePart = rental.rentalNumber.split('-')[2]
      if (sequencePart) {
        const sequence = parseInt(sequencePart, 10)
        if (!isNaN(sequence) && sequence > maxSequence) {
          maxSequence = sequence
        }
      }
    }

    const nextSequence = maxSequence + 1
    return `RENT-${year}-${nextSequence.toString().padStart(3, '0')}`
  }

  /**
   * Get rental analytics
   */
  async getRentalAnalytics(
    dateFrom?: string,
    dateTo?: string,
    tableId?: string
  ): Promise<RentalAnalytics> {
    // Build WHERE conditions using Prisma
    const where: any = {}

    if (dateFrom || dateTo) {
      where.rentedAt = {}
      if (dateFrom) {
        where.rentedAt.gte = new Date(dateFrom)
      }
      if (dateTo) {
        where.rentedAt.lte = new Date(dateTo + 'T23:59:59.999Z')
      }
    }

    if (tableId) {
      where.tableId = tableId
    }

    // Get all rentals for analysis
    const rentals = await this.prisma.rental.findMany({
      where
    })

    // Calculate overall metrics
    const totalRentals = rentals.length
    const activeRentals = rentals.filter(r => r.rentalStatus === 'active').length
    const releasedRentals = rentals.filter(r => r.rentalStatus === 'released').length
    const cancelledRentals = rentals.filter(r => r.rentalStatus === 'cancelled').length
    const totalRevenue = rentals.reduce((sum, rental) => sum + rental.unitPrice, 0)
    const averageRentalPrice = totalRentals > 0 ? totalRevenue / totalRentals : 0

    // Calculate rentals by status
    const rentalsByStatus: Record<RentalStatus, number> = {
      active: activeRentals,
      released: releasedRentals,
      cancelled: cancelledRentals
    }

    const revenueByStatus: Record<RentalStatus, number> = {
      active: 0,
      released: 0,
      cancelled: 0
    }

    rentals.forEach(rental => {
      const status = rental.rentalStatus as RentalStatus
      revenueByStatus[status] += rental.unitPrice
    })

    // Calculate top rented items
    const itemStats = new Map<string, {
      itemId: string
      tableName: string
      itemName: string
      rentalCount: number
      totalRevenue: number
    }>()

    rentals.forEach(rental => {
      const key = `${rental.itemId}-${rental.tableName}`
      let itemName = 'Unknown Item'

      try {
        const snapshot = JSON.parse(rental.itemSnapshot)
        itemName = snapshot.name || 'Unknown Item'
      } catch {
        // Use default name if parsing fails
      }

      if (itemStats.has(key)) {
        const existing = itemStats.get(key)!
        existing.rentalCount++
        existing.totalRevenue += rental.unitPrice
      } else {
        itemStats.set(key, {
          itemId: rental.itemId,
          tableName: rental.tableName,
          itemName: itemName,
          rentalCount: 1,
          totalRevenue: rental.unitPrice
        })
      }
    })

    const topRentedItems = Array.from(itemStats.values())
      .sort((a, b) => b.rentalCount - a.rentalCount)
      .slice(0, 10)

    // Calculate rentals by date
    const dateStats = new Map<string, {
      date: string
      rentalsCount: number
      releasesCount: number
      revenue: number
    }>()

    rentals.forEach(rental => {
      if (!rental.rentedAt) return

      const date = rental.rentedAt.toISOString().split('T')[0] as string

      if (dateStats.has(date)) {
        const existing = dateStats.get(date)!
        existing.rentalsCount++
        existing.revenue += rental.unitPrice
      } else {
        dateStats.set(date, {
          date,
          rentalsCount: 1,
          releasesCount: 0,
          revenue: rental.unitPrice
        })
      }

      // Count releases separately
      if (rental.releasedAt) {
        const releaseDate = rental.releasedAt.toISOString().split('T')[0] as string
        if (dateStats.has(releaseDate)) {
          const existing = dateStats.get(releaseDate)!
          existing.releasesCount++
        }
      }
    })

    const rentalsByDate = Array.from(dateStats.values())
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 30)

    return {
      totalRentals,
      activeRentals,
      releasedRentals,
      cancelledRentals,
      totalRevenue,
      averageRentalPrice,
      rentalsByStatus,
      revenueByStatus,
      topRentedItems,
      rentalsByDate
    }
  }

  /**
   * Get rentals for a specific customer
   */
  async findRentalsByCustomer(customerId: string, limit = 50): Promise<RentalWithSnapshot[]> {
    const rentals = await this.prisma.rental.findMany({
      where: {
        customerId: customerId
      },
      orderBy: {
        rentedAt: 'desc'
      },
      take: limit
    })

    return rentals.map(rental => ({
      ...(rental as Rental),
      itemSnapshot: JSON.parse(rental.itemSnapshot) as RentalItemSnapshot
    })) as RentalWithSnapshot[]
  }

  /**
   * Get rentals for a specific table
   */
  async findRentalsByTable(tableId: string, limit = 50): Promise<RentalWithSnapshot[]> {
    const rentals = await this.prisma.rental.findMany({
      where: {
        tableId: tableId
      },
      orderBy: {
        rentedAt: 'desc'
      },
      take: limit
    })

    return rentals.map(rental => ({
      ...(rental as Rental),
      itemSnapshot: JSON.parse(rental.itemSnapshot) as RentalItemSnapshot
    })) as RentalWithSnapshot[]
  }

  /**
   * Check if rental number exists
   */
  async rentalNumberExists(rentalNumber: string): Promise<boolean> {
    const count = await this.prisma.rental.count({
      where: {
        rentalNumber: rentalNumber
      }
    })
    return count > 0
  }
}
