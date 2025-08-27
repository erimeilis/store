import './styles/globals.css'

// Since we're using a simple anchor link approach, we don't need complex client-side JavaScript
// Just load the styles and maybe add some basic functionality if needed in the future

if (typeof window !== 'undefined') {
  console.log('[DEBUG] Client-side script loaded - Using anchor link approach')
  console.log('[DEBUG] Google OAuth is handled by simple anchor links, no JavaScript needed')
}
