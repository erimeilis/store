import React from "react"

// Simple stub Toaster component to replace sonner for Cloudflare Workers compatibility
// This prevents MessageChannel errors while maintaining the same API
type ToasterProps = {
  className?: string
  toastOptions?: any
  [key: string]: any
}

const Toaster = ({ ...props }: ToasterProps) => {
  // Return null to render nothing - this prevents the MessageChannel compatibility issue
  // In a production app, you could implement a simple toast system here if needed
  return null
}

export { Toaster }
