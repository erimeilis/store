# Store CRUD Application - Deployment Instructions

This document provides comprehensive step-by-step instructions for deploying the Store CRUD application to Cloudflare infrastructure.

## Prerequisites

Before deploying, ensure you have:

- **Node.js 18+** installed with npm
- **Cloudflare account** (free tier is sufficient for testing)
- **Wrangler CLI** installed globally: `npm install -g wrangler`
- **Git** for version control
- **Project dependencies** installed: `npm install`

## Quick Deployment Checklist

- [ ] 1. Cloudflare account setup and Wrangler authentication
- [ ] 2. Create D1 database and run schema migration
- [ ] 3. Create R2 bucket for file storage
- [ ] 4. Create KV namespace for caching
- [ ] 5. Configure wrangler.toml with resource IDs
- [ ] 6. Deploy backend API to Cloudflare Workers
- [ ] 7. Test backend API endpoints
- [ ] 8. Deploy frontend to Cloudflare Workers
- [ ] 9. Configure frontend API endpoints
- [ ] 10. End-to-end testing and verification

## Part 1: Cloudflare Account Setup

### 1.1 Authenticate Wrangler

```bash
# Login to Cloudflare via Wrangler
wrangler login

# Verify authentication
wrangler whoami
```

### 1.2 Set Default Account (if you have multiple)

```bash
# List available accounts
wrangler auth list

# Set default account ID (optional)
# Replace with your actual account ID
export CLOUDFLARE_ACCOUNT_ID="your-account-id-here"
```

## Part 2: Backend Infrastructure Setup

### 2.1 Create D1 Database

```bash
# Create the main database
wrangler d1 create store-database

# Expected output:
# Created D1 database 'store-database' with ID: xxxxx-xxxx-xxxx-xxxx-xxxxx
# Copy the database ID for wrangler.toml configuration
```

### 2.2 Create Database Schema

```bash
# Create the items table
wrangler d1 execute store-database --local --file=./schema.sql
```

Create `schema.sql` in the project root:

```sql
-- Create items table
CREATE TABLE items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  data JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX idx_items_name ON items(name);
CREATE INDEX idx_items_created_at ON items(created_at);

-- Insert sample data for testing
INSERT INTO items (name, description, data) VALUES 
  ('Sample Item 1', 'This is a test item', '{"category": "test", "priority": "high"}'),
  ('Sample Item 2', 'Another test item', '{"category": "demo", "priority": "medium"}');
```

Apply schema to both local and remote:

```bash
# Apply to local D1 (for development)
wrangler d1 execute store-database --local --file=./schema.sql

# Apply to remote D1 (for production)
wrangler d1 execute store-database --remote --file=./schema.sql
```

### 2.3 Create R2 Bucket

```bash
# Create R2 bucket for file uploads
wrangler r2 bucket create store-uploads

# Verify bucket creation
wrangler r2 bucket list
```

### 2.4 Create KV Namespace

```bash
# Create KV namespace for caching and sessions
wrangler kv:namespace create "KV"

# Expected output:
# Add the following to your wrangler.toml:
# [[kv_namespaces]]
# binding = "KV"
# id = "xxxxx-xxxx-xxxx-xxxx-xxxxx"
```

### 2.5 Configure wrangler.toml

Update your `wrangler.toml` file with the resource IDs:

```toml
name = "store-crud-api"
main = "src/index.ts"
compatibility_date = "2024-08-25"
compatibility_flags = ["nodejs_compat"]

# D1 Database Configuration
[[d1_databases]]
binding = "DB"
database_name = "store-database"
database_id = "YOUR_D1_DATABASE_ID_HERE"  # Replace with actual ID from step 2.1

# R2 Bucket Configuration
[[r2_buckets]]
binding = "BUCKET"
bucket_name = "store-uploads"
preview_bucket_name = "store-uploads"

# KV Namespace Configuration
[[kv_namespaces]]
binding = "KV"
id = "YOUR_KV_NAMESPACE_ID_HERE"  # Replace with actual ID from step 2.4
preview_id = "YOUR_KV_NAMESPACE_ID_HERE"

# Environment Variables
[vars]
ENVIRONMENT = "production"
API_VERSION = "1.0.0"
# Add Google API key if using Google Sheets integration
# GOOGLE_API_KEY = "your-google-api-key-here"

# Build configuration
[build]
command = "npm run build"
```

## Part 3: Backend Deployment

### 3.1 Test Locally First

