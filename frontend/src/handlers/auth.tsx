/**
 * Authentication Handlers
 */

import type { Context } from 'hono'
import { createAuthConfig, getGoogleAuthURL } from '../lib/auth.js'
import { LayoutProvider } from '../components/LayoutProvider.js'
import { LayoutRenderer } from '../components/LayoutRenderer.js'
import { layoutSystem } from '../lib/layout-system.js'
import LoginPage from '../app/login/page.js'

export async function handleLoginPage(c: Context) {
  const authConfig = createAuthConfig(c.env)
  
  // Check if already logged in
  const { getCookie } = await import('hono/cookie')
  const { parseSessionCookie } = await import('../lib/middleware.js')
  const sessionCookie = getCookie(c, authConfig.session.cookieName)
  
  if (sessionCookie) {
    try {
      parseSessionCookie(sessionCookie)
      return c.redirect('/dashboard')
    } catch {
      // Invalid session, continue to login
    }
  }
  
  const googleAuthUrl = getGoogleAuthURL(authConfig)

  const content = (
    <LayoutProvider
      layoutSystem={layoutSystem}
      currentRoute="/"
      params={{}}
      searchParams={{}}
    >
      <LayoutRenderer
        route={{
          path: '/',
          segment: 'root',
          component: LoginPage
        }}
        layouts={[]}
        params={{}}
        searchParams={{}}
        pageProps={{ googleAuthUrl }}
      />
    </LayoutProvider>
  )
  
  return c.render(content, { 
    initialProps: { googleAuthUrl },
    adminToken: c.env?.ADMIN_ACCESS_TOKEN,
    theme: c.get('theme')
  })
}

export async function handleOAuthCallback(c: Context) {
  try {
    console.log('🔐 OAuth callback started:', {
      url: c.req.url,
      method: c.req.method,
      hasCode: !!c.req.query('code')
    })
    
    const code = c.req.query('code')
    
    if (!code) {
      console.log('❌ No authorization code provided')
      return c.redirect('/?error=no_code')
    }

    console.log('📞 Exchanging code for tokens...')
    const { exchangeCodeForTokens, getGoogleUserInfo } = await import('../lib/auth.js')
    const { createSessionCookie } = await import('../lib/middleware.js')
    const { setCookie } = await import('hono/cookie')
    
    const callbackAuthConfig = createAuthConfig(c.env)
    const tokens = await exchangeCodeForTokens(code, callbackAuthConfig) as any
    console.log('✅ Tokens received')
    
    const userInfo = await getGoogleUserInfo(tokens.access_token) as any
    console.log('✅ User info received:', {
      id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name
    })
    
    const user = {
      id: userInfo.id,
      name: userInfo.name,
      email: userInfo.email,
      image: userInfo.picture
    }
    
    const sessionCookie = createSessionCookie(user)
    console.log('🍪 Session cookie created')
    
    // Determine if we're in production based on URL hostname
    const isProduction = c.req.url.includes('.workers.dev') || c.req.url.includes('https://')
    
    console.log('🍪 Setting cookie:', {
      cookieName: callbackAuthConfig.session.cookieName,
      isProduction,
      url: c.req.url,
      cookieLength: sessionCookie.length
    })
    
    setCookie(c, callbackAuthConfig.session.cookieName, sessionCookie, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'Lax',
      maxAge: callbackAuthConfig.session.maxAge,
      path: '/'
    })
    
    console.log('🎯 Redirecting to dashboard...')
    return c.redirect('/dashboard')
    
  } catch (error) {
    console.error('❌ OAuth callback error:', error)
    return c.redirect('/?error=auth_failed')
  }
}

export async function handleLogout(c: Context) {
  const { deleteCookie } = await import('hono/cookie')
  const logoutAuthConfig = createAuthConfig(c.env)
  deleteCookie(c, logoutAuthConfig.session.cookieName)
  return c.redirect('/')
}