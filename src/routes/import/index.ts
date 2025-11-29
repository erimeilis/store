import { Hono } from 'hono';
import type { Bindings } from '@/types/bindings.js';

// Import individual route handlers
import postSheets from './post.sheets.js';

/**
 * Data Import Routes
 * Handles importing data from external sources like Google Sheets
 * Includes API integration, data validation, and bulk processing
 */
const app = new Hono<{ Bindings: Bindings }>();

// Mount routes
app.route('/', postSheets);

export default app;
