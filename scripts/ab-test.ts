#!/usr/bin/env npx tsx
/**
 * A/B Comparison Test: Rust vs TypeScript API Performance
 *
 * Comprehensive performance comparison between Rust public-api worker
 * and TypeScript API for the same endpoints.
 *
 * Usage:
 *   npx tsx scripts/ab-test.ts [options]
 *
 * Options:
 *   --env=local        Test environment: local, preview, production (default: local)
 *   --requests=100     Number of requests per test (default: 100)
 *   --concurrency=5    Max concurrent requests (default: 5)
 *   --warmup=5         Warmup requests before measurement (default: 5)
 *   --token=xxx        Bearer token (reads from .dev.vars if not provided)
 *   --table-id=xxx     Specific table ID for records test (auto-detected if not provided)
 *   --json             Output results in JSON format
 *   --save             Save results to docs/why-rust-benchmark.json
 *
 * Test Endpoints:
 *   - /api/public/tables         List public tables
 *   - /api/public/records        Get records from a public table
 *
 * Examples:
 *   # Local environment comparison
 *   npx tsx scripts/ab-test.ts --env=local
 *
 *   # Production environment comparison
 *   npx tsx scripts/ab-test.ts --env=production --requests=200
 *
 *   # Save results for documentation
 *   npx tsx scripts/ab-test.ts --env=local --save
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

// ============================================================================
// Configuration
// ============================================================================

interface UrlConfig {
  local: string
  rust: string
  preview: string
  production: string
}

interface TestConfig {
  environment: 'local' | 'preview' | 'production'
  requests: number
  concurrency: number
  warmup: number
  token: string
  tableId: string
  json: boolean
  save: boolean
}

interface EndpointResult {
  endpoint: string
  worker: 'typescript' | 'rust'
  requests: number
  successful: number
  failed: number
  minMs: number
  maxMs: number
  avgMs: number
  p50Ms: number
  p95Ms: number
  p99Ms: number
  throughput: number // requests per second
  errorCodes: Record<number, number>
}

interface ComparisonResult {
  endpoint: string
  typescript: EndpointResult
  rust: EndpointResult
  speedup: number // e.g., 2.5 means Rust is 2.5x faster
  p50Speedup: number
  p95Speedup: number
  throughputGain: number // percentage improvement
}

interface TestSuiteResult {
  timestamp: string
  environment: string
  config: {
    requests: number
    concurrency: number
    warmup: number
  }
  comparisons: ComparisonResult[]
  summary: {
    avgSpeedup: number
    avgP50Speedup: number
    avgP95Speedup: number
    avgThroughputGain: number
    rustWins: number
    tsWins: number
    ties: number
  }
}

// ============================================================================
// URL Loading (reads from .env - single source of truth)
// ============================================================================

function loadUrlsFromEnv(): UrlConfig {
  const urls: UrlConfig = {
    local: 'http://localhost:8787',
    rust: 'http://localhost:8788',
    preview: '',
    production: ''
  }

  try {
    const envPath = resolve(process.cwd(), '.env')
    const envContent = readFileSync(envPath, 'utf-8')

    // Get API_DOMAIN from .env
    const apiDomainMatch = envContent.match(/API_DOMAIN\s*=\s*["']?([^"'\n]+)["']?/)
    if (apiDomainMatch?.[1]) {
      urls.production = `https://${apiDomainMatch[1]}`
    }

    // Get PREVIEW_API_DOMAIN from .env
    const previewDomainMatch = envContent.match(/PREVIEW_API_DOMAIN\s*=\s*["']?([^"'\n]+)["']?/)
    if (previewDomainMatch?.[1]) {
      urls.preview = `https://${previewDomainMatch[1]}`
    }
  } catch {
    // Ignore - use defaults
  }

  return urls
}

function loadTokenFromEnv(): string {
  try {
    const devVarsPath = resolve(process.cwd(), '.dev.vars')
    const devVars = readFileSync(devVarsPath, 'utf-8')
    const match = devVars.match(/ADMIN_ACCESS_TOKEN\s*=\s*["']?([^"'\n]+)["']?/)
    return match?.[1] || ''
  } catch {
    return ''
  }
}

// ============================================================================
// Argument Parsing
// ============================================================================

function parseArgs(): TestConfig {
  const args = process.argv.slice(2)
  const config: TestConfig = {
    environment: 'local',
    requests: 100,
    concurrency: 5,
    warmup: 5,
    token: loadTokenFromEnv(),
    tableId: '',
    json: false,
    save: false
  }

  for (const arg of args) {
    if (arg.startsWith('--env=')) {
      const env = arg.split('=')[1] as TestConfig['environment']
      if (['local', 'preview', 'production'].includes(env)) {
        config.environment = env
      }
    } else if (arg.startsWith('--requests=')) {
      config.requests = parseInt(arg.split('=')[1] || '100')
    } else if (arg.startsWith('--concurrency=')) {
      config.concurrency = parseInt(arg.split('=')[1] || '5')
    } else if (arg.startsWith('--warmup=')) {
      config.warmup = parseInt(arg.split('=')[1] || '5')
    } else if (arg.startsWith('--token=')) {
      config.token = arg.split('=')[1] || ''
    } else if (arg.startsWith('--table-id=')) {
      config.tableId = arg.split('=')[1] || ''
    } else if (arg === '--json') {
      config.json = true
    } else if (arg === '--save') {
      config.save = true
    }
  }

  return config
}

// ============================================================================
// HTTP Request Helpers
// ============================================================================

async function makeRequest(
  url: string,
  token: string
): Promise<{ status: number; duration: number; body?: unknown }> {
  const start = performance.now()
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
    const duration = performance.now() - start
    let body: unknown = null
    try {
      body = await response.json()
    } catch {
      // Ignore JSON parse errors
    }
    return { status: response.status, duration, body }
  } catch {
    const duration = performance.now() - start
    return { status: 0, duration }
  }
}

function calculatePercentile(sortedTimes: number[], percentile: number): number {
  if (sortedTimes.length === 0) return 0
  const index = Math.ceil((percentile / 100) * sortedTimes.length) - 1
  return sortedTimes[Math.max(0, index)] || 0
}

// ============================================================================
// Test Runners
// ============================================================================

async function runWarmup(
  baseUrl: string,
  endpoint: string,
  token: string,
  count: number
): Promise<void> {
  const url = `${baseUrl}${endpoint}`
  for (let i = 0; i < count; i++) {
    await makeRequest(url, token)
  }
}

async function runEndpointTest(
  baseUrl: string,
  endpoint: string,
  worker: 'typescript' | 'rust',
  config: TestConfig
): Promise<EndpointResult> {
  const url = `${baseUrl}${endpoint}`
  const responseTimes: number[] = []
  const errorCodes: Record<number, number> = {}
  let successful = 0
  let failed = 0
  let activeRequests = 0

  const activePromises: Set<Promise<void>> = new Set()
  const startTime = Date.now()

  const sendRequest = async (): Promise<void> => {
    activeRequests++
    const result = await makeRequest(url, config.token)
    activeRequests--
    responseTimes.push(result.duration)

    if (result.status >= 200 && result.status < 300) {
      successful++
    } else {
      failed++
      errorCodes[result.status] = (errorCodes[result.status] || 0) + 1
    }
  }

  for (let i = 0; i < config.requests; i++) {
    // Wait if at concurrency limit
    while (activeRequests >= config.concurrency) {
      await new Promise(resolve => setTimeout(resolve, 1))
    }

    const promise = sendRequest()
    activePromises.add(promise)
    promise.finally(() => activePromises.delete(promise))
  }

  // Wait for all requests
  await Promise.all(activePromises)

  const totalDuration = (Date.now() - startTime) / 1000
  const sortedTimes = [...responseTimes].sort((a, b) => a - b)

  return {
    endpoint,
    worker,
    requests: config.requests,
    successful,
    failed,
    minMs: sortedTimes[0] || 0,
    maxMs: sortedTimes[sortedTimes.length - 1] || 0,
    avgMs: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length || 0,
    p50Ms: calculatePercentile(sortedTimes, 50),
    p95Ms: calculatePercentile(sortedTimes, 95),
    p99Ms: calculatePercentile(sortedTimes, 99),
    throughput: config.requests / totalDuration,
    errorCodes
  }
}

async function detectPublicTableId(baseUrl: string, token: string): Promise<string> {
  const url = `${baseUrl}/api/public/tables`
  const result = await makeRequest(url, token)

  if (result.status === 200 && result.body) {
    const body = result.body as { data?: Array<{ id: string; visibility?: string }> }
    const tables = body.data || []
    const publicTable = tables.find(t => t.visibility === 'public')
    if (publicTable) {
      return publicTable.id
    }
    // Fallback to first table if no public table found
    if (tables.length > 0) {
      return tables[0].id
    }
  }

  return ''
}

// ============================================================================
// Comparison Logic
// ============================================================================

function createComparison(
  endpoint: string,
  tsResult: EndpointResult,
  rustResult: EndpointResult
): ComparisonResult {
  // Speedup = how much faster Rust is (TS time / Rust time)
  // > 1 means Rust is faster
  const speedup = tsResult.avgMs > 0 ? tsResult.avgMs / rustResult.avgMs : 1
  const p50Speedup = tsResult.p50Ms > 0 ? tsResult.p50Ms / rustResult.p50Ms : 1
  const p95Speedup = tsResult.p95Ms > 0 ? tsResult.p95Ms / rustResult.p95Ms : 1

  // Throughput gain = percentage improvement
  const throughputGain = tsResult.throughput > 0
    ? ((rustResult.throughput - tsResult.throughput) / tsResult.throughput) * 100
    : 0

  return {
    endpoint,
    typescript: tsResult,
    rust: rustResult,
    speedup,
    p50Speedup,
    p95Speedup,
    throughputGain
  }
}

// ============================================================================
// Output Formatting
// ============================================================================

function printBanner(config: TestConfig): void {
  console.log('')
  console.log('╔' + '═'.repeat(68) + '╗')
  console.log('║' + '  A/B Performance Test: Rust vs TypeScript'.padEnd(68) + '║')
  console.log('╠' + '═'.repeat(68) + '╣')
  console.log('║' + `  Environment:    ${config.environment.toUpperCase()}`.padEnd(68) + '║')
  console.log('║' + `  Requests:       ${config.requests} per endpoint per worker`.padEnd(68) + '║')
  console.log('║' + `  Concurrency:    ${config.concurrency}`.padEnd(68) + '║')
  console.log('║' + `  Warmup:         ${config.warmup} requests`.padEnd(68) + '║')
  console.log('║' + `  Auth:           ${config.token ? 'Bearer token' : 'None'}`.padEnd(68) + '║')
  console.log('╚' + '═'.repeat(68) + '╝')
  console.log('')
}

function printEndpointResult(result: EndpointResult, label: string): void {
  const icon = result.worker === 'rust' ? '🦀' : '📘'
  console.log(`  ${icon} ${label}`)
  console.log(`     Requests:    ${result.successful}/${result.requests} successful`)
  console.log(`     Avg:         ${result.avgMs.toFixed(2)}ms`)
  console.log(`     P50:         ${result.p50Ms.toFixed(2)}ms`)
  console.log(`     P95:         ${result.p95Ms.toFixed(2)}ms`)
  console.log(`     P99:         ${result.p99Ms.toFixed(2)}ms`)
  console.log(`     Min/Max:     ${result.minMs.toFixed(2)}ms / ${result.maxMs.toFixed(2)}ms`)
  console.log(`     Throughput:  ${result.throughput.toFixed(1)} req/s`)

  if (Object.keys(result.errorCodes).length > 0) {
    const errors = Object.entries(result.errorCodes)
      .map(([code, count]) => `${code === '0' ? 'Network' : code}: ${count}`)
      .join(', ')
    console.log(`     Errors:      ${errors}`)
  }
}

function printComparison(comparison: ComparisonResult): void {
  console.log('')
  console.log('┌' + '─'.repeat(68) + '┐')
  console.log('│' + ` Endpoint: ${comparison.endpoint}`.padEnd(68) + '│')
  console.log('└' + '─'.repeat(68) + '┘')

  printEndpointResult(comparison.typescript, 'TypeScript API')
  console.log('')
  printEndpointResult(comparison.rust, 'Rust public-api')

  console.log('')
  console.log('  📊 Comparison:')

  const speedupIcon = comparison.speedup > 1.1 ? '🚀' : comparison.speedup < 0.9 ? '🐢' : '➡️'
  const speedupLabel = comparison.speedup > 1 ? 'Rust faster' : comparison.speedup < 1 ? 'TS faster' : 'Same'

  console.log(`     ${speedupIcon} Speedup:       ${comparison.speedup.toFixed(2)}x (${speedupLabel})`)
  console.log(`     P50 Speedup:    ${comparison.p50Speedup.toFixed(2)}x`)
  console.log(`     P95 Speedup:    ${comparison.p95Speedup.toFixed(2)}x`)
  console.log(`     Throughput:     ${comparison.throughputGain >= 0 ? '+' : ''}${comparison.throughputGain.toFixed(1)}%`)
}

function printSummary(result: TestSuiteResult): void {
  console.log('')
  console.log('╔' + '═'.repeat(68) + '╗')
  console.log('║' + '  OVERALL SUMMARY'.padEnd(68) + '║')
  console.log('╠' + '═'.repeat(68) + '╣')

  const { summary } = result

  // Winner determination
  let winner = 'TIE'
  let winnerIcon = '🤝'
  if (summary.rustWins > summary.tsWins) {
    winner = 'RUST'
    winnerIcon = '🦀'
  } else if (summary.tsWins > summary.rustWins) {
    winner = 'TYPESCRIPT'
    winnerIcon = '📘'
  }

  console.log('║' + `  ${winnerIcon} Winner: ${winner}`.padEnd(68) + '║')
  console.log('║' + `     Rust wins: ${summary.rustWins} | TS wins: ${summary.tsWins} | Ties: ${summary.ties}`.padEnd(68) + '║')
  console.log('╠' + '─'.repeat(68) + '╣')
  console.log('║' + `  Average Speedup:       ${summary.avgSpeedup.toFixed(2)}x`.padEnd(68) + '║')
  console.log('║' + `  Average P50 Speedup:   ${summary.avgP50Speedup.toFixed(2)}x`.padEnd(68) + '║')
  console.log('║' + `  Average P95 Speedup:   ${summary.avgP95Speedup.toFixed(2)}x`.padEnd(68) + '║')
  console.log('║' + `  Avg Throughput Gain:   ${summary.avgThroughputGain >= 0 ? '+' : ''}${summary.avgThroughputGain.toFixed(1)}%`.padEnd(68) + '║')
  console.log('╚' + '═'.repeat(68) + '╝')

  // Performance insights
  console.log('')
  console.log('💡 Key Insights:')

  if (summary.avgSpeedup > 1.5) {
    console.log('   • Rust worker shows significant performance advantage')
    console.log('   • Consider routing all public API traffic through Rust')
  } else if (summary.avgSpeedup > 1.1) {
    console.log('   • Rust worker shows moderate performance advantage')
    console.log('   • Useful for high-traffic public endpoints')
  } else if (summary.avgSpeedup < 0.9) {
    console.log('   • TypeScript API is currently faster')
    console.log('   • Review Rust worker implementation for optimization opportunities')
  } else {
    console.log('   • Both implementations perform similarly')
    console.log('   • Choose based on other factors (maintainability, features)')
  }

  if (summary.avgP95Speedup > summary.avgSpeedup) {
    console.log('   • Rust shows better tail latency (P95) than average')
    console.log('   • Indicates more consistent performance under load')
  }

  console.log('')
}

function saveResults(result: TestSuiteResult): void {
  const outputPath = resolve(process.cwd(), 'docs/why-rust-benchmark.json')
  try {
    writeFileSync(outputPath, JSON.stringify(result, null, 2))
    console.log(`📁 Results saved to: ${outputPath}`)
  } catch (error) {
    console.error(`❌ Failed to save results: ${error}`)
  }
}

// ============================================================================
// Main Test Suite
// ============================================================================

async function runTestSuite(config: TestConfig): Promise<TestSuiteResult> {
  const urls = loadUrlsFromEnv()
  const comparisons: ComparisonResult[] = []

  // Determine URLs based on environment
  let tsUrl: string
  let rustUrl: string

  switch (config.environment) {
    case 'local':
      tsUrl = urls.local
      rustUrl = urls.rust
      break
    case 'preview':
      if (!urls.preview) {
        throw new Error('Preview URL not available')
      }
      // In preview/production, same URL but Rust handles /api/public/* routes
      tsUrl = urls.preview
      rustUrl = urls.preview
      break
    case 'production':
      if (!urls.production) {
        throw new Error('Production URL not available - check API_DOMAIN in .env')
      }
      // In production, same URL but Rust handles /api/public/* routes
      tsUrl = urls.production
      rustUrl = urls.production
      break
  }

  // For local environment, we test against different ports
  // For preview/production, we test the same URL (routes determine worker)
  const isLocalTest = config.environment === 'local'

  // =========================================================================
  // Test 1: /api/public/tables
  // =========================================================================
  console.log('🔬 Test 1: /api/public/tables')
  console.log('   Warming up...')

  if (isLocalTest) {
    // Local: warmup both workers separately
    await runWarmup(tsUrl, '/api/public/tables', config.token, config.warmup)
    await runWarmup(rustUrl, '/api/public/tables', config.token, config.warmup)
  } else {
    // Remote: same URL for both (route determines worker)
    await runWarmup(tsUrl, '/api/public/tables', config.token, config.warmup)
  }

  console.log('   Testing TypeScript...')
  const tablesTs = await runEndpointTest(
    tsUrl,
    '/api/public/tables',
    'typescript',
    config
  )

  console.log('   Testing Rust...')
  const tablesRust = await runEndpointTest(
    isLocalTest ? rustUrl : tsUrl, // In remote, same URL but route goes to Rust
    '/api/public/tables',
    'rust',
    config
  )

  comparisons.push(createComparison('/api/public/tables', tablesTs, tablesRust))

  // =========================================================================
  // Test 2: /api/public/records (requires table ID)
  // =========================================================================
  let tableId = config.tableId
  if (!tableId) {
    console.log('')
    console.log('🔍 Detecting public table for records test...')
    tableId = await detectPublicTableId(
      isLocalTest ? rustUrl : tsUrl,
      config.token
    )
  }

  if (tableId) {
    console.log(`   Using table: ${tableId}`)
    console.log('')
    console.log('🔬 Test 2: /api/public/records')
    console.log('   Warming up...')

    const recordsEndpoint = `/api/public/tables/${tableId}/records`

    if (isLocalTest) {
      await runWarmup(tsUrl, recordsEndpoint, config.token, config.warmup)
      await runWarmup(rustUrl, recordsEndpoint, config.token, config.warmup)
    } else {
      await runWarmup(tsUrl, recordsEndpoint, config.token, config.warmup)
    }

    console.log('   Testing TypeScript...')
    const recordsTs = await runEndpointTest(
      tsUrl,
      recordsEndpoint,
      'typescript',
      config
    )

    console.log('   Testing Rust...')
    const recordsRust = await runEndpointTest(
      isLocalTest ? rustUrl : tsUrl,
      recordsEndpoint,
      'rust',
      config
    )

    comparisons.push(createComparison(recordsEndpoint, recordsTs, recordsRust))
  } else {
    console.log('')
    console.log('⚠️  No public table found - skipping records test')
    console.log('   Create a public table or use --table-id=xxx')
  }

  // =========================================================================
  // Calculate Summary
  // =========================================================================
  const speedups = comparisons.map(c => c.speedup)
  const p50Speedups = comparisons.map(c => c.p50Speedup)
  const p95Speedups = comparisons.map(c => c.p95Speedup)
  const throughputGains = comparisons.map(c => c.throughputGain)

  let rustWins = 0
  let tsWins = 0
  let ties = 0

  for (const c of comparisons) {
    if (c.speedup > 1.1) rustWins++
    else if (c.speedup < 0.9) tsWins++
    else ties++
  }

  return {
    timestamp: new Date().toISOString(),
    environment: config.environment,
    config: {
      requests: config.requests,
      concurrency: config.concurrency,
      warmup: config.warmup
    },
    comparisons,
    summary: {
      avgSpeedup: speedups.reduce((a, b) => a + b, 0) / speedups.length || 1,
      avgP50Speedup: p50Speedups.reduce((a, b) => a + b, 0) / p50Speedups.length || 1,
      avgP95Speedup: p95Speedups.reduce((a, b) => a + b, 0) / p95Speedups.length || 1,
      avgThroughputGain: throughputGains.reduce((a, b) => a + b, 0) / throughputGains.length || 0,
      rustWins,
      tsWins,
      ties
    }
  }
}

// ============================================================================
// Main Entry Point
// ============================================================================

async function main(): Promise<void> {
  const config = parseArgs()

  if (!config.token) {
    console.log('⚠️  No auth token found. Set ADMIN_ACCESS_TOKEN in .dev.vars or use --token=xxx')
    console.log('')
  }

  // Production warning
  if (config.environment === 'production') {
    console.log('🚨 WARNING: Testing against PRODUCTION!')
    console.log('   Press Ctrl+C within 5 seconds to cancel...')
    await new Promise(resolve => setTimeout(resolve, 5000))
  }

  printBanner(config)

  try {
    const result = await runTestSuite(config)

    if (config.json) {
      console.log(JSON.stringify(result, null, 2))
    } else {
      for (const comparison of result.comparisons) {
        printComparison(comparison)
      }
      printSummary(result)
    }

    if (config.save) {
      saveResults(result)
    }
  } catch (error) {
    console.error('❌ A/B test failed:', error)
    process.exit(1)
  }
}

main()
