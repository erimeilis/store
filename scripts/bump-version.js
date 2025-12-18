#!/usr/bin/env node
/**
 * Version Bump Script
 * Single source of truth for version management across backend and frontend
 *
 * Usage:
 *   node scripts/bump-version.js patch    # 1.3.0 -> 1.3.1
 *   node scripts/bump-version.js minor    # 1.3.0 -> 1.4.0
 *   node scripts/bump-version.js major    # 1.3.0 -> 2.0.0
 *   node scripts/bump-version.js 2.0.0    # Set explicit version
 *   node scripts/bump-version.js          # Show current version
 */

import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = join(__dirname, '..')

const PACKAGE_FILES = [
  join(ROOT_DIR, 'package.json'),
  join(ROOT_DIR, 'admin', 'package.json')
]

function readPackageJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf-8'))
}

function writePackageJson(filePath, data) {
  writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n')
}

function parseVersion(version) {
  const [major, minor, patch] = version.split('.').map(Number)
  return { major, minor, patch }
}

function formatVersion({ major, minor, patch }) {
  return `${major}.${minor}.${patch}`
}

function bumpVersion(currentVersion, bumpType) {
  const v = parseVersion(currentVersion)

  switch (bumpType) {
    case 'major':
      return formatVersion({ major: v.major + 1, minor: 0, patch: 0 })
    case 'minor':
      return formatVersion({ major: v.major, minor: v.minor + 1, patch: 0 })
    case 'patch':
      return formatVersion({ major: v.major, minor: v.minor, patch: v.patch + 1 })
    default:
      // Explicit version provided
      if (/^\d+\.\d+\.\d+$/.test(bumpType)) {
        return bumpType
      }
      throw new Error(`Invalid bump type or version: ${bumpType}`)
  }
}

function main() {
  const arg = process.argv[2]

  // Read current version from root package.json
  const rootPkg = readPackageJson(PACKAGE_FILES[0])
  const currentVersion = rootPkg.version

  if (!arg) {
    console.log(`Current version: ${currentVersion}`)
    return
  }

  // Calculate new version
  const newVersion = bumpVersion(currentVersion, arg)

  console.log(`Bumping version: ${currentVersion} -> ${newVersion}`)

  // Update all package.json files
  for (const filePath of PACKAGE_FILES) {
    const pkg = readPackageJson(filePath)
    const oldVersion = pkg.version
    pkg.version = newVersion
    writePackageJson(filePath, pkg)
    console.log(`  Updated ${filePath.replace(ROOT_DIR, '.')}: ${oldVersion} -> ${newVersion}`)
  }

  console.log(`\nVersion ${newVersion} set in ${PACKAGE_FILES.length} files`)
  console.log('Run deploy commands to publish with new version')
}

main()
