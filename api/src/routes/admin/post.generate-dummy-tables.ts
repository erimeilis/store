import { Hono } from 'hono';
import type { Bindings } from '@/types/bindings.js';
import type { HonoVariables } from '@/types/hono.js';
import { adminOnlyMiddleware } from '@/middleware/admin.js';
import { generateDummyTables } from '@/services/dummyTableGenerator.js';

const app = new Hono<{ Bindings: Bindings; Variables: HonoVariables }>();

/**
 * POST /api/admin/generate-dummy-tables
 * Generate test tables with faker data (admin only)
 */
app.post('/generate-dummy-tables', adminOnlyMiddleware, async (c) => {
  try {
    // Get parameters from request body
    const body = await c.req.json().catch(() => ({}));
    const tableCount = body.tableCount || 100;
    const rowsPerTable = body.rowsPerTable || 200;
    const userId = body.userId;
    // Support both tableType (new) and forSaleOnly (legacy) parameters
    const tableType = body.tableType || (body.forSaleOnly ? 'sale' : undefined);

    console.log('🎲 Admin dummy table generation request:', { tableCount, rowsPerTable, userId, tableType });

    // Validate parameters
    if (!userId) {
      return c.json({
        error: 'userId is required',
        details: 'Must provide userId to assign table ownership'
      }, 400);
    }

    if (tableCount < 1 || tableCount > 500) {
      return c.json({
        error: 'Invalid tableCount',
        details: 'tableCount must be between 1 and 500'
      }, 400);
    }

    if (rowsPerTable < 1 || rowsPerTable > 1000) {
      return c.json({
        error: 'Invalid rowsPerTable',
        details: 'rowsPerTable must be between 1 and 1000'
      }, 400);
    }

    // Generate tables
    const result = await generateDummyTables(c.env, userId, tableCount, rowsPerTable, tableType);

    if (!result.success) {
      return c.json({
        error: 'Table generation failed',
        details: result.error
      }, 500);
    }

    return c.json({
      message: 'Dummy tables generated successfully',
      tablesCreated: result.tablesCreated,
      rowsCreated: result.rowsCreated,
      averageRowsPerTable: Math.round(result.rowsCreated / result.tablesCreated)
    }, 200);

  } catch (error) {
    console.error('❌ Admin dummy table generation error:', error);
    return c.json({
      error: 'Failed to generate dummy tables',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export default app;
