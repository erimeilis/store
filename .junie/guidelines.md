# Store CRUD API - Development Guidelines

This document provides development guidelines for the Store CRUD application built with Hono and Cloudflare infrastructure.

## Project Overview

This is a TypeScript-based CRUD application designed for Cloudflare deployment using:
- **Backend**: Hono framework running on Cloudflare Workers (root directory)
- **Frontend**: Separate Hono + React application running on Cloudflare Workers (frontend/ directory)
- **Database**: Cloudflare D1 (SQLite-compatible)
- **Storage**: Cloudflare R2 for file uploads
- **Cache**: Cloudflare KV for sessions and caching

## Build/Configuration Instructions

### Prerequisites

- Node.js 18+ with npm
- Cloudflare account (for deployment)
- Wrangler CLI installed globally: `npm install -g wrangler`

### Initial Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **TypeScript Configuration**:
   - The project uses ES2022 target with ESNext modules
   - Configured for Cloudflare Workers types
   - `noEmit: true` since Wrangler handles bundling
   - Strict TypeScript settings enabled

3. **Wrangler Configuration** (`wrangler.toml`):
   - Main entry point: `src/index.ts`
   - Compatibility date: 2024-08-25
   - Bindings for D1, R2, and KV are commented out - uncomment when setting up actual Cloudflare resources

### Development Commands

```bash
# Start development server
npm run dev

# Run tests once
npm run test:run

# Run tests in watch mode  
npm test

# Build TypeScript (validation)
npm run build

# Deploy to Cloudflare
npm run deploy
```

### Cloudflare Resource Setup

Before deployment, you need to create and configure Cloudflare resources:

1. **D1 Database**:
   ```bash
   wrangler d1 create store-database
   # Copy the database_id to wrangler.toml
   ```

2. **R2 Bucket**:
   ```bash
   wrangler r2 bucket create store-uploads
   ```

3. **KV Namespace**:
   ```bash
   wrangler kv:namespace create "KV"
   # Copy the id to wrangler.toml
   ```

4. **Database Schema** (run after D1 creation):
   ```sql
   CREATE TABLE items (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     name TEXT NOT NULL,
     description TEXT,
     data JSON,
     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
   );
   CREATE INDEX idx_items_name ON items(name);
   ```

## Testing Information

### Testing Framework

- **Test Runner**: Vitest (fast Vite-native test runner)
- **Test Location**: `test/` directory
- **Test Files**: `*.test.ts` pattern

### Running Tests

```bash
# Run all tests once (recommended for CI/verification)
npm run test:run

# Run tests in watch mode (for development)
npm test

# Run specific test file
npx vitest run test/api.test.ts
```

### Test Structure

The test suite covers:
- **Health Check**: API availability and basic response structure
- **CRUD Operations**: All HTTP methods (GET, POST, PUT, DELETE)
- **Error Handling**: 404s, validation errors, malformed requests
- **Data Validation**: Required fields, proper JSON responses

### Test Example

```typescript
import { describe, it, expect } from 'vitest'
import app from '../src/index'

describe('API Endpoint', () => {
  it('should return expected response', async () => {
    const request = new Request('http://localhost/api/items', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    
    const response = await app.request(request)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data).toHaveProperty('items')
  })
})
```

### Test Coverage

Current test suite includes:
- ✅ Health check endpoint with version and timestamp validation
- ✅ GET /api/items (list all items with count and structure validation)
- ✅ GET /api/items/:id (get specific item with 404 and validation handling)
- ✅ POST /api/items (create new item with comprehensive validation)
- ✅ PUT /api/items/:id (update existing item with existence checks)
- ✅ DELETE /api/items/:id (delete item with confirmation response)
- ✅ Error scenarios (404s, validation failures, malformed JSON)
- ✅ CORS preflight request handling
- ✅ Advanced mock bindings for D1, R2, and KV testing
- ✅ File upload and processing scenarios (CSV parsing, bulk operations)
- ✅ Edge cases and error boundary testing

## Development Information

### Code Style

- **TypeScript**: Strict mode enabled, no implicit any
- **ES Modules**: Project uses `"type": "module"` in package.json
- **Async/Await**: Preferred over Promises for readability
- **Error Handling**: Always return proper HTTP status codes with JSON error messages

### Project Structure

```
├── src/
│   └── index.ts          # Main Hono application (422 lines, production-ready)
├── test/
│   ├── api.test.ts       # Comprehensive API endpoint tests (355 lines)
│   └── test-bindings.ts  # Advanced mock bindings for D1, R2, KV (188 lines)
├── docs/
│   └── project-structure.md  # Architecture documentation with implementation status
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── wrangler.toml         # Cloudflare Workers configuration (with D1 and R2 bindings)
├── test-data.csv         # Sample CSV file for testing file upload functionality
└── .junie/
    └── guidelines.md     # This file
```

### API Design Patterns

- **RESTful Routes**: Standard REST conventions for CRUD operations
- **JSON Responses**: All endpoints return JSON with consistent structure
- **Error Handling**: Structured error responses with meaningful messages
- **Type Safety**: Full TypeScript types for requests/responses
- **CORS**: Enabled for all routes to support frontend integration

### Development vs Production

- **Development**: Uses sophisticated mock bindings for isolated testing
- **Production**: Full integration with Cloudflare D1 database and R2 storage
- **Testing**: Advanced mock bindings simulate real Cloudflare environment
- **Environment Variables**: Configure via `wrangler.toml` [vars] section

### Debugging Tips

1. **Local Development**:
   ```bash
   # Start with debug logs
   wrangler dev --local --log-level debug
   ```

2. **Test Debugging**:
   ```bash
   # Run specific test with verbose output
   npx vitest run test/api.test.ts --reporter=verbose
   ```

3. **Production Debugging**:
   ```bash
   # View live logs
   wrangler tail
   ```

### Common Issues and Solutions

1. **Test Timeout**: Use `npm run test:run` instead of `npm test` for single execution
2. **TypeScript Errors**: Ensure `@cloudflare/workers-types` is in devDependencies
3. **Import Issues**: Project uses ES modules - ensure all imports use file extensions in production
4. **CORS Issues**: CORS is enabled globally - check origin restrictions if needed

### Security Considerations

- **Input Validation**: Always validate request bodies before processing
- **SQL Injection**: Use prepared statements with D1 database bindings
- **Authentication**: Implement proper auth before production deployment
- **Rate Limiting**: Consider adding rate limiting for production use

### Performance Optimization

- **Cold Starts**: Hono is optimized for Cloudflare Workers edge runtime
- **Database**: Use prepared statements and consider query optimization
- **Caching**: Utilize KV store for frequently accessed data
- **Bundling**: Wrangler automatically optimizes bundle size

### Next Steps for Full Implementation

1. Set up Cloudflare resources (D1, R2, KV) ✅
2. Replace mock data with D1 database integration ✅
3. Implement file upload functionality with R2 ✅
4. Add authentication (NextAuth.js or Clerk)
5. Create Next.js frontend with OpenNext.js adapter
6. Set up CI/CD pipeline with GitHub Actions

### Completed Advanced Features

- ✅ Full D1 database integration with prepared statements
- ✅ Complete R2 file storage with CSV/Excel processing
- ✅ Advanced bulk data operations with error handling
- ✅ Comprehensive test suite with mock bindings
- ✅ Production-ready API with 422 lines of TypeScript code
- ✅ Sophisticated file upload endpoint with validation
- ✅ CSV parsing with intelligent column detection
- ✅ Batch operations for high-performance data insertion

---

*Guidelines last updated: 2025-08-25*
