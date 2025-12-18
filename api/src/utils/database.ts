// Helper function for bulk inserting items
export async function bulkInsertItems(db: D1Database, items: Array<{name: string, description?: string, data?: any}>): Promise<number> {
  if (items.length === 0) return 0

  try {
    // Prepare the insert statement
    const stmt = db.prepare('INSERT INTO items (name, description, data) VALUES (?, ?, ?)')
    
    // Create batch operations
    const batch = items.map(item => 
      stmt.bind(
        item.name,
        item.description || null,
        item.data ? JSON.stringify(item.data) : null
      )
    )

    // Execute batch insert
    const results = await db.batch(batch)
    
    // Count successful insertions
    return results.filter(result => result.success).length

  } catch (error) {
    throw new Error(`Bulk insert failed: ${error instanceof Error ? error.message : 'Unknown database error'}`)
  }
}
