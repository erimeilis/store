#!/usr/bin/env tsx

/**
 * Wrangler Configuration Parser
 * Reads configuration from wrangler.toml files and provides environment-specific settings
 */

import { readFileSync } from 'fs';
import { loadOrGenerateTokens } from './token-manager';
import * as toml from '@iarna/toml';

interface WranglerConfig {
  backendConfig: any;
  frontendConfig: any;
}

interface EnvironmentConfig {
  // Database
  dbName: string;
  dbId: string;

  // Environment settings
  itemCount: number;
  useRemote: boolean;
  requiresConfirmation: boolean;
  clearWranglerState: boolean;
  description: string;

  // Generated tokens
  frontendToken: string;
  adminToken: string;

  // Domain configuration
  allowedDomains: string;
  apiUrl: string;
  allowedOrigins: string;
}

export function loadWranglerConfigs(): WranglerConfig {
  const backendToml = readFileSync('./wrangler.toml', 'utf8');
  const frontendToml = readFileSync('./frontend/wrangler.toml', 'utf8');

  return {
    backendConfig: toml.parse(backendToml),
    frontendConfig: toml.parse(frontendToml)
  };
}


export function getEnvironmentConfig(environment: string): EnvironmentConfig {
  const configs = loadWranglerConfigs();
  const { backendConfig, frontendConfig } = configs;

  // Determine the environment section to use
  let envSection: any;
  let frontendEnvSection: any;

  if (environment === 'local') {
    envSection = backendConfig.env?.local || {};
    frontendEnvSection = frontendConfig.env?.dev || {};
  } else if (environment === 'preview') {
    envSection = backendConfig.env?.preview || {};
    frontendEnvSection = frontendConfig.env?.preview || {};
  } else if (environment === 'production') {
    envSection = backendConfig.env?.production || backendConfig;
    frontendEnvSection = frontendConfig;
  } else {
    throw new Error(`Unknown environment: ${environment}`);
  }

  // Extract database configuration
  const d1Databases = envSection.d1_databases || backendConfig.d1_databases;
  const dbConfig = Array.isArray(d1Databases) ? d1Databases[0] : d1Databases;

  if (!dbConfig) {
    throw new Error(`No database configuration found for environment: ${environment}`);
  }

  // Extract API URL and allowed origins
  const apiUrl = envSection.vars?.API_URL || backendConfig.vars?.API_URL;
  const allowedOrigins = envSection.vars?.ALLOWED_ORIGINS || backendConfig.vars?.ALLOWED_ORIGINS;

  // Load or generate secure tokens for this environment
  const tokenSet = loadOrGenerateTokens(environment);
  const { frontendToken, adminToken } = tokenSet;

  // Parse allowed origins into domain format for tokens (strip protocol)
  const domains = allowedOrigins ? allowedOrigins.split(',').map((origin: string) => {
    const trimmed = origin.trim();
    // Strip protocol if present (https:// or http://)
    const match = trimmed.match(/^https?:\/\/(.+)$/);
    return match ? match[1] : trimmed;
  }) : ['localhost:*'];
  const allowedDomains = JSON.stringify(domains);

  // Environment-specific settings
  const itemCounts = {
    local: 10,
    preview: 100,
    production: 200
  };

  const descriptions = {
    local: 'Local Development Database (local D1 in .wrangler/state/)',
    preview: 'Preview Database (remote D1 on Cloudflare)',
    production: 'Production Database (remote D1 on Cloudflare)'
  };

  return {
    dbName: dbConfig.database_name,
    dbId: dbConfig.database_id,
    itemCount: itemCounts[environment] || 10,
    useRemote: environment !== 'local',
    requiresConfirmation: environment === 'production',
    clearWranglerState: environment === 'local',
    description: descriptions[environment] || `${environment} Database`,
    frontendToken,
    adminToken,
    allowedDomains,
    apiUrl: apiUrl || 'http://localhost:8787',
    allowedOrigins: allowedOrigins || 'http://localhost:5173'
  };
}

// Export for use in other scripts
export { WranglerConfig, EnvironmentConfig };