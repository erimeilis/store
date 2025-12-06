import type { StoreModule, ModuleManifest, ModuleSource } from '@/types/modules.js'
import type { Bindings } from '@/types/bindings.js'
import { getLocalModule, hasLocalModule } from './localModuleRegistry.js'

/**
 * Module loader interface
 * Abstracts the mechanism for loading module code
 */
export interface ModuleLoader {
  /**
   * Load a module's code and return the module instance
   */
  load(moduleId: string): Promise<StoreModule>

  /**
   * Check if a module is available for loading
   */
  exists(moduleId: string): Promise<boolean>

  /**
   * Get a module's manifest without loading the full module
   */
  getManifest(moduleId: string): Promise<ModuleManifest | null>
}

/**
 * In-memory module registry for loaded modules
 */
const loadedModules = new Map<string, StoreModule>()

/**
 * Create a local file system module loader (for development)
 * Uses statically bundled modules from localModuleRegistry
 */
export function createLocalModuleLoader(_env: Bindings): ModuleLoader {
  return {
    async load(moduleId: string): Promise<StoreModule> {
      // Check if already loaded
      if (loadedModules.has(moduleId)) {
        return loadedModules.get(moduleId)!
      }

      // Convert module ID to path: @store/phone-numbers -> modules/phone-numbers
      const moduleName = moduleId.replace(/^@\w+\//, '')
      const modulePath = `modules/${moduleName}`

      // Get module from static registry (bundled at build time)
      const module = getLocalModule(modulePath)
      if (!module) {
        throw new Error(`Module ${moduleId} not found in local registry. Make sure it's added to localModuleRegistry.ts`)
      }

      if (!module.id || !module.version) {
        throw new Error(`Module ${moduleId} is missing required id or version`)
      }

      loadedModules.set(moduleId, module)
      return module
    },

    async exists(moduleId: string): Promise<boolean> {
      if (loadedModules.has(moduleId)) {
        return true
      }

      // Check if module exists in static registry
      const moduleName = moduleId.replace(/^@\w+\//, '')
      const modulePath = `modules/${moduleName}`
      return hasLocalModule(modulePath)
    },

    async getManifest(moduleId: string): Promise<ModuleManifest | null> {
      const moduleName = moduleId.replace(/^@\w+\//, '')
      const modulePath = `modules/${moduleName}`

      // Check if module exists in registry
      if (!hasLocalModule(modulePath)) {
        return null
      }

      try {
        const module = await this.load(moduleId)

        // Build manifest from module
        return {
          id: module.id,
          name: moduleName,
          version: module.version,
          description: '',
          author: { name: 'Local' },
          engines: {
            store: '>=1.0.0',
            moduleApi: 'v1',
          },
          capabilities: [
            ...(module.columnTypes?.map(ct => ({
              type: 'columnType' as const,
              typeId: ct.id,
            })) || []),
            ...(module.dataGenerators?.map(dg => ({
              type: 'dataGenerator' as const,
              generatorId: dg.id,
            })) || []),
          ],
          main: 'dist/src/index.js',
        }
      } catch {
        return null
      }
    },
  }
}

/**
 * Create an R2-backed module loader (for production)
 * Loads modules from R2 bucket
 */
export function createR2ModuleLoader(env: Bindings): ModuleLoader {
  const bucket = env.BUCKET

  return {
    async load(moduleId: string): Promise<StoreModule> {
      // Check if already loaded
      if (loadedModules.has(moduleId)) {
        return loadedModules.get(moduleId)!
      }

      const moduleName = moduleId.replace(/^@\w+\//, '')
      const bundlePath = `modules/${moduleName}/dist/index.js`

      try {
        // Get module bundle from R2
        const object = await bucket.get(bundlePath)
        if (!object) {
          throw new Error(`Module bundle not found: ${bundlePath}`)
        }

        const code = await object.text()

        // Execute the module code
        // Note: This is a simplified approach. In production, you might use
        // eval(), new Function(), or Cloudflare's Worker Loader (when available)
        const moduleExports: Record<string, unknown> = {}
        const moduleFunction = new Function(
          'exports',
          'require',
          'module',
          code
        )

        const moduleObj = { exports: moduleExports }
        moduleFunction(moduleExports, () => null, moduleObj)

        const module = (moduleObj.exports.default || moduleObj.exports) as StoreModule

        if (!module.id || !module.version) {
          throw new Error(`Module ${moduleId} is missing required id or version`)
        }

        loadedModules.set(moduleId, module)
        return module
      } catch (error) {
        throw new Error(`Failed to load module ${moduleId} from R2: ${error}`)
      }
    },

    async exists(moduleId: string): Promise<boolean> {
      if (loadedModules.has(moduleId)) {
        return true
      }

      const moduleName = moduleId.replace(/^@\w+\//, '')
      const manifestPath = `modules/${moduleName}/store-module.json`

      try {
        const object = await bucket.head(manifestPath)
        return object !== null
      } catch {
        return false
      }
    },

    async getManifest(moduleId: string): Promise<ModuleManifest | null> {
      const moduleName = moduleId.replace(/^@\w+\//, '')
      const manifestPath = `modules/${moduleName}/store-module.json`

      try {
        const object = await bucket.get(manifestPath)
        if (!object) return null

        const manifestText = await object.text()
        return JSON.parse(manifestText) as ModuleManifest
      } catch {
        return null
      }
    },
  }
}

/**
 * Clear a loaded module from cache (for reloading)
 */
export function unloadModule(moduleId: string): void {
  loadedModules.delete(moduleId)
}

/**
 * Clear all loaded modules
 */
export function unloadAllModules(): void {
  loadedModules.clear()
}
