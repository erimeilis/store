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
import { Prisma, type PrismaClient } from '@prisma/client'
import { sanitizeForSQL, validateSortColumn, validateSortDirection } from '@/utils/common.js'

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
    const saleId = crypto.randomUUID()
    const now = new Date()

    await this.prisma.$queryRaw`
      INSERT INTO sales (
        id, sale_number, table_id, table_name, item_id, item_snapshot,
        customer_id, quantity_sold, unit_price, total_amount, sale_status,
        payment_method, notes, created_at, updated_at
      ) VALUES (
        ${saleId}, ${saleNumber}, ${tableData.id}, ${tableData.name}, ${itemData.id},
        ${JSON.stringify(itemData.data)}, ${saleData.customer_id}, ${saleData.quantity_sold || 1},
        ${unitPrice}, ${totalAmount}, ${'completed'},
        ${saleData.payment_method || null}, ${saleData.notes || null}, ${now}, ${now}
      )
    `

    const sale = await this.findSaleById(saleId)
    if (!sale) {
      throw new Error('Failed to create sale')
    }

    return sale
  }

  /**
   * Find sale by ID
   */
  async findSaleById(saleId: string): Promise<Sale | null> {
    const [sale] = await this.prisma.$queryRaw<Sale[]>`
      SELECT
        id, sale_number, table_id, table_name, item_id, item_snapshot,
        customer_id, quantity_sold, unit_price, total_amount, sale_status,
        payment_method, notes, created_at, updated_at
      FROM sales
      WHERE id = ${saleId}
    `

    return sale || null
  }

  /**
   * Find sale by sale number
   */
  async findSaleBySaleNumber(saleNumber: string): Promise<Sale | null> {
    const [sale] = await this.prisma.$queryRaw<Sale[]>`
      SELECT
        id, sale_number, table_id, table_name, item_id, item_snapshot,
        customer_id, quantity_sold, unit_price, total_amount, sale_status,
        payment_method, notes, created_at, updated_at
      FROM sales
      WHERE sale_number = ${saleNumber}
    `

    return sale || null
  }

  /**
   * List sales with filtering, sorting, and pagination
   */
  async findSales(query: SaleListQuery): Promise<SaleListResponse> {
    const page = query.page || 1
    const limit = Math.min(query.limit || 50, 100) // Max 100 items per page
    const offset = (page - 1) * limit

    // Build WHERE conditions
    let whereConditions = ''
    const whereParams: any[] = []

    if (query.table_id) {
      whereConditions += ` AND s.table_id = ?`
      whereParams.push(query.table_id)
    }

    if (query.customer_id) {
      whereConditions += ` AND s.customer_id = ?`
      whereParams.push(query.customer_id)
    }

    if (query.sale_status) {
      whereConditions += ` AND s.sale_status = ?`
      whereParams.push(query.sale_status)
    }

    if (query.date_from) {
      whereConditions += ` AND DATE(s.created_at) >= ?`
      whereParams.push(query.date_from)
    }

    if (query.date_to) {
      whereConditions += ` AND DATE(s.created_at) <= ?`
      whereParams.push(query.date_to)
    }

    if (query.search) {
      whereConditions += ` AND (
        s.sale_number LIKE ? OR
        s.customer_id LIKE ? OR
        s.notes LIKE ?
      )`
      const searchTerm = `%${sanitizeForSQL(query.search)}%`
      whereParams.push(searchTerm, searchTerm, searchTerm)
    }

    // Build ORDER BY clause
    const allowedSortColumns = ['created_at', 'updated_at', 'total_amount', 'sale_number']
    const sortColumn = validateSortColumn(query.sort_by || 'created_at', allowedSortColumns)
    const sortOrder = validateSortDirection(query.sort_order || 'desc')

    // Get sales
    const sales = await this.prisma.$queryRawUnsafe<Sale[]>(`
      SELECT
        s.id, s.sale_number, s.table_id, s.table_name, s.item_id, s.item_snapshot,
        s.customer_id, s.quantity_sold, s.unit_price, s.total_amount, s.sale_status,
        s.payment_method, s.notes, s.created_at, s.updated_at
      FROM sales s
      WHERE 1=1 ${whereConditions}
      ORDER BY s.${sortColumn} ${sortOrder}
      LIMIT ? OFFSET ?
    `, ...whereParams, limit, offset)

    // Get total count
    const [countResult] = await this.prisma.$queryRawUnsafe<[{ count: number }]>(`
      SELECT COUNT(*) as count
      FROM sales s
      WHERE 1=1 ${whereConditions}
    `, ...whereParams)

    // Parse item snapshots
    const salesWithSnapshots: SaleWithSnapshot[] = sales.map(sale => ({
      ...sale,
      item_snapshot: JSON.parse(sale.item_snapshot) as ItemSnapshot
    }))

    return {
      data: salesWithSnapshots,
      meta: {
        page,
        limit,
        total: countResult.count,
        totalPages: Math.ceil(countResult.count / limit)
      }
    }
  }

  /**
   * Update sale (admin only)
   */
  async updateSale(saleId: string, updates: UpdateSaleRequest): Promise<Sale> {
    const setClauses: string[] = []
    const setValues: any[] = []

    if (updates.sale_status !== undefined) {
      setClauses.push('sale_status = ?')
      setValues.push(updates.sale_status)
    }

    if (updates.payment_method !== undefined) {
      setClauses.push('payment_method = ?')
      setValues.push(updates.payment_method)
    }

    if (updates.notes !== undefined) {
      setClauses.push('notes = ?')
      setValues.push(updates.notes)
    }

    // Always update timestamp
    setClauses.push('updated_at = CURRENT_TIMESTAMP')

    if (setClauses.length === 1) { // Only timestamp
      throw new Error('No fields to update')
    }

    const setClause = setClauses.join(', ')
    setValues.push(saleId)

    await this.prisma.$executeRawUnsafe(`
      UPDATE sales
      SET ${setClause}
      WHERE id = ?
    `, ...setValues)

    const sale = await this.findSaleById(saleId)
    if (!sale) {
      throw new Error('Sale not found after update')
    }

    return sale
  }

  /**
   * Delete sale (admin only)
   */
  async deleteSale(saleId: string): Promise<Sale> {
    const sale = await this.findSaleById(saleId)
    if (!sale) {
      throw new Error('Sale not found')
    }

    await this.prisma.$executeRaw`
      DELETE FROM sales WHERE id = ${saleId}
    `

    return sale
  }

  /**
   * Get next sale number for a given year
   */
  async getNextSaleNumber(year: number): Promise<string> {
    const [result] = await this.prisma.$queryRaw<[{ max_sequence: number | null }]>`
      SELECT MAX(CAST(SUBSTR(sale_number, 11, 3) AS INTEGER)) as max_sequence
      FROM sales
      WHERE sale_number LIKE ${`SALE-${year}-%`}
    `

    const nextSequence = (result?.max_sequence || 0) + 1
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
    let whereConditions = ''
    const whereParams: any[] = []

    if (dateFrom) {
      whereConditions += ` AND DATE(s.created_at) >= ?`
      whereParams.push(dateFrom)
    }

    if (dateTo) {
      whereConditions += ` AND DATE(s.created_at) <= ?`
      whereParams.push(dateTo)
    }

    if (tableId) {
      whereConditions += ` AND s.table_id = ?`
      whereParams.push(tableId)
    }

    // Overall metrics
    const [overallMetrics] = await this.prisma.$queryRawUnsafe<[{
      total_sales: number
      total_revenue: number
      total_items_sold: number
      average_sale_amount: number
    }]>(`
      SELECT
        COUNT(*) as total_sales,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(SUM(quantity_sold), 0) as total_items_sold,
        COALESCE(AVG(total_amount), 0) as average_sale_amount
      FROM sales s
      WHERE 1=1 ${whereConditions}
    `, ...whereParams)

    // Sales by status
    const salesByStatus = await this.prisma.$queryRawUnsafe<Array<{
      sale_status: SaleStatus
      count: number
      revenue: number
    }>>(`
      SELECT
        sale_status,
        COUNT(*) as count,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM sales s
      WHERE 1=1 ${whereConditions}
      GROUP BY sale_status
    `, ...whereParams)

    // Convert to record format
    const sales_by_status: Record<SaleStatus, number> = {
      pending: 0,
      completed: 0,
      cancelled: 0,
      refunded: 0
    }
    const revenue_by_status: Record<SaleStatus, number> = {
      pending: 0,
      completed: 0,
      cancelled: 0,
      refunded: 0
    }

    salesByStatus.forEach(row => {
      sales_by_status[row.sale_status] = row.count
      revenue_by_status[row.sale_status] = row.revenue
    })

    // Top selling items
    const topSellingItems = await this.prisma.$queryRawUnsafe<Array<{
      item_id: string
      table_name: string
      item_name: string
      quantity_sold: number
      total_revenue: number
    }>>(`
      SELECT
        s.item_id,
        s.table_name,
        JSON_EXTRACT(s.item_snapshot, '$.name') as item_name,
        SUM(s.quantity_sold) as quantity_sold,
        SUM(s.total_amount) as total_revenue
      FROM sales s
      WHERE 1=1 ${whereConditions}
      GROUP BY s.item_id, s.table_name
      ORDER BY quantity_sold DESC
      LIMIT 10
    `, ...whereParams)

    // Sales by date
    const salesByDate = await this.prisma.$queryRawUnsafe<Array<{
      date: string
      sales_count: number
      revenue: number
    }>>(`
      SELECT
        DATE(s.created_at) as date,
        COUNT(*) as sales_count,
        COALESCE(SUM(s.total_amount), 0) as revenue
      FROM sales s
      WHERE 1=1 ${whereConditions}
      GROUP BY DATE(s.created_at)
      ORDER BY date DESC
      LIMIT 30
    `, ...whereParams)

    return {
      total_sales: overallMetrics.total_sales,
      total_revenue: overallMetrics.total_revenue,
      total_items_sold: overallMetrics.total_items_sold,
      average_sale_amount: overallMetrics.average_sale_amount,
      sales_by_status,
      revenue_by_status,
      top_selling_items: topSellingItems.map(item => ({
        ...item,
        item_name: item.item_name || 'Unknown Item'
      })),
      sales_by_date: salesByDate
    }
  }

  /**
   * Get sales for a specific customer
   */
  async findSalesByCustomer(customerId: string, limit = 50): Promise<SaleWithSnapshot[]> {
    const sales = await this.prisma.$queryRaw<Sale[]>`
      SELECT
        id, sale_number, table_id, table_name, item_id, item_snapshot,
        customer_id, quantity_sold, unit_price, total_amount, sale_status,
        payment_method, notes, created_at, updated_at
      FROM sales
      WHERE customer_id = ${customerId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `

    return sales.map(sale => ({
      ...sale,
      item_snapshot: JSON.parse(sale.item_snapshot) as ItemSnapshot
    }))
  }

  /**
   * Get sales for a specific table
   */
  async findSalesByTable(tableId: string, limit = 50): Promise<SaleWithSnapshot[]> {
    const sales = await this.prisma.$queryRaw<Sale[]>`
      SELECT
        id, sale_number, table_id, table_name, item_id, item_snapshot,
        customer_id, quantity_sold, unit_price, total_amount, sale_status,
        payment_method, notes, created_at, updated_at
      FROM sales
      WHERE table_id = ${tableId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `

    return sales.map(sale => ({
      ...sale,
      item_snapshot: JSON.parse(sale.item_snapshot) as ItemSnapshot
    }))
  }

  /**
   * Check if sale exists by sale number
   */
  async saleNumberExists(saleNumber: string): Promise<boolean> {
    const [result] = await this.prisma.$queryRaw<[{ count: number }]>`
      SELECT COUNT(*) as count FROM sales WHERE sale_number = ${saleNumber}
    `
    return result.count > 0
  }
}