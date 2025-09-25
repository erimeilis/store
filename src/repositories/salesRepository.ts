import { getPrismaClient } from '@/lib/database.js'
import type { Bindings } from '@/types/bindings.js'
import type {
  Sale,
  SaleWithSnapshot,
  ItemSnapshot,
  CreateSaleRequest,
  UpdateSaleRequest,
  SaleListQuery,
  SaleListResponse,
  SalesAnalytics,
  SaleStatus,
  generateSaleNumber
} from '@/types/sales.js'
import { type PrismaClient } from '@prisma/client'
import { validateSortColumn, validateSortDirection } from '@/utils/common.js'

/**
 * Repository for sales operations
 */
export class SalesRepository {
  private prisma: PrismaClient

  constructor(env: Bindings) {
    this.prisma = getPrismaClient(env)
  }


  /**
   * Create a new sale transaction
   */
  async createSale(
    saleData: CreateSaleRequest,
    tableData: { id: string; name: string },
    itemData: { id: string; data: any },
    saleNumber: string,
    unitPrice: number,
    totalAmount: number
  ): Promise<Sale> {
    return await this.prisma.sale.create({
      data: {
        saleNumber,
        tableId: tableData.id,
        tableName: tableData.name,
        itemId: itemData.id,
        itemSnapshot: JSON.stringify(itemData.data),
        customerId: saleData.customerId,
        quantitySold: saleData.quantitySold || 1,
        unitPrice,
        totalAmount,
        saleStatus: 'completed',
        paymentMethod: saleData.paymentMethod || null,
        notes: saleData.notes || null
      }
    }) as Sale
  }

  /**
   * Find sale by ID
   */
  async findSaleById(saleId: string): Promise<Sale | null> {
    return await this.prisma.sale.findUnique({
      where: { id: saleId }
    }) as Sale | null
  }

  /**
   * Find sale by sale number
   */
  async findSaleBySaleNumber(saleNumber: string): Promise<Sale | null> {
    return await this.prisma.sale.findUnique({
      where: { saleNumber }
    }) as Sale | null
  }

