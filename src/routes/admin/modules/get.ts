import { Hono } from 'hono'
import type { Bindings } from '@/types/bindings.js'
import type { HonoVariables } from '@/types/hono.js'
import { adminOnlyMiddleware } from '@/middleware/admin.js'
import { ModuleRepository } from '@/repositories/moduleRepository.js'

const app = new Hono<{ Bindings: Bindings; Variables: HonoVariables }>()

/**
 * GET /api/admin/modules
 * List all installed modules
 * Returns InstalledModule[] with pagination wrapper
 */
app.get('/', adminOnlyMiddleware, async (c) => {
  try {
    const repository = new ModuleRepository(c.env)
    const modules = await repository.list()

    // Return modules as-is from repository with analytics
    const modulesWithAnalytics = await Promise.all(
      modules.map(async (module) => {
        const analytics = await repository.getAnalytics(module.id)
        return {
          // Return exact fields from InstalledModule - no mapping!
          id: module.id,
          name: module.name,
          version: module.version,
          displayName: module.displayName,
          description: module.description,
          author: module.author,
          source: module.source,
          status: module.status,
          manifest: module.manifest,
          settings: module.settings,
          installedAt: module.installedAt,
          updatedAt: module.updatedAt,
          activatedAt: module.activatedAt,
          error: module.error,
          // Add analytics for UI convenience
          analytics: analytics ? {
            activationCount: analytics.activeInstances,
            errorCount: analytics.errorCount,
            generatorInvocations: analytics.generatorInvocations,
          } : null,
        }
      })
    )

    // Return with pagination wrapper using "data" for consistency
    return c.json({
      data: modulesWithAnalytics,
      currentPage: 1,
      lastPage: 1,
      perPage: modulesWithAnalytics.length,
      total: modulesWithAnalytics.length,
      from: modulesWithAnalytics.length > 0 ? 1 : null,
      to: modulesWithAnalytics.length > 0 ? modulesWithAnalytics.length : null,
    })
  } catch (error) {
    console.error('Failed to list modules:', error)
    return c.json({
      error: 'Failed to list modules',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, 500)
  }
})

export default app
