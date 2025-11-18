# Store CRUD Application

A full-stack store management application built with **Hono**, **React**, and **Cloudflare infrastructure**.

## 🏗️ Architecture

**Backend:** Hono + Prisma + Cloudflare D1 + R2 + KV  
**Frontend:** React SSR + TailwindCSS + DaisyUI  
**Deployment:** Cloudflare Workers  
**Database:** 205 realistic items across 10+ categories

## 🚀 Quick Start

```bash
git clone <repository-url>
cd Store
npm install
cd frontend && npm install && cd ..
npm run db:migrate && npm run db:seed
npm run dev:fullstack
```

**URLs:**

- Frontend: http://localhost:5173
- Backend API: http://localhost:8787

## 📁 Project Structure

```
Store/
├── src/                    # Backend API (Hono)
├── frontend/               # Frontend (React SSR)
├── prisma/                 # Database schema & migrations
├── docs/                   # Documentation
└── scripts/                # Database seeding scripts
```

## 🧑‍💻 Development

**Start development servers:**

```bash
npm run dev:fullstack          # Local D1 + frontend
npm run dev:fullstack:remote   # Remote preview D1 + frontend
```

**Database commands:**

```bash
npm run db:seed       # Add 205 test items
npm run db:studio     # Visual database browser
npm run db:migrate    # Apply schema changes
```

**Testing:**

```bash
npm run test          # Backend tests
npm run build         # TypeScript check
```

## 📦 Deployment

```bash
npm run deploy:fullstack    # Deploy backend + frontend
npm run deploy:backend      # Backend only
npm run deploy:frontend     # Frontend only
```

**Set production secrets:**

```bash
cd frontend
wrangler secret put GOOGLE_CLIENT_ID --env production
wrangler secret put GOOGLE_CLIENT_SECRET --env production
wrangler secret put FRONTEND_ACCESS_TOKEN --env production
```

## 🗄️ Database Management

**Models:** Users, Sessions, Tokens, Items, Tables, AllowedEmails  
**Environments:** Local D1 (10 items), Preview D1 (100 items), Production D1 (200 items)

### Environment-Specific Reset & Seeding

**⚠️ IMPORTANT:** After any database schema or migration changes, you MUST reset all databases using these scripts:

```bash
# Reset individual environments  
node scripts/db-reset-local.js      # Reset local D1 + seed 10 items
node scripts/db-reset-preview.js    # Reset preview D1 + seed 100 items
node scripts/db-reset-production.js # Reset production D1 + seed 200 items (DANGEROUS!)
```

### Individual Seeding (without reset)

```bash
# Note: Local D1 starts empty and doesn't need seeding
# Items and tokens are created as needed during development
npx tsx scripts/seed-preview.sql   # Seed preview D1 with 100 items  
npx tsx scripts/seed-production.sql # Seed production D1 with 200 items
```

### Schema Management

```bash
npm run db:migrate           # Apply new migrations to local
npm run db:studio           # Visual database browser
npm run db:generate         # Generate Prisma client
```

### View Database Content

```bash
# Local D1 database (wrangler manages local state)
wrangler d1 execute store-database-preview --env dev --command="SELECT COUNT(*) FROM items;"
wrangler d1 execute store-database-preview --env dev --command="SELECT COUNT(*) FROM users;"

# Remote databases (D1)  
wrangler d1 execute store-database-preview --env dev --remote --command="SELECT COUNT(*) FROM items;"
wrangler d1 execute store-database --env production --remote --command="SELECT COUNT(*) FROM items;"
```

### Database Reset Safety

- **Local D1:** Safe to reset anytime (seeded with 10 test items)
- **Preview D1:** Safe to reset (test data, used for staging)
- **Production D1:** ⚠️ REQUIRES EXPLICIT CONFIRMATION - will delete all real data!

The production reset script requires typing "DELETE PRODUCTION DATA" exactly to proceed.

**Note:** Local D1 database is managed by Wrangler and gets seeded with 10 items for development.

## 🔐 Authentication

**Google OAuth** + **API Bearer Tokens**

**Frontend token:** `35890e45a5122de41a406cdaa290e711404c1292205b6ad4a10514228df378ce`

```bash
curl -H "Authorization: Bearer 35890e45a5122de41a406cdaa290e711404c1292205b6ad4a10514228df378ce" \
     http://localhost:8787/api/items
```

## 🌐 API Endpoints

- `GET /api/items` - List all items
- `POST /api/items` - Create item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item
- `GET /health` - Health check

## 📚 Documentation

- **[Development Guide](docs/DEVELOPMENT.md)** - Setup, testing, troubleshooting
- **[API Reference](docs/API.md)** - Complete API documentation
- **[Deployment Guide](docs/DEPLOYMENT_GUIDE.md)** - Production deployment
- **[Environment Setup](docs/ENVIRONMENTS.md)** - Multi-environment configuration
- **[Token Security](docs/TOKEN_SECURITY.md)** - Authentication system

## 🛠️ Scripts

**Development:**

- `npm run dev:fullstack` - Start both servers
- `npm run dev:fullstack:remote` - Use remote D1 database

**Database:**

- `npm run db:seed` - Add test data (205 items)
- `npm run db:studio` - Visual database browser
- `npm run db:migrate` - Apply schema changes

**Deployment:**

- `npm run deploy:fullstack` - Deploy everything
- `npm run deploy:backend` - Backend only
- `npm run deploy:frontend` - Frontend only

## 🔧 Troubleshooting

**Port conflicts:**

```bash
lsof -ti:8787 | xargs kill -9  # Backend
lsof -ti:5173 | xargs kill -9  # Frontend
```

**Database issues:**

```bash
wrangler d1 list              # List D1 databases
npm run db:push               # Sync schema
```

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Made with 💙💛 using Hono, React, and Cloudflare Workers**
