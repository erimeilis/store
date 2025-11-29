import { Hono } from 'hono';
import { adminWriteAuthMiddleware } from '@/middleware/auth.js';
import { SalesService } from '@/services/salesService/index.js';
import type { Bindings } from '@/types/bindings.js';
import type { UserContext } from '@/types/database.js';
import type { CreateSaleRequest } from '@/types/sales.js';

const app = new Hono<{
  Bindings: Bindings;
  Variables: { user: UserContext };
}>();

/**
 * Create a new sale (External API endpoint)
 * POST /api/sales
 *
 * This is the main endpoint used by external systems to record sales
 * Requires full API token permissions
 */
app.post('/', adminWriteAuthMiddleware, async (c) => {
  const service = new SalesService(c.env);
  const user = c.get('user');

  try {
    const data: CreateSaleRequest = await c.req.json();

    // Validate required fields
    if (!data.tableId || !data.itemId || !data.customerId) {
      return c.json({
        error: 'Missing required fields: tableId, itemId, customerId'
      }, 400);
    }

    const result = await service.createSale(c, user, data);

    // Handle response based on result type - check if it's a Response object
    if (result instanceof Response) {
      return result;
    }

    return c.json({
      message: 'Sale created successfully',
      sale: result
    }, 201);

  } catch (error) {
    console.error('Error in POST /api/sales:', error);
    return c.json({ error: 'Invalid request data' }, 400);
  }
});

export default app;
