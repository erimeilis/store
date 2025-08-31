import { Hono } from 'hono'
import { reactRenderer } from '@hono/react-renderer'
import { cors } from 'hono/cors'
import { setCookie, deleteCookie, getCookie } from 'hono/cookie'
import { exchangeCodeForTokens, getGoogleUserInfo, createAuthConfig } from '@/lib/auth'
import { createSessionCookie, parseSessionCookie } from '@/lib/middleware'
import { Env, Variables } from '@/types/hono'
// Layout system imports
import { LayoutProvider } from '@/components/LayoutProvider'
import { LayoutRenderer } from '@/components/LayoutRenderer'
import { layoutSystem } from '@/lib/layout-system'
import RootLayout from '@/app/layout'
import DashboardLayout from '@/app/dashboard/layout'
import DashboardPage from '@/app/dashboard/page'
import UsersPage from '@/app/dashboard/users/page'
import CreateUserPage from '@/app/dashboard/users/create/page'
import EditUserPage from '@/app/dashboard/users/edit/[id]/page'
import LoginPage from '@/app/login/page'
import IS_PROD from '@/config/is_prod'
import manifest from '@/lib/manifest.json'
// CSS is now served as a static asset instead of being imported

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

// Register layouts and pages with the layout system
layoutSystem.register({
  name: 'root',
  path: '/dashboard',
  segment: 'dashboard',
  component: RootLayout
})

layoutSystem.register({
  name: 'dashboard',
  path: '/dashboard',
  segment: 'dashboard', 
  component: DashboardLayout
})

layoutSystem.register({
  path: '/',
  segment: 'root',
  component: LoginPage
})

layoutSystem.register({
  path: '/dashboard',
  segment: 'dashboard',
  component: DashboardPage
})

layoutSystem.register({
  path: '/dashboard/users',
  segment: 'users',
  component: UsersPage
})

layoutSystem.register({
  path: '/dashboard/users/create',
  segment: 'create',
  component: CreateUserPage
})

layoutSystem.register({
  path: '/dashboard/users/edit/[id]',
  segment: 'edit',
  component: EditUserPage
})

