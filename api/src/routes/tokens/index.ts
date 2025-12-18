import { Hono } from 'hono';

// Import individual route handlers
import getAll from './get.js';
import getById from './get.id.js';
import getPostman from './get.id.postman.js';
import create from './post.js';
import update from './put.id.js';
import patch from './patch.id.js';
import remove from './delete.id.js';
import massAction from './post.mass-action.js';

/**
 * Token routes composition
 * Combines all token-related routes into a single router
 */
const app = new Hono();

// Mount routes - order matters for path matching
// Mass action must come before :id routes
app.route('/', massAction);

// Collection routes
app.route('/', getAll);
app.route('/', create);

// Resource routes with :id
app.route('/', getPostman);  // /:id/postman - must be before /:id
app.route('/', getById);
app.route('/', update);
app.route('/', patch);
app.route('/', remove);

export default app;
