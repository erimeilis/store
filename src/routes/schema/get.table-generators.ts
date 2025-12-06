import { Hono } from 'hono'
import type { Bindings } from '@/types/bindings.js'
import type { HonoVariables } from '@/types/hono.js'
import type { TableGeneratorDefinition } from '@/types/modules.js'
import { createModuleManager } from '@/services/moduleService/index.js'

/**
 * Built-in table generators that are always available
 * These generate complete tables with schema and fake data
 */
const BUILT_IN_TABLE_GENERATORS = [
  {
    id: 'test-tables',
    displayName: 'Test Tables',
    description: 'Generate random test tables with various column types and data',
    icon: 'wand',
    category: 'testing',
    tableType: 'default' as const,
    defaultTableCount: 100,
    defaultRowCount: 200,
    color: 'warning' as const,
  },
  {
    id: 'sale-tables',
    displayName: 'For Sale Tables',
    description: 'Generate tables configured for selling items with price and quantity columns',
    icon: 'shopping-cart',
    category: 'commerce',
    tableType: 'sale' as const,
    defaultTableCount: 20,
    defaultRowCount: 50,
    color: 'success' as const,
  },
  {
    id: 'rental-tables',
    displayName: 'Rental Tables',
    description: 'Generate generic rental tables with pricing, availability, and usage tracking',
    icon: 'clock-dollar',
    category: 'commerce',
    tableType: 'rent' as const,
    defaultTableCount: 20,
    defaultRowCount: 50,
    color: 'info' as const,
  },
]

interface TableGeneratorResponse {
  id: string
  displayName: string
  description: string
  icon?: string | undefined
  category?: string | undefined
  tableType: 'sale' | 'rent' | 'default'
  defaultTableCount: number
  defaultRowCount: number
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error' | undefined
  customGenerator?: boolean | undefined
  moduleId?: string | undefined
  moduleName?: string | undefined
}

const app = new Hono<{ Bindings: Bindings; Variables: HonoVariables }>()

/**
 * GET /api/schema/table-generators
 * Returns all available table generators (built-in + from active local modules)
 *
 * Module generators are loaded from statically bundled modules at build time,
 * but filtered by database activation status at runtime.
 */
app.get('/table-generators', async (c) => {
  // Start with built-in generators
  const tableGenerators: TableGeneratorResponse[] = BUILT_IN_TABLE_GENERATORS.map((tg) => ({
    ...tg,
    moduleId: undefined,
    moduleName: undefined,
    customGenerator: undefined,
  }))

  // Get table generators from active modules via module manager
  const moduleManager = createModuleManager(c.env)
  await moduleManager.initialize()
  const moduleGenerators: TableGeneratorDefinition[] = moduleManager.getTableGenerators()

  // Add module generators with module info
  for (const mtg of moduleGenerators) {
    // Module generators are prefixed with moduleId, e.g., '@store/phone-numbers:phone-rental-tables'
    const [moduleId] = mtg.id.split(':')
    tableGenerators.push({
      id: mtg.id,
      displayName: mtg.displayName,
      description: mtg.description || '',
      icon: mtg.icon,
      category: mtg.category,
      tableType: mtg.tableType,
      defaultTableCount: mtg.defaultTableCount,
      defaultRowCount: mtg.defaultRowCount,
      color: mtg.color,
      customGenerator: true, // Module generators have custom column definitions
      moduleId: moduleId,
      moduleName: moduleId,
    })
  }

  return c.json({
    data: tableGenerators,
    meta: {
      builtInCount: BUILT_IN_TABLE_GENERATORS.length,
      moduleCount: moduleGenerators.length,
      totalCount: tableGenerators.length,
    },
  })
})

export default app
