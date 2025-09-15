/**
 * Error Page Handler
 */

import type { Context } from 'hono'
import React from 'react'
import { LayoutProvider } from '@/components/LayoutProvider'
import { layoutSystem } from '@/lib/layout-system'
import ErrorPage from '@/components/ErrorPage'

export async function handleErrorPage(c: Context) {
  const code = parseInt(c.req.query('code') || '500')
  const message = c.req.query('message') || 'An error occurred'
  
  // Error configurations for different error types (same as in page component)
  const errorConfigs: Record<number, { title: string; description: string }> = {
    400: {
      title: "Bad Request",
      description: "The server couldn't understand your request. Please check your input and try again."
    },
    401: {
      title: "Unauthorized",
      description: "You don't have permission to access this resource. Please log in and try again."
    },
    402: {
      title: "Payment Required",
      description: "This resource requires payment or a valid subscription to access."
    },
    403: {
      title: "Forbidden",
      description: "Access to this resource is forbidden. You don't have the necessary permissions."
    },
    404: {
      title: "Page Not Found",
      description: "The page you're looking for doesn't exist or has been moved to another location."
    },
    405: {
      title: "Method Not Allowed",
      description: "The request method is not supported for this resource."
    },
    408: {
      title: "Request Timeout",
      description: "The server timed out waiting for your request. Please try again."
    },
    429: {
      title: "Too Many Requests",
      description: "You've made too many requests too quickly. Please wait a moment and try again."
    },
    500: {
      title: "Internal Server Error",
      description: "Something went wrong on our end. We're working to fix this issue."
    },
    502: {
      title: "Bad Gateway",
      description: "The server received an invalid response. Please try again in a few moments."
    },
    503: {
      title: "Service Unavailable",
      description: "The service is temporarily unavailable. Please try again later."
    },
    504: {
      title: "Gateway Timeout",
      description: "The server didn't respond in time. Please try your request again."
    }
  }

  // Use specific config or fallback to generic error
  const config = errorConfigs[code] || {
    title: `Error ${code}`,
    description: message || "An unexpected error occurred. Please try again or contact support if the problem persists."
  }
  
  const errorConfig = {
    errorCode: code,
    title: config.title,
    description: message ? decodeURIComponent(message) : config.description
  }


  const params = {}
  const searchParams = Object.fromEntries(
    Object.entries(c.req.queries()).map(([key, values]) => [key, values[0] || ''])
  )

  // Render ErrorPage directly without going through the layout system Promise resolution
  const content = (
    <LayoutProvider
      layoutSystem={layoutSystem}
      currentRoute={c.req.path}
      params={params}
      searchParams={searchParams}
    >
      <ErrorPage {...errorConfig} />
    </LayoutProvider>
  )

  return c.render(content, { 
    theme: c.get('theme')
  })
}