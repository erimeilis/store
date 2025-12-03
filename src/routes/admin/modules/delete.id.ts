import { Hono } from 'hono'
import type { Bindings } from '@/types/bindings.js'
import type { HonoVariables } from '@/types/hono.js'
import { adminOnlyMiddleware } from '@/middleware/admin.js'
import { ModuleRepository } from '@/repositories/moduleRepository.js'
import { createModuleManager } from '@/services/moduleService/moduleManager.js'

const app = new Hono<{ Bindings: Bindings; Variables: HonoVariables }>()

/**
 * DELETE /api/admin/modules/:id
 * Uninstall a module
 */
app.delete('/:id', adminOnlyMiddleware, async (c) => {
  try {
    const moduleId = decodeURIComponent(c.req.param('id'))
    const force = c.req.query('force') === 'true'

    const repository = new ModuleRepository(c.env)
    const manager = createModuleManager(c.env, repository)

    // Check if module exists
    const module = await repository.get(moduleId)
    if (!module) {
      return c.json({ error: 'Module not found' }, 404)
    }

    // Check if module is active (unless force is true)
    if (module.status === 'active' && !force) {
      return c.json({
        error: 'Cannot uninstall active module',
        message: 'Deactivate the module first or use ?force=true',
      }, 400)
    }

    // If module is active and force is true, deactivate first
    if (module.status === 'active' && force) {
      try {
        await manager.deactivate(moduleId)
      } catch (deactivateError) {
        console.warn('Failed to deactivate module before uninstall:', deactivateError)
        // Continue with uninstall anyway since force=true
      }
    }

    // Uninstall the module
    await manager.uninstall(moduleId)

    return c.json({
      message: 'Module uninstalled successfully',
      moduleId,
    })
  } catch (error) {
    console.error('Failed to uninstall module:', error)
    return c.json({
      error: 'Failed to uninstall module',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, 500)
  }
})

export default app
