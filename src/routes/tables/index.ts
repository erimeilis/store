import { Hono } from 'hono';
import type { Bindings } from '@/types/bindings.js';
import type { UserContext } from '@/types/database.js';

// Import individual route handlers
import listTables from './get.js';
import createTable from './post.js';
import massAction from './post.mass-action.js';
import cloneTable from './post.clone.js';
import getTable from './get.id.js';
import updateTable from './put.id.js';
import patchTable from './patch.id.js';
import deleteTable from './delete.id.js';

// Column routes
import getColumns from './get.id.columns.js';
import getColumn from './get.id.columns.columnId.js';
import addColumn from './post.id.columns.js';
import updateColumn from './patch.id.columns.columnId.js';
import deleteColumn from './delete.id.columns.columnId.js';
import columnMassAction from './post.id.columns.mass-action.js';
import recountPositions from './post.id.columns.recount.js';
import swapPositions from './post.id.columns.swap.js';
import fixColumnNames from './post.id.columns.fix-names.js';

// Import routes
import parseImportFile from './post.id.parse-import-file.js';
import parseGoogleSheets from './post.id.parse-google-sheets.js';
import importData from './post.id.import-data.js';

/**
 * Table Management CRUD Routes
 * Handles operations for user-created dynamic tables: Create, Read, Update, Delete
 * All routes are protected with appropriate authentication middleware
 * Uses raw SQL queries since tables are not in Prisma schema
 */
const app = new Hono<{
  Bindings: Bindings;
  Variables: { user: UserContext };
}>();

// Mount routes - order matters for path matching
// Static paths MUST come before dynamic :id routes

// Table-level static routes (before /:id)
app.route('/', massAction);           // POST /mass-action
app.route('/', cloneTable);           // POST /clone
app.route('/', listTables);           // GET /
app.route('/', createTable);          // POST /

// Column operation routes (before /:id single table routes)
// These are /:id/columns/* paths which are more specific than /:id
app.route('/', columnMassAction);     // POST /:id/columns/mass-action
app.route('/', recountPositions);     // POST /:id/columns/recount
app.route('/', swapPositions);        // POST /:id/columns/swap
app.route('/', fixColumnNames);       // POST /:id/columns/fix-names
app.route('/', getColumn);            // GET /:id/columns/:columnId
app.route('/', updateColumn);         // PATCH /:id/columns/:columnId
app.route('/', deleteColumn);         // DELETE /:id/columns/:columnId
app.route('/', getColumns);           // GET /:id/columns
app.route('/', addColumn);            // POST /:id/columns

// Import routes (before /:id single table routes)
app.route('/', parseImportFile);      // POST /:id/parse-import-file
app.route('/', parseGoogleSheets);    // POST /:id/parse-google-sheets
app.route('/', importData);           // POST /:id/import-data

// Single table routes (must be last - /:id is catch-all)
app.route('/', getTable);             // GET /:id
app.route('/', updateTable);          // PUT /:id
app.route('/', patchTable);           // PATCH /:id
app.route('/', deleteTable);          // DELETE /:id

export default app;
