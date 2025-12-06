import { Hono } from 'hono'
import type { Bindings } from '@/types/bindings.js'
import type { HonoVariables } from '@/types/hono.js'
import { getGenerationHandlers, getCommonFakerMethods } from '@/services/moduleService/handlers/index.js'

interface GeneratorResponse {
  id: string
  displayName: string
  description: string
  category: string
  outputType: string
}

const app = new Hono<{ Bindings: Bindings; Variables: HonoVariables }>()

/**
 * GET /api/schema/generators
 * Returns all available generation handlers (built-in data generators)
 *
 * Note: This returns the built-in generation handlers, not table generators.
 * For table generators, use /api/schema/table-generators
 */
app.get('/generators', async (c) => {
  // Get built-in generation handlers
  const handlers = getGenerationHandlers()
  const fakerMethods = getCommonFakerMethods()

  const generators: GeneratorResponse[] = [
    // Built-in handlers
    ...handlers.map(handler => ({
      id: handler,
      displayName: handler.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase()),
      description: `Built-in ${handler} generator`,
      category: 'built-in',
      outputType: getOutputType(handler),
    })),
    // Common faker methods
    ...fakerMethods.map(method => ({
      id: `faker:${method}`,
      displayName: method.replace(/\./g, ' → ').replace(/\b\w/g, char => char.toUpperCase()),
      description: `Faker.js ${method} method`,
      category: 'faker',
      outputType: 'string',
    })),
  ]

  return c.json({
    data: generators,
    meta: {
      totalCount: generators.length,
      builtInCount: handlers.length,
      fakerCount: fakerMethods.length,
    },
  })
})

function getOutputType(handler: string): string {
  switch (handler) {
    case 'random-int':
    case 'random-float':
    case 'sequence':
      return 'number'
    case 'random-boolean':
      return 'boolean'
    default:
      return 'string'
  }
}

export default app
