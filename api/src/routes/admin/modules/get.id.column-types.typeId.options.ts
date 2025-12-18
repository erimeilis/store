import { Hono } from 'hono'
import type { Bindings } from '@/types/bindings.js'
import type { HonoVariables } from '@/types/hono.js'
import { adminOnlyMiddleware } from '@/middleware/admin.js'
import { DataSourceService } from '@/services/moduleService/dataSourceService.js'
import { ModuleRepository } from '@/repositories/moduleRepository.js'

const app = new Hono<{ Bindings: Bindings; Variables: HonoVariables }>()

/**
 * GET /api/admin/modules/:id/column-types/:typeId/options
 * Fetch options for a column type's data source
 */
app.get('/:id/column-types/:typeId/options', adminOnlyMiddleware, async (c) => {
  try {
    const moduleId = decodeURIComponent(c.req.param('id'))
    const typeId = decodeURIComponent(c.req.param('typeId'))

    const service = new DataSourceService(c.env)
    const result = await service.fetchColumnTypeOptions(moduleId, typeId)

    if (!result.success) {
      return c.json({ error: result.error }, 400)
    }

    // Get column type metadata from module manifest
    const moduleRepo = new ModuleRepository(c.env)
    const module = await moduleRepo.get(moduleId)
    const columnType = module?.manifest?.columnTypes?.find(ct => ct.id === typeId)

    return c.json({
      moduleId,
      columnTypeId: typeId,
      options: result.options,
      multiValue: columnType?.multiValue || false,
      cached: result.cached || false,
      cachedAt: result.cachedAt,
    })
  } catch (error) {
    console.error('Failed to fetch column type options:', error)
    return c.json({
      error: 'Failed to fetch options',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, 500)
  }
})

/**
 * DELETE /api/admin/modules/:id/column-types/:typeId/options/cache
 * Invalidate cache for a column type's data source
 */
app.delete('/:id/column-types/:typeId/options/cache', adminOnlyMiddleware, async (c) => {
  try {
    const moduleId = decodeURIComponent(c.req.param('id'))
    const typeId = decodeURIComponent(c.req.param('typeId'))

    const service = new DataSourceService(c.env)
    await service.invalidateCache(moduleId, typeId)

    return c.json({ success: true, message: 'Cache invalidated' })
  } catch (error) {
    console.error('Failed to invalidate cache:', error)
    return c.json({
      error: 'Failed to invalidate cache',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, 500)
  }
})

export default app
