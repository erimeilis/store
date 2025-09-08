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