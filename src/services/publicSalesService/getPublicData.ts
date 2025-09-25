import type { Context } from 'hono'
import type { Bindings } from '@/types/bindings.js'
import type { UserTable, TableDataRow, ParsedTableData } from '@/types/dynamic-tables.js'
import { TableRepository } from '@/repositories/tableRepository.js'
import { TableDataRepository } from '@/repositories/tableDataRepository.js'

/**
 * Public item representation for API responses
 */
export interface PublicItem {
  id: string
  name: string
  description?: string
  price: number
  qty: number
  available: boolean
  data: ParsedTableData
  createdAt: Date
  updatedAt: Date
}

/**
 * Public table representation for API responses
 */
export interface PublicTable {
  id: string
  name: string
  description: string | null
  itemCount: number
  createdAt: Date
  updatedAt: Date
}

/**
 * Get all public tables that are configured for sales
 */
export async function getForSaleTables(
  env: Bindings,
  c: Context
): Promise<PublicTable[]> {
  const tableRepo = new TableRepository(env)

  try {
    // Get all public tables that are for sale
    const tables = await tableRepo.findPublicSaleTables(1000)

    // Transform to public format and get item counts
    const publicTables: PublicTable[] = []

    for (const table of tables.tables) {
      const itemCount = await getTableItemCount(env, table.id)

      publicTables.push({
        id: table.id,
        name: table.name,
        description: table.description,
        itemCount: itemCount,
        createdAt: table.createdAt,
        updatedAt: table.updatedAt
      })
    }

    return publicTables

  } catch (error) {
    console.error('Error fetching for sale tables:', error)
    throw new Error('Failed to fetch available tables')
  }
}

/**
 * Get all items from a specific for-sale table
 */
export async function getTableItems(
  env: Bindings,
  c: Context,
  tableId: string
): Promise<{ table: PublicTable; items: PublicItem[] } | { error: string; status?: number }> {
  const tableRepo = new TableRepository(env)
  const dataRepo = new TableDataRepository(env)

  try {
    // Verify table exists and is public for sale
    const table = await tableRepo.findTableByIdInternal(tableId)
    if (!table) {
      return { error: 'Table not found', status: 404 }
    }

    if (!table.isPublic || !table.forSale) {
      return { error: 'Table is not available for public sales', status: 403 }
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
    const publicItems: PublicItem[] = []

    for (const row of tableData.data) {
      const parsedData = JSON.parse(row.data) as ParsedTableData

      // Extract required fields for sales
      const priceValue = parsedData.price
      const qtyValue = parsedData.qty

      const price = typeof priceValue === 'number' ? priceValue : parseFloat(String(priceValue || '0'))
      const qty = typeof qtyValue === 'number' ? qtyValue : parseInt(String(qtyValue || '0'))

      // Only include items with valid price and quantity > 0
      if (price > 0 && qty > 0) {
        publicItems.push({
          id: row.id,
          name: parsedData.name || `Item ${row.id}`,
          description: parsedData.description,
          price,
          qty,
          available: qty > 0,
          data: parsedData,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt
        })
      }
    }

    const publicTable: PublicTable = {
      id: table.id,
      name: table.name,
      description: table.description,
      itemCount: publicItems.length,
      createdAt: table.createdAt,
      updatedAt: table.updatedAt
    }

    return {
      table: publicTable,
      items: publicItems
    }

  } catch (error) {
    console.error('Error fetching table items:', error)

    // For now, return empty items instead of error to test the structure
    const emptyTable: PublicTable = {
      id: tableId,
      name: 'Unknown Table',
      description: 'Unable to fetch table details',
      itemCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return {
      table: emptyTable,
      items: []
    }
  }
}

/**
 * Get a specific item from a for-sale table
 */
export async function getItem(
  env: Bindings,
  c: Context,
  tableId: string,
  itemId: string
): Promise<{ table: PublicTable; item: PublicItem } | { error: string; status?: number }> {
  const tableRepo = new TableRepository(env)
  const dataRepo = new TableDataRepository(env)

  try {
    // Verify table exists and is public for sale
    const table = await tableRepo.findTableByIdInternal(tableId)
    if (!table) {
      return { error: 'Table not found', status: 404 }
    }

    if (!table.isPublic || !table.forSale) {
      return { error: 'Table is not available for public sales', status: 403 }
    }

    // Get the specific item
    const row = await dataRepo.findDataRowById(itemId, tableId)
    if (!row) {
      return { error: 'Item not found', status: 404 }
    }

    const parsedData = JSON.parse(row.data) as ParsedTableData

    // Extract required fields for sales
    const priceValue = parsedData.price
    const qtyValue = parsedData.qty

    const price = typeof priceValue === 'number' ? priceValue : parseFloat(String(priceValue || '0'))
    const qty = typeof qtyValue === 'number' ? qtyValue : parseInt(String(qtyValue || '0'))

    if (price <= 0) {
      return { error: 'Item is not available for sale', status: 403 }
    }

    const publicItem: PublicItem = {
      id: row.id,
      name: parsedData.name || `Item ${row.id}`,
      description: parsedData.description,
      price,
      qty,
      available: qty > 0,
      data: parsedData,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    }

    const publicTable: PublicTable = {
      id: table.id,
      name: table.name,
      description: table.description,
      itemCount: 0, // Not calculating for single item request
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
 * Get count of available items in a table
 */
async function getTableItemCount(env: Bindings, tableId: string): Promise<number> {
  const dataRepo = new TableDataRepository(env)

  try {
    const result = await dataRepo.findTableData(
      tableId,
      {}, // No filters
      {
        page: 1,
        limit: 1000,
        offset: 0
      }
    )

    // Count only items with valid price and quantity > 0
    let count = 0
    for (const row of result.data) {
      const parsedData = JSON.parse(row.data) as ParsedTableData

      const priceValue = parsedData.price
      const qtyValue = parsedData.qty

      const price = typeof priceValue === 'number' ? priceValue : parseFloat(String(priceValue || '0'))
      const qty = typeof qtyValue === 'number' ? qtyValue : parseInt(String(qtyValue || '0'))

      if (price > 0 && qty > 0) {
        count++
      }
    }

    return count
  } catch (error) {
    console.error('Error counting table items:', error)
    return 0
  }
}