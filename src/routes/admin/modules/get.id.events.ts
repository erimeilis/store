import { Hono } from 'hono'
import type { Bindings } from '@/types/bindings.js'
import type { HonoVariables } from '@/types/hono.js'
import { adminOnlyMiddleware } from '@/middleware/admin.js'
import { ModuleRepository } from '@/repositories/moduleRepository.js'

const app = new Hono<{ Bindings: Bindings; Variables: HonoVariables }>()

/**
 * GET /api/admin/modules/:id/events
 * Get event log for a specific module
 */
app.get('/:id/events', adminOnlyMiddleware, async (c) => {
  try {
    const moduleId = decodeURIComponent(c.req.param('id'))
    const limit = parseInt(c.req.query('limit') || '50', 10)
    const offset = parseInt(c.req.query('offset') || '0', 10)
    const eventType = c.req.query('type')

    // Validate pagination
    if (limit < 1 || limit > 100) {
      return c.json({ error: 'Limit must be between 1 and 100' }, 400)
    }

    const repository = new ModuleRepository(c.env)

    // Check if module exists
    const module = await repository.get(moduleId)
    if (!module) {
      return c.json({ error: 'Module not found' }, 404)
    }

    // Get events
    const events = await repository.getEvents(moduleId, {
      limit,
      offset,
    })

    // Filter by event type if specified (client-side filter since repository doesn't support it)
    const filteredEvents = eventType
      ? events.filter(e => e.eventType === eventType)
      : events

    // Get total count for pagination (without limit)
    const allEvents = await repository.getEvents(moduleId)
    const filteredTotal = eventType
      ? allEvents.filter(e => e.eventType === eventType).length
      : allEvents.length

    return c.json({
      moduleId,
      events: filteredEvents,
      pagination: {
        limit,
        offset,
        total: filteredTotal,
        hasMore: offset + filteredEvents.length < filteredTotal,
      },
    })
  } catch (error) {
    console.error('Failed to get module events:', error)
    return c.json({
      error: 'Failed to get module events',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, 500)
  }
})

export default app
