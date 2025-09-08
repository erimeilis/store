/**
 * Client-side hydration entry point
 * Clean, modular setup using the new layout system
 */

import { hydrateRoot } from 'react-dom/client'
import { LayoutProvider } from '@/components/LayoutProvider'
import { LayoutRenderer } from '@/components/LayoutRenderer'
import { layoutSystem } from '@/lib/layout-system'
import { useThemeStore } from '@/stores/useThemeStore'
import { initializeLayoutSystem } from '@/lib/layout-setup'

// Initialize layout system for client-side
await initializeLayoutSystem()

// Use the server-provided theme to prevent flashing
const initTheme = () => {
  if (typeof window !== 'undefined') {
    // Get theme from server-provided initial theme
    const initialTheme = (window as any).__INITIAL_THEME__ || 'dim'
    
    // Initialize the theme store with the server theme (without triggering cookies again)
    useThemeStore.setState({ theme: initialTheme })
    
    // Theme is already applied by the server-side script, so we don't need to reapply
    console.log('✅ Theme initialized from server:', initialTheme)
  }
}

initTheme()

// Hydrate the client-side React components
const appElement = document.getElementById('app')
if (appElement) {
  // Get the initial props from the server-rendered data
  const initialProps = (window as any).__INITIAL_PROPS__
  
  // Determine which page to hydrate based on current path
  const path = window.location.pathname
  
  // Resolve layout hierarchy for current route
  const { layouts, route } = layoutSystem.resolveLayoutHierarchy(path)
  const params = {}
  const searchParams = Object.fromEntries(
    new URLSearchParams(window.location.search).entries()
  )

  const content = (
    <LayoutProvider
      layoutSystem={layoutSystem}
      currentRoute={path}
      params={params}
      searchParams={searchParams}
    >
      <LayoutRenderer
        route={route!}
        layouts={layouts}
        params={params}
        searchParams={searchParams}
        pageProps={initialProps}
      />
    </LayoutProvider>
  )
  
  hydrateRoot(appElement, content)
  
  console.log('✅ Client-side React hydration complete')
} else {
  console.error('❌ App element not found for hydration')
}