```bash
# Start local development server
npm run dev

# Test in another terminal
curl http://localhost:8787/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-08-25T18:56:00.000Z",
  "version": "1.0.0",
  "environment": "development"
}
```

### 3.2 Run Tests

```bash
# Run the comprehensive test suite
npm run test:run

# Expected: All tests should pass
# ✓ Health check endpoint
# ✓ GET /api/items 
# ✓ POST /api/items
# ✓ PUT /api/items/:id
# ✓ DELETE /api/items/:id
# ✓ File upload functionality
# ✓ Error handling scenarios
```

### 3.3 Deploy Backend to Production

```bash
# Deploy to Cloudflare Workers
wrangler deploy

# Expected output:
# Uploaded store-crud-api (X.XX sec)
# Published store-crud-api (X.X sec)
#   https://store-crud-api.your-subdomain.workers.dev
```

### 3.4 Test Production Backend

```bash
# Test health endpoint
curl https://store-crud-api.your-subdomain.workers.dev/health

# Test items endpoint
curl https://store-crud-api.your-subdomain.workers.dev/api/items

# Test creating an item
curl -X POST https://store-crud-api.your-subdomain.workers.dev/api/items \
  -H "Content-Type: application/json" \
  -d '{"name": "Production Test", "description": "Testing production deployment"}'
```

## Part 4: Frontend Deployment

### 4.1 Install OpenNext.js Cloudflare Adapter

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies if not already installed
npm install

# Install OpenNext.js Cloudflare adapter
npm install @opennextjs/cloudflare
```

### 4.2 Configure Frontend for Production

Update `frontend/next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NODE_ENV === 'production' 
      ? 'https://store-crud-api.your-subdomain.workers.dev'
      : 'http://localhost:8787'
  }
}

module.exports = nextConfig
```

### 4.3 Build and Deploy Frontend to Cloudflare Workers

Navigate to the frontend directory:

```bash
cd frontend
```

Build and deploy using the new Workers approach:

```bash
# Install dependencies if needed
npm install

# Build and deploy to production
npm run deploy

# Or deploy to development environment
npm run deploy:dev
```

Manual deployment steps:

```bash
# Build the Next.js application for static export
npm run build

# Deploy the frontend Workers manually
wrangler deploy
```

### 4.4 Local Development with Workers

For local development with Workers:

```bash
# Start local Workers development server
npm run wrangler:dev

# Or use wrangler directly
wrangler dev --local
```

The frontend will be available at the URL shown in the terminal (typically `http://localhost:8787`).

### 4.5 Configure Custom Domain (Optional)

```bash
# Add custom domain to Workers project
wrangler route add store-crud-frontend.yourdomain.com store-crud-frontend

# Or set up via Cloudflare Dashboard:
# 1. Go to Workers & Pages > store-crud-frontend > Settings > Domains
# 2. Add custom domain
```

## Part 5: Production Configuration

### 5.1 Environment Variables

Set production environment variables:

```bash
# For backend (in wrangler.toml [vars] section)
ENVIRONMENT = "production"
API_VERSION = "1.0.0"
GOOGLE_API_KEY = "your-google-api-key-if-needed"

# For frontend (in wrangler.toml [env.production.vars] section)
NEXT_PUBLIC_API_BASE_URL = "https://store-crud-api.your-subdomain.workers.dev"
```

### 5.2 CORS Configuration

Ensure CORS is properly configured for your frontend domain. The backend already includes CORS middleware, but you may need to update origins:

```typescript
// In src/index.ts, update CORS configuration if needed
app.use('*', cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:8787',
    'https://store-crud-frontend.your-subdomain.workers.dev',
    'https://your-custom-domain.com'
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}))
```

## Part 6: Testing and Verification

### 6.1 End-to-End Testing Checklist

Test the following functionality in production:

- [ ] **Health Check**: `GET /health` returns proper status
- [ ] **List Items**: `GET /api/items` returns items array
- [ ] **Create Item**: `POST /api/items` creates new item
- [ ] **Update Item**: `PUT /api/items/:id` updates existing item
- [ ] **Delete Item**: `DELETE /api/items/:id` removes item
- [ ] **File Upload**: `POST /api/upload` processes CSV files
- [ ] **Frontend Interface**: All CRUD operations work via UI
- [ ] **File Upload UI**: Frontend file upload component works
- [ ] **Error Handling**: 404s and validation errors display properly

### 6.2 Performance Testing

