/**
 * Dynamic Tables Page Handlers
 */

import type { Context } from 'hono'
import type { Env, Variables } from '@/types/hono'
import { fetchHandlerData, renderDashboardPage, buildPageProps } from '@/lib/handler-utils'

// API endpoints for tables
const TABLES_API_ENDPOINTS = {
  tables: '/api/tables',
  tableData: (id: string) => `/api/tables/${id}/data`
}

/**
 * Handler for tables list page (/dashboard/tables)
 */
export async function handleTablesListPage(c: Context<{ Bindings: Env; Variables: Variables }>) {
  const user = c.get('user')
  
  // Get pagination and filtering parameters
  const page = parseInt(c.req.query('page') || '1')
  const sort = c.req.query('sort') || 'updatedAt'
  const direction = c.req.query('direction') || 'desc'

  // Extract all filter parameters
  const filterName = c.req.query('filterName')
  const filterDescription = c.req.query('filterDescription')
  const filterOwner = c.req.query('filterOwner')
  const filterVisibility = c.req.query('filterVisibility') || c.req.query('filterIsPublic')
  const filterCreatedAt = c.req.query('filterCreatedAt')
  const filterUpdatedAt = c.req.query('filterUpdatedAt')

  // Build additional parameters including all filters
  const additionalParams: Record<string, string> = { sort, direction }
  if (filterName) additionalParams.filterName = filterName
  if (filterDescription) additionalParams.filterDescription = filterDescription
  if (filterOwner) additionalParams.filterOwner = filterOwner
  if (filterVisibility) additionalParams.filterVisibility = filterVisibility
  if (filterCreatedAt) additionalParams.filterCreatedAt = filterCreatedAt
  if (filterUpdatedAt) additionalParams.filterUpdatedAt = filterUpdatedAt
  
  const tables = await fetchHandlerData(TABLES_API_ENDPOINTS.tables, c, {
    page,
    additionalParams,
    // No transformation needed - api-utils handles tables format automatically
  })
  
  const tablesProps = buildPageProps(user, c, {
    tables,
    filters: {
      sort,
      direction,
      filterName: filterName,
      filterDescription: filterDescription,
      filterOwner: filterOwner,
      filterVisibility: filterVisibility,
      filterCreatedAt: filterCreatedAt,
      filterUpdatedAt: filterUpdatedAt
    }
  })
  
  return renderDashboardPage(c, '/dashboard/tables', tablesProps)
}

/**
 * Handler for table creation page (/dashboard/tables/create)
 */
export async function handleTableCreatePage(c: Context<{ Bindings: Env; Variables: Variables }>) {
  const user = c.get('user')
  
  const createProps = buildPageProps(user, c, {})
  
  return renderDashboardPage(c, '/dashboard/tables/create', createProps)
}

/**
 * Handler for table data page (/dashboard/tables/[id]/data)
 */
export async function handleTableDataPage(c: Context<{ Bindings: Env; Variables: Variables }>) {
  const user = c.get('user')
  const tableId = c.req.param('id')
  
  if (!tableId) {
    throw new Error('Table ID is required')
  }
  
  // Get pagination parameters
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || c.env?.PAGE_SIZE || '5')
  
  // Extract all filter parameters - dynamic filters for any column
  const url = new URL(c.req.url)
  const filterParams: Record<string, string> = {}

  // Look for any query parameter that starts with 'filter' (camelCase)
  for (const [key, value] of url.searchParams.entries()) {
    if (key.startsWith('filter') && key !== 'filter' && value.trim()) {
      filterParams[key] = value.trim()
    }
  }
  
  console.log('🔍 Table Data Handler - Filter parameters:', filterParams)
  
  // Build additional parameters including all filters (limit is handled by fetchHandlerData)
  const additionalParams: Record<string, string> = { 
    ...filterParams
  }
  
  console.log('🔍 Table Data Handler - About to call fetchHandlerData with:', { 
    endpoint: TABLES_API_ENDPOINTS.tableData(tableId),
    page, 
    limit,
    additionalParams 
  })
  
  const tableData = await fetchHandlerData(TABLES_API_ENDPOINTS.tableData(tableId), c, {
    page,
    additionalParams,
    // No transformation needed - api-utils handles standard pagination format
  })
  
  const dataProps = buildPageProps(user, c, {
    initialData: tableData,
    tableId,
    page,
    limit
  })
  
  return renderDashboardPage(c, `/dashboard/tables/${tableId}/data`, dataProps)
}

