import { Hono } from 'hono';
import { getPrismaClient } from '@/lib/database.js';
import { adminReadAuthMiddleware } from '@/middleware/auth.js';
import type { Bindings } from '@/types/bindings.js';
import type { UserContext } from '@/types/database.js';

const app = new Hono<{
  Bindings: Bindings;
  Variables: { user: UserContext };
}>();

/**
 * List tables available to the current token
 * GET /api/my-tables
 *
 * Returns tables based on the token's tableAccess configuration:
 * - If tableAccess is null/empty, returns all tables (unrestricted access)
 * - If tableAccess contains table IDs, returns only those tables
 */
app.get('/', adminReadAuthMiddleware, async (c) => {
  try {
    const database = getPrismaClient(c.env);
    const user = c.get('user');

    // Parse token's table access
    let allowedTableIds: string[] | null = null;

    if (user.token?.tableAccess) {
      try {
        allowedTableIds = JSON.parse(user.token.tableAccess);
      } catch {
        // If parsing fails, treat as unrestricted
        allowedTableIds = null;
      }
    }

    // Build query based on token access
    const whereCondition = allowedTableIds && allowedTableIds.length > 0
      ? { id: { in: allowedTableIds } }
      : {}; // Empty condition = all tables

    // Fetch tables
    const tables = await database.userTable.findMany({
      where: whereCondition,
      select: {
        id: true,
        name: true,
        description: true,
        visibility: true,
        tableType: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Get column count for each table
    const tablesWithCounts = await Promise.all(
      tables.map(async (table) => {
        const columnCount = await database.tableColumn.count({
          where: { tableId: table.id },
        });

        const rowCount = await database.tableData.count({
          where: { tableId: table.id },
        });

        return {
          id: table.id,
          name: table.name,
          description: table.description,
          visibility: table.visibility,
          tableType: table.tableType,
          // Legacy compatibility
          forSale: table.tableType === 'sale',
          columnCount,
          rowCount,
          createdAt: table.createdAt.toISOString(),
          updatedAt: table.updatedAt.toISOString(),
        };
      })
    );

    return c.json({
      success: true,
      data: tablesWithCounts,
      count: tablesWithCounts.length,
      message: allowedTableIds && allowedTableIds.length > 0
        ? `Access restricted to ${tablesWithCounts.length} table(s)`
        : 'Full access to all tables',
    });
  } catch (error) {
    console.error('Error fetching my tables:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch tables',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export default app;
