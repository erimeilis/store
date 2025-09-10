/**
 * Layout system type definitions
 * Based on Next.js App Router layout patterns
 */

import React, { ReactNode } from 'react'

export interface LayoutProps {
  children: ReactNode
  params?: Record<string, string> | Promise<Record<string, string>>
  searchParams?: Record<string, string | string[]> | Promise<Record<string, string | string[]>>
}

export interface PageProps {
  params?: Record<string, string> | Promise<Record<string, string>>
  searchParams?: Record<string, string | string[]> | Promise<Record<string, string | string[]>>
}

export interface LayoutConfig {
  name: string
  path: string
  segment: string
  parent?: string
  component: React.ComponentType<LayoutProps>
  metadata?: LayoutMetadata
}

export interface LayoutMetadata {
  title?: string | ((props: LayoutProps) => string)
  description?: string | ((props: LayoutProps) => string)
  keywords?: string[]
  openGraph?: {
    title?: string
    description?: string
    images?: string[]
  }
}

export interface RouteConfig {
  path: string
  segment: string
  component: React.ComponentType<PageProps>
  layout?: LayoutConfig
  children?: RouteConfig[]
  metadata?: LayoutMetadata
}

export interface LayoutContext {
  currentRoute: string
  params: Record<string, string>
  searchParams: Record<string, string | string[]>
  layoutStack: LayoutConfig[]
  registerLayout: (config: LayoutConfig) => void
  unregisterLayout: (path: string) => void
}

export interface LayoutRegistry {
  layouts: Map<string, LayoutConfig>
  routes: Map<string, RouteConfig>
  register: (config: LayoutConfig | RouteConfig) => void
  unregister: (path: string) => void
  getLayoutsForRoute: (routePath: string) => LayoutConfig[]
  getRoute: (path: string) => RouteConfig | undefined
}

export type LayoutComponent<T = {}> = React.ComponentType<LayoutProps & T>
export type PageComponent<T = {}> = React.ComponentType<PageProps & T>

// Utility type for extracting layout props from route params
export type LayoutPropsFromRoute<TRoute extends string> = TRoute extends `${infer _Prefix}[${infer Param}]${infer Rest}`
  ? { params: Promise<Record<Param, string> & LayoutPropsFromRoute<Rest>['params'] extends Promise<infer P> ? P : {}> }
  : { params?: Promise<Record<string, string>> }

// Helper type for strongly typed layout components
export type TypedLayoutProps<TPath extends string = string> = LayoutProps & LayoutPropsFromRoute<TPath>

export interface LayoutSystemOptions {
  basePath?: string
  enableMetadata?: boolean
  enableParallelRoutes?: boolean
  enableRouteGroups?: boolean
  fallbackLayout?: React.ComponentType<LayoutProps>
}