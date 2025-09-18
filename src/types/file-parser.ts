/**
 * File parser types and interfaces
 */

export interface ParsedData {
  headers: string[]
  rows: any[][]
  hasHeaders: boolean
  fileType: string
  fileName: string
  skipRows?: number
}

export interface ParseOptions {
  skipRows?: number
}

export interface DelimiterDetectionResult {
  delimiter: string
  count: number
}