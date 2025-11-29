import type { Context } from 'hono'
import type { Bindings } from '@/types/bindings.js'
import type { UserContext } from '@/types/database.js'
import type { CreateRentalRequest, ReleaseRentalRequest, Rental, RentalItemSnapshot } from '@/types/rentals.js'
import { canRentItem, canReleaseItem, getStateAfterRent, getStateAfterRelease } from '@/types/rentals.js'
import { TableRepository } from '@/repositories/tableRepository.js'
import { TableDataRepository } from '@/repositories/tableDataRepository.js'
import { RentalRepository } from '@/repositories/rentalRepository.js'
import { InventoryTrackingService } from '@/services/inventoryTrackingService/index.js'

/**
 * Rent an item (create rental and mark item as unavailable)
 */
export async function rentItem(
  env: Bindings,
  c: Context,
  user: UserContext,
  data: CreateRentalRequest
): Promise<{ rental: Rental } | { error: string; status?: number }> {
  const tableRepo = new TableRepository(env)
  const dataRepo = new TableDataRepository(env)
  const rentalRepo = new RentalRepository(env)
  const inventoryService = new InventoryTrackingService(env)

  try {
    // 1. Verify table exists and is public for rent
    const table = await tableRepo.findTableByIdInternal(data.tableId)
    if (!table) {
      return { error: 'Table not found', status: 404 }
    }

    if (!['public', 'shared'].includes(table.visibility) || table.tableType !== 'rent') {
      return { error: 'Table is not available for public rentals', status: 403 }
    }

    // 2. Get the specific item and check availability
    const row = await dataRepo.findDataRowById(data.itemId, data.tableId)
    if (!row) {
      return { error: 'Item not found', status: 404 }
    }

    // row.data is already parsed by findDataRowById
    const parsedData = row.data

    // 3. Extract rental fields
    const priceValue = parsedData.price
    const usedValue = parsedData.used
    const availableValue = parsedData.available

    const price = typeof priceValue === 'number' ? priceValue : parseFloat(String(priceValue || '0'))
    const used = usedValue === true || usedValue === 'true'
    const available = availableValue === true || availableValue === 'true'

    // 4. Validate price
    if (price <= 0) {
      return { error: 'Item is not available for rent', status: 403 }
    }

    // 5. Check rental state machine - can we rent this item?
    if (!canRentItem(used, available)) {
      if (used) {
        return {
          error: 'Item has already been used and cannot be rented again',
          status: 400
        }
      }
      if (!available) {
        return {
          error: 'Item is currently rented and not available',
          status: 400
        }
      }
      return {
        error: 'Item is not available for rent',
        status: 400
      }
    }

    // 6. Generate rental number
    const currentYear = new Date().getFullYear()
    const rentalNumber = await rentalRepo.getNextRentalNumber(currentYear)

    // 7. Create the rental record
    const rental = await rentalRepo.createRental(
      data,
      { id: table.id, name: table.name },
      { id: row.id, data: parsedData },
      rentalNumber,
      price
    )

    // 8. Update item state - mark as not available (rented)
    const newState = getStateAfterRent()
    const updatedData = {
      ...parsedData,
      used: newState.used,
      available: newState.available
    }

    try {
      await dataRepo.updateDataRow(data.itemId, data.tableId, updatedData)
    } catch (updateError) {
      console.error('Error updating item state after rental:', updateError)
      // Rental was created but state update failed
      // In production, you might want to implement compensation logic
    }

    // 9. Track the rental in inventory tracking
    console.log('🔍 About to track rental in inventory:', {
      tableId: table.id,
      tableName: table.name,
      itemId: row.id,
      rentalId: rental.id,
      createdBy: user.id || 'system'
    })
    try {
      await inventoryService.logInventoryTransaction({
        tableId: table.id,
        tableName: table.name,
        itemId: row.id,
        transactionType: 'rent',
        previousData: parsedData,
        newData: updatedData,
        referenceId: rental.id,
        createdBy: user.id || 'system'
      })
      console.log('✅ Inventory tracking completed for rental')
    } catch (trackError) {
      console.error('❌ Error tracking rental in inventory:', trackError)
      // Don't fail the rental if tracking fails
    }

    return { rental }

  } catch (error) {
    console.error('Error processing rental:', error)
    throw new Error('Failed to process rental')
  }
}

