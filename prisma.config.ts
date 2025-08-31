/**
 * Prisma Configuration File
 * Replaces the deprecated package.json#prisma configuration
 * 
 * @see https://www.prisma.io/docs/orm/reference/prisma-config-reference
 */

import 'dotenv/config'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  // Database seeding configuration
  migrations: {
    seed: 'tsx prisma/seed.ts'
  }
})