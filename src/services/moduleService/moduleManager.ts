import type { Bindings } from '@/types/bindings.js'
import type {
  ModuleManager,
  ModuleRegistry,
  ModuleSource,
  InstalledModule,
  ModuleStatus,
  ModuleManifest,
  ModuleCapabilityDeclaration,
  ModuleColumnType,
  ModuleDataGenerator,
  ModuleApiRoute,
  StoreModule,
  ModuleContext,
  InstallResult,
  UpdateInfo,
  UpdateResult,
} from '@/types/modules.js'
import modulesManifest from '@/data/modules-manifest.json'
import { MODULE_STATUS_TRANSITIONS } from '@/types/modules.js'
import { ModuleRepository } from '@/repositories/moduleRepository.js'
import { createModuleContext } from './moduleContext.js'
import {
  type ModuleLoader,
  createLocalModuleLoader,
  createR2ModuleLoader,
  unloadModule,
  unloadAllModules,
} from './moduleLoader.js'

/**
 * Global module cache - persists across requests within a Worker isolate
 * This prevents re-initializing modules on every request
 *
 * IMPORTANT: We use module IDs list as the "lock" to prevent races.
 * Cloudflare Workers doesn't allow sharing I/O operations across requests,
 * but we CAN share the final cached module instances (which are just JS objects).
 *
 * Strategy: Pre-populate moduleIds synchronously at Worker startup,
 * then each request can check if modules are already cached.
 */
const globalModuleCache = {
  instances: new Map<string, StoreModule>(),
  // Use a string token as atomic initialization marker
  // First request to successfully complete sets this to 'done'
  initState: 'pending' as 'pending' | 'running' | 'done',
}

/**
 * Module Manager Service
 * Implements the ModuleManager interface for module lifecycle management
 */
export class ModuleManagerService implements ModuleManager {
  private env: Bindings
  private repository: ModuleRepository
  private loader: ModuleLoader
  private moduleInstances: Map<string, StoreModule> = new Map()
  private moduleContexts: Map<string, ModuleContext> = new Map()

  constructor(env: Bindings) {
    this.env = env
    this.repository = new ModuleRepository(env)

    // Use local loader in development, R2 loader in production
    const isDevelopment = env.NODE_ENV === 'development'
    this.loader = isDevelopment
      ? createLocalModuleLoader(env)
      : createR2ModuleLoader(env)
  }

