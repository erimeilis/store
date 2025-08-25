# Authentication Setup Guide

This document provides comprehensive instructions for setting up and configuring authentication in the Store CRUD application using NextAuth.js v5 with Google OAuth.

## Overview

The application uses:
- **NextAuth.js v5** (beta) for authentication
- **Google OAuth** as the primary authentication provider
- **JWT sessions** for stateless authentication
- **Route protection** via middleware and components
- **Server-side and client-side** authentication checks

## Prerequisites

- Google Cloud Console account
- Node.js 18+ with npm
- Next.js 14+ application (already configured)

## Google OAuth Setup

### 1. Create Google OAuth Credentials

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Select or Create a Project**:
   - Click the project dropdown at the top
   - Select existing project or click "New Project"
   - Enter project name: "Store CRUD App"

3. **Enable Google+ API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google+ API" 
   - Click "Enable"

4. **Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Configure the OAuth consent screen if prompted:
     - User Type: External (for testing) or Internal (for organization)
     - App name: "Store CRUD Dashboard"
     - User support email: your email
     - Developer contact: your email

5. **Configure OAuth Client**:
   - Application type: "Web application"
   - Name: "Store CRUD Frontend"
   - Authorized JavaScript origins:
     - Development: `http://localhost:3000`
     - Production: `https://your-domain.com`
   - Authorized redirect URIs:
     - Development: `http://localhost:3000/api/auth/callback/google`
     - Production: `https://your-domain.com/api/auth/callback/google`

6. **Copy Credentials**:
   - Save the "Client ID" and "Client Secret"
   - You'll need these for environment variables

### 2. Test Users (for Development)

If using External OAuth app type:
- Go to "APIs & Services" > "OAuth consent screen"
- Scroll to "Test users"
- Add email addresses that can test the app
- Production apps need to go through verification process

## Environment Configuration

### 1. Create Environment File

Copy the example file and configure:

```bash
cd frontend
cp .env.local.example .env.local
```

### 2. Configure Environment Variables

Edit `.env.local` with your credentials:

```bash
# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-jwt-secret-here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=123456789-abcdef.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-google-client-secret

# Production URLs (update for deployment)
# NEXTAUTH_URL=https://your-domain.com
```

### 3. Generate NEXTAUTH_SECRET

Generate a secure secret for JWT signing:

```bash
# Option 1: Using OpenSSL
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Online generator
# Visit: https://generate-secret.vercel.app/32
```

## Application Configuration

### 1. Authentication Files Structure

```
frontend/src/
├── lib/
│   └── auth.ts                 # NextAuth.js configuration
├── components/
│   ├── AuthButton.tsx          # Sign in/out button
│   ├── SessionProvider.tsx     # Session context provider
│   └── ProtectedRoute.tsx      # Route protection component
├── app/
│   ├── layout.tsx              # Root layout with session provider
│   ├── page.tsx                # Protected dashboard
│   └── api/auth/[...nextauth]/
│       └── route.ts            # NextAuth.js API routes
└── middleware.ts               # Route protection middleware
```

### 2. Authentication Configuration Details

#### NextAuth.js Config (`src/lib/auth.ts`)
- **Provider**: Google OAuth with client credentials
- **Session Strategy**: JWT (stateless)
- **Callbacks**: Custom authorization, JWT, and session handling
- **Pages**: Custom sign-in and error pages
- **Trust Host**: Enabled for deployment flexibility

#### Middleware (`middleware.ts`)
- **Route Matching**: Protects all routes except API, static files, and favicon
- **Authorization**: Uses NextAuth.js auth function
- **Redirect**: Automatic redirect to sign-in for unauthenticated users

#### Session Provider (`components/SessionProvider.tsx`)
- **Wrapper**: NextAuth SessionProvider wrapper
- **Context**: Provides authentication state to all components
- **Client-side**: Manages session on client side

## Protected Routes Implementation

### 1. Automatic Route Protection

The middleware automatically protects all routes. Users are redirected to sign-in if not authenticated:

```typescript
// middleware.ts
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
```

### 2. Component-Level Protection

Use `ProtectedRoute` component for specific content:

```typescript
import ProtectedRoute from '@/components/ProtectedRoute'

export default function SomePage() {
  return (
    <ProtectedRoute>
      <div>Protected content here</div>
    </ProtectedRoute>
  )
}
```

### 3. Hook-Based Authentication

Use NextAuth.js hooks in components:

```typescript
import { useSession } from 'next-auth/react'

function MyComponent() {
  const { data: session, status } = useSession()
  
  if (status === "loading") return <p>Loading...</p>
  if (status === "unauthenticated") return <p>Access Denied</p>
  
  return <p>Welcome {session.user.email}!</p>
}
```

