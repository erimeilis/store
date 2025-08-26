# Local Development Guide

This guide explains how to run both the backend and frontend services locally for development and testing.

## Overview

The Store CRUD application consists of:
- **Backend**: Hono API running on Cloudflare Workers (Port 8787)
- **Frontend**: Next.js application with NextAuth (Port 3000)

## Quick Start

### Option 1: Run Both Services Simultaneously (Recommended)

```bash
# Install dependencies for both backend and frontend
npm install
cd frontend && npm install && cd ..

# Start both services with one command
npm run dev:fullstack
```

This will start:
- Backend API at: `http://localhost:8787`
- Frontend at: `http://localhost:3000`

### Option 2: Run Services Separately

**Terminal 1 - Backend:**
```bash
npm run dev:backend
```

**Terminal 2 - Frontend:**
```bash
npm run dev:frontend
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev:fullstack` | Start both backend and frontend services |
| `npm run dev:backend` | Start only the backend (Wrangler dev server) |
| `npm run dev:frontend` | Start only the frontend (Next.js dev server) |
| `npm run dev` | Start only the backend (same as dev:backend) |

## Service Details

### Backend Service (Port 8787)
- **Framework**: Hono
- **Runtime**: Cloudflare Workers (local)
- **Database**: D1 (SQLite-compatible, local mode)
- **Storage**: R2 (local mode)
- **Cache**: KV (local mode)

**Key Endpoints:**
- Health Check: `http://localhost:8787/health`
- API Base: `http://localhost:8787/api/`
- Items CRUD: `http://localhost:8787/api/items`
- File Upload: `http://localhost:8787/api/upload`

### Frontend Service (Port 3000)
- **Framework**: Next.js 15
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js with D1 adapter
- **Deployment**: OpenNext.js for Cloudflare

**Configuration:**
- API Base URL: `http://localhost:8787` (automatically configured)
- NextAuth URL: `http://localhost:3000`

## Troubleshooting

### Common Issues

#### 1. Port 8787 Already in Use
```bash
# Find and kill existing process
lsof -ti:8787 | xargs kill

# Then retry
npm run dev:fullstack
```

#### 2. Frontend Build Errors
```bash
# Clear Next.js cache and rebuild
cd frontend
rm -rf .next
npm run build
cd ..
npm run dev:fullstack
```

#### 3. Database Connection Issues
The backend uses local D1 database bindings. If you see database errors:
```bash
# Check if D1 is properly configured
wrangler d1 list

# Reset local database
rm -rf .wrangler/state
npm run dev:backend
```

#### 4. Missing Dependencies
```bash
# Reinstall all dependencies
npm install
cd frontend && npm install && cd ..
```

### Logs and Debugging

#### Backend Logs
Backend logs are displayed with `[BACKEND]` prefix in blue color when using `dev:fullstack`.

#### Frontend Logs  
Frontend logs are displayed with `[FRONTEND]` prefix in green color when using `dev:fullstack`.

#### Individual Service Logs
```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend
```

## Development Workflow

### 1. Initial Setup
```bash
# Clone and setup
git clone <repository-url>
cd store
npm install
cd frontend && npm install && cd ..
```

### 2. Start Development Environment
```bash
npm run dev:fullstack
```

### 3. Access Services
- Frontend: http://localhost:3000
- Backend API: http://localhost:8787
- Health Check: http://localhost:8787/health

### 4. Stop Services
Press `Ctrl+C` in the terminal running the services.

## API Testing

### Health Check
```bash
curl http://localhost:8787/health
```

### Get All Items
```bash
curl http://localhost:8787/api/items
```

### Create Item
```bash
curl -X POST http://localhost:8787/api/items \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Item","description":"Test Description"}'
```

## Frontend Testing

1. Open browser to `http://localhost:3000`
2. Test authentication flows
3. Test CRUD operations through the UI
4. Verify API integration

## Environment Variables

### Backend (.env or wrangler.toml)
```toml
NODE_ENV = "development"
GOOGLE_API_KEY = "your-api-key"
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8787
NEXTAUTH_SECRET=dev-secret-key
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-dev-google-client-id
GOOGLE_CLIENT_SECRET=your-dev-google-client-secret
```

## Development Features

### Hot Reload
- Backend: Automatic reload on file changes via Wrangler
- Frontend: Next.js fast refresh on React component changes

### Database
- Local SQLite database with D1 compatibility
- Automatic schema setup
- Persistent data across restarts

### File Upload
- Local R2 bucket simulation
- CSV/Excel file processing
- Bulk data operations

### Authentication
- NextAuth.js integration
- Local development configuration
- Session management with D1

## Production Considerations

When ready for production:
1. Update environment variables in Cloudflare dashboard
2. Configure actual Cloudflare resources (D1, R2, KV)
3. Deploy using `npm run deploy` (backend) and `cd frontend && npm run deploy` (frontend)

## Support

For issues:
1. Check the troubleshooting section above
2. Review logs for specific error messages
3. Ensure all dependencies are installed
4. Verify ports 3000 and 8787 are available
