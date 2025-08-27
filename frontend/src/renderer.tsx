import React from 'react'
import { reactRenderer } from '@hono/react-renderer'
import { hydrateRoot, createRoot } from 'react-dom/client'
import App from './view/App'
import { ViewData } from './global'
import { Toaster } from './components/ui/sonner'

const views: Map<string, React.FC<any>> = new Map()

export default function Empty() {
  return <></>
}

export function getViewByName(name: string): React.FC<any> {
  const cmp = views.get(name)
  if (cmp === undefined) {
    return Empty
  } else {
    return cmp
  }
}

export function storeViewByName(name: string, item: React.FC<any>): void {
  views.set(name, item)
}

// Custom renderer that handles view resolution
export const Renderer = reactRenderer(
  (props: any) => {
    // In @hono/react-renderer, the first argument to c.render() becomes the children prop
    // We need to intercept this to get the view name
    const viewName = typeof props.children === 'string' ? props.children : null;
    const viewData = props;
    
    if (viewName && views.has(viewName)) {
      // Resolve view name to component
      const ViewComponent = getViewByName(viewName);
      const enhancedView = {
        ...viewData,
        view_name: viewName
      };
      
      return (
        <App view={enhancedView} manifest={enhancedView.meta?.manifest}>
          <ViewComponent {...(viewData.props || {})} />
        </App>
      );
    }
    
    // Fallback to default behavior
    return (
      <App view={viewData} manifest={viewData.meta?.manifest}>
        {props.children}
      </App>
    );
  },
  {
    docType: true
  }
)

export const viewRenderer = (name: string, view: ViewData) => {
  console.log('[DEBUG] viewRenderer called with:', name, view)
  const Comp = getViewByName(name)
  console.log('[DEBUG] Component resolved:', Comp)
  
  // Properly hydrate the body to match server-side rendering
  const bodyElement = document.body
  if (bodyElement) {
    console.log('[DEBUG] Hydrating body element')
    
    // The server renders the body with: {children}<Toaster />{scriptDoms}
    // We need to hydrate the entire body content to match
    try {
      hydrateRoot(bodyElement, (
        <>
          <Comp {...view.props} />
          <Toaster />
        </>
      ))
      console.log('[DEBUG] Hydration successful')
    } catch (error) {
      console.error('[DEBUG] Hydration failed, falling back to client-side rendering:', error)
      
      // Fallback: clear and render from scratch
      bodyElement.innerHTML = ''
      const rootElement = document.createElement('div')
      rootElement.id = 'react-root'
      bodyElement.appendChild(rootElement)
      
      const root = createRoot(rootElement)
      root.render(
        <>
          <Comp {...view.props} />
          <Toaster />
        </>
      )
    }
  }
}
