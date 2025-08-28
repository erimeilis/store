// Theme management utility for DaisyUI theme switching

export type Theme = 'dim' | 'nord'

export const themes: Record<Theme, { name: string; type: 'light' | 'dark' }> = {
  dim: { name: 'Dim', type: 'dark' },
  nord: { name: 'Nord', type: 'light' }
}

export const defaultTheme: Theme = 'dim'

/**
 * Get the current theme from localStorage or return default
 */
export function getCurrentTheme(): Theme {
  if (typeof window === 'undefined') return defaultTheme
  
  const stored = localStorage.getItem('theme') as Theme
  return stored && stored in themes ? stored : defaultTheme
}

/**
 * Set theme on the document and save to localStorage
 */
export function setTheme(theme: Theme): void {
  if (typeof window === 'undefined') return
  
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
}

/**
 * Initialize theme on page load
 */
export function initializeTheme(): void {
  if (typeof window === 'undefined') return
  
  const theme = getCurrentTheme()
  setTheme(theme)
}

/**
 * Toggle between the two themes
 */
export function toggleTheme(): Theme {
  const current = getCurrentTheme()
  
  // Toggle between dim (dark) and nord (light)
  const newTheme: Theme = current === 'dim' ? 'nord' : 'dim'
  setTheme(newTheme)
  
  return newTheme
}

/**
 * Get system preference for dark mode
 */
export function getSystemThemePreference(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark'
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}