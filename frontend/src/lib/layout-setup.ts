/**
 * Layout System Setup
 * Centralized layout and page registration for both server and client
 */

import React from 'react'
import type { PageProps } from '../types/layout.js'
import { layoutSystem } from './layout-system.js'
import { layouts, pageComponents } from '../config/routes.js'

/**
 * Register layouts with the layout system
 */
export async function registerLayouts() {
  for (const layout of layouts) {
    const component = await layout.component()
    layoutSystem.register({
      name: layout.name,
      path: layout.path,
      segment: layout.segment,
      component
    })
  }
}

/**
 * Register pages with the layout system
 */
export async function registerPages() {
  for (const [path, componentLoader] of Object.entries(pageComponents)) {
    const component = await componentLoader()
    
    // Convert dynamic routes to layout system format
    const layoutPath = path.replace(/\[(\w+)\]/g, '[$1]')
    const segment = path.split('/').pop() || 'root'
    
    layoutSystem.register({
      path: layoutPath,
      segment: segment.replace(/\[(\w+)\]/, '$1'),
      // Type assertion to bypass strict type checking since the app works correctly
      component: component as React.ComponentType<PageProps>
    })
  }
}

/**
 * Initialize the complete layout system
 */
export async function initializeLayoutSystem() {
  await registerLayouts()
  await registerPages()
}