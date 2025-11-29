import type { Context } from 'hono'
import type { Bindings } from '@/types/bindings.js'
import type { ParsedTableData } from '@/types/dynamic-tables.js'
import type { RentalItemAvailability } from '@/types/rentals.js'
import { TableRepository } from '@/repositories/tableRepository.js'
import { TableDataRepository } from '@/repositories/tableDataRepository.js'
import { RentalRepository } from '@/repositories/rentalRepository.js'
import { canRentItem } from '@/types/rentals.js'

/**
 * Public rental item representation for API responses
 */
export interface PublicRentalItem {
  id: string
  name: string
  description?: string
  price: number
  used: boolean
  available: boolean
  canRent: boolean
  data: ParsedTableData
  createdAt: Date
  updatedAt: Date
}

/**
 * Public rental table representation for API responses
 */
export interface PublicRentalTable {
  id: string
  name: string
  description: string | null
  availableCount: number // Items that can be rented
  totalCount: number // All items
  createdAt: Date
  updatedAt: Date
}

/**
 * Get all public tables that are configured for rentals
 */
export async function getForRentTables(
  env: Bindings,
  c: Context
): Promise<PublicRentalTable[]> {
  const tableRepo = new TableRepository(env)

  try {
    // Get all public tables that are for rent
    const tables = await tableRepo.findPublicTablesByType('rent', 1000)

    // Transform to public format and get item counts
    const publicTables: PublicRentalTable[] = []

    for (const table of tables.tables) {
      const counts = await getTableItemCounts(env, table.id)

      publicTables.push({
        id: table.id,
        name: table.name,
        description: table.description,
        availableCount: counts.available,
        totalCount: counts.total,
        createdAt: table.createdAt,
        updatedAt: table.updatedAt
      })
    }

    return publicTables

  } catch (error) {
    console.error('Error fetching for rent tables:', error)
    throw new Error('Failed to fetch available rental tables')
  }
}

/**
 * Get all items from a specific for-rent table
 */
export async function getTableItems(
  env: Bindings,
  c: Context,
  tableId: string
): Promise<{ table: PublicRentalTable; items: PublicRentalItem[] } | { error: string; status?: number }> {
  const tableRepo = new TableRepository(env)
  const dataRepo = new TableDataRepository(env)

  try {
    // Verify table exists and is public for rent
    const table = await tableRepo.findTableByIdInternal(tableId)
    if (!table) {
      return { error: 'Table not found', status: 404 }
    }

    if (!['public', 'shared'].includes(table.visibility) || table.tableType !== 'rent') {
      return { error: 'Table is not available for public rentals', status: 403 }
    }

    // Get table columns to understand column structure
    const columns = await tableRepo.getTableColumns(tableId)
    if (!columns || columns.length === 0) {
      return { error: 'Table columns not found', status: 404 }
    }

    // Get all items from the table
    const tableData = await dataRepo.findTableData(
      tableId,
      {}, // No filters - get all items
      {
        page: 1,
        limit: 1000, // Allow up to 1000 items per table
        offset: 0
      }
    )

    // Transform items to public format
    const publicItems: PublicRentalItem[] = []

    for (const row of tableData.data) {
      // row.data is already parsed by findTableData
      const parsedData = (typeof row.data === 'string' ? JSON.parse(row.data) : row.data) as ParsedTableData

      // Extract required fields for rentals
      const priceValue = parsedData.price
      const usedValue = parsedData.used
      const availableValue = parsedData.available

      const price = typeof priceValue === 'number' ? priceValue : parseFloat(String(priceValue || '0'))
      const used = usedValue === true || usedValue === 'true'
      const available = availableValue === true || availableValue === 'true'

      // Only include items with valid price
      if (price > 0) {
        publicItems.push({
          id: row.id,
          name: parsedData.name || `Item ${row.id}`,
          description: parsedData.description,
          price,
          used,
          available,
          canRent: canRentItem(used, available),
          data: parsedData,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt
        })
      }
    }

    const publicTable: PublicRentalTable = {
      id: table.id,
      name: table.name,
      description: table.description,
      availableCount: publicItems.filter(item => item.canRent).length,
      totalCount: publicItems.length,
      createdAt: table.createdAt,
      updatedAt: table.updatedAt
    }

    return {
      table: publicTable,
      items: publicItems
    }

  } catch (error) {
    console.error('Error fetching table items:', error)
    return { error: 'Failed to fetch table items', status: 500 }
  }
}

/**
 * Get a specific item from a for-rent table
 */
