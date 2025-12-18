#!/usr/bin/env npx tsx
/**
 * Flood Test Script
 * Load testing for local and production to verify KV caching performance
 *
 * Usage:
 *   npx tsx scripts/flood-test.ts [options]
 *
 * Options:
 *   --rps=100              Requests per second (default: 100)
 *   --duration=10          Test duration in seconds (default: 10)
 *   --endpoint=/api/tables Endpoint to test (default: /api/tables)
 *   --local                Use localhost:8787 TypeScript API (default)
 *   --rust                 Use localhost:8788 Rust public-api
 *   --preview              Use preview/staging URL
 *   --production           Use production URL
 *   --url=https://...      Custom base URL
 *   --token=xxx            Bearer token (reads ADMIN_ACCESS_TOKEN from .dev.vars if not provided)
 *   --concurrency=10       Max concurrent requests (default: 10)
 *
 * Presets:
 *   --preset=tables        Test /api/tables endpoint (admin token required)
 *   --preset=public        Test /api/public/records via Rust worker (port 8788)
 *   --preset=public-tables Test /api/public/tables via Rust worker (port 8788)
 *   --preset=health        Test /health endpoint (no auth)
 *
 * Examples:
 *   # Test TypeScript API (admin routes)
 *   npx tsx scripts/flood-test.ts --preset=tables --rps=50
 *
 *   # Test Rust public-api worker
 *   npx tsx scripts/flood-test.ts --preset=public-tables --rps=100
 *   npx tsx scripts/flood-test.ts --rust --endpoint=/api/public/tables --rps=100
 *
 *   # Compare TS vs Rust for same endpoint
 *   npx tsx scripts/flood-test.ts --local --endpoint=/api/public/tables --rps=50
 *   npx tsx scripts/flood-test.ts --rust --endpoint=/api/public/tables --rps=50
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'

// Fixed local development URLs
const LOCAL_URLS = {
  local: 'http://localhost:8787',           // TypeScript API
  rust: 'http://localhost:8788',            // Rust public-api
}

/**
 * Load production/preview URLs from .env file (single source of truth).
 * Derives URLs from API_DOMAIN and PREVIEW_API_DOMAIN.
 */
function loadUrlsFromEnv() {
  const urls = {
    ...LOCAL_URLS,
    preview: '',
    production: ''
  }

  try {
    const envPath = resolve(process.cwd(), '.env')
    const envContent = readFileSync(envPath, 'utf-8')

    // Get API_DOMAIN from .env (e.g., api.your-domain.com)
    const apiDomainMatch = envContent.match(/API_DOMAIN\s*=\s*["']?([^"'\n]+)["']?/)
    if (apiDomainMatch?.[1]) {
      urls.production = `https://${apiDomainMatch[1]}`
    }

    // Get PREVIEW_API_DOMAIN from .env (e.g., api-preview.account-id.workers.dev)
    const previewDomainMatch = envContent.match(/PREVIEW_API_DOMAIN\s*=\s*["']?([^"'\n]+)["']?/)
    if (previewDomainMatch?.[1]) {
      urls.preview = `https://${previewDomainMatch[1]}`
    }
  } catch {
    // Ignore - no .env file or parse error, use defaults
  }

  return urls
}

// Load URLs from environment
const URLS = loadUrlsFromEnv()

interface FloodConfig {
  rps: number
  duration: number
  endpoint: string
  baseUrl: string
  token: string
  concurrency: number
  environment: string
}

interface FloodResult {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  avgResponseTime: number
  minResponseTime: number
  maxResponseTime: number
  p50ResponseTime: number
  p95ResponseTime: number
  p99ResponseTime: number
  requestsPerSecond: number
  actualDuration: number
  errorCodes: Record<number, number>
  isRustWorker: boolean
}

