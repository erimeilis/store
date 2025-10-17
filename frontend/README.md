# Store CRUD Application

A full-stack store management application with dynamic table creation, inventory tracking, and public sales functionality built on Cloudflare's edge platform.

## 🚀 Quick Start

```bash
# Install dependencies
npm install
cd frontend && npm install && cd ..

# Start development environment (recommended)
npm run dev:fullstack:preview    # With preview database
# OR
npm run dev:fullstack:local      # With local database

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
npm run dev:fullstack:preview    # Uses remote preview database
npm run dev:fullstack:local      # Uses local database

# Start services individually
npm run dev              # Backend only (local DB)
npm run dev:remote       # Backend only (remote DB)
cd frontend && npm run dev  # Frontend only
```

### Testing & Quality
```bash
# Backend
npm run test             # Run backend tests
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
tsx scripts/db-reset.ts local        # Local DB + seed data
tsx scripts/db-reset.ts preview      # Preview DB + seed data
tsx scripts/db-reset.ts production   # Production DB (requires confirmation)

# Execute SQL commands
wrangler d1 execute store-database-preview --env dev --command="SELECT * FROM users;"
```

### Deployment
```bash
npm run deploy              # Deploy backend
npm run deploy:frontend     # Deploy frontend
npm run deploy:fullstack    # Deploy both
```

## 🔧 Environment Setup

### Required Environment Variables

Create `.dev.vars` in project root:
```bash
FRONTEND_ACCESS_TOKEN=your-token-here
```

Create `frontend/.dev.vars`:
```bash
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
FRONTEND_ACCESS_TOKEN=your-token-here
```

### Database Migrations

All database schema changes are managed through Prisma migrations located in `prisma/migrations/`. After creating a new migration, reset all databases:

```bash
tsx scripts/db-reset.ts local
tsx scripts/db-reset.ts preview
tsx scripts/db-reset.ts production
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
│   └── wrangler.toml         # Frontend deployment config
├── prisma/
│   ├── schema.prisma         # Prisma schema
│   └── migrations/           # Database migrations
├── scripts/
│   └── db-reset.ts           # Database reset script
├── CLAUDE.md                 # Developer documentation
└── wrangler.toml             # Backend deployment config
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

### Public Sales API
- `GET /api/public/tables` - List public "for sale" tables
- `GET /api/public/tables/:tableId/items` - List items for sale
- `POST /api/public/purchase` - Purchase an item

### Token Management API
- `GET /api/tokens` - List tokens
- `POST /api/tokens` - Create token
- `PUT /api/tokens/:id` - Update token
- `DELETE /api/tokens/:id` - Delete token

## 🧪 Testing

The project uses Vitest for backend testing:

```bash
npm run test        # Run tests in watch mode
npm run test:run    # Run tests once
```

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

### Legacy
- **items**: Original demo items table

## 🚨 Troubleshooting

### Port Conflicts
Development scripts automatically handle port conflicts. Ports used:
- Backend: 8787
- Frontend: 5173

### Database Issues
```bash
# List all databases
wrangler d1 list

# Check table structure
wrangler d1 execute store-database-preview --env dev --command="SELECT name FROM sqlite_master WHERE type='table';"

# Reset database
tsx scripts/db-reset.ts local
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
2. Run `tsx scripts/db-reset.ts local` to apply locally
3. Test changes
4. Reset preview and production databases

### Type Safety
- All functions should have proper TypeScript types
- Use interfaces for complex data structures
- Avoid `any` type unless absolutely necessary

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This project will be open-sourced soon. License to be determined.
