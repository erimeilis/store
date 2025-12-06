#!/usr/bin/env node

/**
 * Store - Unified Deployment Script
 *
 * This script handles the complete deployment process:
 * 0. Update wrangler to latest version
 * 1. Load environment variables from .env
 * 2. Generate wrangler.toml files from templates
 * 3. Scan modules (JSON manifests)
 * 4. Apply database migrations to production (idempotent, uses IF NOT EXISTS)
 * 5. Upload secrets to Cloudflare
 * 6. Deploy workers
 *
 * Usage:
 *   node scripts/deploy.js                    # Deploy both backend and frontend
 *   node scripts/deploy.js backend            # Deploy backend only
 *   node scripts/deploy.js frontend           # Deploy frontend only
 *   node scripts/deploy.js --dry-run          # Show what would be deployed
 *   node scripts/deploy.js --skip-migrations  # Skip database migrations
 */

import { execSync, spawnSync } from 'child_process'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = resolve(__dirname, '..')
const TOKENS_DIR = resolve(__dirname, 'tokens')

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
    { name: 'frontend', path: resolve(ROOT_DIR, 'frontend') },
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
 * Generate backend wrangler.toml
 */
function generateBackendConfig(env) {
  log('  Generating backend wrangler.toml...', 'blue')

  const templatePath = resolve(ROOT_DIR, 'wrangler.toml.template')
  const outputPath = resolve(ROOT_DIR, 'wrangler.toml')

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
    '{{PAGE_SIZE}}': env.PAGE_SIZE || '20',
    '{{PAGE_SIZE_PREVIEW}}': env.PAGE_SIZE_PREVIEW || '10',
    '{{PAGE_SIZE_LOCAL}}': env.PAGE_SIZE_LOCAL || '5',
    '{{API_ROUTES}}': apiRoutes,
  }

  if (generateConfig(templatePath, outputPath, replacements)) {
    logSuccess('Generated wrangler.toml')
    return true
  }
  return false
}

/**
 * Generate frontend wrangler.toml
 */
function generateFrontendConfig(env) {
  log('  Generating frontend wrangler.toml...', 'blue')

  const templatePath = resolve(ROOT_DIR, 'frontend/wrangler.toml.template')
  const outputPath = resolve(ROOT_DIR, 'frontend/wrangler.toml')

  let frontendRoutes = '# No custom domain configured - using *.workers.dev'
  if (env.FRONTEND_DOMAIN) {
    frontendRoutes = `[[routes]]\npattern = "${env.FRONTEND_DOMAIN}"\ncustom_domain = true`
  }

  const replacements = {
    '{{KV_NAMESPACE_ID}}': env.KV_NAMESPACE_ID || '',
    '{{KV_FRONTEND_DEV_ID}}': env.KV_FRONTEND_DEV_ID || env.KV_PREVIEW_NAMESPACE_ID || '',
    '{{API_URL}}': env.API_DOMAIN ? `https://${env.API_DOMAIN}` : '',
    '{{FRONTEND_URL}}': env.FRONTEND_DOMAIN ? `https://${env.FRONTEND_DOMAIN}` : '',
    '{{FRONTEND_ROUTES}}': frontendRoutes,
  }

  if (generateConfig(templatePath, outputPath, replacements)) {
    logSuccess('Generated frontend/wrangler.toml')
    return true
  }
  return false
}

/**
 * Upload a secret to a worker
 */
function uploadSecret(workerName, secretName, secretValue) {
  if (!secretValue || secretValue.includes('your_') || secretValue.includes('example')) {
    return false
  }

  const result = spawnSync('wrangler', ['secret', 'put', secretName, '--name', workerName], {
    cwd: ROOT_DIR,
    input: secretValue,
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe'],
  })

  return result.status === 0
}

/**
 * Upload secrets to backend worker
 */
function uploadBackendSecrets(env, dryRun = false) {
  log('  Uploading backend secrets...', 'blue')

  const secrets = {
    ADMIN_ACCESS_TOKEN: env.ADMIN_ACCESS_TOKEN,
    FRONTEND_ACCESS_TOKEN: env.FRONTEND_ACCESS_TOKEN,
  }

  const validSecrets = Object.entries(secrets).filter(
    ([, value]) => value && !value.includes('your_') && !value.includes('example')
  )

  if (validSecrets.length === 0) {
    logWarning('No valid backend secrets found in .env')
    return
  }

  for (const [key, value] of validSecrets) {
    if (dryRun) {
      logSuccess(`Would upload ${key} to store-api`)
    } else {
      if (uploadSecret('store-api', key, value)) {
        logSuccess(`Uploaded ${key} to store-api`)
      } else {
        logWarning(`Failed to upload ${key}`)
      }
    }
  }
}

/**
 * Upload secrets to frontend worker
 */
