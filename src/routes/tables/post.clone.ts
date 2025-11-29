import { Hono } from 'hono';
import { adminWriteAuthMiddleware } from '@/middleware/auth.js';
import { cloneTable } from '@/services/tableService/cloneTable.js';
import type { Bindings } from '@/types/bindings.js';
import type { UserContext } from '@/types/database.js';

const app = new Hono<{
  Bindings: Bindings;
  Variables: { user: UserContext };
}>();

/**
 * Clone a table structure without data ("hollow clone")
 * POST /api/tables/clone
 */
app.post('/clone', adminWriteAuthMiddleware, async (c) => {
  console.log('🎯 Clone API endpoint hit!');
  try {
    const user = c.get('user');
    console.log('🎯 Clone request user:', user);
    const body = await c.req.json();
    console.log('🎯 Clone request body:', body);

    // Validate request body
    if (!body.sourceTableId || !body.newTableName) {
      return c.json({
        error: 'Invalid request',
        message: 'sourceTableId and newTableName are required'
      }, 400);
    }

    const request = {
      sourceTableId: body.sourceTableId,
      newTableName: body.newTableName,
      description: body.description,
      visibility: body.visibility || 'private',
      tableType: body.tableType || 'default'
    };

    const result = await cloneTable(c.env, c, user, request);

    // Check if result is a Response (error case)
    if (result && typeof result === 'object' && 'status' in result) {
      return result;
    }

    return c.json({
      message: 'Table cloned successfully',
      table: result
    }, 201);

  } catch (error) {
    console.error('Error cloning table:', error);
    return c.json({
      error: 'Clone failed',
      message: error instanceof Error ? error.message : 'Failed to clone table'
    }, 500);
  }
});

export default app;
