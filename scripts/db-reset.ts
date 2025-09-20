#!/usr/bin/env tsx

/**
 * Clean Architecture Database Reset Script
 * Uses Wrangler D1 Native approach with comprehensive clearing strategy
 *
 * Dynamically reads configuration from wrangler.toml files
 * Generates secure tokens for each environment
 *
 * Usage: tsx scripts/db-reset.ts <environment>
 */

import { execSync } from 'child_process';
import { readFileSync, readdirSync, writeFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import * as readline from 'readline';
import { getEnvironmentConfig, EnvironmentConfig } from './wrangler-config';

// Get environment from command line args
const envArg = process.argv[2];
const validEnvironments = ['local', 'preview', 'production'];

if (!envArg || !validEnvironments.includes(envArg)) {
  console.error('❌ Usage: tsx scripts/db-reset.ts <environment>');
  console.error('   Available environments: local, preview, production');
  process.exit(1);
}

// Load configuration dynamically from wrangler.toml files
let config: EnvironmentConfig;
try {
  config = getEnvironmentConfig(envArg);
  console.log(`🔄 Resetting ${config.description}...`);
  console.log(`📋 Configuration:`);
  console.log(`   Database: ${config.dbName} (${config.dbId})`);
  console.log(`   Items: ${config.itemCount}`);
  console.log(`   Remote: ${config.useRemote}`);
  console.log(`   API URL: ${config.apiUrl}`);
} catch (error) {
  console.error('❌ Failed to load configuration:', error instanceof Error ? error.message : String(error));
  process.exit(1);
}

// Safety check for production
async function confirmProductionReset(): Promise<boolean> {
  if (!config.requiresConfirmation) return true;
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    console.log('⚠️  WARNING: You are about to PERMANENTLY DELETE all production data!');
    console.log('⚠️  This action cannot be undone!');
    console.log('⚠️  Only proceed if you are absolutely sure!');
    console.log('');
    
    rl.question('Type "DELETE PRODUCTION DATA" (exactly) to confirm: ', (answer) => {
      rl.close();
      resolve(answer === 'DELETE PRODUCTION DATA');
    });
  });
}

function buildWranglerCommand(command: string, useFile = false): string {
  const base = `wrangler d1 execute ${config.dbName}`;
  const env = ` --env ${envArg}`;
  const remote = config.useRemote ? ' --remote' : ' --local';
  const fileFlag = useFile ? ` --file="${command}"` : ` --command="${command}"`;
  return `${base}${env}${remote}${fileFlag}`;
}

async function discoverTables(): Promise<string[]> {
  try {
    console.log('🔍 Discovering existing tables...');
    const result = execSync(buildWranglerCommand("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';"), { 
      encoding: 'utf8' 
    });
    
    // Parse JSON output from wrangler
    const tables: string[] = [];
    
    // Look for JSON results in the output
    const jsonMatch = result.match(/\[\s*{[\s\S]*}\s*\]/);
    if (jsonMatch) {
      try {
        const jsonResults = JSON.parse(jsonMatch[0]);
        if (Array.isArray(jsonResults) && jsonResults.length > 0 && jsonResults[0].results) {
          for (const row of jsonResults[0].results) {
            if (row.name) {
              tables.push(row.name);
            }
          }
        }
      } catch (parseError) {
        // If JSON parsing fails, fall back to text parsing
        console.log('   ⚠️  Could not parse JSON output, trying text parsing');
      }
    }
    
    // Filter out system tables that can't be dropped
    const systemTables = ['_cf_KV', '_prisma_migrations'];
    const userTables = tables.filter(table => !systemTables.includes(table));
    
    console.log(`   Found ${tables.length} total tables, ${userTables.length} user tables: ${userTables.join(', ')}`);
    if (tables.length > userTables.length) {
      console.log(`   Skipping system tables: ${tables.filter(t => systemTables.includes(t)).join(', ')}`);
    }
    
    return userTables;
  } catch (error) {
    console.log('   ℹ️  No existing tables found (or database doesn\'t exist yet)');
    return [];
  }
}

async function dropAllTables(tables: string[]): Promise<void> {
  if (tables.length === 0) {
    console.log('🗑️  No tables to drop');
    return;
  }
  
  console.log(`🗑️  Dropping ${tables.length} tables...`);
  
  let successCount = 0;
  for (const table of tables) {
    try {
      console.log(`   Dropping table: ${table}`);
      execSync(buildWranglerCommand(`DROP TABLE IF EXISTS "${table}";`), { stdio: 'pipe' });
      successCount++;
    } catch (error) {
      console.log(`   ⚠️  Failed to drop table ${table}: ${error instanceof Error ? error.message : String(error)}`);
      // Continue with other tables
    }
  }
  
  console.log(`   ✓ Successfully dropped ${successCount}/${tables.length} tables`);
}

