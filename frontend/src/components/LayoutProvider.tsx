/**
 * LayoutProvider - React context provider for the layout system
 * Manages layout state, routing, and provides layout context to components
 */

import React, { createContext, useContext, useCallback, useMemo, ReactNode } from 'react'
import { LayoutContext, LayoutConfig, LayoutSystemOptions } from '../types/layout.js'
import { LayoutSystemCore, layoutSystem as defaultLayoutSystem } from '../lib/layout-system.js'

interface LayoutProviderProps {
  children: ReactNode
  layoutSystem?: LayoutSystemCore
  currentRoute: string
  params?: Record<string, string>
  searchParams?: Record<string, string | string[]>
  options?: LayoutSystemOptions
}

const LayoutContextProvider = createContext<LayoutContext | null>(null)

export function LayoutProvider({
  children,
  layoutSystem = defaultLayoutSystem,
  currentRoute,
  params = {},
  searchParams = {},
  options: _options = {}
}: LayoutProviderProps) {
  // Get layout stack for current route
  const layoutStack = useMemo(() => {
    return layoutSystem.getLayoutsForRoute(currentRoute)
  }, [layoutSystem, currentRoute])

  // Layout registration functions
  const registerLayout = useCallback((config: LayoutConfig) => {
    layoutSystem.register(config)
  }, [layoutSystem])

  const unregisterLayout = useCallback((path: string) => {
    layoutSystem.unregister(path)
  }, [layoutSystem])

  // Create context value
  const contextValue = useMemo<LayoutContext>(() => ({
    currentRoute,
    params,
    searchParams,
    layoutStack,
    registerLayout,
    unregisterLayout
  }), [currentRoute, params, searchParams, layoutStack, registerLayout, unregisterLayout])

  return (
    <LayoutContextProvider.Provider value={contextValue}>
      {children}
    </LayoutContextProvider.Provider>
  )
}

/**
 * Hook to access layout context
 */
export function useLayoutContext(): LayoutContext {
  const context = useContext(LayoutContextProvider)
  if (!context) {
    throw new Error('useLayoutContext must be used within a LayoutProvider')
  }
  return context
}

/**
 * Hook to access current route information
 */
export function useRoute() {
  const { currentRoute, params, searchParams } = useLayoutContext()
  return { currentRoute, params, searchParams }
}

/**
 * Hook to access layout stack
 */
export function useLayoutStack() {
  const { layoutStack } = useLayoutContext()
  return layoutStack
}

/**
 * Hook to register/unregister layouts dynamically
 */
export function useLayoutRegistry() {
  const { registerLayout, unregisterLayout } = useLayoutContext()
  return { registerLayout, unregisterLayout }
}