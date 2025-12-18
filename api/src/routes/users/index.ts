import { Hono } from 'hono';

// Import individual route handlers
import getUsers from './get.js';
import getUserById from './get.id.js';
import createUser from './post.js';
import updateUser from './put.id.js';
import patchUser from './patch.id.js';
import deleteUser from './delete.id.js';
import massAction from './post.mass-action.js';

/**
 * Users Routes
 */
const app = new Hono();

// Mount routes - order matters for path matching
app.route('/', massAction);    // /mass-action before /:id
app.route('/', getUsers);      // GET /
app.route('/', createUser);    // POST /
app.route('/', getUserById);   // GET /:id
app.route('/', updateUser);    // PUT /:id
app.route('/', patchUser);     // PATCH /:id
app.route('/', deleteUser);    // DELETE /:id

export default app;
