/**
 * Tokens Page Handler
 */

import type { Context } from 'hono'
import type { Env, Variables } from '../types/hono.js'
import { fetchHandlerData, renderDashboardPage, buildPageProps, API_ENDPOINTS } from '../lib/handler-utils.js'

export async function handleTokensPage(c: Context<{ Bindings: Env; Variables: Variables }>) {
  const user = c.get('user')
  const tokens = await fetchHandlerData(API_ENDPOINTS.tokens, c)
  
  const tokensProps = buildPageProps(user, c, { tokens })
  
  return renderDashboardPage(c, '/dashboard/tokens', tokensProps)
}