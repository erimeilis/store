import { Hono } from 'hono'
import { reactRenderer } from '@hono/react-renderer'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { setCookie, deleteCookie, getCookie } from 'hono/cookie'
import { exchangeCodeForTokens, getGoogleUserInfo, createAuthConfig } from '@/lib/auth'
import { createSessionCookie, parseSessionCookie } from '@/lib/middleware'
import { Env, Variables } from '@/types'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import IS_PROD from '@/config/is_prod'
import '@/styles/globals.css'

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

// React renderer setup
app.use(
  reactRenderer(({ children, initialProps }: { children: any; initialProps?: any }) => {
    const isProduction = IS_PROD
    
    let cssFiles: string[] = []
    let jsFile = '/src/client.tsx'
    
    if (isProduction) {
      // Production: use hardcoded manifest values
      cssFiles = ['assets/client-Kk73zWyJ.css']
      jsFile = '/static/client.js'
    } else {
      // Development: use the full path from root
      jsFile = '/src/client.tsx'
    }
    
    // Debug logging (comment out for production)
    // console.log('Environment detection:', { isProduction, jsFile, cssFiles })
    
    // Box icon SVG for favicon
    const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`
    const faviconDataUri = `data:image/svg+xml,${encodeURIComponent(faviconSvg)}`
    
    return (
      <html data-theme="dim">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href={faviconDataUri} type="image/svg+xml" />
          {/* Include CSS files for production */}
          {cssFiles.map((cssFile: string) => (
            <link key={cssFile} rel="stylesheet" href={`/${cssFile}`} />
          ))}
          {/* Include CSS directly for development */}
          {!isProduction && (
            <link rel="stylesheet" href="/src/styles/globals.css" />
          )}
          {initialProps && (
            <script dangerouslySetInnerHTML={{
              __html: `window.__INITIAL_PROPS__ = ${JSON.stringify(initialProps)};`
            }} />
          )}
        </head>
        <body className="min-h-screen bg-base-200">
          <div id="app">
            {children}
          </div>
          {isProduction ? (
            <script type="module" src={jsFile}></script>
          ) : (
            <>
              <script type="module" src="/@vite/client"></script>
              <script type="module" src={jsFile}></script>
            </>
          )}
        </body>
      </html>
    )
  })
)

// CORS configuration
app.use('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:8787', 'https://*.workers.dev', 'https://*.pages.dev'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))

// Serve static files (only in production, in dev mode Vite handles this)
app.use('/static/*', serveStatic({ 
  root: './dist',
  manifest: {} as any
}))

// Login Route (/)
app.get('/', (c) => {
  const authConfig = createAuthConfig(c.env)
  const sessionCookie = getCookie(c, authConfig.session.cookieName)
  
  // If already logged in, redirect to dashboard
  if (sessionCookie) {
    try {
      parseSessionCookie(sessionCookie)
      return c.redirect('/dashboard')
    } catch {
      // Invalid session, continue to login
    }
  }

  // Generate Google OAuth URL
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
    client_id: authConfig.google.clientId || '',
    redirect_uri: authConfig.google.redirectURI,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline'
  }).toString()}`

  const loginProps = { 
    googleAuthUrl,
    apiUrl: c.env?.API_URL || 'http://localhost:8787'
  }
  
  return c.render(<LoginPage {...loginProps} />, { initialProps: loginProps })
})

// Dashboard Route (/dashboard)
app.get('/dashboard', (c) => {
  const authConfig = createAuthConfig(c.env)
  const sessionCookie = getCookie(c, authConfig.session.cookieName)
  
  if (!sessionCookie) {
    return c.redirect('/')
  }

  let user
  try {
    user = parseSessionCookie(sessionCookie)
  } catch {
    return c.redirect('/')
  }

  if (!user) {
    return c.redirect('/')
  }

  const dashboardProps = { 
    user,
    apiUrl: c.env?.API_URL || 'http://localhost:8787'
  }
  
  return c.render(<DashboardPage {...dashboardProps} />, { initialProps: dashboardProps })
})

// Auth Routes Group
const auth = new Hono()

// Google OAuth callback
auth.get('/callback/google', async (c) => {
  try {
    const code = c.req.query('code')
    
    if (!code) {
      return c.redirect('/?error=no_code')
    }

    const authConfig = createAuthConfig(c.env)
    const tokens = await exchangeCodeForTokens(code, authConfig)
    const userInfo = await getGoogleUserInfo(tokens.access_token)
    
    const user = {
      id: userInfo.id,
      name: userInfo.name,
      email: userInfo.email,
      image: userInfo.picture
    }
    
    const sessionCookie = createSessionCookie(user)
    
    setCookie(c, authConfig.session.cookieName, sessionCookie, {
      httpOnly: true,
      secure: (c.env as any)?.ENVIRONMENT === 'production',
      sameSite: 'Lax',
      maxAge: authConfig.session.maxAge
    })
    
    return c.redirect('/dashboard')
    
  } catch (error) {
    console.error('OAuth callback error:', error)
    return c.redirect('/?error=auth_failed')
  }
})

// Logout
auth.get('/logout', async (c) => {
  const authConfig = createAuthConfig(c.env)
  deleteCookie(c, authConfig.session.cookieName)
  return c.redirect('/')
})

// Mount auth routes
app.route('/auth', auth)

// API Routes Group - Items CRUD
const api = new Hono<{ Bindings: Env; Variables: Variables }>()

// Middleware to check authentication for API routes
api.use('*', async (c, next) => {
  const authConfig = createAuthConfig(c.env)
  const sessionCookie = getCookie(c, authConfig.session.cookieName)
  
  if (!sessionCookie) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const user = parseSessionCookie(sessionCookie)
    if (!user) {
      return c.json({ error: 'Invalid session' }, 401)
    }
    c.set('user', user)
    await next()
  } catch {
    return c.json({ error: 'Invalid session' }, 401)
  }
})

