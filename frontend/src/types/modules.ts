/**
 * Frontend Module System Types
 * MUST match backend src/types/modules.ts exactly!
 */

import type { PaginatedResponse } from './models'

// ============================================================================
// TYPES MATCHING BACKEND EXACTLY
// ============================================================================

/**
 * Module status - matches backend ModuleStatus
 */
export type ModuleStatus = 'installed' | 'active' | 'disabled' | 'error'

/**
 * Module capability types
 */
export type ModuleCapabilityType = 'columnType' | 'dataGenerator' | 'api'

/**
 * Capability declaration - matches backend ModuleCapabilityDeclaration
 */
export type ModuleCapability =
  | { type: 'columnType'; typeId: string }
  | { type: 'dataGenerator'; generatorId: string }
  | { type: 'api'; basePath: string }

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
  type: 'npm' | 'url' | 'local'
  package?: string
  version?: string
  url?: string
  path?: string
}

/**
 * Module manifest - matches backend ModuleManifest
 */
export interface ModuleManifest {
  id: string
  name: string
  version: string
  description: string
  icon?: string
  author: ModuleAuthor
  license?: string
  repository?: string
  homepage?: string
  engines: {
    store: string
    moduleApi: 'v1'
  }
  capabilities: ModuleCapability[]
  dependencies?: Record<string, string>
  settings?: ModuleSettingDefinition[]
  main: string
  trust?: {
    official?: boolean
    verified?: boolean
  }
  permissions?: string[]
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
  displayName: string
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
  installed: 'badge-secondary',
  active: 'badge-success',
  disabled: 'badge-ghost',
  error: 'badge-error',
}

/**
 * Status display labels
 */
export const moduleStatusLabel: Record<ModuleStatus, string> = {
  installed: 'Installed',
  active: 'Active',
  disabled: 'Disabled',
  error: 'Error',
}

/**
 * Capability display labels
 */
export const capabilityLabel: Record<ModuleCapabilityType, string> = {
  columnType: 'Column Type',
  dataGenerator: 'Data Generator',
  api: 'API Extension',
}
