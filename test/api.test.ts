import { describe, it, expect, beforeEach } from 'vitest'
import app from '../src/index'
import { createTestBindings } from './test-bindings'

// Create test bindings for each test
let testEnv: any

// Test tokens (matching the default tokens from the backend)
const FULL_ACCESS_TOKEN = 'dev-full-access-token'
const READ_ONLY_TOKEN = 'dev-read-only-token'

describe('Store CRUD API', () => {
  beforeEach(() => {
    // Create fresh test bindings for each test
    testEnv = createTestBindings()
  })

  describe('Health Check', () => {
    it('should return health check response', async () => {
      const request = new Request('http://localhost/', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const response = await app.request(request, {}, testEnv)
      const data = await response.json() as any
      
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('message')
      expect(data).toHaveProperty('timestamp')
      expect(data).toHaveProperty('version')
      expect(data.message).toBe('Store CRUD API is running')
      expect(data.version).toBe('1.0.0')
    })
  })

  describe('GET /api/items', () => {
    it('should return all items with count', async () => {
      const request = new Request('http://localhost/api/items', {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${READ_ONLY_TOKEN}`
        }
      })
      
      const response = await app.request(request, {}, testEnv)
      const data = await response.json() as any
      
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('items')
      expect(data).toHaveProperty('count')
      expect(Array.isArray(data.items)).toBe(true)
      expect(data.count).toBe(data.items.length)
      expect(data.items.length).toBeGreaterThan(0)
    })

    it('should return items with correct structure', async () => {
      const request = new Request('http://localhost/api/items', {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${READ_ONLY_TOKEN}`
        }
      })
      
      const response = await app.request(request, {}, testEnv)
      const data = await response.json() as any
      
      expect(data.items[0]).toHaveProperty('id')
      expect(data.items[0]).toHaveProperty('name')
      expect(data.items[0]).toHaveProperty('created_at')
      expect(data.items[0]).toHaveProperty('updated_at')
    })
  })

  describe('GET /api/items/:id', () => {
    it('should return specific item when valid ID is provided', async () => {
      const request = new Request('http://localhost/api/items/1', {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${READ_ONLY_TOKEN}`
        }
      })
      
      const response = await app.request(request, {}, testEnv)
      const data = await response.json() as any
      
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('item')
      expect(data.item.id).toBe(1)
      expect(data.item).toHaveProperty('name')
    })

    it('should return 404 for non-existent item', async () => {
      const request = new Request('http://localhost/api/items/999', {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${READ_ONLY_TOKEN}`
        }
      })
      
      const response = await app.request(request, {}, testEnv)
      const data = await response.json() as any
      
      expect(response.status).toBe(404)
      expect(data).toHaveProperty('error')
      expect(data.error).toBe('Item not found')
      expect(data).toHaveProperty('message')
    })

    it('should return 400 for invalid item ID', async () => {
      const request = new Request('http://localhost/api/items/invalid', {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${READ_ONLY_TOKEN}`
        }
      })
      
      const response = await app.request(request, {}, testEnv)
      const data = await response.json() as any
      
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
      expect(data.error).toBe('Invalid item ID')
    })
  })

  describe('POST /api/items', () => {
    it('should create new item with valid data', async () => {
      const newItem = {
        name: 'Test Item',
        description: 'Test Description',
        data: { category: 'test' }
      }

      const request = new Request('http://localhost/api/items', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${FULL_ACCESS_TOKEN}`
        },
        body: JSON.stringify(newItem)
      })
      
      const response = await app.request(request, {}, testEnv)
      const data = await response.json() as any
      
      expect(response.status).toBe(201)
      expect(data).toHaveProperty('item')
      expect(data).toHaveProperty('message')
      expect(data.item.name).toBe(newItem.name)
      expect(data.item.description).toBe(newItem.description)
      expect(data.item).toHaveProperty('id')
      expect(data.item).toHaveProperty('created_at')
      expect(data.item).toHaveProperty('updated_at')
    })

    it('should create item with only required fields', async () => {
      const newItem = { name: 'Minimal Item' }

      const request = new Request('http://localhost/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      })
      
      const response = await app.request(request, {}, testEnv)
      const data = await response.json() as any
      
      expect(response.status).toBe(201)
      expect(data.item.name).toBe(newItem.name)
      expect(data.item.description).toBeNull()
      expect(data.item.data).toBeNull()
    })

    it('should return 400 when name is missing', async () => {
      const invalidItem = { description: 'No name provided' }

      const request = new Request('http://localhost/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidItem)
      })
      
      const response = await app.request(request, {}, testEnv)
      const data = await response.json() as any
      
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
      expect(data.error).toBe('Validation failed')
    })

    it('should return 400 when name is not a string', async () => {
      const invalidItem = { name: 123 }

      const request = new Request('http://localhost/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidItem)
      })
      
      const response = await app.request(request, {}, testEnv)
      const data = await response.json() as any
      
      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation failed')
    })

    it('should return 400 for malformed JSON', async () => {
      const request = new Request('http://localhost/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json'
      })
      
      const response = await app.request(request, {}, testEnv)
      const data = await response.json() as any
      
      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid JSON')
    })
  })

  describe('PUT /api/items/:id', () => {
    it('should update existing item', async () => {
      const updatedItem = {
        name: 'Updated Item',
        description: 'Updated Description',
        data: { category: 'updated' }
      }

      const request = new Request('http://localhost/api/items/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem)
      })
      
      const response = await app.request(request, {}, testEnv)
      const data = await response.json() as any
      
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('item')
      expect(data).toHaveProperty('message')
      expect(data.item.name).toBe(updatedItem.name)
      expect(data.item.description).toBe(updatedItem.description)
      expect(data.item.id).toBe(1)
    })

    it('should return 404 for non-existent item', async () => {
      const updatedItem = { name: 'Updated Item' }

      const request = new Request('http://localhost/api/items/999', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem)
      })
      
      const response = await app.request(request, {}, testEnv)
      const data = await response.json() as any
      
      expect(response.status).toBe(404)
      expect(data.error).toBe('Item not found')
    })

    it('should return 400 for invalid item ID', async () => {
      const updatedItem = { name: 'Updated Item' }

      const request = new Request('http://localhost/api/items/invalid', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem)
      })
      
      const response = await app.request(request, {}, testEnv)
      const data = await response.json() as any
      
      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid item ID')
    })

    it('should return 400 when name is missing in update', async () => {
      const invalidUpdate = { description: 'No name' }

      const request = new Request('http://localhost/api/items/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidUpdate)
      })
      
      const response = await app.request(request, {}, testEnv)
      const data = await response.json() as any
      
      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation failed')
    })
  })

  describe('DELETE /api/items/:id', () => {
    it('should delete existing item', async () => {
      const request = new Request('http://localhost/api/items/2', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const response = await app.request(request, {}, testEnv)
      const data = await response.json() as any
      
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('item')
      expect(data).toHaveProperty('message')
      expect(data.item.id).toBe(2)
      expect(data.message).toBe('Item deleted successfully')
    })

    it('should return 404 for non-existent item', async () => {
      const request = new Request('http://localhost/api/items/999', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const response = await app.request(request, {}, testEnv)
      const data = await response.json() as any
      
      expect(response.status).toBe(404)
      expect(data.error).toBe('Item not found')
    })

    it('should return 400 for invalid item ID', async () => {
      const request = new Request('http://localhost/api/items/invalid', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const response = await app.request(request, {}, testEnv)
      const data = await response.json() as any
      
      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid item ID')
    })
  })

  describe('Error Handling', () => {
    it('should return 404 for unknown routes', async () => {
      const request = new Request('http://localhost/api/unknown', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const response = await app.request(request, {}, testEnv)
      const data = await response.json() as any
      
      expect(response.status).toBe(404)
      expect(data).toHaveProperty('error')
      expect(data.error).toBe('Not Found')
      expect(data.message).toBe('The requested endpoint does not exist')
    })

    it('should handle CORS preflight requests', async () => {
      const request = new Request('http://localhost/api/items', {
        method: 'OPTIONS',
        headers: { 
          'Origin': 'http://localhost:3000',
          'Access-Control-Request-Method': 'POST'
        }
      })
      
      const response = await app.request(request, {}, testEnv)
      
      expect(response.status).toBe(204)
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
    })
  })

  describe('POST /api/import/sheets', () => {
    it('should return 400 when spreadsheetId is missing', async () => {
      const invalidRequest = { range: 'Sheet1!A1:C10' }

      const request = new Request('http://localhost/api/import/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidRequest)
      })
      
      const response = await app.request(request, {}, testEnv)
      const data = await response.json() as any
      
      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation failed')
      expect(data.message).toContain('spreadsheetId is required')
    })

    it('should return 400 when range is missing', async () => {
      const invalidRequest = { spreadsheetId: '1abc123' }

      const request = new Request('http://localhost/api/import/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidRequest)
      })
      
      const response = await app.request(request, {}, testEnv)
      const data = await response.json() as any
      
      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation failed')
      expect(data.message).toContain('range is required')
    })

    it('should return 500 when Google API key is not configured', async () => {
      const validRequest = {
        spreadsheetId: '1abc123def456',
        range: 'Sheet1!A1:C10'
      }

      const request = new Request('http://localhost/api/import/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validRequest)
      })
      
      // Use test environment without GOOGLE_API_KEY
      const response = await app.request(request, {}, testEnv)
      const data = await response.json() as any
      
      expect(response.status).toBe(500)
      expect(data.error).toBe('Configuration error')
      expect(data.message).toBe('Google Sheets API key not configured')
    })

    it('should return 400 for malformed JSON', async () => {
      const request = new Request('http://localhost/api/import/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json'
      })
      
      const response = await app.request(request, {}, testEnv)
      const data = await response.json() as any
      
      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid JSON')
    })

    it('should handle Google Sheets API errors gracefully', async () => {
      // Create test environment with API key
      const testEnvWithApiKey = {
        ...testEnv,
        GOOGLE_API_KEY: 'test-api-key'
      }

      const validRequest = {
        spreadsheetId: 'invalid-spreadsheet-id',
        range: 'Sheet1!A1:C10'
      }

      const request = new Request('http://localhost/api/import/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validRequest)
      })
      
      const response = await app.request(request, {}, testEnvWithApiKey)
      const data = await response.json() as any
      
      // Should handle API errors gracefully (likely 400 or 500 status)
      expect([400, 404, 500].includes(response.status)).toBe(true)
      expect(data).toHaveProperty('error')
    })
  })
})
