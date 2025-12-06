import { Hono } from 'hono'
import type { Bindings } from '@/types/bindings.js'
import type { HonoVariables } from '@/types/hono.js'
import { adminOnlyMiddleware } from '@/middleware/admin.js'
import { ModuleRepository } from '@/repositories/moduleRepository.js'

const app = new Hono<{ Bindings: Bindings; Variables: HonoVariables }>()

interface SettingsUpdateRequest {
  settings: Record<string, unknown>
}

/**
 * PATCH /api/admin/modules/:id/settings
 * Update module settings
 */
app.patch('/:id/settings', adminOnlyMiddleware, async (c) => {
  try {
    const moduleId = decodeURIComponent(c.req.param('id'))
    const body = await c.req.json<SettingsUpdateRequest>()
    const { settings } = body

    // Validate settings
    if (!settings || typeof settings !== 'object') {
      return c.json({ error: 'Settings must be an object' }, 400)
    }

    const repository = new ModuleRepository(c.env)

    // Check if module exists
    const module = await repository.get(moduleId)
    if (!module) {
      return c.json({ error: 'Module not found' }, 404)
    }

    // Merge settings with existing ones
    const mergedSettings = {
      ...module.settings,
      ...settings,
    }

    // Update the module settings
    await repository.update(moduleId, {
      settings: mergedSettings,
    })

    // Log the settings change event
    await repository.logEvent(moduleId, 'settings_change', {
      details: {
        changedKeys: Object.keys(settings),
        previousSettings: module.settings,
        newSettings: mergedSettings,
      },
    })

    const updated = await repository.get(moduleId)

    return c.json({
      message: 'Module settings updated successfully',
      module: updated,
    })
  } catch (error) {
    console.error('Failed to update module settings:', error)
    return c.json({
      error: 'Failed to update module settings',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, 500)
  }
})

export default app
