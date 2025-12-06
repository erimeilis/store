/**
 * Module Manager Service - JSON-Only Architecture
 *
 * Manages module lifecycle for JSON-based modules.
 * Modules are pure configuration - no executable code.
 */

import type { Bindings } from '@/types/bindings.js'
import type {
  ModuleManager,
  ModuleRegistry,
  ModuleSource,
  InstalledModule,
  ModuleStatus,
  ModuleManifest,
  ColumnTypeDefinition,
  TableGeneratorDefinition,
  InstallResult,
} from '@/types/modules.js'
import { MODULE_STATUS_TRANSITIONS } from '@/types/modules.js'
import { ModuleRepository } from '@/repositories/moduleRepository.js'

/**
 * Global module cache - persists across requests within a Worker isolate
 */
const globalModuleCache = {
  manifests: new Map<string, ModuleManifest>(),
  initState: 'pending' as 'pending' | 'running' | 'done',
}

/**
 * Module Manager Service
 * Simplified for JSON-only modules - no code execution
 */
export class ModuleManagerService implements ModuleManager {
  private env: Bindings
  private repository: ModuleRepository
  private loadedManifests: Map<string, ModuleManifest> = new Map()

  constructor(env: Bindings) {
    this.env = env
    this.repository = new ModuleRepository(env)
  }

  /**
   * Get the module registry
   */
  get registry(): ModuleRegistry {
    return {
      list: () => this.repository.list(),
      get: moduleId => this.repository.get(moduleId),
      add: module => this.repository.add(module),
      remove: moduleId => this.repository.remove(moduleId),
      update: (moduleId, updates) => this.repository.update(moduleId, updates),
      findByStatus: status => this.repository.findByStatus(status),
      getColumnTypeProvider: typeId => this.repository.getColumnTypeProvider(typeId),
    }
  }

  // ============================================================================
  // INSTALLATION
  // ============================================================================

  /**
   * Install a module from a source
   */
  async install(source: ModuleSource): Promise<InstallResult> {
    let moduleId: string | undefined

    try {
      // Fetch manifest
      const manifest = await this.fetchManifest(source)
      if (!manifest) {
        return {
          success: false,
          moduleId: '',
          version: '',
          error: 'Failed to fetch module manifest',
        }
      }

      moduleId = manifest.id

      // Check if already installed
      const existing = await this.repository.get(moduleId)
      if (existing) {
        return {
          success: false,
          moduleId,
          version: existing.version,
          error: `Module ${moduleId} is already installed`,
        }
      }

      // Create installed module record
      const installedModule: InstalledModule = {
        id: manifest.id,
        name: manifest.name,
        version: manifest.version,
        description: manifest.description,
        author: manifest.author,
        source,
        status: 'installed',
        installedAt: new Date(),
        updatedAt: new Date(),
        activatedAt: null,
        settings: this.getDefaultSettings(manifest),
        manifest,
      }

      await this.repository.add(installedModule)
      await this.repository.logEvent(manifest.id, 'install', {
        newVersion: manifest.version,
        newStatus: 'installed',
      })

      return {
        success: true,
        moduleId: manifest.id,
        version: manifest.version,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)

      if (moduleId) {
        await this.repository.update(moduleId, {
          status: 'error',
          error: errorMessage,
          errorAt: new Date(),
        })
        await this.repository.recordError(moduleId, errorMessage)
      }

      return {
        success: false,
        moduleId: moduleId || '',
        version: '',
        error: errorMessage,
      }
    }
  }

  /**
   * Uninstall a module
   */
  async uninstall(moduleId: string): Promise<void> {
    const module = await this.repository.get(moduleId)
    if (!module) {
      throw new Error(`Module ${moduleId} is not installed`)
    }

    await this.repository.update(moduleId, { status: 'uninstalling' })
    await this.repository.logEvent(moduleId, 'uninstall', {
      previousStatus: module.status,
      newStatus: 'uninstalling',
    })

    // Remove from registry
    await this.repository.remove(moduleId)

    // Clean up cache
    this.loadedManifests.delete(moduleId)
    globalModuleCache.manifests.delete(moduleId)
  }

