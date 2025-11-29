import { Hono } from 'hono';
import { adminWriteAuthMiddleware } from '@/middleware/auth.js';
import { parseGoogleSheetsData } from '@/utils/sheets-parser.js';
import { bulkInsertItems } from '@/utils/database.js';
import type { Bindings } from '@/types/bindings.js';
import type { GoogleSheetsResponse } from '@/types/google-sheets.js';

const app = new Hono<{ Bindings: Bindings }>();

/**
 * Import data from Google Sheets
 * POST /api/import/sheets
 */
app.post('/sheets', adminWriteAuthMiddleware, async (c) => {
  try {
    const body = await c.req.json();

    // Validate required fields
    if (!body.spreadsheetId || typeof body.spreadsheetId !== 'string') {
      return c.json({
        error: 'Validation failed',
        message: 'spreadsheetId is required and must be a string'
      }, 400);
    }

    if (!body.range || typeof body.range !== 'string') {
      return c.json({
        error: 'Validation failed',
        message: 'range is required and must be a string (e.g., "Sheet1!A1:C10")'
      }, 400);
    }

    // Get Google API key from environment
    const apiKey = c.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return c.json({
        error: 'Configuration error',
        message: 'Google Sheets API key not configured'
      }, 500);
    }

    // Construct Google Sheets API URL
    const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(body.spreadsheetId)}/values/${encodeURIComponent(body.range)}?key=${encodeURIComponent(apiKey)}`;

    // Fetch data from Google Sheets API
    const response = await fetch(apiUrl);

    if (!response.ok) {
      const errorData = await response.text();
      return c.json({
        error: 'Google Sheets API error',
        message: `Failed to fetch data from Google Sheets: ${response.status} ${response.statusText}`,
        details: errorData
      }, response.status === 404 ? 404 : 500);
    }

    const sheetsData = await response.json() as GoogleSheetsResponse;

    if (!sheetsData.values || !Array.isArray(sheetsData.values)) {
      return c.json({
        error: 'No data found',
        message: 'The specified range contains no data or is invalid'
      }, 400);
    }

    // Parse Google Sheets data
    const parsedData = parseGoogleSheetsData(sheetsData.values);

    if (parsedData.length === 0) {
      return c.json({
        error: 'No valid data found',
        message: 'The Google Sheets data contains no valid rows with required fields'
      }, 400);
    }

    // Bulk insert data into D1 database
    const insertedCount = await bulkInsertItems(c.env.DB, parsedData);

    return c.json({
      message: 'Google Sheets data imported successfully',
      spreadsheetId: body.spreadsheetId,
      range: body.range,
      totalRows: parsedData.length,
      insertedRows: insertedCount
    }, 201);

  } catch (error) {
    if (error instanceof SyntaxError) {
      return c.json({
        error: 'Invalid JSON',
        message: 'Request body must be valid JSON'
      }, 400);
    }

    return c.json({
      error: 'Import failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, 500);
  }
});

export default app;
