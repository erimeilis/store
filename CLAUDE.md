# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Important! NEVER HARDCODE!

## Architecture

This is a full-stack store CRUD application built with:

### Backend (API Server)
- **Framework**: Hono (TypeScript web framework)
- **Database**: Cloudflare D1 (SQLite-compatible)
- **Storage**: Cloudflare R2 (Object Storage)  
- **Cache**: Cloudflare KV (Key-Value Store)
- **Deployment**: Cloudflare Workers
- **Authentication**: Bearer token system stored in D1 tokens table with permission levels (read/full)

### Frontend (React SSR)
- **Framework**: Hono + React (Server-Side Rendering)
- **Styling**: TailwindCSS + DaisyUI
- **Build**: ESBuild + PostCSS
- **Authentication**: Google OAuth with session cookies
- **Deployment**: Cloudflare Workers

### Project Structure
```
Store/
├── src/index.ts                   # Backend API server (Hono app)
├── frontend/src/index.tsx         # Frontend SSR server
├── frontend/src/client.tsx        # Client-side hydration entry
├── wrangler.toml                  # Backend deployment config
└── frontend/wrangler.toml         # Frontend deployment config
```

## Development Commands

### Start Development (Recommended)
```bash
npm run dev:fullstack              # Both backend + frontend with local database
npm run dev:fullstack:remote       # Both backend + frontend with remote production database
```

### Individual Services
```bash
# Backend only
npm run dev                        # Local database
npm run dev:remote                 # Remote database with --x-remote-bindings

# Frontend only
cd frontend && npm run dev         # Runs on port 5173
```

### Testing & Quality
```bash
npm run test                       # Backend tests (Vitest)
npm run test:run                   # Run tests once
npm run build                      # Backend TypeScript check

cd frontend
npm run type-check                 # Frontend TypeScript check
npm run lint                       # ESLint check
npm run lint:fix                   # Fix linting issues
```

### Deployment
```bash
npm run deploy                     # Deploy backend to production
npm run deploy:frontend            # Deploy frontend to production  
npm run deploy:fullstack           # Deploy both backend and frontend
```

## Environment Configuration

The application uses three environments:

1. **Local Dev (`dev`)**: Uses local D1/R2/KV (managed by Wrangler, seeded with 10 items), localhost URLs
2. **Remote Dev (`dev-remote`)**: Uses remote preview D1/R2/KV resources (via --x-remote-bindings), localhost URLs  
3. **Production**: Uses production D1/R2/KV resources, production URLs

### Environment Files
- **Backend**: `.dev.vars` (not in git)
- **Frontend**: `frontend/.dev.vars` (not in git)
- **Production**: Wrangler secrets (`wrangler secret put`)

Required secrets:
```bash
# Frontend secrets
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET  
FRONTEND_ACCESS_TOKEN

# Backend secrets (if different)
FRONTEND_ACCESS_TOKEN
```

## Database Management

### Environment-Specific Database Reset (CRITICAL)

**⚠️ MANDATORY:** After ANY database schema or migration changes, you MUST reset ALL databases:

```bash
# Individual environment resets using TypeScript script
tsx scripts/db-reset.ts local        # Local D1 + 10 items (clears .wrangler/state/)
tsx scripts/db-reset.ts preview      # D1 preview + 100 items (remote Cloudflare D1)
tsx scripts/db-reset.ts production   # D1 production + 200 items (requires confirmation)

# The script automatically:
# 1. Discovers and drops existing tables
# 2. Applies all Prisma migrations in sequence
# 3. Seeds with environment-specific tokens
# 4. Seeds with faker-generated items
```

### Execute SQL Commands
```bash
# Development database
wrangler d1 execute store-database-preview --env dev --command="SELECT * FROM items;"
wrangler d1 execute store-database-preview --env dev --file=schema.sql

# Production database
wrangler d1 execute store-database --env production --remote --command="SELECT * FROM items;"
wrangler d1 execute store-database --env production --remote --file=schema.sql
```

### Key Tables
- `users`: Google OAuth users with roles
- `sessions`: User session management
- `tokens`: API authentication with permissions and IP/domain whitelist
- `items`: Store inventory (main CRUD operations)
- `user_tables`: Metadata for user-created dynamic tables
- `table_columns`: Column definitions for user-created tables
- `table_data`: Actual data storage for user-created tables (JSON format)
- `allowed_emails`: Access control whitelist

