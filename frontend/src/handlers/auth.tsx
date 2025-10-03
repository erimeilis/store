/**
 * Authentication Handlers
 */

import type { Context } from 'hono'
import { createAuthConfig, getGoogleAuthURL } from '@/lib/auth'
import { LayoutProvider } from '@/components/LayoutProvider'
import { LayoutRenderer } from '@/components/LayoutRenderer'
import { layoutSystem } from '@/lib/layout-system'
import LoginPage from '@/app/login/page'

export async function handleLoginPage(c: Context) {
  const authConfig = createAuthConfig(c.env)
  
  // Check if already logged in
  const { getCookie } = await import('hono/cookie')
  const { parseSessionCookie } = await import('@/lib/middleware')
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

  // Extract search parameters from the request URL
  const url = new URL(c.req.url)
  const searchParams = Object.fromEntries(url.searchParams.entries())

  const content = (
    <LayoutProvider
      layoutSystem={layoutSystem}
      currentRoute="/"
      params={{}}
      searchParams={searchParams}
    >
      <LayoutRenderer
        route={{
          path: '/',
          segment: 'root',
          component: LoginPage
        }}
        layouts={[]}
        params={{}}
        searchParams={searchParams}
        pageProps={{ 
          googleAuthUrl,
          error: searchParams.error,
          message: searchParams.message
        }}
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
    const { exchangeCodeForTokens, getGoogleUserInfo } = await import('@/lib/auth')
    const { createSessionCookie } = await import('@/lib/middleware')
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
    
    // Fetch or create user based on allowed_emails validation
    let userRole = 'user' // Default role
    let userExists = false
    
    try {
      const apiUrl = c.env?.API_URL || 'http://localhost:8787'
      const adminToken = c.env?.ADMIN_ACCESS_TOKEN || ''
      
      console.log('🔍 OAuth callback - API config:', {
        apiUrl,
        hasAdminToken: !!adminToken,
        adminTokenStart: adminToken ? adminToken.substring(0, 10) + '...' : 'MISSING',
        userEmail: userInfo.email
      })
      
      // Look up user by exact email match
      const userResponse = await fetch(`${apiUrl}/api/users?filterEmail=${encodeURIComponent(userInfo.email)}&exact=true`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (userResponse.ok) {
        const userResult = await userResponse.json() as any
        // API returns paginated results, get the first user from the data array
        if (userResult.data && userResult.data.length > 0) {
          const dbUser = userResult.data[0]
          userRole = dbUser.role || 'user'
          userExists = true
          console.log('✅ Existing user found in database:', { email: userInfo.email, role: userRole })
        } else {
          console.log('⚠️ User not found in database, checking if this is the first user...')

          // Check if there are any users at all (first user becomes admin)
          const allUsersResponse = await fetch(`${apiUrl}/api/users?limit=1`, {
            headers: {
              'Authorization': `Bearer ${adminToken}`,
              'Content-Type': 'application/json'
            }
          })

          if (allUsersResponse.ok) {
            const allUsersResult = await allUsersResponse.json() as any
            const userCount = allUsersResult.total || 0
            const isFirstUser = userCount === 0

            console.log(isFirstUser ? '🎉 First user registration - creating admin account for:' : '👥 New user registration for:', userInfo.email)

            // Use /api/users POST for ALL user creation (first user or not)
            // This endpoint has proper email validation and first-user-admin logic built-in
            const createUserResponse = await fetch(`${apiUrl}/api/users`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                email: userInfo.email,
                name: userInfo.name,
                picture: userInfo.picture,
                role: 'user' // Backend will override to 'admin' for first user
              })
            })

            if (createUserResponse.ok) {
              const newUser = await createUserResponse.json() as any
              userRole = newUser.role || 'user'
              userExists = true
              console.log('✅ User created successfully:', { email: userInfo.email, role: userRole, isFirstUser })
            } else {
              // User creation failed - handle error and redirect
              const errorText = await createUserResponse.text()
              console.error('❌ Failed to create user:', {
                status: createUserResponse.status,
                statusText: createUserResponse.statusText,
                body: errorText
              })

              // Parse error response
              let errorMessage = 'Failed to create user account'
              try {
                const errorJson = JSON.parse(errorText)
                console.log('📋 Parsed error JSON:', errorJson)

                // Check for email validation error (403 status)
                if (createUserResponse.status === 403 || errorJson.error === 'Email not allowed' || errorJson.details?.includes('allowed_emails')) {
                  errorMessage = errorJson.errors?.email || errorJson.message || errorJson.details || 'Email not in allowed list'
                  console.log('🚫 Email validation failed:', errorMessage)
                } else {
                  errorMessage = errorJson.message || errorJson.error || errorMessage
                }
              } catch (parseError) {
                console.error('Failed to parse error JSON:', parseError)
                // Use raw error text if JSON parsing fails
                errorMessage = errorText || errorMessage
              }

              // CRITICAL: Do not continue - redirect immediately
              console.log('🔀 User creation failed, redirecting to login with error')
              return c.redirect(`/?error=access_denied&message=${encodeURIComponent(errorMessage)}`)
            }
          } else {
            console.error('❌ Failed to check user count:', await allUsersResponse.text())
            throw new Error('Failed to check existing users')
          }
        }
      } else {
        console.log('⚠️ User lookup API call failed:', await userResponse.text())
        throw new Error('Failed to check user access')
      }
    } catch (error) {
      console.error('❌ OAuth callback error during user validation:', error)
      // Redirect to login with specific error
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed'
      return c.redirect(`/?error=access_denied&message=${encodeURIComponent(errorMessage)}`)
    }
    
    // Only proceed if user exists or was created successfully
    console.log('🔐 Final authentication check:', {
      userExists,
      userRole,
      userEmail: userInfo.email,
      willCreateSession: userExists
    })

    if (!userExists) {
      console.error('❌ User authentication failed - no valid user account')
      console.error('❌ BLOCKING ACCESS - redirecting to login')
      return c.redirect('/?error=no_access&message=Access%20denied')
    }

    console.log('✅ User authentication successful, creating session...')
    const user = {
      id: userInfo.id,
      name: userInfo.name,
      email: userInfo.email,
      image: userInfo.picture,
      role: userRole
    }

    const sessionCookie = createSessionCookie(user)
    console.log('🍪 Session cookie created:', {
      email: user.email,
      role: user.role,
      cookieLength: sessionCookie.length
    })
    
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
    console.error('❌ Error type:', typeof error, 'Error instanceof Error:', error instanceof Error)
    console.error('❌ Error message:', error instanceof Error ? error.message : 'No message')
    
    // If the error already contains access denied information, preserve it
    if (error instanceof Error && (
      error.message.includes('Access denied:') || 
      error.message.includes('not in the allowed list') ||
      error.message.includes('Email') && error.message.includes('allowed')
    )) {
      const errorMessage = error.message.replace('Error: ', '').replace('Access denied: ', '')
      console.log('🔀 Redirecting with access denied error:', errorMessage)
      return c.redirect(`/?error=access_denied&message=${encodeURIComponent(errorMessage)}`)
    }
    console.log('🔀 Redirecting with generic auth failed error')
    return c.redirect('/?error=auth_failed')
  }
}

export async function handleLogout(c: Context) {
  const { deleteCookie } = await import('hono/cookie')
  const logoutAuthConfig = createAuthConfig(c.env)
  deleteCookie(c, logoutAuthConfig.session.cookieName)
  return c.redirect('/')
}