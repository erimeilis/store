# Store

A full-stack store management application built with **Hono**, **React**, and **Cloudflare infrastructure**.

## 🏗️ Architecture

**Backend:** Hono + Prisma + Cloudflare D1 + R2 + KV
**Frontend:** React SSR + TailwindCSS + DaisyUI
**Deployment:** Cloudflare Workers

## 🚀 Quick Start

```bash
git clone git@github.com:erimeilis/store.git
cd store
npm install
cd frontend && npm install && cd ..
npm run db:reset:local
npm run dev:fullstack:local
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
└── scripts/                # Development & database scripts
```

## 🧑‍💻 Development

**Start development servers:**

```bash
npm run dev:fullstack:local     # Local D1 + frontend
npm run dev:fullstack:preview   # Remote preview D1 + frontend
```

**Testing:**

```bash
npm run test          # Backend tests (watch mode)
npm run test:run      # Run tests once
npm run build         # TypeScript check
```

## 📦 Deployment

```bash
npm run deploy:fullstack    # Deploy backend + frontend
npm run deploy              # Backend only
npm run deploy:frontend     # Frontend only
```

## 🗄️ Database Management

### Database Reset & Seeding

```bash
npm run db:reset:local       # Reset local D1 database
npm run db:reset:preview     # Reset preview D1 database
npm run db:reset:production  # Reset production D1 (requires confirmation)
npm run db:generate          # Generate Prisma client
```

## 🔐 Authentication

**Google OAuth** + **API Bearer Tokens**

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8787/api/items
```

## 🌐 API Endpoints

- `GET /api/items` - List all items
- `POST /api/items` - Create item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item
- `GET /api/tables` - List dynamic tables
- `GET /api/tables/:id/data` - List table data
- `GET /health` - Health check

## 🔧 Troubleshooting

**Port conflicts:** Dev scripts auto-kill processes on ports 8787 and 5173.

**Database issues:**
```bash
wrangler d1 list    # List D1 databases
```

---

**Made with 💙💛 using Hono, React, and Cloudflare Workers**
