// Debug script to test bindings
import app from './src/index.ts'
import { createTestBindings } from './test/test-bindings.ts'

console.log('[DEBUG_LOG] Starting debug test')

const testEnv = createTestBindings()
console.log('[DEBUG_LOG] Test env created:', testEnv)
console.log('[DEBUG_LOG] DB object:', testEnv.DB)
console.log('[DEBUG_LOG] DB methods:', Object.getOwnPropertyNames(testEnv.DB))

try {
  const request = new Request('http://localhost/api/items', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  })
  
  console.log('[DEBUG_LOG] Making request...')
  const response = await app.request(request, testEnv)
  console.log('[DEBUG_LOG] Response status:', response.status)
  
  const data = await response.json()
  console.log('[DEBUG_LOG] Response data:', JSON.stringify(data, null, 2))
  
} catch (error) {
  console.error('[DEBUG_LOG] Error:', error.message)
  console.error('[DEBUG_LOG] Stack:', error.stack)
}
