import { Hono } from 'hono';
import type { Bindings } from '@/types/bindings.js';
import type { HonoVariables } from '@/types/hono.js';
import { adminOnlyMiddleware } from '@/middleware/admin.js';

const app = new Hono<{ Bindings: Bindings; Variables: HonoVariables }>();

/**
 * GET /api/admin/stats
 * Get system statistics (admin only)
 */
app.get('/stats', adminOnlyMiddleware, async (c) => {
  try {
    const { getPrismaClient } = await import('@/lib/database.js');
    const database = getPrismaClient(c.env);

    // Get counts
    const [userCount, tableCount, tokenCount] = await Promise.all([
      database.user.count(),
      database.table.count(),
      database.token.count()
    ]);

    // Get table data row count (aggregate from table_data)
    const dataRowCountResult = await database.$queryRaw<[{ count: number }]>`
      SELECT COUNT(*) as count FROM table_data
    `;
    const dataRowCount = dataRowCountResult[0]?.count || 0;

    return c.json({
      users: userCount,
      tables: tableCount,
      tokens: tokenCount,
      dataRows: dataRowCount
    }, 200);

  } catch (error) {
    console.error('❌ Admin stats error:', error);
    return c.json({
      error: 'Failed to fetch system statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export default app;