// React renderer setup using layout system
app.use(
  reactRenderer(({ children, initialProps }: { children: any; initialProps?: any }) => {
    const isProduction = IS_PROD
    
    let cssFiles: string[] = []
    let jsFile = '/src/client.tsx'
    
    if (isProduction) {
      // Production: read from manifest
      const clientEntry = manifest['src/client.tsx']
      cssFiles = clientEntry?.css || []
      jsFile = clientEntry?.file ? `/${clientEntry.file}` : '/client.js'
    } else {
      // Development: use built client file
      jsFile = '/client.js'
    }
    
    // Box icon SVG for favicon
    const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`
    const faviconDataUri = `data:image/svg+xml,${encodeURIComponent(faviconSvg)}`
    
    // Enhanced renderer that includes layout system setup
    return (
      <>
        <html data-theme="dim">
          <head>
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="icon" href={faviconDataUri} type="image/svg+xml" />
            {/* Include CSS files for production */}
            {cssFiles.map((cssFile: string) => (
              <link key={cssFile} rel="stylesheet" href={`/${cssFile}`} />
            ))}
            {/* Include built CSS for development */}
            {!isProduction && (
              <link rel="stylesheet" href="/styles.css" />
            )}
            {initialProps && (
              <script dangerouslySetInnerHTML={{
                __html: `window.__INITIAL_PROPS__ = ${JSON.stringify(initialProps)};`
              }} />
            )}
          </head>
          <body className="min-h-screen bg-base-200" data-theme="dim">
            <div id="app">
              {children}
            </div>
            <script type="module" src={jsFile}></script>
          </body>
        </html>
      </>
    )
  })
)

// CORS configuration - allow all origins for frontend routes
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))

// Static asset routes - handle all static files from dist directory
app.get('/client.js', async (c) => {
  try {
    const asset = await c.env.ASSETS?.fetch(c.req.raw)
    return asset || c.notFound()
  } catch {
    return c.notFound()
  }
})

app.get('/styles.css', async (c) => {
  try {
    const asset = await c.env.ASSETS?.fetch(c.req.raw)
    return asset || c.notFound()
  } catch {
    return c.notFound()
  }
})

// Generic static assets handler for any other static files
app.get('/assets/*', async (c) => {
  try {
    const asset = await c.env.ASSETS?.fetch(c.req.raw)
    return asset || c.notFound()
  } catch {
    return c.notFound()
  }
})

app.get('/static/*', async (c) => {
  try {
    const asset = await c.env.ASSETS?.fetch(c.req.raw)
    return asset || c.notFound()
  } catch {
    return c.notFound()
  }
})

// Test route
app.get('/test', (c) => {
  return c.text(`Test OK. CLIENT_ID exists: ${!!c.env.GOOGLE_CLIENT_ID}, Length: ${c.env.GOOGLE_CLIENT_ID?.length || 0}`)
})

// API test page
app.get('/api-test', (c) => {
  const apiUrl = c.env?.API_URL
  return c.html(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>API Test</title>
      <script>window.__INITIAL_PROPS__ = ${JSON.stringify({ apiUrl })};</script>
    </head>
    <body>
      <h1>API Test</h1>
      <button onclick="testAPI()">Test API Call</button>
      <div id="result"></div>
      <script type="module">
        async function testAPI() {
          const result = document.getElementById('result');
          result.innerHTML = 'Testing...';
          
          try {
            const response = await fetch('http://localhost:8787/api/items', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer eeb77aa92c4763586c086b89876037dc74b3252e19fe5dbd2ea0a80100e3855f'
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              result.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
            } else {
              const errorText = await response.text();
              result.innerHTML = '<pre style="color: red;">Error ' + response.status + ': ' + errorText + '</pre>';
            }
          } catch (error) {
            result.innerHTML = '<pre style="color: red;">Error: ' + error.message + '</pre>';
          }
        }
        window.testAPI = testAPI;
      </script>
    </body>
    </html>
  `)
})


