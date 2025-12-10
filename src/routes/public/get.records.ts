import { Hono } from 'hono';
import type { Bindings } from '@/types/bindings.js';
import type { UserContext } from '@/types/database.js';
import { TableRepository } from '@/repositories/tableRepository.js';
import { TableDataRepository } from '@/repositories/tableDataRepository.js';
import { getAllowedTableIds, isSupportedTableType } from '@/utils/tableAccess.js';

const app = new Hono<{
  Bindings: Bindings;
  Variables: { user?: UserContext };
}>();

/**
 * Check if a value looks like a grouped multiselect string
 * e.g., "address:personal,name-lastname:business,address-city:business"
 */
function isGroupedMultiselectValue(value: unknown): boolean {
  if (typeof value !== 'string' || !value) return false
  // Must contain at least one :personal or :business suffix
  return value.includes(':personal') || value.includes(':business')
}

/**
 * Parse a grouped multiselect value into structured object
 * Input: "address:personal,name-lastname:business,address-city:business"
 * Output: { personal: ["address"], business: ["name-lastname", "address-city"] }
 */
function parseGroupedMultiselect(value: string): { personal: string[]; business: string[] } {
  const result: { personal: string[]; business: string[] } = {
    personal: [],
    business: []
  }

  if (!value) return result

  const items = value.split(',').map(v => v.trim()).filter(Boolean)

  for (const item of items) {
    if (item.endsWith(':personal')) {
      result.personal.push(item.replace(/:personal$/, ''))
    } else if (item.endsWith(':business')) {
      result.business.push(item.replace(/:business$/, ''))
    } else {
      // No suffix - could be legacy data, add to both or default to personal
      result.personal.push(item)
    }
  }

  return result
}

/**
 * Flattens data fields to top level in record
 * Moves data.* fields (number, country, area, etc.) to top level
 * Transforms grouped multiselect values (with :personal/:business suffixes) into structured objects
 */
function flattenRecord(row: any, tableInfo: { id: string; name: string; tableType: string }): any {
  const data = row.data as Record<string, any>;

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

  // Parse pagination
  const limit = Math.min(parseInt(c.req.query('limit') || '100'), 1000);
  const offset = parseInt(c.req.query('offset') || '0');

  const tableRepo = new TableRepository(c.env);
  const dataRepo = new TableDataRepository(c.env);

  try {
    const allowedTableIds = getAllowedTableIds(user);
    const allRecords: any[] = [];

    // Get accessible tables
    const tablesToProcess: { id: string; name: string; tableType: string }[] = [];

    if (allowedTableIds === null) {
      // Unrestricted access - get all public sale/rent tables
      const result = await tableRepo.findAllPublicTables(1000);
      for (const table of result.tables) {
        tablesToProcess.push({
          id: table.id,
          name: table.name,
          tableType: table.tableType
        });
      }
    } else if (allowedTableIds.length > 0) {
      // Token has explicit tableAccess - fetch all tables in parallel
      const tablePromises = allowedTableIds.map(tableId =>
        tableRepo.findTableByIdInternal(tableId)
      );
      const tables = await Promise.all(tablePromises);

      for (const table of tables) {
        if (table && isSupportedTableType(table.tableType)) {
          tablesToProcess.push({
            id: table.id,
            name: table.name,
            tableType: table.tableType
          });
        }
      }
    }

    // If there are filters, fetch columns for all tables in parallel
    let eligibleTables = tablesToProcess;

    if (Object.keys(whereConditions).length > 0) {
      const columnsPromises = tablesToProcess.map(t =>
        tableRepo.getTableColumns(t.id).then(cols => ({
          tableInfo: t,
          columnNames: cols.map(col => col.name.toLowerCase())
        }))
      );
      const allColumns = await Promise.all(columnsPromises);

      // Filter to tables that have all filter columns
      eligibleTables = allColumns
        .filter(({ columnNames }) =>
          Object.keys(whereConditions).every(
            filterCol => columnNames.includes(filterCol.toLowerCase())
          )
        )
        .map(({ tableInfo }) => tableInfo);
    }

    // Fetch data for eligible tables in parallel (with reasonable limit)
    const dataPromises = eligibleTables.map(tableInfo =>
      dataRepo.findTableData(
        tableInfo.id,
        {}, // We'll filter in memory for flexibility with case-insensitive matching
        { page: 1, limit: 5000, offset: 0 }
      ).then(result => ({ tableInfo, data: result.data }))
    );

    const allTableData = await Promise.all(dataPromises);

    // Process data from all tables
    for (const { tableInfo, data } of allTableData) {
      for (const row of data) {
        const rowData = row.data as Record<string, any>;

        // Apply where conditions (case-insensitive)
        let matchesConditions = true;
        for (const [filterCol, filterValue] of Object.entries(whereConditions)) {
          const actualValue = rowData[filterCol];
          if (String(actualValue).toLowerCase() !== String(filterValue).toLowerCase()) {
            matchesConditions = false;
            break;
          }
        }

        if (matchesConditions) {
          let flatRecord = flattenRecord(row, tableInfo);

          // Filter columns if specified
          if (includeColumns) {
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

            flatRecord = filteredRecord;
          }

          allRecords.push(flatRecord);
        }
      }
    }

    // Apply pagination
    const paginatedRecords = allRecords.slice(offset, offset + limit);

    return c.json({
      records: paginatedRecords,
      count: paginatedRecords.length,
      total: allRecords.length,
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < allRecords.length
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
