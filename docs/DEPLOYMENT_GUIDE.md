# Database Migration Deployment Guide

## Overview
This guide covers deploying Prisma database migrations and seeding across all environments: local development, D1 preview, and D1 production.

## Architecture
- **Local Development**: SQLite file (`prisma/local.db`)
- **D1 Preview**: Cloudflare D1 database (`store-database-preview`)
- **D1 Production**: Cloudflare D1 database (`store-database`)

## Prerequisites
- Wrangler CLI configured with proper authentication
- Access to Cloudflare D1 databases
- Node.js 18+ and npm installed

## Environment Setup

### 1. Local Development
```bash
# Use local SQLite database
npm run db:migrate    # Apply migrations
npm run db:seed       # Seed with test data
npm run db:studio     # View data (optional)
```

### 2. D1 Preview Environment
```bash
# Apply Prisma migrations to D1 preview
wrangler d1 execute store-database-preview --env dev \
  --file=prisma/migrations/20250829165615_init/migration.sql

# Seed D1 preview database
wrangler d1 execute store-database-preview --env dev \
  --file=scripts/seed-d1.sql

# Test the deployment
npm run dev  # Test locally with D1 preview
```

### 3. D1 Production Environment
```bash
# Apply migrations to production (REMOTE flag required)
wrangler d1 execute store-database --env production --remote \
  --file=prisma/migrations/20250829165615_init/migration.sql

# Seed production database
wrangler d1 execute store-database --env production --remote \
  --file=scripts/seed-d1.sql

# Deploy the Worker
npm run deploy
```

## Migration Workflow

### Creating New Migrations
```bash
# 1. Make changes to prisma/schema.prisma
# 2. Generate migration
npx prisma migrate dev --name add_user_roles

# 3. Apply to D1 preview
wrangler d1 execute store-database-preview --env dev \
  --file=prisma/migrations/[timestamp]_add_user_roles/migration.sql

# 4. Test thoroughly
npm run dev

# 5. Apply to production
wrangler d1 execute store-database --env production --remote \
  --file=prisma/migrations/[timestamp]_add_user_roles/migration.sql

# 6. Deploy Worker
npm run deploy
```

### Rolling Back Migrations
```bash
# Local rollback
npm run db:reset  # Resets and re-runs all migrations

# D1 rollback (manual)
# 1. Drop affected tables
wrangler d1 execute store-database-preview --env dev \
  --command="DROP TABLE IF EXISTS new_table;"

# 2. Re-apply previous migration
wrangler d1 execute store-database-preview --env dev \
  --file=prisma/migrations/[previous_migration]/migration.sql
```

## Database Seeding

### Configurable Root User
The seeding system supports configurable root users for different environments:

```bash
# Default root user (eri@admice.com)
npm run db:seed

# Custom root user
ADMIN_EMAIL="admin@yourcompany.com" ADMIN_NAME="System Admin" npm run db:seed
```

### D1 Seeding Script
The `scripts/seed-d1.sql` file contains:
- Root user (admin@yourcompany.com)
- Allowed domain (@yourcompany.com) 
- 3 API tokens with different permissions
- Table metadata for dynamic table management
- Sample items for testing

### API Tokens Created
1. **Development Token**: `dev-local-token-123-secure`
   - Permissions: `read,write,delete,admin`
   - IP Whitelist: Local networks
   - Domain Whitelist: `localhost`, `*.dev`, `*.local`

2. **Frontend Token**: `frontend-secure-token-456`
   - Permissions: `read,write`
   - IP Whitelist: All IPs (`0.0.0.0/0`)
   - Domain Whitelist: `*.pages.dev`, `*.workers.dev`, your domain

3. **Read-only Token**: `readonly-token-789`
   - Permissions: `read`
   - IP Whitelist: Corporate networks
   - Domain Whitelist: `*.internal`, `*.corp`

## Production Deployment Checklist

### Pre-deployment
- [ ] Test migrations on local SQLite
- [ ] Test migrations on D1 preview
- [ ] Verify seeding works correctly
- [ ] Update API tokens for production domains
- [ ] Set production secrets in Wrangler

