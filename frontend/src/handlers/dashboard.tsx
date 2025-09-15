/**
 * Dashboard Page Handler
 */

import type { Context } from 'hono'
import type { Env, Variables } from '@/types/hono'
import { fetchHandlerData, renderDashboardPage, buildPageProps, API_ENDPOINTS } from '@/lib/handler-utils'

export async function handleDashboardPage(c: Context<{ Bindings: Env; Variables: Variables }>) {
  const user = c.get('user')
  
  // Get dashboard-specific parameters
  const page = parseInt(c.req.query('page') || '1')
  const sort = c.req.query('sort') || 'created_at'
  const direction = c.req.query('direction') || 'desc'
  
  // Extract all filter parameters for Items
  const filterName = c.req.query('filter_name')
  const filterDescription = c.req.query('filter_description')
  const filterPrice = c.req.query('filter_price')
  const filterQuantity = c.req.query('filter_quantity')
  const filterCategory = c.req.query('filter_category')
  const filterUpdatedAt = c.req.query('filter_updated_at')
  
  // Build additional parameters including all filters
  const additionalParams: Record<string, string> = { sort, direction }
  if (filterName) additionalParams.filter_name = filterName
  if (filterDescription) additionalParams.filter_description = filterDescription
  if (filterPrice) additionalParams.filter_price = filterPrice
  if (filterQuantity) additionalParams.filter_quantity = filterQuantity
  if (filterCategory) additionalParams.filter_category = filterCategory
  if (filterUpdatedAt) additionalParams.filter_updated_at = filterUpdatedAt
  
  // Import transformer for dashboard items
  const { transformDashboardItem } = await import('@/lib/api-utils')
  
  const items = await fetchHandlerData(API_ENDPOINTS.items, c, {
    page,
    additionalParams,
    transformer: transformDashboardItem
  })
  
  const dashboardProps = buildPageProps(user, c, { items })
  
  return renderDashboardPage(c, '/dashboard', dashboardProps)
}