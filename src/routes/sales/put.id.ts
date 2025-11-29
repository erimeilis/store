import { Hono } from 'hono';
import { adminWriteAuthMiddleware } from '@/middleware/auth.js';
import { SalesService } from '@/services/salesService/index.js';
import type { Bindings } from '@/types/bindings.js';
import type { UserContext } from '@/types/database.js';
import type { UpdateSaleRequest } from '@/types/sales.js';

const app = new Hono<{
  Bindings: Bindings;
  Variables: { user: UserContext };
}>();

/**
 * Update sale (Admin only)
 * PUT /api/sales/:id
 *
 * Limited to status, payment method, and notes for audit compliance
 */
app.put('/:id', adminWriteAuthMiddleware, async (c) => {
  const service = new SalesService(c.env);
  const user = c.get('user');
  const saleId = c.req.param('id');

  try {
    const data: UpdateSaleRequest = await c.req.json();

    const result = await service.updateSale(c, user, saleId, data);

    // Handle response based on result type - check if it's a Response object
    if (result instanceof Response) {
      return result;
    }

    return c.json({
      message: 'Sale updated successfully',
      sale: result
    });

  } catch (error) {
    console.error('Error in PUT /api/sales/:id:', error);
    return c.json({ error: 'Invalid request data' }, 400);
  }
});

export default app;
