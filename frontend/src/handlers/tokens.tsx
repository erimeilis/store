/**
 * Tokens Page Handler
 */

import type { Context } from 'hono'
import type { Env, Variables } from '@/types/hono'
import { fetchHandlerData, renderDashboardPage, buildPageProps, API_ENDPOINTS } from '@/lib/handler-utils'

export async function handleTokensPage(c: Context<{ Bindings: Env; Variables: Variables }>) {
  const user = c.get('user')
  const tokens = await fetchHandlerData(API_ENDPOINTS.tokens, c)

  const tokensProps = buildPageProps(user, c, { tokens })

  return renderDashboardPage(c, '/dashboard/tokens', tokensProps)
}

export async function handleCreateTokenPage(c: Context<{ Bindings: Env; Variables: Variables }>) {
  const user = c.get('user')

  // Fetch user's accessible tables for token table selection
  const tables = await fetchHandlerData('/api/tables', c, {
    limit: 1000, // Get all tables for selection
    additionalParams: { sort: 'name', direction: 'asc' }
  })

  const createTokenProps = buildPageProps(user, c, { tables })

  return renderDashboardPage(c, '/dashboard/tokens/create', createTokenProps)
}

export async function handleEditTokenPage(c: Context<{ Bindings: Env; Variables: Variables }>) {
  const user = c.get('user')
  const tokenId = c.req.param('id')

  // Fetch user's accessible tables for token table selection
  const tables = await fetchHandlerData('/api/tables', c, {
    limit: 1000, // Get all tables for selection
    additionalParams: { sort: 'name', direction: 'asc' }
  })

  // Fetch specific token data
  let tokenData = null
  try {
    const apiUrl = c.env?.API_URL || 'http://localhost:8787'
    const { fetchAPI } = await import('@/lib/api-utils')

    tokenData = await fetchAPI(
      `${apiUrl}/api/tokens/${tokenId}`,
      c.env?.ADMIN_ACCESS_TOKEN || ''
    )
  } catch (error) {
    console.error('Error fetching token:', error)
  }

  const editTokenProps = buildPageProps(user, c, {
    tokenData,
    tokenId,
    tables
  })

  return renderDashboardPage(c, '/dashboard/tokens/edit/[id]', editTokenProps)
}
