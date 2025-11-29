import { Hono } from 'hono'
import { adminWriteAuthMiddleware } from '@/middleware/auth.js'
import { TableService } from '@/services/tableService/index.js'
import type { Bindings } from '@/types/bindings.js'
import type { UserContext } from '@/types/database.js'
import {
  TableType,
  TypeChangePreviewRequest,
  TypeChangePreviewResponse,
  TypeChangeMappingItem,
  RequiredColumnInfo,
  getDefaultColumns,
  ColumnType
} from '@/types/dynamic-tables.js'

const app = new Hono<{
  Bindings: Bindings
  Variables: { user: UserContext }
}>()

/**
 * Column matching algorithm - matches existing columns to required columns
 * Uses multiple strategies with scoring
 */
function generateSuggestedMappings(
  existingColumns: Array<{ id: string; name: string; type: ColumnType; isRequired: boolean }>,
  requiredColumns: RequiredColumnInfo[]
): TypeChangeMappingItem[] {
  const mappings: TypeChangeMappingItem[] = []
  const usedColumnIds = new Set<string>()

  // Score all possible matches
  const scoredMatches: Array<{
    requiredColumn: string
    existingColumn: { id: string; name: string; type: ColumnType }
    score: number
  }> = []

  for (const required of requiredColumns) {
    const normalizedRequired = required.name.toLowerCase().trim()

    for (const existing of existingColumns) {
      const normalizedExisting = existing.name.toLowerCase().trim()
      let score = 0

      // Strategy 1: Exact match (highest priority)
      if (normalizedExisting === normalizedRequired) {
        score = 100
      }
      // Strategy 2: Exact match without special chars
      else if (
        normalizedExisting.replace(/[^a-z0-9]/g, '') ===
        normalizedRequired.replace(/[^a-z0-9]/g, '')
      ) {
        score = 90
      }
      // Strategy 3: Contains match
      else if (
        normalizedExisting.includes(normalizedRequired) ||
        normalizedRequired.includes(normalizedExisting)
      ) {
        score = 70
      }
      // Strategy 4: Type compatibility bonus
      else if (isTypeCompatible(existing.type, required.type)) {
        // Partial match by type + keyword similarity
        const keywords = getTypeKeywords(required.type)
        const hasKeyword = keywords.some(k => normalizedExisting.includes(k))
        if (hasKeyword) {
          score = 50
        }
      }

      // Type compatibility bonus
      if (score > 0 && isTypeCompatible(existing.type, required.type)) {
        score += 5
      }

      if (score > 0) {
        scoredMatches.push({
          requiredColumn: required.name,
          existingColumn: existing,
          score
        })
      }
    }
  }

  // Sort by score descending
  scoredMatches.sort((a, b) => b.score - a.score)

  // Greedily assign best matches (no column reuse)
  for (const match of scoredMatches) {
    // Skip if required column already mapped
    if (mappings.some(m => m.requiredColumn === match.requiredColumn)) {
      continue
    }
    // Skip if existing column already used
    if (usedColumnIds.has(match.existingColumn.id)) {
      continue
    }

    mappings.push({
      requiredColumn: match.requiredColumn,
      existingColumnId: match.existingColumn.id,
      existingColumnName: match.existingColumn.name,
      confidence: match.score
    })
    usedColumnIds.add(match.existingColumn.id)
  }

  // Add unmapped required columns (will need to create new)
  for (const required of requiredColumns) {
    if (!mappings.some(m => m.requiredColumn === required.name)) {
      mappings.push({
        requiredColumn: required.name,
        existingColumnId: null,
        existingColumnName: null,
        confidence: 0
      })
    }
  }

  return mappings
}

/**
 * Check if column types are compatible for mapping
 */
function isTypeCompatible(existingType: ColumnType, requiredType: ColumnType): boolean {
  // Exact match
  if (existingType === requiredType) return true

  // Number compatibility
  const numberTypes: ColumnType[] = ['number', 'integer', 'float', 'currency', 'percentage']
  if (numberTypes.includes(existingType) && numberTypes.includes(requiredType)) {
    return true
  }

  // Boolean is only compatible with itself
  if (requiredType === 'boolean') {
    return existingType === 'boolean'
  }

  // Text types are generally compatible
  const textTypes: ColumnType[] = ['text', 'textarea', 'email', 'url', 'phone']
  if (textTypes.includes(existingType) && textTypes.includes(requiredType)) {
    return true
  }

  return false
}

/**
 * Get keywords associated with a column type for fuzzy matching
 */
function getTypeKeywords(type: ColumnType): string[] {
  switch (type) {
    case 'number':
    case 'integer':
    case 'float':
    case 'currency':
      return ['price', 'cost', 'amount', 'total', 'qty', 'quantity', 'count', 'fee', 'rate']
    case 'boolean':
      return ['is', 'has', 'can', 'available', 'used', 'active', 'enabled', 'visible', 'flag']
    default:
      return []
  }
}

/**
 * POST /tables/:id/preview-type-change
 * Preview what happens when changing table type, with suggested column mappings
 */
app.post('/:id/preview-type-change', adminWriteAuthMiddleware, async (c) => {
  try {
    const tableId = c.req.param('id')

    // Parse request
    const body = await c.req.json() as TypeChangePreviewRequest
    const { targetType } = body

    if (!targetType || !['default', 'sale', 'rent'].includes(targetType)) {
      return c.json({ error: 'Invalid target type', message: 'targetType must be "default", "sale", or "rent"' }, 400)
    }

    const service = new TableService(c.env)
    const user = c.get('user')

    // Get table with columns
    const tableResult = await service.getTable(c, user, tableId)
    if (tableResult.status !== 200 || !tableResult.response?.table) {
      return c.json({ error: 'Table not found', message: 'Table does not exist or you do not have access' }, 404)
    }

    const table = tableResult.response.table.table
    const existingColumns = tableResult.response.table.columns || []

    // Map existing columns
    const mappedExistingColumns = existingColumns.map((col: { id: string; name: string; type: ColumnType; isRequired: boolean }) => ({
      id: col.id,
      name: col.name,
      type: col.type,
      isRequired: col.isRequired
    }))

    // Get required columns for target type
    const defaultColumns = getDefaultColumns(targetType)
    const requiredColumns: RequiredColumnInfo[] = defaultColumns.map(col => ({
      name: col.name,
      type: col.type,
      isRequired: col.isRequired,
      defaultValue: col.defaultValue != null ? String(col.defaultValue) : null
    }))

    // Generate suggested mappings
    const suggestedMappings = generateSuggestedMappings(mappedExistingColumns, requiredColumns)

    // Check if all required columns are mapped
    const allMapped = suggestedMappings.every(m => m.existingColumnId !== null)

    const response: TypeChangePreviewResponse = {
      currentType: table.tableType,
      targetType,
      requiredColumns,
      existingColumns: mappedExistingColumns,
      suggestedMappings,
      allMapped
    }

    return c.json({ data: response, message: 'Type change preview generated' })
  } catch (error) {
    console.error('Error in preview-type-change:', error)
    return c.json({
      error: 'Failed to preview type change',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

export default app