## UI Components

### 1. AuthButton Component

**Features**:
- Google sign-in button with logo
- User profile display (avatar, name/email)
- Sign-out functionality
- Loading states
- Tailwind CSS styling

**Usage**:
```typescript
import AuthButton from '@/components/AuthButton'

function Header() {
  return (
    <nav>
      <h1>My App</h1>
      <AuthButton />
    </nav>
  )
}
```

### 2. ProtectedRoute Component

**Features**:
- Authentication gate
- Loading spinner
- Custom sign-in prompt
- Fallback content support

**Usage**:
```typescript
import ProtectedRoute from '@/components/ProtectedRoute'

function Dashboard() {
  return (
    <ProtectedRoute fallback={<CustomSignIn />}>
      <DashboardContent />
    </ProtectedRoute>
  )
}
```

## Development Workflow

### 1. Start Development Server

```bash
cd frontend
npm run dev
```

### 2. Test Authentication

1. Navigate to `http://localhost:3000`
2. You should see the authentication gate
3. Click "Sign in with Google"
4. Complete Google OAuth flow
5. You should be redirected to the dashboard
6. Verify user info appears in header
7. Test sign-out functionality

### 3. Debug Authentication

Check browser developer tools:
- **Console**: Look for NextAuth.js debug messages
- **Network**: Monitor API calls to `/api/auth/*`
- **Application > Cookies**: Check session cookies
- **Local Storage**: NextAuth.js client-side state

Common debug flags:
```bash
# Enable NextAuth.js debug mode
NEXTAUTH_DEBUG=true npm run dev
```

## Production Deployment

### 1. Cloudflare Pages Configuration

Set environment variables in Cloudflare dashboard:
- `NEXTAUTH_URL=https://your-domain.pages.dev`
- `NEXTAUTH_SECRET=your-production-secret`
- `GOOGLE_CLIENT_ID=your-client-id`
- `GOOGLE_CLIENT_SECRET=your-client-secret`

### 2. Update Google OAuth Settings

Add production URLs to Google Console:
- **Authorized JavaScript origins**: `https://your-domain.pages.dev`
- **Authorized redirect URIs**: `https://your-domain.pages.dev/api/auth/callback/google`

### 3. Security Considerations

- Use different `NEXTAUTH_SECRET` for production
- Restrict OAuth redirect URIs to your domains only
- Consider using Internal OAuth app type for organization use
- Enable HTTPS enforcement
- Review and limit OAuth scopes

## Troubleshooting

### Common Issues

1. **"OAuth Error: invalid_client"**
   - Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
   - Verify redirect URI matches exactly
   - Ensure OAuth consent screen is configured

2. **"Access blocked: This app's request is invalid"**
   - Add your email to test users (External app)
   - Check authorized JavaScript origins
   - Verify app is published (for External app)

3. **Session not persisting**
   - Check `NEXTAUTH_SECRET` is set
   - Verify `NEXTAUTH_URL` matches your domain
   - Clear browser cookies and localStorage

4. **Middleware redirect loop**
   - Check middleware matcher pattern
   - Ensure auth pages are excluded
   - Verify NextAuth.js routes are accessible

### Debug Commands

```bash
# Check environment variables
npm run dev -- --debug

# Test OAuth flow manually
curl -X GET "http://localhost:3000/api/auth/providers"

# Check session endpoint
curl -X GET "http://localhost:3000/api/auth/session" \
  -H "Cookie: next-auth.session-token=your-token"
```

## Security Best Practices

1. **Environment Variables**
   - Never commit `.env.local` to git
   - Use different secrets for different environments
   - Rotate secrets regularly

2. **OAuth Configuration**
   - Limit authorized domains
   - Use minimal required scopes
   - Review OAuth consent screen regularly

3. **Session Management**
   - Set appropriate session max age
   - Implement proper sign-out
   - Consider session invalidation strategies

4. **Production Deployment**
   - Use HTTPS only
   - Implement rate limiting
   - Monitor authentication errors
   - Set up alerting for failed logins

## API Integration

The frontend authentication can be extended to work with the backend API by including authentication tokens in API requests:

```typescript
import { useSession } from 'next-auth/react'

function useAuthenticatedFetch() {
  const { data: session } = useSession()
  
  return async (url: string, options: RequestInit = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': session?.accessToken ? `Bearer ${session.accessToken}` : '',
      },
    })
  }
}
```

This provides a complete authentication system that integrates seamlessly with the existing Store CRUD application while maintaining security best practices.

---

*Last updated: 2025-08-25*
