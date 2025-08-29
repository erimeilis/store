import { hydrateRoot } from 'react-dom/client'
import { LayoutProvider } from '@/components/LayoutProvider'
import { LayoutRenderer } from '@/components/LayoutRenderer'
import { layoutSystem } from '@/lib/layout-system'
import RootLayout from '@/app/layout'
import DashboardLayout from '@/app/dashboard/layout'
import DashboardPage from '@/app/dashboard/page'
import LoginPage from '@/app/login/page'
import { initializeTheme } from '@/lib/theme'
// CSS is now served as a static asset instead of being imported

// Register layouts and pages with the layout system (same as server)
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

// Initialize theme system
initializeTheme()

// Hydrate the client-side React components with layout system
const appElement = document.getElementById('app')
if (appElement) {
  // Get the initial props from the server-rendered data
  const initialProps = (window as any).__INITIAL_PROPS__
  
  // Determine which page to hydrate based on current path
  const path = window.location.pathname
  
  // Resolve layout hierarchy for current route (same as server)
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
}

console.log('Client-side React hydration complete with theme system initialized');