function parseArgs(): FloodConfig {
  const args = process.argv.slice(2)
  const config: FloodConfig = {
    rps: 100,
    duration: 10,
    endpoint: '/api/tables',
    baseUrl: URLS.local,
    token: '',
    concurrency: 10,
    environment: 'local'
  }

  for (const arg of args) {
    if (arg.startsWith('--rps=')) {
      config.rps = parseInt(arg.split('=')[1] || '100')
    } else if (arg.startsWith('--duration=')) {
      config.duration = parseInt(arg.split('=')[1] || '10')
    } else if (arg.startsWith('--endpoint=')) {
      config.endpoint = arg.split('=')[1] || '/api/tables'
    } else if (arg.startsWith('--url=')) {
      config.baseUrl = arg.split('=')[1] || URLS.local
      config.environment = 'custom'
    } else if (arg.startsWith('--token=')) {
      config.token = arg.split('=')[1] || ''
    } else if (arg.startsWith('--concurrency=')) {
      config.concurrency = parseInt(arg.split('=')[1] || '10')
    } else if (arg === '--local') {
      config.baseUrl = URLS.local
      config.environment = 'local (TypeScript)'
    } else if (arg === '--rust') {
      config.baseUrl = URLS.rust
      config.environment = 'local (Rust)'
    } else if (arg === '--preview') {
      if (!URLS.preview) {
        console.error('❌ Preview URL not available')
        console.error('   Check CLOUDFLARE_ACCOUNT_ID is set in .env')
        process.exit(1)
      }
      config.baseUrl = URLS.preview
      config.environment = 'preview'
    } else if (arg === '--production') {
      if (!URLS.production) {
        console.error('❌ Production URL not available')
        console.error('   Check API_DOMAIN is set in .env')
        process.exit(1)
      }
      config.baseUrl = URLS.production
      config.environment = 'production'
    } else if (arg.startsWith('--preset=')) {
      const preset = arg.split('=')[1]
      if (preset === 'tables') {
        config.endpoint = '/api/tables'
        // Admin tables stay on TypeScript API
      } else if (preset === 'public' || preset === 'public-tables') {
        // Both presets use /api/public/tables which lists public tables
        // For records, use --endpoint=/api/public/tables/{id}/records
        config.endpoint = '/api/public/tables'
        // Public endpoints target Rust worker by default
        config.baseUrl = URLS.rust
        config.environment = 'local (Rust)'
      } else if (preset === 'health') {
        config.endpoint = '/health'
      }
    }
  }

  // Try to read token from .dev.vars if not provided
  if (!config.token) {
    try {
      const devVarsPath = resolve(process.cwd(), '.dev.vars')
      const devVars = readFileSync(devVarsPath, 'utf-8')
      const match = devVars.match(/ADMIN_ACCESS_TOKEN\s*=\s*["']?([^"'\n]+)["']?/)
      if (match && match[1]) {
        config.token = match[1]
      }
    } catch {
      // Ignore - no .dev.vars file
    }
  }

  return config
}

async function makeRequest(url: string, token: string): Promise<{ status: number; duration: number }> {
  const start = performance.now()
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
    const duration = performance.now() - start
    return { status: response.status, duration }
  } catch {
    const duration = performance.now() - start
    return { status: 0, duration }
  }
}

function calculatePercentile(sortedTimes: number[], percentile: number): number {
  const index = Math.ceil((percentile / 100) * sortedTimes.length) - 1
  return sortedTimes[Math.max(0, index)] || 0
}

/**
 * Detect worker type by making a probe request and checking the X-Worker header.
 * Rust worker returns "X-Worker: rust" header.
 *
 * In production, /api/public/* routes go to Rust worker while /health goes to TypeScript.
 * So we probe the appropriate endpoint based on the target route.
 */
async function detectWorkerType(config: FloodConfig): Promise<{ isRust: boolean; detectionMethod: string }> {
  // Determine probe URL:
  // - For /api/public/* endpoints, probe that path (will hit Rust worker in production)
  // - For other endpoints, probe /health (TypeScript API)
  const isPublicRoute = config.endpoint.startsWith('/api/public')
  const probeUrl = isPublicRoute
    ? `${config.baseUrl}${config.endpoint}`  // Probe actual public endpoint (may return 401 but still has headers)
    : `${config.baseUrl}/health`  // Probe TypeScript API health

  try {
    const response = await fetch(probeUrl, {
      method: 'GET',
      headers: config.token ? { 'Authorization': `Bearer ${config.token}` } : {}
    })

    const xWorkerHeader = response.headers.get('x-worker')
    if (xWorkerHeader === 'rust') {
      return { isRust: true, detectionMethod: 'header' }
    }
    if (xWorkerHeader) {
      return { isRust: false, detectionMethod: 'header' }
    }

    // No X-Worker header but request succeeded - it's the TypeScript API
    // (TypeScript API doesn't have X-Worker header yet)
    return { isRust: false, detectionMethod: 'header-absent' }
  } catch {
    // Probe request failed, fall back to path-based detection
  }

  // Fallback: path-based detection
  const isLocalRust = config.baseUrl.includes(':8788')
  const isProductionPublicRoute = (config.environment === 'production' || config.environment === 'preview')
    && config.endpoint.startsWith('/api/public')

  return {
    isRust: isLocalRust || isProductionPublicRoute,
    detectionMethod: 'path'
  }
}

