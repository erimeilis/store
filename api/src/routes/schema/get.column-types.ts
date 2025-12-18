import { Hono } from 'hono'
import type { Bindings } from '@/types/bindings.js'
import type { HonoVariables } from '@/types/hono.js'
import type { ColumnTypeDefinition } from '@/types/modules.js'
import { createModuleManager } from '@/services/moduleService/index.js'

/**
 * Built-in column types that are always available
 */
const BUILT_IN_COLUMN_TYPES = [
  {
    id: 'text',
    displayName: 'Text',
    description: 'Short text input (max 255 chars)',
    category: 'text',
    icon: 'type',
  },
  {
    id: 'textarea',
    displayName: 'Long Text',
    description: 'Multi-line text area',
    category: 'text',
    icon: 'align-left',
  },
  {
    id: 'number',
    displayName: 'Number',
    description: 'Numeric value (integer or decimal)',
    category: 'number',
    icon: 'hash',
  },
  {
    id: 'integer',
    displayName: 'Integer',
    description: 'Whole numbers only',
    category: 'number',
    icon: 'hash',
  },
  {
    id: 'float',
    displayName: 'Decimal',
    description: 'Decimal numbers',
    category: 'number',
    icon: 'hash',
  },
  {
    id: 'currency',
    displayName: 'Currency',
    description: 'Money amount (2 decimal places)',
    category: 'number',
    icon: 'dollar-sign',
  },
  {
    id: 'percentage',
    displayName: 'Percentage',
    description: 'Percent value (0-100)',
    category: 'number',
    icon: 'percent',
  },
  {
    id: 'date',
    displayName: 'Date',
    description: 'Calendar date (YYYY-MM-DD)',
    category: 'datetime',
    icon: 'calendar',
  },
  {
    id: 'time',
    displayName: 'Time',
    description: 'Time only (HH:MM)',
    category: 'datetime',
    icon: 'clock',
  },
  {
    id: 'datetime',
    displayName: 'Date & Time',
    description: 'Date + time (ISO format)',
    category: 'datetime',
    icon: 'calendar-clock',
  },
  {
    id: 'boolean',
    displayName: 'Boolean',
    description: 'True/false checkbox',
    category: 'other',
    icon: 'toggle-left',
  },
  {
    id: 'email',
    displayName: 'Email',
    description: 'Email address with validation',
    category: 'text',
    icon: 'mail',
  },
  {
    id: 'url',
    displayName: 'URL',
    description: 'Web address with validation',
    category: 'text',
    icon: 'link',
  },
  {
    id: 'phone',
    displayName: 'Phone',
    description: 'Phone number (allows + ( ) - spaces digits)',
    category: 'text',
    icon: 'phone',
  },
  {
    id: 'country',
    displayName: 'Country',
    description: 'Country selector with ISO codes',
    category: 'text',
    icon: 'globe',
  },
  {
    id: 'select',
    displayName: 'Select',
    description: 'Dropdown options (requires options config)',
    category: 'other',
    icon: 'list',
  },
  {
    id: 'rating',
    displayName: 'Rating',
    description: 'Star rating (1-5)',
    category: 'other',
    icon: 'star',
  },
  {
    id: 'color',
    displayName: 'Color',
    description: 'Color picker (hex format)',
    category: 'other',
    icon: 'palette',
  },
]

interface ColumnTypeResponse {
  id: string
  displayName: string
  description: string
  category: string
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
 * GET /api/schema/column-types
 * Returns all available column types (built-in + from active local modules)
 *
 * Module column types are loaded from statically bundled modules at build time,
 * but filtered by database activation status at runtime.
 */
app.get('/column-types', async (c) => {
  // Start with built-in types
  const columnTypes: ColumnTypeResponse[] = BUILT_IN_COLUMN_TYPES.map((ct) => ({
    ...ct,
    moduleId: undefined,
    moduleName: undefined,
  }))

  // Get column types from active modules via module manager
  const moduleManager = createModuleManager(c.env)
  await moduleManager.initialize()
  const moduleColumnTypes: ColumnTypeDefinition[] = moduleManager.getColumnTypes()

  // Add module types with module info
  for (const mct of moduleColumnTypes) {
    // Module types are prefixed with moduleId, e.g., '@store/phone-numbers:phone'
    const [moduleId] = mct.id.split(':')
    columnTypes.push({
      id: mct.id,
      displayName: mct.displayName,
      description: mct.description || '',
      category: mct.category || 'Module',
      icon: mct.icon,
      moduleId: moduleId,
      moduleName: moduleId,
      options: mct.options,
    })
  }

  return c.json({
    data: columnTypes,
    meta: {
      builtInCount: BUILT_IN_COLUMN_TYPES.length,
      moduleCount: moduleColumnTypes.length,
      totalCount: columnTypes.length,
    },
  })
})

export default app
