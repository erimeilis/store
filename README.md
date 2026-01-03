<div align="center">

<img src="assets/logo.svg" alt="Store Logo" width="120" height="120">

# Store

**Serverless inventory management on Cloudflare's edge**

Built with Hono + Rust + React 19 • Deployed on Cloudflare Workers

[![Version](https://img.shields.io/badge/version-3.0.2-blue)](https://github.com/erimeilis/store)
[![Deployed on Cloudflare Workers](https://img.shields.io/badge/Deployed%20on-Cloudflare%20Workers-F38020?logo=cloudflare&logoColor=white)](https://workers.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

---

## Why I Built This

There was a company. It sold it's own stuff, but also reselled products from various providers. Some of these providers have normal APIs, but most just give Excel files. Every
damn time.

Someone had to manually load these XLS files into our billing system. It was a mess - inconsistent formats, human errors, no way to track what's in stock.

So I built Store. It's basically a "provider for providers" - a unified place where managers can add, edit, and track products from any source. Meanwhile, I just hit the API from
our billing system and everything syncs automatically.

The best part? It runs on Cloudflare Workers. No servers to rent. No DevOps guy to hire. Just deploy and forget.

Could this be another WooCommerce? Probably. But I didn't build it to compete with anyone - I built it because solving real problems is fun, and Cloudflare's edge platform is a joy to work with.

---

## 🏗️ Architecture

- **🔧 Backend API** (TypeScript/Hono): RESTful API with OpenAPI documentation
- **🦀 Public API** (Rust/worker-rs): High-performance public endpoints for external integrations
- **🎨 Frontend** (React 19 SSR): Dashboard with server-side rendering

---

## 🛠️ Tech Stack

**Backend API:** Hono • TypeScript 5 • Zod OpenAPI • Prisma ORM

**Public API:** Rust • worker-rs • serde • KV caching

**Frontend:** React 19 SSR • Tailwind CSS v4 • DaisyUI 5 • Zustand

**Authentication:** Google OAuth • API Tokens with permissions

**Database & Storage:** Cloudflare D1 (SQLite) • Cloudflare R2 • Cloudflare KV

**Deployment:** Cloudflare Workers (TypeScript + Rust via WASM)

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
npm run dev          # Local D1 database
npm run dev:remote   # Remote preview D1 database
```

This starts three workers with:

- 🎨 **Frontend**: http://localhost:5173
- 🔧 **Backend API**: http://localhost:8787
- 🦀 **Rust Public API**: http://localhost:8788
- 💾 **Database**: Local `.wrangler/state/` or remote preview D1

The script automatically:

- 🔄 Updates wrangler to latest version
- 🔍 Scans and loads modules
- ⚙️ Generates configuration files
- 🚀 Starts both workers with shared database

Press `Ctrl+C` to stop both services.

### 🚀 Deployment

```bash
npm run deploy              # Deploy all workers (backend, public-api, frontend)
npm run deploy:api          # Deploy backend API only
npm run deploy:public-api   # Deploy Rust public API only
npm run deploy:admin        # Deploy frontend only
```

---

## ⚙️ Initial Configuration

The deployment script handles everything automatically. Just configure `.env`:

1. **Copy environment template**:
   ```bash
   cp .env.example .env
   ```

2. **Set required values in `.env`**:
   ```env
   CLOUDFLARE_ACCOUNT_ID=your-account-id
   ZONE_NAME=yourdomain.com
   API_DOMAIN=api.yourdomain.com
   FRONTEND_DOMAIN=admin.yourdomain.com
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

3. **Deploy** (creates D1 databases, KV namespaces, applies migrations, seeds tokens, uploads secrets):
   ```bash
   wrangler login
   npm run deploy
   ```

That's it! The deploy script automatically:
- Creates D1 databases if they don't exist
- Ensures KV namespaces are configured
- Applies all database migrations
- Seeds authentication tokens
- Uploads secrets to Cloudflare
- Deploys all workers

First user to login becomes admin automatically.

---

## 🔧 Commands

### 💻 Development

```bash
npm run dev                    # Local D1 database
npm run dev:remote             # Remote preview D1 database
```

### 🚀 Deployment

```bash
npm run deploy              # Deploy all workers
npm run deploy:api          # Deploy backend API only
npm run deploy:public-api   # Deploy Rust public API only
npm run deploy:admin        # Deploy frontend only
```

### 💾 Database Management

```bash
tsx scripts/db-reset.ts local       # Reset local D1
tsx scripts/db-reset.ts preview     # Reset preview D1
tsx scripts/db-reset.ts production  # Reset production D1 (with confirmation)
```

### 🔍 Quality

```bash
npm run build                  # Type check backend
npm run test                   # Run tests (Vitest)
npm run test:run               # Run tests once

cd admin
npm run type-check             # Type check frontend
npm run lint                   # Run ESLint
npm run lint:fix               # Auto-fix lint issues
```

### 🧪 Performance Testing

```bash
# Flood tests for load testing
npx tsx scripts/flood-test.ts --preset=public --rps=50 --duration=10

# A/B comparison: Rust vs TypeScript
npx tsx scripts/ab-test.ts --env=local
npx tsx scripts/ab-test.ts --env=production
```

---

## ✨ Features

### 📊 Dynamic Tables

- ✅ Create any table structure on the fly
- ✅ 17+ column types (text, number, date, boolean, email, url, phone, country, etc.)
- ✅ Column validation and constraints
- ✅ Required fields and default values
- ✅ Inline editing with type-aware inputs
- ✅ Mass actions: delete, set column value (with validation)
- ✅ Table cloning with data

### 🧩 Module System

Extend Store with JSON-based modules - no code execution, just pure configuration:

- ✅ **Custom Column Types**: Define new column types with validation, formatting, and data sources
- ✅ **External API Integration**: Fetch entities from any external API (providers, catalogs, inventories)
  - Bearer, Basic, and custom header authentication
  - Response mapping with JSON path selectors
  - Configurable caching (5m to 7d)
  - Settings references for dynamic configuration
- ✅ **Table Generators**: Auto-generate tables with predefined schemas and fake data
- ✅ **Built-in Types**: Phone numbers, multiselect with grouped options, and more
- ✅ **KV Caching**: All external API responses are cached in Cloudflare KV
- ✅ **Admin UI**: Install, configure, and manage modules from the dashboard

**Example: Fetch products from external provider API**
```json
{
  "source": {
    "type": "api",
    "endpoint": "$settings.providerApiUrl/products",
    "auth": { "type": "bearer", "token": "$settings.apiToken" },
    "responseSchema": { "dataPath": "data.items" },
    "valueField": "sku",
    "labelField": "name",
    "cache": "1h"
  }
}
```

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
- ✅ Data validation with error reporting

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
- ✅ Search and filtering with pagination

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
POST   /api/tables/:id/data/mass      # Mass actions (delete, set_field_value)

# Validation
GET    /api/tables/:id/validate       # Validate all rows
DELETE /api/tables/:id/invalid-rows   # Delete invalid rows

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
├── 🔧 api/                    # Backend TypeScript API
│   ├── src/
│   │   ├── routes/            # API route handlers
│   │   ├── services/          # Business logic layer
│   │   ├── repositories/      # Data access layer
│   │   ├── middleware/        # Auth & validation
│   │   ├── types/             # TypeScript definitions
│   │   └── utils/             # Utility functions
│   ├── prisma/                # Database schema & migrations
│   └── wrangler.toml          # Backend deployment config
├── 🦀 public-api/             # Rust high-performance API
│   ├── src/                   # Rust source code
│   ├── Cargo.toml             # Rust dependencies
│   └── wrangler.toml          # Rust worker config
├── 🎨 admin/                  # React SSR frontend
│   └── src/
│       ├── app/               # Page components
│       ├── components/        # UI components
│       ├── handlers/          # SSR route handlers
│       └── lib/               # Client utilities
├── 🧩 modules/                # Extension modules (JSON)
├── 🌱 seeds/                  # Test data generators
├── 📜 scripts/                # Build, deploy & test scripts
│   ├── deploy.js              # Deployment orchestration
│   ├── flood-test.ts          # Load testing
│   └── ab-test.ts             # A/B performance comparison
└── 🧪 test/                   # Test suites
```

---

## 🗄️ Database Schema

Migrations are located in `prisma/migrations/`:

| Migration              | Description                             |
|------------------------|-----------------------------------------|
| 001_auth               | Users, sessions, tokens, allowed emails |
| 002_dynamic_tables     | User tables, columns, data              |
| 004_commerce           | Sales, inventory transactions, rentals  |
| 005_ecommerce_settings | Product ID column, rental periods       |
| 006_token_admin        | Token metadata and permissions          |
| 007_modules            | Installed modules tracking              |

---

## 🔧 Troubleshooting

**Port conflicts**:

```bash
# Ports are automatically cleared by dev scripts, but if needed:
lsof -ti:5173 | xargs kill -9  # Frontend
lsof -ti:8787 | xargs kill -9  # Backend
lsof -ti:8788 | xargs kill -9  # Rust public API
```

**Database issues**:

```bash
npm run db:reset:local    # Clear and reset local database
```

**Clean rebuild**:

```bash
rm -rf node_modules admin/node_modules
npm install && cd admin && npm install
```

**Rust worker build issues**:

```bash
cd public-api
worker-build --release   # Rebuild Rust worker
```

### 🔒 WAF Configuration

When deploying to production with Cloudflare WAF enabled, you may need to adjust security settings:

- **Rate Limiting**: Configure appropriate rate limits for API endpoints
- **Bot Protection**: Whitelist legitimate API consumers
- **Security Rules**: Review managed rules that may block legitimate API traffic
- **IP Access Rules**: Configure trusted IP ranges for monitoring/testing

> **Note**: WAF rules should be reviewed and adjusted based on your specific traffic patterns and security requirements.

---

## 🗺️ Roadmap

- [ ] **Billing System** - Invoice generation, payment tracking, billing cycles
- [ ] Webhooks for external integrations
- [ ] Advanced analytics dashboard
- [ ] Custom field validators via modules
- [ ] Export to Excel/CSV

---

## 🙏 Acknowledgments

### ⚡ Core Technologies

- [Hono](https://hono.dev/) - Ultrafast web framework
- [Rust](https://www.rust-lang.org/) - High-performance systems language
- [worker-rs](https://github.com/cloudflare/workers-rs) - Rust SDK for Cloudflare Workers
- [Cloudflare Workers](https://workers.cloudflare.com/) - Serverless platform
- [Cloudflare D1](https://developers.cloudflare.com/d1/) - SQLite at the edge
- [React 19](https://react.dev/) - UI library

### 🛠️ Development Tools

- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Prisma](https://www.prisma.io/) - Database ORM
- [Zod](https://zod.dev/) - Schema validation
- [Vitest](https://vitest.dev/) - Testing framework
- [esbuild](https://esbuild.github.io/) - Fast bundler
- [wasm-pack](https://rustwasm.github.io/wasm-pack/) - Rust to WASM toolchain

### 🎨 UI & Styling

- [Tailwind CSS v4](https://tailwindcss.com/) - Utility-first CSS
- [DaisyUI](https://daisyui.com/) - Component library
- [Tabler Icons](https://tabler.io/icons) - Icon set

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with 💙💛 using Hono, Rust, and Cloudflare Workers
</p>
