// Simple authentication using Google OAuth without database dependency
export const createAuthConfig = (env: any = {}) => ({
  google: {
    clientId: env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET || '',
    redirectURI: env.GOOGLE_REDIRECT_URI || process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5173/auth/callback/google'
  },
  session: {
    maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    cookieName: 'auth_session'
  },
  baseURL: env.AUTH_BASE_URL || process.env.AUTH_BASE_URL || 'http://localhost:5173'
})

// Default auth config for backwards compatibility
export const authConfig = createAuthConfig()

// Client-safe configuration (no secrets exposed)
export const getClientAuthConfig = () => ({
  google: {
    clientId: typeof window !== 'undefined' 
      ? (window as any).__GOOGLE_CLIENT_ID__ 
      : process.env.GOOGLE_CLIENT_ID || '',
    redirectURI: typeof window !== 'undefined'
      ? (window as any).__GOOGLE_REDIRECT_URI__
      : process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5173/auth/callback/google'
  }
})

// Generate Google OAuth URL
export function getGoogleAuthURL(authConfig?: ReturnType<typeof createAuthConfig>) {
  const config = authConfig || createAuthConfig()
  const clientConfig = typeof window !== 'undefined' 
    ? getClientAuthConfig()
    : config
  
  const params = new URLSearchParams({
    client_id: clientConfig.google.clientId,
    redirect_uri: clientConfig.google.redirectURI,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline'
  })
  
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

// Exchange code for tokens
export async function exchangeCodeForTokens(code: string, authConfig?: ReturnType<typeof createAuthConfig>) {
  const config = authConfig || createAuthConfig()
  
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: config.google.clientId,
      client_secret: config.google.clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: config.google.redirectURI,
    }),
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error('Token exchange failed:', response.status, errorText)
    throw new Error(`Failed to exchange code for tokens: ${response.status} ${errorText}`)
  }
  
  return response.json()
}

// Get user info from Google
export async function getGoogleUserInfo(accessToken: string) {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
  
  if (!response.ok) {
    throw new Error('Failed to get user info')
  }
  
  return response.json()
}
