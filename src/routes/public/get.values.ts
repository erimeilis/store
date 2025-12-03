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

    // Get accessible tables with their info in a single query batch
    interface TableInfo {
      id: string;
      name: string;
      tableType: string;
    }
    const tablesToProcess: TableInfo[] = [];

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

    // Fetch columns for all tables in parallel
    const columnsPromises = tablesToProcess.map(t =>
      tableRepo.getTableColumns(t.id).then(cols => ({ tableId: t.id, columns: cols }))
    );
    const allColumns = await Promise.all(columnsPromises);

    // Build a map of tableId -> column names
    const tableColumnsMap = new Map<string, string[]>();
    for (const { tableId, columns } of allColumns) {
      tableColumnsMap.set(tableId, columns.map(col => col.name.toLowerCase()));
    }

    // Filter tables that have the requested column and all filter columns
    const eligibleTables = tablesToProcess.filter(t => {
      const columnNames = tableColumnsMap.get(t.id) || [];

      // Check if table has the requested column
      if (!columnNames.includes(columnName.toLowerCase())) {
        return false;
      }

      // Check if table has all filter columns
      return Object.keys(whereConditions).every(
        filterCol => columnNames.includes(filterCol.toLowerCase())
      );
    });

    // Fetch data for eligible tables in parallel (with reasonable limit)
    const dataPromises = eligibleTables.map(tableInfo =>
      dataRepo.findTableData(
        tableInfo.id,
        {}, // We'll filter in memory for flexibility
        { page: 1, limit: 5000, offset: 0 }
      ).then(result => ({ tableInfo, data: result.data }))
    );

    const allTableData = await Promise.all(dataPromises);

    // Process data from all tables
    for (const { tableInfo, data } of allTableData) {
      tablesSampled.push(tableInfo.name);

      for (const row of data) {
        const rowData = row.data as Record<string, any>;

        // Apply where conditions
        let matchesConditions = true;
        for (const [filterCol, filterValue] of Object.entries(whereConditions)) {
          const actualValue = rowData[filterCol];
          if (String(actualValue).toLowerCase() !== String(filterValue).toLowerCase()) {
            matchesConditions = false;
            break;
          }
        }

        if (matchesConditions) {
          const value = rowData[columnName];
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ error: 'Failed to fetch column values', details: errorMessage }, 500);
  }
});

export default app;
