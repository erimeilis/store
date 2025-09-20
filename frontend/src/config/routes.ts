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
    handler: async (c) => (await import('@/handlers/auth')).handleLoginPage(c),
    layout: 'root',
    segment: 'root'
  },
  {
    path: '/error',
    handler: async (c) => (await import('@/handlers/error')).handleErrorPage(c),
    layout: 'root',
    segment: 'error'
  },
  {
    path: '/dashboard',
    handler: async (c) => (await import('@/handlers/dashboard')).handleDashboardPage(c),
    layout: 'dashboard',
    segment: 'dashboard',
    requiresAuth: true
  },
  {
    path: '/dashboard/docs',
    handler: async (c) => (await import('@/handlers/docs')).handleDocsPage(c),
    layout: 'dashboard',
    segment: 'docs',
    requiresAuth: true
  },
  {
    path: '/dashboard/users',
    handler: async (c) => (await import('@/handlers/users')).handleUsersPage(c),
    layout: 'dashboard',
    segment: 'users',
    requiresAuth: true
  },
  {
    path: '/dashboard/users/create',
    handler: async (c) => (await import('@/handlers/users')).handleCreateUserPage(c),
    layout: 'dashboard',
    segment: 'create',
    requiresAuth: true
  },
  {
    path: '/dashboard/users/edit/:id',
    handler: async (c) => (await import('@/handlers/users')).handleEditUserPage(c),
    layout: 'dashboard',
    segment: 'edit',
    requiresAuth: true
  },
  {
    path: '/dashboard/tokens',
    handler: async (c) => (await import('@/handlers/tokens')).handleTokensPage(c),
    layout: 'dashboard',
    segment: 'tokens',
    requiresAuth: true
  },
  {
    path: '/dashboard/allowed-emails',
    handler: async (c) => (await import('@/handlers/allowed-emails')).handleAllowedEmailsPage(c),
    layout: 'dashboard',
    segment: 'allowed-emails',
    requiresAuth: true
  },
  {
    path: '/dashboard/allowed-emails/create',
    handler: async (c) => (await import('@/handlers/allowed-emails')).handleCreateAllowedEmailPage(c),
    layout: 'dashboard',
    segment: 'create',
    requiresAuth: true
  },
  {
    path: '/dashboard/allowed-emails/edit/:id',
    handler: async (c) => (await import('@/handlers/allowed-emails')).handleEditAllowedEmailPage(c),
    layout: 'dashboard',
    segment: 'edit',
    requiresAuth: true
  },
  {
    path: '/dashboard/items/create',
    handler: async (c) => (await import('@/handlers/items')).handleCreateItemPage(c),
    layout: 'dashboard',
    segment: 'create',
    requiresAuth: true
  },
  {
    path: '/dashboard/items/edit/:id',
    handler: async (c) => (await import('@/handlers/items')).handleEditItemPage(c),
    layout: 'dashboard',
    segment: 'edit',
    requiresAuth: true
  },
  {
    path: '/dashboard/tables',
    handler: async (c) => (await import('@/handlers/tables')).handleTablesListPage(c),
    layout: 'dashboard',
    segment: 'tables',
    requiresAuth: true
  },
  {
    path: '/dashboard/tables/create',
    handler: async (c) => (await import('@/handlers/tables')).handleTableCreatePage(c),
    layout: 'dashboard',
    segment: 'create',
    requiresAuth: true
  },
  {
    path: '/dashboard/tables/:id/data',
    handler: async (c) => (await import('@/handlers/tables')).handleTableDataPage(c),
    layout: 'dashboard',
    segment: 'data',
    requiresAuth: true
  },
  {
    path: '/dashboard/tables/:id/edit',
    handler: async (c) => (await import('@/handlers/tables')).handleTableEditPage(c),
    layout: 'dashboard',
    segment: 'edit',
    requiresAuth: true
  },
  {
    path: '/dashboard/tables/:id/columns',
    handler: async (c) => (await import('@/handlers/tables')).handleTableColumnsPage(c),
    layout: 'dashboard',
    segment: 'columns',
    requiresAuth: true
  },
  {
    path: '/dashboard/tables/:id/import',
    handler: async (c) => (await import('@/handlers/tables')).handleTableImportPage(c),
    layout: 'dashboard',
    segment: 'import',
    requiresAuth: true
  },
  {
    path: '/dashboard/tables/:id/data/edit/:rowId',
    handler: async (c) => (await import('@/handlers/tables')).handleTableDataEditPage(c),
    layout: 'dashboard',
    segment: 'edit',
    requiresAuth: true
  },
  {
    path: '/dashboard/sales',
    handler: async (c) => (await import('@/handlers/sales')).handleSalesListPage(c),
    layout: 'dashboard',
    segment: 'sales',
    requiresAuth: true
  },
  {
    path: '/dashboard/sales/analytics',
    handler: async (c) => (await import('@/handlers/sales')).handleSalesAnalyticsPage(c),
    layout: 'dashboard',
    segment: 'analytics',
    requiresAuth: true
  },
  {
    path: '/dashboard/sales/inventory',
    handler: async (c) => (await import('@/handlers/sales')).handleInventoryPage(c),
    layout: 'dashboard',
    segment: 'inventory',
    requiresAuth: true
  },
  {
    path: '/demo',
    handler: async (c) => (await import('@/handlers/demo')).handleDemoPage(c),
    layout: 'dashboard',
    segment: 'demo',
    requiresAuth: true
  }
]

