/**
 * Allowed Emails Page Handler
 */

import type { Context } from 'hono'
import type { Env, Variables } from '@/types/hono'
import { fetchHandlerData, renderDashboardPage, buildPageProps, API_ENDPOINTS } from '@/lib/handler-utils'

export async function handleAllowedEmailsPage(c: Context<{ Bindings: Env; Variables: Variables }>) {
  const user = c.get('user')

  // Extract all query parameters to pass to the API (including filters, sort, direction, etc.)
  const queryParams: Record<string, string> = {}
  const queries = c.req.queries()
  Object.entries(queries).forEach(([key, values]) => {
    if (values && values.length > 0) {
      queryParams[key] = values[0]
    }
  })

  const allowedEmails = await fetchHandlerData(API_ENDPOINTS.allowedEmails, c, {
    additionalParams: queryParams
  })

  const allowedEmailsProps = buildPageProps(user, c, { allowedEmails })

  return renderDashboardPage(c, '/dashboard/allowed-emails', allowedEmailsProps)
}

export async function handleCreateAllowedEmailPage(c: Context<{ Bindings: Env; Variables: Variables }>) {
  const user = c.get('user')
  const createAllowedEmailProps = buildPageProps(user, c, {})
  
  return renderDashboardPage(c, '/dashboard/allowed-emails/create', createAllowedEmailProps)
}

export async function handleEditAllowedEmailPage(c: Context<{ Bindings: Env; Variables: Variables }>) {
  const user = c.get('user')
  const allowedEmailId = c.req.param('id')

  // Fetch specific allowed email data
  let allowedEmailData = null
  try {
    const apiUrl = c.env?.API_URL || 'http://localhost:8787'
    const { fetchAPI } = await import('@/lib/api-utils')
    
    allowedEmailData = await fetchAPI(
      `${apiUrl}/api/allowed-emails/${allowedEmailId}`,
      c.env?.ADMIN_ACCESS_TOKEN || ''
    )
  } catch (error) {
    console.error('Error fetching allowed email:', error)
  }

  const editAllowedEmailProps = buildPageProps(user, c, { allowedEmailData, allowedEmailId })
  
  return renderDashboardPage(c, '/dashboard/allowed-emails/edit/[id]', editAllowedEmailProps)
}