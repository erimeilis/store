import React, { StrictMode } from 'react'
import isProd from '../config/is_prod'
import { Manifest, ManifestItem, ViewData } from '../global'
import { Toaster } from '../components/ui/sonner'
import { getViewByName } from '../renderer'

type LayoutProps = {
  children?: React.ReactNode
  view: ViewData & { view_name?: string }
  manifest?: Manifest
}

export default function App({ children, view, manifest }: LayoutProps) {
  // Provide default view if undefined
  const safeView = view || { meta: { title: 'Store CRUD', lang: 'en' }, props: {} }
  
  // Create a serializable version of the view data to avoid circular references
  const serializableView = {
    meta: safeView.meta,
    props: safeView.props,
    view_name: (safeView as any).view_name
  }
  
  const viewScript = 'var _hono_view = ' + JSON.stringify(serializableView) + ';'
  
  // Inject Google OAuth configuration for client-side access
  const authConfig = safeView.props?.auth || {}
  const authConfigScript = `
    window.__GOOGLE_CLIENT_ID__ = '${authConfig.googleClientId || ''}';
    window.__GOOGLE_REDIRECT_URI__ = '${authConfig.googleRedirectUri || 'http://localhost:5173/auth/callback/google'}';
  `
  let cssDoms: React.ReactNode[] = []
  let scriptDoms: React.ReactNode[] = []
  
  if (isProd && manifest) {
    const cssFiles: string[] = []
    const scriptFiles: string[] = []
    
    for (const [, v] of Object.entries(manifest)) {
      const item: ManifestItem = v
      if (item.isEntry) {
        item.css?.forEach((c) => {
          cssFiles.push('/' + c)
        })
        if (item.file) {
          scriptFiles.push('/' + item.file)
        }
      }
    }
    
    cssDoms = cssFiles.map(l => {
      return <link href={l} rel="stylesheet" key={l} />
    })
    scriptDoms = scriptFiles.map(s => {
      return <script type="module" src={s} key={s}></script>
    })
  }
  
  let domain = ''
  if (safeView.meta.open_graph?.url) {
    try {
      const url = new URL(safeView.meta.open_graph.url)
      domain = url.host
    } catch {
      // Invalid URL, ignore
    }
  }
  
  return (
    <StrictMode>
      <html lang={safeView.meta.lang || 'en'}>
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>{safeView.meta.title}</title>
          <meta name="description" content={safeView.meta.description || safeView.meta.title} />
          
          {/* Preload Google Fonts */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
          
          {/* Critical CSS inline to prevent FOUC */}
          <style dangerouslySetInnerHTML={{__html: `
            *, *::before, *::after { box-sizing: border-box; }
            * { margin: 0; }
            body { 
              line-height: 1.5; 
              -webkit-font-smoothing: antialiased; 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              background: linear-gradient(135deg, rgb(248 250 252) 0%, rgb(239 246 255) 50%, rgb(224 231 255) 100%);
              margin: 0;
              padding: 0;
              min-height: 100vh;
            }
            
            img, picture, video, canvas, svg { display: block; max-width: 100%; }
            input, button, textarea, select { font: inherit; }
            p, h1, h2, h3, h4, h5, h6 { overflow-wrap: break-word; }
            
            /* Prevent flash of large unstyled elements */
            svg:not([width]):not([height]) {
              width: 1.25rem;
              height: 1.25rem;
            }
            
            /* Basic button styling to prevent FOUC */
            button, .btn, a[class*="btn"] {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              padding: 0.5rem 1rem;
              border-radius: 0.5rem;
              font-weight: 500;
              text-decoration: none;
              transition: all 0.2s;
              cursor: pointer;
              border: none;
            }
            
            /* Basic card styling */
            .card, [class*="card"], [class*="bg-white"] {
              background-color: rgba(255, 255, 255, 0.8);
              border-radius: 1rem;
              padding: 1.5rem;
            }
            
            /* Smooth appear animation */
            body.loading-complete {
              animation: smoothAppear 0.3s ease-out;
            }
            
            @keyframes smoothAppear {
              from { 
                opacity: 0.8; 
                transform: translateY(2px); 
              }
              to { 
                opacity: 1; 
                transform: translateY(0); 
              }
            }
          `}} />
          
          <meta property="og:title" content={safeView.meta.open_graph && safeView.meta.open_graph.title ? safeView.meta.open_graph.title : safeView.meta.title} />
          <meta property="og:description" content={safeView.meta.description || safeView.meta.title} />
          <meta property="og:type" content="website" />
          {safeView.meta.open_graph && (
            <>
              <meta property="og:site_name" content={safeView.meta.open_graph?.site_name} />
              <meta property="og:url" content={safeView.meta.open_graph?.url} />
              <meta property="og:image" content={safeView.meta.open_graph?.image} />
            </>
          )}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={safeView.meta.open_graph && safeView.meta.open_graph.title ? safeView.meta.open_graph.title : safeView.meta.title} />
          <meta name="twitter:description" content={safeView.meta.description || safeView.meta.title} />
          {safeView.meta.open_graph && (
            <>
              <meta property="twitter:domain" content={domain} />
              <meta property="twitter:url" content={safeView.meta.open_graph?.url} />
              <meta name="twitter:image" content={safeView.meta.open_graph?.image} />
            </>
          )}
          {safeView.meta.article && (
            <>
              <meta property="article:publisher" content={safeView.meta.article.publisher} />
              <meta property="article:published_time" content={safeView.meta.article.publishedAt} />
              <meta property="article:modified_time" content={safeView.meta.article.modifiedAt} />
            </>
          )}
          {cssDoms}
          <script dangerouslySetInnerHTML={{__html: authConfigScript}} />
          <script dangerouslySetInnerHTML={{__html: viewScript}} />
          {!isProd && <script type="module" src="/src/client.tsx"></script>}
        </head>
        <body>
          {(() => {
            // If children are provided, use them (for server-side rendering)
            if (children) {
              return children;
            }
            
            // Otherwise, resolve the view from the view name
            const viewName = (view as ViewData & { view_name?: string })?.view_name || safeView.meta?.view_name;
            if (viewName) {
              const ViewComponent = getViewByName(viewName);
              return <ViewComponent {...safeView.props} />;
            }
            
            // Fallback: try to get view name from window._hono_view for client-side
            if (typeof window !== 'undefined' && (window as any)._hono_view) {
              const honoView = (window as any)._hono_view;
              if (honoView.view_name) {
                const ViewComponent = getViewByName(honoView.view_name);
                return <ViewComponent {...(honoView.props || {})} />;
              }
            }
            
            return <div>No view found</div>;
          })()}
          <Toaster />
          {scriptDoms}
          
          {/* Smooth loading completion */}
          <script dangerouslySetInnerHTML={{__html: `
            // Mark loading as complete when DOM and fonts are ready
            function markLoadingComplete() {
              document.body.classList.add('loading-complete');
            }
            
            // Wait for fonts and brief delay to prevent flash
            if (document.fonts && document.fonts.ready) {
              Promise.all([
                document.fonts.ready,
                new Promise(resolve => setTimeout(resolve, 150))
              ]).then(markLoadingComplete);
            } else {
              setTimeout(markLoadingComplete, 200);
            }
            
            // Fallback if document is already loaded
            if (document.readyState === 'complete') {
              setTimeout(markLoadingComplete, 50);
            }
          `}} />
        </body>
      </html>
    </StrictMode>
  )
}
