# Database Migrations

## Structure

### Generated Migrations
- `20250829165615_init/` - Prisma-generated initial migration
  - Contains complete schema creation for all 6 tables
  - Used by `npm run db:migrate` and D1 deployment

### Individual Table Migrations
- `individual/` - Individual table creation files for reference
  - `001_create_users_table.sql` - Users table with OAuth data
  - `002_create_sessions_table.sql` - Session management
  - `003_create_tokens_table.sql` - API tokens with IP/domain whitelist
  - `004_create_tables_table.sql` - Dynamic table metadata
  - `005_create_allowed_emails_table.sql` - Email whitelist
  - `006_create_items_table.sql` - Test items table

### Migration Tools
- `run-migrations.js` - Script to run individual migrations
  - Usage: `node prisma/migrations/run-migrations.js <env>`
  - Environments: `local`, `dev`, `production`

## Usage

### Development Workflow
```bash
# Standard Prisma workflow (recommended)
npm run db:migrate     # Apply migrations to local SQLite
npm run db:seed        # Seed with test data

# D1 deployment
npm run db:migrate:dev  # Apply to D1 preview
npm run db:migrate:prod # Apply to D1 production
```

### Individual File Usage
```bash
# Run individual migrations (alternative approach)
node prisma/migrations/run-migrations.js local
node prisma/migrations/run-migrations.js dev
node prisma/migrations/run-migrations.js production
```

## Best Practices

1. **Use Prisma migrations** for schema changes in development
2. **Use D1 deployment commands** for preview/production
3. **Keep individual files** for reference and manual operations
4. **Test migrations** on preview before production
5. **Backup production** before major schema changes