#!/usr/bin/env tsx

/**
 * Token Manager
 * Manages environment-specific tokens with persistence
 * Generates new tokens or loads existing ones from environment-specific storage
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { randomBytes } from 'crypto';

interface TokenSet {
  frontendToken: string;
  adminToken: string;
  generatedAt: string;
  environment: string;
}

const TOKEN_DIR = './scripts/tokens';

export function generateSecureToken(): string {
  return randomBytes(32).toString('hex');
}

function getTokenFilePath(environment: string): string {
  return `${TOKEN_DIR}/${environment}-tokens.json`;
}

export function loadOrGenerateTokens(environment: string, forceRegenerate = false): TokenSet {
  const tokenFilePath = getTokenFilePath(environment);

  // Check if tokens already exist for this environment (and not forcing regeneration)
  if (!forceRegenerate && existsSync(tokenFilePath)) {
    try {
      const existing = JSON.parse(readFileSync(tokenFilePath, 'utf8'));
      console.log(`🔑 Loaded existing tokens for ${environment} (generated: ${existing.generatedAt})`);
      return existing;
    } catch (error) {
      console.log(`⚠️  Failed to load existing tokens for ${environment}, generating new ones`);
    }
  }

  if (forceRegenerate) {
    console.log(`🔄 Force regenerating tokens for ${environment}...`);
  }

  // Generate new tokens
  const tokenSet: TokenSet = {
    frontendToken: generateSecureToken(),
    adminToken: generateSecureToken(),
    generatedAt: new Date().toISOString(),
    environment
  };

  // Save tokens to file
  try {
    // Ensure directory exists
    if (!existsSync(TOKEN_DIR)) {
      mkdirSync(TOKEN_DIR, { recursive: true });
    }

    writeFileSync(tokenFilePath, JSON.stringify(tokenSet, null, 2));
    console.log(`🔑 Generated new tokens for ${environment} and saved to ${tokenFilePath}`);
  } catch (error) {
    console.log(`⚠️  Failed to save tokens to ${tokenFilePath}:`, error instanceof Error ? error.message : String(error));
  }

  return tokenSet;
}

export function saveTokensToEnvFile(tokenSet: TokenSet): void {
  const { environment, frontendToken } = tokenSet;

  // For local environment, we can save to .dev.vars
  if (environment === 'local') {
    const devVarsPath = './.dev.vars';
    const frontendDevVarsPath = './frontend/.dev.vars';

    // Update backend .dev.vars
    updateEnvFile(devVarsPath, 'FRONTEND_ACCESS_TOKEN', frontendToken);

    // Update frontend .dev.vars
    updateEnvFile(frontendDevVarsPath, 'FRONTEND_ACCESS_TOKEN', frontendToken);

    console.log(`💾 Updated .dev.vars files with frontend token`);
  } else {
    console.log(`ℹ️  For ${environment} environment, tokens should be set as Wrangler secrets:`);
    console.log(`   wrangler secret put FRONTEND_ACCESS_TOKEN --env ${environment}`);
    console.log(`   # Use token: ${frontendToken}`);
  }
}

/**
 * Update .dev.vars files with tokens for local development
 * Called by db-reset.ts after regenerating tokens
 */
export function saveTokensToDevVars(environment: string, frontendToken: string, adminToken: string): void {
  if (environment !== 'local') {
    console.log(`ℹ️  For ${environment} environment, run deploy to upload secrets to Cloudflare`);
    return;
  }

  const devVarsPath = './.dev.vars';
  const frontendDevVarsPath = './frontend/.dev.vars';

  // Update backend .dev.vars with both tokens
  updateEnvFile(devVarsPath, 'FRONTEND_ACCESS_TOKEN', frontendToken);
  updateEnvFile(devVarsPath, 'ADMIN_ACCESS_TOKEN', adminToken);

  // Update frontend .dev.vars
  updateEnvFile(frontendDevVarsPath, 'FRONTEND_ACCESS_TOKEN', frontendToken);

  console.log(`💾 Updated .dev.vars files with new tokens`);
}

function updateEnvFile(filePath: string, key: string, value: string): void {
  let content = '';

  if (existsSync(filePath)) {
    content = readFileSync(filePath, 'utf8');
  }

  const lines = content.split('\n');
  const keyIndex = lines.findIndex(line => line.startsWith(`${key}=`));

  if (keyIndex >= 0) {
    lines[keyIndex] = `${key}=${value}`;
  } else {
    lines.push(`${key}=${value}`);
  }

  writeFileSync(filePath, lines.filter(line => line.trim()).join('\n') + '\n');
}

// CLI usage
const isRunDirectly = process.argv[1]?.endsWith('token-manager.ts');
if (isRunDirectly) {
  const environment = process.argv[2];

  if (!environment) {
    console.error('Usage: tsx scripts/token-manager.ts <environment>');
    process.exit(1);
  }

  const tokens = loadOrGenerateTokens(environment);
  saveTokensToEnvFile(tokens);

  console.log('\n🔑 Token Summary:');
  console.log(`Environment: ${tokens.environment}`);
  console.log(`Frontend Token: ${tokens.frontendToken.substring(0, 16)}...`);
  console.log(`Admin Token: ${tokens.adminToken.substring(0, 16)}...`);
  console.log(`Generated: ${tokens.generatedAt}`);
}