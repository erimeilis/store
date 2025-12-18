import { Hono } from 'hono';
import { adminWriteAuthMiddleware } from '@/middleware/auth.js';
import { TableService } from '@/services/tableService/index.js';
import { parseImportFile } from '@/services/fileParserService/index.js';
import { generateColumnMappings } from './_shared.js';
import type { Bindings } from '@/types/bindings.js';
import type { UserContext } from '@/types/database.js';

const app = new Hono<{
  Bindings: Bindings;
  Variables: { user: UserContext };
}>();

/**
 * Parse uploaded file for import preview
 * POST /api/tables/:id/parse-import-file
 */
app.post('/:id/parse-import-file', adminWriteAuthMiddleware, async (c) => {
  try {
    const tableId = c.req.param('id');

    // Get the uploaded file and optional parameters
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const skipRowsParam = formData.get('skipRows') as string | null;

    if (!file) {
      return c.json({
        error: 'No file provided',
        message: 'Please select a file to upload'
      }, 400);
    }

    // Parse skipRows parameter
    const skipRows = skipRowsParam ? parseInt(skipRowsParam, 10) : 0;
    if (isNaN(skipRows) || skipRows < 0) {
      return c.json({
        error: 'Invalid skipRows parameter',
        message: 'skipRows must be a non-negative integer'
      }, 400);
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return c.json({
        error: 'File too large',
        message: 'File size must be less than 10MB'
      }, 400);
    }

    // Validate file type
    const allowedTypes = ['text/plain', 'text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    const allowedExtensions = ['.txt', '.csv', '.xls', '.xlsx'];

    const hasValidType = allowedTypes.includes(file.type) ||
                       allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!hasValidType) {
      return c.json({
        error: 'Invalid file type',
        message: 'Only TXT, CSV, XLS, and XLSX files are supported'
      }, 400);
    }

    // Parse the file using our comprehensive file parser service
    const fileParseResult = await parseImportFile(file, { skipRows });

    // Get table columns for intelligent column mapping
    const service = new TableService(c.env);
    const user = c.get('user');
    const tableColumns = await service.getTableColumns(c, user, tableId);

    const parsedData = {
      headers: fileParseResult.headers,
      rows: fileParseResult.rows,
      hasHeaders: fileParseResult.hasHeaders,
      fileType: fileParseResult.fileType,
      fileName: fileParseResult.fileName,
      skipRows: fileParseResult.skipRows,
      detectedColumnMappings: generateColumnMappings(fileParseResult.headers, tableColumns.response?.data || [])
    };

    return c.json({ data: parsedData, message: 'File parsed successfully' });

  } catch (error) {
    console.error('Error parsing import file:', error);
    return c.json({
      error: 'Parse failed',
      message: error instanceof Error ? error.message : 'Failed to parse the uploaded file'
    }, 500);
  }
});

export default app;
