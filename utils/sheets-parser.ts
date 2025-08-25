// Helper function to parse Google Sheets data
export function parseGoogleSheetsData(values: string[][]): Array<{name: string, description?: string, data?: any}> {
  const rows: Array<{name: string, description?: string, data?: any}> = []
  
  if (values.length <= 1 || !values[0]) {
    return rows
  }

  // First row is headers
  const headers = values[0].map(h => (h || '').toString().trim().toLowerCase())
  
  // Find name column index
  const nameIndex = headers.findIndex(h => h.includes('name'))
  if (nameIndex === -1) {
    throw new Error('Name column not found in Google Sheets data. Please ensure there is a column with "name" in the header.')
  }

  // Process data rows
  for (let i = 1; i < values.length; i++) {
    const row = values[i]
    if (!row || row.length <= nameIndex || !row[nameIndex]) {
      continue // Skip empty rows or rows without name
    }

    const item: {name: string, description?: string, data?: any} = {
      name: row[nameIndex].toString().trim()
    }

    // Look for description column
    const descIndex = headers.findIndex(h => h.includes('description') || h.includes('desc'))
    if (descIndex !== -1 && row[descIndex]) {
      item.description = row[descIndex].toString().trim()
    }

    // Add remaining columns as data object
    const additionalData: any = {}
    headers.forEach((header, index) => {
      if (index !== nameIndex && index !== descIndex && row[index]) {
        // Use original header case for field names
        const originalHeader = (values[0] && values[0][index]) ? values[0][index] : header
        additionalData[originalHeader] = row[index].toString().trim()
      }
    })
    
    if (Object.keys(additionalData).length > 0) {
      item.data = additionalData
    }

    rows.push(item)
  }

  return rows
}
