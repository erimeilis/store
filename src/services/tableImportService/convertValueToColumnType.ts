/**
 * Convert cell value to specific column type with validation
 * Handles type conversion and validation for table import
 */

import { parseDate } from './parseDate.js'

export function convertValueToColumnType(value: any, columnType: string): any {
    if (value === null || value === undefined || value === '') {
        return null
    }

    const stringValue = String(value).trim()
    if (!stringValue) {
        return null
    }

    switch (columnType.toLowerCase()) {
        case 'text':
        case 'email':
            return stringValue

        case 'number':
            const numValue = Number(stringValue)
            if (isNaN(numValue)) {
                throw new Error(`Invalid number: "${stringValue}"`)
            }
            return numValue

        case 'boolean':
            const lowerValue = stringValue.toLowerCase()
            if (['true', 'yes', '1', 'y', 'on'].includes(lowerValue)) {
                return true
            }
            if (['false', 'no', '0', 'n', 'off'].includes(lowerValue)) {
                return false
            }
            throw new Error(`Invalid boolean: "${stringValue}". Use true/false, yes/no, or 1/0`)

        case 'date':
            // Try to parse various date formats
            const date = parseDate(stringValue)
            if (!date) {
                throw new Error(`Invalid date: "${stringValue}". Use YYYY-MM-DD format`)
            }
            return date

        case 'country':
            // Country should be a valid ISO 2-letter or 3-letter code
            const countryCode = stringValue.toUpperCase()
            if (countryCode.length !== 2 && countryCode.length !== 3) {
                throw new Error(`Invalid country code: "${stringValue}". Use ISO 2-letter (US) or 3-letter (USA) format`)
            }
            return countryCode

        default:
            return stringValue
    }
}