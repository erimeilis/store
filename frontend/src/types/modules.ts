/**
 * Frontend Module System Types
 * MUST match backend src/types/modules.ts exactly!
 * JSON-Only Architecture - modules are pure configuration
 */

import type { PaginatedResponse } from './models'

// ============================================================================
// TYPES MATCHING BACKEND EXACTLY
// ============================================================================

/**
 * Module status - matches backend ModuleStatus
 */
export type ModuleStatus = 'installing' | 'installed' | 'active' | 'disabled' | 'error' | 'updating' | 'uninstalling'

/**
 * Module author - matches backend ModuleAuthor
 */
export interface ModuleAuthor {
  name: string
  email?: string
  url?: string
}

/**
 * Module source - matches backend ModuleSource
 */
export interface ModuleSource {
  type: 'local' | 'url' | 'upload'
  path?: string
  url?: string
  manifest?: ModuleManifest // For upload sources - the manifest content directly
}

/**
 * Column type definition from module manifest
 */
export interface ColumnTypeDefinition {
  id: string
  displayName: string
  description?: string
  icon?: string
  category?: string
  baseType: 'string' | 'number' | 'boolean' | 'json'
}

/**
 * Table generator definition from module manifest
 */
export interface TableGeneratorDefinition {
  id: string
  displayName: string
  description?: string
  icon?: string
  category?: string
  tableType: 'sale' | 'rent' | 'default'
}

/**
 * Module manifest - matches backend ModuleManifest (JSON-only)
 */
export interface ModuleManifest {
  id: string
  name: string
  version: string
  description: string
  icon?: string
  author: ModuleAuthor
  license?: string
  engines: {
    store: string
    moduleApi: 'v1'
  }
  settings?: ModuleSettingDefinition[]
  trust?: {
    official?: boolean
    verified?: boolean
  }
  // JSON-only capabilities
  columnTypes?: ColumnTypeDefinition[]
  tableGenerators?: TableGeneratorDefinition[]
}

/**
 * Setting definition for module configuration
 */
export interface ModuleSettingDefinition {
  id: string
  type: 'string' | 'number' | 'boolean' | 'select' | 'secret'
  displayName: string
  description?: string
  default?: unknown
  required?: boolean
  options?: { value: string; label: string }[]
}

/**
 * Installed module - matches backend InstalledModule exactly!
 */
export interface InstalledModule {
  id: string
  name: string
  version: string
  displayName?: string | null
  description: string
  author: ModuleAuthor
  source: ModuleSource
  status: ModuleStatus
  manifest: ModuleManifest
  settings: Record<string, unknown>
  installedAt: string | Date
  updatedAt: string | Date
  activatedAt: string | Date | null
  error?: string
  errorAt?: string | Date
  // Additional field from API (not in base InstalledModule)
  analytics?: {
    activationCount: number
    errorCount: number
    generatorInvocations: number
  } | null
}

/**
 * Module event types
 */
export type ModuleEventType =
  | 'install'
  | 'activate'
  | 'deactivate'
  | 'update'
  | 'uninstall'
  | 'error'
  | 'settings_change'
  | 'reload'

/**
 * Module event record
 */
export interface ModuleEvent {
  id: string
  moduleId: string
  eventType: ModuleEventType
  previousVersion: string | null
  newVersion: string | null
  previousStatus: string | null
  newStatus: string | null
  details: Record<string, unknown> | null
  createdBy: string | null
  createdAt: string | Date
}

/**
 * Module analytics data
 */
export interface ModuleAnalytics {
  moduleId: string
  installCount: number
  activeInstances: number
  errorCount: number
  lastError?: {
    message: string
    occurredAt: Date
  }
  avgActivationTimeMs: number
  avgApiResponseTimeMs: number
  columnTypeUsage: Record<string, number>
  generatorInvocations: number
  updatedAt: Date
}

/**
 * Module install request
 */
export interface ModuleInstallRequest {
  source: ModuleSource
  activate?: boolean
}

/**
 * Paginated modules response
 */
export type PaginatedModulesResponse = PaginatedResponse<InstalledModule>

/**
 * Paginated module events response
 */
export type PaginatedModuleEventsResponse = PaginatedResponse<ModuleEvent>

// ============================================================================
// UI HELPERS
// ============================================================================

/**
 * Status badge color mapping
 */
export const moduleStatusBadgeVariant: Record<ModuleStatus, string> = {
  installing: 'badge-info',
  installed: 'badge-secondary',
  active: 'badge-success',
  disabled: 'badge-ghost',
  error: 'badge-error',
  updating: 'badge-warning',
  uninstalling: 'badge-warning',
}

/**
 * Status display labels
 */
export const moduleStatusLabel: Record<ModuleStatus, string> = {
  installing: 'Installing',
  installed: 'Installed',
  active: 'Active',
  disabled: 'Disabled',
  error: 'Error',
  updating: 'Updating',
  uninstalling: 'Uninstalling',
}
