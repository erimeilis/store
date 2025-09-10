/**
 * Frontend Server Entry Point
 * Clean, modular setup following DRY and SOLID principles
 */

import { Hono } from 'hono'
import { reactRenderer } from '@hono/react-renderer'
import { faviconDataUri } from './lib/favicon.js'
import IS_PROD from './config/is_prod.js'
import { initializeLayoutSystem } from './lib/layout-setup.js'
import { registerRoutes, registerAuthRoutes, registerApiProxyRoutes, registerCatchAllRoute } from './lib/route-setup.js'
import type { Env, Variables } from './types/hono.js'

// Initialize Hono app
const app = new Hono<{ Bindings: Env; Variables: Variables }>()

// Initialize layout system
await initializeLayoutSystem()


// React renderer setup
app.use((c, next) => {
  // Get environment variables from context before the render
  const apiUrl = c.env?.API_URL || 'http://localhost:8787'
  const accessToken = c.env?.ADMIN_ACCESS_TOKEN
  
  return reactRenderer(({ children, initialProps, adminToken, theme }: { children: any; initialProps?: any; adminToken?: string; theme?: string }) => {
    const isProduction = IS_PROD
    
    // Use theme passed from handlers, fallback to dim
    const selectedTheme = (theme === 'dim' || theme === 'nord') ? theme : 'dim'
    
    let cssFiles: string[] = []
    let jsFile = '/client.js'

    if (isProduction) {
      try {
        // eslint-disable-next-line no-undef
        const manifest = require('./dist/manifest.json')
        cssFiles = Object.keys(manifest)
          .filter((file: string) => file.endsWith('.css'))
          .map((file: string) => manifest[file])
        
        const jsEntry = Object.keys(manifest).find((file: string) => 
          file.startsWith('src/client.') && file.endsWith('.js')
        )
        if (jsEntry) {
          jsFile = manifest[jsEntry]
        }
      } catch {
        console.warn('Could not load manifest.json, using static filenames for production')
        // Fallback to static filenames that the build process creates
        cssFiles = ['styles.css']
        jsFile = 'client.js'
      }
    }

    return (
      <>
        <html lang="en" data-theme={selectedTheme} style={{colorScheme: selectedTheme === 'nord' ? 'light' : 'dark'}}>
          <head>
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta name="color-scheme" content={selectedTheme === 'nord' ? 'light' : 'dark'} />
            <link rel="icon" href={faviconDataUri} type="image/svg+xml" />
            
            {/* CRITICAL: Block rendering until theme is applied */}
            <script dangerouslySetInnerHTML={{
              __html: `
                // BLOCKING script - runs before any CSS loads
                (function() {
                  const theme = '${selectedTheme}';
                  const html = document.documentElement;
                  const body = document.body;
                  
                  // Apply theme immediately
                  html.setAttribute('data-theme', theme);
                  if (body) body.setAttribute('data-theme', theme);
                  
                  // Set color scheme immediately  
                  html.style.colorScheme = '${selectedTheme === 'nord' ? 'light' : 'dark'}';
                  if (body) body.style.colorScheme = '${selectedTheme === 'nord' ? 'light' : 'dark'}';
                })();
              `
            }} />
            
            {/* CRITICAL: Disable transitions ONLY to prevent flash */}
            <style dangerouslySetInnerHTML={{
              __html: `
                /* Disable ALL transitions and animations initially to prevent flash */
                *, *::before, *::after {
                  transition: none !important;
                  animation: none !important;
                }
                /* Ensure theme is applied at HTML level */
                html[data-theme="${selectedTheme}"], 
                body[data-theme="${selectedTheme}"] {
                  color-scheme: ${selectedTheme === 'nord' ? 'light' : 'dark'} !important;
                }
              `
            }} />
            
            {/* CSS files */}
            {cssFiles.map((cssFile: string) => (
              <link key={cssFile} rel="stylesheet" href={cssFile.startsWith('/') ? cssFile : `/${cssFile}`} />
            ))}
            {!isProduction && (
              <link rel="stylesheet" href="/styles.css" />
            )}
            <script dangerouslySetInnerHTML={{
              __html: `
                // Apply theme immediately to prevent flashing
                (function() {
                  const theme = '${selectedTheme}';
                  document.documentElement.setAttribute('data-theme', theme);
                  
                  // Re-enable transitions after a brief delay
                  setTimeout(function() {
                    const style = document.createElement('style');
                    style.textContent = \`
                      .theme-transitions-enabled * {
                        transition: color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease !important;
                      }
                    \`;
                    document.head.appendChild(style);
                    document.documentElement.classList.add('theme-transitions-enabled');
                  }, 100);
                })();
              `
            }} />
            
            {/* Initial props and admin token */}
            <script dangerouslySetInnerHTML={{
              __html: `
                ${initialProps ? `window.__INITIAL_PROPS__ = ${JSON.stringify(initialProps)};` : ''}
                ${adminToken ? `window.__ADMIN_TOKEN__ = "${adminToken}";` : ''}
                window.__INITIAL_THEME__ = "${selectedTheme}";
                window.__API_URL__ = "${apiUrl}";
                ${accessToken ? `window.__ACCESS_TOKEN__ = "${accessToken}";` : ''}
              `
            }} />
            
          </head>
          <body className="min-h-screen bg-base-200" data-theme={selectedTheme} style={{colorScheme: selectedTheme === 'nord' ? 'light' : 'dark'}}>
            <div id="app">
              {children}
            </div>
            <script type="module" src={jsFile.startsWith('/') ? jsFile : `/${jsFile}`}></script>
            
          </body>
        </html>
      </>
    )
  })(c, next)
})

// Global error handling middleware
app.onError((err, c) => {
  console.error('Server error:', err)
  
  // Determine error code
  const status = (err as any).status || 500
  
  // Create error page URL - handle potential issues with c.req
  let baseUrl: string
  try {
    baseUrl = c.req?.url || 'http://localhost:5173'
  } catch {
    baseUrl = 'http://localhost:5173'
  }
  
  const url = new URL('/error', baseUrl)
  url.searchParams.set('code', status.toString())
  url.searchParams.set('message', encodeURIComponent(err.message || 'An unexpected error occurred'))
  
  return c.redirect(url.toString(), 302)
})

// Register routes in correct order
registerRoutes(app)        // Register regular page routes first
registerAuthRoutes(app)    // Register auth routes second
registerApiProxyRoutes(app) // Register API proxy routes third

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'frontend'
  })
})

// IMPORTANT: Register catch-all 404 route LAST (after all other routes)
registerCatchAllRoute(app)

export default app
