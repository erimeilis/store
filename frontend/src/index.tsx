import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { setCookie, deleteCookie } from 'hono/cookie'
import { Renderer } from './renderer'
import initView from './view'
import { exchangeCodeForTokens, getGoogleUserInfo, createAuthConfig } from './lib/auth'
import { authMiddleware, createSessionCookie } from './lib/middleware'
import { Env, Variables } from './types/hono'
import manifest from './lib/manifest.json'
import './styles/globals.css'

// Initialize view registry
initView()

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

// CORS configuration
app.use('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:8787', 'https://*.workers.dev', 'https://*.pages.dev'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))

// React renderer middleware
app.use(Renderer)

// Serve static files
app.use('/static/*', serveStatic({ 
  root: './',
  manifest: {} as any
}))

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'frontend',
    timestamp: new Date().toISOString()
  })
})

// Custom authentication routes
// Google OAuth callback
app.get('/auth/callback/google', async (c) => {
  try {
    const code = c.req.query('code')
    
    if (!code) {
      console.error('No authorization code received')
      return c.redirect('/login?error=no_code')
    }

    // Create auth config with context environment variables
    const authConfig = createAuthConfig(c.env)
    
    console.log('OAuth callback - Client ID:', authConfig.google.clientId ? 'Present' : 'Missing')
    console.log('OAuth callback - Client Secret:', authConfig.google.clientSecret ? 'Present' : 'Missing')
    console.log('OAuth callback - Redirect URI:', authConfig.google.redirectURI)

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code, authConfig)
    
    // Get user info from Google
    const userInfo = await getGoogleUserInfo(tokens.access_token)
    
    // Create user session
    const user = {
      id: userInfo.id,
      name: userInfo.name,
      email: userInfo.email,
      image: userInfo.picture
    }
    
    // Create session cookie
    const sessionCookie = createSessionCookie(user)
    
    // Set session cookie
    setCookie(c, authConfig.session.cookieName, sessionCookie, {
      httpOnly: true,
      secure: c.env?.ENVIRONMENT === 'production',
      sameSite: 'Lax',
      maxAge: authConfig.session.maxAge
    })
    
    // Redirect to dashboard
    return c.redirect('/dashboard')
    
  } catch (error) {
    console.error('OAuth callback error:', error)
    return c.redirect('/login?error=auth_failed')
  }
})

// Logout endpoint (POST for API)
app.post('/auth/logout', async (c) => {
  // Create auth config with context environment variables
  const authConfig = createAuthConfig(c.env)
  
  // Delete session cookie
  deleteCookie(c, authConfig.session.cookieName)
  
  return c.json({ success: true })
})

// Logout endpoint (GET for anchor links)
app.get('/auth/logout', async (c) => {
  // Create auth config with context environment variables
  const authConfig = createAuthConfig(c.env)
  
  // Delete session cookie
  deleteCookie(c, authConfig.session.cookieName)
  
  // Redirect to home page
  return c.redirect('/')
})

// Home page
app.get('/', (c) => {
  return (c as any).render('home', {
    meta: {
      title: 'Store CRUD - Home',
      description: 'Store CRUD application built with Hono and React',
      manifest: manifest
    },
    props: {}
  })
})

// Login page
app.get('/login', (c) => {
  // Create auth config with context environment variables
  const authConfig = createAuthConfig(c.env)
  
  console.log('Login page - Client ID:', authConfig.google.clientId ? 'Present' : 'Missing')
  console.log('Login page - Redirect URI:', authConfig.google.redirectURI)
  
  return (c as any).render('login', {
    meta: {
      title: 'Store CRUD - Login',
      description: 'Login to Store CRUD application',
      manifest: manifest
    },
    props: {
      auth: {
        googleClientId: authConfig.google.clientId,
        googleRedirectUri: authConfig.google.redirectURI
      }
    }
  })
})

// Dashboard (protected route)
app.get('/dashboard', authMiddleware, (c) => {
  const user = c.get('user')
  return (c as any).render('dashboard', {
    meta: {
      title: 'Store CRUD - Dashboard',
      description: 'Dashboard for managing store items',
      manifest: manifest
    },
    props: {
      user: user
    }
  })
})

// Items page (protected route)
app.get('/items', authMiddleware, (c) => {
  const user = c.get('user')
  return (c as any).render('items', {
    meta: {
      title: 'Store CRUD - Items',
      description: 'Manage store items',
      manifest: manifest
    },
    props: {
      user: user
    }
  })
})

// API proxy routes to backend
app.get('/api/*', async (c) => {
  const backendUrl = c.env?.API_URL || 'https://store-crud-api.your-subdomain.workers.dev'
  const path = c.req.path
  
  const response = await fetch(`${backendUrl}${path}`, {
    method: c.req.method,
    headers: c.req.header(),
    body: c.req.method !== 'GET' ? await c.req.text() : undefined
  })
  
  return new Response(response.body, {
    status: response.status,
    headers: response.headers
  })
})

app.post('/api/*', async (c) => {
  const backendUrl = c.env?.API_URL || 'https://store-crud-api.your-subdomain.workers.dev'
  const path = c.req.path
  
  const response = await fetch(`${backendUrl}${path}`, {
    method: c.req.method,
    headers: c.req.header(),
    body: await c.req.text()
  })
  
  return new Response(response.body, {
    status: response.status,
    headers: response.headers
  })
})

app.put('/api/*', async (c) => {
  const backendUrl = c.env?.API_URL || 'https://store-crud-api.your-subdomain.workers.dev'
  const path = c.req.path
  
  const response = await fetch(`${backendUrl}${path}`, {
    method: c.req.method,
    headers: c.req.header(),
    body: await c.req.text()
  })
  
  return new Response(response.body, {
    status: response.status,
    headers: response.headers
  })
})

app.delete('/api/*', async (c) => {
  const backendUrl = c.env?.API_URL || 'https://store-crud-api.your-subdomain.workers.dev'
  const path = c.req.path
  
  const response = await fetch(`${backendUrl}${path}`, {
    method: c.req.method,
    headers: c.req.header(),
    body: c.req.method !== 'DELETE' ? await c.req.text() : undefined
  })
  
  return new Response(response.body, {
    status: response.status,
    headers: response.headers
  })
})

export default app