// Login Route (/) - using layout system
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

  // Generate Google OAuth URL using the auth config helper
  const currentAuthConfig = createAuthConfig(c.env)
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
    client_id: currentAuthConfig.google.clientId,
    redirect_uri: currentAuthConfig.google.redirectURI,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline'
  }).toString()}`

  // Resolve layout hierarchy for root route
  const { layouts, route } = layoutSystem.resolveLayoutHierarchy('/')
  const params = {}
  const searchParams = Object.fromEntries(
    Object.entries(c.req.queries()).map(([key, values]) => [key, values[0] || ''])
  )

  const content = (
    <LayoutProvider
      layoutSystem={layoutSystem}
      currentRoute="/"
      params={params}
      searchParams={searchParams}
    >
      <LayoutRenderer
        route={route!}
        layouts={layouts}
        params={params}
        searchParams={searchParams}
        pageProps={{ googleAuthUrl }}
      />
    </LayoutProvider>
  )
  
  return c.render(content, { initialProps: { googleAuthUrl } })
})

// Dashboard Route (/dashboard) - using layout system
app.get('/dashboard', (c) => {
  const dashboardAuthConfig = createAuthConfig(c.env)
  const _sessionCookie = getCookie(c, dashboardAuthConfig.session.cookieName)
  
  // Re-enabled authentication
  if (!_sessionCookie) {
    return c.redirect('/')
  }

  let user
  try {
    user = parseSessionCookie(_sessionCookie)
  } catch {
    return c.redirect('/')
  }

  if (!user) {
    return c.redirect('/')
  }

  // Resolve layout hierarchy for dashboard route
  const { layouts, route } = layoutSystem.resolveLayoutHierarchy('/dashboard')
  const params = {}
  const searchParams = Object.fromEntries(
    Object.entries(c.req.queries()).map(([key, values]) => [key, values[0] || ''])
  )

  const dashboardProps = { 
    user,
    apiUrl: c.env?.API_URL,
    apiToken: c.env?.ADMIN_ACCESS_TOKEN
  }

  const content = (
    <LayoutProvider
      layoutSystem={layoutSystem}
      currentRoute="/dashboard"
      params={params}
      searchParams={searchParams}
    >
      <LayoutRenderer
        route={route!}
        layouts={layouts}
        params={params}
        searchParams={searchParams}
        pageProps={dashboardProps}
      />
    </LayoutProvider>
  )
  
  return c.render(content, { initialProps: dashboardProps })
})

// Users Routes - using layout system
app.get('/dashboard/users', async (c) => {
  const usersAuthConfig = createAuthConfig(c.env)
  const sessionCookie = getCookie(c, usersAuthConfig.session.cookieName)
  
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

  // Fetch users data from API
  let users = null
  try {
    const apiUrl = c.env?.API_URL || 'http://localhost:8787'
    const token = c.env?.ADMIN_ACCESS_TOKEN
    
    if (token) {
      const response = await fetch(`${apiUrl}/api/users?${new URLSearchParams(c.req.queries()).toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        users = await response.json()
      }
    }
  } catch (error) {
    console.error('Failed to fetch users:', error)
  }

  const { layouts, route } = layoutSystem.resolveLayoutHierarchy('/dashboard/users')
  const params = {}
  const searchParams = Object.fromEntries(
    Object.entries(c.req.queries()).map(([key, values]) => [key, values[0] || ''])
  )

  const usersProps = { 
    user,
    apiUrl: c.env?.API_URL,
    apiToken: c.env?.ADMIN_ACCESS_TOKEN,
    users,
    filters: {
      sort: c.req.query('sort'),
      direction: c.req.query('direction') as 'asc' | 'desc'
    }
  }

  const content = (
    <LayoutProvider
      layoutSystem={layoutSystem}
      currentRoute="/dashboard/users"
      params={params}
      searchParams={searchParams}
    >
      <LayoutRenderer
        route={route!}
        layouts={layouts}
        params={params}
        searchParams={searchParams}
        pageProps={usersProps}
      />
    </LayoutProvider>
  )
  
  return c.render(content, { initialProps: usersProps })
})

// Create User Route
app.get('/dashboard/users/create', (c) => {
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

  const { layouts, route } = layoutSystem.resolveLayoutHierarchy('/dashboard/users/create')
  const params = {}
  const searchParams = Object.fromEntries(
    Object.entries(c.req.queries()).map(([key, values]) => [key, values[0] || ''])
  )

  const createProps = { 
    user,
    apiUrl: c.env?.API_URL,
    apiToken: c.env?.ADMIN_ACCESS_TOKEN
  }

  const content = (
    <LayoutProvider
      layoutSystem={layoutSystem}
      currentRoute="/dashboard/users/create"
      params={params}
      searchParams={searchParams}
    >
      <LayoutRenderer
        route={route!}
        layouts={layouts}
        params={params}
        searchParams={searchParams}
        pageProps={createProps}
      />
    </LayoutProvider>
  )
  
  return c.render(content, { initialProps: createProps })
})

