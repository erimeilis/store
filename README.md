# Store

A full-stack store management application with dynamic table creation, inventory tracking, and public sales functionality built on Cloudflare's edge platform.

## 🚀 Quick Start

```bash
# Clone and install
git clone git@github.com:erimeilis/store.git
cd store
npm install
cd frontend && npm install && cd ..

# Configure environment
cp .env.example .env
# Edit .env with your Cloudflare resource IDs and secrets

# Start development
npm run dev:fullstack:local

# Open browser
# Frontend: http://localhost:5173
# Backend API: http://localhost:8787
```

## 🏗️ Architecture

### Backend
- **Framework**: Hono (TypeScript web framework)
- **Database**: Cloudflare D1 (SQLite)
- **ORM**: Prisma Client
- **Storage**: Cloudflare R2
- **Cache**: Cloudflare KV
- **Deployment**: Cloudflare Workers
- **Authentication**: Bearer token system

### Frontend
- **Framework**: Hono + React SSR
- **Styling**: TailwindCSS + DaisyUI
- **Build**: ESBuild + PostCSS
- **Authentication**: Google OAuth
- **Deployment**: Cloudflare Workers

## ⚙️ Configuration

Single source of truth: all config is generated from `.env`

```
┌─────────────────────────────────────────────────────────────┐
│  .env (single source of truth - gitignored)                 │
│  ├── API_DOMAIN, FRONTEND_DOMAIN                            │
│  ├── D1, R2, KV IDs                                         │
│  ├── Google OAuth secrets                                   │
│  └── API tokens                                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
           ┌────────────────────────────────────┐
           │  npm run config:generate           │
           │  (runs automatically in dev/deploy)│
           └────────────────────────────────────┘
                            │
      ┌─────────────────────┼─────────────────────┐
      ▼                     ▼                     ▼
┌───────────┐    ┌──────────────────┐    ┌──────────────────┐
│wrangler   │    │frontend/wrangler │    │.dev.vars files   │
│.toml      │    │.toml             │    │(secrets for dev) │
└───────────┘    └──────────────────┘    └──────────────────┘
```

### Setup Steps

1. Copy `.env.example` to `.env`
2. Fill in your Cloudflare resource IDs (D1, KV, R2)
3. Add your domains (custom or `*.workers.dev`)
4. Add secrets (Google OAuth, API tokens)
5. Run `npm run config:generate` (or just start dev - it runs automatically)

### Environment Variables

| Variable | Description |
|----------|-------------|
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |
| `API_DOMAIN` | Backend domain (e.g., `api.example.com`) |
| `FRONTEND_DOMAIN` | Frontend domain (e.g., `store.example.com`) |
| `D1_DATABASE_ID` | Production D1 database ID |
| `D1_PREVIEW_DATABASE_ID` | Preview D1 database ID |
| `KV_NAMESPACE_ID` | Production KV namespace ID |
| `KV_PREVIEW_NAMESPACE_ID` | Preview KV namespace ID |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |

> **Note**: API tokens (`ADMIN_ACCESS_TOKEN`, `FRONTEND_ACCESS_TOKEN`) are managed automatically by the token-manager. Run `npm run db:reset:local` to generate tokens for development.

## 📦 Features

### Dynamic Tables System
- **User-Created Tables**: Create custom tables with flexible column definitions
- **Column Types**: text, number, date, boolean, email, url, textarea, country
- **Validation**: Required fields, duplicate checking, default values
- **Permissions**: Private, public, and shared visibility levels
- **Cloning**: Duplicate tables with data or schema only

### Inventory & Sales
- **For Sale Tables**: Special tables with protected `price` and `qty` columns
- **Inventory Tracking**: Automatic quantity management on sales
- **Public Sales**: Public API for purchasing items from "for sale" tables
- **Sales Analytics**: Dashboard with revenue tracking and insights

### Access Control
- **Token-Based API**: Read and full-access tokens with IP/domain whitelisting
- **Table Access Control**: Tokens can be assigned specific table permissions
- **Google OAuth**: Secure user authentication for dashboard
- **Allowed Emails**: Whitelist for user access control

## 🛠️ Development Commands

### Development
```bash
# Start both backend and frontend
npm run dev:fullstack:local      # Uses local database
npm run dev:fullstack:preview    # Uses remote preview database

# Start services individually
npm run dev:local                # Backend only (local DB)
npm run dev:preview              # Backend only (remote DB)
cd frontend && npm run dev       # Frontend only
```

### Testing & Quality
```bash
# Backend
npm run test             # Run backend tests (watch mode)
npm run test:run         # Run tests once
npm run build            # TypeScript type check

# Frontend
cd frontend
npm run type-check       # TypeScript check
npm run lint             # ESLint check
npm run lint:fix         # Auto-fix linting issues
```

