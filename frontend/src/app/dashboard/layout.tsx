/**
 * Dashboard Layout Component
 * Wraps all dashboard routes with dashboard-specific UI
 */

import React, { useEffect, useState } from 'react'
import { LayoutProps } from '@/types/layout'
import { Navbar, NavbarBrand } from '@/components/ui/navbar'
import { Button } from '@/components/ui/button'
import { HorizontalMenu, MenuItem, MenuDetails } from '@/components/ui/menu'
import { IconLogout, IconLayoutDashboard, IconUsers, IconKey, IconMail, IconBox, IconUser, IconTable, IconApi, IconMenu2, IconX, IconShoppingCart } from '@tabler/icons-react'
import { useThemeStore } from '@/stores/useThemeStore'

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    initTheme()
  }, [initTheme])

  const handleLogout = () => {
    window.location.href = '/auth/logout'
  }

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar
        color="base100"
        shadow="md"
        position="sticky"
        start={
          <NavbarBrand>
            {/* Mobile hamburger menu - visible on small screens */}
            <Button
              size="icon"
              style="ghost"
              icon={IconMenu2}
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden mr-2"
              aria-label="Open mobile menu"
            />

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
          // Desktop navigation - hidden on small screens
          <div className="hidden lg:block">
            <HorizontalMenu className="px-1">
              <MenuItem
                icon={IconLayoutDashboard}
                href="/dashboard"
              >
                Dashboard
              </MenuItem>
              <MenuItem
                icon={IconTable}
                href="/dashboard/tables"
              >
                Dynamic Tables
              </MenuItem>
              <MenuDetails
                summary="Sales"
                icon={IconShoppingCart}
              >
                <MenuItem
                  icon={IconShoppingCart}
                  href="/dashboard/sales"
                >
                  Sales Transactions
                </MenuItem>
                <MenuItem
                  icon={IconTable}
                  href="/dashboard/sales/inventory"
                >
                  Inventory Tracking
                </MenuItem>
              </MenuDetails>
              <MenuItem
                icon={IconApi}
                href="/dashboard/docs"
              >
                API Docs
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
          </div>
        }
        end={
          // Desktop user menu - hidden on small screens
          <div className="hidden lg:block">
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
          </div>
        }
      />

      {/* Mobile Menu Overlay - only visible when menu is open */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={closeMobileMenu}
          />

          {/* Mobile Menu Sidebar */}
          <div className="fixed top-0 left-0 h-full w-80 bg-base-200 shadow-xl transform transition-transform duration-300">
            <div className="p-4 space-y-4">
              {/* Header with Close Button */}
              <div className="flex items-center justify-between mb-6">
                <Button
                  size="xl"
                  style="ghost"
                  icon={IconBox}
                  onClick={() => {
                    window.location.href = '/dashboard'
                    closeMobileMenu()
                  }}
                  className="text-lg font-semibold"
                >
                  Store CRUD
                </Button>
                <Button
                  size="icon"
                  style="ghost"
                  icon={IconX}
                  onClick={closeMobileMenu}
                  aria-label="Close mobile menu"
                />
              </div>

              {/* User Info */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-base-300">
                {user?.image ? (
                  <img
                    src={user.image}
                    alt={user.name || 'User'}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-neutral rounded-full flex items-center justify-center">
                    <IconUser size={20} />
                  </div>
                )}
                <div>
                  <div className="font-medium text-sm">{user?.name || 'Unknown User'}</div>
                  <div className="text-xs opacity-70">{user?.email || 'No email'}</div>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="space-y-2">
                <a
                  href="/dashboard"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-base-300 transition-colors"
                >
                  <IconLayoutDashboard size={20} />
                  <span>Dashboard</span>
                </a>
                <a
                  href="/dashboard/tables"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-base-300 transition-colors"
                >
                  <IconTable size={20} />
                  <span>Dynamic Tables</span>
                </a>

                {/* Sales Section */}
                <div className="pt-2">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
                    Sales
                  </div>
                  <a
                    href="/dashboard/sales"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-base-300 transition-colors"
                  >
                    <IconShoppingCart size={20} />
                    <span>Sales Transactions</span>
                  </a>
                  <a
                    href="/dashboard/sales/inventory"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-base-300 transition-colors"
                  >
                    <IconTable size={20} />
                    <span>Inventory Tracking</span>
                  </a>
                </div>

                <a
                  href="/dashboard/docs"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-base-300 transition-colors"
                >
                  <IconApi size={20} />
                  <span>API Docs</span>
                </a>
                <a
                  href="/dashboard/users"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-base-300 transition-colors"
                >
                  <IconUsers size={20} />
                  <span>Users</span>
                </a>

                {/* Security Section */}
                <div className="pt-2">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
                    Security
                  </div>
                  <a
                    href="/dashboard/tokens"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-base-300 transition-colors"
                  >
                    <IconKey size={20} />
                    <span>API Tokens</span>
                  </a>
                  <a
                    href="/dashboard/allowed-emails"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-base-300 transition-colors"
                  >
                    <IconMail size={20} />
                    <span>Allowed Emails</span>
                  </a>
                </div>
              </div>

              {/* Theme Toggle */}
              <div className="pt-4 border-t border-base-300">
                <div className="p-3">
                  <label className="flex cursor-pointer gap-2 items-center">
                    <span className="label-text">Light</span>
                    <input
                      type="checkbox"
                      className="toggle theme-controller"
                      checked={theme === 'dim'}
                      onChange={toggleTheme}
                    />
                    <span className="label-text">Dark</span>
                  </label>
                </div>
              </div>

              {/* Logout */}
              <div className="pt-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-error hover:text-error-content transition-colors w-full text-left"
                >
                  <IconLogout size={20} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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