// Edit User Route
app.get('/dashboard/users/edit/:id', (c) => {
  const editAuthConfig = createAuthConfig(c.env)
  const sessionCookie = getCookie(c, editAuthConfig.session.cookieName)
  
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

  const { layouts, route } = layoutSystem.resolveLayoutHierarchy('/dashboard/users/edit/[id]')
  const params = { id: c.req.param('id') }
  const searchParams = Object.fromEntries(
    Object.entries(c.req.queries()).map(([key, values]) => [key, values[0] || ''])
  )

  const editProps = { 
    user,
    apiUrl: c.env?.API_URL,
    apiToken: c.env?.ADMIN_ACCESS_TOKEN,
    id: params.id
  }

  const content = (
    <LayoutProvider
      layoutSystem={layoutSystem}
      currentRoute="/dashboard/users/edit/[id]"
      params={params}
      searchParams={searchParams}
    >
      <LayoutRenderer
        route={route!}
        layouts={layouts}
        params={params}
        searchParams={searchParams}
        pageProps={editProps}
      />
    </LayoutProvider>
  )
  
  return c.render(content, { initialProps: editProps })
})

// Auth Routes Group
const auth = new Hono<{ Bindings: Env; Variables: Variables }>()

// API token endpoint - for testing
auth.get('/token', (c) => {
  return c.json({ 
    token: c.env?.ADMIN_ACCESS_TOKEN || '',
    test: 'endpoint working'
  })
})

// Google OAuth callback
auth.get('/callback/google', async (c) => {
  try {
    const code = c.req.query('code')
    
    if (!code) {
      return c.redirect('/?error=no_code')
    }

    const callbackAuthConfig = createAuthConfig(c.env)
    const tokens = await exchangeCodeForTokens(code, callbackAuthConfig) as any
    const userInfo = await getGoogleUserInfo(tokens.access_token) as any
    
    // Call backend API to register/update user in database
    try {
      const apiUrl = c.env?.API_URL || 'http://localhost:8787'
      const userRegistrationToken = c.env?.USER_REGISTRATION_TOKEN
      
      console.log('=== USER REGISTRATION DEBUG ===')
      console.log('API URL:', apiUrl)
      console.log('User Registration Token:', userRegistrationToken ? `${userRegistrationToken.substring(0, 8)}...` : 'MISSING')
      console.log('User Info:', { name: userInfo.name, email: userInfo.email })
      
      const registerResponse = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userRegistrationToken && { 'Authorization': `Bearer ${userRegistrationToken}` })
        },
        body: JSON.stringify({
          name: userInfo.name,
          email: userInfo.email,
          picture: userInfo.picture
        })
      })
      
      console.log('Register Response Status:', registerResponse.status)
      console.log('Register Response Headers:', Object.fromEntries(registerResponse.headers.entries()))
      
      if (!registerResponse.ok) {
        const errorText = await registerResponse.text()
        console.error('FAILED TO REGISTER USER:', errorText)
        console.error('Response Status:', registerResponse.status)
        // Continue with login even if backend registration fails
      } else {
        const registerData = await registerResponse.json()
        console.log('SUCCESS: User registered/updated in backend:', registerData)
      }
    } catch (error) {
      console.error('CRITICAL ERROR calling backend user registration:', error)
      console.error('Error details:', error.message, error.stack)
      // Continue with login even if backend call fails
    }
    
    // Create frontend session - frontend only handles Google OAuth
    // Backend API will handle user management through bearer tokens
    const user = {
      name: userInfo.name,
      email: userInfo.email,
      picture: userInfo.picture
    }
    
    const sessionCookie = createSessionCookie(user)
    
    setCookie(c, callbackAuthConfig.session.cookieName, sessionCookie, {
      httpOnly: true,
      secure: (c.env as any)?.ENVIRONMENT === 'production',
      sameSite: 'Lax',
      maxAge: callbackAuthConfig.session.maxAge
    })
    
    return c.redirect('/dashboard')
    
  } catch (error) {
    console.error('OAuth callback error:', error)
    return c.redirect('/?error=auth_failed')
  }
})

// Logout
auth.get('/logout', async (c) => {
  const logoutAuthConfig = createAuthConfig(c.env)
  deleteCookie(c, logoutAuthConfig.session.cookieName)
  return c.redirect('/')
})

// Mount auth routes
app.route('/auth', auth)

// Frontend routes only - API calls handled by separate backend service

export default app