import type { ParsedData, ParseOptions } from '@/types/file-parser.js'

/**
 * Parse CSV or TXT files with delimiter detection
 */
export function parseCsvOrTxt(
  content: string,
  fileName: string,
  fileType: string,
  options: ParseOptions = {}
): ParsedData {
  // Detect delimiter
  const delimiter = detectDelimiter(content)

  // Split into lines
  const allLines = content.split(/\r?\n/).filter(line => line.trim())

  if (allLines.length === 0) {
    throw new Error('File appears to be empty')
  }

  // Apply row skipping if specified
  const skipRows = options.skipRows || 0
  const lines = skipRows > 0 ? allLines.slice(skipRows) : allLines

  if (lines.length === 0) {
    throw new Error(`No data found after skipping ${skipRows} rows`)
  }

  // Parse first line (after skipping) to determine if it contains headers
  const firstLine = parseCSVLine(lines[0]!, delimiter)
  const hasHeaders = detectHeaders(lines, delimiter)

  let headers: string[]
  let dataStartIndex: number

  if (hasHeaders) {
    headers = firstLine.map((header, index) =>
      header?.toString().trim() || `Column ${index + 1}`
    )
    dataStartIndex = 1
  } else {
    headers = firstLine.map((_, index) => `Column ${index + 1}`)
    dataStartIndex = 0
  }

  // Parse all data rows
  const rows = lines
    .slice(dataStartIndex)
    .map(line => parseCSVLine(line, delimiter))
    .filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ''))
    .map(row => {
      // Ensure row has same number of columns as headers
      const normalizedRow = [...row]
      while (normalizedRow.length < headers.length) {
        normalizedRow.push(null)
      }
      return normalizedRow.slice(0, headers.length)
    })

  if (rows.length === 0) {
    throw new Error('No data rows found in file')
  }

  return {
    headers,
    rows,
    hasHeaders,
    fileType,
    fileName,
    skipRows
  }
}

/**
 * Detect delimiter in CSV content
 */
function detectDelimiter(content: string): string {
  const sample = content.split('\n').slice(0, 5).join('\n')

  const delimiters = [',', '\t', ';', '|']
  const counts = delimiters.map(delimiter => {
    // Escape special regex characters like pipe |
    const escapedDelimiter = delimiter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return {
      delimiter,
      count: (sample.match(new RegExp(escapedDelimiter, 'g')) || []).length
    }
  })

  // Sort by count and return the most common delimiter
  counts.sort((a, b) => b.count - a.count)

  console.log('🔍 CSV Delimiter Detection:', {
    sample: sample.substring(0, 200),
    counts,
    selectedDelimiter: counts[0]!.count > 0 ? counts[0]!.delimiter : ','
  })

  return counts[0]!.count > 0 ? counts[0]!.delimiter : ','
}

/**
 * Detect if first line contains headers in CSV data
 */
function detectHeaders(lines: string[], delimiter: string): boolean {
  if (lines.length < 2) return false

  const firstLine = parseCSVLine(lines[0]!, delimiter)
  const secondLine = parseCSVLine(lines[1]!, delimiter)

  // Check if first line looks more like headers than data
  const firstLineNumeric = firstLine.filter(cell =>
    cell !== null && cell !== undefined && !isNaN(Number(cell))
  ).length

  const secondLineNumeric = secondLine.filter(cell =>
    cell !== null && cell !== undefined && !isNaN(Number(cell))
  ).length

  // If first line has fewer numeric values than second line, it's likely headers
  return firstLineNumeric < secondLineNumeric
}

/**
 * Parse a single CSV line with proper quote handling
 */
function parseCSVLine(line: string, delimiter: string): any[] {
  const result: any[] = []
  let current = ''
  let inQuotes = false
  let i = 0

  while (i < line.length) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"'
        i += 2
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
        i++
      }
    } else if (char === delimiter && !inQuotes) {
      // End of field
      result.push(parseValue(current.trim()))
      current = ''
      i++
    } else {
      current += char
      i++
    }
  }

  // Add the last field
  result.push(parseValue(current.trim()))

  return result
}

/**
 * Parse CSV cell value with type detection
 */
function parseValue(value: string): any {
  if (value === '' || value === 'NULL' || value === 'null') {
    return null
  }

  // Remove surrounding quotes if present
  if ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1)
  }

  // Try to parse as number
  const numValue = Number(value)
  if (!isNaN(numValue) && isFinite(numValue)) {
    return numValue
  }

  // Try to parse as boolean
  const lowerValue = value.toLowerCase()
  if (lowerValue === 'true' || lowerValue === 'yes' || lowerValue === '1') {
    return true
  }
  if (lowerValue === 'false' || lowerValue === 'no' || lowerValue === '0') {
    return false
  }

  // Try to parse as date (basic ISO format)
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    const date = new Date(value)
    if (!isNaN(date.getTime())) {
      return value // Keep as string for now
    }
  }

  // Return as string
  return value
}