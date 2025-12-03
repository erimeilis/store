import { Hono } from 'hono'
import type { Bindings } from '@/types/bindings.js'
import type { HonoVariables } from '@/types/hono.js'
import { adminOnlyMiddleware } from '@/middleware/admin.js'
import { ModuleRepository } from '@/repositories/moduleRepository.js'
import { createModuleManager } from '@/services/moduleService/moduleManager.js'

const app = new Hono<{ Bindings: Bindings; Variables: HonoVariables }>()

/**
 * POST /api/admin/modules/reload
 * Reload all active modules
 */
app.post('/reload', adminOnlyMiddleware, async (c) => {
  try {
    const repository = new ModuleRepository(c.env)
    const manager = createModuleManager(c.env, repository)

    // Get all active modules
    const activeModules = await repository.findByStatus('active')

    if (activeModules.length === 0) {
      return c.json({
        message: 'No active modules to reload',
        results: [],
      })
    }

    // Reload each module and track results
    const results = await Promise.allSettled(
      activeModules.map(async (module) => {
        try {
          await manager.reload(module.id)
          return {
            moduleId: module.id,
            status: 'success' as const,
          }
        } catch (error) {
          return {
            moduleId: module.id,
            status: 'failed' as const,
            error: error instanceof Error ? error.message : 'Unknown error',
          }
        }
      })
    )

    // Process results
    const reloadResults = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value
      }
      const moduleAtIndex = activeModules[index]
      return {
        moduleId: moduleAtIndex?.id ?? 'unknown',
        status: 'failed' as const,
        error: result.reason instanceof Error ? result.reason.message : 'Unknown error',
      }
    })

    const successCount = reloadResults.filter(r => r.status === 'success').length
    const failedCount = reloadResults.filter(r => r.status === 'failed').length

    return c.json({
      message: `Reloaded ${successCount} of ${activeModules.length} modules`,
      summary: {
        total: activeModules.length,
        success: successCount,
        failed: failedCount,
      },
      results: reloadResults,
    })
  } catch (error) {
    console.error('Failed to reload modules:', error)
    return c.json({
      error: 'Failed to reload modules',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, 500)
  }
})

export default app
