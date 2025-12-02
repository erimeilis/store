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
 * Get distinct values for a column across all accessible tables
 * GET /api/public/values/:columnName
 *
 * Returns all unique values for the specified column
 * Query params (optional):
 * - where[columnName]=value: Filter by other column values
 *
 * Examples:
 * - GET /api/public/values/country
 *   Returns: all unique country values
 *
 * - GET /api/public/values/area?where[country]=UK
 *   Returns: all unique area values where country = UK
 *
 * - GET /api/public/values/number?where[country]=UK&where[area]=London
 *   Returns: all unique number values where country=UK AND area=London
 */
app.get('/values/:columnName', async (c) => {
  const columnName = c.req.param('columnName');
  const user = c.get('user');

  if (!columnName) {
    return c.json({ error: 'Column name is required' }, 400);
  }

  // Parse where conditions from query params (where[column]=value format)
  const whereConditions: Record<string, string> = {};
  const queryParams = c.req.query();

  for (const [key, value] of Object.entries(queryParams)) {
    const match = key.match(/^where\[(.+)\]$/);
    if (match && match[1]) {
      whereConditions[match[1]] = value as string;
    }
  }

  const tableRepo = new TableRepository(c.env);
  const dataRepo = new TableDataRepository(c.env);

  try {
    const allowedTableIds = getAllowedTableIds(user);
    const allValues: Set<any> = new Set();
    const tablesSampled: string[] = [];

    // Get accessible tables and collect values
    const tablesToProcess: string[] = [];

    if (allowedTableIds === null) {
      // Unrestricted access - get all public sale/rent tables
      const result = await tableRepo.findAllPublicTables(1000);
      for (const table of result.tables) {
        tablesToProcess.push(table.id);
      }
    } else if (allowedTableIds.length > 0) {
      // Token has explicit tableAccess
      for (const tableId of allowedTableIds) {
        const table = await tableRepo.findTableByIdInternal(tableId);
        if (table && isSupportedTableType(table.tableType)) {
          tablesToProcess.push(tableId);
        }
      }
    }

    // Process each table
    for (const tableId of tablesToProcess) {
      const columns = await tableRepo.getTableColumns(tableId);
      const columnNames = columns.map(col => col.name.toLowerCase());

      // Check if table has the requested column
      if (!columnNames.includes(columnName.toLowerCase())) {
        continue;
      }

      // Check if table has all filter columns
      const hasAllFilterColumns = Object.keys(whereConditions).every(
        filterCol => columnNames.includes(filterCol.toLowerCase())
      );
      if (!hasAllFilterColumns) {
        continue;
      }

      // Get table data
      const result = await dataRepo.findTableData(
        tableId,
        {}, // We'll filter in memory for flexibility
        { page: 1, limit: 10000, offset: 0 }
      );

      const table = await tableRepo.findTableByIdInternal(tableId);
      if (table) {
        tablesSampled.push(table.name);
      }

      for (const row of result.data) {
        const data = row.data as Record<string, any>;

        // Apply where conditions
        let matchesConditions = true;
        for (const [filterCol, filterValue] of Object.entries(whereConditions)) {
          const actualValue = data[filterCol];
          if (String(actualValue).toLowerCase() !== String(filterValue).toLowerCase()) {
            matchesConditions = false;
            break;
          }
        }

        if (matchesConditions) {
          const value = data[columnName];
          if (value !== undefined && value !== null && value !== '') {
            allValues.add(value);
          }
        }
      }
    }

    // Convert Set to sorted array
    const valuesArray = Array.from(allValues).sort((a, b) => {
      if (typeof a === 'number' && typeof b === 'number') {
        return a - b;
      }
      return String(a).localeCompare(String(b));
    });

    return c.json({
      column: columnName,
      values: valuesArray,
      count: valuesArray.length,
      filters: Object.keys(whereConditions).length > 0 ? whereConditions : undefined,
      tablesSampled: tablesSampled
    });

  } catch (error) {
    console.error('Error fetching column values:', error);
    return c.json({ error: 'Failed to fetch column values' }, 500);
  }
});

export default app;
