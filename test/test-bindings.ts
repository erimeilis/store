// Mock implementations for Cloudflare bindings in tests
export class MockD1Database {
  private data = new Map<number, any>()
  private nextId = 1

  prepare(sql: string) {
    return new MockD1PreparedStatement(sql, this)
  }

  async batch(statements: Array<{ bind: (...args: any[]) => any; run: () => Promise<any> }>) {
    const results = []
    for (const stmt of statements) {
      try {
        const result = await stmt.run()
        results.push({ success: true, ...result })
      } catch (error) {
        results.push({ success: false, error })
      }
    }
    return results
  }

  // Internal methods for testing
  _insert(data: any): number {
    const id = this.nextId++
    const now = new Date().toISOString()
    this.data.set(id, {
      id,
      ...data,
      created_at: now,
      updated_at: now
    })
    return id
  }

  _update(id: number, data: any): boolean {
    if (!this.data.has(id)) return false
    const existing = this.data.get(id)
    this.data.set(id, {
      ...existing,
      ...data,
      updated_at: new Date().toISOString()
    })
    return true
  }

  _delete(id: number): any {
    const item = this.data.get(id)
    if (item) {
      this.data.delete(id)
      return item
    }
    return null
  }

  _get(id: number): any {
    return this.data.get(id) || null
  }

  _getAll(): any[] {
    return Array.from(this.data.values()).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }

  _clear(): void {
    this.data.clear()
    this.nextId = 1
  }
}

class MockD1PreparedStatement {
  private boundParams: any[] = []

  constructor(private sql: string, private db: MockD1Database) {}

  bind(...params: any[]) {
    this.boundParams = params
    return this
  }

  async run() {
    if (this.sql.includes('INSERT INTO items')) {
      const [name, description, data] = this.boundParams
      const id = this.db._insert({ name, description, data })
      return { meta: { last_row_id: id } }
    }

    if (this.sql.includes('UPDATE items')) {
      const [name, description, data, id] = this.boundParams
      const updated = this.db._update(id, { name, description, data })
      return { success: updated }
    }

    if (this.sql.includes('DELETE FROM items')) {
      const [id] = this.boundParams
      const deleted = this.db._delete(id)
      return { success: !!deleted }
    }

    return { success: true }
  }

  async first() {
    if (this.sql.includes('SELECT * FROM items WHERE id = ?')) {
      const [id] = this.boundParams
      return this.db._get(id)
    }
    return null
  }

  async all() {
    if (this.sql.includes('SELECT * FROM items ORDER BY created_at DESC')) {
      return { results: this.db._getAll() }
    }
    return { results: [] }
  }
}

export class MockR2Bucket {
  private storage = new Map<string, any>()

  async put(key: string, value: ReadableStream | ArrayBuffer | string, options?: any) {
    // Convert stream to string for testing
    let content = value
    if (value instanceof ReadableStream) {
      const reader = value.getReader()
      const chunks = []
      let done = false
      while (!done) {
        const { value: chunk, done: readerDone } = await reader.read()
        done = readerDone
        if (chunk) chunks.push(chunk)
      }
      content = new TextDecoder().decode(new Uint8Array(chunks.flat()))
    }

    this.storage.set(key, {
      content,
      metadata: options?.customMetadata || {},
      contentType: options?.httpMetadata?.contentType || 'application/octet-stream'
    })

    return { success: true }
  }

  async get(key: string) {
    const item = this.storage.get(key)
    if (!item) return null

    return {
      text: () => Promise.resolve(item.content),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      customMetadata: item.metadata,
      httpMetadata: { contentType: item.contentType }
    }
  }

  async delete(key: string) {
    return { success: this.storage.delete(key) }
  }

  // Test helper
  _clear() {
    this.storage.clear()
  }
}

export const createTestBindings = () => {
  const db = new MockD1Database()
  const bucket = new MockR2Bucket()

  // Add some initial test data
  db._insert({
    name: "Sample Item 1",
    description: "This is a sample item for testing",
    data: JSON.stringify({ category: "test", priority: "high" })
  })

  db._insert({
    name: "Sample Item 2",
    description: "Another sample item",
    data: JSON.stringify({ category: "demo", priority: "low" })
  })

  return { DB: db, BUCKET: bucket }
}
