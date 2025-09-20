import type { Context } from 'hono'
import type { Bindings } from '@/types/bindings.js'
import type { UserContext } from '@/types/database.js'
import type { SalesAnalytics } from '@/types/sales.js'
import { SalesRepository } from '@/repositories/salesRepository.js'
import { isUserAdmin } from '@/utils/common.js'

/**
 * Get sales analytics data
 * Admin-only endpoint for sales reporting and insights
 */
export async function getSalesAnalytics(
  env: Bindings,
  c: Context,
  user: UserContext,
  dateFrom?: string,
  dateTo?: string,
  tableId?: string
): Promise<SalesAnalytics> {
  const salesRepo = new SalesRepository(env)

  try {
    // Admin check
    if (!isUserAdmin(user)) {
      return c.json({ error: 'Admin access required' }, 403)
    }

    // Validate date parameters
    if (dateFrom && !isValidDate(dateFrom)) {
      return c.json({ error: 'Invalid date_from format. Use YYYY-MM-DD' }, 400)
    }

    if (dateTo && !isValidDate(dateTo)) {
      return c.json({ error: 'Invalid date_to format. Use YYYY-MM-DD' }, 400)
    }

    // Get analytics data
    const analytics = await salesRepo.getSalesAnalytics(dateFrom, dateTo, tableId)

    return analytics

  } catch (error) {
    console.error('Error fetching sales analytics:', error)
    return c.json({ error: 'Failed to fetch sales analytics' }, 500)
  }
}

/**
 * Get sales summary for dashboard
 */
export async function getSalesSummary(
  env: Bindings,
  c: Context,
  user: UserContext
) {
  const salesRepo = new SalesRepository(env)

  try {
    // Admin check
    if (!isUserAdmin(user)) {
      return c.json({ error: 'Admin access required' }, 403)
    }

    // Get analytics for different time periods
    const today = new Date().toISOString().split('T')[0]
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const [todayStats, weekStats, monthStats, allTimeStats] = await Promise.all([
      salesRepo.getSalesAnalytics(today, today),
      salesRepo.getSalesAnalytics(weekAgo),
      salesRepo.getSalesAnalytics(monthAgo),
      salesRepo.getSalesAnalytics()
    ])

    return c.json({
      today: {
        total_sales: todayStats.total_sales,
        total_revenue: todayStats.total_revenue,
        total_items_sold: todayStats.total_items_sold
      },
      this_week: {
        total_sales: weekStats.total_sales,
        total_revenue: weekStats.total_revenue,
        total_items_sold: weekStats.total_items_sold
      },
      this_month: {
        total_sales: monthStats.total_sales,
        total_revenue: monthStats.total_revenue,
        total_items_sold: monthStats.total_items_sold
      },
      all_time: {
        total_sales: allTimeStats.total_sales,
        total_revenue: allTimeStats.total_revenue,
        total_items_sold: allTimeStats.total_items_sold,
        average_sale_amount: allTimeStats.average_sale_amount
      },
      top_selling_items: allTimeStats.top_selling_items.slice(0, 5),
      recent_sales_by_date: allTimeStats.sales_by_date.slice(0, 7)
    })

  } catch (error) {
    console.error('Error fetching sales summary:', error)
    return c.json({ error: 'Failed to fetch sales summary' }, 500)
  }
}

/**
 * Validate date string format (YYYY-MM-DD)
 */
function isValidDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(dateString)) {
    return false
  }

  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}