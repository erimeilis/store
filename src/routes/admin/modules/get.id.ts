import { Hono } from 'hono'
import type { Bindings } from '@/types/bindings.js'
import type { HonoVariables } from '@/types/hono.js'
import { adminOnlyMiddleware } from '@/middleware/admin.js'
import { ModuleRepository } from '@/repositories/moduleRepository.js'

const app = new Hono<{ Bindings: Bindings; Variables: HonoVariables }>()

/**
 * GET /api/admin/modules/:id
 * Get details for a specific module
 */
app.get('/:id', adminOnlyMiddleware, async (c) => {
  try {
    const moduleId = decodeURIComponent(c.req.param('id'))
    const repository = new ModuleRepository(c.env)

    const module = await repository.get(moduleId)
    if (!module) {
      return c.json({ error: 'Module not found' }, 404)
    }

    const [analytics, capabilities, events] = await Promise.all([
      repository.getAnalytics(moduleId),
      repository.getCapabilities(moduleId),
      repository.getEvents(moduleId, { limit: 10 }),
    ])

    return c.json({
      id: module.id,
      name: module.name,
      version: module.version,
      displayName: module.displayName,
      description: module.description,
      author: module.author,
      source: module.source,
      status: module.status,
      installedAt: module.installedAt,
      updatedAt: module.updatedAt,
      activatedAt: module.activatedAt,
      error: module.error,
      errorAt: module.errorAt,
      settings: module.settings,
      manifest: module.manifest,
      capabilities,
      analytics,
      recentEvents: events,
    })
  } catch (error) {
    console.error('Failed to get module:', error)
    return c.json({
      error: 'Failed to get module',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, 500)
  }
})

export default app
