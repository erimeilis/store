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

  // Extract all filter parameters for For Sale Tables
  const filterName = c.req.query('filterName')
  const filterDescription = c.req.query('filterDescription')
  const filterVisibility = c.req.query('filterVisibility')
  const filterUpdatedAt = c.req.query('filterUpdatedAt')

  // Build additional parameters including all filters and forSale=true filter
  const additionalParams: Record<string, string> = { sort, direction, forSale: 'true' }
  if (filterName) additionalParams.filterName = filterName
  if (filterDescription) additionalParams.filterDescription = filterDescription
  if (filterVisibility) additionalParams.filterVisibility = filterVisibility
  if (filterUpdatedAt) additionalParams.filterUpdatedAt = filterUpdatedAt

  const tables = await fetchHandlerData(API_ENDPOINTS.tables, c, {
    page,
    additionalParams
  })

  const dashboardProps = buildPageProps(user, c, { tables })
  
  return renderDashboardPage(c, '/dashboard', dashboardProps)
}