// Simple theme utility for DaisyUI theme switching
export function initializeTheme() {
  // DaisyUI themes are set via data-theme attribute on html element
  // Default theme is already set in index.tsx as 'dim' (dark theme)
  
  // Optional: Add theme switching logic here if needed
  // For now, just log that theme system is initialized
  console.log('Theme system initialized with DaisyUI')
}

export function setTheme(theme: 'dim' | 'nord') {
  document.documentElement.setAttribute('data-theme', theme)
}

export function getTheme(): string {
  return document.documentElement.getAttribute('data-theme') || 'dim'
}