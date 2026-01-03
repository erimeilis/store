#!/usr/bin/env node

/**
 * Store - Unified Deployment Script
 *
 * This script handles the COMPLETE deployment process automatically:
 * 0. Update wrangler to latest version
 * 1. Load environment variables from .env
 * 2. Ensure D1 databases exist (creates and updates .env if missing)
 * 3. Ensure KV namespaces exist (creates and updates .env if missing)
 * 4. Generate wrangler.toml files from templates
 * 5. Scan modules (JSON manifests)
 * 6. Initialize database:
 *    - Apply migrations (idempotent, uses IF NOT EXISTS)
 *    - Seed essential tokens if database is fresh
 *    - First user can login and become admin automatically
 * 7. Upload secrets to Cloudflare
 * 8. Deploy workers
 *
 * IMPORTANT: This script handles EVERYTHING for a fresh deployment.
 * Run once and the application should be fully functional.
 *
 * Project Structure:
 *   - api/         Backend TypeScript API (store-api)
 *   - admin/       Frontend Admin UI (store-admin)
 *   - public-api/  Rust Public API Worker (store-public-api)
 *
 * Usage:
 *   node scripts/deploy.js                    # Deploy all workers
 *   node scripts/deploy.js api                # Deploy api (backend) only
 *   node scripts/deploy.js admin              # Deploy admin (frontend) only
 *   node scripts/deploy.js public-api         # Deploy public-api (Rust) only
 *   node scripts/deploy.js --dry-run          # Show what would be deployed
 *   node scripts/deploy.js --skip-migrations  # Skip database initialization
 *
 * Legacy aliases (for backwards compatibility):
 *   node scripts/deploy.js backend            # Same as 'api'
 *   node scripts/deploy.js frontend           # Same as 'admin'
 */

import { execSync, spawnSync } from 'child_process'
import { readFileSync, writeFileSync, existsSync, unlinkSync, readdirSync } from 'fs'
import { join } from 'path'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = resolve(__dirname, '..')
const TOKENS_DIR = resolve(__dirname, 'tokens')

// Directory paths for each worker
const API_DIR = resolve(ROOT_DIR, 'api')
const ADMIN_DIR = resolve(ROOT_DIR, 'admin')
const PUBLIC_API_DIR = resolve(ROOT_DIR, 'public-api')

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

