import { Hono } from 'hono';
import { getPrismaClient } from '@/lib/database.js';
import { writeAuthMiddleware } from '@/middleware/auth.js';
import { formatApiDate } from '@/lib/date-utils.js';
import { buildPaginationInfo } from '@/utils/common.js';

const app = new Hono();

/**
 * Get all users with pagination, filtering, and sorting
 * GET /api/users
 */
app.get('/', writeAuthMiddleware, async (c) => {
  try {
    const database = getPrismaClient(c.env);
    const { page = '1', limit = '10', sort, direction = 'asc', exact, ...filters } = c.req.query();

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Build where clause from filters
    const whereConditions: any = {};

    // Handle column filters (filterEmail, filterName, etc.) - camelCase
    Object.entries(filters).forEach(([key, value]) => {
      if (key.startsWith('filter') && value) {
        // Convert camelCase filter to column name (filterEmail -> email)
        const column = key.replace('filter', '').charAt(0).toLowerCase() + key.slice(7);
        if (column === 'email' || column === 'name') {
          if (exact && column === 'email') {
            // Exact match for email (used by OAuth callback)
            whereConditions[column] = value;
          } else {
            // Case-sensitive partial match for SQLite/D1 (no mode support)
            whereConditions[column] = {
              contains: value
            };
          }
        } else if (column === 'role') {
          whereConditions.role = value;
        } else if (column === 'createdAt') {
          // Handle date filtering
          const date = new Date(value as string);
          if (!isNaN(date.getTime())) {
            const nextDay = new Date(date);
            nextDay.setDate(date.getDate() + 1);
            whereConditions.createdAt = {
              gte: date,
              lt: nextDay
            };
          }
        }
      }
    });

    // Build orderBy clause
    let orderBy: any = { createdAt: 'desc' }; // default
    if (sort) {
      const sortDirection = direction === 'desc' ? 'desc' : 'asc';
      if (sort === 'createdAt') {
        orderBy = { createdAt: sortDirection };
      } else if (sort === 'updatedAt') {
        orderBy = { updatedAt: sortDirection };
      } else if (['email', 'name', 'role'].includes(sort)) {
        orderBy = { [sort]: sortDirection };
      }
    }

    // Get users with pagination
    const [users, totalCount] = await Promise.all([
      database.user.findMany({
        where: whereConditions,
        orderBy,
        skip: offset,
        take: limitNum,
        select: {
          id: true,
          email: true,
          name: true,
          picture: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        }
      }),
      database.user.count({ where: whereConditions })
    ]);

    // Format response
    const pagination = buildPaginationInfo(pageNum, limitNum, totalCount);
    const response = {
      data: users.map(user => ({
        ...user,
        createdAt: formatApiDate(user.createdAt),
        updatedAt: formatApiDate(user.updatedAt),
      })),
      pagination
    };

    return c.json(response);
  } catch (error) {
    console.error('Error fetching users:', error);
    return c.json({ error: 'Failed to fetch users' }, 500);
  }
});

export default app;
