/**
 * Users Page Handlers
 */

import type { Context } from 'hono'
import type { Env, Variables } from '@/types/hono'
import { fetchHandlerData, renderDashboardPage, buildPageProps, API_ENDPOINTS } from '@/lib/handler-utils'

export async function handleUsersPage(c: Context<{ Bindings: Env; Variables: Variables }>) {
  const user = c.get('user')

  // Get pagination and filtering parameters
  const page = parseInt(c.req.query('page') || '1')
  const sort = c.req.query('sort') || 'createdAt'
  const direction = c.req.query('direction') || 'desc'

  // Extract all filter parameters (snake_case from frontend)
  const filterEmail = c.req.query('filter_email')
  const filterName = c.req.query('filter_name')
  const filterRole = c.req.query('filter_role')
  const filterCreatedAt = c.req.query('filter_createdAt')

  // Build additional parameters including all filters (convert to camelCase for backend)
  const additionalParams: Record<string, string> = { sort, direction }
  if (filterEmail) additionalParams.filterEmail = filterEmail
  if (filterName) additionalParams.filterName = filterName
  if (filterRole) additionalParams.filterRole = filterRole
  if (filterCreatedAt) additionalParams.filterCreatedAt = filterCreatedAt

  const users = await fetchHandlerData(API_ENDPOINTS.users, c, {
    page,
    additionalParams
  })

  const usersProps = buildPageProps(user, c, {
    users,
    currentUser: user,
    filters: {
      sort,
      direction,
      filterEmail,
      filterName,
      filterRole,
      filterCreatedAt
    }
  })

  return renderDashboardPage(c, '/dashboard/users', usersProps)
}

export async function handleCreateUserPage(c: Context<{ Bindings: Env; Variables: Variables }>) {
  const user = c.get('user')
  
  // Admin-only access protection
  if (user?.role !== 'admin') {
    return c.redirect('/dashboard/users?error=access_denied')
  }
  
  const createUserProps = buildPageProps(user, c, {})
  
  return renderDashboardPage(c, '/dashboard/users/create', createUserProps)
}

export async function handleEditUserPage(c: Context<{ Bindings: Env; Variables: Variables }>) {
  const user = c.get('user')
  const userId = c.req.param('id')

  // Admin-only access protection
  if (user?.role !== 'admin') {
    return c.redirect('/dashboard/users?error=access_denied')
  }

  // Fetch specific user data
  let userData = null
  try {
    const apiUrl = c.env?.API_URL || 'http://localhost:8787'
    const { fetchAPI } = await import('@/lib/api-utils')
    
    userData = await fetchAPI(
      `${apiUrl}/api/users/${userId}`,
      c.env?.ADMIN_ACCESS_TOKEN || ''
    )
  } catch (error) {
    console.error('Error fetching user:', error)
  }

  const editUserProps = buildPageProps(user, c, { userData, userId })
  
  return renderDashboardPage(c, '/dashboard/users/edit/[id]', editUserProps)
}