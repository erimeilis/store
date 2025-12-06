/**
 * Admin API Handler
 * Handles admin-only operations like dummy data generation
 */

/**
 * Table generator definition from the API
 */
export interface TableGenerator {
  id: string
  displayName: string
  description: string
  icon?: string
  category?: string
  tableType: 'sale' | 'rent' | 'default'
  defaultTableCount: number
  defaultRowCount: number
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error'
  customGenerator?: boolean
  moduleId?: string
  moduleName?: string
}

interface TableGeneratorsResponse {
  data: TableGenerator[]
  meta: {
    builtInCount: number
    moduleCount: number
    totalCount: number
  }
}

/**
 * Fetch available table generators from the API
 */
export async function fetchTableGenerators(): Promise<{
  success: true
  generators: TableGenerator[]
  meta: { builtInCount: number; moduleCount: number; totalCount: number }
} | { success: false; error: string }> {
  try {
    const response = await fetch('/api/schema/table-generators', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json() as TableGeneratorsResponse

    if (!response.ok) {
      return {
        success: false,
        error: 'Failed to fetch table generators'
      }
    }

    return {
      success: true,
      generators: data.data,
      meta: data.meta
    }
  } catch (error) {
    console.error('Error fetching table generators:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    }
  }
}

interface GenerateDummyTablesResponse {
  message?: string
  tablesCreated: number
  rowsCreated: number
  averageRowsPerTable?: number
  error?: string
  details?: string
}

export type TableType = 'default' | 'sale' | 'rent'

/**
 * Generate dummy tables with test data
 * @param userId - User ID to assign as table owner
 * @param tableCount - Number of tables to generate (default: 100)
 * @param rowsPerTable - Number of rows per table (default: 200)
 * @param tableType - Force a specific table type: 'sale', 'rent', or undefined for random mix
 */
export async function generateDummyTables(
  userId: string,
  tableCount: number = 100,
  rowsPerTable: number = 200,
  tableType?: TableType
): Promise<{ success: true; tablesCreated: number; rowsCreated: number } | { success: false; error: string }> {
  try {
    const response = await fetch('/api/admin/generate-dummy-tables', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        tableCount,
        rowsPerTable,
        tableType
      })
    })

    const data = await response.json() as GenerateDummyTablesResponse

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.details || 'Failed to generate dummy tables'
      }
    }

    return {
      success: true,
      tablesCreated: data.tablesCreated,
      rowsCreated: data.rowsCreated
    }
  } catch (error) {
    console.error('Error generating dummy tables:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    }
  }
}

interface AdminStatsResponse {
  users: number
  tables: number
  tokens: number
  dataRows: number
  error?: string
  details?: string
}

/**
 * Get system statistics (admin only)
 */
export async function getAdminStats(): Promise<{
  success: true
  stats: {
    users: number
    tables: number
    tokens: number
    dataRows: number
  }
} | { success: false; error: string }> {
  try {
    const response = await fetch('/api/admin/stats', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json() as AdminStatsResponse

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.details || 'Failed to fetch statistics'
      }
    }

    return {
      success: true,
      stats: {
        users: data.users,
        tables: data.tables,
        tokens: data.tokens,
        dataRows: data.dataRows
      }
    }
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    }
  }
}
