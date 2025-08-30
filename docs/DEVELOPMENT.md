# Development Guide

## 🚀 Quick Start

### Installation
```bash
git clone <repository-url>
cd Store
npm install
cd frontend && npm install && cd ..
```

### Database Setup
```bash
npm run db:migrate    # Create local database
npm run db:seed       # Add test data (205 items)
npm run db:studio     # View data (optional)
```

### Start Development
```bash
npm run dev:fullstack          # Local SQLite + frontend
npm run dev:fullstack:remote   # Remote D1 + frontend
```

**URLs:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8787
- Health Check: http://localhost:8787/health

## 🧪 Testing & Quality

```bash
npm run test          # Backend tests
npm run build         # TypeScript check
cd frontend
npm run lint          # Frontend linting
npm run type-check    # Frontend TypeScript
```

## 🗄️ Database Commands

```bash
# Local SQLite (development)
npm run db:generate   # Update Prisma client
npm run db:migrate    # Apply schema changes
npm run db:seed       # Add test data
npm run db:studio     # Visual database browser
npm run db:reset      # Reset and re-migrate

# D1 Preview (staging)
npm run db:seed:dev   # Seed preview database

# D1 Production
npm run db:seed:prod  # Seed production database
```

## 🔐 Authentication Setup

Create `frontend/.dev.vars`:
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FRONTEND_ACCESS_TOKEN=35890e45a5122de41a406cdaa290e711404c1292205b6ad4a10514228df378ce
```

## 🐛 Troubleshooting

**Port conflicts:**
```bash
lsof -ti:8787 | xargs kill -9  # Backend
lsof -ti:5173 | xargs kill -9  # Frontend
```

**Database issues:**
```bash
wrangler d1 list                           # List D1 databases
npm run db:push                            # Sync schema to local
rm -rf node_modules && npm install         # Clean install
```

## 📱 API Testing

```bash
# Health check
curl http://localhost:8787/health

# Get items (requires token)
curl -H "Authorization: Bearer 35890e45a5122de41a406cdaa290e711404c1292205b6ad4a10514228df378ce" \
     http://localhost:8787/api/items
```