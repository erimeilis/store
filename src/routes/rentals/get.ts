import { Hono } from 'hono';
import { adminReadAuthMiddleware } from '@/middleware/auth.js';
import { RentalRepository } from '@/repositories/rentalRepository.js';
import type { Bindings } from '@/types/bindings.js';
import type { UserContext } from '@/types/database.js';
import type { RentalListQuery } from '@/types/rentals.js';

const app = new Hono<{
  Bindings: Bindings;
  Variables: { user: UserContext };
}>();

/**
 * List rentals with filtering and pagination
 * GET /api/rentals
 *
 * Admin endpoint for rental management and unified transactions view
 */
app.get('/', adminReadAuthMiddleware, async (c) => {
  const repository = new RentalRepository(c.env);

  const query: RentalListQuery = {
    page: parseInt(c.req.query('page') || '1', 10),
    limit: parseInt(c.req.query('limit') || '50', 10),
    sortBy: c.req.query('sortBy') as any || 'rentedAt',
    sortOrder: c.req.query('sortOrder') as any || 'desc'
  };

  // Optional filter parameters
  const tableIdParam = c.req.query('tableId');
  if (tableIdParam) query.tableId = tableIdParam;

  const customerIdParam = c.req.query('customerId');
  if (customerIdParam) query.customerId = customerIdParam;

  const rentalStatusParam = c.req.query('rentalStatus');
  if (rentalStatusParam) query.rentalStatus = rentalStatusParam as any;

  const dateFromParam = c.req.query('dateFrom');
  if (dateFromParam) query.dateFrom = dateFromParam;

  const dateToParam = c.req.query('dateTo');
  if (dateToParam) query.dateTo = dateToParam;

  const searchParam = c.req.query('search');
  if (searchParam) query.search = searchParam;

  try {
    const result = await repository.findRentals(query);

    // Transform to match the expected response format for the frontend handler
    // Uses 'pagination' key to match transformPaginatedResponse legacy format
    return c.json({
      data: result.data,
      total: result.pagination.total,
      pagination: {
        page: result.pagination.page,
        limit: result.pagination.limit,
        total: result.pagination.total,
        totalPages: result.pagination.totalPages,
        hasNextPage: result.pagination.hasNextPage,
        hasPrevPage: result.pagination.hasPrevPage
      }
    });
  } catch (error) {
    console.error('Error in GET /api/rentals:', error);
    return c.json({ error: 'Failed to fetch rentals' }, 500);
  }
});

export default app;
