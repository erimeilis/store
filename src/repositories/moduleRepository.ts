import { getPrismaClient } from '@/lib/database.js'
import type { Bindings } from '@/types/bindings.js'
import type {
  InstalledModule,
  ModuleStatus,
  ModuleManifest,
  ModuleSource,
  ModuleAuthor,
  ModuleAnalytics,
} from '@/types/modules.js'
import type { PrismaClient } from '@prisma/client'

// KV key prefixes for module storage
const KV_PREFIX_MANIFEST = 'module:manifest:'
const KV_PREFIX_DATA = 'module:data:'

// Cache TTL for manifests (1 week - they rarely change)
const MANIFEST_CACHE_TTL = 60 * 60 * 24 * 7

/**
 * Database row type for installed modules
 */
interface InstalledModuleRow {
  id: string
  name: string
  version: string
  displayName?: string | null
  description: string | null
  author: string
  source: string
  status: string
  manifest: string
  settings: string
  error: string | null
  errorAt: Date | null
  installedAt: Date
  updatedAt: Date
  activatedAt: Date | null
}

/**
 * Database row type for module analytics
 */
interface ModuleAnalyticsRow {
  id: string
  moduleId: string
  installCount: number
  activationCount: number
  errorCount: number
  lastErrorMessage: string | null
  lastErrorAt: Date | null
  totalActivationTimeMs: number
  totalApiCalls: number
  totalApiTimeMs: number
  columnTypeUsage: string
  generatorInvocations: number
  createdAt: Date
  updatedAt: Date
}

/**
 * Repository for module operations
 * Uses D1 for metadata/queries and KV for fast manifest access
 */
export class ModuleRepository {
  private prisma: PrismaClient
  private kv: KVNamespace
  private r2: R2Bucket

  constructor(env: Bindings) {
    this.prisma = getPrismaClient(env)
    this.kv = env.KV
    this.r2 = env.BUCKET
  }

  // ============================================================================
  // KV CACHE OPERATIONS - Fast manifest access
  // ============================================================================

  /**
   * Get manifest from KV cache
   */
  async getManifestFromKV(moduleId: string): Promise<ModuleManifest | null> {
    const key = `${KV_PREFIX_MANIFEST}${moduleId}`
    const cached = await this.kv.get(key, 'json')
    return cached as ModuleManifest | null
  }

  /**
   * Save manifest to KV cache
   */
  async saveManifestToKV(moduleId: string, manifest: ModuleManifest): Promise<void> {
    const key = `${KV_PREFIX_MANIFEST}${moduleId}`
    await this.kv.put(key, JSON.stringify(manifest), {
      expirationTtl: MANIFEST_CACHE_TTL,
    })
  }

  /**
   * Delete manifest from KV cache
   */
  async deleteManifestFromKV(moduleId: string): Promise<void> {
    const key = `${KV_PREFIX_MANIFEST}${moduleId}`
    await this.kv.delete(key)
  }

  /**
   * Get manifest with KV-first strategy
   * Returns from KV cache if available, otherwise fetches from D1 and caches
   */
  async getManifest(moduleId: string): Promise<ModuleManifest | null> {
    // Try KV first (fast path)
    const cached = await this.getManifestFromKV(moduleId)
    if (cached) {
      return cached
    }

    // Fallback to D1
    const module = await this.get(moduleId)
    if (!module) {
      return null
    }

    // Cache in KV for next time
    await this.saveManifestToKV(moduleId, module.manifest)
    return module.manifest
  }

  /**
   * Get all active module manifests from KV/D1
   * Optimized for cold starts - tries KV first
   */
  async getActiveManifests(): Promise<Map<string, ModuleManifest>> {
    const manifests = new Map<string, ModuleManifest>()

    // Get list of active modules from D1 (just IDs)
    const activeModules = await this.findByStatus('active')

    // Fetch manifests - try KV first for each
    for (const module of activeModules) {
      const manifest = await this.getManifest(module.id)
      if (manifest) {
        manifests.set(module.id, manifest)
      }
    }

    return manifests
  }