```bash
# Test API performance with curl
time curl https://store-crud-api.your-subdomain.workers.dev/api/items

# Load test with multiple requests
for i in {1..10}; do
  curl -s https://store-crud-api.your-subdomain.workers.dev/health > /dev/null
done
```

### 6.3 Monitor Deployment

```bash
# View real-time logs
wrangler tail

# Check deployment status
wrangler deployments list
```

## Part 7: Troubleshooting

### Common Issues and Solutions

#### 7.1 Database Connection Issues

```bash
# Check D1 database status
wrangler d1 info store-database

# Test database connection
wrangler d1 execute store-database --command="SELECT COUNT(*) FROM items"
```

#### 7.2 R2 Bucket Access Issues

```bash
# List R2 buckets to verify access
wrangler r2 bucket list

# Test bucket permissions
wrangler r2 object list store-uploads
```

#### 7.3 Frontend API Connection Issues

- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check browser network tab for CORS errors
- Ensure backend CORS allows frontend domain

#### 7.4 Build Issues

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Rebuild TypeScript
npm run build
```

### 7.5 Wrangler Configuration Issues

```bash
# Validate wrangler.toml syntax
wrangler validate

# Check account access
wrangler whoami
```

## Part 8: Post-Deployment Tasks

### 8.1 Set Up Monitoring

- Configure Cloudflare Analytics
- Set up log monitoring with `wrangler tail`
- Monitor D1 usage in Cloudflare Dashboard

### 8.2 Security Hardening

- Add rate limiting for production
- Implement proper authentication
- Set up HTTPS redirects
- Configure CSP headers

### 8.3 Backup Strategy

```bash
# Regular database backups
wrangler d1 backup create store-database

# Export database to local file
wrangler d1 execute store-database --command="SELECT * FROM items" --json > backup.json
```

## Part 9: Development Workflow

### 9.1 Local Development

```bash
# Start backend locally
npm run dev

# Start frontend locally (in another terminal)
cd frontend
npm run dev
```

### 9.2 Making Changes

1. Make code changes
2. Test locally with `npm test`
3. Deploy backend: `wrangler deploy`
4. Deploy frontend: `cd frontend && npm run build && npx wrangler pages deploy out --project-name store-crud-frontend`

### 9.3 Rolling Back

```bash
# Rollback to previous deployment
wrangler rollback

# View deployment history
wrangler deployments list
```

---

## Summary

You now have a fully deployed Store CRUD application running on:

- **Backend API**: Cloudflare Workers with D1, R2, and KV
- **Frontend**: Cloudflare Pages with Next.js
- **Database**: Cloudflare D1 with proper schema
- **File Storage**: Cloudflare R2 for uploads
- **Caching**: Cloudflare KV for sessions

### Application URLs:
- **Backend API**: `https://store-crud-api.your-subdomain.workers.dev`
- **Frontend**: `https://store-crud-frontend.pages.dev`

### Key Features Deployed:
- ✅ Full CRUD operations for items
- ✅ File upload and CSV processing
- ✅ Google Sheets integration
- ✅ Modern React UI with TypeScript
- ✅ Comprehensive error handling
- ✅ Production-ready infrastructure

The application is now ready for production use and further development!

## 🎉 DEPLOYMENT COMPLETED SUCCESSFULLY

### Production URLs

**Backend API**: ✅ https://store-crud-api.eri-42e.workers.dev
- Status: Fully operational with D1 database integration
- Database: Successfully initialized with sample data
- Features: Complete CRUD operations, file upload, Google Sheets import

**Frontend Application**: ✅ https://1ffe9432.store-crud-frontend.pages.dev  
- Status: Successfully deployed to Cloudflare Pages
- Configuration: Built with production API endpoint
- Features: Full React UI with CRUD interface, file upload, and data management

### Deployment Summary

✅ **Backend Infrastructure**
- Cloudflare Workers: Deployed successfully
- D1 Database: Created and initialized with schema + sample data
- R2 Bucket: Created for file storage (store-uploads)
- KV Namespace: Created for caching

✅ **Frontend Deployment**
- Next.js Application: Built and deployed to Cloudflare Pages
- Static Export: Optimized for edge delivery
- API Integration: Configured for production backend

### Test Results

✅ Backend API endpoints tested and working:
- Health check: https://store-crud-api.eri-42e.workers.dev/
- Items API: https://store-crud-api.eri-42e.workers.dev/api/items
- Sample data: 2 items successfully loaded

✅ Frontend deployed and accessible at production URL

---

*Last updated: August 25, 2025 - DEPLOYMENT COMPLETED*
