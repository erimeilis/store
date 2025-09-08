/**
 * Dashboard Page Handler
 */

import type { Context } from 'hono'
import type { Env, Variables } from '../types/hono.js'
import { fetchHandlerData, renderDashboardPage, buildPageProps, API_ENDPOINTS } from '../lib/handler-utils.js'

export async function handleDashboardPage(c: Context<{ Bindings: Env; Variables: Variables }>) {
  const user = c.get('user')
  
  // Get dashboard-specific parameters
  const page = parseInt(c.req.query('page') || '1')
  const sort = c.req.query('sort') || 'created_at'
  const direction = c.req.query('direction') || 'desc'
  
  // Import transformer for dashboard items
  const { transformDashboardItem } = await import('../lib/api-utils.js')
  
  const items = await fetchHandlerData(API_ENDPOINTS.items, c, {
    page,
    additionalParams: { sort, direction },
    transformer: transformDashboardItem
  })
  
  const dashboardProps = buildPageProps(user, c, { items })
  
  return renderDashboardPage(c, '/dashboard', dashboardProps)
}