function uploadFrontendSecrets(env, dryRun = false) {
  log('  Uploading frontend secrets...', 'blue')

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
    logWarning('No valid frontend secrets found in .env')
    return
  }

  for (const [key, value] of validSecrets) {
    if (dryRun) {
      logSuccess(`Would upload ${key} to store-frontend`)
    } else {
      if (uploadSecret('store-frontend', key, value)) {
        logSuccess(`Uploaded ${key} to store-frontend`)
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
 * Uses IF NOT EXISTS so migrations are idempotent and safe to re-run
 */
function applyMigrations(dryRun = false) {
  if (dryRun) {
    logSuccess('Would run: npm run db:migrate:prod')
    return true
  }

  try {
    exec('npm run db:migrate:prod', { silent: false })
    logSuccess('Migrations applied successfully')
    return true
  } catch (error) {
    logWarning(`Migration may have partially failed: ${error.message}`)
    return true // Continue deployment - migrations are idempotent
  }
}

/**
 * Deploy backend worker
 */
function deployBackend(appVersion, dryRun = false) {
  log('  Deploying backend worker...', 'blue')

  const dryRunFlag = dryRun ? ' --dry-run' : ''

  try {
    // Use --env="" to explicitly target top-level (production) environment
    exec(`wrangler deploy --env="" --var APP_VERSION:${appVersion}${dryRunFlag}`, { cwd: ROOT_DIR })
    logSuccess('Deployed store-api')
    return true
  } catch (error) {
    logError(`Backend deployment failed: ${error.message}`)
    return false
  }
}

/**
 * Deploy frontend worker
 */
function deployFrontend(dryRun = false) {
  log('  Building and deploying frontend worker...', 'blue')

  const frontendDir = resolve(ROOT_DIR, 'frontend')
  const dryRunFlag = dryRun ? ' --dry-run' : ''

  try {
    // Build frontend
    log('    Running version script...', 'cyan')
    exec('npm run version', { cwd: frontendDir, silent: true })

    log('    Building CSS...', 'cyan')
    exec('npm run build:css', { cwd: frontendDir, silent: true })

    log('    Building client bundle...', 'cyan')
    exec('npm run build:client', { cwd: frontendDir, silent: true })

    log('    Deploying to Cloudflare...', 'cyan')
    // Use --env="" to explicitly target top-level (production) environment
    exec(`wrangler deploy --env=""${dryRunFlag}`, { cwd: frontendDir })

    logSuccess('Deployed store-frontend')
    return true
  } catch (error) {
    logError(`Frontend deployment failed: ${error.message}`)
    return false
  }
}

/**
 * Main deployment flow
 */
async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const target = args.find(arg => !arg.startsWith('--')) // backend, frontend, or undefined (both)

  const deployBackendFlag = !target || target === 'backend'
  const deployFrontendFlag = !target || target === 'frontend'
  const skipMigrations = args.includes('--skip-migrations')

  // Calculate total steps: config + modules + migrations (if backend) + secrets + deploy for each target
  const totalSteps = 1 + (deployBackendFlag ? 1 : 0) + (deployBackendFlag && !skipMigrations ? 1 : 0) + (deployBackendFlag ? 2 : 0) + (deployFrontendFlag ? 2 : 0)
  let currentStep = 0

  log('\n========================================', 'bright')
  log('  Store - Deployment Script', 'bright')
  if (dryRun) {
    log('  (DRY RUN - no changes will be made)', 'yellow')
  }
  log('========================================\n', 'bright')

  // Step 0: Update wrangler
  logStep(0, totalSteps, 'Updating wrangler...')
  updateWrangler()

  // Load environment
  const env = loadEnv()
  logSuccess('Loaded .env configuration')

  const appVersion = getAppVersion()
  logSuccess(`App version: ${appVersion}`)

  // Generate configs
  logStep(++currentStep, totalSteps + 1, 'Generating configuration files...')

  if (deployBackendFlag) {
    generateBackendConfig(env)
  }

  if (deployFrontendFlag) {
    generateFrontendConfig(env)
  }

  // Deploy backend
  if (deployBackendFlag) {
    // Scan modules (JSON manifests, no compilation needed)
    logStep(++currentStep, totalSteps, 'Scanning modules...')
    scanModules(dryRun)

    // Apply database migrations BEFORE deploying new code
    if (!skipMigrations) {
      logStep(++currentStep, totalSteps, 'Applying database migrations...')
      applyMigrations(dryRun)
    } else {
      logWarning('Skipping database migrations (--skip-migrations flag)')
    }

    logStep(++currentStep, totalSteps, 'Uploading backend secrets...')
    uploadBackendSecrets(env, dryRun)

    logStep(++currentStep, totalSteps, 'Deploying backend...')
    if (!deployBackend(appVersion, dryRun)) {
      process.exit(1)
    }
  }

  // Deploy frontend
  if (deployFrontendFlag) {
    logStep(++currentStep, totalSteps + 1, 'Uploading frontend secrets...')
    uploadFrontendSecrets(env, dryRun)

    logStep(++currentStep, totalSteps + 1, 'Deploying frontend...')
    if (!deployFrontend(dryRun)) {
      process.exit(1)
    }
  }

  // Summary
  log('\n========================================', 'bright')
  log('  Deployment Complete!', 'green')
  log('========================================\n', 'bright')

  if (env.API_DOMAIN) {
    log(`  Backend API: https://${env.API_DOMAIN}`, 'cyan')
  }
  if (env.FRONTEND_DOMAIN) {
    log(`  Frontend:    https://${env.FRONTEND_DOMAIN}`, 'cyan')
  }
  log('')
}

main().catch(error => {
  logError(`Deployment failed: ${error.message}`)
  process.exit(1)
})
