import type { Context } from 'hono'
import type { Bindings } from '@/types/bindings.js'
import type { UserContext } from '@/types/database.js'
import type {
  CreateSaleRequest,
  UpdateSaleRequest,
  SaleListQuery
} from '@/types/sales.js'

// Import all the functions
import { createSale } from './createSale.js'
import { getSales, getSalesByCustomer, getSalesByTable } from './getSales.js'
import { updateSale, getSale, deleteSale } from './updateSale.js'
import { getSalesAnalytics, getSalesSummary } from './salesAnalytics.js'

/**
 * Sales service - facade for sales-related operations
 * Maintains the same interface while delegating to focused, single-purpose functions
 */
export class SalesService {
  private env: Bindings

  constructor(env: Bindings) {
    this.env = env
  }

  // Core sales operations
  async createSale(c: Context, user: UserContext, data: CreateSaleRequest) {
    return createSale(this.env, c, user, data)
  }

  async getSales(c: Context, user: UserContext, query: SaleListQuery) {
    return getSales(this.env, c, user, query)
  }

  async getSale(c: Context, user: UserContext, saleId: string) {
    return getSale(this.env, c, user, saleId)
  }

  async updateSale(c: Context, user: UserContext, saleId: string, data: UpdateSaleRequest) {
    return updateSale(this.env, c, user, saleId, data)
  }

  async deleteSale(c: Context, user: UserContext, saleId: string) {
    return deleteSale(this.env, c, user, saleId)
  }

  // Customer and table specific sales
  async getSalesByCustomer(c: Context, user: UserContext, customerId: string, limit?: number) {
    return getSalesByCustomer(this.env, c, user, customerId, limit)
  }

  async getSalesByTable(c: Context, user: UserContext, tableId: string, limit?: number) {
    return getSalesByTable(this.env, c, user, tableId, limit)
  }

  // Analytics and reporting
  async getSalesAnalytics(
    c: Context,
    user: UserContext,
    dateFrom?: string,
    dateTo?: string,
    tableId?: string
  ) {
    return getSalesAnalytics(this.env, c, user, dateFrom, dateTo, tableId)
  }

  async getSalesSummary(c: Context, user: UserContext) {
    return getSalesSummary(this.env, c, user)
  }
}