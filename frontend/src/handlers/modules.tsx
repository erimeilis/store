/**
 * Modules Page Handler
 * Handles server-side rendering for module admin pages
 */

import type { Context } from 'hono'
import type { Env, Variables } from '@/types/hono'
import { fetchHandlerData, renderDashboardPage, buildPageProps, API_ENDPOINTS } from '@/lib/handler-utils'

// Extend API_ENDPOINTS to include modules
const MODULE_ENDPOINTS = {
  ...API_ENDPOINTS,
  modules: '/api/admin/modules',
} as const

export async function handleModulesPage(c: Context<{ Bindings: Env; Variables: Variables }>) {
  const user = c.get('user')

  // Fetch modules from admin API
  const modules = await fetchHandlerData(MODULE_ENDPOINTS.modules, c)

  const modulesProps = buildPageProps(user, c, { modules })

  return renderDashboardPage(c, '/dashboard/modules', modulesProps)
}

export async function handleModuleDetailPage(c: Context<{ Bindings: Env; Variables: Variables }>) {
  const user = c.get('user')
  const moduleId = c.req.param('id')

  // Fetch specific module data
  let moduleData = null
  let moduleEvents = null
  let moduleAnalytics = null

  try {
    const apiUrl = c.env?.API_URL || 'http://localhost:8787'
    const { fetchAPI } = await import('@/lib/api-utils')
    const token = c.env?.ADMIN_ACCESS_TOKEN || ''

    // Fetch module details
    moduleData = await fetchAPI(
      `${apiUrl}/api/admin/modules/${encodeURIComponent(moduleId)}`,
      token
    )

    // Fetch module events
    moduleEvents = await fetchAPI(
      `${apiUrl}/api/admin/modules/${encodeURIComponent(moduleId)}/events?limit=20`,
      token
    )

    // Fetch module analytics
    moduleAnalytics = await fetchAPI(
      `${apiUrl}/api/admin/modules/${encodeURIComponent(moduleId)}/analytics?period=30d`,
      token
    )
  } catch (error) {
    console.error('Error fetching module details:', error)
  }

  const moduleDetailProps = buildPageProps(user, c, {
    moduleData,
    moduleEvents,
    moduleAnalytics,
    moduleId,
  })

  return renderDashboardPage(c, '/dashboard/modules/[id]', moduleDetailProps)
}
