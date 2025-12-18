#!/usr/bin/env node

/**
 * Store - Configuration Generator
 *
 * Generates all config files from .env (single source of truth):
 *   - api/wrangler.toml (backend) from api/wrangler.toml.template
 *   - public-api/wrangler.toml (Rust worker) from public-api/wrangler.toml.template
 *   - admin/wrangler.toml from admin/wrangler.toml.template
 *   - api/.dev.vars (backend secrets for Wrangler)
 *   - admin/.dev.vars (admin UI secrets for Wrangler)
 *
 * This allows keeping all sensitive data in one .env file (gitignored).
 *
 * Usage:
 *   node scripts/generate-config.js            # Generate all configs
 *   node scripts/generate-config.js api        # Generate api (backend) only
 *   node scripts/generate-config.js public-api # Generate public-api (Rust) only
 *   node scripts/generate-config.js admin      # Generate admin (frontend) only
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = resolve(__dirname, '..')
const TOKENS_DIR = resolve(__dirname, 'tokens')

// Read version from package.json
const packageJson = JSON.parse(readFileSync(resolve(ROOT_DIR, 'package.json'), 'utf-8'))
const APP_VERSION = packageJson.version

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
 * Load tokens from token-manager files (for dev mode)
 * Returns tokens for the specified environment
 */
function loadTokensFromManager(environment = 'local') {
  const tokenFilePath = resolve(TOKENS_DIR, `${environment}-tokens.json`)

  if (!existsSync(tokenFilePath)) {
    logWarning(`Token file not found: ${tokenFilePath}`)
    logWarning('Run db-reset to generate tokens: npm run db:reset:local')
    return null
  }

  try {
    const tokens = JSON.parse(readFileSync(tokenFilePath, 'utf-8'))
    logSuccess(`Loaded tokens from token-manager (${environment})`)
    return tokens
  } catch (error) {
    logWarning(`Failed to load tokens: ${error.message}`)
    return null
  }
}

/**
 * Parse env file content into object
 */
