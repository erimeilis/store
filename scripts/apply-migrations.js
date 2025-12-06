#!/usr/bin/env node

/**
 * Store - Apply Database Migrations
 *
 * Applies all Prisma migrations to the specified D1 database.
 * Migrations use IF NOT EXISTS so they are idempotent and safe to re-run.
 *
 * Usage:
 *   node scripts/apply-migrations.js              # Apply to production (--remote)
 *   node scripts/apply-migrations.js --local      # Apply to local database
 *   node scripts/apply-migrations.js --preview    # Apply to preview database
 */

import { execSync } from 'child_process'
import { readFileSync, existsSync, readdirSync } from 'fs'
import { resolve, dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = resolve(__dirname, '..')

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logSuccess(message) {
  log(`  ✓ ${message}`, 'green')
}

function logWarning(message) {
  log(`  ⚠ ${message}`, 'yellow')
}

function logError(message) {
  log(`  ✗ ${message}`, 'red')
}

/**
 * Load environment variables from .env file
 */
function loadEnv() {
  const envPath = resolve(ROOT_DIR, '.env')

  if (!existsSync(envPath)) {
    return {}
  }

  const envContent = readFileSync(envPath, 'utf-8')
  const env = {}

  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=')
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim()
      }
    }
  }

  return env
}

/**
 * Apply database migrations
 */
function applyMigrations(target) {
  const migrationsDir = resolve(ROOT_DIR, 'prisma/migrations')

  if (!existsSync(migrationsDir)) {
    logError('Migrations directory not found: prisma/migrations/')
    process.exit(1)
  }

  const migrationFolders = readdirSync(migrationsDir)
    .filter(name => !name.startsWith('.'))
    .sort()

  if (migrationFolders.length === 0) {
    logWarning('No migration folders found')
    return
  }

  // Determine database name and flags based on target
  const env = loadEnv()
  let dbName
  let remoteFlag

  switch (target) {
    case 'local':
      dbName = env.D1_PREVIEW_DATABASE_NAME || 'store-database-preview'
      remoteFlag = ''
      break
    case 'preview':
      dbName = env.D1_PREVIEW_DATABASE_NAME || 'store-database-preview'
      remoteFlag = '--remote'
      break
    case 'production':
    default:
      dbName = env.D1_DATABASE_NAME || 'store-database'
      remoteFlag = '--remote'
      break
  }

  log(`\nApplying migrations to ${target} database: ${dbName}`, 'cyan')
  log(`Found ${migrationFolders.length} migration(s)\n`, 'blue')

  let successCount = 0
  let skipCount = 0

  for (const folder of migrationFolders) {
    const migrationFile = join(migrationsDir, folder, 'migration.sql')

    if (!existsSync(migrationFile)) {
      logWarning(`Skipping ${folder} (no migration.sql found)`)
      skipCount++
      continue
    }

    try {
      log(`  Applying: ${folder}...`, 'cyan')

      const command = `wrangler d1 execute ${dbName} ${remoteFlag} --file="${migrationFile}"`.trim()

      execSync(command, {
        cwd: ROOT_DIR,
        encoding: 'utf-8',
        stdio: 'pipe',
      })

      logSuccess(`Applied: ${folder}`)
      successCount++
    } catch (error) {
      // Migrations use IF NOT EXISTS, so most errors mean already applied
      // Only warn, don't fail - let the user investigate if needed
      logWarning(`${folder}: ${error.message.split('\n')[0]}`)
    }
  }

  log('')
  log(`Migration complete: ${successCount} applied, ${skipCount} skipped`, 'green')
}

// Main
function main() {
  const args = process.argv.slice(2)

  let target = 'production' // Default to production (matches sms-control pattern)

  if (args.includes('--local')) {
    target = 'local'
  } else if (args.includes('--preview')) {
    target = 'preview'
  }

  log('\n========================================', 'bright')
  log('  Store - Database Migrations', 'bright')
  log('========================================', 'bright')

  applyMigrations(target)
}

main()
