#!/usr/bin/env node

/**
 * Full-Stack Development Script
 * Runs both backend and frontend simultaneously
 *
 * Usage: npm run dev          (local D1)
 *        npm run dev:remote   (remote preview D1)
 */

import { spawn, execSync } from 'child_process';
import { readFileSync } from 'fs';

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
  backend: 8787,
  frontend: 5173,
};

// Check for --remote flag
const isRemote = process.argv.includes('--remote');

// Environment configurations
const config = isRemote ? {
  backendCmd: 'npm run dev:backend:remote',
  frontendCmd: 'cd frontend && npm run dev:preview',
  description: 'Remote Development (preview D1 + remote KV frontend)',
  mode: 'Remote Preview D1'
} : {
  backendCmd: 'npm run dev:backend',
  frontendCmd: 'cd frontend && npm run dev',
  description: 'Local Development (local D1 + local frontend)',
  mode: 'Local D1'
};

// Update wrangler to latest version
function updateWrangler() {
  logStep('0', 'Updating wrangler to latest version');

  const directories = [
    { name: 'root', path: '.' },
    { name: 'frontend', path: './frontend' },
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

  await killPort(PORTS.backend, 'backend');
  await killPort(PORTS.frontend, 'frontend');

  // Wait for processes to die
  await new Promise(resolve => setTimeout(resolve, 1000));
  logSuccess('Ports cleared');
}

// Apply database migrations for local development
function applyMigrations() {
  logStep('4', 'Applying database migrations');
  try {
    execSync('npm run db:migrate', { stdio: 'inherit' });
    logSuccess('Migrations applied');
  } catch (error) {
    logWarning('Migration had issues, continuing anyway');
  }
}

// Start both services
function startServices() {
  logStep('5', 'Starting backend');

  const processes = [];
  let backendReady = false;
  let frontendReady = false;
  let bannerShown = false;

  function showReadyBanner() {
    if (backendReady && frontendReady && !bannerShown) {
      bannerShown = true;
      log('\n' + '═'.repeat(60), 'bright');
      log('  Store - Development Environment Ready!', 'green');
      log('═'.repeat(60), 'bright');
      log('');
      log(`  Frontend:  http://localhost:${PORTS.frontend}`, 'cyan');
      log(`  Backend:   http://localhost:${PORTS.backend}`, 'cyan');
      log('');
      log(`  Mode:      ${config.mode}`, 'dim');
      log('');
      log('═'.repeat(60), 'bright');
      log('  Press Ctrl+C to stop all services', 'yellow');
      log('═'.repeat(60) + '\n', 'bright');
    }
  }

  // Start backend
  log('  → Starting backend...', 'dim');
  const backend = spawn('sh', ['-c', config.backendCmd], {
    stdio: ['inherit', 'pipe', 'pipe']
  });

  backend.stdout.on('data', (data) => {
    const text = data.toString();
    if (text.includes('Ready') || text.includes('localhost')) {
      backendReady = true;
      showReadyBanner();
    }
    process.stdout.write(`${colors.blue}[BACKEND]${colors.reset} ${text}`);
  });

  backend.stderr.on('data', (data) => {
    process.stderr.write(`${colors.blue}[BACKEND]${colors.reset} ${data.toString()}`);
  });

  processes.push({ name: 'backend', process: backend });

  // Start frontend after a short delay
  setTimeout(() => {
    logStep('6', 'Starting frontend');
    log('  → Starting frontend...', 'dim');

    const frontend = spawn('sh', ['-c', config.frontendCmd], {
      stdio: ['inherit', 'pipe', 'pipe']
    });

    frontend.stdout.on('data', (data) => {
      const text = data.toString();
      if (text.includes('Ready') || text.includes('localhost')) {
        frontendReady = true;
        showReadyBanner();
      }
      process.stdout.write(`${colors.magenta}[FRONTEND]${colors.reset} ${text}`);
    });

    frontend.stderr.on('data', (data) => {
      process.stderr.write(`${colors.magenta}[FRONTEND]${colors.reset} ${data.toString()}`);
    });

    processes.push({ name: 'frontend', process: frontend });

    // Fallback: show banner after timeout if not detected
    setTimeout(() => {
      if (!bannerShown) {
        backendReady = true;
        frontendReady = true;
        showReadyBanner();
      }
    }, 8000);

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

  // Step 0: Update wrangler
  updateWrangler();

  // Step 1: Scan modules
  scanModules();

  // Step 2: Generate config (shows its own detailed output)
  generateConfig();

  // Step 3: Kill existing processes on required ports
  await killExistingProcesses();

  // Step 4: Apply database migrations
  applyMigrations();

  // Step 5-6: Start all workers
  startServices();
}

main();
