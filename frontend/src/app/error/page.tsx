import React from 'react'
import ErrorPage from '@/components/page/error-page'

interface ErrorPageComponentProps {
  params: any
  searchParams: {
    code?: string
    message?: string
    type?: string
  } | Promise<{
    code?: string
    message?: string
    type?: string
  }>
}

// Error page component that reads error details from URL parameters
export default function ErrorPageWrapper({ params: _params, searchParams }: ErrorPageComponentProps) {
  // Handle both Promise and non-Promise searchParams
  let actualSearchParams: { code?: string; message?: string; type?: string } = {}
  
  if (searchParams && typeof searchParams === 'object' && 'then' in searchParams) {
    // This is a Promise - fallback to URL parsing for client-side
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      actualSearchParams = {
        code: urlParams.get('code') || undefined,
        message: urlParams.get('message') || undefined,
        type: urlParams.get('type') || undefined,
      }
    } else {
      // Server-side - shouldn't happen with this structure, but fallback
      actualSearchParams = { code: '500' }
    }
  } else {
    // Normal searchParams object
    actualSearchParams = searchParams as { code?: string; message?: string; type?: string }
  }
  
  // Parse error code from URL parameters
  const errorCode = actualSearchParams.code ? parseInt(actualSearchParams.code, 10) : 500
  const errorMessage = actualSearchParams.message ? decodeURIComponent(actualSearchParams.message) : null

  // Determine title and description based on error code
  let title: string
  let description: string

  switch (errorCode) {
    case 400:
      title = "Bad Request"
      description = errorMessage || "The request could not be understood by the server."
      break
    case 401:
      title = "Unauthorized"
      description = errorMessage || "Authentication is required to access this resource."
      break
    case 403:
      title = "Forbidden"
      description = errorMessage || "You don't have permission to access this resource."
      break
    case 404:
      title = "Page Not Found"
      description = errorMessage || "The page you're looking for doesn't exist or has been moved."
      break
    case 500:
    default:
      title = "Internal Server Error"
      description = errorMessage || "Something went wrong on our end. We're working to fix this issue."
      break
  }

  return (
    <ErrorPage 
      errorCode={errorCode}
      title={title}
      description={description}
    />
  )
}