  /**
   * List sales with filtering, sorting, and pagination
   */
  async findSales(query: SaleListQuery): Promise<SaleListResponse> {
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

    if (query.saleStatus) {
      where.saleStatus = query.saleStatus
    }

    // Date filtering
    if (query.dateFrom || query.dateTo) {
      where.createdAt = {}
      if (query.dateFrom) {
        where.createdAt.gte = new Date(query.dateFrom)
      }
      if (query.dateTo) {
        where.createdAt.lte = new Date(query.dateTo + 'T23:59:59.999Z')
      }
    }

    // Search across multiple fields
    if (query.search) {
      where.OR = [
        { saleNumber: { contains: query.search } },
        { customerId: { contains: query.search } },
        { notes: { contains: query.search } }
      ]
    }

    // Build ORDER BY clause
    const allowedSortColumns = ['createdAt', 'updatedAt', 'totalAmount', 'saleNumber']
    const sortColumn = validateSortColumn(query.sortBy || 'createdAt', allowedSortColumns)
    const sortOrder = validateSortDirection(query.sortOrder || 'desc')

    const orderBy = { [sortColumn]: sortOrder }

    // Get sales using Prisma
    const [sales, total] = await Promise.all([
      this.prisma.sale.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.sale.count({ where })
    ])

    // Parse item snapshots
    const salesWithSnapshots: SaleWithSnapshot[] = sales.map(sale => ({
      ...(sale as Sale),
      itemSnapshot: JSON.parse(sale.itemSnapshot) as ItemSnapshot
    }))

    return {
      data: salesWithSnapshots,
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
   * Update sale (admin only)
   */
  async updateSale(saleId: string, updates: UpdateSaleRequest): Promise<Sale> {
    const updateData: any = {}

    if (updates.saleStatus !== undefined) {
      updateData.saleStatus = updates.saleStatus
    }

    if (updates.paymentMethod !== undefined) {
      updateData.paymentMethod = updates.paymentMethod
    }

    if (updates.notes !== undefined) {
      updateData.notes = updates.notes
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error('No fields to update')
    }

    // Always update timestamp
    updateData.updatedAt = new Date()

    return await this.prisma.sale.update({
      where: { id: saleId },
      data: updateData
    }) as Sale
  }

  /**
   * Delete sale (admin only)
   */
  async deleteSale(saleId: string): Promise<Sale> {
    const sale = await this.findSaleById(saleId)
    if (!sale) {
      throw new Error('Sale not found')
    }

    await this.prisma.sale.delete({
      where: { id: saleId }
    })

    return sale
  }

  /**
   * Get next sale number for a given year
   */
  async getNextSaleNumber(year: number): Promise<string> {
    // Get all sales for the year using Prisma
    const salesForYear = await this.prisma.sale.findMany({
      where: {
        saleNumber: {
          startsWith: `SALE-${year}-`
        }
      },
      select: {
        saleNumber: true
      }
    })

    // Extract sequence numbers and find the maximum
    let maxSequence = 0
    for (const sale of salesForYear) {
      const sequencePart = sale.saleNumber.split('-')[2]
      if (sequencePart) {
        const sequence = parseInt(sequencePart, 10)
        if (!isNaN(sequence) && sequence > maxSequence) {
          maxSequence = sequence
        }
      }
    }

    const nextSequence = maxSequence + 1
    return `SALE-${year}-${nextSequence.toString().padStart(3, '0')}`
  }

  /**
   * Get sales analytics
   */
  async getSalesAnalytics(
    dateFrom?: string,
    dateTo?: string,
    tableId?: string
  ): Promise<SalesAnalytics> {
    // Build WHERE conditions using Prisma
    const where: any = {}

    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom)
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo + 'T23:59:59.999Z')
      }
    }

    if (tableId) {
      where.tableId = tableId
    }

    // Get all sales for analysis
    const sales = await this.prisma.sale.findMany({
      where
    })

    // Calculate overall metrics
    const totalSales = sales.length
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0)
    const totalItemsSold = sales.reduce((sum, sale) => sum + sale.quantitySold, 0)
    const averageSaleAmount = totalSales > 0 ? totalRevenue / totalSales : 0

    // Calculate sales by status
    const salesByStatus: Record<SaleStatus, number> = {
      pending: 0,
      completed: 0,
      cancelled: 0,
      refunded: 0
    }
    const revenueByStatus: Record<SaleStatus, number> = {
      pending: 0,
      completed: 0,
      cancelled: 0,
      refunded: 0
    }

    sales.forEach(sale => {
      const status = sale.saleStatus as SaleStatus
      salesByStatus[status]++
      revenueByStatus[status] += sale.totalAmount
    })

    // Calculate top selling items
    const itemStats = new Map<string, {
      itemId: string
      tableName: string
      itemName: string
      quantitySold: number
      totalRevenue: number
    }>()

    sales.forEach(sale => {
      const key = `${sale.itemId}-${sale.tableName}`
      let itemName = 'Unknown Item'

      try {
        const snapshot = JSON.parse(sale.itemSnapshot)
        itemName = snapshot.name || 'Unknown Item'
      } catch {
        // Use default name if parsing fails
      }

      if (itemStats.has(key)) {
        const existing = itemStats.get(key)!
        existing.quantitySold += sale.quantitySold
        existing.totalRevenue += sale.totalAmount
      } else {
        itemStats.set(key, {
          itemId: sale.itemId,
          tableName: sale.tableName,
          itemName: itemName,
          quantitySold: sale.quantitySold,
          totalRevenue: sale.totalAmount
        })
      }
    })

    const topSellingItems = Array.from(itemStats.values())
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 10)

    // Calculate sales by date
    const dateStats = new Map<string, {
      date: string
      salesCount: number
      revenue: number
    }>()

    sales.forEach(sale => {
      if (!sale.createdAt) return

      const date = sale.createdAt.toISOString().split('T')[0] as string

      if (dateStats.has(date)) {
        const existing = dateStats.get(date)!
        existing.salesCount++
        existing.revenue += sale.totalAmount
      } else {
        dateStats.set(date, {
          date,
          salesCount: 1,
          revenue: sale.totalAmount
        })
      }
    })

    const salesByDate = Array.from(dateStats.values())
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 30)

    return {
      totalSales,
      totalRevenue,
      totalItemsSold,
      averageSaleAmount,
      salesByStatus,
      revenueByStatus,
      topSellingItems,
      salesByDate
    }
  }

  /**
   * Get sales for a specific customer
   */
  async findSalesByCustomer(customerId: string, limit = 50): Promise<SaleWithSnapshot[]> {
    const sales = await this.prisma.sale.findMany({
      where: {
        customerId: customerId
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })

    return sales.map(sale => ({
      ...(sale as Sale),
      itemSnapshot: JSON.parse(sale.itemSnapshot) as ItemSnapshot
    })) as SaleWithSnapshot[]
  }

  /**
   * Get sales for a specific table
   */
  async findSalesByTable(tableId: string, limit = 50): Promise<SaleWithSnapshot[]> {
    const sales = await this.prisma.sale.findMany({
      where: {
        tableId: tableId
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })

    return sales.map(sale => ({
      ...(sale as Sale),
      itemSnapshot: JSON.parse(sale.itemSnapshot) as ItemSnapshot
    })) as SaleWithSnapshot[]
  }

  /**
   * Check if sale exists by sale number
   */
  async saleNumberExists(saleNumber: string): Promise<boolean> {
    const count = await this.prisma.sale.count({
      where: {
        saleNumber: saleNumber
      }
    })
    return count > 0
  }
}