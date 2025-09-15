/**
 * LayoutRenderer - Core component for rendering nested layout hierarchy
 * Handles the composition of layouts and pages similar to Next.js App Router
 */

import React, { ReactNode, useMemo } from 'react'
import { LayoutConfig, RouteConfig, LayoutProps, PageProps } from '@/types/layout'
import { useLayoutContext } from './LayoutProvider.js'

interface LayoutRendererProps {
  route: RouteConfig
  layouts: LayoutConfig[]
  params: Record<string, string>
  searchParams: Record<string, string | string[]>
  children?: ReactNode
  pageProps?: Record<string, any>
}

export function LayoutRenderer({
  route,
  layouts,
  params,
  searchParams,
  children,
  pageProps = {}
}: LayoutRendererProps) {
  // For SSR compatibility, pass params and searchParams directly
  // Only convert to Promises if we're in client-side routing context
  const asyncParams = useMemo(() => params, [params])
  const asyncSearchParams = useMemo(() => searchParams, [searchParams])

  // Build the nested layout structure
  const renderLayoutHierarchy = useMemo(() => {
    // Start with the page component or children
    let content: ReactNode = children

    if (route && !children) {
      const PageComponent = route.component
      const combinedPageProps = {
        params: asyncParams,
        searchParams: asyncSearchParams,
        ...pageProps
      }
      content = <PageComponent {...combinedPageProps} />
    }

    // Wrap with layouts from innermost to outermost (reverse order)
    const reversedLayouts = [...layouts].reverse()
    
    for (const layout of reversedLayouts) {
      const LayoutComponent = layout.component
      const layoutProps: LayoutProps = {
        children: content,
        params: asyncParams,
        searchParams: asyncSearchParams,
        ...pageProps // Pass pageProps to layouts so they can access user data
      }
      content = <LayoutComponent {...layoutProps} />
    }

    return content
  }, [route, layouts, asyncParams, asyncSearchParams, children])

  return <>{renderLayoutHierarchy}</>
}

/**
 * Simplified LayoutRenderer that uses context
 */
export function ContextualLayoutRenderer({
  children
}: {
  children?: ReactNode
}) {
  const { layoutStack, params, searchParams, currentRoute } = useLayoutContext()

  // For context-based rendering, we need to get the route from the layout system
  // This would typically be provided by the routing system
  const route = useMemo(() => {
    // This is a simplified version - in a real implementation,
    // this would come from the router
    return {
      path: currentRoute,
      segment: currentRoute.split('/').pop() || 'root',
      component: () => children || null
    } as RouteConfig
  }, [currentRoute, children])

  return (
    <LayoutRenderer
      route={route}
      layouts={layoutStack}
      params={params}
      searchParams={searchParams}
      children={children}
    />
  )
}

/**
 * Higher-order component for wrapping pages with layout rendering
 */
export function withLayoutRenderer<T extends PageProps>(
  PageComponent: React.ComponentType<T>,
  layoutOverrides?: LayoutConfig[]
) {
  return function WrappedPageComponent(_props: T) {
    const { layoutStack, params, searchParams, currentRoute } = useLayoutContext()
    
    const layouts = layoutOverrides || layoutStack
    const route: RouteConfig = {
      path: currentRoute,
      segment: currentRoute.split('/').pop() || 'root',
      component: PageComponent as React.ComponentType<PageProps>
    }

    return (
      <LayoutRenderer
        route={route}
        layouts={layouts}
        params={params}
        searchParams={searchParams}
      />
    )
  }
}

/**
 * Component for rendering a specific layout with children
 */
export function LayoutWrapper({
  layout,
  children,
  params = {},
  searchParams = {}
}: {
  layout: LayoutConfig
  children: ReactNode
  params?: Record<string, string>
  searchParams?: Record<string, string | string[]>
}) {
  const LayoutComponent = layout.component
  const asyncParams = useMemo(() => params, [params])
  const asyncSearchParams = useMemo(() => searchParams, [searchParams])

  const layoutProps: LayoutProps = {
    children,
    params: asyncParams,
    searchParams: asyncSearchParams
  }

  return <LayoutComponent {...layoutProps} />
}

export default LayoutRenderer