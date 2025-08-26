#!/usr/bin/env node

/**
 * Full-stack development server launcher
 * Runs both backend (Wrangler) and frontend (Next.js) concurrently
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const BACKEND_PORT = 8787;
const FRONTEND_PORT = 3000;
const BACKEND_PATH = __dirname;
const FRONTEND_PATH = join(__dirname, 'frontend');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
}

function logBackend(message) {
  log(`[BACKEND] ${message}`, 'blue');
}

function logFrontend(message) {
  log(`[FRONTEND] ${message}`, 'green');
}

function logError(message) {
  log(`[ERROR] ${message}`, 'red');
}

function logInfo(message) {
  log(`[INFO] ${message}`, 'cyan');
}

// Process management
const processes = [];

function cleanup() {
  logInfo('Shutting down services...');
  processes.forEach(proc => {
    if (proc && !proc.killed) {
      proc.kill('SIGTERM');
    }
  });
  process.exit(0);
}

// Handle graceful shutdown
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

async function startBackend() {
  return new Promise((resolve, reject) => {
    logBackend('Starting backend server...');
    
    const backendProcess = spawn('npm', ['run', 'dev', '--', '--port', BACKEND_PORT], {
      cwd: BACKEND_PATH,
      stdio: 'pipe'
    });

    processes.push(backendProcess);

    backendProcess.stdout.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        logBackend(output);
        if (output.includes('Ready on') || output.includes('listening on')) {
          resolve();
        }
      }
    });

    backendProcess.stderr.on('data', (data) => {
      const error = data.toString().trim();
      if (error && !error.includes('ExperimentalWarning')) {
        logBackend(`Error: ${error}`);
      }
    });

    backendProcess.on('error', (error) => {
      logError(`Backend process error: ${error.message}`);
      reject(error);
    });

    backendProcess.on('close', (code) => {
      if (code !== 0 && code !== null) {
        logError(`Backend process exited with code ${code}`);
        reject(new Error(`Backend process exited with code ${code}`));
      }
    });

    // Resolve after a reasonable timeout even if we don't see the expected output
    setTimeout(() => {
      logBackend('Backend should be starting up...');
      resolve();
    }, 5000);
  });
}

async function startFrontend() {
  return new Promise((resolve, reject) => {
    logFrontend('Starting frontend server...');
    
    const frontendProcess = spawn('npm', ['run', 'dev'], {
      cwd: FRONTEND_PATH,
      stdio: 'pipe',
      env: {
        ...process.env,
        NEXT_PUBLIC_API_BASE_URL: `http://localhost:${BACKEND_PORT}`,
        PORT: FRONTEND_PORT
      }
    });

    processes.push(frontendProcess);

    frontendProcess.stdout.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        logFrontend(output);
        if (output.includes('Ready in') || output.includes('started server on')) {
          resolve();
        }
      }
    });

    frontendProcess.stderr.on('data', (data) => {
      const error = data.toString().trim();
      if (error && !error.includes('ExperimentalWarning')) {
        logFrontend(`Error: ${error}`);
      }
    });

    frontendProcess.on('error', (error) => {
      logError(`Frontend process error: ${error.message}`);
      reject(error);
    });

    frontendProcess.on('close', (code) => {
      if (code !== 0 && code !== null) {
        logError(`Frontend process exited with code ${code}`);
        reject(new Error(`Frontend process exited with code ${code}`));
      }
    });

    // Resolve after a reasonable timeout
    setTimeout(() => {
      logFrontend('Frontend should be starting up...');
      resolve();
    }, 10000);
  });
}

async function main() {
  try {
    logInfo('🚀 Starting full-stack development environment...');
    logInfo(`Backend will run on: http://localhost:${BACKEND_PORT}`);
    logInfo(`Frontend will run on: http://localhost:${FRONTEND_PORT}`);
    logInfo('Press Ctrl+C to stop both servers');
    
    console.log(''); // Empty line for better readability
    
    // Start backend first
    await startBackend();
    
    // Small delay to ensure backend is fully ready
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Start frontend
    await startFrontend();
    
    logInfo('✅ Both services are running!');
    logInfo(`🔗 Frontend: http://localhost:${FRONTEND_PORT}`);
    logInfo(`🔗 Backend API: http://localhost:${BACKEND_PORT}`);
    logInfo(`🔗 Backend Health: http://localhost:${BACKEND_PORT}/health`);
    
    // Keep the process alive
    process.stdin.resume();
    
  } catch (error) {
    logError(`Failed to start development environment: ${error.message}`);
    cleanup();
    process.exit(1);
  }
}

main();
