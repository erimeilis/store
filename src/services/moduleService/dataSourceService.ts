/**
 * Module Data Source Service
 *
 * Fetches data from API sources defined in module column types.
 * Handles settings reference resolution, authentication, and caching.
 */

import type { Bindings } from '@/types/bindings.js'
import type { DataSourceDefinition, ColumnTypeDefinition } from '@/types/modules.js'
import { ModuleRepository } from '@/repositories/moduleRepository.js'

// KV cache prefix and TTL
const KV_PREFIX_API_CACHE = 'module:api-cache:'

/**
 * Option item returned from data sources
 */
export interface DataSourceOption {
  value: string
  label: string
  raw?: Record<string, unknown>
}

/**
 * Result of fetching data source options
 */
export interface DataSourceResult {
  success: boolean
  options: DataSourceOption[]
  error?: string
  cached?: boolean
  cachedAt?: string
}

/**
 * Parse cache duration string to seconds
 * Supports: "5m", "1h", "24h", "7d"
 */
function parseCacheDuration(duration: string): number {
  const match = duration.match(/^(\d+)(m|h|d)$/)
  if (!match || !match[1] || !match[2]) return 3600 // Default 1 hour

  const value = match[1]
  const unit = match[2]
  const num = parseInt(value, 10)

  switch (unit) {
    case 'm':
      return num * 60
    case 'h':
      return num * 60 * 60
    case 'd':
      return num * 60 * 60 * 24
    default:
      return 3600
  }
}

/**
 * Resolve $settings.* references in a string
 */
function resolveSettingsRef(
  value: string,
  settings: Record<string, unknown>
): string {
  if (!value.startsWith('$settings.')) {
    return value
  }

  const settingKey = value.replace('$settings.', '')
  const settingValue = settings[settingKey]

  if (settingValue === undefined || settingValue === null) {
    throw new Error(`Setting "${settingKey}" is not configured`)
  }

  return String(settingValue)
}

/**
 * Build the full endpoint URL by resolving settings references
 */
function buildEndpointUrl(
  endpoint: string,
  settings: Record<string, unknown>
): string {
  // Replace $settings.* references in endpoint
  return endpoint.replace(/\$settings\.(\w+)/g, (match, key) => {
    const value = settings[key]
    if (value === undefined || value === null) {
      throw new Error(`Setting "${key}" is not configured`)
    }
    return String(value)
  })
}

/**
 * Get nested value from object using dot notation path
 */
function getNestedValue(obj: unknown, path: string): unknown {
  const parts = path.split('.')
  let current = obj

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined
    }
    if (typeof current !== 'object') {
      return undefined
    }
    current = (current as Record<string, unknown>)[part]
  }

  return current
}

/**
 * Data Source Service
 */
export class DataSourceService {
  private env: Bindings
  private repository: ModuleRepository

  constructor(env: Bindings) {
    this.env = env
    this.repository = new ModuleRepository(env)
  }

