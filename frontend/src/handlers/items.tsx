/**
 * Items Page Handlers
 */

import type { Context } from 'hono'
import type { Env, Variables } from '@/types/hono'
import { renderDashboardPage, buildPageProps, API_ENDPOINTS } from '@/lib/handler-utils'

export async function handleCreateItemPage(c: Context<{ Bindings: Env; Variables: Variables }>) {
  const user = c.get('user')

  const createItemProps = buildPageProps(user, c, {})

  return renderDashboardPage(c, '/dashboard/items/create', createItemProps)
}

export async function handleEditItemPage(c: Context<{ Bindings: Env; Variables: Variables }>) {
  const user = c.get('user')
  const itemId = c.req.param('id')

  if (!itemId) {
    return c.redirect('/dashboard?error=missing-item-id')
  }

  try {
    // Fetch the specific item for editing
    const { fetchAPI } = await import('@/lib/api-utils')
    const apiUrl = c.env?.API_URL || 'http://localhost:8787'
    const token = c.env?.ADMIN_ACCESS_TOKEN || ''

    const itemResponse = await fetchAPI(`${apiUrl}${API_ENDPOINTS.items}/${itemId}`, token)

    if (!(itemResponse as any).ok) {
      return c.redirect('/dashboard?error=item-not-found')
    }

    const itemData = await (itemResponse as any).json()
    const item = itemData.item || itemData

    const editItemProps = buildPageProps(user, c, {
      item,
      itemId
    })

    return renderDashboardPage(c, '/dashboard/items/edit/[id]', editItemProps)
  } catch (error) {
    console.error('Error fetching item for edit:', error)
    return c.redirect('/dashboard?error=failed-to-load-item')
  }
}