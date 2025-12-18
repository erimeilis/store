import { Hono } from 'hono';
import type { Bindings } from '@/types/bindings.js';

// Import individual route handlers
import postUpload from './post.js';

/**
 * File Upload Routes
 * Handles CSV/Excel file uploads with processing and bulk data insertion
 * Includes R2 storage integration and data validation
 */
const app = new Hono<{ Bindings: Bindings }>();

// Mount routes
app.route('/', postUpload);

export default app;