### Deployment Steps
```bash
# 1. Apply migrations to production D1
wrangler d1 execute store-database --env production --remote \
  --file=prisma/migrations/20250829165615_init/migration.sql

# 2. Seed production database
wrangler d1 execute store-database --env production --remote \
  --file=scripts/seed-d1.sql

# 3. Set production secrets
wrangler secret put GOOGLE_CLIENT_ID --env production
wrangler secret put GOOGLE_CLIENT_SECRET --env production
wrangler secret put FRONTEND_ACCESS_TOKEN --env production

# 4. Deploy Worker
npm run deploy

# 5. Test production endpoints
curl https://store-crud-api.eri-42e.workers.dev/health
curl -H "Authorization: Bearer frontend-secure-token-456" \
     https://store-crud-api.eri-42e.workers.dev/api/items
```

### Post-deployment
- [ ] Verify health check passes
- [ ] Test API endpoints with tokens
- [ ] Verify IP/domain whitelist works
- [ ] Monitor Worker logs for errors

## Troubleshooting

### Common Issues

**Migration fails: "table already exists"**
```bash
# Check current schema
wrangler d1 execute store-database-preview --env dev \
  --command="SELECT name FROM sqlite_master WHERE type='table';"

# Drop conflicting tables if needed
wrangler d1 execute store-database-preview --env dev \
  --command="DROP TABLE IF EXISTS conflicting_table;"
```

**Token authentication fails**
```bash
# Check tokens exist
wrangler d1 execute store-database-preview --env dev \
  --command="SELECT token, name, permissions FROM tokens;"

# Verify token expiration
wrangler d1 execute store-database-preview --env dev \
  --command="SELECT token, expires_at FROM tokens WHERE expires_at IS NOT NULL;"
```

**IP/Domain whitelist blocks requests**
```bash
# Check whitelist configuration
wrangler d1 execute store-database-preview --env dev \
  --command="SELECT token, allowed_ips, allowed_domains FROM tokens WHERE token='your-token';"

# Update whitelist for development
wrangler d1 execute store-database-preview --env dev \
  --command="UPDATE tokens SET allowed_domains='[\"localhost:*\", \"*.dev\"]' WHERE token='dev-local-token-123-secure';"
```

### Useful Commands

**Database inspection:**
```bash
# List all tables
wrangler d1 execute store-database-preview --env dev \
  --command="SELECT name FROM sqlite_master WHERE type='table';"

# Count records
wrangler d1 execute store-database-preview --env dev \
  --command="SELECT COUNT(*) FROM items;"

# View tokens
wrangler d1 execute store-database-preview --env dev \
  --command="SELECT token, name, permissions FROM tokens;"
```

**Worker logs:**
```bash
# Tail production logs
wrangler tail --env production

# Tail development logs  
wrangler tail --env dev
```

## Security Best Practices

1. **Token Management**:
   - Use different tokens for each environment
   - Set appropriate IP/domain restrictions
   - Regularly rotate production tokens
   - Never commit tokens to version control

2. **Migration Safety**:
   - Always test on preview before production
   - Backup production data before major migrations
   - Use transactions for complex migrations
   - Have rollback plans ready

3. **Access Control**:
   - Configure proper IP whitelists for production
   - Use domain restrictions for frontend tokens
   - Monitor token usage and failed authentication attempts
   - Set reasonable token expiration dates

## Environment Variables Summary

### Local Development (.env)
```env
DATABASE_URL="file:./local.db"
ADMIN_EMAIL="eri@admice.com"
ADMIN_NAME="Eri Admin"  
DEV_TOKEN="dev-local-token-123-secure"
```

### D1 Preview (.env.dev)
```env
DATABASE_URL="d1://store-database-preview"
ADMIN_EMAIL="eri@admice.com"
ADMIN_NAME="Eri Admin"
DEV_TOKEN="dev-local-token-123-secure"
```

### D1 Production (.env.production)
```env
DATABASE_URL="d1://store-database"
ADMIN_EMAIL="eri@admice.com"
ADMIN_NAME="Eri Admin"
DEV_TOKEN=""  # Set via Wrangler secrets
```

This deployment guide ensures consistent, safe database migrations across all environments with proper security controls and monitoring capabilities.