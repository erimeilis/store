import { Hono } from 'hono';
import type { Bindings } from '@/types/bindings.js';
import type { UserContext } from '@/types/database.js';

// Import individual route handlers
import getMyTables from './get.js';

/**
 * My Tables Route
 * Returns the list of tables accessible to the current token
 * This endpoint allows API consumers to discover which tables they can access
 */
const app = new Hono<{
  Bindings: Bindings;
  Variables: { user: UserContext };
}>();

// Mount routes
app.route('/', getMyTables);

export default app;
