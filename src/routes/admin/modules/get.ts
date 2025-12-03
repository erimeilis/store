import { Hono } from 'hono'
import type { Bindings } from '@/types/bindings.js'
import type { HonoVariables } from '@/types/hono.js'
import { adminOnlyMiddleware } from '@/middleware/admin.js'
import { ModuleRepository } from '@/repositories/moduleRepository.js'

const app = new Hono<{ Bindings: Bindings; Variables: HonoVariables }>()

/**
 * GET /api/admin/modules
 * List all installed modules
 */
app.get('/', adminOnlyMiddleware, async (c) => {
  try {
    const repository = new ModuleRepository(c.env)
    const modules = await repository.list()

    // Get analytics for each module
    const modulesWithAnalytics = await Promise.all(
      modules.map(async (module) => {
        const analytics = await repository.getAnalytics(module.id)
        return {
          id: module.id,
          name: module.name,
          version: module.version,
          displayName: module.displayName,
          description: module.description,
          author: module.author,
          status: module.status,
          installedAt: module.installedAt,
          updatedAt: module.updatedAt,
          activatedAt: module.activatedAt,
          error: module.error,
          capabilities: module.manifest.capabilities,
          trust: module.manifest.trust,
          analytics: analytics ? {
            activationCount: analytics.activeInstances,
            errorCount: analytics.errorCount,
            generatorInvocations: analytics.generatorInvocations,
          } : null,
        }
      })
    )

    return c.json({
      modules: modulesWithAnalytics,
      total: modules.length,
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
