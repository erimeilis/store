import { useState, useEffect, useCallback } from 'react'
import { COLUMN_TYPE_OPTIONS, ColumnTypeOption, ColumnType } from '@/types/dynamic-tables'
import { clientApiRequest } from '@/lib/client-api'

/**
 * Extended column type with module information
 */
export interface ExtendedColumnTypeOption extends ColumnTypeOption {
  moduleId?: string
  moduleName?: string
  options?: Array<{
    id: string
    type: string
    displayName: string
    description?: string
    default?: unknown
    required?: boolean
    options?: Array<{ value: string; label: string }>
  }>
}

interface ColumnTypesResponse {
  data: Array<{
    id: string
    displayName: string
    description: string
    category: string
    icon?: string
    moduleId?: string
    moduleName?: string
    options?: Array<{
      id: string
      type: string
      displayName: string
      description?: string
      default?: unknown
      required?: boolean
      options?: Array<{ value: string; label: string }>
    }>
  }>
  meta: {
    builtInCount: number
    moduleCount: number
    totalCount: number
  }
}

/**
 * Fetch column types from the API
 */
export async function fetchColumnTypes(): Promise<ExtendedColumnTypeOption[]> {
  try {
    const response = await clientApiRequest('/api/schema/column-types')

    if (!response.ok) {
      console.warn('Failed to fetch column types, using defaults')
      return COLUMN_TYPE_OPTIONS
    }

    const result: ColumnTypesResponse = await response.json()

    // Convert API response to ColumnTypeOption format
    return result.data.map((ct) => ({
      value: ct.id as ColumnType,
      label: ct.displayName,
      description: ct.description,
      icon: ct.icon,
      moduleId: ct.moduleId,
      moduleName: ct.moduleName,
      options: ct.options,
    }))
  } catch (error) {
    console.warn('Error fetching column types, using defaults:', error)
    return COLUMN_TYPE_OPTIONS
  }
}

/**
 * Hook to use column types with automatic fetching
 */
export function useColumnTypes() {
  const [columnTypes, setColumnTypes] = useState<ExtendedColumnTypeOption[]>(COLUMN_TYPE_OPTIONS)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasFetched, setHasFetched] = useState(false)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const types = await fetchColumnTypes()
      setColumnTypes(types)
      setHasFetched(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch column types')
      // Keep using default column types on error
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  // Group column types by category
  const groupedColumnTypes = columnTypes.reduce(
    (acc, ct) => {
      // Built-in types don't have moduleId
      const category = ct.moduleId ? `Module: ${ct.moduleName || ct.moduleId}` : 'Built-in'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(ct)
      return acc
    },
    {} as Record<string, ExtendedColumnTypeOption[]>
  )

  // Separate built-in and module types
  const builtInTypes = columnTypes.filter((ct) => !ct.moduleId)
  const moduleTypes = columnTypes.filter((ct) => !!ct.moduleId)

  return {
    columnTypes,
    groupedColumnTypes,
    builtInTypes,
    moduleTypes,
    isLoading,
    error,
    hasFetched,
    refresh,
  }
}

/**
 * Get a column type label by value
 */
export function getColumnTypeLabelFromTypes(
  type: ColumnType | string,
  columnTypes: ExtendedColumnTypeOption[]
): string {
  const option = columnTypes.find((opt) => opt.value === type)
  return option?.label || type
}
