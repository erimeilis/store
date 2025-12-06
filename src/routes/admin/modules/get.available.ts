import { Hono } from 'hono'
import type { Bindings } from '@/types/bindings.js'
import type { HonoVariables } from '@/types/hono.js'
import { adminOnlyMiddleware } from '@/middleware/admin.js'
import modulesManifest from '@/data/modules-manifest.json'

interface ScannedModule {
  path: string
  manifest: {
    name: string
    version: string
    description?: string
  }
}

const app = new Hono<{ Bindings: Bindings; Variables: HonoVariables }>()

/**
 * GET /api/admin/modules/available
 * List available local modules that can be installed
 *
 * The manifest is generated at build time by: npm run scan:modules
 */
app.get('/available', adminOnlyMiddleware, async (c) => {
  // Transform from new structure { path, manifest } to frontend expected { path, name, version, description }
  const availableModules = (modulesManifest as ScannedModule[]).map((m) => ({
    path: m.path,
    name: m.manifest.name,
    version: m.manifest.version,
    description: m.manifest.description,
  }))

  return c.json({ data: availableModules })
})

export default app