  // ============================================================================
  // LIFECYCLE (simplified - just enable/disable)
  // ============================================================================

  /**
   * Activate a module (make it available)
   */
  async activate(moduleId: string): Promise<void> {
    const module = await this.repository.get(moduleId)
    if (!module) {
      throw new Error(`Module ${moduleId} is not installed`)
    }

    if (module.status === 'active') {
      return // Already active
    }

    if (!this.canTransition(module.status, 'active')) {
      throw new Error(`Cannot activate module in status: ${module.status}`)
    }

    // Cache the manifest
    this.loadedManifests.set(moduleId, module.manifest)
    globalModuleCache.manifests.set(moduleId, module.manifest)

    // Update status
    await this.repository.update(moduleId, {
      status: 'active',
      activatedAt: new Date(),
      error: undefined,
      errorAt: undefined,
    })

    await this.repository.logEvent(moduleId, 'activate', {
      previousStatus: module.status,
      newStatus: 'active',
    })
  }

  /**
   * Deactivate a module
   */
  async deactivate(moduleId: string): Promise<void> {
    const module = await this.repository.get(moduleId)
    if (!module) {
      throw new Error(`Module ${moduleId} is not installed`)
    }

    if (module.status !== 'active') {
      return // Not active
    }

    // Remove from cache
    this.loadedManifests.delete(moduleId)
    globalModuleCache.manifests.delete(moduleId)

    await this.repository.update(moduleId, { status: 'disabled' })
    await this.repository.logEvent(moduleId, 'deactivate', {
      previousStatus: 'active',
      newStatus: 'disabled',
    })
  }

