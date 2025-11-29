import { Hono } from 'hono';
import { getPrismaClient } from '@/lib/database.js';
import { adminWriteAuthMiddleware } from '@/middleware/auth.js';
import { formatApiDate } from '@/lib/date-utils.js';
import { buildPaginationInfo } from '@/utils/common.js';

const app = new Hono();

/**
 * Get all allowed emails with pagination, filtering, and sorting
 * GET /api/allowed-emails
 */
app.get('/', adminWriteAuthMiddleware, async (c) => {
  try {
    const database = getPrismaClient(c.env);
    const { page = '1', limit = '10', sort, direction = 'asc', ...filters } = c.req.query();

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Build where clause from filters
    const whereConditions: any = {};

    // Handle column filters (filter_email, filter_domain, etc.)
    Object.entries(filters).forEach(([key, value]) => {
      if (key.startsWith('filter_') && value) {
        const column = key.replace('filter_', '');
        if (column === 'email' && value) {
          whereConditions.email = {
            contains: value
          };
        } else if (column === 'domain' && value) {
          whereConditions.domain = {
            contains: value
          };
        } else if (column === 'type' && value) {
          whereConditions.type = value;
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
      } else if (['email', 'domain', 'type'].includes(sort)) {
        orderBy = { [sort]: sortDirection };
      }
    }

    // Get allowed emails with pagination
    const [allowedEmails, totalCount] = await Promise.all([
      database.allowedEmail.findMany({
        where: whereConditions,
        orderBy,
        skip: offset,
        take: limitNum,
        select: {
          id: true,
          email: true,
          domain: true,
          type: true,
          createdAt: true,
        }
      }),
      database.allowedEmail.count({ where: whereConditions })
    ]);

    // Format response
    const pagination = buildPaginationInfo(pageNum, limitNum, totalCount);
    const response = {
      data: allowedEmails.map(allowedEmail => ({
        ...allowedEmail,
        createdAt: formatApiDate(allowedEmail.createdAt),
      })),
      pagination
    };

    return c.json(response);
  } catch (error) {
    console.error('Error fetching allowed emails:', error);
    return c.json({ error: 'Failed to fetch allowed emails' }, 500);
  }
});

export default app;
