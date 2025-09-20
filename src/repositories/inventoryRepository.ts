import { getPrismaClient } from '@/lib/database.js'
import type { Bindings } from '@/types/bindings.js'
import type {
  InventoryTransaction,
  InventoryTransactionWithData,
  ParsedInventoryData,
  CreateInventoryTransactionRequest,
  InventoryTransactionListQuery,
  InventoryTransactionListResponse,
  InventoryAnalytics,
  InventoryTransactionType,
  ItemInventorySummary,
  TableInventorySummary,
  BulkInventoryAdjustmentRequest,
  InventoryAdjustmentResult,
  InventoryAlert,
  StockLevelCheckRequest,
  StockLevelCheckResponse
} from '@/types/inventory.js'
import { Prisma, type PrismaClient } from '@prisma/client'
import { sanitizeForSQL, validateSortColumn, validateSortDirection } from '@/utils/common.js'

/**
 * Repository for inventory transaction operations
 */
export class InventoryRepository {
  private prisma: PrismaClient

  constructor(env: Bindings) {
    this.prisma = getPrismaClient(env)
  }

  /**
   * Create a new inventory transaction
   */
  async createTransaction(request: CreateInventoryTransactionRequest): Promise<InventoryTransaction> {
    const transactionId = crypto.randomUUID()
    const now = new Date()

    await this.prisma.$queryRaw`
      INSERT INTO inventory_transactions (
        id, table_id, table_name, item_id, transaction_type, quantity_change,
        previous_data, new_data, reference_id, created_by, created_at
      ) VALUES (
        ${transactionId}, ${request.table_id}, ${request.table_name}, ${request.item_id},
        ${request.transaction_type}, ${request.quantity_change || null},
        ${request.previous_data ? JSON.stringify(request.previous_data) : null},
        ${request.new_data ? JSON.stringify(request.new_data) : null},
        ${request.reference_id || null}, ${request.created_by}, ${now}
      )
    `

    const transaction = await this.findTransactionById(transactionId)
    if (!transaction) {
      throw new Error('Failed to create inventory transaction')
    }

    return transaction
  }

  /**
   * Find transaction by ID
   */
  async findTransactionById(transactionId: string): Promise<InventoryTransaction | null> {
    const [transaction] = await this.prisma.$queryRaw<InventoryTransaction[]>`
      SELECT
        id, table_id, table_name, item_id, transaction_type, quantity_change,
        previous_data, new_data, reference_id, created_by, created_at
      FROM inventory_transactions
      WHERE id = ${transactionId}
    `

    return transaction || null
  }

  /**
   * List inventory transactions with filtering, sorting, and pagination
   */
  async findTransactions(query: InventoryTransactionListQuery): Promise<InventoryTransactionListResponse> {
    const page = query.page || 1
    const limit = Math.min(query.limit || 50, 100) // Max 100 items per page
    const offset = (page - 1) * limit

    // Build WHERE conditions
    let whereConditions = ''
    const whereParams: any[] = []

    if (query.table_id) {
      whereConditions += ` AND it.table_id = ?`
      whereParams.push(query.table_id)
    }

    if (query.item_id) {
      whereConditions += ` AND it.item_id = ?`
      whereParams.push(query.item_id)
    }

    if (query.transaction_type) {
      whereConditions += ` AND it.transaction_type = ?`
      whereParams.push(query.transaction_type)
    }

    if (query.created_by) {
      whereConditions += ` AND it.created_by = ?`
      whereParams.push(query.created_by)
    }

    if (query.reference_id) {
      whereConditions += ` AND it.reference_id = ?`
      whereParams.push(query.reference_id)
    }

    if (query.date_from) {
      whereConditions += ` AND DATE(it.created_at) >= ?`
      whereParams.push(query.date_from)
    }

    if (query.date_to) {
      whereConditions += ` AND DATE(it.created_at) <= ?`
      whereParams.push(query.date_to)
    }

    // Build ORDER BY clause
    const allowedSortColumns = ['created_at', 'transaction_type', 'quantity_change']
    const sortColumn = validateSortColumn(query.sort_by || 'created_at', allowedSortColumns)
    const sortOrder = validateSortDirection(query.sort_order || 'desc')

    // Get transactions
    const transactions = await this.prisma.$queryRawUnsafe<InventoryTransaction[]>(`
      SELECT
        it.id, it.table_id, it.table_name, it.item_id, it.transaction_type, it.quantity_change,
        it.previous_data, it.new_data, it.reference_id, it.created_by, it.created_at
      FROM inventory_transactions it
      WHERE 1=1 ${whereConditions}
      ORDER BY it.${sortColumn} ${sortOrder}
      LIMIT ? OFFSET ?
    `, ...whereParams, limit, offset)

    // Get total count
    const [countResult] = await this.prisma.$queryRawUnsafe<[{ count: number }]>(`
      SELECT COUNT(*) as count
      FROM inventory_transactions it
      WHERE 1=1 ${whereConditions}
    `, ...whereParams)

    // Parse data fields
    const transactionsWithData: InventoryTransactionWithData[] = transactions.map(transaction => ({
      ...transaction,
      previous_data: transaction.previous_data ? JSON.parse(transaction.previous_data) as ParsedInventoryData : null,
      new_data: transaction.new_data ? JSON.parse(transaction.new_data) as ParsedInventoryData : null
    }))

    return {
      data: transactionsWithData,
      meta: {
        page,
        limit,
        total: countResult.count,
        totalPages: Math.ceil(countResult.count / limit)
      }
    }
  }