/**
 * Release a rented item (mark as released and update item state)
 */
export async function releaseItem(
  env: Bindings,
  c: Context,
  user: UserContext,
  data: ReleaseRentalRequest
): Promise<{ rental: Rental; message: string } | { error: string; status?: number }> {
  const tableRepo = new TableRepository(env)
  const dataRepo = new TableDataRepository(env)
  const rentalRepo = new RentalRepository(env)
  const inventoryService = new InventoryTrackingService(env)

  try {
    let rental: Rental | null = null
    let tableId: string
    let itemId: string

    // 1. Find the rental - either by rentalId or by itemId
    if (data.rentalId) {
      rental = await rentalRepo.findRentalById(data.rentalId)
      if (!rental) {
        return { error: 'Rental not found', status: 404 }
      }
      tableId = rental.tableId
      itemId = rental.itemId
    } else if (data.itemId && data.tableId) {
      // Find active rental for this item
      rental = await rentalRepo.findActiveRentalByItem(data.tableId, data.itemId)
      if (!rental) {
        return { error: 'No active rental found for this item', status: 404 }
      }
      tableId = data.tableId
      itemId = data.itemId
    } else {
      return {
        error: 'Either rentalId or both itemId and tableId are required',
        status: 400
      }
    }

    // 2. Check rental status
    if (rental.rentalStatus !== 'active') {
      return {
        error: `Rental is already ${rental.rentalStatus}`,
        status: 400
      }
    }

    // 3. Verify table exists and is a rent type
    const table = await tableRepo.findTableByIdInternal(tableId)
    if (!table) {
      return { error: 'Table not found', status: 404 }
    }

    if (table.tableType !== 'rent') {
      return { error: 'Table is not a rental table', status: 403 }
    }

    // 4. Get current item state
    const row = await dataRepo.findDataRowById(itemId, tableId)
    if (!row) {
      return { error: 'Item not found', status: 404 }
    }

    const parsedData = row.data

    // 5. Extract current state
    const usedValue = parsedData.used
    const availableValue = parsedData.available

    const used = usedValue === true || usedValue === 'true'
    const available = availableValue === true || availableValue === 'true'

    // 6. Check state machine - can we release this item?
    if (!canReleaseItem(used, available)) {
      if (used) {
        return {
          error: 'Item has already been released and marked as used',
          status: 400
        }
      }
      if (available) {
        return {
          error: 'Item is not currently rented (it is available)',
          status: 400
        }
      }
      return {
        error: 'Item cannot be released in current state',
        status: 400
      }
    }

    // 7. Release the rental
    const updatedRental = await rentalRepo.releaseRental(rental.id, data.notes)

    // 8. Update item state - mark as used and not available
    const newState = getStateAfterRelease()
    const updatedData = {
      ...parsedData,
      used: newState.used,
      available: newState.available
    }

    try {
      await dataRepo.updateDataRow(itemId, tableId, updatedData)
    } catch (updateError) {
      console.error('Error updating item state after release:', updateError)
      // Rental was released but state update failed
      // In production, you might want to implement compensation logic
    }

    // 9. Track the release in inventory tracking
    try {
      await inventoryService.logInventoryTransaction({
        tableId: table.id,
        tableName: table.name,
        itemId: itemId,
        transactionType: 'release',
        previousData: parsedData,
        newData: updatedData,
        referenceId: updatedRental.id,
        createdBy: user.id || 'system'
      })
    } catch (trackError) {
      console.error('Error tracking release in inventory:', trackError)
      // Don't fail the release if tracking fails
    }

    return {
      rental: updatedRental,
      message: 'Item released successfully. Item is now marked as used and cannot be rented again.'
    }

  } catch (error) {
    console.error('Error releasing rental:', error)
    throw new Error('Failed to release rental')
  }
}
