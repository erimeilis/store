/**
 * Admin API Handler
 * Handles admin-only operations like dummy data generation
 */

interface GenerateDummyTablesResponse {
  message?: string
  tablesCreated: number
  rowsCreated: number
  averageRowsPerTable?: number
  error?: string
  details?: string
}

/**
 * Generate dummy tables with test data
 * @param userId - User ID to assign as table owner
 * @param tableCount - Number of tables to generate (default: 100)
 * @param rowsPerTable - Number of rows per table (default: 200)
 * @param forSaleOnly - If true, all generated tables will be marked as "for sale" (default: false)
 */
export async function generateDummyTables(
  userId: string,
  tableCount: number = 100,
  rowsPerTable: number = 200,
  forSaleOnly: boolean = false
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
        forSaleOnly
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
