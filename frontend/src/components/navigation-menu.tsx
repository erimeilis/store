/**
 * Shared Navigation Menu Components
 * Used in both desktop horizontal menu and mobile drawer
 */

import React from 'react'
import { MenuItem, MenuDetails } from '@/components/ui/menu'
import { IconLayoutDashboard, IconUsers, IconKey, IconMail, IconTable, IconApi, IconLogout, IconUser } from '@tabler/icons-react'

interface NavigationMenuProps {
  className?: string
  isMobile?: boolean
}

export function MainNavigationMenu({ className, isMobile }: NavigationMenuProps) {
  return (
    <div className={className}>
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
      {isMobile ? (
        // In mobile, show security items as regular menu items
        <>
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
        </>
      ) : (
        // In desktop, show security as dropdown
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
      )}
    </div>
  )
}

interface UserMenuProps {
  user?: {
    name: string
    email: string
    image?: string | null
    theme?: string
  }
  theme: string
  onToggleTheme: () => void
  onLogout: () => void
  isMobile?: boolean
}

export function UserMenu({ user, theme, onToggleTheme, onLogout, isMobile }: UserMenuProps) {
  if (isMobile) {
    // In mobile drawer, show user info and actions as separate items
    return (
      <div className="space-y-2">
        {/* User Info */}
        <div className="flex items-center gap-3 p-2 rounded-lg bg-base-300">
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

        {/* Theme Toggle */}
        <div className="p-2">
          <label className="flex cursor-pointer gap-2 items-center">
            <span className="label-text">Light</span>
            <input
              type="checkbox"
              className="toggle theme-controller"
              checked={theme === 'dim'}
              onChange={onToggleTheme}
            />
            <span className="label-text">Dark</span>
          </label>
        </div>

        {/* Logout */}
        <MenuItem
          icon={IconLogout}
          onClick={onLogout}
        >
          Logout
        </MenuItem>
      </div>
    )
  }

  // Desktop dropdown menu (existing behavior)
  return (
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
            onChange={onToggleTheme}
          />
          <span className="label-text">Dark</span>
        </label>
      </MenuItem>
      <MenuItem
        icon={IconLogout}
        onClick={onLogout}
      >
        Logout
      </MenuItem>
    </MenuDetails>
  )
}