import type { Context } from 'hono'
import type { Bindings } from '@/types/bindings.js'
import type { UserContext } from '@/types/database.js'
import type { CreateRentalRequest, ReleaseRentalRequest } from '@/types/rentals.js'

// Import all the functions
import { getForRentTables, getTableItems, getItem, checkRentalAvailability } from './getPublicRentData.js'
import { rentItem, releaseItem } from './rentItem.js'

/**
 * Public Rentals service - public-facing operations for browsing and renting
 * Provides endpoints for customers to interact with "for rent" tables
 *
 * Rental lifecycle:
 * 1. Browse available items (getForRentTables, getTableItems)
 * 2. Check item availability (checkRentalAvailability)
 * 3. Rent item (rentItem) - marks item as unavailable
 * 4. Release item (releaseItem) - marks item as used, cannot be rented again
 */
export class PublicRentService {
  private env: Bindings

  constructor(env: Bindings) {
    this.env = env
  }

  // Browse operations (no auth required)
  async getForRentTables(c: Context) {
    return getForRentTables(this.env, c)
  }

  async getTableItems(c: Context, tableId: string) {
    return getTableItems(this.env, c, tableId)
  }

  async getItem(c: Context, tableId: string, itemId: string) {
    return getItem(this.env, c, tableId, itemId)
  }

  async checkRentalAvailability(c: Context, tableId: string, itemId: string) {
    return checkRentalAvailability(this.env, c, tableId, itemId)
  }

  // Rental operations (auth required)
  async rentItem(c: Context, user: UserContext, data: CreateRentalRequest) {
    return rentItem(this.env, c, user, data)
  }

  async releaseItem(c: Context, user: UserContext, data: ReleaseRentalRequest) {
    return releaseItem(this.env, c, user, data)
  }
}
