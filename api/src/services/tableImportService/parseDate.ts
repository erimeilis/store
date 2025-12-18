/**
 * Parse date string into ISO format
 * Handles various date formats and converts them to YYYY-MM-DD
 */
export function parseDate(value: string): string | null {
    // Try ISO format first (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const date = new Date(value + 'T00:00:00Z')
        if (!isNaN(date.getTime())) {
            return value
        }
    }

    // Try other common formats
    const formats = [
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // MM/DD/YYYY or DD/MM/YYYY
        /^(\d{1,2})-(\d{1,2})-(\d{4})$/, // MM-DD-YYYY or DD-MM-YYYY
        /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/, // YYYY/MM/DD
        /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/, // DD.MM.YYYY
    ]

    for (const format of formats) {
        const match = value.match(format)
        if (match) {
            let year, month, day

            if (format === formats[0] || format === formats[1]) {
                // Assume MM/DD/YYYY format for US dates
                month = parseInt(match[1]!)
                day = parseInt(match[2]!)
                year = parseInt(match[3]!)
            } else if (format === formats[2]) {
                // YYYY/MM/DD
                year = parseInt(match[1]!)
                month = parseInt(match[2]!)
                day = parseInt(match[3]!)
            } else if (format === formats[3]) {
                // DD.MM.YYYY (European)
                day = parseInt(match[1]!)
                month = parseInt(match[2]!)
                year = parseInt(match[3]!)
            }

            if (year && month && day &&
                year >= 1900 && year <= 2100 &&
                month >= 1 && month <= 12 &&
                day >= 1 && day <= 31) {

                const isoDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
                const testDate = new Date(isoDate + 'T00:00:00Z')

                if (!isNaN(testDate.getTime())) {
                    return isoDate
                }
            }
        }
    }

    return null
}