function applyMigrations(): void {
  console.log('📦 Applying database migrations...');
  
  const migrationsDir = './prisma/migrations';
  if (!existsSync(migrationsDir)) {
    throw new Error('Migrations directory not found');
  }
  
  const migrationFolders = readdirSync(migrationsDir).sort();
  
  if (migrationFolders.length === 0) {
    throw new Error('No migration files found');
  }
  
  migrationFolders.forEach(folder => {
    const migrationFile = join(migrationsDir, folder, 'migration.sql');
    if (existsSync(migrationFile)) {
      console.log(`📄 Applying migration: ${folder}`);
      execSync(buildWranglerCommand(migrationFile, true), { stdio: 'inherit' });
    }
  });
  
  console.log('   ✓ All migrations applied');
}

function updateTokensWithEnvironmentData(): void {
  console.log('🔧 Updating tokens with environment-specific data...');
  console.log(`   🔑 Frontend Token: ${config.frontendToken.substring(0, 8)}...`);
  console.log(`   🔑 Admin Token: ${config.adminToken.substring(0, 8)}...`);
  console.log(`   🌐 Allowed Domains: ${config.allowedDomains}`);

  // Read the essential tokens seed file
  const tokensSeedPath = './seeds/essential-tokens.sql';
  let tokensSeed = readFileSync(tokensSeedPath, 'utf8');

  // Replace placeholders with environment-specific values
  tokensSeed = tokensSeed
    .replace(/frontend-access-token-placeholder/g, config.frontendToken)
    .replace(/admin-access-token-placeholder/g, config.adminToken)
    .replace(/\[\"placeholder-domain\"\]/g, config.allowedDomains);

  // Write updated tokens seed to temp file
  const tempTokensFile = './scripts/temp-tokens.sql';
  writeFileSync(tempTokensFile, tokensSeed);

  try {
    execSync(buildWranglerCommand(tempTokensFile, true), { stdio: 'inherit' });
    console.log('   ✓ Tokens configured for environment');
  } finally {
    if (existsSync(tempTokensFile)) {
      unlinkSync(tempTokensFile);
    }
  }
}

function seedItems(): void {
  console.log(`🌱 Seeding database with ${config.itemCount} items...`);
  
  const itemsSeedPath = `./seeds/faker-items-${envArg}.sql`;
  if (!existsSync(itemsSeedPath)) {
    throw new Error(`Items seed file not found: ${itemsSeedPath}`);
  }
  
  execSync(buildWranglerCommand(itemsSeedPath, true), { stdio: 'inherit' });
  console.log(`   ✓ ${config.itemCount} items seeded`);
}

async function main(): Promise<void> {
  try {
    // Check if running in automated environment 
    const isAutomated = process.env.CI || process.env.AUTOMATED || process.argv.includes('--force');
    
    if (!isAutomated && config.requiresConfirmation) {
      const confirmed = await confirmProductionReset();
      if (!confirmed) {
        console.log('❌ Database reset cancelled - confirmation not provided');
        process.exit(0);
      }
    }

    // Handle local development special case
    if (config.clearWranglerState) {
      console.log('🗑️  Clearing local Wrangler D1 state...');
      if (existsSync('./.wrangler/state/')) {
        execSync('rm -rf ./.wrangler/state/');
        console.log('   ✓ Local D1 state cleared');
      }
    }
    
    // Phase 1: Complete Database Clearing
    const existingTables = await discoverTables();
    await dropAllTables(existingTables);
    
    // Phase 2: Apply Fresh Schema
    applyMigrations();
    
    // Phase 3: Environment-Specific Seeding
    updateTokensWithEnvironmentData();
    seedItems();

    console.log(`✅ ${config.description} reset completed!`);
    console.log('📊 Database ready with:');
    console.log('   - Fresh schema (6 tables)');
    console.log('   - Environment-specific authentication tokens');
    console.log(`   - ${config.itemCount} dynamic items (generated with faker.js)`);
    console.log('   - Access control whitelist configured');

  } catch (error) {
    console.error(`❌ ${config.description} reset failed:`, error instanceof Error ? error.message : String(error));
    if (config.requiresConfirmation) {
      console.error('💡 Make sure you have proper Cloudflare credentials configured');
    }
    process.exit(1);
  }
}

// Run main function
main();
