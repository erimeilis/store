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
    // Use Prisma create method instead of raw SQL
    const createdTransaction = await this.prisma.inventoryTransaction.create({
      data: {
        tableId: request.tableId,
        tableName: request.tableName,
        itemId: request.itemId,
        transactionType: request.transactionType,
        quantityChange: request.quantityChange || null,
        previousData: request.previousData ? JSON.stringify(request.previousData) : null,
        newData: request.newData ? JSON.stringify(request.newData) : null,
        referenceId: request.referenceId || null,
        createdBy: request.createdBy
      }
    })

    // Return Prisma model directly since we now use camelCase throughout
    return createdTransaction as InventoryTransaction
  }

  /**
   * Find transaction by ID
   */
  async findTransactionById(transactionId: string): Promise<InventoryTransaction | null> {
    const transaction = await this.prisma.inventoryTransaction.findUnique({
      where: {
        id: transactionId
      }
    })

    if (!transaction) {
      return null
    }

    // Return Prisma model directly since we now use camelCase throughout
    return transaction as InventoryTransaction
  }

  /**
   * List inventory transactions with filtering, sorting, and pagination
   * Uses proper Prisma ORM patterns with dynamic JSON field searching
   */
  async findTransactions(query: InventoryTransactionListQuery): Promise<InventoryTransactionListResponse> {
    const page = query.page || 1
    const limit = Math.min(query.limit || 20, 100) // Max 100 items per page
    const skip = (page - 1) * limit

    // Build Prisma where clause using proper ORM patterns
    const where: any = {}

    // Basic filters
    if (query.tableId) {
      where.tableId = query.tableId
    }

    if (query.itemId) {
      where.itemId = query.itemId
    }

    if (query.transactionType) {
      where.transactionType = query.transactionType
    }

    if (query.createdBy) {
      where.createdBy = query.createdBy
    }

    if (query.referenceId) {
      where.referenceId = query.referenceId
    }

    // Date range filters
    if (query.dateFrom || query.dateTo) {
      where.createdAt = {}
      if (query.dateFrom) {
        where.createdAt.gte = new Date(query.dateFrom)
      }
      if (query.dateTo) {
        where.createdAt.lte = new Date(query.dateTo)
      }
    }

    // Table name search
    if (query.tableNameSearch) {
      where.tableName = {
        contains: query.tableNameSearch
      }
    }

    // Dynamic JSON field search for any field in the data
    // Since JSON fields are stored as String in SQLite, use string contains
    // Note: SQLite doesn't support case-insensitive contains in Prisma
    if (query.itemSearch) {
      where.OR = [
        // Search in newData string field (contains JSON)
        {
          newData: {
            contains: query.itemSearch
          }
        },
        // Search in previousData string field (contains JSON)
        {
          previousData: {
            contains: query.itemSearch
          }
        }
      ]
    }

    // Quantity change filter
    if (query.quantityChange) {
      // Convert search term to number if possible, otherwise use string search
      const numericValue = parseFloat(query.quantityChange)
      if (!isNaN(numericValue)) {
        where.quantityChange = numericValue
      }
    }

    // Build order by clause using camelCase
    const orderBy: any = {}
    const sortField = query.sortBy || 'createdAt'
    const sortDirection = query.sortOrder || 'desc'

    // Validate sort fields (now using camelCase)
    const allowedSortFields = ['createdAt', 'transactionType', 'quantityChange', 'tableName']
    if (allowedSortFields.includes(sortField)) {
      orderBy[sortField] = sortDirection
    } else {
      orderBy.createdAt = 'desc' // Default fallback
    }

    // Debug logging
    console.log('🔍 Prisma Query Debug:', {
      where: JSON.stringify(where, null, 2),
      orderBy: JSON.stringify(orderBy, null, 2),
      skip,
      limit,
      sortField
    })

    // Execute queries using Prisma ORM
    const [transactions, totalCount] = await Promise.all([
      this.prisma.inventoryTransaction.findMany({
        where,
        orderBy,
        skip,
        take: limit
      }),
      this.prisma.inventoryTransaction.count({ where })
    ])

    // Parse JSON data fields and map to expected format
    const transactionsWithData: InventoryTransactionWithData[] = transactions.map(transaction => ({
      id: transaction.id,
      tableId: transaction.tableId,
      tableName: transaction.tableName,
      itemId: transaction.itemId,
      transactionType: transaction.transactionType as any,
      quantityChange: transaction.quantityChange,
      referenceId: transaction.referenceId,
      createdBy: transaction.createdBy,
      createdAt: transaction.createdAt,
      previousData: transaction.previousData ?
        (typeof transaction.previousData === 'string' ?
          JSON.parse(transaction.previousData) :
          transaction.previousData) as ParsedInventoryData : null,
      newData: transaction.newData ?
        (typeof transaction.newData === 'string' ?
          JSON.parse(transaction.newData) :
          transaction.newData) as ParsedInventoryData : null
    }))

    return {
      data: transactionsWithData,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1
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
    // Build where clause using Prisma syntax
    const where: any = {}

    // Date filtering
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom)
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo)
      }
    }

    // Table filtering
    if (tableId) {
      where.tableId = tableId
    }

    // Overall metrics using count
    const totalTransactions = await this.prisma.inventoryTransaction.count({
      where
    })

    // Transactions by type using groupBy
    const transactionsByTypeResults = await this.prisma.inventoryTransaction.groupBy({
      by: ['transactionType'],
      where,
      _count: {
        _all: true
      },
      _sum: {
        quantityChange: true
      }
    })

    // Convert to record format
    const transactionsByType: Record<InventoryTransactionType, number> = {
      sale: 0,
      rent: 0,
      release: 0,
      add: 0,
      remove: 0,
      update: 0,
      adjust: 0
    }
    const quantityChangesByType: Record<InventoryTransactionType, number> = {
      sale: 0,
      rent: 0,
      release: 0,
      add: 0,
      remove: 0,
      update: 0,
      adjust: 0
    }

    transactionsByTypeResults.forEach(row => {
      const type = row.transactionType as InventoryTransactionType
      transactionsByType[type] = row._count._all
      quantityChangesByType[type] = row._sum.quantityChange || 0
    })

    // Most active tables using groupBy
    const mostActiveTables = await this.prisma.inventoryTransaction.groupBy({
      by: ['tableId', 'tableName'],
      where,
      _count: {
        _all: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    })

    // Most active items using groupBy
    const mostActiveItems = await this.prisma.inventoryTransaction.groupBy({
      by: ['itemId', 'tableName'],
      where,
      _count: {
        _all: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    })

    // For item names, we need to extract from JSON data
    const itemsWithNames = await Promise.all(
      mostActiveItems.map(async (item) => {
        // Get a sample transaction for this item to extract the name
        const sampleTransaction = await this.prisma.inventoryTransaction.findFirst({
          where: {
            itemId: item.itemId,
            OR: [
              { newData: { not: null } },
              { previousData: { not: null } }
            ]
          },
          select: {
            newData: true,
            previousData: true
          }
        })

        let itemName = 'Unknown Item'
        if (sampleTransaction) {
          // Try to extract name from JSON fields
          try {
            const newData = sampleTransaction.newData ? JSON.parse(sampleTransaction.newData) : null
            const previousData = sampleTransaction.previousData ? JSON.parse(sampleTransaction.previousData) : null

            // Look for common name fields
            const nameFields = ['name', 'product_name', 'item_name', 'title']
            for (const field of nameFields) {
              if (newData?.[field]) {
                itemName = newData[field]
                break
              }
              if (previousData?.[field]) {
                itemName = previousData[field]
                break
              }
            }
          } catch (e) {
            // JSON parsing failed, keep default name
          }
        }

        return {
          itemId: item.itemId,
          tableName: item.tableName,
          itemName: itemName,
          transactionCount: (item._count as any)?._all || (item._count as any)?.id || 0
        }
      })
    )

    // Activity by date - need to use date truncation
    // For SQLite, we'll use a simplified approach with findMany and process in memory
    const recentTransactions = await this.prisma.inventoryTransaction.findMany({
      where,
      select: {
        createdAt: true,
        quantityChange: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 1000 // Limit for performance
    })

    // Group by date in memory
    const dateGroups: Record<string, { count: number; quantityChange: number }> = {}
    recentTransactions.forEach(transaction => {
      const date = transaction.createdAt.toISOString().split('T')[0] || transaction.createdAt.toISOString().substring(0, 10) // YYYY-MM-DD
      if (!dateGroups[date]) {
        dateGroups[date] = { count: 0, quantityChange: 0 }
      }
      dateGroups[date]!.count++
      dateGroups[date]!.quantityChange += transaction.quantityChange || 0
    })

    // Convert to array and sort by date
    const activityByDate = Object.entries(dateGroups)
      .map(([date, data]) => ({
        date,
        transactionCount: data.count,
        quantityChange: data.quantityChange
      }))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 30)

    return {
      totalTransactions: totalTransactions,
      transactionsByType,
      quantityChangesByType,
      mostActiveTables: mostActiveTables.map(table => ({
        tableId: table.tableId,
        tableName: table.tableName,
        transactionCount: (table._count as any)?._all || (table._count as any)?.id || 0
      })),
      mostActiveItems: itemsWithNames,
      activityByDate
    }
  }

  /**
   * Get inventory summary for an item
   */
  async getItemInventorySummary(tableId: string, itemId: string): Promise<ItemInventorySummary | null> {
    // Get all transactions for the item
    const transactions = await this.prisma.inventoryTransaction.findMany({
      where: {
        tableId,
        itemId
      },
      select: {
        transactionType: true,
        quantityChange: true,
        createdAt: true,
        tableName: true
      }
    })

    if (transactions.length === 0) {
      return null
    }

    // Calculate aggregations in memory
    let currentQuantity = 0
    let totalAdded = 0
    let totalRemoved = 0
    let totalSold = 0
    let totalAdjustments = 0
    let lastTransactionDate = new Date(0)

    transactions.forEach(tx => {
      const qty = tx.quantityChange || 0

      // Update last transaction date
      if (tx.createdAt > lastTransactionDate) {
        lastTransactionDate = tx.createdAt
      }

      // Calculate based on transaction type
      switch (tx.transactionType) {
        case 'add':
          totalAdded += qty
          currentQuantity += qty
          break
        case 'remove':
          totalRemoved += Math.abs(qty)
          currentQuantity += qty // qty is negative for remove
          break
        case 'sale':
          totalSold += Math.abs(qty)
          currentQuantity += qty // qty is negative for sale
          break
        case 'adjust':
          totalAdjustments += Math.abs(qty)
          if (qty > 0) {
            totalAdded += qty
          } else {
            totalRemoved += Math.abs(qty)
          }
          currentQuantity += qty
          break
        case 'update':
          // For updates, just track the quantity change
          currentQuantity += qty
          break
      }
    })

    return {
      itemId: itemId,
      tableId: tableId,
      tableName: transactions[0]?.tableName || 'Unknown Table',
      currentQuantity: currentQuantity,
      totalAdded: totalAdded,
      totalRemoved: totalRemoved,
      totalSold: totalSold,
      totalAdjustments: totalAdjustments,
      lastTransactionDate: lastTransactionDate,
      transactionCount: transactions.length
    }
  }

  /**
   * Get inventory summary for a table
   */
  async getTableInventorySummary(tableId: string): Promise<TableInventorySummary | null> {
    // Get all transactions for the table
    const transactions = await this.prisma.inventoryTransaction.findMany({
      where: {
        tableId
      },
      select: {
        itemId: true,
        tableName: true,
        transactionType: true,
        quantityChange: true,
        createdAt: true
      }
    })

    if (transactions.length === 0) {
      return null
    }

    // Group transactions by item
    const itemGroups: Record<string, typeof transactions> = {}
    transactions.forEach(tx => {
      if (!itemGroups[tx.itemId]) {
        itemGroups[tx.itemId] = []
      }
      itemGroups[tx.itemId]!.push(tx)
    })

    // Calculate item summaries
    const itemSummaries: ItemInventorySummary[] = []
    let totalQuantity = 0

    Object.entries(itemGroups).forEach(([itemId, itemTransactions]) => {
      if (!itemTransactions) return

      let currentQuantity = 0
      let totalAdded = 0
      let totalRemoved = 0
      let totalSold = 0
      let totalAdjustments = 0
      let lastTransactionDate = new Date(0)

      itemTransactions.forEach(tx => {
        const qty = tx.quantityChange || 0

        // Update last transaction date
        if (tx.createdAt > lastTransactionDate) {
          lastTransactionDate = tx.createdAt
        }

        // Calculate based on transaction type
        switch (tx.transactionType) {
          case 'add':
            totalAdded += qty
            currentQuantity += qty
            break
          case 'remove':
            totalRemoved += Math.abs(qty)
            currentQuantity += qty // qty is negative for remove
            break
          case 'sale':
            totalSold += Math.abs(qty)
            currentQuantity += qty // qty is negative for sale
            break
          case 'adjust':
            totalAdjustments += Math.abs(qty)
            if (qty > 0) {
              totalAdded += qty
            } else {
              totalRemoved += Math.abs(qty)
            }
            currentQuantity += qty
            break
          case 'update':
            // For updates, just track the quantity change
            currentQuantity += qty
            break
        }
      })

      totalQuantity += currentQuantity

      itemSummaries.push({
        itemId: itemId,
        tableId: tableId,
        tableName: itemTransactions[0]?.tableName || 'Unknown Table',
        currentQuantity: currentQuantity,
        totalAdded: totalAdded,
        totalRemoved: totalRemoved,
        totalSold: totalSold,
        totalAdjustments: totalAdjustments,
        lastTransactionDate: lastTransactionDate,
        transactionCount: itemTransactions.length
      })
    })

    // Sort by transaction count descending
    itemSummaries.sort((a, b) => b.transactionCount - a.transactionCount)

    return {
      tableId: tableId,
      tableName: transactions[0]?.tableName || 'Unknown Table',
      totalItems: Object.keys(itemGroups).length,
      totalQuantity: totalQuantity,
      totalTransactions: transactions.length,
      items: itemSummaries
    }
  }

  /**
   * Process bulk inventory adjustments
   */
  async processBulkAdjustments(request: BulkInventoryAdjustmentRequest): Promise<InventoryAdjustmentResult> {
    const transactionIds: string[] = []
    const errors: Array<{ itemId: string; error: string }> = []
    let processedCount = 0

    for (const adjustment of request.adjustments) {
      try {
        const transaction = await this.createTransaction({
          tableId: adjustment.tableId,
          tableName: 'Bulk Adjustment', // This should be resolved from actual table
          itemId: adjustment.itemId,
          transactionType: 'adjust',
          quantityChange: adjustment.quantityChange,
          createdBy: request.createdBy
        })

        transactionIds.push(transaction.id)
        processedCount++
      } catch (error) {
        errors.push({
          itemId: adjustment.itemId,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return {
      success: errors.length === 0,
      processedCount: processedCount,
      errors,
      transactionIds: transactionIds
    }
  }

  /**
   * Check stock levels and generate alerts
   */
  async checkStockLevels(request: StockLevelCheckRequest): Promise<StockLevelCheckResponse> {
    const lowStockThreshold = request.lowStockThreshold || 5

    // Build where clause for Prisma
    const where: any = {}
    if (request.tableId) {
      where.tableId = request.tableId
    }

    // Get all transactions grouped by item using Prisma
    const transactionsByItem = await this.prisma.inventoryTransaction.groupBy({
      by: ['itemId', 'tableId', 'tableName'],
      where,
      _sum: {
        quantityChange: true
      }
    })

    // Get unique table IDs to check their types
    const uniqueTableIds = Array.from(new Set(transactionsByItem.map(g => g.tableId)))

    // Fetch table types to exclude 'rent' tables (stock doesn't apply to rentals)
    const tables = await this.prisma.userTable.findMany({
      where: {
        id: { in: uniqueTableIds }
      },
      select: {
        id: true,
        tableType: true
      }
    })

    // Create a map of tableId -> tableType for quick lookup
    const tableTypeMap = new Map(tables.map(t => [t.id, t.tableType]))

    // Filter out rent tables - stock alerts don't make sense for rentals
    // (rented + released = 0 stock, but item is actually available)
    const saleTableTransactions = transactionsByItem.filter(group => {
      const tableType = tableTypeMap.get(group.tableId)
      return tableType !== 'rent'
    })

    // Get sample data for each item to extract names
    const itemDataPromises = saleTableTransactions.map(async (group) => {
      // Get the most recent transaction for this item that has data
      const sampleTransaction = await this.prisma.inventoryTransaction.findFirst({
        where: {
          itemId: group.itemId,
          tableId: group.tableId,
          OR: [
            { newData: { not: null } },
            { previousData: { not: null } }
          ]
        },
        select: {
          newData: true,
          previousData: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      let itemName = 'Unknown Item'
      if (sampleTransaction) {
        try {
          const data = sampleTransaction.newData
            ? JSON.parse(sampleTransaction.newData)
            : sampleTransaction.previousData
              ? JSON.parse(sampleTransaction.previousData)
              : null

          if (data) {
            // Helper function to extract item name from data
            // Priority: common name fields first
            const nameFields = ['name', 'productName', 'itemName', 'title', 'description']
            for (const field of nameFields) {
              if (data[field] && typeof data[field] === 'string') {
                itemName = data[field]
                break
              }
            }

            // Handle phone numbers: combine number with country/area
            if (itemName === 'Unknown Item' && data.number) {
              const parts = [String(data.number)]
              if (data.country) parts.push(`(${data.country})`)
              else if (data.area) parts.push(`(${data.area})`)
              itemName = parts.join(' ')
            }

            // If still no name, use first string field (but skip price-like fields)
            if (itemName === 'Unknown Item') {
              const skipFields = ['id', 'price', 'fee', 'cost', 'amount']
              for (const [key, value] of Object.entries(data)) {
                if (typeof value === 'string' && value.trim() && !skipFields.includes(key.toLowerCase())) {
                  itemName = value
                  break
                }
              }
            }
          }
        } catch (error) {
          console.error('Error parsing item data:', error)
        }
      }

      return {
        itemId: group.itemId,
        tableId: group.tableId,
        tableName: group.tableName,
        itemName: itemName,
        currentQuantity: group._sum.quantityChange || 0
      }
    })

    const itemsWithData = await Promise.all(itemDataPromises)

    // Filter items that are at or below threshold
    const lowStockItems = itemsWithData.filter(item =>
      item.currentQuantity <= lowStockThreshold
    )

    // Generate alerts
    const alerts: InventoryAlert[] = lowStockItems.map(item => ({
      itemId: item.itemId,
      tableId: item.tableId,
      tableName: item.tableName,
      itemName: item.itemName,
      currentQuantity: item.currentQuantity,
      threshold: lowStockThreshold,
      alertType: item.currentQuantity < 0 ? 'negative_stock' :
                 item.currentQuantity === 0 ? 'out_of_stock' : 'low_stock'
    }))

    // Sort by quantity ascending (most critical first)
    alerts.sort((a, b) => a.currentQuantity - b.currentQuantity)

    // Count different types of alerts
    const lowStockCount = alerts.filter(a => a.alertType === 'low_stock').length
    const outOfStockCount = alerts.filter(a => a.alertType === 'out_of_stock').length
    const negativeStockCount = alerts.filter(a => a.alertType === 'negative_stock').length

    return {
      alerts,
      totalItemsChecked: itemsWithData.length,
      lowStockCount: lowStockCount,
      outOfStockCount: outOfStockCount,
      negativeStockCount: negativeStockCount
    }
  }

  /**
   * Get transactions for a specific sale
   */
  async findTransactionsBySale(saleId: string): Promise<InventoryTransactionWithData[]> {
    const transactions = await this.prisma.inventoryTransaction.findMany({
      where: {
        referenceId: saleId
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return transactions.map(transaction => ({
      id: transaction.id,
      tableId: transaction.tableId,
      tableName: transaction.tableName,
      itemId: transaction.itemId,
      transactionType: transaction.transactionType as any,
      quantityChange: transaction.quantityChange,
      referenceId: transaction.referenceId,
      createdBy: transaction.createdBy,
      createdAt: transaction.createdAt,
      previousData: transaction.previousData ? JSON.parse(transaction.previousData) as ParsedInventoryData : null,
      newData: transaction.newData ? JSON.parse(transaction.newData) as ParsedInventoryData : null
    }))
  }

  /**
   * Delete transactions (for cleanup or testing)
   */
  async deleteTransactionsByReferenceId(referenceId: string): Promise<number> {
    const result = await this.prisma.inventoryTransaction.deleteMany({
      where: {
        referenceId: referenceId
      }
    })
    return result.count
  }

  /**
   * Clear transactions based on query filters (same logic as findTransactions)
   */
  async clearTransactions(query: InventoryTransactionListQuery): Promise<number> {
    // Build Prisma where clause using same logic as findTransactions
    const where: any = {}

    // Basic filters
    if (query.tableId) {
      where.tableId = query.tableId
    }

    if (query.itemId) {
      where.itemId = query.itemId
    }

    if (query.transactionType) {
      where.transactionType = query.transactionType
    }

    if (query.createdBy) {
      where.createdBy = query.createdBy
    }

    if (query.referenceId) {
      where.referenceId = query.referenceId
    }

    // Date range filters
    if (query.dateFrom || query.dateTo) {
      where.createdAt = {}
      if (query.dateFrom) {
        where.createdAt.gte = new Date(query.dateFrom)
      }
      if (query.dateTo) {
        where.createdAt.lte = new Date(query.dateTo)
      }
    }

    // Table name search
    if (query.tableNameSearch) {
      where.tableName = {
        contains: query.tableNameSearch
      }
    }

    // Dynamic JSON field search for any field in the data
    if (query.itemSearch) {
      where.OR = [
        // Search in newData string field (contains JSON)
        {
          newData: {
            contains: query.itemSearch
          }
        },
        // Search in previousData string field (contains JSON)
        {
          previousData: {
            contains: query.itemSearch
          }
        }
      ]
    }

    // Quantity change filter
    if (query.quantityChange) {
      // Convert search term to number if possible, otherwise use string search
      const numericValue = parseFloat(query.quantityChange)
      if (!isNaN(numericValue)) {
        where.quantityChange = numericValue
      }
    }

    // Execute delete with the same filters
    const result = await this.prisma.inventoryTransaction.deleteMany({
      where
    })

    return result.count
  }
}