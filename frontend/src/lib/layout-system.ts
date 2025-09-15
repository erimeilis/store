/**
 * Core layout system implementation
 * Provides layout discovery, registration, and hierarchy management
 */

import { LayoutConfig, RouteConfig, LayoutRegistry, LayoutSystemOptions } from '@/types/layout'

export class LayoutSystemCore implements LayoutRegistry {
  public layouts = new Map<string, LayoutConfig>()
  public routes = new Map<string, RouteConfig>()
  private options: LayoutSystemOptions

  constructor(options: LayoutSystemOptions = {}) {
    this.options = {
      basePath: '',
      enableMetadata: true,
      enableParallelRoutes: false,
      enableRouteGroups: false,
      ...options
    }
  }

  /**
   * Register a layout or route configuration
   */
  register(config: LayoutConfig | RouteConfig): void {
    if (this.isLayoutConfig(config)) {
      this.layouts.set(config.path, config)
    } else {
      this.routes.set(config.path, config)
      if (config.layout) {
        this.layouts.set(config.layout.path, config.layout)
      }
    }
  }

  /**
   * Unregister a layout or route by path
   */
  unregister(path: string): void {
    this.layouts.delete(path)
    this.routes.delete(path)
  }

  /**
   * Get all layouts that apply to a given route path
   * Returns layouts in hierarchical order (root to specific)
   */
  getLayoutsForRoute(routePath: string): LayoutConfig[] {
    const segments = this.parseRoutePath(routePath)
    const layouts: LayoutConfig[] = []

    // Build layout hierarchy from segments
    let currentPath = ''
    for (const segment of segments) {
      currentPath = this.joinPaths(currentPath, segment)
      const layout = this.layouts.get(currentPath)
      if (layout) {
        layouts.push(layout)
      }
    }

    // Always include root layout if it exists and isn't already included
    const rootLayout = this.layouts.get('/')
    if (rootLayout && !layouts.some(l => l.path === '/')) {
      layouts.unshift(rootLayout)
    }

    return layouts
  }

  /**
   * Get route configuration for a specific path
   */
  getRoute(path: string): RouteConfig | undefined {
    // Try exact match first
    let route = this.routes.get(path)
    if (route) return route

    // Try with normalized path
    const normalizedPath = this.normalizePath(path)
    route = this.routes.get(normalizedPath)
    if (route) return route

    // Try finding by segments (for dynamic routes)
    const segments = this.parseRoutePath(path)
    for (const [routePath, routeConfig] of this.routes) {
      if (this.matchesDynamicRoute(segments, this.parseRoutePath(routePath))) {
        return routeConfig
      }
    }

    return undefined
  }

  /**
   * Auto-discover layouts and pages from a module registry
   * This would typically be called with dynamic imports in a build step
   */
  async autoDiscoverLayouts(moduleRegistry: Record<string, () => Promise<any>>): Promise<void> {
    for (const [modulePath, moduleLoader] of Object.entries(moduleRegistry)) {
      const routePath = this.modulePathToRoutePath(modulePath)
      
      try {
        const module = await moduleLoader()
        
        if (this.isLayoutModule(modulePath)) {
          const layoutConfig: LayoutConfig = {
            name: this.pathToName(routePath),
            path: routePath,
            segment: this.getSegment(routePath),
            component: module.default,
            metadata: module.metadata
          }
          this.register(layoutConfig)
        } else if (this.isPageModule(modulePath)) {
          const routeConfig: RouteConfig = {
            path: routePath,
            segment: this.getSegment(routePath),
            component: module.default,
            metadata: module.metadata
          }
          this.register(routeConfig)
        }
      } catch (error) {
        console.warn(`Failed to load module ${modulePath}:`, error)
      }
    }
  }

  /**
   * Resolve layout hierarchy for rendering
   */
  resolveLayoutHierarchy(routePath: string): {
    layouts: LayoutConfig[]
    route?: RouteConfig
    params: Record<string, string>
  } {
    const route = this.getRoute(routePath)
    const layouts = this.getLayoutsForRoute(routePath)
    const params = this.extractParams(routePath, route)

    return { layouts, route, params }
  }

