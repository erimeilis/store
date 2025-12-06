import { Hono } from 'hono'
import type { Bindings } from '@/types/bindings.js'
import type { HonoVariables } from '@/types/hono.js'
import { adminOnlyMiddleware } from '@/middleware/admin.js'
import { createModuleManager } from '@/services/moduleService/moduleManager.js'

const app = new Hono<{ Bindings: Bindings; Variables: HonoVariables }>()

type ModuleAction = 'activate' | 'deactivate' | 'reload'

interface ActionRequest {
  action: ModuleAction
}

/**
 * POST /api/admin/modules/:id/action
 * Perform an action on a module (activate, deactivate, reload)
 */
app.post('/:id/action', adminOnlyMiddleware, async (c) => {
  try {
    const moduleId = decodeURIComponent(c.req.param('id'))
    const body = await c.req.json<ActionRequest>()
    const { action } = body

    // Validate action
    const validActions: ModuleAction[] = ['activate', 'deactivate', 'reload']
    if (!action || !validActions.includes(action)) {
      return c.json({
        error: 'Invalid action',
        validActions,
      }, 400)
    }

    const manager = createModuleManager(c.env)

    // Check if module exists
    const module = await manager.registry.get(moduleId)
    if (!module) {
      return c.json({ error: 'Module not found' }, 404)
    }

    // Perform the action
    switch (action) {
      case 'activate': {
        await manager.activate(moduleId)
        const updated = await manager.registry.get(moduleId)
        return c.json({
          message: 'Module activated successfully',
          module: updated,
        })
      }

      case 'deactivate': {
        await manager.deactivate(moduleId)
        const updated = await manager.registry.get(moduleId)
        return c.json({
          message: 'Module deactivated successfully',
          module: updated,
        })
      }

      case 'reload': {
        await manager.reload(moduleId)
        const updated = await manager.registry.get(moduleId)
        return c.json({
          message: 'Module reloaded successfully',
          module: updated,
        })
      }

      default:
        return c.json({ error: 'Unknown action' }, 400)
    }
  } catch (error) {
    console.error('Failed to perform module action:', error)
    return c.json({
      error: 'Failed to perform module action',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, 500)
  }
})

export default app
