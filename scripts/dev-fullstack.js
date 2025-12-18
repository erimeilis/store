#!/usr/bin/env node

/**
 * Full-Stack Development Script
 * Runs all three workers simultaneously with shared database
 *
 * Usage: npm run dev          (local D1)
 *        npm run dev:remote   (remote preview D1)
 *
 * Architecture:
 * - API Worker (TypeScript): http://localhost:8787 - Main backend API
 * - Public API Worker (Rust): http://localhost:8788 - Public read-only API
 * - Admin Worker (TypeScript): http://localhost:5173 - Admin UI
 */

import { spawn, execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${colors.bright}[${step}]${colors.reset} ${message}`, 'cyan');
}

function logSuccess(message) {
  log(`  ✓ ${message}`, 'green');
}

function logWarning(message) {
  log(`  ⚠ ${message}`, 'yellow');
}

const PORTS = {
  api: 8787,
  publicApi: 8788,
  admin: 5173,
  // Wrangler inspector/debugger ports
  inspector1: 9229,
  inspector2: 9230,
};

// Shared persistence path for local D1 state (ensures all workers share same database)
const PERSIST_PATH = '.wrangler-shared';

// Check for --remote flag
const isRemote = process.argv.includes('--remote');

// Environment configurations
const config = isRemote ? {
  apiCmd: `wrangler dev --config api/wrangler.toml --env preview --remote --port ${PORTS.api}`,
  publicApiCmd: `wrangler dev --config public-api/wrangler.toml --env preview --remote --port ${PORTS.publicApi}`,
  adminCmd: 'npm run dev:preview',
  adminCwd: './admin',
  description: 'Remote Development (preview D1 + remote KV)',
  mode: 'Remote Preview D1'
} : {
  apiCmd: `wrangler dev --config api/wrangler.toml --env local --port ${PORTS.api} --persist-to ${PERSIST_PATH}`,
  publicApiCmd: `wrangler dev --config public-api/wrangler.toml --env local --port ${PORTS.publicApi} --persist-to ${PERSIST_PATH}`,
  adminCmd: 'npm run dev',
  adminCwd: './admin',
  description: 'Local Development (local D1)',
  mode: 'Local D1'
};

// Update wrangler to latest version in all worker directories
async function updateWrangler() {
  logStep('0', 'Updating wrangler to latest version');

  const directories = [
    { name: 'root', path: '.' },
    { name: 'api', path: './api' },
    { name: 'admin', path: './admin' },
    { name: 'public-api', path: './public-api' },
  ];

  for (const dir of directories) {
    try {
      execSync('npm update wrangler', { cwd: dir.path, stdio: 'pipe' });
      logSuccess(`Updated wrangler in ${dir.name}`);
    } catch (error) {
      logWarning(`Failed to update wrangler in ${dir.name}`);
    }
  }
}

// Scan modules
function scanModules() {
  logStep('1', 'Scanning modules');
  try {
    execSync('npx tsx scripts/scan-modules.ts', { stdio: 'inherit' });
    logSuccess('Modules scanned');
  } catch (error) {
    logWarning('Module scan had issues, continuing anyway');
  }
}

// Generate config (shows its own pretty output)
function generateConfig() {
  logStep('2', 'Generating configuration');
  try {
    const previewFlag = isRemote ? ' --preview' : '';
    execSync(`node scripts/generate-config.js --dev${previewFlag}`, { stdio: 'inherit' });
  } catch (error) {
    logWarning('Config generation had issues, continuing anyway');
  }
}

// Kill any existing processes on our ports
async function killExistingProcesses() {
  logStep('3', 'Checking for existing processes');

  const killPort = (port, name) => {
    return new Promise((resolve) => {
      try {
        const lsofProcess = spawn('lsof', [`-ti:${port}`], { stdio: 'pipe' });
        let pids = '';

        lsofProcess.stdout.on('data', (data) => {
          pids += data.toString();
        });

        lsofProcess.on('close', () => {
          const pidList = pids.trim().split('\n').filter(pid => pid);
          if (pidList.length > 0) {
            pidList.forEach(pid => {
              log(`  → Killed ${name} (PID ${pid}) on port ${port}`, 'yellow');
              try {
                spawn('kill', ['-9', pid], { stdio: 'inherit' });
              } catch (e) {
                // Process might already be dead
              }
            });
          }
          resolve();
        });

        lsofProcess.on('error', () => {
          resolve(); // Port not in use, continue
        });
      } catch (e) {
        resolve(); // Port not in use, continue
      }
    });
  };

  await killPort(PORTS.api, 'api');
  await killPort(PORTS.publicApi, 'public-api');
  await killPort(PORTS.admin, 'admin');
  await killPort(PORTS.inspector1, 'inspector');
  await killPort(PORTS.inspector2, 'inspector');

  // Wait for processes to die
  await new Promise(resolve => setTimeout(resolve, 1500));
  logSuccess('Ports cleared');
}

// Apply database migrations for local development
function applyMigrations() {
  logStep('4', 'Applying database migrations');
  try {
    // Apply migrations using the api wrangler.toml config with shared persistence
    // Must use --env local to pick up the migrations_dir from env.local section
    if (isRemote) {
      execSync('npm run db:migrate:preview', { stdio: 'inherit' });
    } else {
      execSync(`wrangler d1 migrations apply store-database-preview --env local --local --persist-to ${PERSIST_PATH} --config api/wrangler.toml`, { stdio: 'inherit' });
    }
    logSuccess('Migrations applied');
  } catch (error) {
    logWarning('Migration had issues, continuing anyway');
  }
}

// Build Rust public-api worker
function buildPublicApi() {
  logStep('5', 'Building public-api (Rust)');
  try {
    execSync('cd public-api && worker-build --release', { stdio: 'inherit' });
    logSuccess('Rust worker built');
  } catch (error) {
    logWarning('Public-api build failed - public-api will not be available');
  }
}

// Start all services
function startServices() {
  logStep('6', 'Starting development servers');

  const processes = [];
  let apiReady = false;
  let publicApiReady = false;
  let adminReady = false;
  let bannerShown = false;

  function showReadyBanner() {
    if (apiReady && publicApiReady && adminReady && !bannerShown) {
      bannerShown = true;
      log('\n' + '═'.repeat(60), 'bright');
      log('  Store - Development Environment Ready!', 'green');
      log('═'.repeat(60), 'bright');
      log('');
      log(`  Admin UI:     http://localhost:${PORTS.admin}`, 'cyan');
      log(`  API:          http://localhost:${PORTS.api}`, 'cyan');
      log(`  Public API:   http://localhost:${PORTS.publicApi}  (Rust)`, 'cyan');
      log('');
      log(`  Database:     ${isRemote ? 'Remote Preview D1' : `./${PERSIST_PATH}/ (local D1)`}`, 'dim');
      log(`  Mode:         ${config.mode}`, 'dim');
      log('');
      log('═'.repeat(60), 'bright');
      log('  Press Ctrl+C to stop all services', 'yellow');
      log('═'.repeat(60) + '\n', 'bright');
    }
  }

  // Start API worker
  log('  → Starting API worker...', 'dim');
  const api = spawn('sh', ['-c', config.apiCmd], {
    stdio: ['inherit', 'pipe', 'pipe']
  });

  api.stdout.on('data', (data) => {
    const text = data.toString();
    if (text.includes('Ready') || text.includes('localhost')) {
      apiReady = true;
      showReadyBanner();
    }
    process.stdout.write(`${colors.blue}[API]${colors.reset} ${text}`);
  });

  api.stderr.on('data', (data) => {
    process.stderr.write(`${colors.blue}[API]${colors.reset} ${data.toString()}`);
  });

  processes.push({ name: 'api', process: api });

  // Start public-api (Rust worker) after a short delay
  setTimeout(() => {
    log('  → Starting public-api worker...', 'dim');

    const publicApi = spawn('sh', ['-c', config.publicApiCmd], {
      stdio: ['inherit', 'pipe', 'pipe']
    });

    publicApi.stdout.on('data', (data) => {
      const text = data.toString();
      if (text.includes('Ready') || text.includes('localhost')) {
        publicApiReady = true;
        showReadyBanner();
      }
      process.stdout.write(`${colors.yellow}[PUBLIC-API]${colors.reset} ${text}`);
    });

    publicApi.stderr.on('data', (data) => {
      process.stderr.write(`${colors.yellow}[PUBLIC-API]${colors.reset} ${data.toString()}`);
    });

    processes.push({ name: 'public-api', process: publicApi });
  }, 1000);

  // Start admin after public-api
  setTimeout(() => {
    log('  → Starting admin worker...', 'dim');

    const admin = spawn('npm', ['run', config.adminCmd.replace('npm run ', '')], {
      cwd: config.adminCwd,
      stdio: ['inherit', 'pipe', 'pipe'],
      shell: true
    });

    admin.stdout.on('data', (data) => {
      const text = data.toString();
      if (text.includes('Ready') || text.includes('localhost')) {
        adminReady = true;
        showReadyBanner();
      }
      process.stdout.write(`${colors.magenta}[ADMIN]${colors.reset} ${text}`);
    });

    admin.stderr.on('data', (data) => {
      process.stderr.write(`${colors.magenta}[ADMIN]${colors.reset} ${data.toString()}`);
    });

    processes.push({ name: 'admin', process: admin });

    // Fallback: show banner after timeout if not detected
    setTimeout(() => {
      if (!bannerShown) {
        apiReady = true;
        publicApiReady = true;
        adminReady = true;
        showReadyBanner();
      }
    }, 15000);

    // Handle process cleanup
    process.on('SIGINT', () => {
      log('\n' + '─'.repeat(60), 'dim');
      log('  Shutting down...', 'yellow');
      processes.forEach(({ name, process: proc }) => {
        log(`  → Stopping ${name}`, 'dim');
        proc.kill('SIGTERM');
      });
      setTimeout(() => process.exit(0), 1000);
    });

    // If any process exits, shut down all
    processes.forEach(({ name, process: proc }) => {
      proc.on('close', (code) => {
        if (code !== 0 && code !== null) {
          log(`\n  ✗ ${name} exited with code ${code}`, 'red');
        }
        // Kill all other processes
        processes.forEach(({ name: otherName, process: otherProc }) => {
          if (otherName !== name) {
            otherProc.kill('SIGTERM');
          }
        });
        setTimeout(() => process.exit(code || 0), 500);
      });
    });
  }, 2000);
}

// Check if we're in the right directory
try {
  const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));
  if (pkg.name !== 'store-api') {
    throw new Error('Wrong directory');
  }
} catch (error) {
  log('✗ This script must be run from the project root directory.', 'red');
  log(`  Current directory: ${process.cwd()}`, 'dim');
  process.exit(1);
}

// Main execution flow
async function main() {
  log('\n' + '═'.repeat(60), 'bright');
  log('  Store - Development Environment', 'cyan');
  log('═'.repeat(60) + '\n', 'bright');

  log(`  Environment: ${config.description}`, 'dim');

  // Step 0: Update wrangler to latest version
  await updateWrangler();

  // Step 1: Scan modules
  scanModules();

  // Step 2: Generate config (shows its own detailed output)
  generateConfig();

  // Step 3: Kill existing processes on required ports
  await killExistingProcesses();

  // Step 4: Apply database migrations
  applyMigrations();

  // Step 5: Build Rust public-api worker
  buildPublicApi();

  // Step 6: Start all workers (api, public-api, admin)
  startServices();
}

main();