  /**
   * Get the module registry
   */
  get registry(): ModuleRegistry {
    return {
      list: () => this.repository.list(),
      get: (moduleId) => this.repository.get(moduleId),
      add: (module) => this.repository.add(module),
      remove: (moduleId) => this.repository.remove(moduleId),
      update: (moduleId, updates) => this.repository.update(moduleId, updates),
      findByStatus: (status) => this.repository.findByStatus(status),
      findByCapability: (cap) => this.repository.findByCapability(cap),
      getColumnTypeProvider: (typeId) => this.repository.getColumnTypeProvider(typeId),
      getDataGeneratorProvider: (genId) => this.repository.getDataGeneratorProvider(genId),
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
      // Resolve module ID from source
      moduleId = await this.resolveModuleId(source)

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

      // Update status to installing
      const manifest = await this.fetchManifest(source)
      if (!manifest) {
        return {
          success: false,
          moduleId,
          version: '',
          error: 'Failed to fetch module manifest',
        }
      }

      // Create installed module record
      const installedModule: InstalledModule = {
        id: manifest.id,
        name: manifest.name,
        version: manifest.version,
        displayName: manifest.name,
        description: manifest.description,
        author: manifest.author,
        source,
        status: 'installing',
        installedAt: new Date(),
        updatedAt: new Date(),
        activatedAt: null,
        settings: this.getDefaultSettings(manifest),
        manifest,
      }

      await this.repository.add(installedModule)
      await this.repository.logEvent(manifest.id, 'install', {
        newVersion: manifest.version,
        newStatus: 'installing',
      })

      // Download/copy module files (for R2 storage in production)
      await this.downloadModuleFiles(source, manifest)

      // Update status to installed
      await this.repository.update(manifest.id, { status: 'installed' })
      await this.repository.logEvent(manifest.id, 'install', {
        newVersion: manifest.version,
        previousStatus: 'installing',
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

    // Deactivate first if active
    if (module.status === 'active') {
      await this.deactivate(moduleId)
    }

    await this.repository.update(moduleId, { status: 'uninstalling' })
    await this.repository.logEvent(moduleId, 'uninstall', {
      previousStatus: module.status,
      newStatus: 'uninstalling',
    })

    // Call module's onUninstall hook
    const instance = this.moduleInstances.get(moduleId)
    const context = this.moduleContexts.get(moduleId)
    if (instance?.onUninstall && context) {
      try {
        await instance.onUninstall(context)
      } catch (error) {
        console.error(`Error in onUninstall for ${moduleId}:`, error)
      }
    }

    // Clean up module files from R2 (in production)
    await this.cleanupModuleFiles(moduleId)

    // Remove from registry
    await this.repository.remove(moduleId)

    // Clean up runtime state
    this.moduleInstances.delete(moduleId)
    this.moduleContexts.delete(moduleId)
    unloadModule(moduleId)
  }

  // ============================================================================
  // LIFECYCLE
  // ============================================================================

  /**
   * Activate a module
   */
  async activate(moduleId: string): Promise<void> {
    const startTime = Date.now()

    const module = await this.repository.get(moduleId)
    if (!module) {
      throw new Error(`Module ${moduleId} is not installed`)
    }

    if (module.status === 'active') {
      return // Already active
    }

    if (!this.canTransition(module.status, 'activating')) {
      throw new Error(`Cannot activate module in status: ${module.status}`)
    }

    await this.repository.update(moduleId, { status: 'activating' })
    await this.repository.logEvent(moduleId, 'activate', {
      previousStatus: module.status,
      newStatus: 'activating',
    })

    try {
      // Load module code
      const instance = await this.loader.load(moduleId)
      this.moduleInstances.set(moduleId, instance)

      // Create module context
      const context = createModuleContext(
        this.env,
        moduleId,
        module.version,
        module.settings,
        this.repository
      )
      this.moduleContexts.set(moduleId, context)

      // Call onActivate hook
      if (instance.onActivate) {
        await instance.onActivate(context)
      }

      // Update status
      const activatedAt = new Date()
      await this.repository.update(moduleId, {
        status: 'active',
        activatedAt,
        error: undefined,
        errorAt: undefined,
      })

      // Record analytics
      const activationTime = Date.now() - startTime
      await this.repository.recordActivation(moduleId, activationTime)

      await this.repository.logEvent(moduleId, 'activate', {
        previousStatus: 'activating',
        newStatus: 'active',
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)

      await this.repository.update(moduleId, {
        status: 'error',
        error: errorMessage,
        errorAt: new Date(),
      })
      await this.repository.recordError(moduleId, errorMessage)
      await this.repository.logEvent(moduleId, 'error', {
        previousStatus: 'activating',
        newStatus: 'error',
        details: { error: errorMessage },
      })

      throw new Error(`Failed to activate module ${moduleId}: ${errorMessage}`)
    }
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

    await this.repository.update(moduleId, { status: 'deactivating' })
    await this.repository.logEvent(moduleId, 'deactivate', {
      previousStatus: 'active',
      newStatus: 'deactivating',
    })

    try {
      // Call onDeactivate hook
      const instance = this.moduleInstances.get(moduleId)
      const context = this.moduleContexts.get(moduleId)
      if (instance?.onDeactivate && context) {
        await instance.onDeactivate(context)
      }

      // Clean up runtime state
      this.moduleInstances.delete(moduleId)
      this.moduleContexts.delete(moduleId)

      await this.repository.update(moduleId, { status: 'disabled' })
      await this.repository.logEvent(moduleId, 'deactivate', {
        previousStatus: 'deactivating',
        newStatus: 'disabled',
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)

      await this.repository.update(moduleId, {
        status: 'error',
        error: errorMessage,
        errorAt: new Date(),
      })
      await this.repository.recordError(moduleId, errorMessage)

      throw new Error(`Failed to deactivate module ${moduleId}: ${errorMessage}`)
    }
  }

  /**
   * Reload a single module
   */
  async reload(moduleId: string): Promise<void> {
    const module = await this.repository.get(moduleId)
    if (!module) {
      throw new Error(`Module ${moduleId} is not installed`)
    }

    const wasActive = module.status === 'active'

    if (wasActive) {
      await this.deactivate(moduleId)
    }

    // Clear cached module code (both local and global)
    unloadModule(moduleId)
    globalModuleCache.instances.delete(moduleId)

    if (wasActive) {
      await this.activate(moduleId)
    }

    await this.repository.logEvent(moduleId, 'reload')
  }

  /**
   * Reload all modules
   */
  async reloadAll(): Promise<void> {
    const activeModules = await this.repository.findByStatus('active')

    // Deactivate all
    for (const module of activeModules) {
      await this.deactivate(module.id)
    }

    // Clear all cached modules (both local and global)
    unloadAllModules()
    globalModuleCache.instances.clear()
    globalModuleCache.initState = 'pending'

    // Reactivate all
    for (const module of activeModules) {
      await this.activate(module.id)
    }
  }

  // ============================================================================
  // UPDATES
  // ============================================================================

  /**
   * Check for updates for all installed modules
   */
  async checkUpdates(): Promise<UpdateInfo[]> {
    const modules = await this.repository.list()
    const updates: UpdateInfo[] = []

    for (const module of modules) {
      const update = await this.checkModuleUpdate(module.id)
      if (update) {
        updates.push(update)
      }
    }

    return updates
  }

  /**
   * Check for update for a specific module
   */
  async checkModuleUpdate(moduleId: string): Promise<UpdateInfo | null> {
    const module = await this.repository.get(moduleId)
    if (!module) return null

    try {
      // Fetch latest manifest from source
      const latestManifest = await this.fetchManifest(module.source)
      if (!latestManifest) return null

      // Compare versions
      if (this.isNewerVersion(latestManifest.version, module.version)) {
        return {
          moduleId,
          currentVersion: module.version,
          latestVersion: latestManifest.version,
        }
      }

      return null
    } catch {
      return null
    }
  }

  /**
   * Update a module to a new version
   */
  async update(moduleId: string, version?: string): Promise<UpdateResult> {
    const module = await this.repository.get(moduleId)
    if (!module) {
      return {
        success: false,
        moduleId,
        fromVersion: '',
        toVersion: '',
        error: 'Module not found',
      }
    }

    const fromVersion = module.version
    const wasActive = module.status === 'active'

    try {
      await this.repository.update(moduleId, { status: 'updating' })
      await this.repository.logEvent(moduleId, 'update', {
        previousVersion: fromVersion,
        previousStatus: wasActive ? 'active' : module.status,
        newStatus: 'updating',
      })

      // Deactivate if active
      if (wasActive) {
        await this.deactivate(moduleId)
      }

      // Fetch new manifest
      const newManifest = await this.fetchManifest(module.source)
      if (!newManifest) {
        throw new Error('Failed to fetch updated manifest')
      }

      const toVersion = version || newManifest.version

      // Download new module files
      await this.downloadModuleFiles(module.source, newManifest)

      // Clear cached module
      unloadModule(moduleId)

      // Update registry
      await this.repository.update(moduleId, {
        version: toVersion,
        manifest: newManifest,
        status: 'installed',
      })

      // Call onUpgrade hook if reactivating
      if (wasActive) {
        const instance = await this.loader.load(moduleId)
        const context = createModuleContext(
          this.env,
          moduleId,
          toVersion,
          module.settings,
          this.repository
        )

        if (instance.onUpgrade) {
          await instance.onUpgrade(context, fromVersion)
        }

        await this.activate(moduleId)
      }

      await this.repository.logEvent(moduleId, 'update', {
        previousVersion: fromVersion,
        newVersion: toVersion,
        previousStatus: 'updating',
        newStatus: wasActive ? 'active' : 'installed',
      })

      return {
        success: true,
        moduleId,
        fromVersion,
        toVersion,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)

      await this.repository.update(moduleId, {
        status: 'error',
        error: errorMessage,
        errorAt: new Date(),
      })
      await this.repository.recordError(moduleId, errorMessage)

      return {
        success: false,
        moduleId,
        fromVersion,
        toVersion: version || '',
        error: errorMessage,
      }
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

    // Update context if module is active
    const context = this.moduleContexts.get(moduleId)
    if (context) {
      // Create new context with updated settings
      const newContext = createModuleContext(
        this.env,
        moduleId,
        module.version,
        newSettings,
        this.repository
      )
      this.moduleContexts.set(moduleId, newContext)
    }
  }

  // ============================================================================
  // QUERIES
  // ============================================================================

  /**
   * Get all column types from active modules
   */
  getColumnTypes(): ModuleColumnType[] {
    const columnTypes: ModuleColumnType[] = []

    for (const [moduleId, instance] of this.moduleInstances) {
      if (instance.columnTypes) {
        columnTypes.push(
          ...instance.columnTypes.map(ct => ({
            ...ct,
            // Add module ID for tracking
            id: `${moduleId}:${ct.id}`,
          }))
        )
      }
    }

    return columnTypes
  }

  /**
   * Get all data generators from active modules
   */
  getDataGenerators(): ModuleDataGenerator[] {
    const generators: ModuleDataGenerator[] = []

    for (const [moduleId, instance] of this.moduleInstances) {
      if (instance.dataGenerators) {
        generators.push(
          ...instance.dataGenerators.map(dg => ({
            ...dg,
            // Add module ID for tracking
            id: `${moduleId}:${dg.id}`,
          }))
        )
      }
    }

    return generators
  }

  /**
   * Get all API routes from active modules
   */
  getApiRoutes(): Array<ModuleApiRoute & { moduleId: string }> {
    const routes: Array<ModuleApiRoute & { moduleId: string }> = []

    for (const [moduleId, instance] of this.moduleInstances) {
      if (instance.apiRoutes) {
        routes.push(
          ...instance.apiRoutes.map(route => ({
            ...route,
            moduleId,
          }))
        )
      }
    }

    return routes
  }

  // ============================================================================
  // RUNTIME
  // ============================================================================

  /**
   * Get a module instance
   */
  getModuleInstance(moduleId: string): StoreModule | null {
    return this.moduleInstances.get(moduleId) || null
  }

  /**
   * Get a module's context
   */
  getModuleContext(moduleId: string): ModuleContext | null {
    return this.moduleContexts.get(moduleId) || null
  }

  /**
   * Initialize the module manager
   * Loads all modules that should be active (for use in request handlers)
   * Uses global cache to avoid re-initializing on every request
   *
   * IMPORTANT: Due to Cloudflare Workers I/O isolation, we CANNOT share
   * I/O operations across requests. Each request must use its own I/O context.
   *
   * Strategy:
   * 1. If cache is 'done' → use cached instances immediately (no I/O)
   * 2. If cache is 'running' → return empty (graceful degradation, retry next request)
   * 3. If cache is 'pending' → this request does the initialization
   */
  async initialize(): Promise<void> {
    // Fast path: Already initialized - copy cached instances (no I/O needed)
    if (globalModuleCache.initState === 'done') {
      for (const [id, instance] of globalModuleCache.instances) {
        if (!this.moduleInstances.has(id)) {
          this.moduleInstances.set(id, instance)
        }
      }
      return
    }

    // Concurrent path: Another request is initializing
    // Return immediately WITHOUT any I/O to avoid cross-request I/O errors
    // Trade-off: This request won't have module types, but won't crash either
    if (globalModuleCache.initState === 'running') {
      return
    }

    // First request path: Mark as running and do initialization
    // Note: This isn't perfectly atomic, but it's good enough for cold start races
    // Multiple requests might set this, but only one will complete first
    globalModuleCache.initState = 'running'

    try {
      await this.doInitialize()
      globalModuleCache.initState = 'done'
    } catch (error) {
      console.error('Module initialization failed:', error)
      // Reset to pending so next request can try again
      globalModuleCache.initState = 'pending'
      // Don't throw - let the app work without modules
    }
  }

  /**
   * Internal initialization logic
   */
  private async doInitialize(): Promise<void> {
    let modules: InstalledModule[]
    try {
      modules = await this.repository.list()
    } catch (error) {
      console.error('Failed to fetch module list:', error)
      return // Continue without modules
    }

    for (const module of modules) {
      // Load modules that should be active
      if (module.status === 'active') {
        try {
          // Skip if already loaded in global cache
          if (globalModuleCache.instances.has(module.id)) {
            this.moduleInstances.set(module.id, globalModuleCache.instances.get(module.id)!)
            continue
          }

          // Skip if already loaded in this instance
          if (this.moduleInstances.has(module.id)) {
            continue
          }

          // Load module code
          const instance = await this.loader.load(module.id)
          this.moduleInstances.set(module.id, instance)
          globalModuleCache.instances.set(module.id, instance)

          // Create module context
          const context = createModuleContext(
            this.env,
            module.id,
            module.version,
            module.settings,
            this.repository
          )
          this.moduleContexts.set(module.id, context)
        } catch (error) {
          console.error(`Failed to load module ${module.id}:`, error)
          // Continue loading other modules
        }
      }
    }
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  private async resolveModuleId(source: ModuleSource): Promise<string> {
    // For npm packages, the ID is the package name
    if (source.type === 'npm') {
      return source.package || ''
    }

    // For git/url repos, try to fetch manifest and get ID
    if (source.type === 'git' || source.type === 'url') {
      const manifest = await this.fetchManifest(source)
      return manifest?.id || ''
    }

    // For local/upload, we need the manifest
    const manifest = await this.fetchManifest(source)
    return manifest?.id || ''
  }

  private async fetchManifest(source: ModuleSource): Promise<ModuleManifest | null> {
    // For local modules, use the full manifest from build-time scan
    if (source.type === 'local' && source.path) {
      // Find module in the bundled manifest (now includes full manifest data)
      const scannedModule = modulesManifest.find(
        (m: { path: string }) => m.path === source.path
      ) as { path: string; manifest: ModuleManifest } | undefined

      if (scannedModule?.manifest) {
        return scannedModule.manifest
      }

      // Fallback: try to use loader's getManifest
      const moduleName = source.path.replace(/^modules\//, '')
      const moduleId = `@store/${moduleName}`
      const loaderManifest = await this.loader.getManifest(moduleId)
      if (loaderManifest) {
        return loaderManifest
      }

      return null
    }

    // For url/git sources
    if ((source.type === 'url' || source.type === 'git') && source.url) {
      return this.loader.getManifest(source.url)
    }

    // For npm sources
    if (source.type === 'npm' && source.package) {
      // TODO: Fetch from npm registry
      return null
    }

    // For other sources, we'd need to implement fetching
    return null
  }

  private async downloadModuleFiles(
    _source: ModuleSource,
    _manifest: ModuleManifest
  ): Promise<void> {
    // Placeholder - real implementation would:
    // 1. Download from git/npm
    // 2. Upload to R2 bucket (in production)
    // 3. Or copy to local modules directory (in development)
  }

  private async cleanupModuleFiles(moduleId: string): Promise<void> {
    // Placeholder - real implementation would:
    // 1. Delete from R2 bucket (in production)
    // 2. Or delete from local modules directory (in development)
    const moduleName = moduleId.replace(/^@\w+\//, '')

    if (this.env.NODE_ENV !== 'development') {
      // Delete from R2
      const prefix = `modules/${moduleName}/`
      const objects = await this.env.BUCKET.list({ prefix })

      for (const obj of objects.objects) {
        await this.env.BUCKET.delete(obj.key)
      }
    }
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

  private isNewerVersion(version1: string, version2: string): boolean {
    // Simple semver comparison
    const v1Parts = version1.split('.').map(Number)
    const v2Parts = version2.split('.').map(Number)

    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const v1Part = v1Parts[i] || 0
      const v2Part = v2Parts[i] || 0

      if (v1Part > v2Part) return true
      if (v1Part < v2Part) return false
    }

    return false
  }
}

/**
 * Factory function to create a module manager
 */
export function createModuleManager(
  env: Bindings,
  _repository?: ModuleRepository
): ModuleManagerService {
  return new ModuleManagerService(env)
}
