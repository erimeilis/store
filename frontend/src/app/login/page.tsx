/**
 * Login Page Component
 * Simple Google authentication page (matches original design)
 */

import React from 'react'
import { PageProps } from '@/types/layout'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardTitle, CardActions } from '@/components/ui/card'
import { IconBrandGoogleFilled } from '@tabler/icons-react'

interface LoginPageProps extends PageProps {
  googleAuthUrl?: string
  error?: string
  message?: string
}

export default function LoginPage({ params: _params, searchParams: _searchParams, googleAuthUrl = '/auth/google', error, message }: LoginPageProps) {
  // Client-side error message state to avoid hydration issues
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [mounted, setMounted] = React.useState(false)
  
  React.useEffect(() => {
    setMounted(true)
    
    // Parse URL parameters client-side to avoid SSR/client mismatch
    const urlParams = new URLSearchParams(window.location.search)
    const urlError = urlParams.get('error')
    const urlMessage = urlParams.get('message')
    
    // Use props first, then URL params
    const finalError = error || urlError
    const finalMessage = message || urlMessage
    
    if (finalError) {
      let errorText = ''
      switch (finalError) {
        case 'access_denied':
          errorText = finalMessage ? decodeURIComponent(finalMessage) : 'Access denied. Your email is not authorized.'
          break
        case 'no_access':
          errorText = 'Access denied. Your email is not in the allowed list.'
          break
        case 'auth_failed':
          errorText = 'Authentication failed. Please try again.'
          break
        case 'no_code':
          errorText = 'Authentication was cancelled or failed.'
          break
        default:
          errorText = finalMessage ? decodeURIComponent(finalMessage) : 'An error occurred during authentication.'
      }
      setErrorMessage(errorText)
    }
  }, [error, message])
  
  // Don't render error on server side to avoid hydration mismatch
  const showError = mounted && errorMessage

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="w-full max-w-md p-8">
        <Card shadow="xl" size="xl">
          <CardBody className="items-center text-center">
            {/* Title */}
            <CardTitle className="text-3xl mb-2">Store</CardTitle>
            
            {/* Description */}
            <p className="text-base-content/70 mb-6">
              A modern store management application built with Hono
            </p>
            
            {/* Error Message */}
            {showError && (
              <div className="mb-6 p-4 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
                <div className="flex flex-col">
                  <p className="font-medium">{errorMessage}</p>
                  <p className="mt-2 text-xs opacity-80">
                    Contact your administrator to add your email to the allowed list.
                  </p>
                </div>
              </div>
            )}
            
            {/* Sign in Button */}
            <CardActions className="w-full flex justify-center">
              <Button
                color="primary"
                style="soft"
                modifier="wide"
                icon={IconBrandGoogleFilled}
                onClick={() => window.location.href = googleAuthUrl}
              >
                Sign in with Google
              </Button>
            </CardActions>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Login - Store Management',
  description: 'Sign in to your store management account'
}