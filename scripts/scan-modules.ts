#!/usr/bin/env tsx
/**
 * Scan /modules directory for JSON module files and generate modules-manifest.json
 * Run this before starting dev server or deploying
 *
 * Modules are pure JSON - no TypeScript compilation needed
 * Structure: modules/moduleName.json (flat files, no folders)
 */

import * as fs from 'node:fs'
import * as path from 'node:path'

interface ScannedModule {
  path: string
  manifest: ModuleManifest
}

interface ModuleManifest {
  id: string
  name: string
  version: string
  description?: string
  icon?: string
  author?: { name: string; email?: string; url?: string }
  license?: string
  engines?: { store: string; moduleApi: string }
  settings?: Array<{
    id: string
    type: string
    displayName: string
    description?: string
    default?: unknown
    required?: boolean
    options?: Array<{ value: string; label: string }>
  }>
  trust?: { official?: boolean; verified?: boolean }
  columnTypes?: unknown[]
  tableGenerators?: unknown[]
}

const ROOT_DIR = path.resolve(import.meta.dirname, '..')
const MODULES_DIR = path.join(ROOT_DIR, 'modules')
const OUTPUT_FILE = path.join(ROOT_DIR, 'api/src/data/modules-manifest.json')

function scanModules(): ScannedModule[] {
  if (!fs.existsSync(MODULES_DIR)) {
    console.log('⚠️  No modules directory found')
    return []
  }

  const entries = fs.readdirSync(MODULES_DIR, { withFileTypes: true })
  const modules: ScannedModule[] = []

  for (const entry of entries) {
    // Only process .json files (flat structure)
    if (!entry.isFile() || !entry.name.endsWith('.json')) continue

    const manifestPath = path.join(MODULES_DIR, entry.name)

    try {
      const manifestContent = fs.readFileSync(manifestPath, 'utf-8')
      const manifest = JSON.parse(manifestContent) as ModuleManifest

      // Store the full manifest - it's all JSON, no code to bundle
      // Path is the full file path: modules/moduleName.json
      modules.push({
        path: `modules/${entry.name}`,
        manifest,
      })

      const columnTypeCount = manifest.columnTypes?.length || 0
      const generatorCount = manifest.tableGenerators?.length || 0
      console.log(
        `✓ Found module: ${manifest.name || entry.name} v${manifest.version || '0.0.0'} ` +
          `(${columnTypeCount} column types, ${generatorCount} generators)`
      )
    } catch (err) {
      console.log(`⚠️  Invalid JSON in ${entry.name}:`, err)
    }
  }

  return modules
}

interface ManifestOutput {
  _meta: {
    generated: string
    source: string
    warning: string
  }
  modules: ScannedModule[]
}

function main() {
  console.log('🔍 Scanning modules directory...\n')

  const modules = scanModules()

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_FILE)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // Create output with metadata
  const output: ManifestOutput = {
    _meta: {
      generated: new Date().toISOString(),
      source: 'modules/*.json',
      warning: 'AUTO-GENERATED FILE - DO NOT EDIT. Edit modules/*.json files instead.',
    },
    modules,
  }

  // Write manifest
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2))

  console.log(`\n✅ Found ${modules.length} module(s)`)
  console.log(`📄 Written to: ${OUTPUT_FILE}`)
}

main()
