import { Hono } from 'hono';
import { getPrismaClient } from '@/lib/database.js';
import { adminWriteAuthMiddleware } from '@/middleware/auth.js';
import { formatApiDate } from '@/lib/date-utils.js';
import { buildPaginationInfo } from '@/utils/common.js';

const app = new Hono();

/**
 * Get all tokens with pagination, filtering, and sorting
 * GET /api/tokens
 */
app.get('/', adminWriteAuthMiddleware, async (c) => {
  try {
    const database = getPrismaClient(c.env);
    const user = c.get('user');
    const { page = '1', limit = '10', sort, direction = 'asc', ...filters } = c.req.query();

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Build where clause from filters
    const whereConditions: any = {};

    // Non-admin users can only see their own tokens
    if (!user.permissions.includes('admin')) {
      whereConditions.id = {
        notIn: ['admin-token', 'frontend-token'] // Exclude system tokens for non-admins
      };
    }

    // Handle column filters (filter_name, filter_permissions, etc.)
    Object.entries(filters).forEach(([key, value]) => {
      if (key.startsWith('filter_') && value) {
        const column = key.replace('filter_', '');
        if (column === 'name') {
          whereConditions[column] = {
            contains: value
          };
        } else if (column === 'permissions') {
          whereConditions.permissions = {
            contains: value
          };
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
        } else if (column === 'expiresAt') {
          // Handle expiry date filtering
          const date = new Date(value as string);
          if (!isNaN(date.getTime())) {
            const nextDay = new Date(date);
            nextDay.setDate(date.getDate() + 1);
            whereConditions.expiresAt = {
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
      } else if (sort === 'expiresAt') {
        orderBy = { expiresAt: sortDirection };
      } else if (['name', 'permissions'].includes(sort)) {
        orderBy = { [sort]: sortDirection };
      }
    }

    // Get tokens with pagination
    const [tokens, totalCount] = await Promise.all([
      database.token.findMany({
        where: whereConditions,
        orderBy,
        skip: offset,
        take: limitNum,
        select: {
          id: true,
          token: true,
          name: true,
          permissions: true,
          isAdmin: true,
          allowedIps: true,
          allowedDomains: true,
          tableAccess: true,
          expiresAt: true,
          createdAt: true,
          updatedAt: true,
        }
      }),
      database.token.count({ where: whereConditions })
    ]);

    // Format response
    const pagination = buildPaginationInfo(pageNum, limitNum, totalCount);
    const response = {
      data: tokens.map(token => ({
        ...token,
        is_admin: token.isAdmin,
        allowed_ips: token.allowedIps,
        allowed_domains: token.allowedDomains,
        expires_at: token.expiresAt ? formatApiDate(token.expiresAt) : null,
        createdAt: formatApiDate(token.createdAt),
        updatedAt: formatApiDate(token.updatedAt),
      })),
      pagination
    };

    return c.json(response);
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return c.json({ error: 'Failed to fetch tokens' }, 500);
  }
});

export default app;
