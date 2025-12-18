/**
 * Cache Service
 * KV-based caching layer for high-performance data access
 * All caches use infinite TTL with explicit invalidation on data changes
 *
 * Cache Key Patterns:
 * - auth:token:{tokenString} - Token authentication cache
 * - table:metadata:{tableId} - Table metadata cache
 * - table:columns:{tableId} - Table columns cache
 * - rowcount:{tableId} - Row count cache
 * - item:{tableId}:{itemId} - Item data cache
 * - access:{userId}:{tableId} - Permission/access cache
 */

import type { Token } from '@prisma/client'
import type { UserTable, TableColumn, ParsedTableDataRow } from '@/types/dynamic-tables.js'

/**
 * Query results cache structure
 */
interface QueryResultsCache {
  records: any[]
  total: number
  cachedAt: number
}

/**
 * Simple hash function for generating short cache keys
 * Uses djb2 algorithm - fast and produces good distribution
 * Returns a hex string of 8-16 characters
 */
function hashString(str: string): string {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i)
  }
  // Convert to unsigned 32-bit and then to hex
  return (hash >>> 0).toString(16)
}

/**
 * CacheService provides KV-backed caching for frequently accessed data
 * Pattern: Cache forever, invalidate on change
 */
export class CacheService {
  constructor(private cache: KVNamespace) {}

  // ============================================
  // Token Cache (Phase 1)
  // ============================================

  /**
   * Get cached token data
   * @param tokenString - The bearer token string
   * @returns Token data or null if not cached
   */
  async getToken(tokenString: string): Promise<Token | null> {
    const cacheKey = `auth:token:${tokenString}`
    try {
      const cached = await this.cache.get(cacheKey, 'json')
      return cached as Token | null
    } catch {
      return null
    }
  }

  /**
   * Cache token data (forever - invalidate on change)
   * @param tokenString - The bearer token string
   * @param token - Token data to cache
   */
  async setToken(tokenString: string, token: Token): Promise<void> {
    const cacheKey = `auth:token:${tokenString}`
    try {
      await this.cache.put(cacheKey, JSON.stringify(token))
    } catch (error) {
      console.error('Failed to cache token:', error)
    }
  }

  /**
   * Invalidate cached token (call on token create/update/delete)
   * @param tokenString - The bearer token string to invalidate
   */
  async invalidateToken(tokenString: string): Promise<void> {
    const cacheKey = `auth:token:${tokenString}`
    try {
      await this.cache.delete(cacheKey)
    } catch (error) {
      console.error('Failed to invalidate token cache:', error)
    }
  }

  // ============================================
  // Table Metadata Cache (Phase 2)
  // ============================================

  /**
   * Get cached table metadata
   * @param tableId - The table ID
   * @returns Table metadata or null if not cached
   */
  async getTableMetadata(tableId: string): Promise<UserTable | null> {
    const cacheKey = `table:metadata:${tableId}`
    try {
      const cached = await this.cache.get(cacheKey, 'json')
      return cached as UserTable | null
    } catch {
      return null
    }
  }

  /**
   * Cache table metadata (forever - invalidate on change)
   * @param table - Table data to cache
   */
  async setTableMetadata(table: UserTable): Promise<void> {
    const cacheKey = `table:metadata:${table.id}`
    try {
      await this.cache.put(cacheKey, JSON.stringify(table))
    } catch (error) {
      console.error('Failed to cache table metadata:', error)
    }
  }

  /**
   * Invalidate cached table metadata (call on table update/delete)
   * @param tableId - The table ID to invalidate
   */
  async invalidateTableMetadata(tableId: string): Promise<void> {
    const cacheKey = `table:metadata:${tableId}`
    try {
      await this.cache.delete(cacheKey)
    } catch (error) {
      console.error('Failed to invalidate table metadata cache:', error)
    }
  }

  // ============================================
  // Table Columns Cache (Phase 3)
  // ============================================

  /**
   * Get cached table columns
   * @param tableId - The table ID
   * @returns Table columns or null if not cached
   */
  async getTableColumns(tableId: string): Promise<TableColumn[] | null> {
    const cacheKey = `table:columns:${tableId}`
    try {
      const cached = await this.cache.get(cacheKey, 'json')
      return cached as TableColumn[] | null
    } catch {
      return null
    }
  }

