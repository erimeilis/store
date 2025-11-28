#!/usr/bin/env node

/**
 * Store - Unified Deployment Script
 *
 * This script handles the complete deployment process:
 * 1. Load environment variables from .env
 * 2. Generate wrangler.toml files from templates
 * 3. Upload secrets to Cloudflare
 * 4. Deploy workers
 *
 * Usage:
 *   node scripts/deploy.js              # Deploy both backend and frontend
 *   node scripts/deploy.js backend      # Deploy backend only
 *   node scripts/deploy.js frontend     # Deploy frontend only
 *   node scripts/deploy.js --dry-run    # Show what would be deployed
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
      logSuccess(`Would upload ${key} to store-crud-api`)
    } else {
      if (uploadSecret('store-crud-api', key, value)) {
        logSuccess(`Uploaded ${key} to store-crud-api`)
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
      logSuccess(`Would upload ${key} to store-crud-front`)
    } else {
      if (uploadSecret('store-crud-front', key, value)) {
        logSuccess(`Uploaded ${key} to store-crud-front`)
      } else {
        logWarning(`Failed to upload ${key}`)
      }
    }
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
    logSuccess('Deployed store-crud-api')
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

    logSuccess('Deployed store-crud-front')
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

  const totalSteps = (deployBackendFlag ? 2 : 0) + (deployFrontendFlag ? 2 : 0)
  let currentStep = 0

  log('\n========================================', 'bright')
  log('  Store - Deployment Script', 'bright')
  if (dryRun) {
    log('  (DRY RUN - no changes will be made)', 'yellow')
  }
  log('========================================\n', 'bright')

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
    logStep(++currentStep, totalSteps + 1, 'Uploading backend secrets...')
    uploadBackendSecrets(env, dryRun)

    logStep(++currentStep, totalSteps + 1, 'Deploying backend...')
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