  /**
   * Fetch options for a column type's data source
   */
  async fetchColumnTypeOptions(
    moduleId: string,
    columnTypeId: string
  ): Promise<DataSourceResult> {
    try {
      // Get the module
      const module = await this.repository.get(moduleId)
      if (!module) {
        return { success: false, options: [], error: 'Module not found' }
      }

      // Find the column type
      const columnType = module.manifest.columnTypes?.find(
        ct => ct.id === columnTypeId
      )
      if (!columnType) {
        return { success: false, options: [], error: 'Column type not found' }
      }

      // Check if it has a data source
      if (!columnType.source) {
        return { success: false, options: [], error: 'Column type has no data source' }
      }

      // Fetch from source
      return await this.fetchFromSource(
        columnType.source,
        module.settings,
        moduleId,
        columnTypeId
      )
    } catch (error) {
      return {
        success: false,
        options: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Fetch data from a source definition
   */
  private async fetchFromSource(
    source: DataSourceDefinition,
    settings: Record<string, unknown>,
    moduleId: string,
    columnTypeId: string
  ): Promise<DataSourceResult> {
    // Handle static sources
    if (source.type === 'static' && source.values) {
      return {
        success: true,
        options: source.values.map(v =>
          typeof v === 'string'
            ? { value: v, label: v }
            : { value: v.value, label: v.label }
        ),
      }
    }

    // Handle API sources
    if (source.type === 'api' && source.endpoint) {
      return await this.fetchFromApi(source, settings, moduleId, columnTypeId)
    }

    return { success: false, options: [], error: 'Invalid data source configuration' }
  }

  /**
   * Fetch data from an API endpoint
   */
  private async fetchFromApi(
    source: DataSourceDefinition,
    settings: Record<string, unknown>,
    moduleId: string,
    columnTypeId: string
  ): Promise<DataSourceResult> {
    const cacheKey = `${KV_PREFIX_API_CACHE}${moduleId}:${columnTypeId}`

    // Check cache first
    if (source.cache) {
      const cached = await this.env.KV.get(cacheKey, 'json') as {
        options: DataSourceOption[]
        cachedAt: string
      } | null

      if (cached) {
        return {
          success: true,
          options: cached.options,
          cached: true,
          cachedAt: cached.cachedAt,
        }
      }
    }

    // Build the URL
    let url: string
    try {
      url = buildEndpointUrl(source.endpoint!, settings)
    } catch (error) {
      return {
        success: false,
        options: [],
        error: error instanceof Error ? error.message : 'Failed to build URL',
      }
    }

    // Build headers
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      ...source.headers,
    }

    // Add authentication
    if (source.auth) {
      try {
        switch (source.auth.type) {
          case 'bearer': {
            const token = resolveSettingsRef(source.auth.token || '', settings)
            headers['Authorization'] = `Bearer ${token}`
            break
          }
          case 'basic': {
            const token = resolveSettingsRef(source.auth.token || '', settings)
            headers['Authorization'] = `Basic ${token}`
            break
          }
          case 'header': {
            const headerName = source.auth.headerName || 'X-API-Key'
            const token = resolveSettingsRef(source.auth.token || '', settings)
            headers[headerName] = token
            break
          }
        }
      } catch (error) {
        return {
          success: false,
          options: [],
          error: error instanceof Error ? error.message : 'Authentication error',
        }
      }
    }

    // Make the request
    let response: Response
    try {
      response = await fetch(url, {
        method: source.method || 'GET',
        headers,
      })

      if (!response.ok) {
        return {
          success: false,
          options: [],
          error: `API request failed: ${response.status} ${response.statusText}`,
        }
      }
    } catch (error) {
      return {
        success: false,
        options: [],
        error: `Network error: ${error instanceof Error ? error.message : 'Unknown'}`,
      }
    }

    // Parse response
    let data: unknown
    try {
      data = await response.json()
    } catch {
      return { success: false, options: [], error: 'Invalid JSON response' }
    }

    // Extract array from response using dataPath
    let items: unknown[]
    if (source.responseSchema?.dataPath) {
      const extracted = getNestedValue(data, source.responseSchema.dataPath)
      if (!Array.isArray(extracted)) {
        return {
          success: false,
          options: [],
          error: `Data path "${source.responseSchema.dataPath}" did not return an array`,
        }
      }
      items = extracted
    } else if (Array.isArray(data)) {
      items = data
    } else {
      return { success: false, options: [], error: 'Response is not an array' }
    }

    // Map items to options
    const valueField = source.valueField || 'value'
    const labelField = source.labelField || 'label'

    const options: DataSourceOption[] = items
      .filter((item): item is Record<string, unknown> =>
        item !== null && typeof item === 'object'
      )
      .map(item => ({
        value: String(item[valueField] ?? ''),
        label: String(item[labelField] ?? item[valueField] ?? ''),
        raw: item,
      }))
      .filter(opt => opt.value !== '')

    // Cache the result
    if (source.cache) {
      const cacheTtl = parseCacheDuration(source.cache)
      await this.env.KV.put(
        cacheKey,
        JSON.stringify({ options, cachedAt: new Date().toISOString() }),
        { expirationTtl: cacheTtl }
      )
    }

    // Record API call for analytics
    await this.repository.recordApiCall(moduleId, 0)

    return { success: true, options }
  }

  /**
   * Invalidate cache for a column type's data source
   */
  async invalidateCache(moduleId: string, columnTypeId: string): Promise<void> {
    const cacheKey = `${KV_PREFIX_API_CACHE}${moduleId}:${columnTypeId}`
    await this.env.KV.delete(cacheKey)
  }

  /**
   * Invalidate all caches for a module
   */
  async invalidateModuleCache(moduleId: string): Promise<void> {
    // List all keys with the module prefix and delete them
    const prefix = `${KV_PREFIX_API_CACHE}${moduleId}:`
    const list = await this.env.KV.list({ prefix })

    for (const key of list.keys) {
      await this.env.KV.delete(key.name)
    }
  }
}

/**
 * Factory function
 */
export function createDataSourceService(env: Bindings): DataSourceService {
  return new DataSourceService(env)
}