  /**
   * Get inventory analytics
   */
  async getInventoryAnalytics(
    dateFrom?: string,
    dateTo?: string,
    tableId?: string
  ): Promise<InventoryAnalytics> {
    let whereConditions = ''
    const whereParams: any[] = []

    if (dateFrom) {
      whereConditions += ` AND DATE(it.created_at) >= ?`
      whereParams.push(dateFrom)
    }

    if (dateTo) {
      whereConditions += ` AND DATE(it.created_at) <= ?`
      whereParams.push(dateTo)
    }

    if (tableId) {
      whereConditions += ` AND it.table_id = ?`
      whereParams.push(tableId)
    }

    // Overall metrics
    const [overallMetrics] = await this.prisma.$queryRawUnsafe<[{
      total_transactions: number
    }]>(`
      SELECT COUNT(*) as total_transactions
      FROM inventory_transactions it
      WHERE 1=1 ${whereConditions}
    `, ...whereParams)

    // Transactions by type
    const transactionsByType = await this.prisma.$queryRawUnsafe<Array<{
      transaction_type: InventoryTransactionType
      count: number
      quantity_change: number
    }>>(`
      SELECT
        transaction_type,
        COUNT(*) as count,
        COALESCE(SUM(quantity_change), 0) as quantity_change
      FROM inventory_transactions it
      WHERE 1=1 ${whereConditions}
      GROUP BY transaction_type
    `, ...whereParams)

    // Convert to record format
    const transactions_by_type: Record<InventoryTransactionType, number> = {
      sale: 0,
      add: 0,
      remove: 0,
      update: 0,
      adjust: 0
    }
    const quantity_changes_by_type: Record<InventoryTransactionType, number> = {
      sale: 0,
      add: 0,
      remove: 0,
      update: 0,
      adjust: 0
    }

    transactionsByType.forEach(row => {
      transactions_by_type[row.transaction_type] = row.count
      quantity_changes_by_type[row.transaction_type] = row.quantity_change
    })

    // Most active tables
    const mostActiveTables = await this.prisma.$queryRawUnsafe<Array<{
      table_id: string
      table_name: string
      transaction_count: number
    }>>(`
      SELECT
        table_id,
        table_name,
        COUNT(*) as transaction_count
      FROM inventory_transactions it
      WHERE 1=1 ${whereConditions}
      GROUP BY table_id, table_name
      ORDER BY transaction_count DESC
      LIMIT 10
    `, ...whereParams)

    // Most active items
    const mostActiveItems = await this.prisma.$queryRawUnsafe<Array<{
      item_id: string
      table_name: string
      item_name: string
      transaction_count: number
    }>>(`
      SELECT
        it.item_id,
        it.table_name,
        COALESCE(JSON_EXTRACT(it.new_data, '$.name'), JSON_EXTRACT(it.previous_data, '$.name'), 'Unknown Item') as item_name,
        COUNT(*) as transaction_count
      FROM inventory_transactions it
      WHERE 1=1 ${whereConditions}
      GROUP BY it.item_id, it.table_name
      ORDER BY transaction_count DESC
      LIMIT 10
    `, ...whereParams)

    // Activity by date
    const activityByDate = await this.prisma.$queryRawUnsafe<Array<{
      date: string
      transaction_count: number
      quantity_change: number
    }>>(`
      SELECT
        DATE(it.created_at) as date,
        COUNT(*) as transaction_count,
        COALESCE(SUM(it.quantity_change), 0) as quantity_change
      FROM inventory_transactions it
      WHERE 1=1 ${whereConditions}
      GROUP BY DATE(it.created_at)
      ORDER BY date DESC
      LIMIT 30
    `, ...whereParams)

    return {
      total_transactions: overallMetrics.total_transactions,
      transactions_by_type,
      quantity_changes_by_type,
      most_active_tables: mostActiveTables,
      most_active_items: mostActiveItems.map(item => ({
        ...item,
        item_name: item.item_name || 'Unknown Item'
      })),
      activity_by_date: activityByDate
    }
  }

