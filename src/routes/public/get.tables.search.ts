import { Hono } from 'hono';
import type { Bindings } from '@/types/bindings.js';
import type { UserContext } from '@/types/database.js';
import { TableRepository } from '@/repositories/tableRepository.js';
import { TableDataRepository } from '@/repositories/tableDataRepository.js';
import { hasTableAccess, getAllowedTableIds, isSupportedTableType } from '@/utils/tableAccess.js';

const app = new Hono<{
  Bindings: Bindings;
  Variables: { user?: UserContext };
}>();

/**
 * Search tables by column presence
 * GET /api/public/tables/search?columns=number,country,area
 *
 * Returns tables that have ALL specified columns
 * Query params:
 * - columns: comma-separated list of column names (required)
 *
 * Example: /api/public/tables/search?columns=number,country
 * Returns: tables that have both "number" and "country" columns
 */
app.get('/tables/search', async (c) => {
  const columnsParam = c.req.query('columns');
  const user = c.get('user');

  if (!columnsParam) {
    return c.json({ error: 'Query parameter "columns" is required' }, 400);
  }

  const requiredColumns = columnsParam.split(',').map(col => col.trim().toLowerCase());
  if (requiredColumns.length === 0) {
    return c.json({ error: 'At least one column name is required' }, 400);
  }

  const tableRepo = new TableRepository(c.env);

  try {
    const allowedTableIds = getAllowedTableIds(user);
    const matchingTables: any[] = [];

    // Get accessible tables based on token
    if (allowedTableIds === null) {
      // Unrestricted access - get all public sale/rent tables
      const result = await tableRepo.findAllPublicTables(1000);

      for (const table of result.tables) {
        const columns = await tableRepo.getTableColumns(table.id);
        const columnNames = columns.map(col => col.name.toLowerCase());

        // Check if table has all required columns
        const hasAllColumns = requiredColumns.every(reqCol => columnNames.includes(reqCol));

        if (hasAllColumns) {
          matchingTables.push({
            id: table.id,
            name: table.name,
            description: table.description,
            tableType: table.tableType,
            columns: columns.map(col => ({
              name: col.name,
              type: col.type
            })),
            createdAt: table.createdAt,
            updatedAt: table.updatedAt
          });
        }
      }
    } else if (allowedTableIds.length > 0) {
      // Token has explicit tableAccess
      for (const tableId of allowedTableIds) {
        const table = await tableRepo.findTableByIdInternal(tableId);
        if (!table || !isSupportedTableType(table.tableType)) continue;

        const columns = await tableRepo.getTableColumns(table.id);
        const columnNames = columns.map(col => col.name.toLowerCase());

        // Check if table has all required columns
        const hasAllColumns = requiredColumns.every(reqCol => columnNames.includes(reqCol));

        if (hasAllColumns) {
          matchingTables.push({
            id: table.id,
            name: table.name,
            description: table.description,
            tableType: table.tableType,
            columns: columns.map(col => ({
              name: col.name,
              type: col.type
            })),
            createdAt: table.createdAt,
            updatedAt: table.updatedAt
          });
        }
      }
    }

    return c.json({
      tables: matchingTables,
      count: matchingTables.length,
      searchedColumns: requiredColumns
    });

  } catch (error) {
    console.error('Error searching tables by columns:', error);
    return c.json({ error: 'Failed to search tables' }, 500);
  }
});

export default app;
