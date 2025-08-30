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
npm run dev:fullstack          # Local SQLite + frontend
npm run dev:fullstack:remote   # Remote D1 + frontend
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

## 🗄️ Database

**Models:** Users, Sessions, Tokens, Items, Tables, AllowedEmails  
**Environments:** Local SQLite, D1 Preview, D1 Production  
**Data:** 205 realistic e-commerce items with categories, pricing, inventory

```bash
# View seeded data
sqlite3 prisma/local.db "SELECT COUNT(*) FROM items;"
sqlite3 prisma/local.db "SELECT DISTINCT JSON_EXTRACT(data, '$.category') FROM items;"
```

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

## 📄 License

MIT License - see LICENSE file for details