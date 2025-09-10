/**
 * Allowed Emails Page Handler
 */

import type { Context } from 'hono'
import type { Env, Variables } from '../types/hono.js'
import { fetchHandlerData, renderDashboardPage, buildPageProps, API_ENDPOINTS } from '../lib/handler-utils.js'

export async function handleAllowedEmailsPage(c: Context<{ Bindings: Env; Variables: Variables }>) {
  const user = c.get('user')
  const allowedEmails = await fetchHandlerData(API_ENDPOINTS.allowedEmails, c)
  
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
    const { fetchAPI } = await import('../lib/api-utils.js')
    
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