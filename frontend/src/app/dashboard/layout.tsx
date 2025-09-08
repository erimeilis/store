/**
 * Dashboard Layout Component
 * Wraps all dashboard routes with dashboard-specific UI
 */

import React, { useEffect } from 'react'
import { LayoutProps } from '../../types/layout.js'
import { Navbar, NavbarBrand } from '../../components/ui/navbar.js'
import { Button } from '../../components/ui/button.js'
import { HorizontalMenu, MenuItem, MenuDetails } from '../../components/ui/menu.js'
import { IconLogout, IconLayoutDashboard, IconUsers, IconKey, IconMail, IconBox, IconUser } from '@tabler/icons-react'
import { useThemeStore } from '../../stores/useThemeStore.js'

interface DashboardLayoutProps extends LayoutProps {
  user?: {
    name: string
    email: string
    image?: string | null
    theme?: string
  }
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const { theme, toggleTheme, initTheme } = useThemeStore()
  
  useEffect(() => {
    initTheme()
  }, [initTheme])

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
                  <Button
                      size="xl"
                      style="ghost"
                      icon={IconBox}
                      onClick={() => window.location.href = '/dashboard'}
                      className="text-lg font-semibold"
                  >
                      Store CRUD
                  </Button>
              </NavbarBrand>
          }
          center={
              <HorizontalMenu className="px-1">
                  <MenuItem
                      icon={IconLayoutDashboard}
                      href="/dashboard"
                  >
                      Dashboard
                  </MenuItem>
                  <MenuItem
                      icon={IconUsers}
                      href="/dashboard/users"
                  >
                      Users
                  </MenuItem>
                  <MenuDetails
                      summary="Security"
                      icon={IconKey}
                  >
                      <MenuItem
                          icon={IconKey}
                          href="/dashboard/tokens"
                      >
                          API Tokens
                      </MenuItem>
                      <MenuItem
                          icon={IconMail}
                          href="/dashboard/allowed-emails"
                      >
                          Allowed Emails
                      </MenuItem>
                  </MenuDetails>
              </HorizontalMenu>
          }
          end={
              <HorizontalMenu>
                  <MenuDetails
                      summary={
                          <div className="flex items-center gap-3">
                              {user?.image ? (
                                  <img 
                                      src={user.image} 
                                      alt={user.name || 'User'} 
                                      className="w-8 h-8 rounded-full"
                                  />
                              ) : (
                                  <div className="w-8 h-8 bg-neutral rounded-full flex items-center justify-center">
                                      <IconUser size={16} />
                                  </div>
                              )}
                              <div className="text-left">
                                  <div className="font-medium text-sm">{user?.name || 'Unknown User'}</div>
                                  <div className="text-xs opacity-70">{user?.email || 'No email'}</div>
                              </div>
                          </div>
                      }
                  >
                      <MenuItem>
                          <label className="flex cursor-pointer gap-2">
                              <span className="label-text">Light</span>
                              <input 
                                  type="checkbox" 
                                  className="toggle theme-controller" 
                                  checked={theme === 'dim'}
                                  onChange={toggleTheme}
                              />
                              <span className="label-text">Dark</span>
                          </label>
                      </MenuItem>
                      <MenuItem
                          icon={IconLogout}
                          onClick={handleLogout}
                      >
                          Logout
                      </MenuItem>
                  </MenuDetails>
              </HorizontalMenu>
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