  /**
   * Get all column type IDs from active modules
   * Returns array of fully qualified column type identifiers (e.g., ['@store/phone-numbers:provider'])
   * Format matches what moduleManager.getColumnTypes() returns
   */
  async getAllColumnTypeIds(): Promise<string[]> {
    const manifests = await this.getActiveManifests()
    const columnTypeIds: string[] = []

    for (const [moduleId, manifest] of manifests.entries()) {
      if (manifest.columnTypes) {
        for (const columnType of manifest.columnTypes) {
          // Prefix with moduleId to match the format used by moduleManager
          columnTypeIds.push(`${moduleId}:${columnType.id}`)
        }
      }
    }

    return columnTypeIds
  }

  // ============================================================================
  // R2 OPERATIONS - Large module data storage
  // ============================================================================

  /**
   * Store large module data in R2
   */
  async storeModuleData(moduleId: string, filename: string, data: ArrayBuffer | string): Promise<string> {
    const key = `modules/${moduleId}/data/${filename}`
    await this.r2.put(key, data)
    return key
  }

  /**
   * Get module data from R2
   */
  async getModuleData(moduleId: string, filename: string): Promise<ArrayBuffer | null> {
    const key = `modules/${moduleId}/data/${filename}`
    const object = await this.r2.get(key)
    if (!object) return null
    return object.arrayBuffer()
  }

  /**
   * Delete module data from R2
   */
  async deleteModuleData(moduleId: string): Promise<void> {
    const prefix = `modules/${moduleId}/`
    const listed = await this.r2.list({ prefix })

    for (const object of listed.objects) {
      await this.r2.delete(object.key)
    }
  }

  // ============================================================================
  // INSTALLED MODULES - CRUD Operations
  // ============================================================================

  /**
   * List all installed modules
   */
  async list(): Promise<InstalledModule[]> {
    const rows = await this.prisma.installedModule.findMany({
      orderBy: { installedAt: 'desc' },
    })
    return rows.map(row => this.mapRowToModule(row as InstalledModuleRow))
  }

  /**
   * Get a module by ID
   */
  async get(moduleId: string): Promise<InstalledModule | null> {
    const row = await this.prisma.installedModule.findUnique({
      where: { id: moduleId },
    })
    return row ? this.mapRowToModule(row as InstalledModuleRow) : null
  }

  /**
   * Add a new installed module
   * Stores metadata in D1 and manifest in KV for fast access
   */
  async add(module: InstalledModule): Promise<void> {
    // Store in D1
    await this.prisma.installedModule.create({
      data: {
        id: module.id,
        name: module.name,
        version: module.version,
        displayName: module.manifest.name, // Use manifest name as displayName
        description: module.description || null,
        author: JSON.stringify(module.author),
        source: JSON.stringify(module.source),
        status: module.status,
        manifest: JSON.stringify(module.manifest),
        settings: JSON.stringify(module.settings),
        error: module.error || null,
        errorAt: module.errorAt || null,
        installedAt: module.installedAt,
        updatedAt: module.updatedAt,
        activatedAt: module.activatedAt || null,
      },
    })

    // Cache manifest in KV for fast access
    await this.saveManifestToKV(module.id, module.manifest)

    // Initialize analytics
    await this.initializeAnalytics(module.id)
  }

  /**
   * Remove a module
   * Cleans up from D1, KV cache, and R2 data storage
   */
  async remove(moduleId: string): Promise<void> {
    // Remove from D1
    await this.prisma.installedModule.delete({
      where: { id: moduleId },
    })

    // Remove from KV cache
    await this.deleteManifestFromKV(moduleId)

    // Remove any R2 data files
    await this.deleteModuleData(moduleId)
  }

