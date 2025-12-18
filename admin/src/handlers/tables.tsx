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

  // Extract all filter parameters (snake_case from frontend)
  // Backend tables route expects snake_case WITH filter_ prefix
  const filterName = c.req.query('filter_name')
  const filterDescription = c.req.query('filter_description')
  const filterOwner = c.req.query('filter_owner')
  const filterVisibility = c.req.query('filter_visibility') || c.req.query('filter_isPublic')
  const filterCreatedAt = c.req.query('filter_createdAt')
  const filterUpdatedAt = c.req.query('filter_updatedAt')

  // Build additional parameters - keep snake_case format for backend
  const additionalParams: Record<string, string> = { sort, direction }
  if (filterName) additionalParams.filter_name = filterName
  if (filterDescription) additionalParams.filter_description = filterDescription
  if (filterOwner) additionalParams.filter_owner = filterOwner
  if (filterVisibility) additionalParams.filter_visibility = filterVisibility
  if (filterCreatedAt) additionalParams.filter_createdAt = filterCreatedAt
  if (filterUpdatedAt) additionalParams.filter_updatedAt = filterUpdatedAt
  
  const tables = await fetchHandlerData(TABLES_API_ENDPOINTS.tables, c, {
    page,
    additionalParams,
    // No transformation needed - api-utils handles tables format automatically
  })
  
  const tablesProps = buildPageProps(user, c, {
    tables
    // buildPageProps automatically extracts all filter_* parameters from URL
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
  const limitParam = c.req.query('limit')
  const limit = limitParam ? parseInt(limitParam) : undefined

  // Get sort parameters
  const sort = c.req.query('sort')
  const direction = c.req.query('direction')

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
  console.log('🔍 Table Data Handler - Sort parameters:', { sort, direction })

  // Build additional parameters including all filters and sorting (limit is handled by fetchHandlerData)
  const additionalParams: Record<string, string> = {
    ...filterParams,
    ...(sort && { sort }),
    ...(direction && { direction })
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
 * Prefetches table schema, row data, and module column type options
 */
export async function handleTableDataEditPage(c: Context<{ Bindings: Env; Variables: Variables }>) {
  const user = c.get('user')
  const tableId = c.req.param('id')
  const rowId = c.req.param('rowId')

  if (!tableId || !rowId) {
    throw new Error('Table ID and Row ID are required')
  }

  const apiUrl = c.env?.API_URL || 'http://localhost:8787'
  const token = c.env?.ADMIN_ACCESS_TOKEN || ''
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...(user?.email && { 'X-User-Email': user.email }),
    ...(user?.name && { 'X-User-Name': user.name }),
    ...(user?.id && { 'X-User-Id': user.id })
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

    // Prefetch module column type options for all module columns
    const moduleColumnTypeOptions: Record<string, Array<{ value: string; label: string; raw?: any }>> = {}
    const columns = (tableSchema as any)?.columns || []

    if (Array.isArray(columns) && columns.length > 0) {
      for (const column of columns) {
        if (column.type && column.type.includes(':')) {
          // This is a module column type (format: "moduleId:columnTypeId")
          const [moduleId, columnTypeId] = column.type.split(':')
          try {
            const optionsResponse = await fetch(
              `${apiUrl}/api/admin/modules/${encodeURIComponent(moduleId)}/column-types/${encodeURIComponent(columnTypeId)}/options`,
              { headers }
            )
            if (optionsResponse.ok) {
              const data = await optionsResponse.json() as { options?: any[]; data?: any[] }
              const optionsData = data.options || data.data || []
              if (Array.isArray(optionsData)) {
                moduleColumnTypeOptions[column.name] = optionsData.map((opt: any) => ({
                  value: opt.value || opt.id || opt,
                  label: opt.label || opt.name || opt.value || opt,
                  raw: opt.raw || opt
                }))
              }
            }
          } catch (err) {
            console.error(`Failed to fetch options for ${column.name}:`, err)
          }
        }
      }
    }

    const editProps = buildPageProps(user, c, {
      tableId,
      rowId,
      initialTableSchema: tableSchema,
      initialRowData: rowData,
      moduleColumnTypeOptions: Object.keys(moduleColumnTypeOptions).length > 0 ? moduleColumnTypeOptions : undefined
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
 * Handler for table data add page (/dashboard/tables/[id]/data/add)
 * Prefetches table schema and module column type options to avoid client-side race conditions
 */
export async function handleTableDataAddPage(c: Context<{ Bindings: Env; Variables: Variables }>) {
  const user = c.get('user')
  const tableId = c.req.param('id')

  if (!tableId) {
    throw new Error('Table ID is required')
  }

  const apiUrl = c.env?.API_URL || 'http://localhost:8787'
  const token = c.env?.ADMIN_ACCESS_TOKEN || ''

  // Fetch table schema directly (non-paginated endpoint)
  let tableSchema: any = null
  try {
    const tableResponse = await fetch(`${apiUrl}/api/tables/${tableId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(user?.email && { 'X-User-Email': user.email }),
        ...(user?.name && { 'X-User-Name': user.name }),
        ...(user?.id && { 'X-User-Id': user.id })
      }
    })
    if (tableResponse.ok) {
      const data = await tableResponse.json() as { table?: any }
      tableSchema = data.table
    }
  } catch (err) {
    console.error('Failed to fetch table schema:', err)
  }

  // Fetch columns directly (get the data array from response)
  let columnsData: any[] = []
  try {
    const columnsResponse = await fetch(`${apiUrl}/api/tables/${tableId}/columns`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(user?.email && { 'X-User-Email': user.email }),
        ...(user?.name && { 'X-User-Name': user.name }),
        ...(user?.id && { 'X-User-Id': user.id })
      }
    })
    if (columnsResponse.ok) {
      const data = await columnsResponse.json() as { data?: any[] }
      columnsData = data.data || []
    }
  } catch (err) {
    console.error('Failed to fetch columns:', err)
  }

  // Prefetch module column type options
  const moduleColumnTypeOptions: Record<string, Array<{ value: string; label: string; raw?: any }>> = {}

  if (Array.isArray(columnsData) && columnsData.length > 0) {
    for (const column of columnsData) {
      if (column.type && column.type.includes(':')) {
        // This is a module column type (format: "moduleId:columnTypeId")
        const [moduleId, columnTypeId] = column.type.split(':')
        try {
          const optionsResponse = await fetch(
            `${apiUrl}/api/admin/modules/${encodeURIComponent(moduleId)}/column-types/${encodeURIComponent(columnTypeId)}/options`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                ...(user?.email && { 'X-User-Email': user.email }),
                ...(user?.name && { 'X-User-Name': user.name }),
                ...(user?.id && { 'X-User-Id': user.id })
              }
            }
          )
          if (optionsResponse.ok) {
            const data = await optionsResponse.json() as { options?: any[]; data?: any[] }
            const optionsData = data.options || data.data || []
            if (Array.isArray(optionsData)) {
              moduleColumnTypeOptions[column.name] = optionsData.map((opt: any) => ({
                value: opt.value || opt.id || opt,
                label: opt.label || opt.name || opt.value || opt,
                raw: opt.raw
              }))
            }
          }
        } catch (err) {
          console.error(`Failed to prefetch options for ${column.type}:`, err)
        }
      }
    }
  }

  const addProps = buildPageProps(user, c, {
    tableId,
    tableSchema,
    columns: columnsData,
    moduleColumnTypeOptions,
    params: { id: tableId }
  })

  return renderDashboardPage(c, `/dashboard/tables/${tableId}/data/add`, addProps)
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