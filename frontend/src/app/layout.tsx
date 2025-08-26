import type { Metadata } from 'next'
import './globals.css'
import SessionProvider from '@/components/SessionProvider'
import AuthNav from '@/components/AuthNav'

export const metadata: Metadata = {
  title: 'Store CRUD API - Dashboard',
  description: 'Manage store items with CRUD operations and authentication',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <SessionProvider>
          <nav className="bg-blue-600 text-white p-4 shadow-sm">
            <div className="container mx-auto flex justify-between items-center">
              <h1 className="text-2xl font-bold">Store CRUD Dashboard</h1>
              <AuthNav />
            </div>
          </nav>
          <main className="container mx-auto p-6">
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  )
}
