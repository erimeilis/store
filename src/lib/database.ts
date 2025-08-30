import { PrismaClient } from '@prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'
import type { Bindings } from '../../types/bindings.js'

/**
 * Database Service
 * Creates and manages Prisma client instances with D1 adapter for Cloudflare Workers
 * Supports both local SQLite (development) and D1 (preview/production)
 */

let prismaClient: PrismaClient | null = null

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
 * Get or create Prisma client instance
 * Provides singleton pattern for database connections
 * @param env - Cloudflare Workers environment bindings
 * @returns Prisma client instance
 */
export function getPrismaClient(env?: Bindings): PrismaClient {
  if (!prismaClient) {
    prismaClient = createPrismaClient(env?.DB)
  }
  return prismaClient
}

/**
 * Close Prisma client connection
 * Should be called during Worker cleanup
 */
export async function closePrismaClient(): Promise<void> {
  if (prismaClient) {
    await prismaClient.$disconnect()
    prismaClient = null
  }
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