  /**
   * Get inventory summary for an item
   */
  async getItemInventorySummary(tableId: string, itemId: string): Promise<ItemInventorySummary | null> {
    const [summary] = await this.prisma.$queryRaw<Array<{
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
    }>>`
      SELECT
        item_id,
        table_id,
        table_name,
        COALESCE(SUM(CASE WHEN transaction_type IN ('add', 'adjust') AND quantity_change > 0 THEN quantity_change ELSE 0 END), 0) +
        COALESCE(SUM(CASE WHEN transaction_type = 'sale' THEN -quantity_change ELSE 0 END), 0) +
        COALESCE(SUM(CASE WHEN transaction_type IN ('remove', 'adjust') AND quantity_change < 0 THEN quantity_change ELSE 0 END), 0) as current_quantity,
        COALESCE(SUM(CASE WHEN transaction_type = 'add' OR (transaction_type = 'adjust' AND quantity_change > 0) THEN quantity_change ELSE 0 END), 0) as total_added,
        COALESCE(SUM(CASE WHEN transaction_type = 'remove' OR (transaction_type = 'adjust' AND quantity_change < 0) THEN ABS(quantity_change) ELSE 0 END), 0) as total_removed,
        COALESCE(SUM(CASE WHEN transaction_type = 'sale' THEN quantity_sold ELSE 0 END), 0) as total_sold,
        COALESCE(SUM(CASE WHEN transaction_type = 'adjust' THEN ABS(quantity_change) ELSE 0 END), 0) as total_adjustments,
        MAX(created_at) as last_transaction_date,
        COUNT(*) as transaction_count
      FROM inventory_transactions
      WHERE table_id = ${tableId} AND item_id = ${itemId}
      GROUP BY item_id, table_id, table_name
    `

    return summary || null
  }

  /**
   * Get inventory summary for a table
   */
  async getTableInventorySummary(tableId: string): Promise<TableInventorySummary | null> {
    // Get table overview
    const [tableOverview] = await this.prisma.$queryRaw<Array<{
      table_id: string
      table_name: string
      total_items: number
      total_transactions: number
    }>>`
      SELECT
        table_id,
        table_name,
        COUNT(DISTINCT item_id) as total_items,
        COUNT(*) as total_transactions
      FROM inventory_transactions
      WHERE table_id = ${tableId}
      GROUP BY table_id, table_name
    `

    if (!tableOverview) {
      return null
    }

    // Get item-level summaries
    const itemSummaries = await this.prisma.$queryRaw<Array<{
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
    }>>`
      SELECT
        item_id,
        table_id,
        table_name,
        COALESCE(SUM(CASE WHEN transaction_type IN ('add', 'adjust') AND quantity_change > 0 THEN quantity_change ELSE 0 END), 0) +
        COALESCE(SUM(CASE WHEN transaction_type = 'sale' THEN -quantity_change ELSE 0 END), 0) +
        COALESCE(SUM(CASE WHEN transaction_type IN ('remove', 'adjust') AND quantity_change < 0 THEN quantity_change ELSE 0 END), 0) as current_quantity,
        COALESCE(SUM(CASE WHEN transaction_type = 'add' OR (transaction_type = 'adjust' AND quantity_change > 0) THEN quantity_change ELSE 0 END), 0) as total_added,
        COALESCE(SUM(CASE WHEN transaction_type = 'remove' OR (transaction_type = 'adjust' AND quantity_change < 0) THEN ABS(quantity_change) ELSE 0 END), 0) as total_removed,
        COALESCE(SUM(CASE WHEN transaction_type = 'sale' THEN quantity_sold ELSE 0 END), 0) as total_sold,
        COALESCE(SUM(CASE WHEN transaction_type = 'adjust' THEN ABS(quantity_change) ELSE 0 END), 0) as total_adjustments,
        MAX(created_at) as last_transaction_date,
        COUNT(*) as transaction_count
      FROM inventory_transactions
      WHERE table_id = ${tableId}
      GROUP BY item_id, table_id, table_name
      ORDER BY transaction_count DESC
    `

    const totalQuantity = itemSummaries.reduce((sum, item) => sum + item.current_quantity, 0)

    return {
      table_id: tableOverview.table_id,
      table_name: tableOverview.table_name,
      total_items: tableOverview.total_items,
      total_quantity: totalQuantity,
      total_transactions: tableOverview.total_transactions,
      items: itemSummaries as ItemInventorySummary[]
    }
  }

