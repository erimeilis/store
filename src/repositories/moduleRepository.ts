import { getPrismaClient } from '@/lib/database.js'
import type { Bindings } from '@/types/bindings.js'
import type {
  InstalledModule,
  ModuleStatus,
  ModuleCapabilityDeclaration,
  ModuleManifest,
  ModuleSource,
  ModuleAuthor,
  ModuleAnalytics,
} from '@/types/modules.js'
import type { PrismaClient } from '@prisma/client'

/**
 * Database row type for installed modules
 */
interface InstalledModuleRow {
  id: string
  name: string
  version: string
  displayName: string
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
 * Database row type for module capabilities
 */
interface ModuleCapabilityRow {
  id: string
  moduleId: string
  type: string
  identifier: string
  metadata: string | null
  createdAt: Date
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
 */
export class ModuleRepository {
  private prisma: PrismaClient

  constructor(env: Bindings) {
    this.prisma = getPrismaClient(env)
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
   */
  async add(module: InstalledModule): Promise<void> {
    await this.prisma.installedModule.create({
      data: {
        id: module.id,
        name: module.name,
        version: module.version,
        displayName: module.displayName,
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

    // Add capabilities
    if (module.manifest.capabilities.length > 0) {
      await this.syncCapabilities(module.id, module.manifest.capabilities)
    }

    // Initialize analytics
    await this.initializeAnalytics(module.id)
  }

  /**
   * Remove a module
   */
  async remove(moduleId: string): Promise<void> {
    await this.prisma.installedModule.delete({
      where: { id: moduleId },
    })
  }

  /**
   * Update a module
   */
  async update(moduleId: string, updates: Partial<InstalledModule>): Promise<void> {
    const data: Record<string, unknown> = {}

    if (updates.version !== undefined) data.version = updates.version
    if (updates.displayName !== undefined) data.displayName = updates.displayName
    if (updates.description !== undefined) data.description = updates.description
    if (updates.author !== undefined) data.author = JSON.stringify(updates.author)
    if (updates.source !== undefined) data.source = JSON.stringify(updates.source)
    if (updates.status !== undefined) data.status = updates.status
    if (updates.manifest !== undefined) data.manifest = JSON.stringify(updates.manifest)
    if (updates.settings !== undefined) data.settings = JSON.stringify(updates.settings)
    if (updates.error !== undefined) data.error = updates.error
    if (updates.errorAt !== undefined) data.errorAt = updates.errorAt
    if (updates.activatedAt !== undefined) data.activatedAt = updates.activatedAt

    await this.prisma.installedModule.update({
      where: { id: moduleId },
      data,
    })

    // Sync capabilities if manifest was updated
    if (updates.manifest) {
      await this.syncCapabilities(moduleId, updates.manifest.capabilities)
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
   * Find modules by capability
   */
  async findByCapability(capability: ModuleCapabilityDeclaration): Promise<InstalledModule[]> {
    const capabilities = await this.prisma.moduleCapability.findMany({
      where: {
        type: capability.type,
        identifier: 'typeId' in capability ? capability.typeId :
                    'generatorId' in capability ? capability.generatorId :
                    capability.basePath,
      },
      include: {
        module: true,
      },
    })

    return capabilities.map(cap => this.mapRowToModule(cap.module as InstalledModuleRow))
  }

  /**
   * Get the module that provides a specific column type
   */
  async getColumnTypeProvider(typeId: string): Promise<InstalledModule | null> {
    const capability = await this.prisma.moduleCapability.findFirst({
      where: {
        type: 'columnType',
        identifier: typeId,
      },
      include: {
        module: true,
      },
    })

    return capability ? this.mapRowToModule(capability.module as InstalledModuleRow) : null
  }

  /**
   * Get the module that provides a specific data generator
   */
  async getDataGeneratorProvider(generatorId: string): Promise<InstalledModule | null> {
    const capability = await this.prisma.moduleCapability.findFirst({
      where: {
        type: 'dataGenerator',
        identifier: generatorId,
      },
      include: {
        module: true,
      },
    })

    return capability ? this.mapRowToModule(capability.module as InstalledModuleRow) : null
  }

  /**
   * Get all active modules
   */
  async getActiveModules(): Promise<InstalledModule[]> {
    return this.findByStatus('active')
  }

  // ============================================================================
  // CAPABILITIES
  // ============================================================================

  /**
   * Sync capabilities for a module
   */
  private async syncCapabilities(
    moduleId: string,
    capabilities: ModuleCapabilityDeclaration[]
  ): Promise<void> {
    // Delete existing capabilities
    await this.prisma.moduleCapability.deleteMany({
      where: { moduleId },
    })

    // Add new capabilities
    if (capabilities.length > 0) {
      await this.prisma.moduleCapability.createMany({
        data: capabilities.map(cap => ({
          moduleId,
          type: cap.type,
          identifier: 'typeId' in cap ? cap.typeId :
                      'generatorId' in cap ? cap.generatorId :
                      cap.basePath,
        })),
      })
    }
  }

  /**
   * Get all capabilities for a module
   */
  async getCapabilities(moduleId: string): Promise<ModuleCapabilityDeclaration[]> {
    const rows = await this.prisma.moduleCapability.findMany({
      where: { moduleId },
    })

    return rows.map(row => {
      if (row.type === 'columnType') {
        return { type: 'columnType' as const, typeId: row.identifier }
      } else if (row.type === 'dataGenerator') {
        return { type: 'dataGenerator' as const, generatorId: row.identifier }
      } else {
        return { type: 'api' as const, basePath: row.identifier }
      }
    })
  }

  /**
   * Get all registered column types across all active modules
   */
  async getAllColumnTypes(): Promise<Array<{ moduleId: string; typeId: string }>> {
    const capabilities = await this.prisma.moduleCapability.findMany({
      where: {
        type: 'columnType',
        module: { status: 'active' },
      },
    })

    return capabilities.map(cap => ({
      moduleId: cap.moduleId,
      typeId: cap.identifier,
    }))
  }

  /**
   * Get all registered data generators across all active modules
   */
  async getAllDataGenerators(): Promise<Array<{ moduleId: string; generatorId: string }>> {
    const capabilities = await this.prisma.moduleCapability.findMany({
      where: {
        type: 'dataGenerator',
        module: { status: 'active' },
      },
    })

    return capabilities.map(cap => ({
      moduleId: cap.moduleId,
      generatorId: cap.identifier,
    }))
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
