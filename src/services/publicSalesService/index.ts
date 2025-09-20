import type { Context } from 'hono'
import type { Bindings } from '@/types/bindings.js'
import type { UserContext } from '@/types/database.js'
import type { CreateSaleRequest } from '@/types/sales.js'

// Import all the functions
import { getForSaleTables, getTableItems, getItem } from './getPublicData.js'
import { purchaseItem, checkAvailability } from './purchaseItem.js'

/**
 * Public Sales service - public-facing operations for browsing and purchasing
 * Provides endpoints for customers to interact with "for sale" tables
 */
export class PublicSalesService {
  private env: Bindings

  constructor(env: Bindings) {
    this.env = env
  }

  // Browse operations (no auth required)
  async getForSaleTables(c: Context) {
    return getForSaleTables(this.env, c)
  }

  async getTableItems(c: Context, tableId: string) {
    return getTableItems(this.env, c, tableId)
  }

  async getItem(c: Context, tableId: string, itemId: string) {
    return getItem(this.env, c, tableId, itemId)
  }

  async checkAvailability(c: Context, tableId: string, itemId: string, quantity: number) {
    return checkAvailability(this.env, c, tableId, itemId, quantity)
  }

  // Purchase operations (auth required)
  async purchaseItem(c: Context, user: UserContext, data: CreateSaleRequest) {
    return purchaseItem(this.env, c, user, data)
  }
}