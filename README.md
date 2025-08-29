# Store CRUD Application

A full-stack store management application built with **Hono**, **React**, and **Cloudflare infrastructure**.

## 🏗️ Architecture

### Backend (API Server)
- **Framework**: Hono (TypeScript web framework)
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2 (Object Storage)
- **Cache**: Cloudflare KV (Key-Value Store)  
- **Deployment**: Cloudflare Workers

### Frontend (React SSR)
- **Framework**: Hono + React (Server-Side Rendering)
- **Styling**: TailwindCSS + DaisyUI
- **Build**: Wrangler (Cloudflare Workers)
- **Deployment**: Cloudflare Workers

## 📁 Project Structure

```
Store/
├── src/                          # Backend API source
│   ├── index.ts                  # Main API server
│   └── types/                    # TypeScript definitions
├── frontend/                     # Frontend application
│   ├── src/
│   │   ├── index.tsx            # Frontend SSR server
│   │   ├── client.tsx           # Client-side entry
│   │   ├── pages/               # React pages
│   │   ├── components/          # React components
│   │   ├── lib/                 # Utilities & API client
│   │   └── styles/              # CSS styles
│   ├── wrangler.toml            # Frontend deployment config
│   └── package.json             # Frontend dependencies
├── wrangler.toml                # Backend deployment config
├── .dev.vars                    # Development secrets (not in git)
└── package.json                 # Backend dependencies
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Store
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Set up environment variables**
   
   Create `frontend/.dev.vars`:
   ```env
   # Google OAuth configuration
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   # Frontend access token (from D1 tokens table)
   FRONTEND_ACCESS_TOKEN=your-frontend-access-token
   ```

5. **Initialize database and create tokens table**
   ```bash
   # Create tokens table in development database
   wrangler d1 execute store-database-preview --env dev --command="CREATE TABLE IF NOT EXISTS tokens (id INTEGER PRIMARY KEY, token TEXT UNIQUE, name TEXT, type TEXT DEFAULT 'read', expires_at TEXT);"
   
   # Create tokens table in production database
   wrangler d1 execute store-database --env production --command="CREATE TABLE IF NOT EXISTS tokens (id INTEGER PRIMARY KEY, token TEXT UNIQUE, name TEXT, type TEXT DEFAULT 'read', expires_at TEXT);"
   
   # Generate and insert a frontend access token
   wrangler d1 execute store-database-preview --env dev --command="INSERT OR IGNORE INTO tokens (token, name, type) VALUES ('35890e45a5122de41a406cdaa290e711404c1292205b6ad4a10514228df378ce', 'Frontend Access Token', 'full');"
   
   wrangler d1 execute store-database --env production --command="INSERT OR IGNORE INTO tokens (token, name, type) VALUES ('35890e45a5122de41a406cdaa290e711404c1292205b6ad4a10514228df378ce', 'Frontend Access Token', 'full');"
   ```

## 🧑‍💻 Development

### Start Development Servers

**Option 1: Full-stack development (Recommended)**
```bash
npm run dev:fullstack
```
This starts both backend and frontend servers concurrently.

**Option 2: Separate servers**
```bash
# Terminal 1: Backend
npm run dev

# Terminal 2: Frontend  
cd frontend
npm run dev
```

**Option 3: Development with remote database**
```bash
npm run dev:fullstack:remote
```
Uses preview database with remote bindings.

### Development URLs
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8787  
- **API Health**: http://localhost:8787/health

## 🧪 Testing

### Backend Tests
```bash
npm run test        # Run tests in watch mode
npm run test:run    # Run tests once
```

### Type Checking
```bash
npm run build       # Backend TypeScript check
cd frontend
npm run type-check  # Frontend TypeScript check
```

### Linting
```bash
cd frontend
npm run lint        # Check linting
npm run lint:fix    # Fix linting issues
```

## 📦 Deployment

### Environment Configuration

The application uses **two environments**:

- **`dev`**: Development/preview resources
- **`production`**: Production resources

### Backend Deployment

**Deploy to production:**
```bash
npm run deploy
```

**Deploy backend only:**
```bash
npm run deploy:backend
```

### Frontend Deployment

**Deploy frontend only:**
```bash
npm run deploy:frontend
```

**Full-stack deployment:**
```bash
npm run deploy:fullstack
```

### Production Secrets Setup

Set production secrets using Wrangler:

```bash
# Frontend secrets (OAuth for Google authentication)
cd frontend
wrangler secret put GOOGLE_CLIENT_ID --env production
wrangler secret put GOOGLE_CLIENT_SECRET --env production
wrangler secret put FRONTEND_ACCESS_TOKEN --env production

