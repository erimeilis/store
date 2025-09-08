/**
 * Routes Configuration
 * Centralized route definitions for both server and client
 */

import type { Context } from 'hono'

export interface RouteConfig {
  path: string
  handler: (c: Context) => Promise<Response | void>
  layout?: string
  segment?: string
  requiresAuth?: boolean
}

export interface LayoutConfig {
  name: string
  path: string
  segment: string
  component: any
}

// Route configurations - easy to add/remove pages
export const routes: RouteConfig[] = [
  {
    path: '/',
    handler: async (c) => (await import('../handlers/auth.js')).handleLoginPage(c),
    layout: 'root',
    segment: 'root'
  },
  {
    path: '/error',
    handler: async (c) => (await import('../handlers/error.js')).handleErrorPage(c),
    layout: 'root',
    segment: 'error'
  },
  {
    path: '/dashboard',
    handler: async (c) => (await import('../handlers/dashboard.js')).handleDashboardPage(c),
    layout: 'dashboard',
    segment: 'dashboard',
    requiresAuth: true
  },
  {
    path: '/dashboard/users',
    handler: async (c) => (await import('../handlers/users.js')).handleUsersPage(c),
    layout: 'dashboard',
    segment: 'users',
    requiresAuth: true
  },
  {
    path: '/dashboard/users/create',
    handler: async (c) => (await import('../handlers/users.js')).handleCreateUserPage(c),
    layout: 'dashboard',
    segment: 'create',
    requiresAuth: true
  },
  {
    path: '/dashboard/users/edit/:id',
    handler: async (c) => (await import('../handlers/users.js')).handleEditUserPage(c),
    layout: 'dashboard',
    segment: 'edit',
    requiresAuth: true
  },
  {
    path: '/dashboard/tokens',
    handler: async (c) => (await import('../handlers/tokens.js')).handleTokensPage(c),
    layout: 'dashboard',
    segment: 'tokens',
    requiresAuth: true
  },
  {
    path: '/dashboard/allowed-emails',
    handler: async (c) => (await import('../handlers/allowed-emails.js')).handleAllowedEmailsPage(c),
    layout: 'dashboard',
    segment: 'allowed-emails',
    requiresAuth: true
  }
]

// Layout configurations
export const layouts: LayoutConfig[] = [
  {
    name: 'root',
    path: '/dashboard',
    segment: 'dashboard',
    component: async () => (await import('../app/layout.js')).default
  },
  {
    name: 'dashboard',
    path: '/dashboard',
    segment: 'dashboard',
    component: async () => (await import('../app/dashboard/layout.js')).default
  }
]

// Client-side page components mapping
export const pageComponents = {
  '/': async () => (await import('../app/login/page.js')).default,
  '/error': async () => (await import('../app/error/page.js')).default,
  '/dashboard': async () => (await import('../app/dashboard/page.js')).default,
  '/dashboard/users': async () => (await import('../app/dashboard/users/page.js')).default,
  '/dashboard/users/create': async () => (await import('../app/dashboard/users/create/page.js')).default,
  '/dashboard/users/edit/[id]': async () => (await import('../app/dashboard/users/edit/[id]/page.js')).default,
  '/dashboard/tokens': async () => (await import('../app/dashboard/tokens/page.js')).default,
  '/dashboard/allowed-emails': async () => (await import('../app/dashboard/allowed-emails/page.js')).default
}