import { getGoogleAuthURL } from './auth'

// Client-side authentication utilities
export class AuthClient {
  // Check if user is currently authenticated
  static isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false
    
    const sessionCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_session='))
      ?.split('=')[1]
    
    if (!sessionCookie) return false
    
    try {
      const session = JSON.parse(atob(sessionCookie))
      return session.exp > Date.now()
    } catch {
      return false
    }
  }
  
  // Get current user from session
  static getCurrentUser() {
    if (typeof window === 'undefined') return null
    
    const sessionCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_session='))
      ?.split('=')[1]
    
    if (!sessionCookie) return null
    
    try {
      const session = JSON.parse(atob(sessionCookie))
      return session.exp > Date.now() ? session : null
    } catch {
      return null
    }
  }
}

// Helper function to sign in with Google
export const signInWithGoogle = () => {
  console.log('[DEBUG] signInWithGoogle called')
  const authURL = getGoogleAuthURL()
  console.log('[DEBUG] Generated OAuth URL:', authURL)
  window.location.href = authURL
}

// Helper function to sign out and redirect
export const signOutAndRedirect = async () => {
  try {
    // Call logout endpoint to clear session
    await fetch('/auth/logout', {
      method: 'POST',
      credentials: 'include'
    })
  } catch (error) {
    console.error('Sign out error:', error)
  } finally {
    // Always redirect to home page
    window.location.href = '/'
  }
}
