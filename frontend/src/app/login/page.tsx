/**
 * Login Page Component
 * Simple Google authentication page (matches original design)
 */

import React from 'react'
import { PageProps } from '../../types/layout.js'
import { Button } from '../../components/ui/button.js'
import { Card, CardBody, CardTitle, CardActions } from '../../components/ui/card.js'
import { IconBrandGoogleFilled } from '@tabler/icons-react'

interface LoginPageProps extends PageProps {
  googleAuthUrl?: string
}

export default function LoginPage({ params: _params, searchParams: _searchParams, googleAuthUrl = '/auth/google' }: LoginPageProps) {

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="w-full max-w-md p-8">
        <Card shadow="xl" size="xl">
          <CardBody className="items-center text-center">
            {/* Title */}
            <CardTitle className="text-3xl mb-2">Store CRUD</CardTitle>
            
            {/* Description */}
            <p className="text-base-content/70 mb-8">
              A modern store management application built with Hono
            </p>
            
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