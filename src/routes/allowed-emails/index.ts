import { Hono } from 'hono';

// Import individual route handlers
import getAllowedEmails from './get.js';
import getAllowedEmailById from './get.id.js';
import createAllowedEmail from './post.js';
import updateAllowedEmail from './put.id.js';
import patchAllowedEmail from './patch.id.js';
import deleteAllowedEmail from './delete.id.js';
import massAction from './post.mass-action.js';
import validateEmail from './post.validate.js';

/**
 * Allowed Emails Routes
 * CRUD operations for email/domain allowlist management
 */
const app = new Hono();

// Mount routes - order matters for path matching
app.route('/', massAction);         // /mass-action before /:id
app.route('/', validateEmail);      // /validate before /:id
app.route('/', getAllowedEmails);   // GET /
app.route('/', createAllowedEmail); // POST /
app.route('/', getAllowedEmailById);// GET /:id
app.route('/', updateAllowedEmail); // PUT /:id
app.route('/', patchAllowedEmail);  // PATCH /:id
app.route('/', deleteAllowedEmail); // DELETE /:id

export default app;
