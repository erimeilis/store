# Task: Backend API Refactoring for Improved Readability

## Overview
Refactor the backend API structure to improve code organization, readability, and maintainability. The current `index.ts` file is 535+ lines and contains mixed concerns that should be separated into logical modules.

## Current State Analysis
- **File Size**: 535 lines in single `index.ts` file
- **Mixed Concerns**: Routes, middleware, CORS config, authentication logic all in one file
- **Route Groups**: Items CRUD, File upload, Google Sheets import, Health checks
- **Middleware**: Complex bearer token authentication with D1 database integration
- **Error Handling**: Global error handlers and 404 handling

## Proposed Refactoring Structure

### 1. Middleware Separation (`/src/middleware/`)
- `cors.ts` - CORS configuration and middleware
- `auth.ts` - Bearer token authentication middleware 
- `error.ts` - Global error handling and 404 handlers

### 2. Route Groupings (`/src/routes/`)
- `health.ts` - Health check and root endpoints
- `items.ts` - Items CRUD operations (GET, POST, PUT, DELETE)
- `upload.ts` - File upload and processing
- `import.ts` - Google Sheets import functionality

### 3. Clean Main Index (`/src/index.ts`)
- App initialization
- Middleware registration
- Route mounting (organized by groups)
- Export app

## Benefits Expected
- **Improved Readability**: Each file focused on single concern
- **Better Maintainability**: Easier to find and modify specific functionality
- **Team Collaboration**: Multiple developers can work on different route groups
- **Testing**: Easier to unit test individual route groups and middleware
- **Code Reuse**: Middleware can be selectively applied to different route groups

## Technical Requirements
- **No Breaking Changes**: All existing API endpoints must work identically
- **Preserve Functionality**: Authentication, CORS, error handling must work exactly as before
- **Type Safety**: Maintain all TypeScript types and bindings
- **DRY Principle**: Avoid code duplication during refactoring
- **Clean Architecture**: Follow SOLID principles for separation of concerns

## Implementation Plan

### Phase 1: Extract Middleware
1. Create `src/middleware/` directory
2. Extract CORS configuration to `cors.ts`
3. Extract authentication logic to `auth.ts` 
4. Extract error handlers to `error.ts`

### Phase 2: Extract Route Groups
1. Create `src/routes/` directory
2. Extract health endpoints to `health.ts`
3. Extract items CRUD to `items.ts`
4. Extract file upload to `upload.ts`
5. Extract Google Sheets import to `import.ts`

### Phase 3: Refactor Main Index
1. Clean up `index.ts` to only contain:
   - App initialization
   - Middleware registration
   - Route mounting
   - App export
2. Ensure all functionality works identically

### Phase 4: Verification
1. Test all endpoints work correctly
2. Verify authentication still works
3. Confirm CORS policy applies correctly
4. Check error handling behavior

## Success Criteria
- ✅ `index.ts` reduced from 535+ lines to ~50-100 lines
- ✅ Each route group file is focused and readable (~100-150 lines max)
- ✅ All existing API functionality preserved
- ✅ No breaking changes to API contracts
- ✅ Improved code organization and maintainability

## Files to be Created
- `src/middleware/cors.ts`
- `src/middleware/auth.ts` 
- `src/middleware/error.ts`
- `src/routes/health.ts`
- `src/routes/items.ts`
- `src/routes/upload.ts`
- `src/routes/import.ts`

## Files to be Modified
- `src/index.ts` (major refactoring to clean structure)

---
*Task Created: 2025-08-29*
*Estimated Effort: 2-3 hours*
*Priority: Medium (Code Quality Improvement)*