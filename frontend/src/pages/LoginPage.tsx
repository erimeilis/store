import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {IconBrandGoogleFilled} from '@tabler/icons-react'

interface LoginPageProps {
  googleAuthUrl: string
}

export const LoginPage = ({ googleAuthUrl }: LoginPageProps) => (
  <div className="min-h-screen flex items-center justify-center bg-base-200">
    <div className="w-full max-w-md p-8">
      <Card shadow="xl" size="xl">
        <Card.Body className="items-center text-center">

          {/* Title */}
          <Card.Title className="text-3xl mb-2">Store CRUD</Card.Title>
          
          {/* Description */}
          <p className="text-base-content/70 mb-8">
            A modern store management application built with Hono
          </p>
          
          {/* Sign in Button */}
          <Card.Actions className="w-full flex justify-center">
            <Button
              color="primary"
              style="soft"
              modifier="wide"
              icon={IconBrandGoogleFilled}
              onClick={() => window.location.href = googleAuthUrl}
            >
              Sign in with Google
            </Button>
          </Card.Actions>
        </Card.Body>
      </Card>
    </div>
  </div>
)