  /**
   * Update a module
   * Also syncs manifest to KV if manifest is updated
   */
  async update(moduleId: string, updates: Partial<InstalledModule>): Promise<void> {
    const data: Record<string, unknown> = {}

    if (updates.version !== undefined) data.version = updates.version
    if (updates.description !== undefined) data.description = updates.description
    if (updates.author !== undefined) data.author = JSON.stringify(updates.author)
    if (updates.source !== undefined) data.source = JSON.stringify(updates.source)
    if (updates.status !== undefined) data.status = updates.status
    if (updates.manifest !== undefined) {
      data.manifest = JSON.stringify(updates.manifest)
      data.displayName = updates.manifest.name // Sync displayName with manifest
    }
    if (updates.settings !== undefined) data.settings = JSON.stringify(updates.settings)
    if (updates.error !== undefined) data.error = updates.error
    if (updates.errorAt !== undefined) data.errorAt = updates.errorAt
    if (updates.activatedAt !== undefined) data.activatedAt = updates.activatedAt

    // Update in D1
    await this.prisma.installedModule.update({
      where: { id: moduleId },
      data,
    })

    // Sync manifest to KV if it was updated
    if (updates.manifest) {
      await this.saveManifestToKV(moduleId, updates.manifest)
    }
  }

  // ============================================================================
  // QUERIES
  // ============================================================================

  /**
   * Find modules by status
   */
  async findByStatus(status: ModuleStatus): Promise<InstalledModule[]> {
    const rows = await this.prisma.installedModule.findMany({
      where: { status },
      orderBy: { installedAt: 'desc' },
    })
    return rows.map(row => this.mapRowToModule(row as InstalledModuleRow))
  }

  /**
   * Get the module that provides a specific column type
   * Searches through active module manifests for the column type
   */
  async getColumnTypeProvider(typeId: string): Promise<InstalledModule | null> {
    // Parse typeId which is in format 'moduleId:columnTypeId'
    const colonIndex = typeId.indexOf(':')
    if (colonIndex === -1) {
      return null // Not a module-provided column type
    }

    const moduleId = typeId.substring(0, colonIndex)
    return this.get(moduleId)
  }

  /**
   * Get all active modules
   */
  async getActiveModules(): Promise<InstalledModule[]> {
    return this.findByStatus('active')
  }

  // ============================================================================
  // ANALYTICS
  // ============================================================================

  /**
   * Initialize analytics for a module
   */
  private async initializeAnalytics(moduleId: string): Promise<void> {
    await this.prisma.moduleAnalytics.create({
      data: { moduleId },
    })
  }

  /**
   * Get analytics for a module
   */
  async getAnalytics(moduleId: string): Promise<ModuleAnalytics | null> {
    const row = await this.prisma.moduleAnalytics.findUnique({
      where: { moduleId },
    })

    if (!row) return null

    return this.mapRowToAnalytics(row as ModuleAnalyticsRow)
  }

  /**
   * Increment activation count
   */
  async recordActivation(moduleId: string, activationTimeMs: number): Promise<void> {
    await this.prisma.moduleAnalytics.update({
      where: { moduleId },
      data: {
        activationCount: { increment: 1 },
        totalActivationTimeMs: { increment: activationTimeMs },
      },
    })
  }

  /**
   * Record an error
   */
  async recordError(moduleId: string, errorMessage: string): Promise<void> {
    await this.prisma.moduleAnalytics.update({
      where: { moduleId },
      data: {
        errorCount: { increment: 1 },
        lastErrorMessage: errorMessage,
        lastErrorAt: new Date(),
      },
    })
  }

  /**
   * Record API call
   */
  async recordApiCall(moduleId: string, responseTimeMs: number): Promise<void> {
    await this.prisma.moduleAnalytics.update({
      where: { moduleId },
      data: {
        totalApiCalls: { increment: 1 },
        totalApiTimeMs: { increment: responseTimeMs },
      },
    })
  }

  /**
   * Record column type usage
   */
  async recordColumnTypeUsage(moduleId: string, typeId: string): Promise<void> {
    const analytics = await this.prisma.moduleAnalytics.findUnique({
      where: { moduleId },
    })

    if (!analytics) return

    const usage = JSON.parse(analytics.columnTypeUsage || '{}')
    usage[typeId] = (usage[typeId] || 0) + 1

    await this.prisma.moduleAnalytics.update({
      where: { moduleId },
      data: { columnTypeUsage: JSON.stringify(usage) },
    })
  }