# Backend secrets (if separate tokens needed)
cd ..
wrangler secret put FRONTEND_ACCESS_TOKEN --env production
```

**Important**: Secrets are entered interactively when you run these commands. The system will prompt you to paste the secret values securely.

## 🗄️ Database

### Schema Management

The application uses D1 SQLite database with the following key tables:

- **Items table**: Store inventory items (if implemented)
- **Tokens table**: API bearer token authentication with type-based permissions (read/full)

### Database Operations

**Execute SQL against development database:**
```bash
wrangler d1 execute store-database-preview --env dev --file=schema.sql
```

**Execute SQL against production database:**
```bash
wrangler d1 execute store-database --env production --file=schema.sql
```

**Query development database:**
```bash
wrangler d1 execute store-database-preview --env dev --command="SELECT * FROM items;"
```

## 🔐 Authentication

The application uses **Google OAuth** with custom session management:

1. **Google OAuth flow** handles user login
2. **Session cookies** store user state
3. **Bearer tokens** authenticate API requests

### API Authentication

API endpoints require bearer token authentication stored in the D1 tokens table:

```bash
curl -H "Authorization: Bearer your-token" \
     http://localhost:8787/api/items
```

**Token types (stored in D1 database):**
- **Full Access Token**: Read/write permissions (`type = 'full'`)
- **Read Only Token**: Read-only permissions (`type = 'read'`)

The frontend uses a full-access token to communicate with the backend API.

## 🌐 API Endpoints

### Items CRUD
- `GET /api/items` - List all items
- `GET /api/items/:id` - Get item by ID  
- `POST /api/items` - Create new item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### System
- `GET /health` - Health check
- `GET /` - API status

### Authentication  
- `GET /auth/google` - Start Google OAuth
- `GET /auth/callback/google` - OAuth callback
- `POST /auth/logout` - User logout

## 🛠️ Scripts Reference

### Root Scripts (Backend)
- `npm run dev` - Start backend development server
- `npm run dev:remote` - Start with remote database bindings
- `npm run dev:fullstack` - Start both backend and frontend
- `npm run dev:fullstack:remote` - Full-stack with remote database
- `npm run build` - TypeScript compilation check
- `npm run deploy` - Deploy to production
- `npm run test` - Run tests

### Frontend Scripts
- `npm run dev` - Start frontend development server (Wrangler)
- `npm run build` - Build and deploy to production (Wrangler)
- `npm run deploy` - Deploy to production (same as build)
- `npm run version` - Update build timestamp and production flag

## 🔧 Configuration

### Environments

**Development (`dev` environment):**
- Uses preview D1, R2, and KV resources
- Local development URLs
- Development secrets from `.dev.vars`

**Production (`production` environment):**  
- Uses production D1, R2, and KV resources
- Production URLs and domains
- Production secrets from Wrangler secrets

### CORS Configuration

- **Backend API**: Environment-configurable origins
- **Frontend**: Open CORS for static file serving

## 📋 Troubleshooting

### Common Issues

**Port conflicts:**
```bash
# Kill processes on ports
lsof -ti:8787 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

**Database connection issues:**
```bash
# Verify database exists
wrangler d1 list

# Check schema
wrangler d1 execute store-database-preview --env dev --command="SELECT name FROM sqlite_master WHERE type='table';"
```

**Build issues:**
```bash
# Clean and rebuild
rm -rf node_modules frontend/node_modules
npm install && cd frontend && npm install
```

## 🤝 Contributing

1. Create feature branch from `main`
2. Make changes following existing code style
3. Run tests and linting
4. Commit with descriptive messages
5. Create pull request

## 📄 License

MIT License - see LICENSE file for details