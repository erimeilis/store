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
  const sort = c.req.query('sort') || 'createdAt'
  const direction = c.req.query('direction') || 'desc'

  // Extract all filter parameters for Store Tables (snake_case with filter_ prefix)
  const filterName = c.req.query('filter_name')
  const filterDescription = c.req.query('filter_description')
  const filterVisibility = c.req.query('filter_visibility')
  const filterUpdatedAt = c.req.query('filter_updatedAt')
  const filterTableType = c.req.query('filter_tableType')

  // Build additional parameters including all filters - filter by sale AND rent table types
  const additionalParams: Record<string, string> = { sort, direction, tableType: filterTableType || 'sale,rent' }
  if (filterName) additionalParams.filter_name = filterName
  if (filterDescription) additionalParams.filter_description = filterDescription
  if (filterVisibility) additionalParams.filter_visibility = filterVisibility
  if (filterUpdatedAt) additionalParams.filter_updatedAt = filterUpdatedAt

  const tables = await fetchHandlerData(API_ENDPOINTS.tables, c, {
    page,
    additionalParams
  })

  const dashboardProps = buildPageProps(user, c, { tables })
  
  return renderDashboardPage(c, '/dashboard', dashboardProps)
}