/**
 * Handler for table edit page (/dashboard/tables/[id]/edit)
 */
export async function handleTableEditPage(c: Context<{ Bindings: Env; Variables: Variables }>) {
  const user = c.get('user')
  const tableId = c.req.param('id')

  console.log('🔍 Edit page debug:', {
    tableId,
    type: typeof tableId,
    url: c.req.url,
    path: c.req.path
  })

  if (!tableId || tableId === 'undefined' || tableId === 'null') {
    console.error('❌ Invalid table ID:', { tableId, type: typeof tableId })
    throw new Error(`Table ID is invalid: ${tableId}`)
  }
  
  // Fetch table schema (table + columns)
  const tableSchema = await fetchHandlerData(`/api/tables/${tableId}`, c, {
    transformer: (data: any) => {
      // The API returns { table: TableSchema }
      return data.table
    }
  })
  
  const editProps = buildPageProps(user, c, { 
    tableSchema,
    tableId
  })
  
  return renderDashboardPage(c, `/dashboard/tables/${tableId}/edit`, editProps)
}


/**
 * Handler for table columns management (/dashboard/tables/[id]/columns)
 */
export async function handleTableColumnsPage(c: Context<{ Bindings: Env; Variables: Variables }>) {
  const user = c.get('user')
  const tableId = c.req.param('id')
  
  if (!tableId) {
    throw new Error('Table ID is required')
  }
  
  // Fetch table schema for column management
  const tableSchema = await fetchHandlerData(`/api/tables/${tableId}`, c, {
    transformer: (data: any) => data.table
  })
  
  const columnsProps = buildPageProps(user, c, { 
    tableSchema,
    tableId
  })
  
  return renderDashboardPage(c, `/dashboard/tables/${tableId}/columns`, columnsProps)
}

/**
 * Handler for table data row edit page (/dashboard/tables/[id]/data/edit/[rowId])
 */
export async function handleTableDataEditPage(c: Context<{ Bindings: Env; Variables: Variables }>) {
  const user = c.get('user')
  const tableId = c.req.param('id')
  const rowId = c.req.param('rowId')
  
  if (!tableId || !rowId) {
    throw new Error('Table ID and Row ID are required')
  }
  
  try {
    // Fetch table schema and row data in parallel
    const [tableSchema, rowData] = await Promise.all([
      fetchHandlerData(`/api/tables/${tableId}`, c, {
        transformer: (data: any) => data.table
      }),
      fetchHandlerData(`/api/tables/${tableId}/data/${rowId}`, c, {
        transformer: (data: any) => data.row
      })
    ])
    
    const editProps = buildPageProps(user, c, { 
      tableId,
      rowId,
      initialTableSchema: tableSchema,
      initialRowData: rowData
    })
    
    return renderDashboardPage(c, `/dashboard/tables/${tableId}/data/edit/${rowId}`, editProps)
  } catch {
    // If we can't fetch the data, still render the page but let it handle loading
    const editProps = buildPageProps(user, c, {
      tableId,
      rowId
    })

    return renderDashboardPage(c, `/dashboard/tables/${tableId}/data/edit/${rowId}`, editProps)
  }
}

/**
 * Handler for table import page (/dashboard/tables/[id]/import)
 */
export async function handleTableImportPage(c: Context<{ Bindings: Env; Variables: Variables }>) {
  const user = c.get('user')
  const tableId = c.req.param('id')

  if (!tableId) {
    throw new Error('Table ID is required')
  }

  // Fetch table schema for import context
  const tableSchema = await fetchHandlerData(`/api/tables/${tableId}`, c, {
    transformer: (data: any) => data.table
  })

  const importProps = buildPageProps(user, c, {
    tableSchema,
    tableId,
    params: { id: tableId }  // Add params object for page component
  })

  return renderDashboardPage(c, `/dashboard/tables/${tableId}/import`, importProps)
}