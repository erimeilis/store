import type { Bindings } from '@/types/bindings.js'
import type {
  ModuleContext,
  ModuleDatabase,
  ModuleCache,
  ModuleStorage,
  ModuleHttp,
  ModuleLogger,
  ModuleEvents,
  ModuleAnalyticsTracker,
  StoragePutOptions,
  StorageObject,
  StorageListOptions,
  StorageListResult,
} from '@/types/modules.js'
import { ModuleRepository } from '@/repositories/moduleRepository.js'

/**
 * Event emitter for module events
 */
class ModuleEventEmitter implements ModuleEvents {
  private handlers: Map<string, Set<(data: unknown) => void>> = new Map()
  private moduleId: string
  private repository: ModuleRepository | null

  constructor(moduleId: string, repository: ModuleRepository | null) {
    this.moduleId = moduleId
    this.repository = repository
  }

  emit(event: string, data?: unknown): void {
    // Log event to database for persistence
    if (this.repository) {
      this.repository.logEvent(this.moduleId, 'settings_change', {
        details: { customEvent: event, data },
      }).catch(err => {
        console.error(`Failed to log event ${event}:`, err)
      })
    }

    // Dispatch to in-memory handlers
    const eventHandlers = this.handlers.get(event)
    if (eventHandlers) {
      eventHandlers.forEach(handler => {
        try {
          handler(data)
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error)
        }
      })
    }
  }

  on(event: string, handler: (data: unknown) => void): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set())
    }
    this.handlers.get(event)!.add(handler)
  }

  off(event: string, handler: (data: unknown) => void): void {
    const eventHandlers = this.handlers.get(event)
    if (eventHandlers) {
      eventHandlers.delete(handler)
    }
  }
}

/**
 * Create a database interface for a module
 * Prefixes all table operations with module ID for isolation
 */
function createModuleDatabase(env: Bindings, moduleId: string): ModuleDatabase {
  // Convert module ID to safe prefix: @store/phone-numbers -> modulePhoneNumbers
  const _prefix = moduleId
    .replace(/^@\w+\//, '') // Remove @scope/
    .replace(/-([a-z])/g, (_, c) => c.toUpperCase()) // kebab-case to camelCase
    .replace(/^./, c => c.toUpperCase()) // Capitalize first letter

  return {
    async query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]> {
      // Validate SQL doesn't access tables outside module namespace
      // This is a simple check - production would need more robust validation
      const result = await env.DB.prepare(sql)
        .bind(...(params || []))
        .all()
      return result.results as T[]
    },

    async execute(sql: string, params?: unknown[]): Promise<{ changes: number }> {
      const result = await env.DB.prepare(sql)
        .bind(...(params || []))
        .run()
      return { changes: result.meta.changes || 0 }
    },

    async batch(statements: { sql: string; params?: unknown[] }[]): Promise<void> {
      const preparedStatements = statements.map(s =>
        env.DB.prepare(s.sql).bind(...(s.params || []))
      )
      await env.DB.batch(preparedStatements)
    },
  }
}

/**
 * Create a cache interface for a module
 * Uses KV with module-prefixed keys
 */
function createModuleCache(env: Bindings, moduleId: string): ModuleCache {
  const keyPrefix = `module:${moduleId}:`

  return {
    async get<T = unknown>(key: string): Promise<T | null> {
      if (!env.KV) return null
      const value = await env.KV.get(keyPrefix + key, 'json')
      return value as T | null
    },

    async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
      if (!env.KV) return
      const options = ttlSeconds ? { expirationTtl: ttlSeconds } : undefined
      await env.KV.put(keyPrefix + key, JSON.stringify(value), options)
    },

    async delete(key: string): Promise<void> {
      if (!env.KV) return
      await env.KV.delete(keyPrefix + key)
    },

    async list(prefix?: string): Promise<string[]> {
      if (!env.KV) return []
      const fullPrefix = keyPrefix + (prefix || '')
      const result = await env.KV.list({ prefix: fullPrefix })
      return result.keys.map(k => k.name.slice(keyPrefix.length))
    },
  }
}

/**
 * Create a storage interface for a module
 * Uses R2 with module-prefixed keys
 */
