# Task: Clean Architecture Implementation

## Objective
Implement a clean, well-structured architecture with proper environment separation:
- Backend: 3 environments (local, preview, production) with D1/R2/KV
- Frontend: 2 environments (local, production) with Google OAuth
- Prisma-based database management with proper migrations and seeding

## Current State Analysis
- Mixed configurations with inconsistent environment handling
- Database reset scripts using wrangler directly
- Unclear separation between local/preview/production
- Documentation mentions SQLite but system uses D1

## Architecture Requirements

### Backend Environments
1. **Local**: Uses **local D1** instances (stored in `.wrangler/state/`), preview R2/KV resources, localhost URLs
2. **Preview**: Uses **remote preview D1** instances (on Cloudflare), preview R2/KV resources, localhost URLs  
3. **Production**: Uses **remote production D1** instances (on Cloudflare), production R2/KV resources, production URLs

### Frontend Environments
1. **Local**: Google OAuth from dev.vars, full access token from dev.vars
2. **Production**: Google OAuth from secrets, full access token from secrets

### Database Management
- Prisma migrations: separate migration per table
- Essential seeds: full access tokens with proper domain allowlists
- Optional seeds: faker.js generated items (10/100/200 for local/preview/production)
- Reset strategy: TBD based on investigation

## Database Reset Approach: Wrangler D1 Native

**Selected Approach**: Wrangler D1 Native with comprehensive clearing strategy

### Implementation Strategy

**Phase 1: Complete Database Clearing**
```bash
# Discover all existing tables
wrangler d1 execute <db> --command="SELECT name FROM sqlite_master WHERE type='table';" --local/--remote

# Drop all discovered tables
wrangler d1 execute <db> --command="DROP TABLE IF EXISTS table1, table2, etc;" --local/--remote
```

**Phase 2: Apply Fresh Schema**
```bash
# Use Wrangler native migrations
wrangler d1 migrations create <db> create_schema
# Apply migrations
wrangler d1 migrations apply <db> --local/--remote
```

**Phase 3: Environment-Specific Seeding**
```bash
# Apply seeds with environment-specific data
wrangler d1 execute <db> --file=seeds/essential-tokens.sql --local/--remote
wrangler d1 execute <db> --file=seeds/faker-items-<env>.sql --local/--remote
```

### Why This Approach

**Pros**: 
- ✅ Full D1 support (local and remote instances)
- ✅ Handles existing data properly (clears first)
- ✅ Direct control over D1 features
- ✅ Environment-aware (local/preview/production)
- ✅ Native Cloudflare tooling

**Cons**: 
- Manual migration management (acceptable trade-off)
- Separate seeding scripts (better control)

## Files to Modify/Create

### Configuration Files
- `wrangler.toml` - Clean backend environment definitions
- `frontend/wrangler.toml` - Clean frontend environment definitions
- `prisma/schema.prisma` - Updated schema if needed

### Migration Files (Separate per table)
- `prisma/migrations/001_users/migration.sql`
- `prisma/migrations/002_sessions/migration.sql`
- `prisma/migrations/003_tokens/migration.sql`
- `prisma/migrations/004_tables/migration.sql`
- `prisma/migrations/005_allowed_emails/migration.sql`
- `prisma/migrations/006_items/migration.sql`

### Seed Files
- `scripts/seeds/essential-tokens.ts` - Required tokens with domain allowlists
- `scripts/seeds/faker-items.ts` - Dynamic item generation
- `scripts/db-reset.ts` - Main reset orchestrator

### Environment Files
- `.dev.vars` - Backend local secrets
- `frontend/.dev.vars` - Frontend local secrets

## Testing Strategy
1. Test each environment isolation
2. Verify database reset works correctly
3. Test token authentication across environments
4. Verify frontend-backend communication
5. Test deployment process

## Next Steps
1. Investigate database reset approaches and present recommendations
2. Clean current configuration
3. Implement step by step following the architecture