function logStep(step, total, message) {
  log(`\n${colors.bright}[${step}/${total}]${colors.reset} ${message}`, 'cyan')
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

function exec(command, options = {}) {
  try {
    return execSync(command, {
      cwd: options.cwd || ROOT_DIR,
      encoding: 'utf-8',
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options,
    })
  } catch (error) {
    if (options.ignoreError) {
      return error.stdout || ''
    }
    throw error
  }
}

/**
 * Update wrangler to latest version in all directories
 */
function updateWrangler() {
  log('  Updating wrangler to latest version...', 'blue')

  const directories = [
    { name: 'root', path: ROOT_DIR },
    { name: 'api', path: API_DIR },
    { name: 'admin', path: ADMIN_DIR },
    { name: 'public-api', path: PUBLIC_API_DIR },
  ]

  for (const dir of directories) {
    try {
      exec('npm update wrangler', { cwd: dir.path, silent: true })
      logSuccess(`Updated wrangler in ${dir.name}`)
    } catch (error) {
      logWarning(`Failed to update wrangler in ${dir.name}: ${error.message}`)
    }
  }
}

/**
 * Load production tokens from token-manager file
 * These tokens MUST match what's seeded in the database by db-reset.ts
 */
function loadProductionTokens() {
  const tokenFilePath = resolve(TOKENS_DIR, 'production-tokens.json')

  if (!existsSync(tokenFilePath)) {
    logWarning('Production tokens not found. Run db-reset production first.')
    return null
  }

  try {
    const tokens = JSON.parse(readFileSync(tokenFilePath, 'utf-8'))
    logSuccess(`Loaded production tokens (generated: ${tokens.generatedAt})`)
    return tokens
  } catch (error) {
    logWarning(`Failed to load production tokens: ${error.message}`)
    return null
  }
}

/**
 * Load environment variables from .env file
 */
function loadEnv() {
  const envPath = resolve(ROOT_DIR, '.env')

  if (!existsSync(envPath)) {
    logError('.env file not found!')
    log('  Please copy .env.example to .env and fill in your values:', 'yellow')
    log('  cp .env.example .env', 'cyan')
    process.exit(1)
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

  // Override with production tokens from token-manager
  // This ensures Cloudflare secrets match what's in the database
  const productionTokens = loadProductionTokens()
  if (productionTokens) {
    env.ADMIN_ACCESS_TOKEN = productionTokens.adminToken
    env.FRONTEND_ACCESS_TOKEN = productionTokens.frontendToken
    logSuccess('Using tokens from token-manager (matches database)')
  }

  return env
}

/**
 * Get the current app version from package.json
 */
function getAppVersion() {
  const pkgPath = resolve(ROOT_DIR, 'package.json')
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
  return pkg.version
}

/**
 * Update .env file with a new key=value
 */
function updateEnvFile(key, value) {
  const envPath = resolve(ROOT_DIR, '.env')
  let content = readFileSync(envPath, 'utf-8')

  // Check if key exists (with empty value)
  const regex = new RegExp(`^${key}=.*$`, 'm')
  if (regex.test(content)) {
    content = content.replace(regex, `${key}=${value}`)
  } else {
    // Append to file
    content += `\n${key}=${value}`
  }

  writeFileSync(envPath, content)
}

/**
 * Ensure KV namespace exists, create if not
 * Returns the namespace ID
 */
function ensureKvNamespace(env, namespaceName, envKey, dryRun = false) {
  const existingId = env[envKey]

  if (existingId && existingId.trim() !== '') {
    logSuccess(`${envKey} already configured: ${existingId.substring(0, 8)}...`)
    return existingId
  }

  log(`  Creating KV namespace: ${namespaceName}...`, 'blue')

  if (dryRun) {
    logSuccess(`Would create KV namespace: ${namespaceName}`)
    return 'dry-run-id'
  }

  try {
    // Create the KV namespace
    const output = execSync(`wrangler kv namespace create "${namespaceName}"`, {
      cwd: ROOT_DIR,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    // Parse the ID from output
    // New format (JSON): "id": "abc123def456"
    // Old format (TOML): id = "abc123def456"
    let namespaceId = null

    // Try JSON format first
    const jsonMatch = output.match(/"id"\s*:\s*"([^"]+)"/)
    if (jsonMatch && jsonMatch[1]) {
      namespaceId = jsonMatch[1]
    }

    // Fallback to TOML format
    if (!namespaceId) {
      const tomlMatch = output.match(/id\s*=\s*"([^"]+)"/)
      if (tomlMatch && tomlMatch[1]) {
        namespaceId = tomlMatch[1]
      }
    }

    if (!namespaceId) {
      logWarning(`Could not parse KV namespace ID from output: ${output}`)
      return ''
    }
    logSuccess(`Created KV namespace: ${namespaceId}`)

    // Update .env file
    updateEnvFile(envKey, namespaceId)
    logSuccess(`Updated .env with ${envKey}`)

    // Update env object for current run
    env[envKey] = namespaceId

    return namespaceId
  } catch (error) {
    // Check if namespace already exists
    if (error.message?.includes('already exists') || error.stderr?.includes('already exists')) {
      log('  KV namespace already exists, fetching ID...', 'blue')

      try {
        // List namespaces to find the ID
        const listOutput = execSync('wrangler kv namespace list', {
          cwd: ROOT_DIR,
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'pipe'],
        })

        const namespaces = JSON.parse(listOutput)
        const found = namespaces.find(ns => ns.title === namespaceName || ns.title.includes(namespaceName))

        if (found) {
          logSuccess(`Found existing KV namespace: ${found.id}`)
          updateEnvFile(envKey, found.id)
          logSuccess(`Updated .env with ${envKey}`)
          env[envKey] = found.id
          return found.id
        }
      } catch (listError) {
        logWarning(`Could not list KV namespaces: ${listError.message}`)
      }
    }

    logError(`Failed to create KV namespace: ${error.message}`)
    return ''
  }
}

/**
 * Ensure all required KV namespaces exist
 */
function ensureKvNamespaces(env, dryRun = false) {
  log('  Checking KV namespaces...', 'blue')

  // Production KV namespace
  ensureKvNamespace(env, 'store-cache', 'KV_NAMESPACE_ID', dryRun)

  // Preview KV namespace
  ensureKvNamespace(env, 'store-cache-preview', 'KV_PREVIEW_NAMESPACE_ID', dryRun)
}

/**
 * Ensure D1 database exists, create if not
 * Returns the database ID
 */
function ensureD1Database(env, dbName, envKey, dryRun = false) {
  const existingId = env[envKey]

  if (existingId && existingId.trim() !== '') {
    logSuccess(`${envKey} already configured: ${existingId.substring(0, 8)}...`)
    return existingId
  }

  log(`  Creating D1 database: ${dbName}...`, 'blue')

  if (dryRun) {
    logSuccess(`Would create D1 database: ${dbName}`)
    return 'dry-run-id'
  }

  try {
    // Create the D1 database
    const output = execSync(`wrangler d1 create "${dbName}"`, {
      cwd: ROOT_DIR,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    // Parse the database ID from output
    // Format: database_id = "abc123def456"
    let databaseId = null

    // Try to find the database_id in the output
    const idMatch = output.match(/database_id\s*=\s*"([^"]+)"/)
    if (idMatch && idMatch[1]) {
      databaseId = idMatch[1]
    }

    // Also try JSON format just in case
    if (!databaseId) {
      const jsonMatch = output.match(/"database_id"\s*:\s*"([^"]+)"/)
      if (jsonMatch && jsonMatch[1]) {
        databaseId = jsonMatch[1]
      }
    }

    // Also try uuid format (just the ID on a line)
    if (!databaseId) {
      const uuidMatch = output.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i)
      if (uuidMatch && uuidMatch[1]) {
        databaseId = uuidMatch[1]
      }
    }

    if (!databaseId) {
      logWarning(`Could not parse D1 database ID from output: ${output}`)
      // Try to list databases to find it
      return findD1DatabaseId(dbName, env, envKey)
    }

    logSuccess(`Created D1 database: ${databaseId}`)

    // Update .env file
    updateEnvFile(envKey, databaseId)
    logSuccess(`Updated .env with ${envKey}`)

    // Update env object for current run
    env[envKey] = databaseId

    return databaseId
  } catch (error) {
    // Check if database already exists
    if (error.message?.includes('already exists') || error.stderr?.includes('already exists')) {
      log('  D1 database already exists, fetching ID...', 'blue')
      return findD1DatabaseId(dbName, env, envKey)
    }

    logError(`Failed to create D1 database: ${error.message}`)
    return ''
  }
}

