#!/usr/bin/env node

/**
 * Full-Stack Development Script
 * Runs both backend and frontend simultaneously
 * 
 * Usage: node scripts/dev-fullstack.js <environment>
 * Environments: local, preview
 */

import { spawn } from 'child_process';
import { readFileSync } from 'fs';

// Environment configurations
const ENVIRONMENTS = {
  local: {
    backendCmd: 'npm run dev:local',
    frontendCmd: 'cd frontend && npm run dev',
    description: 'Local Development (local D1 + local frontend)'
  },
  preview: {
    backendCmd: 'npm run dev:preview', 
    frontendCmd: 'cd frontend && npm run dev',
    description: 'Preview Development (remote preview D1 + local frontend)'
  }
};

const envArg = process.argv[2];
if (!envArg || !ENVIRONMENTS[envArg]) {
  console.error('❌ Usage: node scripts/dev-fullstack.js <environment>');
  console.error('   Available environments: local, preview');
  console.error('');
  console.error('   local:   Backend with local D1 + Frontend');
  console.error('   preview: Backend with remote preview D1 + Frontend');
  process.exit(1);
}

const config = ENVIRONMENTS[envArg];

// Kill any existing processes on our ports
function killExistingProcesses() {
  console.log('🔄 Checking for existing processes on ports 8787 and 5173...');
  
  try {
    // Kill processes on port 8787 (backend)
    try {
      const backendPids = spawn('lsof', ['-ti:8787'], { stdio: 'pipe' });
      backendPids.stdout.on('data', (data) => {
        const pids = data.toString().trim().split('\n').filter(pid => pid);
        pids.forEach(pid => {
          console.log(`   Killing backend process ${pid} on port 8787`);
          spawn('kill', ['-9', pid]);
        });
      });
    } catch (e) {
      // Port not in use
    }
    
    // Kill processes on port 5173 (frontend)
    try {
      const frontendPids = spawn('lsof', ['-ti:5173'], { stdio: 'pipe' });
      frontendPids.stdout.on('data', (data) => {
        const pids = data.toString().trim().split('\n').filter(pid => pid);
        pids.forEach(pid => {
          console.log(`   Killing frontend process ${pid} on port 5173`);
          spawn('kill', ['-9', pid]);
        });
      });
    } catch (e) {
      // Port not in use
    }
    
    // Wait a moment for processes to die
    setTimeout(startServices, 1000);
  } catch (error) {
    console.log('   No existing processes found');
    startServices();
  }
}

// Start both services
function startServices() {
  console.log(`🚀 Starting ${config.description}...`);
  console.log('');
  console.log('📡 Backend will be available at: http://localhost:8787');
  console.log('🌐 Frontend will be available at: http://localhost:5173');
  console.log('');
  console.log('Press Ctrl+C to stop both services');
  console.log('─'.repeat(60));

  // Start backend
  console.log('🔧 Starting backend...');
  const backend = spawn('sh', ['-c', config.backendCmd], {
    stdio: ['inherit', 'pipe', 'pipe']
  });

  backend.stdout.on('data', (data) => {
    process.stdout.write(`[BACKEND] ${data}`);
  });

  backend.stderr.on('data', (data) => {
    process.stderr.write(`[BACKEND] ${data}`);
  });

  // Start frontend after a short delay
  setTimeout(() => {
    console.log('🎨 Starting frontend...');
    const frontend = spawn('sh', ['-c', config.frontendCmd], {
      stdio: ['inherit', 'pipe', 'pipe']
    });

    frontend.stdout.on('data', (data) => {
      process.stdout.write(`[FRONTEND] ${data}`);
    });

    frontend.stderr.on('data', (data) => {
      process.stderr.write(`[FRONTEND] ${data}`);
    });

    // Handle process cleanup
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down services...');
      backend.kill('SIGTERM');
      frontend.kill('SIGTERM');
      process.exit(0);
    });

    frontend.on('close', (code) => {
      if (code !== 0) {
        console.log(`❌ Frontend process exited with code ${code}`);
      }
      backend.kill('SIGTERM');
      process.exit(code);
    });

    backend.on('close', (code) => {
      if (code !== 0) {
        console.log(`❌ Backend process exited with code ${code}`);
      }
      frontend.kill('SIGTERM');
      process.exit(code);
    });
  }, 2000);
}

// Check if package.json exists
try {
  readFileSync('./package.json');
} catch (error) {
  console.error('❌ package.json not found. Make sure you\'re in the project root directory.');
  process.exit(1);
}

// Start the process
killExistingProcesses();