import { Hono } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { adminWriteAuthMiddleware } from '@/middleware/auth.js';
import { TableService } from '@/services/tableService/index.js';
import type { Bindings } from '@/types/bindings.js';
import type { UserContext } from '@/types/database.js';

const app = new Hono<{
  Bindings: Bindings;
  Variables: { user: UserContext };
}>();

/**
 * Import data into table
 * POST /api/tables/:id/import-data
 */
app.post('/:id/import-data', adminWriteAuthMiddleware, async (c) => {
  try {
    const tableId = c.req.param('id');
    console.log('🔍 Import-data route called with tableId:', tableId);
    const { data, headers, columnMappings, importMode, hasHeaders } = await c.req.json();
    console.log('🔍 Import-data received:', { dataLength: data?.length, columnMappingsLength: columnMappings?.length, importMode, hasHeaders });

    if (!data || !Array.isArray(data) || data.length === 0) {
      console.log('🔍 Import-data FAILED: No data provided');
      return c.json({
        error: 'No data provided',
        message: 'Please provide data to import'
      }, 400);
    }

    if (!columnMappings || !Array.isArray(columnMappings) || columnMappings.length === 0) {
      console.log('🔍 Import-data FAILED: No column mappings');
      return c.json({
        error: 'No column mappings',
        message: 'Please map at least one column'
      }, 400);
    }

    const service = new TableService(c.env);
    const user = c.get('user');

    const result = await service.importTableData(c, user, tableId, {
      data,
      headers,
      columnMappings,
      importMode: importMode || 'add',
      hasHeaders: hasHeaders || false
    });

    return c.json(result.response, result.status as ContentfulStatusCode);

  } catch (error) {
    console.error('Error importing table data:', error);
    return c.json({
      error: 'Import failed',
      message: error instanceof Error ? error.message : 'Failed to import data'
    }, 500);
  }
});

export default app;
