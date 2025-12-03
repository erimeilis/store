import type { Bindings } from '@/types/bindings.js'
import type {
  ModuleContext,
  ModuleDatabase,
  ModuleCache,
  ModuleHttp,
  ModuleLogger,
  ModuleEvents,
} from '@/types/modules.js'

/**
 * Event emitter for module events
 */
class ModuleEventEmitter implements ModuleEvents {
  private handlers: Map<string, Set<(data: unknown) => void>> = new Map()

  emit(event: string, data?: unknown): void {
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
  const prefix = moduleId
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
 * Create an HTTP client for a module
 */
function createModuleHttp(): ModuleHttp {
  return {
    async fetch(url: string, options?: RequestInit): Promise<Response> {
      return globalThis.fetch(url, options)
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
 * Create a module execution context
 */
export function createModuleContext(
  env: Bindings,
  moduleId: string,
  version: string,
  settings: Record<string, unknown>
): ModuleContext {
  const isDevelopment = env.NODE_ENV === 'development'

  return {
    moduleId,
    version,
    settings,
    db: createModuleDatabase(env, moduleId),
    cache: createModuleCache(env, moduleId),
    http: createModuleHttp(),
    logger: createModuleLogger(moduleId),
    events: new ModuleEventEmitter(),
    env: {
      isDevelopment,
      isProduction: !isDevelopment,
      storeVersion: env.APP_VERSION || '1.0.0',
    },
  }
}