  /**
   * Cache table columns (forever - invalidate on change)
   * @param tableId - The table ID
   * @param columns - Columns data to cache
   */
  async setTableColumns(tableId: string, columns: TableColumn[]): Promise<void> {
    const cacheKey = `table:columns:${tableId}`
    try {
      await this.cache.put(cacheKey, JSON.stringify(columns))
    } catch (error) {
      console.error('Failed to cache table columns:', error)
    }
  }

  /**
   * Invalidate cached table columns (call on column add/update/delete)
   * @param tableId - The table ID to invalidate
   */
  async invalidateTableColumns(tableId: string): Promise<void> {
    const cacheKey = `table:columns:${tableId}`
    try {
      await this.cache.delete(cacheKey)
    } catch (error) {
      console.error('Failed to invalidate table columns cache:', error)
    }
  }

  // ============================================
  // Row Count Cache (Phase 4)
  // ============================================

  /**
   * Get cached row count for a table
   * @param tableId - The table ID
   * @returns Row count or null if not cached
   */
  async getRowCount(tableId: string): Promise<number | null> {
    const cacheKey = `rowcount:${tableId}`
    try {
      const cached = await this.cache.get(cacheKey)
      return cached !== null ? parseInt(cached) : null
    } catch {
      return null
    }
  }

  /**
   * Cache row count (forever - invalidate on row add/delete)
   * @param tableId - The table ID
   * @param count - Row count to cache
   */
  async setRowCount(tableId: string, count: number): Promise<void> {
    const cacheKey = `rowcount:${tableId}`
    try {
      await this.cache.put(cacheKey, count.toString())
    } catch (error) {
      console.error('Failed to cache row count:', error)
    }
  }

  /**
   * Invalidate cached row count (call on row add/delete/import)
   * @param tableId - The table ID to invalidate
   */
  async invalidateRowCount(tableId: string): Promise<void> {
    const cacheKey = `rowcount:${tableId}`
    try {
      await this.cache.delete(cacheKey)
    } catch (error) {
      console.error('Failed to invalidate row count cache:', error)
    }
  }

  /**
   * Get row counts for multiple tables at once
   * @param tableIds - Array of table IDs
   * @returns Map of tableId to row count (only includes cached values)
   */
  async getRowCountsBatch(tableIds: string[]): Promise<Map<string, number>> {
    const counts = new Map<string, number>()

    // Fetch all counts in parallel
    const results = await Promise.all(
      tableIds.map(async (id) => {
        const count = await this.getRowCount(id)
        return { id, count }
      })
    )

    for (const { id, count } of results) {
      if (count !== null) {
        counts.set(id, count)
      }
    }

    return counts
  }

  /**
   * Set row counts for multiple tables at once
   * @param counts - Map of tableId to row count
   */
  async setRowCountsBatch(counts: Map<string, number>): Promise<void> {
    await Promise.all(
      Array.from(counts.entries()).map(([tableId, count]) =>
        this.setRowCount(tableId, count)
      )
    )
  }

  // ============================================
  // Item Data Cache (Phase 6)
  // ============================================

  /**
   * Get cached item data
   * @param tableId - The table ID
   * @param itemId - The item/row ID
   * @returns Item data or null if not cached
   */
  async getItemData(tableId: string, itemId: string): Promise<ParsedTableDataRow | null> {
    const cacheKey = `item:${tableId}:${itemId}`
    try {
      const cached = await this.cache.get(cacheKey, 'json')
      return cached as ParsedTableDataRow | null
    } catch {
      return null
    }
  }

  /**
   * Cache item data (forever - invalidate on change/purchase/rent)
   * @param tableId - The table ID
   * @param item - Item data to cache
   */
  async setItemData(tableId: string, item: ParsedTableDataRow): Promise<void> {
    const cacheKey = `item:${tableId}:${item.id}`
    try {
      await this.cache.put(cacheKey, JSON.stringify(item))
    } catch (error) {
      console.error('Failed to cache item data:', error)
    }
  }

  /**
   * Invalidate cached item data (call on item update/delete/purchase/rent)
   * @param tableId - The table ID
   * @param itemId - The item/row ID to invalidate
   */
  async invalidateItemData(tableId: string, itemId: string): Promise<void> {
    const cacheKey = `item:${tableId}:${itemId}`
    try {
      await this.cache.delete(cacheKey)
    } catch (error) {
      console.error('Failed to invalidate item data cache:', error)
    }
  }

