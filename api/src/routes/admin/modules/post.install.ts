import { Hono } from 'hono'
import type { Bindings } from '@/types/bindings.js'
import type { HonoVariables } from '@/types/hono.js'
import type { ModuleSource } from '@/types/modules.js'
import { adminOnlyMiddleware } from '@/middleware/admin.js'
import { createModuleManager } from '@/services/moduleService/moduleManager.js'

const app = new Hono<{ Bindings: Bindings; Variables: HonoVariables }>()

interface InstallRequest {
  source: ModuleSource
  activate?: boolean
}

/**
 * POST /api/admin/modules/install
 * Install a new module from various sources
 */
app.post('/install', adminOnlyMiddleware, async (c) => {
  try {
    const body = await c.req.json<InstallRequest>()
    const { source, activate = false } = body

    // Validate request
    if (!source || !source.type) {
      return c.json({ error: 'Source with type is required' }, 400)
    }

    const validTypes: ModuleSource['type'][] = ['url', 'local', 'upload']
    if (!validTypes.includes(source.type)) {
      return c.json({
        error: 'Invalid source type',
        validTypes,
      }, 400)
    }

    // Validate required fields based on source type
    if (source.type === 'url' && !source.url) {
      return c.json({ error: 'URL is required for url source type' }, 400)
    }
    if (source.type === 'local' && !source.path) {
      return c.json({ error: 'Path is required for local source' }, 400)
    }

    const manager = createModuleManager(c.env)

    // Install the module
    const result = await manager.install(source)

    if (!result.success) {
      return c.json({
        error: 'Failed to install module',
        details: result.error,
      }, 400)
    }

    // Optionally activate immediately
    if (activate && result.moduleId) {
      try {
        await manager.activate(result.moduleId)
        const updated = await manager.registry.get(result.moduleId)
        return c.json({
          message: 'Module installed and activated successfully',
          module: updated,
        }, 201)
      } catch (activateError) {
        // Module installed but activation failed
        const installed = await manager.registry.get(result.moduleId)
        return c.json({
          message: 'Module installed but activation failed',
          module: installed,
          activationError: activateError instanceof Error ? activateError.message : 'Unknown error',
        }, 201)
      }
    }

    const installed = await manager.registry.get(result.moduleId)
    return c.json({
      message: 'Module installed successfully',
      module: installed,
    }, 201)
  } catch (error) {
    console.error('Failed to install module:', error)
    return c.json({
      error: 'Failed to install module',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, 500)
  }
})

export default app
