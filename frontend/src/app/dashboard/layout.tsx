/**
 * Dashboard Layout Component
 * Wraps all dashboard routes with dashboard-specific UI
 */

import React from 'react'
import { LayoutProps } from '../../types/layout.js'
import { Navbar, NavbarBrand } from '../../components/ui/navbar.js'
import { Button } from '../../components/ui/button.js'
import { IconLogout } from '@tabler/icons-react'

interface DashboardLayoutProps extends LayoutProps {
  user?: {
    name: string
    email: string
    image?: string | null
  }
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const handleLogout = () => {
    window.location.href = '/auth/logout'
  }
  return (
      <div className="min-h-screen bg-base-200">
      <Navbar
          color="base100"
          shadow="md"
          position="sticky"
          start={
              <NavbarBrand>
                  Store CRUD
              </NavbarBrand>
          }
          end={
              <div className="flex flex-row gap-4">
                  <div className="p-2 my-auto text-sm">
                      Logged in as: {user?.email || 'Unknown'}
                  </div>
                  <Button
                      style="ghost"
                      icon={IconLogout}
                      onClick={handleLogout}
                  >
                      Logout
                  </Button>
              </div>
          }
      />

    {/* Main Content */}
    <div className="container mx-auto px-4 py-8">
        {children}
    </div>
</div>
  )
}

export const metadata = {
  title: 'Dashboard - Store Management',
  description: 'Manage your store inventory, view analytics, and configure settings'
}