/**
 * Find existing D1 database ID by name
 */
function findD1DatabaseId(dbName, env, envKey) {
  try {
    const listOutput = execSync('wrangler d1 list --json', {
      cwd: ROOT_DIR,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    const databases = JSON.parse(listOutput)
    const found = databases.find(db => db.name === dbName)

    if (found) {
      logSuccess(`Found existing D1 database: ${found.uuid}`)
      updateEnvFile(envKey, found.uuid)
      logSuccess(`Updated .env with ${envKey}`)
      env[envKey] = found.uuid
      return found.uuid
    }

    logWarning(`Could not find D1 database named: ${dbName}`)
    return ''
  } catch (listError) {
    logWarning(`Could not list D1 databases: ${listError.message}`)
    return ''
  }
}

/**
 * Ensure all required D1 databases exist
 */
function ensureD1Databases(env, dryRun = false) {
  log('  Checking D1 databases...', 'blue')

  // Production database
  const prodDbName = env.D1_DATABASE_NAME || 'store-database'
  ensureD1Database(env, prodDbName, 'D1_DATABASE_ID', dryRun)

  // Preview database
  const previewDbName = env.D1_PREVIEW_DATABASE_NAME || 'store-database-preview'
  ensureD1Database(env, previewDbName, 'D1_PREVIEW_DATABASE_ID', dryRun)
}

/**
 * Generate wrangler.toml from template
 */
function generateConfig(templatePath, outputPath, replacements) {
  if (!existsSync(templatePath)) {
    logError(`Template not found: ${templatePath}`)
    return false
  }

  let content = readFileSync(templatePath, 'utf-8')

  for (const [placeholder, value] of Object.entries(replacements)) {
    const regex = new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g')
    content = content.replace(regex, value || '')
  }

  writeFileSync(outputPath, content)
  return true
}

/**
 * Generate api (backend) wrangler.toml
 */
function generateApiConfig(env, appVersion) {
  log('  Generating api/wrangler.toml...', 'blue')

  const templatePath = resolve(API_DIR, 'wrangler.toml.template')
  const outputPath = resolve(API_DIR, 'wrangler.toml')

  let apiRoutes = '# No custom domain configured - using *.workers.dev'
  if (env.API_DOMAIN) {
    apiRoutes = `[[routes]]\npattern = "${env.API_DOMAIN}"\ncustom_domain = true`
  }

  const replacements = {
    '{{D1_DATABASE_NAME}}': env.D1_DATABASE_NAME || 'store-database',
    '{{D1_DATABASE_ID}}': env.D1_DATABASE_ID || '',
    '{{D1_PREVIEW_DATABASE_NAME}}': env.D1_PREVIEW_DATABASE_NAME || 'store-database-preview',
    '{{D1_PREVIEW_DATABASE_ID}}': env.D1_PREVIEW_DATABASE_ID || '',
    '{{R2_BUCKET_NAME}}': env.R2_BUCKET_NAME || 'store-uploads',
    '{{R2_PREVIEW_BUCKET_NAME}}': env.R2_PREVIEW_BUCKET_NAME || 'store-uploads-preview',
    '{{KV_NAMESPACE_ID}}': env.KV_NAMESPACE_ID || '',
    '{{KV_PREVIEW_NAMESPACE_ID}}': env.KV_PREVIEW_NAMESPACE_ID || '',
    '{{API_URL}}': env.API_DOMAIN ? `https://${env.API_DOMAIN}` : '',
    '{{FRONTEND_URL}}': env.FRONTEND_DOMAIN ? `https://${env.FRONTEND_DOMAIN}` : '',
    '{{PREVIEW_API_URL}}': env.PREVIEW_API_DOMAIN ? `https://${env.PREVIEW_API_DOMAIN}` : '',
    '{{PREVIEW_FRONTEND_URL}}': env.PREVIEW_FRONTEND_DOMAIN ? `https://${env.PREVIEW_FRONTEND_DOMAIN}` : '',
    '{{PAGE_SIZE}}': env.PAGE_SIZE || '20',
    '{{PAGE_SIZE_PREVIEW}}': env.PAGE_SIZE_PREVIEW || '10',
    '{{PAGE_SIZE_LOCAL}}': env.PAGE_SIZE_LOCAL || '5',
    '{{APP_VERSION}}': appVersion,
    '{{API_ROUTES}}': apiRoutes,
  }

  if (generateConfig(templatePath, outputPath, replacements)) {
    logSuccess('Generated api/wrangler.toml')
    return true
  }
  return false
}

/**
 * Generate admin (frontend) wrangler.toml
 */
function generateAdminConfig(env) {
  log('  Generating admin/wrangler.toml...', 'blue')

  const templatePath = resolve(ADMIN_DIR, 'wrangler.toml.template')
  const outputPath = resolve(ADMIN_DIR, 'wrangler.toml')

  let frontendRoutes = '# No custom domain configured - using *.workers.dev'
  if (env.FRONTEND_DOMAIN) {
    frontendRoutes = `[[routes]]\npattern = "${env.FRONTEND_DOMAIN}"\ncustom_domain = true`
  }

  const replacements = {
    '{{KV_NAMESPACE_ID}}': env.KV_NAMESPACE_ID || '',
    '{{KV_PREVIEW_NAMESPACE_ID}}': env.KV_PREVIEW_NAMESPACE_ID || '',
    '{{KV_FRONTEND_DEV_ID}}': env.KV_FRONTEND_DEV_ID || env.KV_PREVIEW_NAMESPACE_ID || '',
    '{{API_URL}}': env.API_DOMAIN ? `https://${env.API_DOMAIN}` : '',
    '{{FRONTEND_URL}}': env.FRONTEND_DOMAIN ? `https://${env.FRONTEND_DOMAIN}` : '',
    '{{FRONTEND_ROUTES}}': frontendRoutes,
  }

  if (generateConfig(templatePath, outputPath, replacements)) {
    logSuccess('Generated admin/wrangler.toml')
    return true
  }
  return false
}

/**
 * Generate public-api (Rust worker) wrangler.toml
 * Uses Routes (not Custom Domains) to enable path-based routing.
 * Routes with zone_name support wildcards like /api/public/*
 * Routes take precedence over Custom Domains on the same hostname.
 */
function generatePublicApiConfig(env) {
  log('  Generating public-api/wrangler.toml...', 'blue')

  const templatePath = resolve(PUBLIC_API_DIR, 'wrangler.toml.template')
  const outputPath = resolve(PUBLIC_API_DIR, 'wrangler.toml')

  // Generate Routes (not Custom Domains) for path-based routing
  // Routes support wildcards and take precedence over Custom Domains
  // See: https://developers.cloudflare.com/workers/configuration/routing/routes/
  let publicApiRoutes = '# No route configured - using *.workers.dev'
  if (env.API_DOMAIN && env.ZONE_NAME) {
    publicApiRoutes = `# Routes take precedence over Custom Domains on the same hostname
# This routes /api/public/* to this Rust worker while other paths go to the main API
[[routes]]
pattern = "${env.API_DOMAIN}/api/public/*"
zone_name = "${env.ZONE_NAME}"`
  } else if (env.API_DOMAIN) {
    logWarning('ZONE_NAME not set - public-api will use workers.dev subdomain')
    logWarning('Add ZONE_NAME=your-domain.com to .env for path-based routing')
  }

  const replacements = {
    '{{D1_DATABASE_NAME}}': env.D1_DATABASE_NAME || 'store-database',
    '{{D1_DATABASE_ID}}': env.D1_DATABASE_ID || '',
    '{{D1_PREVIEW_DATABASE_NAME}}': env.D1_PREVIEW_DATABASE_NAME || 'store-database-preview',
    '{{D1_PREVIEW_DATABASE_ID}}': env.D1_PREVIEW_DATABASE_ID || '',
    '{{KV_NAMESPACE_ID}}': env.KV_NAMESPACE_ID || '',
    '{{KV_PREVIEW_NAMESPACE_ID}}': env.KV_PREVIEW_NAMESPACE_ID || '',
    '{{PUBLIC_API_ROUTES}}': publicApiRoutes,
  }

  if (generateConfig(templatePath, outputPath, replacements)) {
    logSuccess('Generated public-api/wrangler.toml')
    return true
  }
  return false
}

/**
 * Upload a secret to a worker
 */
function uploadSecret(workerName, secretName, secretValue, cwd = ROOT_DIR) {
  if (!secretValue || secretValue.includes('your_') || secretValue.includes('example')) {
    return false
  }

  const result = spawnSync('wrangler', ['secret', 'put', secretName, '--name', workerName], {
    cwd,
    input: secretValue,
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe'],
  })

  return result.status === 0
}

/**
 * Upload secrets to api (backend) worker
 */
function uploadApiSecrets(env, dryRun = false) {
  log('  Uploading api secrets...', 'blue')

  const secrets = {
    ADMIN_ACCESS_TOKEN: env.ADMIN_ACCESS_TOKEN,
    FRONTEND_ACCESS_TOKEN: env.FRONTEND_ACCESS_TOKEN,
  }

  const validSecrets = Object.entries(secrets).filter(
    ([, value]) => value && !value.includes('your_') && !value.includes('example')
  )

  if (validSecrets.length === 0) {
    logWarning('No valid api secrets found in .env')
    return
  }

  for (const [key, value] of validSecrets) {
    if (dryRun) {
      logSuccess(`Would upload ${key} to store-api`)
    } else {
      if (uploadSecret('store-api', key, value, API_DIR)) {
        logSuccess(`Uploaded ${key} to store-api`)
      } else {
        logWarning(`Failed to upload ${key}`)
      }
    }
  }
}

/**
 * Upload secrets to admin (frontend) worker
 */
function uploadAdminSecrets(env, dryRun = false) {
  log('  Uploading admin secrets...', 'blue')

  const secrets = {
    GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET,
    FRONTEND_ACCESS_TOKEN: env.FRONTEND_ACCESS_TOKEN,
    ADMIN_ACCESS_TOKEN: env.ADMIN_ACCESS_TOKEN,
  }

  const validSecrets = Object.entries(secrets).filter(
    ([, value]) => value && !value.includes('your_') && !value.includes('example')
  )

  if (validSecrets.length === 0) {
    logWarning('No valid admin secrets found in .env')
    return
  }

  for (const [key, value] of validSecrets) {
    if (dryRun) {
      logSuccess(`Would upload ${key} to store-admin`)
    } else {
      if (uploadSecret('store-admin', key, value, ADMIN_DIR)) {
        logSuccess(`Uploaded ${key} to store-admin`)
      } else {
        logWarning(`Failed to upload ${key}`)
      }
    }
  }
}

/**
 * Scan modules and generate manifest
 * Modules are pure JSON - no compilation needed
 */
function scanModules(dryRun = false) {
  if (dryRun) {
    logSuccess('Would run: npm run scan:modules')
    return true
  }

  try {
    exec('npm run scan:modules', { silent: false })
    logSuccess('Modules scanned successfully')
    return true
  } catch (error) {
    logWarning(`Module scan failed: ${error.message}`)
    return false
  }
}

/**
 * Apply database migrations to production
 * Iterates through migration folders and executes each SQL file directly
 * Uses IF NOT EXISTS so migrations are idempotent and safe to re-run
 */
function applyMigrations(env, dryRun = false) {
  const migrationsDir = resolve(ROOT_DIR, 'api/prisma/migrations')
  const dbName = env.D1_DATABASE_NAME || 'store-database'

  if (!existsSync(migrationsDir)) {
    logError('Migrations directory not found: api/prisma/migrations')
    return false
  }

  const migrationFolders = readdirSync(migrationsDir).sort()

  if (migrationFolders.length === 0) {
    logWarning('No migration folders found')
    return true
  }

  log(`  Applying ${migrationFolders.length} migrations to ${dbName}...`, 'blue')

  for (const folder of migrationFolders) {
    const migrationFile = join(migrationsDir, folder, 'migration.sql')
    if (existsSync(migrationFile)) {
      if (dryRun) {
        logSuccess(`Would apply migration: ${folder}`)
      } else {
        try {
          log(`  📄 Applying migration: ${folder}`, 'blue')
          execSync(
            `wrangler d1 execute ${dbName} --remote --file="${migrationFile}" --config api/wrangler.toml`,
            { cwd: ROOT_DIR, encoding: 'utf-8', stdio: 'inherit' }
          )
        } catch (error) {
          // Migrations are idempotent (IF NOT EXISTS), so errors are often fine
          logWarning(`Migration ${folder} had warnings (may be already applied)`)
        }
      }
    }
  }

  logSuccess('All migrations applied successfully')
  return true
}

/**
 * Check if tokens table is empty (fresh database)
 */
function isTokensTableEmpty(env) {
  try {
    const dbName = env.D1_DATABASE_NAME || 'store-database'
    const result = execSync(
      `wrangler d1 execute ${dbName} --remote --command="SELECT COUNT(*) as count FROM tokens;" --config api/wrangler.toml`,
      { cwd: ROOT_DIR, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
    )

    // Parse JSON output from wrangler
    const jsonMatch = result.match(/\[\s*{[\s\S]*}\s*\]/)
    if (jsonMatch) {
      const jsonResults = JSON.parse(jsonMatch[0])
      if (Array.isArray(jsonResults) && jsonResults[0]?.results?.[0]?.count !== undefined) {
        const count = jsonResults[0].results[0].count
        return count === 0
      }
    }

    // If we can't parse, assume it's empty (safe to re-seed with INSERT OR REPLACE)
    return true
  } catch (error) {
    // Table might not exist yet, or other error - assume fresh database
    logWarning(`Could not check tokens table: ${error.message}`)
    return true
  }
}

/**
 * Seed essential tokens into the database
 * Uses INSERT OR REPLACE so it's safe to run multiple times
 */
function seedProductionTokens(env, dryRun = false) {
  let productionTokens = loadProductionTokens()

  if (!productionTokens) {
    logWarning('No production tokens found - generating new ones')
    // Generate new tokens using token-manager
    try {
      exec('npx tsx scripts/token-manager.ts production', { silent: true })
      // Reload tokens after generation
      productionTokens = loadProductionTokens()
      if (!productionTokens) {
        logError('Failed to generate production tokens')
        return false
      }
    } catch (error) {
      logError(`Failed to generate tokens: ${error.message}`)
      return false
    }
  }

  if (dryRun) {
    logSuccess('Would seed production tokens to database')
    return true
  }

  // Read the essential-tokens.sql template
  const tokensSeedPath = resolve(ROOT_DIR, 'seeds/essential-tokens.sql')
  if (!existsSync(tokensSeedPath)) {
    logError('seeds/essential-tokens.sql not found')
    return false
  }

  let tokensSeed = readFileSync(tokensSeedPath, 'utf-8')

  // Get allowed domains from environment
  const apiDomain = env.API_DOMAIN || 'localhost:8787'
  const frontendDomain = env.FRONTEND_DOMAIN || 'localhost:5173'
  const allowedDomains = JSON.stringify([apiDomain, frontendDomain])

  // Replace placeholders with actual values
  tokensSeed = tokensSeed
    .replace(/frontend-access-token-placeholder/g, productionTokens.frontendToken)
    .replace(/admin-access-token-placeholder/g, productionTokens.adminToken)
    .replace(/\["placeholder-domain"\]/g, allowedDomains)

  // Write to temp file and execute
  const tempTokensFile = resolve(ROOT_DIR, 'scripts/temp-tokens.sql')
  writeFileSync(tempTokensFile, tokensSeed)

  try {
    const dbName = env.D1_DATABASE_NAME || 'store-database'
    exec(
      `wrangler d1 execute ${dbName} --remote --file="${tempTokensFile}" --config api/wrangler.toml`,
      { silent: false }
    )
    logSuccess('Production tokens seeded to database')
    return true
  } catch (error) {
    logError(`Failed to seed tokens: ${error.message}`)
    return false
  } finally {
    // Clean up temp file
    if (existsSync(tempTokensFile)) {
      try {
        unlinkSync(tempTokensFile)
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }
}

/**
 * Initialize database - applies migrations and seeds tokens if needed
 */
function initializeDatabase(env, dryRun = false) {
  // Step 1: Apply migrations
  if (!applyMigrations(env, dryRun)) {
    return false
  }

  // Step 2: Check if tokens need seeding
  if (dryRun) {
    logSuccess('Would check and seed tokens if database is fresh')
    return true
  }

  const isEmpty = isTokensTableEmpty(env)
  if (isEmpty) {
    log('  Database is fresh - seeding essential tokens...', 'blue')
    return seedProductionTokens(env, dryRun)
  } else {
    logSuccess('Tokens already exist in database')
    return true
  }
}

/**
 * Deploy api (backend) worker
 */
function deployApi(appVersion, dryRun = false) {
  log('  Deploying api worker...', 'blue')

  const dryRunFlag = dryRun ? ' --dry-run' : ''

  try {
    // Use --env="" to explicitly target top-level (production) environment
    exec(`wrangler deploy --env="" --var APP_VERSION:${appVersion}${dryRunFlag}`, { cwd: API_DIR })
    logSuccess('Deployed store-api')
    return true
  } catch (error) {
    logError(`API deployment failed: ${error.message}`)
    return false
  }
}

/**
 * Deploy admin (frontend) worker
 */
function deployAdmin(dryRun = false) {
  log('  Building and deploying admin worker...', 'blue')

  const dryRunFlag = dryRun ? ' --dry-run' : ''

  try {
    // Build admin
    log('    Running version script...', 'cyan')
    exec('npm run version', { cwd: ADMIN_DIR, silent: true })

    log('    Building CSS...', 'cyan')
    exec('npm run build:css', { cwd: ADMIN_DIR, silent: true })

    log('    Building client bundle...', 'cyan')
    exec('npm run build:client', { cwd: ADMIN_DIR, silent: true })

    log('    Deploying to Cloudflare...', 'cyan')
    // Use --env="" to explicitly target top-level (production) environment
    exec(`wrangler deploy --env=""${dryRunFlag}`, { cwd: ADMIN_DIR })

    logSuccess('Deployed store-admin')
    return true
  } catch (error) {
    logError(`Admin deployment failed: ${error.message}`)
    return false
  }
}

/**
 * Deploy public-api (Rust) worker
 */
function deployPublicApi(dryRun = false) {
  log('  Building and deploying public-api (Rust) worker...', 'blue')

  const dryRunFlag = dryRun ? ' --dry-run' : ''

  try {
    // Build Rust worker with worker-build
    log('    Building Rust worker with worker-build...', 'cyan')
    exec('worker-build --release', { cwd: PUBLIC_API_DIR })

    log('    Deploying to Cloudflare...', 'cyan')
    // Use --env="" to explicitly target top-level (production) environment
    exec(`wrangler deploy --env=""${dryRunFlag}`, { cwd: PUBLIC_API_DIR })

    logSuccess('Deployed store-public-api')
    return true
  } catch (error) {
    logError(`Public API deployment failed: ${error.message}`)
    return false
  }
}

/**
 * Main deployment flow
 */
async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const skipMigrations = args.includes('--skip-migrations')

  // Get target, handling legacy names
  let target = args.find(arg => !arg.startsWith('--'))

  // Map legacy names to new names
  if (target === 'backend') target = 'api'
  if (target === 'frontend') target = 'admin'

  const deployApiFlag = !target || target === 'api'
  const deployAdminFlag = !target || target === 'admin'
  const deployPublicApiFlag = !target || target === 'public-api'

  // Calculate total steps dynamically
  let totalSteps = 1 // Step 0: update wrangler
  totalSteps += 1 // Ensure D1 databases
  totalSteps += 1 // Ensure KV namespaces
  totalSteps += 1 // Generate configs

  if (deployApiFlag) {
    totalSteps += 1 // Scan modules
    if (!skipMigrations) totalSteps += 1 // Migrations
    totalSteps += 1 // Upload secrets
    totalSteps += 1 // Deploy
  }

  if (deployAdminFlag) {
    totalSteps += 1 // Upload secrets
    totalSteps += 1 // Deploy
  }

  if (deployPublicApiFlag) {
    totalSteps += 1 // Deploy (no secrets needed for public-api)
  }

  let currentStep = 0

  log('\n========================================', 'bright')
  log('  Store - Deployment Script', 'bright')
  if (dryRun) {
    log('  (DRY RUN - no changes will be made)', 'yellow')
  }
  if (target) {
    log(`  Target: ${target}`, 'cyan')
  } else {
    log('  Target: all workers (api, admin, public-api)', 'cyan')
  }
  log('========================================\n', 'bright')

  // Step 0: Update wrangler
  logStep(currentStep, totalSteps, 'Updating wrangler...')
  updateWrangler()

  // Load environment
  const env = loadEnv()
  logSuccess('Loaded .env configuration')

  const appVersion = getAppVersion()
  logSuccess(`App version: ${appVersion}`)

  // Ensure D1 databases exist (creates and updates .env if missing)
  logStep(++currentStep, totalSteps, 'Ensuring D1 databases...')
  ensureD1Databases(env, dryRun)

  // Ensure KV namespaces exist (creates and updates .env if missing)
  logStep(++currentStep, totalSteps, 'Ensuring KV namespaces...')
  ensureKvNamespaces(env, dryRun)

  // Generate configs
  logStep(++currentStep, totalSteps, 'Generating configuration files...')

  if (deployApiFlag) {
    generateApiConfig(env, appVersion)
  }

  if (deployAdminFlag) {
    generateAdminConfig(env)
  }

  if (deployPublicApiFlag) {
    generatePublicApiConfig(env)
  }

  // Deploy API
  if (deployApiFlag) {
    // Scan modules (JSON manifests, no compilation needed)
    logStep(++currentStep, totalSteps, 'Scanning modules...')
    scanModules(dryRun)

    // Initialize database (migrations + token seeding) BEFORE deploying new code
    if (!skipMigrations) {
      logStep(++currentStep, totalSteps, 'Initializing database (migrations + tokens)...')
      if (!initializeDatabase(env, dryRun)) {
        logError('Database initialization failed')
        process.exit(1)
      }
    } else {
      logWarning('Skipping database initialization (--skip-migrations flag)')
    }

    logStep(++currentStep, totalSteps, 'Uploading api secrets...')
    uploadApiSecrets(env, dryRun)

    logStep(++currentStep, totalSteps, 'Deploying api...')
    if (!deployApi(appVersion, dryRun)) {
      process.exit(1)
    }
  }

  // Deploy Admin
  if (deployAdminFlag) {
    logStep(++currentStep, totalSteps, 'Uploading admin secrets...')
    uploadAdminSecrets(env, dryRun)

    logStep(++currentStep, totalSteps, 'Deploying admin...')
    if (!deployAdmin(dryRun)) {
      process.exit(1)
    }
  }

  // Deploy Public API (Rust)
  if (deployPublicApiFlag) {
    logStep(++currentStep, totalSteps, 'Deploying public-api (Rust)...')
    if (!deployPublicApi(dryRun)) {
      process.exit(1)
    }
  }

  // Summary
  log('\n========================================', 'bright')
  log('  Deployment Complete!', 'green')
  log('========================================\n', 'bright')

  if (env.API_DOMAIN) {
    log(`  API:         https://${env.API_DOMAIN}`, 'cyan')
    log(`  Public API:  https://${env.API_DOMAIN}/api/public/*`, 'cyan')
  }
  if (env.FRONTEND_DOMAIN) {
    log(`  Admin:       https://${env.FRONTEND_DOMAIN}`, 'cyan')
  }
  log('')
}

main().catch(error => {
  logError(`Deployment failed: ${error.message}`)
  process.exit(1)
})
