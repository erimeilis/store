#!/usr/bin/env tsx
/**
 * Scan /modules directory and generate modules-manifest.json
 * Run this before starting dev server or deploying
 *
 * Modules are pure JSON - no TypeScript compilation needed
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
const OUTPUT_FILE = path.join(ROOT_DIR, 'src/data/modules-manifest.json')

function scanModules(): ScannedModule[] {
  if (!fs.existsSync(MODULES_DIR)) {
    console.log('⚠️  No modules directory found')
    return []
  }

  const entries = fs.readdirSync(MODULES_DIR, { withFileTypes: true })
  const modules: ScannedModule[] = []

  for (const entry of entries) {
    if (!entry.isDirectory()) continue

    const modulePath = path.join(MODULES_DIR, entry.name)
    const manifestPath = path.join(modulePath, 'store-module.json')

    if (!fs.existsSync(manifestPath)) {
      console.log(`⚠️  Skipping ${entry.name} - no store-module.json`)
      continue
    }

    try {
      const manifestContent = fs.readFileSync(manifestPath, 'utf-8')
      const manifest = JSON.parse(manifestContent) as ModuleManifest

      // Store the full manifest - it's all JSON, no code to bundle
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
      console.log(`⚠️  Invalid manifest in ${entry.name}:`, err)
    }
  }

  return modules
}

function main() {
  console.log('🔍 Scanning modules directory...\n')

  const modules = scanModules()

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_FILE)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // Write manifest
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(modules, null, 2))

  console.log(`\n✅ Found ${modules.length} module(s)`)
  console.log(`📄 Written to: ${OUTPUT_FILE}`)
}

main()
