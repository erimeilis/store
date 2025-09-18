/**
 * Refactored File Parser Service
 * Handles parsing of various file formats for table import
 * Delegates to specialized parsing functions
 */

import type { ParsedData, ParseOptions } from '@/types/file-parser.js'
import { parseExcelFile } from './parseExcelFile.js'
import { parseCsvOrTxt } from './parseCsvOrTxt.js'

/**
 * Main entry point for parsing import files
 * Determines file type and delegates to appropriate parser
 */
export async function parseImportFile(
  file: globalThis.File,
  options: ParseOptions = {}
): Promise<ParsedData> {
  const fileName = file.name
  const fileExtension = fileName.toLowerCase().split('.').pop()
  let fileType = fileExtension || 'unknown'

  if (fileExtension === 'csv' || fileExtension === 'txt') {
    const content = await file.text()
    return parseCsvOrTxt(content, fileName, fileType, options)
  } else if (fileExtension === 'xls' || fileExtension === 'xlsx') {
    return await parseExcelFile(file, fileName, fileType, options)
  } else {
    throw new Error(`Unsupported file type: ${fileExtension}. Please use CSV, TXT, XLS, or XLSX.`)
  }
}

// Re-export the individual parsers for direct use if needed
export { parseExcelFile } from './parseExcelFile.js'
export { parseCsvOrTxt } from './parseCsvOrTxt.js'