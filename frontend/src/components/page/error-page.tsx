import React from 'react'
import { Link } from '@/components/ui/link'

interface ErrorPageProps {
  errorCode: number
  title: string
  description: string
}

const ErrorPage: React.FC<ErrorPageProps> = ({ errorCode, title, description }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative p-8">
        <div className="text-center space-y-6 max-w-2xl mx-auto">
          {/* Error Code - Large display */}
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-primary opacity-90 select-none">
              {errorCode}
            </h1>
          </div>

          {/* Title */}
          <div>
            <h2 className="text-4xl font-bold text-base-content mb-4">
              {title}
            </h2>
          </div>

          {/* Description */}
          <div>
            <p className="text-lg text-base-content/80 leading-relaxed max-w-xl mx-auto">
              {description}
            </p>
          </div>

          {/* Back to Home Button */}
          <div className="mt-8">
            <Link
              href="/" 
              color="success"
            >
              Back to Home
            </Link>
          </div>
        </div>
    </div>
  )
}

export default ErrorPage
