import { Hono } from 'hono'
import { reactRenderer } from '@hono/react-renderer'
import { cors } from 'hono/cors'
import { setCookie, deleteCookie, getCookie } from 'hono/cookie'
import { exchangeCodeForTokens, getGoogleUserInfo, createAuthConfig } from '@/lib/auth'
import { createSessionCookie, parseSessionCookie } from '@/lib/middleware'
import { Env, Variables } from '@/types/hono'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import IS_PROD from '@/config/is_prod'
import manifest from '@/lib/manifest.json'
// CSS is now served as a static asset instead of being imported

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

// React renderer setup
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
        <body className="min-h-screen bg-base-200">
          <div id="app">
            {children}
          </div>
          <script type="module" src={jsFile}></script>
        </body>
      </html>
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
    const asset = await c.env.ASSETS.fetch(c.req.raw)
    return asset
  } catch {
    return c.notFound()
  }
})

app.get('/styles.css', async (c) => {
  try {
    const asset = await c.env.ASSETS.fetch(c.req.raw)
    return asset
  } catch {
    return c.notFound()
  }
})

// Generic static assets handler for any other static files
app.get('/assets/*', async (c) => {
  try {
    const asset = await c.env.ASSETS.fetch(c.req.raw)
    return asset
  } catch {
    return c.notFound()
  }
})

app.get('/static/*', async (c) => {
  try {
    const asset = await c.env.ASSETS.fetch(c.req.raw)
    return asset
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

  // Generate Google OAuth URL using the auth config helper
  const currentAuthConfig = createAuthConfig(c.env)
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
    client_id: currentAuthConfig.google.clientId,
    redirect_uri: currentAuthConfig.google.redirectURI,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline'
  }).toString()}`

  const loginProps = { 
    googleAuthUrl,
    apiUrl: c.env?.API_URL,
    apiToken: c.env?.FRONTEND_ACCESS_TOKEN
  }
  
  return c.render(<LoginPage {...loginProps} />, { initialProps: loginProps })
})

// Dashboard Route (/dashboard)
app.get('/dashboard', (c) => {
  const dashboardAuthConfig = createAuthConfig(c.env)
  const _sessionCookie = getCookie(c, dashboardAuthConfig.session.cookieName)
  
  // Temporarily bypass auth for testing
  const user = {
    id: 'test-user',
    name: 'Test User', 
    email: 'test@example.com',
    image: null
  }
  
  // TODO: Re-enable auth later
  /*
  if (!sessionCookie) {
    return c.redirect('/')
  }

  try {
    user = parseSessionCookie(sessionCookie)
  } catch {
    return c.redirect('/')
  }

  if (!user) {
    return c.redirect('/')
  }
  */

  const dashboardProps = { 
    user,
    apiUrl: c.env?.API_URL,
    apiToken: c.env?.FRONTEND_ACCESS_TOKEN
  }
  
  return c.render(<DashboardPage {...dashboardProps} />, { initialProps: dashboardProps })
})

// Auth Routes Group
const auth = new Hono<{ Bindings: Env; Variables: Variables }>()

// API token endpoint - for testing
auth.get('/token', (c) => {
  return c.json({ 
    token: c.env?.FULL_ACCESS_TOKEN || '',
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
    const tokens = await exchangeCodeForTokens(code, callbackAuthConfig)
    const userInfo = await getGoogleUserInfo(tokens.access_token)
    
    const user = {
      id: userInfo.id,
      name: userInfo.name,
      email: userInfo.email,
      image: userInfo.picture
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