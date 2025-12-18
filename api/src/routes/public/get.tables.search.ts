import { Hono } from 'hono';
import type { Bindings } from '@/types/bindings.js';
import type { UserContext } from '@/types/database.js';
import { TableRepository } from '@/repositories/tableRepository.js';
import { getAllowedTableIds, isSupportedTableType } from '@/utils/tableAccess.js';

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
    interface TableInfo {
      id: string;
      name: string;
      description: string | null;
      tableType: string;
      createdAt: Date;
      updatedAt: Date;
    }
    const tablesToProcess: TableInfo[] = [];

    if (allowedTableIds === null) {
      // Unrestricted access - get all public sale/rent tables
      const result = await tableRepo.findAllPublicTables(1000);
      for (const table of result.tables) {
        tablesToProcess.push({
          id: table.id,
          name: table.name,
          description: table.description,
          tableType: table.tableType,
          createdAt: table.createdAt,
          updatedAt: table.updatedAt
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
            description: table.description,
            tableType: table.tableType,
            createdAt: table.createdAt,
            updatedAt: table.updatedAt
          });
        }
      }
    }

    // Fetch columns for all tables in parallel
    const columnsPromises = tablesToProcess.map(table =>
      tableRepo.getTableColumns(table.id).then(cols => ({ table, columns: cols }))
    );
    const allColumns = await Promise.all(columnsPromises);

    // Check which tables have all required columns
    for (const { table, columns } of allColumns) {
      const columnNames = columns.map(col => col.name.toLowerCase());
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

    return c.json({
      tables: matchingTables,
      count: matchingTables.length,
      searchedColumns: requiredColumns
    });

  } catch (error) {
    console.error('Error searching tables by columns:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ error: 'Failed to search tables', details: errorMessage }, 500);
  }
});

export default app;
