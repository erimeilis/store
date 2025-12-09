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

interface ModulesManifest {
  _meta: {
    generated: string
    source: string
    warning: string
  }
  modules: ScannedModule[]
}

const app = new Hono<{ Bindings: Bindings; Variables: HonoVariables }>()

/**
 * GET /api/admin/modules/available
 * List available local modules that can be installed
 *
 * The manifest is auto-generated at build time by: npm run scan:modules
 * Source of truth: modules/[name]/store-module.json
 */
app.get('/available', adminOnlyMiddleware, async (c) => {
  const manifest = modulesManifest as ModulesManifest

  // Transform from { path, manifest } to frontend expected { path, name, version, description }
  const availableModules = manifest.modules.map((m) => ({
    path: m.path,
    name: m.manifest.name,
    version: m.manifest.version,
    description: m.manifest.description,
  }))

  return c.json({ data: availableModules })
})

export default app