// Mock data for development (in production this would connect to a database)
const mockItems = [
  {
    id: '1',
    name: 'Premium Coffee Beans',
    description: 'High-quality arabica coffee beans from Colombia',
    price: 24.99,
    quantity: 50,
    category: 'Beverages',
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-20').toISOString()
  },
  {
    id: '2', 
    name: 'Wireless Headphones',
    description: 'Bluetooth noise-canceling headphones',
    price: 199.99,
    quantity: 8,
    category: 'Electronics',
    createdAt: new Date('2024-01-10').toISOString(),
    updatedAt: new Date('2024-01-22').toISOString()
  },
  {
    id: '3',
    name: 'Organic Green Tea',
    description: 'Premium organic green tea leaves',
    price: 15.50,
    quantity: 0,
    category: 'Beverages', 
    createdAt: new Date('2024-01-12').toISOString(),
    updatedAt: new Date('2024-01-18').toISOString()
  }
]

// GET /api/items - Get all items
api.get('/items', (c) => {
  return c.json(mockItems)
})

// POST /api/items - Create new item  
api.post('/items', async (c) => {
  try {
    const body = await c.req.json()
    const newItem = {
      id: Date.now().toString(),
      name: body.name,
      description: body.description || '',
      price: parseFloat(body.price),
      quantity: parseInt(body.quantity),
      category: body.category || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    mockItems.push(newItem)
    return c.json(newItem, 201)
  } catch {
    return c.json({ error: 'Invalid request body' }, 400)
  }
})

// PUT /api/items/:id - Update item
api.put('/items/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json()
    
    const itemIndex = mockItems.findIndex(item => item.id === id)
    if (itemIndex === -1) {
      return c.json({ error: 'Item not found' }, 404)
    }
    
    const updatedItem = {
      ...mockItems[itemIndex],
      ...(body.name && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.price !== undefined && { price: parseFloat(body.price) }),
      ...(body.quantity !== undefined && { quantity: parseInt(body.quantity) }),
      ...(body.category !== undefined && { category: body.category }),
      updatedAt: new Date().toISOString()
    }
    
    mockItems[itemIndex] = updatedItem
    return c.json(updatedItem)
  } catch {
    return c.json({ error: 'Invalid request body' }, 400)
  }
})

// DELETE /api/items/:id - Delete item
api.delete('/items/:id', (c) => {
  const id = c.req.param('id')
  const itemIndex = mockItems.findIndex(item => item.id === id)
  
  if (itemIndex === -1) {
    return c.json({ error: 'Item not found' }, 404)
  }
  
  mockItems.splice(itemIndex, 1)
  return c.json({ message: 'Item deleted successfully' })
})

// Mount API routes
app.route('/api', api)

export default app