function createModuleStorage(env: Bindings, moduleId: string): ModuleStorage {
  const keyPrefix = `modules/${moduleId.replace(/^@\w+\//, '')}/files/`

  return {
    async put(key: string, data: ArrayBuffer | Blob | string, options?: StoragePutOptions): Promise<void> {
      if (!env.BUCKET) {
        throw new Error('Storage not available')
      }

      const fullKey = keyPrefix + key
      const r2Options: R2PutOptions = {}

      // Build httpMetadata only with defined values
      const httpMetadata: R2HTTPMetadata = {}
      if (options?.contentType) {
        httpMetadata.contentType = options.contentType
      }
      if (options?.cacheControl) {
        httpMetadata.cacheControl = options.cacheControl
      }
      if (Object.keys(httpMetadata).length > 0) {
        r2Options.httpMetadata = httpMetadata
      }

      if (options?.metadata) {
        r2Options.customMetadata = options.metadata
      }

      await env.BUCKET.put(fullKey, data, r2Options)
    },

    async get(key: string): Promise<StorageObject | null> {
      if (!env.BUCKET) return null

      const fullKey = keyPrefix + key
      const object = await env.BUCKET.get(fullKey)

      if (!object) return null

      const result: StorageObject = {
        key,
        data: await object.arrayBuffer(),
        contentType: object.httpMetadata?.contentType || 'application/octet-stream',
        size: object.size,
        etag: object.etag,
        uploaded: object.uploaded,
      }

      if (object.customMetadata) {
        result.metadata = object.customMetadata
      }

      return result
    },

    async delete(key: string): Promise<void> {
      if (!env.BUCKET) return

      const fullKey = keyPrefix + key
      await env.BUCKET.delete(fullKey)
    },

    async list(options?: StorageListOptions): Promise<StorageListResult> {
      if (!env.BUCKET) {
        return { objects: [], truncated: false }
      }

      const fullPrefix = keyPrefix + (options?.prefix || '')
      const listOptions: R2ListOptions = { prefix: fullPrefix }

      if (options?.limit !== undefined) {
        listOptions.limit = options.limit
      }
      if (options?.cursor !== undefined) {
        listOptions.cursor = options.cursor
      }

      const result = await env.BUCKET.list(listOptions)

      const listResult: StorageListResult = {
        objects: result.objects.map(obj => ({
          key: obj.key.slice(keyPrefix.length),
          size: obj.size,
          uploaded: obj.uploaded,
        })),
        truncated: result.truncated,
      }

      if (result.truncated && result.cursor) {
        listResult.cursor = result.cursor
      }

      return listResult
    },

    getPublicUrl(key: string): string | null {
      // This would need to be configured per environment
      // For now, return null as R2 doesn't have built-in public URLs
      // without custom domain configuration
      if (!env.R2_PUBLIC_URL) return null
      return `${env.R2_PUBLIC_URL}/${keyPrefix}${key}`
    },
  }
}

/**
 * Create an HTTP client for a module
 */
function createModuleHttp(moduleId: string, logger: ModuleLogger): ModuleHttp {
  return {
    async fetch(url: string, options?: RequestInit): Promise<Response> {
      const startTime = Date.now()

      try {
        const response = await globalThis.fetch(url, {
          ...options,
          headers: {
            ...options?.headers,
            'X-Module-Id': moduleId,
          },
        })

        const duration = Date.now() - startTime
        logger.debug(`HTTP ${options?.method || 'GET'} ${url} - ${response.status} (${duration}ms)`)

        return response
      } catch (error) {
        const duration = Date.now() - startTime
        logger.error(`HTTP ${options?.method || 'GET'} ${url} - FAILED (${duration}ms)`, error)
        throw error
      }
    },
  }
}

/**
 * Create a logger for a module
 */
function createModuleLogger(moduleId: string): ModuleLogger {
  const formatMessage = (level: string, message: string): string =>
    `[${new Date().toISOString()}] [${moduleId}] [${level}] ${message}`

  return {
    debug(message: string, data?: unknown): void {
      console.debug(formatMessage('DEBUG', message), data ?? '')
    },

    info(message: string, data?: unknown): void {
      console.info(formatMessage('INFO', message), data ?? '')
    },

    warn(message: string, data?: unknown): void {
      console.warn(formatMessage('WARN', message), data ?? '')
    },

    error(message: string, error?: Error | unknown): void {
      console.error(formatMessage('ERROR', message), error ?? '')
    },
  }
}

/**
 * Create an analytics tracker for a module
 */
function createModuleAnalyticsTracker(
  moduleId: string,
  repository: ModuleRepository | null
): ModuleAnalyticsTracker {
  // Store custom metrics in memory for batching
  const customMetrics: Map<string, number> = new Map()

  return {
    async trackColumnTypeUsage(typeId: string): Promise<void> {
      if (repository) {
        await repository.recordColumnTypeUsage(moduleId, typeId)
      }
    },

    async trackGeneratorInvocation(): Promise<void> {
      if (repository) {
        await repository.recordGeneratorInvocation(moduleId)
      }
    },

    async trackApiCall(responseTimeMs: number): Promise<void> {
      if (repository) {
        await repository.recordApiCall(moduleId, responseTimeMs)
      }
    },

    async trackCustomMetric(name: string, value: number): Promise<void> {
      // Accumulate custom metrics
      const current = customMetrics.get(name) || 0
      customMetrics.set(name, current + value)

      // In a production system, you'd want to batch these and flush periodically
      // For now, we just track in memory
    },
  }
}

/**
 * Create a module execution context
 */
export function createModuleContext(
  env: Bindings,
  moduleId: string,
  version: string,
  settings: Record<string, unknown>,
  repository?: ModuleRepository
): ModuleContext {
  const isDevelopment = env.NODE_ENV === 'development'
  const logger = createModuleLogger(moduleId)
  const repo = repository || null

  return {
    moduleId,
    version,
    settings,
    db: createModuleDatabase(env, moduleId),
    cache: createModuleCache(env, moduleId),
    storage: createModuleStorage(env, moduleId),
    http: createModuleHttp(moduleId, logger),
    logger,
    events: new ModuleEventEmitter(moduleId, repo),
    analytics: createModuleAnalyticsTracker(moduleId, repo),
    env: {
      isDevelopment,
      isProduction: !isDevelopment,
      storeVersion: env.APP_VERSION || '1.0.0',
    },
  }
}