  // ============================================
  // Permission/Access Cache (Phase 7)
  // ============================================

  /**
   * Get cached access decision
   * @param userId - The user ID
   * @param tableId - The table ID
   * @returns Access decision (true/false) or null if not cached
   */
  async getAccess(userId: string, tableId: string): Promise<boolean | null> {
    const cacheKey = `access:${userId}:${tableId}`
    try {
      const cached = await this.cache.get(cacheKey)
      if (cached === null) return null
      return cached === 'true'
    } catch {
      return null
    }
  }

  /**
   * Cache access decision (forever - invalidate on permission change)
   * @param userId - The user ID
   * @param tableId - The table ID
   * @param allowed - Whether access is allowed
   */
  async setAccess(userId: string, tableId: string, allowed: boolean): Promise<void> {
    const cacheKey = `access:${userId}:${tableId}`
    try {
      await this.cache.put(cacheKey, allowed.toString())
    } catch (error) {
      console.error('Failed to cache access:', error)
    }
  }

  /**
   * Invalidate cached access decision
   * @param userId - The user ID
   * @param tableId - The table ID
   */
  async invalidateAccess(userId: string, tableId: string): Promise<void> {
    const cacheKey = `access:${userId}:${tableId}`
    try {
      await this.cache.delete(cacheKey)
    } catch (error) {
      console.error('Failed to invalidate access cache:', error)
    }
  }

  /**
   * Invalidate ALL access cache entries for a table
   * Call this when table visibility changes
   * @param tableId - The table ID
   */
  async invalidateTableAccess(tableId: string): Promise<void> {
    try {
      // KV list to find all access keys for this table
      const list = await this.cache.list({ prefix: `access:` })
      const deletePromises: Promise<void>[] = []

      for (const key of list.keys) {
        if (key.name.endsWith(`:${tableId}`)) {
          deletePromises.push(this.cache.delete(key.name))
        }
      }

      await Promise.all(deletePromises)
    } catch (error) {
      console.error('Failed to invalidate table access cache:', error)
    }
  }

  // ============================================
  // Public Tables Cache (for /api/public/* endpoints)
  // ============================================

  /**
   * Table info structure for public tables cache
   */
  private static readonly PUBLIC_TABLES_KEY = 'public:tables:all'

  /**
   * Get cached list of public/shared tables
   * @returns Array of table info or null if not cached
   */
  async getPublicTables(): Promise<Array<{ id: string; name: string; tableType: string }> | null> {
    try {
      const cached = await this.cache.get(CacheService.PUBLIC_TABLES_KEY, 'json')
      return cached as Array<{ id: string; name: string; tableType: string }> | null
    } catch {
      return null
    }
  }

  /**
   * Cache list of public/shared tables
   * @param tables - Array of table info to cache
   */
  async setPublicTables(tables: Array<{ id: string; name: string; tableType: string }>): Promise<void> {
    try {
      await this.cache.put(CacheService.PUBLIC_TABLES_KEY, JSON.stringify(tables))
    } catch (error) {
      console.error('Failed to cache public tables:', error)
    }
  }

  /**
   * Invalidate public tables cache
   * Call when any table's visibility changes or table is created/deleted
   */
  async invalidatePublicTables(): Promise<void> {
    try {
      await this.cache.delete(CacheService.PUBLIC_TABLES_KEY)
    } catch (error) {
      console.error('Failed to invalidate public tables cache:', error)
    }
  }

  // ============================================
  // Query Results Cache (for /api/public/records)
  // ============================================

  /**
   * TTL for query results cache (60 seconds)
   * Short TTL because data changes frequently, but helps with burst traffic
   */
  private static readonly QUERY_RESULTS_TTL = 60

