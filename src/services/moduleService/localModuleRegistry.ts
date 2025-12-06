/**
 * Local Module Registry
 * Statically imports local modules at build time for Cloudflare Workers
 *
 * NOTE: Add new local modules here for them to be available at runtime
 */

import type { StoreModule, GeneratorContext, GeneratedRow } from '@/types/modules.js'

// Import local modules statically (bundled at build time)
// Using dynamic import pattern for type compatibility
import phoneNumbersModuleRaw from '../../../modules/phone-numbers/dist/src/index.js'

// Cast to our internal StoreModule type - the runtime behavior is compatible
// even if TypeScript's exactOptionalPropertyTypes flag is strict
const phoneNumbersModule = phoneNumbersModuleRaw as unknown as StoreModule

/**
 * Registry of locally bundled modules
 * Key: module path (e.g., "modules/phone-numbers")
 * Value: the module instance
 */
export const localModuleRegistry: Record<string, StoreModule | undefined> = {
  'modules/phone-numbers': phoneNumbersModule,
}

/**
 * Get a local module by its path
 */
export function getLocalModule(path: string): StoreModule | undefined {
  return localModuleRegistry[path]
}

/**
 * Check if a local module is available
 */
export function hasLocalModule(path: string): boolean {
  return path in localModuleRegistry && localModuleRegistry[path] !== undefined
}

/**
 * List all available local module paths
 */
export function listLocalModulePaths(): string[] {
  return Object.keys(localModuleRegistry).filter(
    path => localModuleRegistry[path] !== undefined
  )
}

/**
 * Get all column types from all locally registered modules (SYNCHRONOUS)
 * This bypasses the async module initialization entirely
 * Returns column types with module info attached
 */
export function getLocalModuleColumnTypes(): Array<{
  id: string
  displayName: string
  description: string
  category: string
  icon?: string
  moduleId: string
  moduleName: string
  options?: Array<{
    id: string
    type: string
    displayName: string
    description?: string
    default?: unknown
    required?: boolean
    options?: Array<{ value: string; label: string }>
  }>
}> {
  const columnTypes: Array<{
    id: string
    displayName: string
    description: string
    category: string
    icon?: string
    moduleId: string
    moduleName: string
    options?: Array<{
      id: string
      type: string
      displayName: string
      description?: string
      default?: unknown
      required?: boolean
      options?: Array<{ value: string; label: string }>
    }>
  }> = []

  for (const [path, module] of Object.entries(localModuleRegistry)) {
    if (!module?.columnTypes) continue

    // Extract module name from path (e.g., "modules/phone-numbers" -> "Phone Numbers")
    const moduleName = module.id
      .replace(/^@\w+\//, '') // Remove @store/ prefix
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    for (const ct of module.columnTypes) {
      const columnType: {
        id: string
        displayName: string
        description: string
        category: string
        icon?: string
        moduleId: string
        moduleName: string
        options?: Array<{
          id: string
          type: string
          displayName: string
          description?: string
          default?: unknown
          required?: boolean
          options?: Array<{ value: string; label: string }>
        }>
      } = {
        id: ct.id,
        displayName: ct.displayName,
        description: ct.description,
        category: ct.category,
        moduleId: module.id,
        moduleName,
      }
      // Only add optional properties if they're defined
      if (ct.icon !== undefined) columnType.icon = ct.icon
      if (ct.options !== undefined) columnType.options = ct.options
      columnTypes.push(columnType)
    }
  }

  return columnTypes
}

/**
 * Get all data generators from all locally registered modules (SYNCHRONOUS)
 * This bypasses the async module initialization entirely
 */
export function getLocalModuleDataGenerators(): Array<{
  id: string
  displayName: string
  description: string
  moduleId: string
  moduleName: string
  generate: (
    countOrContext: number | GeneratorContext,
    options?: Record<string, unknown>
  ) => Promise<unknown[] | GeneratedRow> | unknown[] | GeneratedRow
}> {
  const generators: Array<{
    id: string
    displayName: string
    description: string
    moduleId: string
    moduleName: string
    generate: (
      countOrContext: number | GeneratorContext,
      options?: Record<string, unknown>
    ) => Promise<unknown[] | GeneratedRow> | unknown[] | GeneratedRow
  }> = []

  for (const [path, module] of Object.entries(localModuleRegistry)) {
    if (!module?.dataGenerators) continue

    const moduleName = module.id
      .replace(/^@\w+\//, '')
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    for (const dg of module.dataGenerators) {
      generators.push({
        id: dg.id,
        displayName: dg.displayName,
        description: dg.description,
        moduleId: module.id,
        moduleName,
        generate: dg.generate,
      })
    }
  }

  return generators
}

/**
 * Get all table generators from all locally registered modules (SYNCHRONOUS)
 * Table generators create complete tables with schema and data
 */
export function getLocalModuleTableGenerators(): Array<{
  id: string
  displayName: string
  description: string
  icon?: string
  category?: string
  tableType: 'sale' | 'rent' | 'default'
  defaultTableCount: number
  defaultRowCount: number
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error'
  customGenerator?: boolean
  moduleId: string
  moduleName: string
}> {
  const generators: Array<{
    id: string
    displayName: string
    description: string
    icon?: string
    category?: string
    tableType: 'sale' | 'rent' | 'default'
    defaultTableCount: number
    defaultRowCount: number
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error'
    customGenerator?: boolean
    moduleId: string
    moduleName: string
  }> = []

  for (const [path, module] of Object.entries(localModuleRegistry)) {
    if (!module?.tableGenerators) continue

    const moduleName = module.id
      .replace(/^@\w+\//, '')
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    for (const tg of module.tableGenerators) {
      const generator: {
        id: string
        displayName: string
        description: string
        icon?: string
        category?: string
        tableType: 'sale' | 'rent' | 'default'
        defaultTableCount: number
        defaultRowCount: number
        color?: 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error'
        customGenerator?: boolean
        moduleId: string
        moduleName: string
      } = {
        id: tg.id,
        displayName: tg.displayName,
        description: tg.description,
        tableType: tg.tableType,
        defaultTableCount: tg.defaultTableCount,
        defaultRowCount: tg.defaultRowCount,
        moduleId: module.id,
        moduleName,
      }
      // Only add optional properties if they're defined
      if (tg.icon !== undefined) generator.icon = tg.icon
      if (tg.category !== undefined) generator.category = tg.category
      if (tg.color !== undefined) generator.color = tg.color
      if (tg.customGenerator !== undefined) generator.customGenerator = tg.customGenerator
      generators.push(generator)
    }
  }

  return generators
}
