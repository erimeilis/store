import { hydrateRoot } from 'react-dom/client'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { initializeTheme } from '@/lib/theme'
import '@/styles/globals.css'

// Initialize theme system
initializeTheme()

// Hydrate the client-side React components
const appElement = document.getElementById('app')
if (appElement) {
  // Get the initial props from the server-rendered data
  const initialProps = (window as any).__INITIAL_PROPS__
  
  // Determine which page to hydrate based on current path
  const path = window.location.pathname
  
  if (path === '/') {
    hydrateRoot(appElement, <LoginPage {...initialProps} />)
  } else if (path === '/dashboard') {
    hydrateRoot(appElement, <DashboardPage {...initialProps} />)
  }
}

console.log('Client-side React hydration complete with theme system initialized');