// Layout configurations
export const layouts: LayoutConfig[] = [
  {
    name: 'root',
    path: '/dashboard',
    segment: 'dashboard',
    component: async () => (await import('@/app/layout')).default
  },
  {
    name: 'dashboard',
    path: '/dashboard',
    segment: 'dashboard',
    component: async () => (await import('@/app/dashboard/layout')).default
  }
]

// Client-side page components mapping
export const pageComponents = {
  '/': async () => (await import('@/app/login/page')).default,
  '/error': async () => (await import('@/app/error/page')).default,
  '/dashboard': async () => (await import('@/app/dashboard/page')).default,
  '/dashboard/docs': async () => (await import('@/app/dashboard/docs/page')).default,
  '/dashboard/users': async () => (await import('@/app/dashboard/users/page')).default,
  '/dashboard/users/create': async () => (await import('@/app/dashboard/users/create/page')).default,
  '/dashboard/users/edit/[id]': async () => (await import('@/app/dashboard/users/edit/[id]/page')).default,
  '/dashboard/items/create': async () => (await import('@/app/dashboard/items/create/page')).default,
  '/dashboard/items/edit/[id]': async () => (await import('@/app/dashboard/items/edit/[id]/page')).default,
  '/dashboard/tokens': async () => (await import('@/app/dashboard/tokens/page')).default,
  '/dashboard/allowed-emails': async () => (await import('@/app/dashboard/allowed-emails/page')).default,
  '/dashboard/allowed-emails/create': async () => (await import('@/app/dashboard/allowed-emails/create/page')).default,
  '/dashboard/allowed-emails/edit/[id]': async () => (await import('@/app/dashboard/allowed-emails/edit/[id]/page')).default,
  '/dashboard/tables': async () => (await import('@/app/dashboard/tables/page')).default,
  '/dashboard/tables/create': async () => (await import('@/app/dashboard/tables/create/page')).default,
  '/dashboard/tables/[id]/data': async () => (await import('@/app/dashboard/tables/[id]/data/page')).default,
  '/dashboard/tables/[id]/edit': async () => (await import('@/app/dashboard/tables/[id]/edit/page')).default,
  '/dashboard/tables/[id]/columns': async () => (await import('@/app/dashboard/tables/[id]/columns/page')).default,
  '/dashboard/tables/[id]/import': async () => (await import('@/app/dashboard/tables/[id]/import/page')).default,
  '/dashboard/tables/[id]/data/edit/[rowId]': async () => (await import('@/app/dashboard/tables/[id]/data/edit/[rowId]/page')).default,
  '/dashboard/sales': async () => (await import('@/app/dashboard/sales/page')).default,
  '/dashboard/sales/analytics': async () => (await import('@/app/dashboard/sales/analytics/page')).default,
  '/dashboard/sales/inventory': async () => (await import('@/app/dashboard/sales/inventory/page')).default,
  '/demo': async () => (await import('@/app/demo/page')).default
}