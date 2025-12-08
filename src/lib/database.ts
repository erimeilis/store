import { PrismaClient } from '@prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'
import type { Bindings } from '@/types/bindings.js'

/**
 * Database Service
 * Creates Prisma client instances with D1 adapter for Cloudflare Workers
 *
 * IMPORTANT: In Cloudflare Workers, D1 bindings are request-scoped.
 * We MUST create a new PrismaClient for each request when using D1.
 * Caching PrismaClient across requests causes "Cannot perform I/O on behalf of a different request" errors.
 */

/**
 * Initialize Prisma client with D1 adapter
 * @param binding - D1 database binding from Cloudflare Workers
 * @returns Prisma client instance
 */
export function createPrismaClient(binding?: D1Database): PrismaClient {
  if (binding) {
    // Use D1 adapter for Cloudflare Workers environment
    const adapter = new PrismaD1(binding)
    return new PrismaClient({ adapter })
  } else {
    // Use regular Prisma client for local development (SQLite file)
    return new PrismaClient()
  }
}

/**
 * Get Prisma client instance for the current request
 *
 * IMPORTANT: Always creates a new instance when D1 binding is provided.
 * D1 bindings are request-scoped in Cloudflare Workers, so we cannot
 * cache the PrismaClient across requests.
 *
 * @param env - Cloudflare Workers environment bindings
 * @returns Prisma client instance
 */
export function getPrismaClient(env?: Bindings): PrismaClient {
  // Always create fresh client when D1 binding exists (Workers environment)
  // This prevents "Cannot perform I/O on behalf of a different request" errors
  return createPrismaClient(env?.DB)
}

/**
 * Close Prisma client connection
 * Note: In Workers environment with per-request clients, this is typically not needed
 * as each request creates its own client that is cleaned up when the request ends.
 */
export async function closePrismaClient(): Promise<void> {
  // No-op: Per-request clients are automatically cleaned up
}

/**
 * Health check for database connection
 * @param client - Prisma client instance
 * @returns Promise<boolean> - true if connection is healthy
 */
export async function checkDatabaseHealth(client: PrismaClient): Promise<boolean> {
  try {
    await client.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database health check failed:', error)
    return false
  }
}