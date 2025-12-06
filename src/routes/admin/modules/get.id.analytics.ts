import { Hono } from 'hono'
import type { Bindings } from '@/types/bindings.js'
import type { HonoVariables } from '@/types/hono.js'
import { adminOnlyMiddleware } from '@/middleware/admin.js'
import { ModuleRepository } from '@/repositories/moduleRepository.js'

const app = new Hono<{ Bindings: Bindings; Variables: HonoVariables }>()

/**
 * GET /api/admin/modules/:id/analytics
 * Get detailed analytics for a specific module
 */
app.get('/:id/analytics', adminOnlyMiddleware, async (c) => {
  try {
    const moduleId = decodeURIComponent(c.req.param('id'))

    const repository = new ModuleRepository(c.env)

    // Check if module exists
    const module = await repository.get(moduleId)
    if (!module) {
      return c.json({ error: 'Module not found' }, 404)
    }

    // Get analytics
    const analytics = await repository.getAnalytics(moduleId)
    if (!analytics) {
      return c.json({
        moduleId,
        analytics: {
          activeInstances: 0,
          totalActivations: 0,
          generatorInvocations: 0,
          errorCount: 0,
          lastActivated: null,
          lastError: null,
        },
      })
    }

    // Get recent events for additional context
    const recentEvents = await repository.getEvents(moduleId, { limit: 10 })

    // Calculate uptime if module is active
    let uptimeSeconds: number | null = null
    if (module.status === 'active' && module.activatedAt) {
      uptimeSeconds = Math.floor((Date.now() - new Date(module.activatedAt).getTime()) / 1000)
    }

    return c.json({
      moduleId,
      analytics: {
        ...analytics,
        uptime: uptimeSeconds,
        status: module.status,
        installedAt: module.installedAt,
        activatedAt: module.activatedAt,
        updatedAt: module.updatedAt,
      },
      recentEvents,
    })
  } catch (error) {
    console.error('Failed to get module analytics:', error)
    return c.json({
      error: 'Failed to get module analytics',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, 500)
  }
})

export default app
