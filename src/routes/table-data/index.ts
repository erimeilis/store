import { Hono } from 'hono';
import type { Bindings } from '@/types/bindings.js';
import type { UserContext } from '@/types/database.js';

// Import individual route handlers
import listData from './get.js';
import createData from './post.js';
import getCountryIssues from './get.country-issues.js';
import fixCountries from './post.fix-countries.js';
import massAction from './post.mass-action.js';
import getDataRow from './get.rowId.js';
import updateDataRow from './put.rowId.js';
import patchDataRow from './patch.rowId.js';
import deleteDataRow from './delete.rowId.js';

/**
 * Table Data CRUD Routes
 * Handles operations for data within user-created dynamic tables
 * All routes are protected with appropriate authentication middleware
 * Includes data validation based on column definitions
 *
 * Note: This router is mounted at /api/tables/:tableId/data
 */
const app = new Hono<{
  Bindings: Bindings;
  Variables: { user: UserContext };
}>();

// Mount routes - order matters for path matching
// Static paths MUST come before dynamic :rowId routes
app.route('/', getCountryIssues);  // /country-issues (before /:rowId)
app.route('/', fixCountries);      // /fix-countries (before /:rowId)
app.route('/', massAction);        // /mass-action (before /:rowId)
app.route('/', listData);          // GET /
app.route('/', createData);        // POST /
app.route('/', getDataRow);        // GET /:rowId
app.route('/', updateDataRow);     // PUT /:rowId
app.route('/', patchDataRow);      // PATCH /:rowId
app.route('/', deleteDataRow);     // DELETE /:rowId

export default app;
