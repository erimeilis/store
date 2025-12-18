import { Hono } from 'hono';
import type { Bindings } from '@/types/bindings.js';
import type { UserContext } from '@/types/database.js';
import { getPrismaClient } from '@/lib/database.js';
import { getAllowedTableIds } from '@/utils/tableAccess.js';
import { isGroupedMultiselectValue, parseGroupedMultiselect } from '@/utils/multiselectTransform.js';
import { CacheService } from '@/lib/cache-service.js';

const app = new Hono<{
  Bindings: Bindings;
  Variables: { user?: UserContext };
}>();

/**
 * Flattens data fields to top level in record
 * Moves data.* fields (number, country, area, etc.) to top level
 * Transforms grouped multiselect values (with :personal/:business suffixes) into structured objects
 */
function flattenRecord(row: any, tableInfo: { id: string; name: string; tableType: string }): any {
  const data = typeof row.data === 'string' ? JSON.parse(row.data) : row.data as Record<string, any>;

  // Start with top-level fields
  const flattened: any = {
    id: row.id,
    tableId: tableInfo.id,
    tableName: tableInfo.name,
    tableType: tableInfo.tableType,
  };

  // Flatten all data fields to top level, transforming grouped multiselect values
  for (const [key, value] of Object.entries(data)) {
    if (isGroupedMultiselectValue(value)) {
      // Transform grouped multiselect into structured object
      flattened[key] = parseGroupedMultiselect(value as string)
    } else {
      flattened[key] = value
    }
  }

  // Add metadata at the end
  flattened.createdAt = row.createdAt;
  flattened.updatedAt = row.updatedAt;

  return flattened;
}

/**
 * Get records with filtering across all accessible tables
 * GET /api/public/records
 *
 * Returns records matching the specified conditions with flattened data
 * Query params:
 * - where[columnName]=value: Filter by column values (multiple allowed, AND logic)
 * - columns: comma-separated list of columns to include in response
 * - limit: max records to return (default: 100, max: 1000)
 * - offset: pagination offset (default: 0)
 *
 * Examples:
 * - GET /api/public/records?where[country]=UK
 *   Returns: all records where country = UK
 *
 * - GET /api/public/records?where[country]=UK&where[area]=London
 *   Returns: all records where country=UK AND area=London
 *
 * - GET /api/public/records?where[country]=UK&columns=number,area,price
 *   Returns: only specified columns for matching records
 *
 * Response format has data.* fields flattened to top level:
 * {
 *   "id": "...",
 *   "tableId": "...",
 *   "tableName": "...",
 *   "number": "+1234567890",  // was data.number
 *   "country": "UK",          // was data.country
 *   "area": "London",         // was data.area
 *   "price": 100,             // was data.price
 *   ...
 * }
 *
 * Grouped multiselect values (with :personal/:business suffixes) are transformed:
 * Input (stored): "address:personal,name-lastname:business,address-city:business"
 * Output (API):
 * {
 *   "docs": {
 *     "personal": ["address"],
 *     "business": ["name-lastname", "address-city"]
 *   }
 * }
 */
