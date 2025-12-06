import { Hono } from 'hono'
import type { Bindings } from '@/types/bindings.js'
import type { HonoVariables } from '@/types/hono.js'
import { createModuleManager } from '@/services/moduleService/moduleManager.js'

interface GeneratorResponse {
  id: string
  displayName: string
  description: string
  category: string
  outputType: string
  icon?: string | undefined
  moduleId?: string | undefined
  moduleName?: string | undefined
  options?: Array<{
    id: string
    type: string
    displayName: string
    description?: string | undefined
    default?: unknown
    required?: boolean | undefined
    options?: Array<{ value: string; label: string }> | undefined
  }> | undefined
}

const app = new Hono<{ Bindings: Bindings; Variables: HonoVariables }>()

/**
 * GET /api/schema/generators
 * Returns all available data generators from active modules
 */
app.get('/generators', async (c) => {
  try {
    const generators: GeneratorResponse[] = []

    // Get module data generators
    const moduleManager = createModuleManager(c.env)
    await moduleManager.initialize()

    const moduleGenerators = moduleManager.getDataGenerators()

    // Add module generators with module info
    for (const gen of moduleGenerators) {
      // Parse moduleId:generatorId format
      const [moduleId, generatorId] = gen.id.includes(':')
        ? gen.id.split(':')
        : [undefined, gen.id]

      // Get module info
      let moduleName: string | undefined
      if (moduleId) {
        const installedModule = await moduleManager.registry.get(moduleId)
        moduleName = installedModule?.name
      }

      generators.push({
        id: generatorId || gen.id,
        displayName: gen.displayName,
        description: gen.description,
        category: gen.category || 'general',
        outputType: gen.outputType || 'text',
        icon: gen.icon,
        moduleId,
        moduleName,
        options: gen.options,
      })
    }

    return c.json({
      data: generators,
      meta: {
        totalCount: generators.length,
      },
    })
  } catch (error) {
    console.error('Error fetching generators:', error)
    return c.json(
      {
        error: 'Failed to fetch generators',
        details: error instanceof Error ? error.message : String(error),
      },
      500
    )
  }
})

export default app
