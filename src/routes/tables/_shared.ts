/**
 * Shared utilities for table routes
 */

/**
 * Intelligent header detection by comparing first row with table columns
 * Uses multiple comparison strategies as suggested by user
 */
export function detectHeaders(potentialHeaders: string[], tableColumns: any[]): boolean {
  if (!potentialHeaders.length || !tableColumns.length) return false;

  // Extract column names from table columns
  const columnNames = tableColumns.map(col => col.name || col);

  let matchCount = 0;

  for (const header of potentialHeaders) {
    const normalizedHeader = String(header).trim();

    for (const columnName of columnNames) {
      const normalizedColumn = String(columnName).trim();

      // Strategy 1: Both lowercase
      if (normalizedHeader.toLowerCase() === normalizedColumn.toLowerCase()) {
        matchCount++;
        break;
      }

      // Strategy 2: Both lowercase without spaces
      const headerNoSpaces = normalizedHeader.toLowerCase().replace(/\s+/g, '');
      const columnNoSpaces = normalizedColumn.toLowerCase().replace(/\s+/g, '');
      if (headerNoSpaces === columnNoSpaces) {
        matchCount++;
        break;
      }

      // Strategy 3: Both lowercase with only letters
      const headerLettersOnly = normalizedHeader.toLowerCase().replace(/[^a-z]/g, '');
      const columnLettersOnly = normalizedColumn.toLowerCase().replace(/[^a-z]/g, '');
      if (headerLettersOnly === columnLettersOnly && headerLettersOnly.length > 0) {
        matchCount++;
        break;
      }
    }
  }

  // Consider it has headers if at least one column matches
  return matchCount > 0;
}

/**
 * Generate column mappings when headers match table columns
 */
export function generateColumnMappings(headers: string[], tableColumns: any[]): Array<{sourceColumn: string, targetColumn: string}> {
  const mappings: Array<{sourceColumn: string, targetColumn: string}> = [];
  const columnNames = tableColumns.map(col => col.name || col);

  for (const header of headers) {
    const normalizedHeader = String(header).trim();
    let bestMatch: string | null = null;

    for (const columnName of columnNames) {
      const normalizedColumn = String(columnName).trim();

      // Strategy 1: Both lowercase
      if (normalizedHeader.toLowerCase() === normalizedColumn.toLowerCase()) {
        bestMatch = columnName;
        break;
      }

      // Strategy 2: Both lowercase without spaces
      const headerNoSpaces = normalizedHeader.toLowerCase().replace(/\s+/g, '');
      const columnNoSpaces = normalizedColumn.toLowerCase().replace(/\s+/g, '');
      if (headerNoSpaces === columnNoSpaces) {
        bestMatch = columnName;
        break;
      }

      // Strategy 3: Both lowercase with only letters
      const headerLettersOnly = normalizedHeader.toLowerCase().replace(/[^a-z]/g, '');
      const columnLettersOnly = normalizedColumn.toLowerCase().replace(/[^a-z]/g, '');
      if (headerLettersOnly === columnLettersOnly && headerLettersOnly.length > 0) {
        bestMatch = columnName;
        break;
      }
    }

    if (bestMatch) {
      mappings.push({
        sourceColumn: header,
        targetColumn: bestMatch
      });
    }
  }

  return mappings;
}