  /**
   * Reload a module - re-fetch manifest from source
   */
  async reload(moduleId: string): Promise<void> {
    const module = await this.repository.get(moduleId)
    if (!module) {
      throw new Error(`Module ${moduleId} is not installed`)
    }

    const wasActive = module.status === 'active'

    try {
      // Re-fetch the manifest from the source
      const newManifest = await this.fetchManifest(module.source)
      if (!newManifest) {
        throw new Error('Failed to fetch module manifest')
      }

      // Validate the manifest ID matches
      if (newManifest.id !== moduleId) {
        throw new Error(`Module ID mismatch: expected ${moduleId}, got ${newManifest.id}`)
      }

      // Update the module with new manifest
      await this.repository.update(moduleId, {
        version: newManifest.version,
        manifest: newManifest,
        updatedAt: new Date(),
        error: undefined,
        errorAt: undefined,
      })

      // Update cache if was active
      if (wasActive) {
        this.loadedManifests.set(moduleId, newManifest)
        globalModuleCache.manifests.set(moduleId, newManifest)
      }

      await this.repository.logEvent(moduleId, 'reload', {
        previousVersion: module.version,
        newVersion: newManifest.version,
      })
    } catch (error) {
      // Record the error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      await this.repository.update(moduleId, {
        error: errorMessage,
        errorAt: new Date(),
      })
      throw error
    }
  }

  // ============================================================================
  // SETTINGS
  // ============================================================================

  /**
   * Get settings for a module
   */
  async getSettings(moduleId: string): Promise<Record<string, unknown>> {
    const module = await this.repository.get(moduleId)
    if (!module) {
      throw new Error(`Module ${moduleId} is not installed`)
    }
    return module.settings
  }

  /**
   * Update settings for a module
   */
  async setSettings(moduleId: string, settings: Record<string, unknown>): Promise<void> {
    const module = await this.repository.get(moduleId)
    if (!module) {
      throw new Error(`Module ${moduleId} is not installed`)
    }

    const newSettings = { ...module.settings, ...settings }

    await this.repository.update(moduleId, { settings: newSettings })
    await this.repository.logEvent(moduleId, 'settings_change', {
      details: { changedKeys: Object.keys(settings) },
    })
  }

  // ============================================================================
  // QUERIES - Returns JSON definitions
  // ============================================================================

  /**
   * Get all column types from active modules
   */
  getColumnTypes(): ColumnTypeDefinition[] {
    const columnTypes: ColumnTypeDefinition[] = []

    for (const [moduleId, manifest] of this.loadedManifests) {
      if (manifest.columnTypes) {
        columnTypes.push(
          ...manifest.columnTypes.map(ct => ({
            ...ct,
            // Prefix ID with module ID for uniqueness
            id: `${moduleId}:${ct.id}`,
          }))
        )
      }
    }

    return columnTypes
  }

  /**
   * Get all table generators from active modules
   */
  getTableGenerators(): TableGeneratorDefinition[] {
    const generators: TableGeneratorDefinition[] = []

    for (const [moduleId, manifest] of this.loadedManifests) {
      if (manifest.tableGenerators) {
        generators.push(
          ...manifest.tableGenerators.map(tg => ({
            ...tg,
            // Prefix ID with module ID for uniqueness
            id: `${moduleId}:${tg.id}`,
          }))
        )
      }
    }

    return generators
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  /**
   * Initialize the module manager
   * Loads all active module manifests into cache
   */
  async initialize(): Promise<void> {
    // Fast path: Already initialized
    if (globalModuleCache.initState === 'done') {
      // Copy from global cache
      for (const [id, manifest] of globalModuleCache.manifests) {
        if (!this.loadedManifests.has(id)) {
          this.loadedManifests.set(id, manifest)
        }
      }
      return
    }

    // Concurrent path: Another request is initializing
    if (globalModuleCache.initState === 'running') {
      return
    }

    // First request: Do initialization
    globalModuleCache.initState = 'running'

    try {
      await this.doInitialize()
      globalModuleCache.initState = 'done'
    } catch (error) {
      console.error('Module initialization failed:', error)
      globalModuleCache.initState = 'pending'
    }
  }

  private async doInitialize(): Promise<void> {
    try {
      // Use KV-first reads for faster cold starts
      const activeManifests = await this.repository.getActiveManifests()

      for (const [moduleId, manifest] of activeManifests) {
        this.loadedManifests.set(moduleId, manifest)
        globalModuleCache.manifests.set(moduleId, manifest)
      }
    } catch (error) {
      console.error('Failed to initialize modules:', error)
    }
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  private async fetchManifest(source: ModuleSource): Promise<ModuleManifest | null> {
    // For local modules, read from bundled manifest data
    if (source.type === 'local' && source.path) {
      try {
        // Import the modules manifest that was scanned at build time
        const { default: modulesManifest } = await import('@/data/modules-manifest.json')

        const scannedModule = modulesManifest.find(
          (m: { path: string }) => m.path === source.path
        ) as { path: string; manifest: ModuleManifest } | undefined

        if (scannedModule?.manifest) {
          return scannedModule.manifest
        }
      } catch (error) {
        console.error('Error loading module manifest:', error)
      }
      return null
    }

    // For URL sources, fetch the manifest
    if (source.type === 'url' && source.url) {
      try {
        const response = await fetch(source.url)
        if (!response.ok) {
          return null
        }
        return (await response.json()) as ModuleManifest
      } catch {
        return null
      }
    }

    // For upload sources, the manifest is provided directly
    if (source.type === 'upload' && source.manifest) {
      return source.manifest
    }

    return null
  }

  private getDefaultSettings(manifest: ModuleManifest): Record<string, unknown> {
    const settings: Record<string, unknown> = {}

    if (manifest.settings) {
      for (const setting of manifest.settings) {
        if (setting.default !== undefined) {
          settings[setting.id] = setting.default
        }
      }
    }

    return settings
  }

  private canTransition(current: ModuleStatus, target: ModuleStatus): boolean {
    const transitions = MODULE_STATUS_TRANSITIONS[current]
    return transitions.includes(target)
  }
}

/**
 * Factory function to create a module manager
 */
export function createModuleManager(env: Bindings): ModuleManagerService {
  return new ModuleManagerService(env)
}