function parseEnvFile(content) {
  const env = {}
  for (const line of content.split('\n')) {
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
 * Load environment variables from .env file
 * For dev mode, also loads .env.local which overrides .env values
 */
function loadEnv(forDev = false) {
  const envPath = resolve(ROOT_DIR, '.env')
  const envLocalPath = resolve(ROOT_DIR, '.env.local')

  if (!existsSync(envPath)) {
    logError('.env file not found!')
    log('  Please copy .env.example to .env and fill in your values:', 'yellow')
    log('  cp .env.example .env', 'cyan')
    process.exit(1)
  }

  // Load base .env
  const envContent = readFileSync(envPath, 'utf-8')
  const env = parseEnvFile(envContent)

  // For dev mode, load .env.local overrides if exists
  if (forDev && existsSync(envLocalPath)) {
    const localContent = readFileSync(envLocalPath, 'utf-8')
    const localEnv = parseEnvFile(localContent)

    // Merge: .env.local overrides .env (only non-empty values)
    for (const [key, value] of Object.entries(localEnv)) {
      if (value !== '') {
        env[key] = value
      } else {
        // Empty value in .env.local means "clear this value"
        env[key] = ''
      }
    }

    logSuccess('Loaded .env + .env.local (dev mode)')
  } else {
    logSuccess('Loaded .env configuration')
  }

  return env
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

  // Apply all replacements
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
function generateApiConfig(env) {
  log('\n📦 Generating api/wrangler.toml...', 'cyan')

  const templatePath = resolve(ROOT_DIR, 'api/wrangler.toml.template')
  const outputPath = resolve(ROOT_DIR, 'api/wrangler.toml')

  // Generate custom domain routes if API_DOMAIN is set
  // Routes are at root level (production is default deployment)
  let apiRoutes = '# No custom domain configured - using *.workers.dev'
  if (env.API_DOMAIN) {
    apiRoutes = `[[routes]]
pattern = "${env.API_DOMAIN}"
custom_domain = true`
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
    '{{APP_VERSION}}': APP_VERSION,
    '{{API_ROUTES}}': apiRoutes,
  }

  if (generateConfig(templatePath, outputPath, replacements)) {
    logSuccess('Generated api/wrangler.toml')
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
  log('\n🦀 Generating public-api wrangler.toml...', 'cyan')

  const templatePath = resolve(ROOT_DIR, 'public-api/wrangler.toml.template')
  const outputPath = resolve(ROOT_DIR, 'public-api/wrangler.toml')

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
 * Generate admin wrangler.toml
 */
function generateAdminConfig(env) {
  log('\n🎨 Generating admin/wrangler.toml...', 'cyan')

  const templatePath = resolve(ROOT_DIR, 'admin/wrangler.toml.template')
  const outputPath = resolve(ROOT_DIR, 'admin/wrangler.toml')

  // Generate custom domain routes if FRONTEND_DOMAIN is set
  // Routes are at root level (production is default deployment)
  let frontendRoutes = '# No custom domain configured - using *.workers.dev'
  if (env.FRONTEND_DOMAIN) {
    frontendRoutes = `[[routes]]
pattern = "${env.FRONTEND_DOMAIN}"
custom_domain = true`
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
 * Generate api .dev.vars (secrets for Wrangler)
 * In dev mode, loads tokens from token-manager files
 */
function generateApiDevVars(env, forDev = false, tokenEnv = 'local') {
  log('\n🔐 Generating api/.dev.vars...', 'cyan')

  const outputPath = resolve(ROOT_DIR, 'api/.dev.vars')
  const secrets = []

  // In dev mode, load tokens from token-manager (single source of truth)
  if (forDev) {
    const tokens = loadTokensFromManager(tokenEnv)
    if (tokens) {
      secrets.push(`ADMIN_ACCESS_TOKEN=${tokens.adminToken}`)
      secrets.push(`FRONTEND_ACCESS_TOKEN=${tokens.frontendToken}`)
    }
  } else {
    // Production mode: use .env values
    if (env.ADMIN_ACCESS_TOKEN) secrets.push(`ADMIN_ACCESS_TOKEN=${env.ADMIN_ACCESS_TOKEN}`)
    if (env.FRONTEND_ACCESS_TOKEN) secrets.push(`FRONTEND_ACCESS_TOKEN=${env.FRONTEND_ACCESS_TOKEN}`)
  }

  if (secrets.length === 0) {
    logWarning('No secrets found - skipping api/.dev.vars generation')
    logWarning('Run db-reset to generate tokens: npm run db:reset:local')
    return true
  }

  const content = `# Auto-generated - do not edit directly
${secrets.join('\n')}
`

  writeFileSync(outputPath, content)
  logSuccess('Generated api/.dev.vars')
  return true
}

/**
 * Generate admin .dev.vars (secrets for Wrangler)
 * In dev mode, loads tokens from token-manager files
 */
function generateAdminDevVars(env, forDev = false, tokenEnv = 'local') {
  log('\n🔐 Generating admin/.dev.vars...', 'cyan')

  const outputPath = resolve(ROOT_DIR, 'admin/.dev.vars')
  const secrets = []

  // In dev mode, load tokens from token-manager (single source of truth)
  if (forDev) {
    const tokens = loadTokensFromManager(tokenEnv)
    if (tokens) {
      secrets.push(`FRONTEND_ACCESS_TOKEN=${tokens.frontendToken}`)
      secrets.push(`ADMIN_ACCESS_TOKEN=${tokens.adminToken}`)  // Needed for API proxy
    }
  } else {
    // Production mode: use .env values
    if (env.FRONTEND_ACCESS_TOKEN) secrets.push(`FRONTEND_ACCESS_TOKEN=${env.FRONTEND_ACCESS_TOKEN}`)
    if (env.ADMIN_ACCESS_TOKEN) secrets.push(`ADMIN_ACCESS_TOKEN=${env.ADMIN_ACCESS_TOKEN}`)
  }

  // Google OAuth always comes from .env
  if (env.GOOGLE_CLIENT_ID) secrets.push(`GOOGLE_CLIENT_ID=${env.GOOGLE_CLIENT_ID}`)
  if (env.GOOGLE_CLIENT_SECRET) secrets.push(`GOOGLE_CLIENT_SECRET=${env.GOOGLE_CLIENT_SECRET}`)

  if (secrets.length === 0) {
    logWarning('No secrets found - skipping admin/.dev.vars generation')
    return true
  }

  const content = `# Auto-generated - do not edit directly
${secrets.join('\n')}
`

  writeFileSync(outputPath, content)
  logSuccess('Generated admin/.dev.vars')
  return true
}

/**
 * Validate required environment variables
 */
function validateEnv(env) {
  const required = [
    'D1_DATABASE_ID',
    'D1_PREVIEW_DATABASE_ID',
    'KV_NAMESPACE_ID',
    'KV_PREVIEW_NAMESPACE_ID',
  ]

  const missing = required.filter(key => !env[key])

  if (missing.length > 0) {
    logWarning('Missing required environment variables:')
    missing.forEach(key => log(`    - ${key}`, 'yellow'))
    log('  Some features may not work correctly.', 'yellow')
    return false
  }

  return true
}

/**
 * Main entry point
 */
function main() {
  const args = process.argv.slice(2)
  const forDev = args.includes('--dev')
  const forPreview = args.includes('--preview')
  const tokenEnv = forPreview ? 'preview' : 'local'
  const target = args.find(arg => !arg.startsWith('--')) // backend, frontend, or empty for both

  log('\n========================================', 'bright')
  log('  Store - Config Generator', 'bright')
  if (forDev) {
    log(`  (Dev Mode - ${forPreview ? 'preview' : 'local'} tokens)`, 'yellow')
  }
  log('========================================', 'bright')

  // Load environment (with .env.local overrides in dev mode)
  const env = loadEnv(forDev)

  // Validate
  validateEnv(env)

  // Generate configs based on target
  let success = true

  if (!target || target === 'api' || target === 'backend') {
    success = generateApiConfig(env) && success
    success = generateApiDevVars(env, forDev, tokenEnv) && success
  }

  if (!target || target === 'public-api') {
    success = generatePublicApiConfig(env) && success
  }

  if (!target || target === 'admin' || target === 'frontend') {
    success = generateAdminConfig(env) && success
    success = generateAdminDevVars(env, forDev, tokenEnv) && success
  }

  if (success) {
    log('\n✅ Configuration generated successfully!', 'green')
  } else {
    log('\n⚠️  Configuration generated with warnings', 'yellow')
  }

  log('')
}

main()