  /**
   * Process bulk inventory adjustments
   */
  async processBulkAdjustments(request: BulkInventoryAdjustmentRequest): Promise<InventoryAdjustmentResult> {
    const transactionIds: string[] = []
    const errors: Array<{ item_id: string; error: string }> = []
    let processedCount = 0

    for (const adjustment of request.adjustments) {
      try {
        const transaction = await this.createTransaction({
          table_id: adjustment.table_id,
          table_name: 'Bulk Adjustment', // This should be resolved from actual table
          item_id: adjustment.item_id,
          transaction_type: 'adjust',
          quantity_change: adjustment.quantity_change,
          created_by: request.created_by
        })

        transactionIds.push(transaction.id)
        processedCount++
      } catch (error) {
        errors.push({
          item_id: adjustment.item_id,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return {
      success: errors.length === 0,
      processed_count: processedCount,
      errors,
      transaction_ids: transactionIds
    }
  }

  /**
   * Check stock levels and generate alerts
   */
  async checkStockLevels(request: StockLevelCheckRequest): Promise<StockLevelCheckResponse> {
    const lowStockThreshold = request.low_stock_threshold || 5
    let whereConditions = ''
    const whereParams: any[] = []

    if (request.table_id) {
      whereConditions += ` AND it.table_id = ?`
      whereParams.push(request.table_id)
    }

    // Get current stock levels grouped by item
    const stockLevels = await this.prisma.$queryRawUnsafe<Array<{
      item_id: string
      table_id: string
      table_name: string
      item_name: string
      current_quantity: number
    }>>(`
      SELECT
        it.item_id,
        it.table_id,
        it.table_name,
        COALESCE(JSON_EXTRACT(it.new_data, '$.name'), JSON_EXTRACT(it.previous_data, '$.name'), 'Unknown Item') as item_name,
        COALESCE(SUM(CASE
          WHEN transaction_type IN ('add', 'adjust') AND quantity_change > 0 THEN quantity_change
          WHEN transaction_type = 'sale' THEN -quantity_change
          WHEN transaction_type IN ('remove', 'adjust') AND quantity_change < 0 THEN quantity_change
          ELSE 0
        END), 0) as current_quantity
      FROM inventory_transactions it
      WHERE 1=1 ${whereConditions}
      GROUP BY it.item_id, it.table_id, it.table_name
      HAVING current_quantity <= ?
      ORDER BY current_quantity ASC
    `, ...whereParams, lowStockThreshold)

    // Generate alerts
    const alerts: InventoryAlert[] = stockLevels.map(item => ({
      item_id: item.item_id,
      table_id: item.table_id,
      table_name: item.table_name,
      item_name: item.item_name || 'Unknown Item',
      current_quantity: item.current_quantity,
      threshold: lowStockThreshold,
      alert_type: item.current_quantity <= 0 ? 'out_of_stock' :
                 item.current_quantity < 0 ? 'negative_stock' : 'low_stock'
    }))

    // Count different types of alerts
    const lowStockCount = alerts.filter(a => a.alert_type === 'low_stock').length
    const outOfStockCount = alerts.filter(a => a.alert_type === 'out_of_stock').length
    const negativeStockCount = alerts.filter(a => a.alert_type === 'negative_stock').length

    return {
      alerts,
      total_items_checked: stockLevels.length,
      low_stock_count: lowStockCount,
      out_of_stock_count: outOfStockCount,
      negative_stock_count: negativeStockCount
    }
  }

  /**
   * Get transactions for a specific sale
   */
  async findTransactionsBySale(saleId: string): Promise<InventoryTransactionWithData[]> {
    const transactions = await this.prisma.$queryRaw<InventoryTransaction[]>`
      SELECT
        id, table_id, table_name, item_id, transaction_type, quantity_change,
        previous_data, new_data, reference_id, created_by, created_at
      FROM inventory_transactions
      WHERE reference_id = ${saleId}
      ORDER BY created_at ASC
    `

    return transactions.map(transaction => ({
      ...transaction,
      previous_data: transaction.previous_data ? JSON.parse(transaction.previous_data) as ParsedInventoryData : null,
      new_data: transaction.new_data ? JSON.parse(transaction.new_data) as ParsedInventoryData : null
    }))
  }

  /**
   * Delete transactions (for cleanup or testing)
   */
  async deleteTransactionsByReferenceId(referenceId: string): Promise<number> {
    const result = await this.prisma.$executeRaw`
      DELETE FROM inventory_transactions WHERE reference_id = ${referenceId}
    `
    return result
  }
}