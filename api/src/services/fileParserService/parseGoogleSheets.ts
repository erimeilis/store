/**
 * Google Sheets Parser Service
 * Handles parsing data from public Google Sheets
 * Supports direct URLs and extracts spreadsheet ID automatically
 */

import type { ParsedData } from '@/types/file-parser.js'

/**
 * Extract spreadsheet ID and optional sheet name from Google Sheets URL
 * Supports various URL formats:
 * - https://docs.google.com/spreadsheets/d/{ID}/edit
 * - https://docs.google.com/spreadsheets/d/{ID}/edit#gid={GID}
 * - https://docs.google.com/spreadsheets/d/{ID}/edit?usp=sharing
 */
export function extractSpreadsheetInfo(url: string): { spreadsheetId: string; sheetName?: string } | null {
  try {
    // Pattern to match Google Sheets URLs
    const patterns = [
      // Standard edit URL
      /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
      // Alternative formats
      /spreadsheets\/d\/([a-zA-Z0-9-_]+)/
    ]

    let spreadsheetId: string | null = null

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        spreadsheetId = match[1]
        break
      }
    }

    if (!spreadsheetId) {
      return null
    }

    // Try to extract sheet name from gid parameter
    const gidMatch = url.match(/[#&]gid=(\d+)/)
    let sheetName: string | undefined

    if (gidMatch && gidMatch[1]) {
      // Note: We can't directly convert gid to sheet name without API access
      // We'll use the default first sheet or let user specify range
      sheetName = undefined
    }

    // Conditionally include sheetName only if defined (for exactOptionalPropertyTypes)
    return sheetName !== undefined
      ? { spreadsheetId, sheetName }
      : { spreadsheetId }
  } catch (error) {
    console.error('Error extracting spreadsheet info:', error)
    return null
  }
}

/**
 * Fetch data from Google Sheets using multiple fallback strategies
 * Tries different endpoints to handle various sharing configurations
 */
export async function fetchGoogleSheetsData(
  spreadsheetId: string,
  range: string = 'A:Z'
): Promise<string[][]> {
  const errors: string[] = []

  // Strategy 1: Try the standard CSV export endpoint
  // Works for sheets that are "Published to the web" (File → Share → Publish to web)
  try {
    const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`
    const response = await fetch(csvUrl)

    if (response.ok) {
      const csvText = await response.text()
      const rows = parseCSV(csvText)
      if (rows.length > 0) {
        return rows
      }
    }
    errors.push(`CSV export endpoint returned ${response.status}: ${response.statusText}`)
  } catch (error) {
    errors.push(`CSV export failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  // Strategy 2: Try the Google Visualization API (gviz) endpoint
  // This endpoint is more lenient and often works with "Anyone with the link" sharing
  try {
    const gvizUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv`
    const response = await fetch(gvizUrl)

    if (response.ok) {
      const csvText = await response.text()
      const rows = parseCSV(csvText)
      if (rows.length > 0) {
        return rows
      }
    }
    errors.push(`gviz endpoint returned ${response.status}: ${response.statusText}`)
  } catch (error) {
    errors.push(`gviz fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  // Strategy 3: Try the published CSV endpoint with /pub path
  // Works for sheets explicitly published to the web
  try {
    const pubUrl = `https://docs.google.com/spreadsheets/d/e/${spreadsheetId}/pub?output=csv`
    const response = await fetch(pubUrl)

    if (response.ok) {
      const csvText = await response.text()
      const rows = parseCSV(csvText)
      if (rows.length > 0) {
        return rows
      }
    }
    errors.push(`Published endpoint returned ${response.status}: ${response.statusText}`)
  } catch (error) {
    errors.push(`Published fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  // All strategies failed - provide helpful error message
  throw new Error(
    `Unable to access Google Sheet. Please ensure your sheet is publicly accessible:\n\n` +
    `1. Open your Google Sheet\n` +
    `2. Click "Share" → "Anyone with the link"\n` +
    `3. Set permission to "Viewer"\n` +
    `4. OR use File → Share → Publish to web → CSV\n\n` +
    `Attempted strategies:\n${errors.join('\n')}`
  )
}

/**
 * Simple CSV parser that handles quoted fields and commas
 */
function parseCSV(csv: string): string[][] {
  const rows: string[][] = []
  const lines = csv.split(/\r?\n/)

  for (const line of lines) {
    if (!line.trim()) continue

    const row: string[] = []
    let currentField = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      const nextChar = line[i + 1]

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          currentField += '"'
          i++ // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        // Field separator
        row.push(currentField)
        currentField = ''
      } else {
        currentField += char
      }
    }

    // Add last field
    row.push(currentField)
    rows.push(row)
  }

  return rows
}

/**
 * Parse Google Sheets data into the standard ParsedData format
 * Compatible with the existing import system
 */
export async function parseGoogleSheets(
  urlOrId: string,
  range?: string
): Promise<ParsedData> {
  try {
    let spreadsheetId: string

    // Check if input is a URL or direct ID
    if (urlOrId.includes('docs.google.com') || urlOrId.includes('spreadsheets')) {
      const info = extractSpreadsheetInfo(urlOrId)
      if (!info) {
        throw new Error('Invalid Google Sheets URL. Please provide a valid Google Sheets link.')
      }
      spreadsheetId = info.spreadsheetId
    } else {
      // Assume it's a direct spreadsheet ID
      spreadsheetId = urlOrId
    }

    // Fetch the data
    const rows = await fetchGoogleSheetsData(spreadsheetId, range)

    if (rows.length === 0) {
      throw new Error('No data found in the Google Sheet')
    }

    // Assume first row is headers
    const firstRow = rows[0]
    if (!firstRow) {
      throw new Error('First row is empty in the Google Sheet')
    }
    const headers = firstRow.map(cell => String(cell || '').trim())
    const dataRows = rows.slice(1).filter(row => row.some(cell => cell && cell.trim()))

    return {
      headers,
      rows: dataRows,
      hasHeaders: true,
      fileType: 'google_sheets',
      fileName: `Google Sheet (${spreadsheetId})`,
      skipRows: 0
    }
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Failed to parse Google Sheets data'
    )
  }
}
