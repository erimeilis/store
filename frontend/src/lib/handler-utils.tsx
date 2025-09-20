import type { Context } from 'hono'
import type { Env, Variables } from '@/types/hono'
import type { User, PaginatedResponse } from '@/types/models'

// Configuration constants
export const PAGINATION_CONFIG = {
  DEFAULT_OFFSET: 0,
} as const

// API endpoint configurations
export const API_ENDPOINTS = {
  users: '/api/users',
  tokens: '/api/tokens',
  allowedEmails: '/api/allowed-emails',
  items: '/api/items',
  tables: '/api/tables',
} as const

// Generic API fetcher for handlers
export async function fetchHandlerData<T = PaginatedResponse<any>>(
  endpoint: string,
  c: Context<{ Bindings: Env; Variables: Variables }>,
  options: {
    limit?: number
    offset?: number
    page?: number
    additionalParams?: Record<string, string>
    transformer?: (item: any) => any
  } = {}
): Promise<T | null> {
  try {
    const apiUrl = c.env?.API_URL || 'http://localhost:8787'
    const { fetchAPI, transformPaginatedResponse } = await import('./api-utils.js')
    
    // Get limit from environment or use default
    const defaultLimit = parseInt(c.env?.PAGE_SIZE || '20')
    
    const { 
      limit = defaultLimit, 
      offset = PAGINATION_CONFIG.DEFAULT_OFFSET,
      page,
      additionalParams = {},
      transformer
    } = options
    
    // Build query parameters
    const params = new URLSearchParams({
      limit: limit.toString(),
      ...(page ? { page: page.toString() } : { offset: offset.toString() }),
      ...additionalParams
    })
    
    const finalUrl = `${apiUrl}${endpoint}?${params.toString()}`
    console.log('🔍 fetchHandlerData - Building request:', {
      endpoint,
      limit,
      page,
      additionalParams,
      paramsString: params.toString(),
      finalUrl
    })
    
    // Get user information from context for proper user tracking
    const user = c.get('user')
    const userHeaders = user ? {
      email: user.email,
      name: user.name,
      id: user.id
    } : undefined

    const backendResponse = await fetchAPI(
      finalUrl,
      c.env?.ADMIN_ACCESS_TOKEN || '',
      {},
      userHeaders
    )
    
    return transformPaginatedResponse(backendResponse, transformer) as T
  } catch (error) {
    const endpointName = endpoint.split('/').pop() || 'data'
    console.error(`Error fetching ${endpointName}:`, error)
    return null
  }
}

// Generic dashboard page renderer
export async function renderDashboardPage(
  c: Context<{ Bindings: Env; Variables: Variables }>,
  route: string,
  pageProps: Record<string, any>
) {
  const { layoutSystem } = await import('@/lib/layout-system')
  const { LayoutProvider } = await import('@/components/LayoutProvider')
  const { LayoutRenderer } = await import('@/components/LayoutRenderer')
  
  const { layouts, route: resolvedRoute } = layoutSystem.resolveLayoutHierarchy(route)
  const params = {}
  
  // Extract search parameters from request
  const searchParams = Object.fromEntries(
    Object.entries(c.req.queries()).map(([key, values]) => [key, values[0] || ''])
  )

  const content = (
    <LayoutProvider
      layoutSystem={layoutSystem}
      currentRoute={route}
      params={params}
      searchParams={searchParams}
    >
      <LayoutRenderer
        route={resolvedRoute!}
        layouts={layouts}
        params={params}
        searchParams={searchParams}
        pageProps={pageProps}
      />
    </LayoutProvider>
  )

  return c.render(content, { 
    initialProps: pageProps,
    adminToken: c.env?.ADMIN_ACCESS_TOKEN,
    theme: c.get('theme')
  })
}

// Helper to build standard page props
export function buildPageProps(
  user: User,
  c: Context<{ Bindings: Env; Variables: Variables }>,
  data: any,
  additionalProps: Record<string, any> = {}
): Record<string, any> {
  return {
    user,
    apiUrl: c.env?.API_URL,
    apiToken: c.env?.ADMIN_ACCESS_TOKEN,
    ...data,
    filters: {
      sort: c.req.query('sort'),
      direction: c.req.query('direction') as 'asc' | 'desc'
    },
    ...additionalProps
  }
}