async function runFloodTest(config: FloodConfig): Promise<FloodResult> {
  const url = `${config.baseUrl}${config.endpoint}`
  const totalRequests = config.rps * config.duration

  // Detect worker type via X-Worker header
  console.log('  Probing endpoint to detect worker type...')
  const { isRust: isRustWorker, detectionMethod } = await detectWorkerType(config)
  const workerType = isRustWorker ? '🦀 Rust public-api' : '📘 TypeScript API'

  console.log('\n' + '='.repeat(60))
  console.log('  FLOOD TEST - Performance Benchmark')
  console.log('='.repeat(60))
  console.log(`  Worker:       ${workerType} (detected via ${detectionMethod})`)
  console.log(`  Environment:  ${config.environment.toUpperCase()}`)
  console.log(`  Target:       ${url}`)
  console.log(`  RPS:          ${config.rps}`)
  console.log(`  Duration:     ${config.duration}s`)
  console.log(`  Total:        ${totalRequests} requests`)
  console.log(`  Concurrency:  ${config.concurrency}`)
  console.log(`  Auth:         ${config.token ? 'Bearer token' : 'None'}`)
  console.log('='.repeat(60) + '\n')

  const responseTimes: number[] = []
  const errorCodes: Record<number, number> = {}
  let successCount = 0
  let failCount = 0
  let requestsSent = 0
  let activeRequests = 0

  const startTime = Date.now()

  // Track active promises for proper concurrency control
  const activePromises: Set<Promise<void>> = new Set()

  const sendRequest = async (): Promise<void> => {
    activeRequests++
    const result = await makeRequest(url, config.token)
    activeRequests--
    responseTimes.push(result.duration)

    if (result.status >= 200 && result.status < 300) {
      successCount++
    } else {
      failCount++
      errorCodes[result.status] = (errorCodes[result.status] || 0) + 1
    }
  }

  // Calculate delay between requests to achieve target RPS
  const requestInterval = 1000 / config.rps

  for (let i = 0; i < totalRequests; i++) {
    const iterationStart = Date.now()

    // Wait if we've hit the concurrency limit
    while (activeRequests >= config.concurrency) {
      await new Promise(resolve => setTimeout(resolve, 5))
    }

    // Launch request
    const promise = sendRequest()
    activePromises.add(promise)
    promise.finally(() => activePromises.delete(promise))
    requestsSent++

    // Progress update
    const elapsed = (Date.now() - startTime) / 1000
    const actualRps = requestsSent / Math.max(elapsed, 0.1)
    const completed = successCount + failCount
    process.stdout.write(`\r  Sent: ${requestsSent}/${totalRequests} | Completed: ${completed} | Active: ${activeRequests} | ${actualRps.toFixed(0)} RPS`)

    // Wait to maintain target RPS (unless we're behind)
    const iterationDuration = Date.now() - iterationStart
    const waitTime = Math.max(0, requestInterval - iterationDuration)
    if (waitTime > 0 && i < totalRequests - 1) {
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }

  // Wait for all remaining requests to complete
  console.log('\n  Waiting for remaining requests to complete...')
  await Promise.all(activePromises)

  const totalDuration = (Date.now() - startTime) / 1000

  console.log('')

  // Calculate statistics
  const sortedTimes = [...responseTimes].sort((a, b) => a - b)
  const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length

  return {
    totalRequests,
    successfulRequests: successCount,
    failedRequests: failCount,
    avgResponseTime: avgTime,
    minResponseTime: sortedTimes[0] || 0,
    maxResponseTime: sortedTimes[sortedTimes.length - 1] || 0,
    p50ResponseTime: calculatePercentile(sortedTimes, 50),
    p95ResponseTime: calculatePercentile(sortedTimes, 95),
    p99ResponseTime: calculatePercentile(sortedTimes, 99),
    requestsPerSecond: totalRequests / totalDuration,
    actualDuration: totalDuration,
    errorCodes,
    isRustWorker
  }
}

function printResults(result: FloodResult, config: FloodConfig): void {
  console.log('='.repeat(60))
  console.log('  RESULTS')
  console.log('='.repeat(60))
  console.log(`  Total Requests:     ${result.totalRequests}`)
  console.log(`  Successful:         ${result.successfulRequests} (${((result.successfulRequests / result.totalRequests) * 100).toFixed(1)}%)`)
  console.log(`  Failed:             ${result.failedRequests} (${((result.failedRequests / result.totalRequests) * 100).toFixed(1)}%)`)
  console.log(`  Actual Duration:    ${result.actualDuration.toFixed(1)}s`)
  console.log(`  Throughput:         ${result.requestsPerSecond.toFixed(1)} req/s`)
  console.log('')
  console.log('  Response Times:')
  console.log(`    Min:              ${result.minResponseTime.toFixed(1)}ms`)
  console.log(`    Avg:              ${result.avgResponseTime.toFixed(1)}ms`)
  console.log(`    Max:              ${result.maxResponseTime.toFixed(1)}ms`)
  console.log(`    P50 (median):     ${result.p50ResponseTime.toFixed(1)}ms`)
  console.log(`    P95:              ${result.p95ResponseTime.toFixed(1)}ms`)
  console.log(`    P99:              ${result.p99ResponseTime.toFixed(1)}ms`)

  if (Object.keys(result.errorCodes).length > 0) {
    console.log('')
    console.log('  Error Codes:')
    for (const [code, count] of Object.entries(result.errorCodes)) {
      const codeName = code === '0' ? 'Network Error' : `HTTP ${code}`
      console.log(`    ${codeName}: ${count}`)
    }
  }

  console.log('='.repeat(60))

  // Performance assessment
  console.log('')
  const targetRps = config.rps
  const achievedRps = result.requestsPerSecond
  const rpsRatio = achievedRps / targetRps

  if (result.failedRequests === 0 && result.avgResponseTime < 100 && rpsRatio > 0.9) {
    console.log('  ✅ EXCELLENT - All requests successful, fast responses, target RPS achieved')
  } else if (result.failedRequests === 0 && result.avgResponseTime < 500 && rpsRatio > 0.5) {
    console.log('  ✅ GOOD - All requests successful, acceptable response times')
  } else if (result.failedRequests / result.totalRequests < 0.01 && result.avgResponseTime < 1000) {
    console.log('  ⚠️  WARNING - Some slowness, consider optimization')
  } else if (result.avgResponseTime > 5000) {
    console.log('  ❌ CRITICAL - Very slow responses, server is overwhelmed')
    console.log('     → Check database queries and add caching')
    console.log('     → Review KV cache hit rates')
  } else if (result.failedRequests / result.totalRequests > 0.05) {
    console.log('  ❌ POOR - High failure rate, investigate issues')
  } else {
    console.log('  ⚠️  NEEDS WORK - Performance below expectations')
  }

  // Specific recommendations based on metrics (use result.isRustWorker from probe)
  if (result.avgResponseTime > 1000) {
    console.log('')
    console.log('  📋 RECOMMENDATIONS:')
    if (config.endpoint.includes('/api/tables') && !config.endpoint.includes('/public')) {
      console.log('     1. Check if table metadata is being cached in KV')
      console.log('     2. Verify row count cache is working')
      console.log('     3. Review database query patterns')
    }
    if (config.endpoint.includes('/api/public')) {
      if (result.isRustWorker) {
        console.log('     1. Rust worker is read-only - ensure D1 queries are optimized')
        console.log('     2. Check if auth token validation is hitting D1 every request')
        console.log('     3. Consider caching token validation results')
      } else {
        console.log('     1. You are testing TS API - try --rust flag for Rust worker')
        console.log('     2. This endpoint is known to be heavy - ensure public table caching')
        console.log('     3. Consider pagination optimization')
      }
    }
  }

  // Comparison tip
  if (config.endpoint.includes('/api/public') && !result.isRustWorker) {
    console.log('')
    console.log('  💡 TIP: You are testing TypeScript API for public routes.')
    console.log('     Use --rust flag or --preset=public to test the Rust public-api worker')
    console.log('     Compare: npx tsx scripts/flood-test.ts --rust --endpoint=/api/public/tables')
  }

  if (result.isRustWorker && result.avgResponseTime < 100) {
    console.log('')
    console.log('  🦀 RUST PERFORMANCE: Excellent! Rust worker is performing well.')
  }

  console.log('')
}

async function main() {
  const config = parseArgs()

  if (!config.token && !config.endpoint.includes('/health') && !config.endpoint.includes('/public')) {
    console.log('⚠️  No auth token found. Testing without authentication.')
    console.log('   Set ADMIN_ACCESS_TOKEN in .dev.vars or use --token=xxx')
    console.log('')
  }

  // Warn about production testing
  if (config.environment === 'production') {
    console.log('🚨 WARNING: Testing against PRODUCTION!')
    console.log('   Press Ctrl+C within 5 seconds to cancel...')
    await new Promise(resolve => setTimeout(resolve, 5000))
  }

  try {
    const result = await runFloodTest(config)
    printResults(result, config)
  } catch (error) {
    console.error('❌ Flood test failed:', error)
    process.exit(1)
  }
}

main()