  /**
   * Generate cache key for query results
   * Uses hash to keep key length under 512 bytes (KV limit)
   * @param tableIds - Sorted list of table IDs being queried
   * @param whereConditions - Filter conditions
   * @param limit - Pagination limit
   * @param offset - Pagination offset
   * @returns Cache key string (max ~40 chars: "query:" + hash + ":" + hash + ":X:X")
   */
  private generateQueryCacheKey(
    tableIds: string[],
    whereConditions: Record<string, string>,
    limit: number,
    offset: number
  ): string {
    // Hash the table IDs (can be many UUIDs)
    const sortedTableIds = [...tableIds].sort().join(',')
    const tableIdsHash = hashString(sortedTableIds)

    // Hash the conditions (can have long values)
    const sortedConditions = Object.entries(whereConditions)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v.toLowerCase()}`)
      .join('&')
    const conditionsHash = sortedConditions ? hashString(sortedConditions) : '0'

    // Final key: "query:{tableHash}:{condHash}:{limit}:{offset}"
    // Max length: ~40 chars, well under 512 byte limit
    return `query:${tableIdsHash}:${conditionsHash}:${limit}:${offset}`
  }

  /**
   * Get cached query results
   * @param tableIds - Table IDs being queried
   * @param whereConditions - Filter conditions
   * @param limit - Pagination limit
   * @param offset - Pagination offset
   * @returns Cached results or null if not cached/expired
   */
  async getQueryResults(
    tableIds: string[],
    whereConditions: Record<string, string>,
    limit: number,
    offset: number
  ): Promise<{ records: any[]; total: number } | null> {
    const cacheKey = this.generateQueryCacheKey(tableIds, whereConditions, limit, offset)
    try {
      const cached = await this.cache.get(cacheKey, 'json') as QueryResultsCache | null
      if (!cached) return null

      // Check if cache is still valid (within TTL)
      const age = (Date.now() - cached.cachedAt) / 1000
      if (age > CacheService.QUERY_RESULTS_TTL) {
        // Cache expired, delete it
        await this.cache.delete(cacheKey)
        return null
      }

      return { records: cached.records, total: cached.total }
    } catch {
      return null
    }
  }

  /**
   * Cache query results with TTL
   * @param tableIds - Table IDs being queried
   * @param whereConditions - Filter conditions
   * @param limit - Pagination limit
   * @param offset - Pagination offset
   * @param records - Query results to cache
   * @param total - Total count for pagination
   */
  async setQueryResults(
    tableIds: string[],
    whereConditions: Record<string, string>,
    limit: number,
    offset: number,
    records: any[],
    total: number
  ): Promise<void> {
    const cacheKey = this.generateQueryCacheKey(tableIds, whereConditions, limit, offset)
    try {
      const cacheData: QueryResultsCache = {
        records,
        total,
        cachedAt: Date.now()
      }
      // Use KV TTL as backup (2x our logical TTL for safety)
      await this.cache.put(cacheKey, JSON.stringify(cacheData), {
        expirationTtl: CacheService.QUERY_RESULTS_TTL * 2
      })
    } catch (error) {
      console.error('Failed to cache query results:', error)
    }
  }

  /**
   * Invalidate query results cache for specific tables
   * Call this when tableData changes (add/update/delete rows)
   * @param tableIds - Table IDs whose data changed
   */
  async invalidateQueryResults(tableIds: string[]): Promise<void> {
    try {
      // List all query cache keys and delete those containing any of the tableIds
      const list = await this.cache.list({ prefix: 'query:' })
      const deletePromises: Promise<void>[] = []

      for (const key of list.keys) {
        // Check if this query cache involves any of the changed tables
        for (const tableId of tableIds) {
          if (key.name.includes(tableId)) {
            deletePromises.push(this.cache.delete(key.name))
            break
          }
        }
      }

      await Promise.all(deletePromises)
    } catch (error) {
      console.error('Failed to invalidate query results cache:', error)
    }
  }

  // ============================================
  // Bulk Invalidation Helpers
  // ============================================

  /**
   * Invalidate all caches for a table (metadata, columns, row count, access, queries)
   * Call this when a table is deleted
   * @param tableId - The table ID
   */
  async invalidateAllTableCaches(tableId: string): Promise<void> {
    await Promise.all([
      this.invalidateTableMetadata(tableId),
      this.invalidateTableColumns(tableId),
      this.invalidateRowCount(tableId),
      this.invalidateTableAccess(tableId),
      this.invalidatePublicTables(), // Also invalidate public tables list
      this.invalidateQueryResults([tableId]) // Invalidate query results for this table
    ])
  }
}
