// Helper function to parse file content
export function parseFileContent(content: string, filename: string): Array<{name: string, description?: string, data?: any}> {
  const rows: Array<{name: string, description?: string, data?: any}> = []
  
  try {
    // Simple CSV parser for now (can be enhanced for Excel files)
    const lines = content.split('\n').filter(line => line.trim().length > 0)
    
    if (lines.length <= 1) {
      return rows
    }

    // Assume first line is header
    const firstLine = lines[0]
    if (!firstLine) {
      throw new Error('No header line found in CSV file')
    }
    const headers = firstLine.split(',').map(h => h.trim().replace(/"/g, ''))
    
    // Find name column index
    const nameIndex = headers.findIndex(h => h.toLowerCase().includes('name'))
    if (nameIndex === -1) {
      throw new Error('Name column not found in CSV. Please ensure there is a column with "name" in the header.')
    }

    // Process data rows
    for (let i = 1; i < lines.length; i++) {
      const currentLine = lines[i]
      if (!currentLine) continue
      
      const values = currentLine.split(',').map(v => v.trim().replace(/"/g, ''))
      
      if (values.length > nameIndex && values[nameIndex]) {
        const item: {name: string, description?: string, data?: any} = {
          name: values[nameIndex]
        }

        // Look for description column
        const descIndex = headers.findIndex(h => h.toLowerCase().includes('description') || h.toLowerCase().includes('desc'))
        if (descIndex !== -1 && values[descIndex]) {
          item.description = values[descIndex]
        }

        // Add remaining columns as data object
        const additionalData: any = {}
        headers.forEach((header, index) => {
          if (index !== nameIndex && index !== descIndex && values[index]) {
            additionalData[header] = values[index]
          }
        })
        
        if (Object.keys(additionalData).length > 0) {
          item.data = additionalData
        }

        rows.push(item)
      }
    }

  } catch (error) {
    throw new Error(`Failed to parse file: ${error instanceof Error ? error.message : 'Unknown parsing error'}`)
  }

  return rows
}