## Port Management

The development scripts automatically handle port conflicts:
- **Backend**: Port 8787
- **Frontend**: Port 5173

If ports are busy, the scripts will kill existing processes and restart cleanly.

## Authentication System

### API Authentication
- Uses bearer tokens stored in D1 tokens table
- Token types: 'read' (read-only) or 'full' (read/write)
- Header format: `Authorization: Bearer <token>`

### User Authentication
- Google OAuth flow for user login
- Session management with cookies
- Frontend uses full-access token for API calls

## Development URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8787
- **Health Check**: http://localhost:8787/health

## Code Standards

### Development Principles
- **DRY (Don't Repeat Yourself)**: Extract common functionality into reusable utilities and components
- **SOLID Principles**: Follow single responsibility, open/closed, Liskov substitution, interface segregation, and dependency inversion principles
- **Type Organization**: All TypeScript types must be extracted to the `src/types/` folder for consistent @/ path aliasing
- **Import Path Standards**: ALWAYS use @/ path aliases instead of relative paths (../../). All imports must follow the pattern:
  - `@/types/*` for types in `src/types/`
  - `@/services/*` for services in `src/services/`
  - `@/repositories/*` for repositories in `src/repositories/`
  - `@/middleware/*` for middleware in `src/middleware/`
  - `@/utils/*` for utilities in `src/utils/`
  - `@/routes/*` for routes in `src/routes/`
- **Database Migrations**: Any database structure changes must be implemented as migration files in the `prisma/migrations/` folder
- **Complexity First**: Never downgrade to simpler approaches unless explicitly requested - maintain sophisticated, production-ready patterns

### Task Management (MANDATORY)
For every development task, you MUST create and maintain:

1. **Task Plan**: `Task-[description].md` - Initial task planning and approach
   ```
   # Task: [Description]
   
   ## Objective
   [What needs to be accomplished]
   
   ## Approach
   [How you'll tackle it]
   
   ## Files to Modify/Create
   [List of affected files]
   
   ## Testing Strategy
   [How to verify the changes]
   ```

2. **Changelog**: `changelog-[description].md` - Progress tracking throughout the task
   ```
   # Changelog: [Description]
   
   ## [Timestamp] - Initial Analysis
   - [What was discovered/analyzed]
   
   ## [Timestamp] - Implementation
   - [What was implemented]
   - [Any issues encountered]
   
   ## [Timestamp] - Testing & Verification
   - [Testing performed]
   - [Results]
   ```

**Update the changelog after every significant change or iteration.**

### Documentation & Research (MANDATORY)
When encountering issues with any technology stack, you MUST:

1. **Use Context7 for documentation**: Always fetch up-to-date docs using `mcp__context7__resolve-library-id` and `mcp__context7__get-library-docs`
2. **Cache documentation**: Save fetched docs to avoid repeated API calls
3. **Document research**: Add findings to the task changelog

**Current tech stack to prioritize for Context7 lookups:**
- Hono (web framework)
- Cloudflare Workers/D1/R2/KV
- React + TypeScript
- TailwindCSS + DaisyUI
- Vitest (testing)
- ESBuild
- Wrangler CLI

### Type Management
```
types/                    # Backend types
├── bindings.ts          # Cloudflare bindings
├── item.ts              # Item model types
└── google-sheets.ts     # External API types

frontend/src/types/      # Frontend types
├── models.ts            # Data model types
└── hono.ts             # Hono-specific types
```

### Database Schema Evolution
All database changes must follow migration pattern:
```
prisma/migrations/
├── 001_users/migration.sql
├── 002_sessions/migration.sql
├── 003_tokens/migration.sql
├── 004_dynamic_tables/migration.sql
├── 005_allowed_emails/migration.sql
├── 006_items/migration.sql
└── 007_user_id_column/migration.sql
```

## Troubleshooting

### Port Issues
```bash
# Kill processes on development ports
lsof -ti:8787 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

### Database Issues
```bash
# List databases
wrangler d1 list

# Check tables
wrangler d1 execute store-database-preview --env dev --command="SELECT name FROM sqlite_master WHERE type='table';"
```

### Clean Rebuild
```bash
rm -rf node_modules frontend/node_modules
npm install && cd frontend && npm install
```
- Use commands to restart enviroment, we have npm run dev:fullstack:local and ...:preview, these commands already kill everything on chosen ports, no need to do it manually