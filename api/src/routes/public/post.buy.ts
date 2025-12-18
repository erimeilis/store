import { Hono } from 'hono';
import type { Bindings } from '@/types/bindings.js';
import type { UserContext } from '@/types/database.js';
import type { CreateSaleRequest } from '@/types/sales.js';
import { readAuthMiddleware } from '@/middleware/auth.js';
import { PublicSalesService } from '@/services/publicSalesService/index.js';

const app = new Hono<{
  Bindings: Bindings;
  Variables: { user?: UserContext };
}>();

/**
 * Purchase an item
 * POST /api/public/buy
 *
 * Creates a sale transaction for an item
 * Requires read authentication (API token) to prevent abuse
 */
app.post('/buy', readAuthMiddleware, async (c) => {
  const service = new PublicSalesService(c.env);
  const user = c.get('user');

  try {
    const data = await c.req.json();

    // Validate required fields
    if (!data.tableId || !data.itemId || !data.customerId) {
      return c.json({
        error: 'Missing required fields: tableId, itemId, customerId'
      }, 400);
    }

    if (!data.quantitySold || data.quantitySold < 1) {
      return c.json({
        error: 'quantitySold must be a positive number'
      }, 400);
    }

    const purchaseRequest: CreateSaleRequest = {
      tableId: data.tableId,
      itemId: data.itemId,
      customerId: data.customerId,
      quantitySold: data.quantitySold,
      paymentMethod: data.paymentMethod,
      notes: data.notes
    };

    const result = await service.purchaseItem(c, user!, purchaseRequest);

    if ('error' in result) {
      return c.json({ error: result.error }, (result.status || 400) as any);
    }

    return c.json({
      message: 'Purchase completed successfully',
      sale: result.sale
    }, 201);

  } catch (error) {
    console.error('Error processing purchase:', error);
    return c.json({ error: 'Failed to process purchase' }, 500);
  }
});

export default app;
