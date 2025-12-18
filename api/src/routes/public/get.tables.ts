import { Hono } from 'hono';
import type { Bindings } from '@/types/bindings.js';
import type { UserContext } from '@/types/database.js';
import { PublicSalesService } from '@/services/publicSalesService/index.js';

const app = new Hono<{
  Bindings: Bindings;
  Variables: { user: UserContext };
}>();

/**
 * Get list of tables the token has access to
 * GET /api/public/tables
 *
 * Returns tables that:
 * 1. Are public/shared visibility
 * 2. Are sale or rent type
 * 3. Token has explicit access to (via tableAccess) OR token is admin/frontend
 */
app.get('/tables', async (c) => {
  const service = new PublicSalesService(c.env);
  const user = c.get('user');

  try {
    // Get allowed table IDs from token's tableAccess
    let allowedTableIds: string[] | null = null;

    // Admin and frontend tokens have unrestricted access
    if (user.tokenId !== 'admin-token' && user.tokenId !== 'frontend-token') {
      if (user.token?.tableAccess) {
        try {
          allowedTableIds = JSON.parse(user.token.tableAccess);
        } catch (e) {
          console.error('Error parsing tableAccess:', e);
          allowedTableIds = [];
        }
      } else {
        // Token has no tableAccess defined - no tables accessible
        allowedTableIds = [];
      }
    }

    const tables = await service.getAllPublicTables(c, allowedTableIds);
    return c.json({
      tables,
      count: tables.length
    });

  } catch (error) {
    console.error('Error fetching public tables:', error);
    return c.json({ error: 'Failed to fetch available tables' }, 500);
  }
});

export default app;