### Database Management
```bash
# Reset databases (after schema changes)
npm run db:reset:local           # Local DB + seed data
npm run db:reset:preview         # Preview DB + seed data
npm run db:reset:production      # Production DB (requires confirmation)

# Generate Prisma client
npm run db:generate
```

### Deployment
```bash
npm run deploy              # Deploy backend
npm run deploy:frontend     # Deploy frontend
npm run deploy:fullstack    # Deploy both
```

## 📁 Project Structure

```
Store/
├── src/                      # Backend source code
│   ├── index.ts              # API entry point
│   ├── routes/               # API route handlers
│   ├── services/             # Business logic
│   ├── repositories/         # Database operations (Prisma)
│   ├── middleware/           # Authentication & validation
│   ├── types/                # TypeScript type definitions
│   └── utils/                # Helper functions
├── frontend/                 # Frontend application
│   ├── src/
│   │   ├── index.tsx         # SSR entry point
│   │   ├── client.tsx        # Client hydration
│   │   ├── app/              # Page components
│   │   ├── components/       # Reusable UI components
│   │   ├── handlers/         # Server-side handlers
│   │   ├── lib/              # Utility functions
│   │   └── types/            # Frontend types
│   └── wrangler.toml.template
├── prisma/
│   ├── schema.prisma         # Prisma schema
│   └── migrations/           # Database migrations
├── scripts/
│   ├── generate-config.js    # Config generator from .env
│   ├── deploy.js             # Deployment with secrets upload
│   ├── db-reset.ts           # Database reset script
│   ├── token-manager.ts      # Token generation and management
│   └── tokens/               # Generated tokens per environment
├── .env.example              # Environment template
├── wrangler.toml.template    # Backend config template
└── CLAUDE.md                 # Developer documentation
```

## 🔐 Authentication

### API Authentication
Bearer token system with two permission levels:
- **Read**: View-only access
- **Full**: Full read/write access

Tokens support:
- IP whitelisting
- Domain whitelisting
- Table-specific access control

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8787/api/items
```

### User Authentication
- Google OAuth for dashboard access
- Session management with secure cookies
- Email whitelist for access control

## 🌐 API Endpoints

### Tables API
- `GET /api/tables` - List user tables
- `POST /api/tables` - Create new table
- `GET /api/tables/:id` - Get table details
- `PUT /api/tables/:id` - Update table
- `DELETE /api/tables/:id` - Delete table
- `POST /api/tables/:id/clone` - Clone table

### Table Data API
- `GET /api/tables/:tableId/data` - List table data
- `POST /api/tables/:tableId/data` - Add data row
- `GET /api/tables/:tableId/data/:id` - Get data row
- `PUT /api/tables/:tableId/data/:id` - Update data row
- `DELETE /api/tables/:tableId/data/:id` - Delete data row
- `POST /api/tables/mass-action` - Bulk operations (with selectAll support)

### Public Sales API
- `GET /api/public/tables` - List public "for sale" tables
- `GET /api/public/tables/:tableId/items` - List items for sale
- `POST /api/public/purchase` - Purchase an item

### Token Management API
- `GET /api/tokens` - List tokens
- `POST /api/tokens` - Create token
- `PUT /api/tokens/:id` - Update token
- `DELETE /api/tokens/:id` - Delete token

### Health Check
- `GET /health` - API health status

## 📊 Database Schema

### Core Tables
- **users**: Google OAuth user accounts
- **sessions**: User authentication sessions
- **tokens**: API access tokens with permissions
- **allowed_emails**: Email whitelist for user access

### Dynamic Tables System
- **user_tables**: Metadata for user-created tables
- **table_columns**: Column definitions
- **table_data**: Actual data storage (JSON format)
- **token_table_access**: Token-specific table permissions

## 🚨 Troubleshooting

### Port Conflicts
Development scripts automatically handle port conflicts:
- Backend: 8787
- Frontend: 5173

### Database Issues
```bash
# List all databases
wrangler d1 list

# Check table structure
wrangler d1 execute store-database-preview --env local \
  --command="SELECT name FROM sqlite_master WHERE type='table';"

# Reset database
npm run db:reset:local
```

### Config Issues
```bash
# Regenerate all config files
npm run config:generate

# Check generated config
cat wrangler.toml | grep -E "(API_URL|FRONTEND_URL)"
```

### Clean Rebuild
```bash
rm -rf node_modules frontend/node_modules
npm install
cd frontend && npm install
```

## 📝 Development Guidelines

### Code Organization
- Use `@/` path aliases for imports
- Place types in `src/types/` or `frontend/src/types/`
- Follow SOLID principles
- Extract common functionality into utilities

### Database Changes
1. Create Prisma migration in `prisma/migrations/`
2. Run `npm run db:reset:local` to apply locally
3. Test changes
4. Reset preview and production databases

### Type Safety
- All functions should have proper TypeScript types
- Use interfaces for complex data structures
- Avoid `any` type unless absolutely necessary

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

**Made with 💙💛 using Hono, React, and Cloudflare Workers**