  // Private helper methods

  private isLayoutConfig(config: LayoutConfig | RouteConfig): config is LayoutConfig {
    return 'name' in config
  }

  private isLayoutModule(modulePath: string): boolean {
    return modulePath.includes('layout.tsx') || modulePath.includes('layout.jsx')
  }

  private isPageModule(modulePath: string): boolean {
    return modulePath.includes('page.tsx') || modulePath.includes('page.jsx')
  }

  private modulePathToRoutePath(modulePath: string): string {
    // Convert frontend/src/dashboard/layout.tsx -> /dashboard
    // Convert frontend/src/dashboard/page.tsx -> /dashboard
    // Convert frontend/src/layout.tsx -> /
    
    let routePath = modulePath
      .replace(/^frontend\/src\//, '')
      .replace(/\/(layout|page)\.(tsx|jsx)$/, '')
      .replace(/^$/, '/')
    
    if (!routePath.startsWith('/')) {
      routePath = '/' + routePath
    }

    return this.normalizePath(routePath)
  }

  private parseRoutePath(path: string): string[] {
    return path.split('/').filter(segment => segment.length > 0)
  }

  private joinPaths(base: string, segment: string): string {
    const normalizedBase = base === '/' ? '' : base
    return this.normalizePath(`${normalizedBase}/${segment}`)
  }

  private normalizePath(path: string): string {
    if (!path || path === '') return '/'
    if (!path.startsWith('/')) path = '/' + path
    if (path.length > 1 && path.endsWith('/')) {
      path = path.slice(0, -1)
    }
    return path
  }

  private pathToName(path: string): string {
    return path === '/' ? 'root' : path.replace(/^\//, '').replace(/\//g, '-')
  }

  private getSegment(path: string): string {
    const segments = this.parseRoutePath(path)
    return segments[segments.length - 1] || 'root'
  }

  private matchesDynamicRoute(pathSegments: string[], routeSegments: string[]): boolean {
    if (pathSegments.length !== routeSegments.length) return false

    for (let i = 0; i < pathSegments.length; i++) {
      const pathSegment = pathSegments[i]
      const routeSegment = routeSegments[i]

      // Check for dynamic segment [param]
      if (routeSegment.startsWith('[') && routeSegment.endsWith(']')) {
        continue // Dynamic segment matches any value
      }

      // Check for catch-all [...param]
      if (routeSegment.startsWith('[...') && routeSegment.endsWith(']')) {
        return true // Catch-all matches remaining segments
      }

      // Exact match required
      if (pathSegment !== routeSegment) {
        return false
      }
    }

    return true
  }

  private extractParams(routePath: string, route?: RouteConfig): Record<string, string> {
    if (!route) return {}

    const pathSegments = this.parseRoutePath(routePath)
    const routeSegments = this.parseRoutePath(route.path)
    const params: Record<string, string> = {}

    for (let i = 0; i < Math.min(pathSegments.length, routeSegments.length); i++) {
      const routeSegment = routeSegments[i]
      
      if (routeSegment.startsWith('[') && routeSegment.endsWith(']')) {
        const paramName = routeSegment.slice(1, -1)
        if (paramName.startsWith('...')) {
          // Catch-all route
          const catchAllParam = paramName.slice(3)
          params[catchAllParam] = pathSegments.slice(i).join('/')
          break
        } else {
          // Dynamic route
          params[paramName] = pathSegments[i]
        }
      }
    }

    return params
  }
}

// Export a default instance
export const layoutSystem = new LayoutSystemCore()

// Export utility functions
export function createLayoutSystem(options?: LayoutSystemOptions): LayoutSystemCore {
  return new LayoutSystemCore(options)
}

export function registerLayout(config: LayoutConfig): void {
  layoutSystem.register(config)
}

export function registerRoute(config: RouteConfig): void {
  layoutSystem.register(config)
}

export function getLayoutsForRoute(routePath: string): LayoutConfig[] {
  return layoutSystem.getLayoutsForRoute(routePath)
}

export function resolveRoute(routePath: string) {
  return layoutSystem.resolveLayoutHierarchy(routePath)
}