app.get('/records', async (c) => {
  const user = c.get('user');
  const queryParams = c.req.query();

  // Parse where conditions from query params (where[column]=value format)
  const whereConditions: Record<string, string> = {};
  for (const [key, value] of Object.entries(queryParams)) {
    const match = key.match(/^where\[(.+)\]$/);
    if (match && match[1]) {
      whereConditions[match[1]] = value as string;
    }
  }

  // Parse columns to include (optional)
  const columnsParam = c.req.query('columns');
  const includeColumns = columnsParam
    ? columnsParam.split(',').map(col => col.trim())
    : null;

  // Parse pagination - apply reasonable limits
  const limit = Math.min(parseInt(c.req.query('limit') || '100'), 1000);
  const offset = parseInt(c.req.query('offset') || '0');

  const prisma = getPrismaClient(c.env);
  const cache = c.env.KV ? new CacheService(c.env.KV) : null;

  try {
    const allowedTableIds = getAllowedTableIds(user);

    // Get eligible table IDs efficiently with caching
    let tableIds: string[] = [];
    const tableInfoMap = new Map<string, { name: string; tableType: string }>();

    if (allowedTableIds === null) {
      // Unrestricted access - try cache first for public tables
      let tables = cache ? await cache.getPublicTables() : null;

      if (!tables) {
        // Cache miss - query database
        tables = await prisma.userTable.findMany({
          where: {
            visibility: { in: ['public', 'shared'] },
            tableType: { in: ['sale', 'rent'] }
          },
          select: { id: true, name: true, tableType: true }
        });
        // Cache the result
        if (cache && tables.length > 0) {
          await cache.setPublicTables(tables);
        }
      }

      for (const t of tables) {
        tableIds.push(t.id);
        tableInfoMap.set(t.id, { name: t.name, tableType: t.tableType });
      }
    } else if (allowedTableIds.length > 0) {
      // Token has explicit tableAccess - get those tables (no caching for token-specific queries)
      const tables = await prisma.userTable.findMany({
        where: {
          id: { in: allowedTableIds },
          tableType: { in: ['sale', 'rent'] }
        },
        select: { id: true, name: true, tableType: true }
      });
      for (const t of tables) {
        tableIds.push(t.id);
        tableInfoMap.set(t.id, { name: t.name, tableType: t.tableType });
      }
    }

    if (tableIds.length === 0) {
      return c.json({
        records: [],
        count: 0,
        total: 0,
        pagination: { limit, offset, hasMore: false },
        filters: Object.keys(whereConditions).length > 0 ? whereConditions : undefined
      });
    }

    // Check cache first for identical query
    if (cache) {
      const cachedResults = await cache.getQueryResults(tableIds, whereConditions, limit, offset);
      if (cachedResults) {
        // Process cached records through flattenRecord (they're already flattened but need tableInfo)
        const records = cachedResults.records.map(record => {
          // Filter columns if specified
          if (includeColumns) {
            const filteredRecord: any = {
              id: record.id,
              tableId: record.tableId,
              tableName: record.tableName,
              tableType: record.tableType
            };
            for (const col of includeColumns) {
              if (col in record) {
                filteredRecord[col] = record[col];
              }
            }
            return filteredRecord;
          }
          return record;
        });

        return c.json({
          records,
          count: records.length,
          total: cachedResults.total,
          pagination: {
            limit,
            offset,
            hasMore: offset + limit < cachedResults.total
          },
          filters: Object.keys(whereConditions).length > 0 ? whereConditions : undefined,
          cached: true
        });
      }
    }

    // Build optimized SQL query with filters applied at database level
    const placeholders = tableIds.map(() => '?').join(',');
    let sql = `
      SELECT td.id, td.tableId, td.data, td.createdAt, td.updatedAt
      FROM tableData td
      WHERE td.tableId IN (${placeholders})
    `;
    const params: any[] = [...tableIds];

    // Add where conditions using json_extract for efficient filtering
    for (const [colName, colValue] of Object.entries(whereConditions)) {
      // Case-insensitive matching using LOWER()
      sql += ` AND LOWER(json_extract(td.data, '$.${colName}')) = LOWER(?)`;
      params.push(colValue);
    }

    // Get total count first (without pagination)
    const countSql = sql.replace(
      'SELECT td.id, td.tableId, td.data, td.createdAt, td.updatedAt',
      'SELECT COUNT(*) as total'
    );
    const countResult = await prisma.$queryRawUnsafe<Array<{ total: number }>>(countSql, ...params);
    const total = Number(countResult[0]?.total || 0);

    // Add pagination
    sql += ` ORDER BY td.updatedAt DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    // Execute the main query
    const rows = await prisma.$queryRawUnsafe<Array<{
      id: string;
      tableId: string;
      data: string;
      createdAt: Date;
      updatedAt: Date;
    }>>(sql, ...params);

    // Process and flatten records (full records without column filtering for caching)
    const fullRecords = rows.map(row => {
      const tableInfo = tableInfoMap.get(row.tableId) || { name: 'Unknown', tableType: 'unknown' };
      return flattenRecord(row, {
        id: row.tableId,
        name: tableInfo.name,
        tableType: tableInfo.tableType
      });
    });

    // Cache the full results (before column filtering) for future queries
    if (cache) {
      // Fire and forget - don't await to avoid blocking response
      cache.setQueryResults(tableIds, whereConditions, limit, offset, fullRecords, total).catch(() => {});
    }

    // Apply column filtering if specified
    const records = includeColumns
      ? fullRecords.map(flatRecord => {
          const filteredRecord: any = {
            id: flatRecord.id,
            tableId: flatRecord.tableId,
            tableName: flatRecord.tableName,
            tableType: flatRecord.tableType
          };
          for (const col of includeColumns) {
            if (col in flatRecord) {
              filteredRecord[col] = flatRecord[col];
            }
          }
          return filteredRecord;
        })
      : fullRecords;

    return c.json({
      records,
      count: records.length,
      total,
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < total
      },
      filters: Object.keys(whereConditions).length > 0 ? whereConditions : undefined
    });

  } catch (error) {
    console.error('Error fetching records:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ error: 'Failed to fetch records', details: errorMessage }, 500);
  }
});

export default app;