export async function getItem(
  env: Bindings,
  c: Context,
  tableId: string,
  itemId: string
): Promise<{ table: PublicRentalTable; item: PublicRentalItem } | { error: string; status?: number }> {
  const tableRepo = new TableRepository(env)
  const dataRepo = new TableDataRepository(env)

  try {
    // Verify table exists and is public for rent
    const table = await tableRepo.findTableByIdInternal(tableId)
    if (!table) {
      return { error: 'Table not found', status: 404 }
    }

    if (!['public', 'shared'].includes(table.visibility) || table.tableType !== 'rent') {
      return { error: 'Table is not available for public rentals', status: 403 }
    }

    // Get the specific item
    const row = await dataRepo.findDataRowById(itemId, tableId)
    if (!row) {
      return { error: 'Item not found', status: 404 }
    }

    const parsedData = row.data

    // Extract required fields for rentals
    const priceValue = parsedData.price
    const usedValue = parsedData.used
    const availableValue = parsedData.available

    const price = typeof priceValue === 'number' ? priceValue : parseFloat(String(priceValue || '0'))
    const used = usedValue === true || usedValue === 'true'
    const available = availableValue === true || availableValue === 'true'

    if (price <= 0) {
      return { error: 'Item is not available for rent', status: 403 }
    }

    const publicItem: PublicRentalItem = {
      id: row.id,
      name: parsedData.name || `Item ${row.id}`,
      description: parsedData.description,
      price,
      used,
      available,
      canRent: canRentItem(used, available),
      data: parsedData,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    }

    const publicTable: PublicRentalTable = {
      id: table.id,
      name: table.name,
      description: table.description,
      availableCount: 0, // Not calculating for single item request
      totalCount: 0,
      createdAt: table.createdAt,
      updatedAt: table.updatedAt
    }

    return {
      table: publicTable,
      item: publicItem
    }

  } catch (error) {
    console.error('Error fetching item:', error)
    return { error: 'Failed to fetch item details', status: 500 }
  }
}

/**
 * Check item availability for rental
 */
export async function checkRentalAvailability(
  env: Bindings,
  c: Context,
  tableId: string,
  itemId: string
): Promise<RentalItemAvailability | { error: string; status?: number }> {
  const tableRepo = new TableRepository(env)
  const dataRepo = new TableDataRepository(env)
  const rentalRepo = new RentalRepository(env)

  try {
    // Verify table exists and is public for rent
    const table = await tableRepo.findTableByIdInternal(tableId)
    if (!table) {
      return { error: 'Table not found', status: 404 }
    }

    if (!['public', 'shared'].includes(table.visibility) || table.tableType !== 'rent') {
      return { error: 'Table is not available for public rentals', status: 403 }
    }

    // Get the specific item
    const row = await dataRepo.findDataRowById(itemId, tableId)
    if (!row) {
      return { error: 'Item not found', status: 404 }
    }

    const parsedData = row.data

    // Extract rental fields
    const priceValue = parsedData.price
    const usedValue = parsedData.used
    const availableValue = parsedData.available

    const price = typeof priceValue === 'number' ? priceValue : parseFloat(String(priceValue || '0'))
    const used = usedValue === true || usedValue === 'true'
    const available = availableValue === true || availableValue === 'true'

    if (price <= 0) {
      return { error: 'Item is not available for rent', status: 403 }
    }

    // Check if there's an active rental for this item
    const activeRental = await rentalRepo.findActiveRentalByItem(tableId, itemId)

    const result: RentalItemAvailability = {
      available: canRentItem(used, available),
      used,
      currentlyRented: !available && !used, // Item is rented if not available but not used
      rentalPrice: price
    }

    if (activeRental?.id) {
      result.activeRentalId = activeRental.id
    }

    return result

  } catch (error) {
    console.error('Error checking rental availability:', error)
    return { error: 'Failed to check rental availability', status: 500 }
  }
}

/**
 * Get count of items in a rental table
 */
async function getTableItemCounts(
  env: Bindings,
  tableId: string
): Promise<{ available: number; total: number }> {
  const dataRepo = new TableDataRepository(env)

  try {
    const result = await dataRepo.findTableData(
      tableId,
      {},
      {
        page: 1,
        limit: 1000,
        offset: 0
      }
    )

    let available = 0
    let total = 0

    for (const row of result.data) {
      const parsedData = (typeof row.data === 'string' ? JSON.parse(row.data) : row.data) as ParsedTableData

      const priceValue = parsedData.price
      const usedValue = parsedData.used
      const availableValue = parsedData.available

      const price = typeof priceValue === 'number' ? priceValue : parseFloat(String(priceValue || '0'))
      const used = usedValue === true || usedValue === 'true'
      const isAvailable = availableValue === true || availableValue === 'true'

      if (price > 0) {
        total++
        if (canRentItem(used, isAvailable)) {
          available++
        }
      }
    }

    return { available, total }
  } catch (error) {
    console.error('Error counting table items:', error)
    return { available: 0, total: 0 }
  }
}
