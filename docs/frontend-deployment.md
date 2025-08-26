# Frontend Deployment Guide

This document provides instructions for deploying the Next.js frontend to Cloudflare Workers using OpenNext.js.

## Deployment Status

✅ **Successfully Deployed**: https://store-crud-frontend.eri-42e.workers.dev

## Prerequisites

- OpenNext.js Cloudflare adapter installed
- Proper wrangler.toml configuration
- Valid open-next.config.ts file
- Environment variables configured

## Deployment Configuration

### 1. Required Files

#### `wrangler.toml`
```toml
name = "store-crud-frontend"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]
main = ".open-next/worker.js"

[build]
command = "npx @opennextjs/cloudflare build"

[[d1_databases]]
binding = "DB"
database_name = "store-database"
database_id = "a293b988-9b67-4430-ad66-6d63e3cebf20"

[env.production.vars]
NODE_ENV = "production"
NEXT_PUBLIC_API_BASE_URL = "https://store-crud-api.eri-42e.workers.dev"
NEXTAUTH_SECRET = "your-secret-key-change-this-in-production"
NEXTAUTH_URL = "https://store-crud-frontend.eri-42e.workers.dev"
GOOGLE_CLIENT_ID = "your-google-client-id"
GOOGLE_CLIENT_SECRET = "your-google-client-secret"
```

#### `open-next.config.ts`
```typescript
import type { OpenNextConfig } from '@opennextjs/cloudflare'

const config: OpenNextConfig = {
  default: {
    override: {
      wrapper: "cloudflare-node",
      converter: "edge",
      proxyExternalRequest: "fetch",
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "dummy",
    },
  },
  edgeExternals: ["node:crypto"],
  middleware: {
    external: true,
    override: {
      wrapper: "cloudflare-edge",
      converter: "edge",
      proxyExternalRequest: "fetch",
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "dummy",
    },
  },
}

export default config
```

### 2. Package Dependencies

Required packages installed:
```json
{
  "dependencies": {
    "@auth/d1-adapter": "^1.10.0",
    "next": "15.3.3",
    "next-auth": "^4.24.11",
    "react": "^18",
    "react-dom": "^18"
  },
  "devDependencies": {
    "@opennextjs/cloudflare": "^1.6.5"
  }
}
```

### 3. Authentication Configuration

The frontend includes:
- NextAuth.js v4 with D1 adapter integration
- Google OAuth provider configured
- JWT and database session strategies
- Proper TypeScript compatibility fixes

## Deployment Process

### 1. Build and Deploy Command

```bash
npm run deploy
```

This command:
1. Builds the Next.js application (`npm run build`)
2. Runs OpenNext.js Cloudflare adapter (`npx @opennextjs/cloudflare build`)
3. Deploys to Cloudflare Workers (`wrangler deploy`)

### 2. Deployment Process Steps

1. **Next.js Build**: Creates optimized production build
2. **OpenNext.js Processing**: Converts Next.js app to Cloudflare Worker
3. **Bundle Generation**: Creates `.open-next/worker.js`
4. **Worker Upload**: Uploads to Cloudflare Workers (4225.44 KiB / gzip: 889.08 KiB)
5. **Binding Configuration**: Connects D1 database

### 3. Key Configuration Details

- **Compatibility Date**: `2024-09-23` (required for Node.js modules)
- **Compatibility Flags**: `["nodejs_compat"]` (enables Node.js built-in modules)
- **Worker Startup Time**: ~20ms
- **D1 Database**: Properly bound as `DB` environment variable

## Verification

### 1. Deployment Verification

✅ Frontend URL: https://store-crud-frontend.eri-42e.workers.dev
✅ Status: HTTP 200 OK
✅ OpenNext.js: Active (X-OpenNext: 1 header)
✅ Next.js: Running (X-Powered-By: Next.js header)
✅ Caching: Enabled (X-NextJS-Cache headers)

### 2. Authentication Testing

✅ NextAuth API endpoints are accessible
✅ Authentication routes respond properly
✅ D1 database integration configured

## Environment Variables

### Production Environment

Set these in Cloudflare Dashboard for security:

```bash
NEXTAUTH_SECRET="your-secure-secret-key"
NEXTAUTH_URL="https://store-crud-frontend.eri-42e.workers.dev"
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"
NEXT_PUBLIC_API_BASE_URL="https://store-crud-api.eri-42e.workers.dev"
```

### Google OAuth Configuration

Ensure these redirect URIs are added to Google Cloud Console:
- Development: `http://localhost:3000/api/auth/callback/google`
- Production: `https://store-crud-frontend.eri-42e.workers.dev/api/auth/callback/google`

## Troubleshooting

### Common Issues Fixed

1. **TypeScript Errors**: Fixed D1Database type declarations with `any` type
2. **Session User Errors**: Added proper null checks for session.user
3. **OpenNext.js Config**: Created proper configuration structure
4. **Node.js Compatibility**: Added nodejs_compat flag and updated compatibility date
5. **Child Process Errors**: Resolved with compatibility date 2024-09-23

### Build Logs Location

Wrangler logs are saved to: `/Users/[username]/Library/Preferences/.wrangler/logs/`

## Success Metrics

- ✅ Build Time: ~13.5 seconds
- ✅ Bundle Size: 4.2MB (889KB gzipped)
- ✅ Worker Startup: 20ms
- ✅ All TypeScript errors resolved
- ✅ Authentication endpoints functional
- ✅ D1 database properly bound

## Next Steps

1. Update Google OAuth redirect URLs in production
2. Set secure environment variables in Cloudflare Dashboard
3. Test full authentication flow with Google OAuth
4. Configure custom domain (optional)
5. Set up monitoring and analytics

---

**Deployment Date**: August 26, 2025
**Status**: ✅ Successfully Deployed
**URL**: https://store-crud-frontend.eri-42e.workers.dev
