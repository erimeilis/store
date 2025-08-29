/**
 * Root Layout Component
 * This is the top-level layout that wraps the entire application
 * Similar to Next.js app/layout.tsx
 */

import React from 'react'
import { LayoutProps } from '../types/layout.js'
import { Navbar } from '../components/ui/navbar.js'
// CSS is handled by the build process and served as static assets

export default function RootLayout({ children }: LayoutProps) {
  return (
    <>
      {children}
    </>
  )
}

export const metadata = {
  title: 'Store Management System',
  description: 'Full-stack store CRUD application built with Hono and React',
  keywords: ['store', 'inventory', 'management', 'hono', 'react', 'cloudflare'],
  openGraph: {
    title: 'Store Management System',
    description: 'Full-stack store CRUD application built with Hono and React',
    images: ['/og-image.png']
  }
}
