import { Hono } from 'hono';
import { adminWriteAuthMiddleware } from '@/middleware/auth.js';
import { TableService } from '@/services/tableService/index.js';
import { parseGoogleSheets } from '@/services/fileParserService/index.js';
import { generateColumnMappings } from './_shared.js';
import type { Bindings } from '@/types/bindings.js';
import type { UserContext } from '@/types/database.js';

const app = new Hono<{
  Bindings: Bindings;
  Variables: { user: UserContext };
}>();

/**
 * Parse data from a public Google Sheets URL
 * POST /api/tables/:id/parse-google-sheets
 */
app.post('/:id/parse-google-sheets', adminWriteAuthMiddleware, async (c) => {
  try {
    const tableId = c.req.param('id');

    // Get the Google Sheets URL from request body
    const body = await c.req.json() as { url?: string };
    const url = body.url;

    if (!url) {
      return c.json({
        error: 'No URL provided',
        message: 'Please provide a Google Sheets URL'
      }, 400);
    }

    // Validate URL format
    if (!url.includes('docs.google.com') && !url.includes('spreadsheets')) {
      return c.json({
        error: 'Invalid URL',
        message: 'Please provide a valid Google Sheets URL'
      }, 400);
    }

    // Parse the Google Sheets data
    const sheetsParseResult = await parseGoogleSheets(url);

    // Get table columns for intelligent column mapping
    const service = new TableService(c.env);
    const user = c.get('user');
    const tableColumns = await service.getTableColumns(c, user, tableId);

    const parsedData = {
      headers: sheetsParseResult.headers,
      rows: sheetsParseResult.rows,
      hasHeaders: sheetsParseResult.hasHeaders,
      fileType: sheetsParseResult.fileType,
      fileName: sheetsParseResult.fileName,
      skipRows: sheetsParseResult.skipRows,
      detectedColumnMappings: generateColumnMappings(sheetsParseResult.headers, tableColumns.response?.data || [])
    };

    return c.json({ data: parsedData, message: 'Google Sheets data loaded successfully' });

  } catch (error) {
    console.error('Error parsing Google Sheets:', error);

    // Check if it's an access/permissions error (should be 400, not 500)
    const errorMessage = error instanceof Error ? error.message : 'Failed to load Google Sheets data.';
    const isAccessError = errorMessage.includes('Unable to access') ||
                         errorMessage.includes('401') ||
                         errorMessage.includes('403') ||
                         errorMessage.includes('publicly accessible');

    return c.json({
      error: 'Parse failed',
      message: errorMessage
    }, isAccessError ? 400 : 500);
  }
});

export default app;