  /**
   * Record generator invocation
   */
  async recordGeneratorInvocation(moduleId: string): Promise<void> {
    await this.prisma.moduleAnalytics.update({
      where: { moduleId },
      data: {
        generatorInvocations: { increment: 1 },
      },
    })
  }

  // ============================================================================
  // EVENTS
  // ============================================================================

  /**
   * Log a module event
   */
  async logEvent(
    moduleId: string,
    eventType: 'install' | 'activate' | 'deactivate' | 'update' | 'uninstall' | 'error' | 'settings_change' | 'reload',
    options?: {
      previousVersion?: string
      newVersion?: string
      previousStatus?: string
      newStatus?: string
      details?: Record<string, unknown>
      createdBy?: string
    }
  ): Promise<void> {
    await this.prisma.moduleEvent.create({
      data: {
        moduleId,
        eventType,
        previousVersion: options?.previousVersion || null,
        newVersion: options?.newVersion || null,
        previousStatus: options?.previousStatus || null,
        newStatus: options?.newStatus || null,
        details: options?.details ? JSON.stringify(options.details) : null,
        createdBy: options?.createdBy || null,
      },
    })
  }

  /**
   * Get events for a module
   */
  async getEvents(
    moduleId: string,
    options?: { limit?: number; offset?: number }
  ): Promise<Array<{
    id: string
    eventType: string
    previousVersion: string | null
    newVersion: string | null
    previousStatus: string | null
    newStatus: string | null
    details: Record<string, unknown> | null
    createdBy: string | null
    createdAt: Date
  }>> {
    const rows = await this.prisma.moduleEvent.findMany({
      where: { moduleId },
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 50,
      skip: options?.offset || 0,
    })

    return rows.map(row => ({
      id: row.id,
      eventType: row.eventType,
      previousVersion: row.previousVersion,
      newVersion: row.newVersion,
      previousStatus: row.previousStatus,
      newStatus: row.newStatus,
      details: row.details ? JSON.parse(row.details) : null,
      createdBy: row.createdBy,
      createdAt: row.createdAt,
    }))
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  /**
   * Map database row to InstalledModule
   */
  private mapRowToModule(row: InstalledModuleRow): InstalledModule {
    return {
      id: row.id,
      name: row.name,
      version: row.version,
      displayName: row.displayName,
      description: row.description || '',
      author: JSON.parse(row.author) as ModuleAuthor,
      source: JSON.parse(row.source) as ModuleSource,
      status: row.status as ModuleStatus,
      manifest: JSON.parse(row.manifest) as ModuleManifest,
      settings: JSON.parse(row.settings) as Record<string, unknown>,
      error: row.error || undefined,
      errorAt: row.errorAt || undefined,
      installedAt: row.installedAt,
      updatedAt: row.updatedAt,
      activatedAt: row.activatedAt || null,
    }
  }

  /**
   * Map database row to ModuleAnalytics
   */
  private mapRowToAnalytics(row: ModuleAnalyticsRow): ModuleAnalytics {
    return {
      moduleId: row.moduleId,
      installCount: row.installCount,
      activeInstances: row.activationCount,
      errorCount: row.errorCount,
      lastError: row.lastErrorMessage ? {
        message: row.lastErrorMessage,
        occurredAt: row.lastErrorAt || new Date(),
      } : undefined,
      avgActivationTimeMs: row.activationCount > 0
        ? row.totalActivationTimeMs / row.activationCount
        : 0,
      avgApiResponseTimeMs: row.totalApiCalls > 0
        ? row.totalApiTimeMs / row.totalApiCalls
        : 0,
      columnTypeUsage: JSON.parse(row.columnTypeUsage),
      generatorInvocations: row.generatorInvocations,
      updatedAt: row.updatedAt,
    }
  }
}
