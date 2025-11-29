<div align="center">

<img src="assets/logo.svg" alt="Store Logo" width="120" height="120">

# Store

**Serverless inventory management on Cloudflare's edge**

Built with Hono + React 19 • Deployed on Cloudflare Workers

[![Version](https://img.shields.io/badge/version-2.0.0-blue)](https://github.com/erimeilis/store)
[![Deployed on Cloudflare Workers](https://img.shields.io/badge/Deployed%20on-Cloudflare%20Workers-F38020?logo=cloudflare&logoColor=white)](https://workers.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

---

## Why I Built This

We have a company. We sell our own stuff, but also resell products from various providers. Some of these providers have normal APIs, but most just give us Excel files. Every damn time.

Someone had to manually load these XLS files into our billing system. It was a mess - inconsistent formats, human errors, no way to track what's in stock.

So I built Store. It's basically a "provider for providers" - a unified place where managers can add, edit, and track products from any source. Meanwhile, I just hit the API from our billing system and everything syncs automatically.

The best part? It runs on Cloudflare Workers. No servers to rent. No DevOps guy to hire. Just deploy and forget.

---

## 🏗️ Architecture

- **🔧 Backend API** (TypeScript/Hono): RESTful API with OpenAPI documentation
- **🎨 Frontend** (React 19 SSR): Dashboard with server-side rendering

---

## 🛠️ Tech Stack

**Backend:** Hono • TypeScript 5 • Zod OpenAPI • Prisma ORM

**Frontend:** React 19 SSR • Tailwind CSS v4 • DaisyUI 5 • Zustand

**Authentication:** Google OAuth • API Tokens with permissions

**Database & Storage:** Cloudflare D1 (SQLite) • Cloudflare R2 • Cloudflare KV

**Deployment:** Cloudflare Workers

---

## 🚀 Quick Start

### 📋 Prerequisites

- 🟢 Node.js 20+
- 🔧 Wrangler CLI (`npm install -g wrangler`)
- ☁️ Cloudflare account

### ⚡ Installation

```bash
git clone git@github.com:erimeilis/store.git
cd store
npm install && cd frontend && npm install && cd ..
```

### 💻 Local Development

```bash
npm run dev:fullstack:local
```

This starts both workers with:
- 🎨 **Frontend**: http://localhost:5173
- 🔧 **Backend API**: http://localhost:8787
- 💾 **Local D1 Database**: `.wrangler/state/`

The script automatically:
- 🔍 Checks and kills any processes on ports 5173 and 8787
- 🚀 Starts both workers with shared database
- 📊 Shows logs from both services

Press `Ctrl+C` to stop both services.

### 🚀 Deployment

```bash
npm run deploy:fullstack
```

---

## ⚙️ Initial Configuration

Before first deployment, set up Cloudflare resources:

1. **Create D1 database**:
   ```bash
   wrangler d1 create store-database
   ```
   Copy the database ID to `wrangler.toml` files.

2. **Create R2 bucket** (for file storage):
   ```bash
   wrangler r2 bucket create store-bucket
   ```

3. **Create KV namespace** (for cache):
   ```bash
   wrangler kv:namespace create CACHE
   ```

4. **Run migrations**:
   ```bash
   npm run db:reset:local      # For local development
   npm run db:reset:preview    # For preview environment
   npm run db:reset:production # For production
   ```

5. **Set secrets**:
   ```bash
   cd frontend
   wrangler secret put GOOGLE_CLIENT_ID
   wrangler secret put GOOGLE_CLIENT_SECRET
   wrangler secret put FRONTEND_ACCESS_TOKEN
   ```

---

## 🔧 Commands

### 💻 Development

```bash
npm run dev:fullstack:local    # Local database
npm run dev:fullstack:preview  # Remote preview database
```

### 🚀 Deployment

```bash
npm run deploy                 # Deploy backend only
npm run deploy:frontend        # Deploy frontend only
npm run deploy:fullstack       # Deploy both
npm run deploy:dry-run         # Preview deployment
```

### 💾 Database Management

```bash
npm run db:reset:local         # Reset local D1
npm run db:reset:preview       # Reset preview D1
npm run db:reset:production    # Reset production D1
npm run db:seed:generate       # Generate test data
```

### 🔍 Quality

```bash
npm run build                  # Type check backend
npm run test                   # Run tests (Vitest)
npm run test:run               # Run tests once

cd frontend
npm run type-check             # Type check frontend
npm run lint                   # Run ESLint
npm run lint:fix               # Auto-fix lint issues
```

---

## ✨ Features

### 📊 Dynamic Tables
- ✅ Create any table structure on the fly
- ✅ 17 column types (text, number, date, boolean, email, url, phone, country, etc.)
- ✅ Column validation and constraints
- ✅ Required fields and default values

### 🛒 Sale Tables
- ✅ Protected `price` and `qty` columns
- ✅ Item purchasing workflow via API
- ✅ Sales transaction tracking
- ✅ Inventory management with audit trail

### 🏠 Rental Tables
- ✅ Protected `price`, `fee`, `used`, `available` columns
- ✅ Rental periods: hourly, daily, weekly, monthly, yearly
- ✅ Rent and release workflows via API
- ✅ Availability management

### 📥 Data Import
- ✅ Import from Excel (XLS, XLSX)
- ✅ Import from CSV
- ✅ Import from Google Sheets
- ✅ Column mapping with auto-detection
- ✅ Preview before import

### 🔐 Authentication & Authorization
- ✅ Google OAuth for dashboard
- ✅ API tokens with read/write permissions
- ✅ IP whitelist for tokens
- ✅ Domain restrictions
- ✅ Email-based access control

### 🔌 Public API
- ✅ RESTful API with OpenAPI/Swagger docs
- ✅ Bearer token authentication
- ✅ Public endpoints for integrations
- ✅ Purchase and rental operations

---

## 📡 API Endpoints

```bash
# Tables
GET    /api/tables                    # List all tables
POST   /api/tables                    # Create table
GET    /api/tables/:id                # Get table with columns
PUT    /api/tables/:id                # Update table
DELETE /api/tables/:id                # Delete table

# Columns
GET    /api/tables/:id/columns        # List columns
POST   /api/tables/:id/columns        # Add column
PATCH  /api/tables/:id/columns/:colId # Update column
DELETE /api/tables/:id/columns/:colId # Delete column

# Data
GET    /api/tables/:id/data           # List rows (paginated)
POST   /api/tables/:id/data           # Add row
PUT    /api/tables/:id/data/:rowId    # Update row
DELETE /api/tables/:id/data/:rowId    # Delete row

# Import
POST   /api/tables/:id/parse-import-file   # Parse XLS/CSV
POST   /api/tables/:id/parse-google-sheets # Parse Google Sheets
POST   /api/tables/:id/import-data         # Import with mapping

# Public (for integrations)
GET    /api/public/tables             # List public tables
GET    /api/public/tables/:id/items   # Get items
POST   /api/public/buy                # Purchase items
POST   /api/public/rent               # Rent items
POST   /api/public/release            # Release rented items

# Auth header
Authorization: Bearer YOUR_TOKEN
```

---

## 📁 Project Structure

```
/
├── 🔧 src/                    # Backend API
│   ├── routes/                # API route handlers
│   ├── services/              # Business logic layer
│   ├── repositories/          # Data access layer
│   ├── middleware/            # Auth & validation
│   ├── types/                 # TypeScript definitions
│   ├── validators/            # Zod schemas
│   ├── openapi/               # OpenAPI specs
│   └── utils/                 # Utility functions
├── 🎨 frontend/               # React SSR frontend
│   └── src/
│       ├── app/               # Page components
│       ├── components/        # UI components
│       ├── lib/               # Client utilities
│       └── types/             # Frontend types
├── 💾 prisma/                 # Database
│   └── migrations/            # D1 migrations
├── 🌱 seeds/                  # Test data generators
├── 📜 scripts/                # Build & deploy scripts
└── 🧪 test/                   # Test suites
```

---

## 🗄️ Database Schema

Migrations are located in `prisma/migrations/`:

| Migration | Description |
|-----------|-------------|
| 001_auth | Users, sessions, tokens, allowed emails |
| 002_dynamic_tables | User tables, columns, data |
| 004_commerce | Sales, inventory transactions, rentals |
| 005_ecommerce_settings | Product ID column, rental periods |
| 006_token_admin | Token metadata and permissions |

---

## 🔧 Troubleshooting

**Port conflicts**:
```bash
# Ports are automatically cleared by dev scripts, but if needed:
lsof -ti:5173 | xargs kill -9  # Frontend
lsof -ti:8787 | xargs kill -9  # Backend
```

**Database issues**:
```bash
npm run db:reset:local    # Clear and reset local database
```

**Clean rebuild**:
```bash
rm -rf node_modules frontend/node_modules
npm install && cd frontend && npm install
```

---

## 🗺️ Roadmap

- [ ] **Billing System** - Invoice generation, payment tracking, billing cycles
- [ ] Webhooks for external integrations
- [ ] Multi-tenant support
- [ ] Advanced analytics dashboard
- [ ] Bulk operations API

---

## 🙏 Acknowledgments

### ⚡ Core Technologies
- [Hono](https://hono.dev/) - Ultrafast web framework
- [Cloudflare Workers](https://workers.cloudflare.com/) - Serverless platform
- [Cloudflare D1](https://developers.cloudflare.com/d1/) - SQLite at the edge
- [React 19](https://react.dev/) - UI library

### 🛠️ Development Tools
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Prisma](https://www.prisma.io/) - Database ORM
- [Zod](https://zod.dev/) - Schema validation
- [Vitest](https://vitest.dev/) - Testing framework
- [esbuild](https://esbuild.github.io/) - Fast bundler

### 🎨 UI & Styling
- [Tailwind CSS v4](https://tailwindcss.com/) - Utility-first CSS
- [DaisyUI](https://daisyui.com/) - Component library
- [Tabler Icons](https://tabler.io/icons) - Icon set

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with 💙💛 using Hono and Cloudflare Workers
</p>
