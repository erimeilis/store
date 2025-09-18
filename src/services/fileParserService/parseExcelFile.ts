import type { ParsedData, ParseOptions } from '@/types/file-parser.js'

/**
 * Parse Excel files (XLS/XLSX) using SheetJS
 */
export async function parseExcelFile(
  file: globalThis.File,
  fileName: string,
  fileType: string,
  options: ParseOptions = {}
): Promise<ParsedData> {
  try {
    // Use dynamic import for Cloudflare Workers compatibility
    const XLSX = await import('xlsx')

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()

    // Parse the Excel file
    const workbook = XLSX.read(arrayBuffer, { type: 'array', dense: true })

    // Get the first worksheet
    const firstSheetName = workbook.SheetNames[0]
    if (!firstSheetName) {
      throw new Error('No worksheets found in the Excel file')
    }

    const worksheet = workbook.Sheets[firstSheetName]
    if (!worksheet) {
      throw new Error('Could not read the first worksheet')
    }

    // Convert to array of arrays (dense format)
    const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: null,
      raw: false // Convert values to strings for consistent handling
    })

    if (rawData.length === 0) {
      throw new Error('No data found in the Excel file')
    }

    // Apply row skipping if specified
    const skipRows = options.skipRows || 0
    const workingData = skipRows > 0 ? rawData.slice(skipRows) : rawData

    if (workingData.length === 0) {
      throw new Error(`No data found after skipping ${skipRows} rows`)
    }

    // Detect if first row (after skipping) contains headers
    const hasHeaders = detectExcelHeaders(workingData)

    let headers: string[]
    let dataRows: any[][]

    if (hasHeaders && workingData.length > 1) {
      headers = workingData[0]!.map((header, index) =>
        header?.toString().trim() || `Column ${index + 1}`
      )
      dataRows = workingData.slice(1)
    } else {
      // Use the first row to determine number of columns
      const maxCols = Math.max(...workingData.map(row => row.length))
      headers = Array.from({ length: maxCols }, (_, index) => `Column ${index + 1}`)
      dataRows = workingData
    }

    // Filter out completely empty rows and normalize row lengths
    const rows = dataRows
      .filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ''))
      .map(row => {
        const normalizedRow = [...row]
        // Pad with nulls to match header length
        while (normalizedRow.length < headers.length) {
          normalizedRow.push(null)
        }
        // Trim to header length
        return normalizedRow.slice(0, headers.length).map(cell => parseExcelValue(cell))
      })

    if (rows.length === 0) {
      throw new Error('No data rows found in the Excel file')
    }

    return {
      headers,
      rows,
      hasHeaders,
      fileType,
      fileName,
      skipRows
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to parse Excel file: ${error.message}`)
    }
    throw new Error('Failed to parse Excel file: Unknown error')
  }
}

/**
 * Detect if first row contains headers in Excel data
 */
function detectExcelHeaders(data: any[][]): boolean {
  if (data.length < 2) return false

  const firstRow = data[0] || []
  const secondRow = data[1] || []

  // Check if first row looks more like headers than data
  const firstRowNumeric = firstRow.filter(cell =>
    cell !== null && cell !== undefined && !isNaN(Number(cell))
  ).length

  const secondRowNumeric = secondRow.filter(cell =>
    cell !== null && cell !== undefined && !isNaN(Number(cell))
  ).length

  // If first row has fewer numeric values than second row, it's likely headers
  return firstRowNumeric < secondRowNumeric
}

/**
 * Parse Excel cell value with type detection
 */
function parseExcelValue(value: any): any {
  if (value === null || value === undefined || value === '') {
    return null
  }

  // Convert to string first
  const stringValue = value.toString().trim()

  if (stringValue === '' || stringValue === 'NULL' || stringValue === 'null') {
    return null
  }

  // Try to parse as number
  const numValue = Number(stringValue)
  if (!isNaN(numValue) && isFinite(numValue)) {
    return numValue
  }

  // Try to parse as boolean
  const lowerValue = stringValue.toLowerCase()
  if (lowerValue === 'true' || lowerValue === 'yes' || lowerValue === '1') {
    return true
  }
  if (lowerValue === 'false' || lowerValue === 'no' || lowerValue === '0') {
    return false
  }

  // Try to parse as date (basic ISO format)
  if (/^\d{4}-\d{2}-\d{2}/.test(stringValue)) {
    const date = new Date(stringValue)
    if (!isNaN(date.getTime())) {
      return stringValue // Keep as string for now
    }
  }

  // Return as string
  return stringValue
}