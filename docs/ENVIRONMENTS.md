# Environment Configuration Guide

## 🤔 **The Confusion Explained**

The environment setup can be confusing because we have **two different systems**:

1. **Prisma** (uses `.env` files)
2. **Wrangler** (uses `wrangler.toml` + `.dev.vars`)

## 🎯 **The Three Environments**

### **1. Local Development (SQLite)**
**File**: `.env`  
**Used by**: Prisma commands only (`npm run db:*`)  
**Database**: `prisma/local.db` (SQLite file)  
**Purpose**: Schema development, seeding, Prisma Studio

```bash
# These commands use LOCAL SQLite
npm run db:seed      # Seeds local SQLite file
npm run db:studio    # Opens local SQLite in browser
npm run db:migrate   # Creates migrations from local schema
npx prisma generate  # Generates types from local schema
```

### **2. Preview/Dev Environment (D1 Preview)**
**File**: `.env.dev` + `wrangler.toml [env.dev]`  
**Used by**: `npm run dev` (Cloudflare Workers with D1 preview)  
**Database**: `store-database-preview` (Cloudflare D1)  
**Purpose**: Testing Workers + D1 integration before production

```bash
# This command uses D1 PREVIEW
npm run dev          # Starts worker connected to D1 preview
npm run db:seed:dev  # Seeds D1 preview database
```

### **3. Production Environment (D1 Production)**
**File**: `.env.production` + `wrangler.toml [env.production]`  
**Used by**: `npm run deploy`  
**Database**: `store-database` (Cloudflare D1)  
**Purpose**: Live production deployment

```bash
# These commands use D1 PRODUCTION  
npm run deploy          # Deploys to production
npm run db:seed:prod    # Seeds production database
```

## 📋 **Environment Summary**

| Environment | Database Type | Used By | Config Files |
|-------------|---------------|---------|--------------|
| **Local** | SQLite file | Prisma commands | `.env` |
| **Preview** | D1 database | `npm run dev` | `.env.dev` + `wrangler.toml[env.dev]` |
| **Production** | D1 database | `npm run deploy` | `.env.production` + `wrangler.toml[env.production]` |

## 🔧 **Why This Setup?**

### **Prisma Needs Local SQLite** 
- Prisma Studio works better with local files
- Seeding is faster on local SQLite
- Schema development is easier locally
- Migrations are generated from local schema

### **Wrangler Needs D1 for Testing**
- Tests the actual Cloudflare Workers environment
- Validates D1 adapter integration  
- Tests IP/domain whitelist (needs CF headers)
- Simulates production deployment

### **Deployment Needs Real D1**
- Production data in Cloudflare  
- Edge performance optimization
- Global distribution

## 🚀 **Development Workflow**

### **Daily Development**
```bash
# 1. Work on schema/seeding (uses LOCAL SQLite)
npm run db:migrate
npm run db:seed
npm run db:studio

# 2. Test the API (uses D1 PREVIEW) 
npm run dev
curl -H "Authorization: Bearer dev-local-token-123-secure" \
     http://localhost:8787/api/items
```

### **Deployment**
```bash
# 1. Apply schema to D1 preview
npm run db:migrate:dev
npm run db:seed:dev

# 2. Test preview deployment
npm run dev

# 3. Apply to production 
npm run db:migrate:prod
npm run db:seed:prod  

# 4. Deploy
npm run deploy
```

## ⚙️ **Configuration Details**

### **.env** (Local Prisma)
```env
DATABASE_URL="file:./local.db"           # SQLite file
ADMIN_EMAIL="eri@admice.com"             # Seeding config
ADMIN_NAME="Eri Admin"                   # Seeding config
DEV_TOKEN="dev-local-token-123-secure"   # Seeding config
```

### **.env.dev** (D1 Preview)
```env
DATABASE_URL="d1://store-database-preview"      # D1 database name
CLOUDFLARE_ACCOUNT_ID="42e3d2cd3c44df..."      # CF account
D1_DATABASE_ID="6a7a4053-7868-45a6-839d..."    # D1 database ID
```

### **wrangler.toml [env.dev]**
```toml
[[env.dev.d1_databases]]
binding = "DB"                           # Variable name in code
database_name = "store-database-preview" # D1 database name  
database_id = "6a7a4053-7868-45a6-839d-1bfa6c62f41c"  # D1 ID
```

## 🤝 **Why Both?**

**Prisma needs** the connection string format (`d1://database-name`)  
**Wrangler needs** the database binding configuration with IDs

They serve different purposes but point to the same databases!

## 🎯 **Quick Reference**

```bash
# Local SQLite operations
npm run db:seed          # ✅ Uses .env
npm run db:studio        # ✅ Uses .env  

# D1 Preview operations  
npm run dev              # ✅ Uses .env.dev + wrangler.toml[env.dev]
npm run db:seed:dev      # ✅ Uses wrangler D1 commands

# D1 Production operations
npm run deploy           # ✅ Uses .env.production + wrangler.toml[env.production]  
npm run db:seed:prod     # ✅ Uses wrangler D1 commands
```

This setup gives us the **best of both worlds**: fast local development with Prisma + realistic cloud testing with D1! 🚀