/**
 * Frontend Module System Types
 * Type definitions for module admin UI
 */

import type { BaseModel, PaginatedResponse } from './models'

/**
 * Module lifecycle states
 */
export type ModuleState =
  | 'installing'
  | 'installed'
  | 'activating'
  | 'active'
  | 'deactivating'
  | 'disabled'
  | 'error'
  | 'updating'
  | 'uninstalling'

/**
 * Module capability types
 */
export type ModuleCapabilityType = 'columnType' | 'dataGenerator' | 'api' | 'widget' | 'theme'

/**
 * Module capability
 */
export interface ModuleCapability {
  type: ModuleCapabilityType
  typeId?: string
  generatorId?: string
  route?: string
  widgetId?: string
  themeId?: string
}

/**
 * Module dependency
 */
export interface ModuleDependency {
  moduleId: string
  version: string
  optional?: boolean
}

/**
 * Module source
 */
export interface ModuleSource {
  type: 'builtin' | 'npm' | 'url' | 'local'
  package?: string
  version?: string
  url?: string
  path?: string
}

/**
 * Module manifest
 */
export interface ModuleManifest {
  id: string
  name: string
  version: string
  description?: string
  author?: string
  license?: string
  homepage?: string
  repository?: string
  keywords?: string[]
  capabilities: ModuleCapability[]
  dependencies?: ModuleDependency[]
  settings?: ModuleSettingDefinition[]
  permissions?: string[]
  minStoreVersion?: string
}

/**
 * Setting definition for module configuration
 */
export interface ModuleSettingDefinition {
  id: string
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect'
  displayName: string
  description?: string
  default?: unknown
  required?: boolean
  options?: { value: string; label: string }[]
}

/**
 * Installed module record
 */
export interface InstalledModule extends BaseModel {
  moduleId: string
  version: string
  state: ModuleState
  manifest: ModuleManifest
  source: ModuleSource
  settings: Record<string, unknown>
  installedAt: string
  activatedAt?: string | null
  lastError?: string | null
}

/**
 * Module event types
 */
export type ModuleEventType =
  | 'installed'
  | 'activated'
  | 'deactivated'
  | 'uninstalled'
  | 'error'
  | 'settings_updated'
  | 'custom'

/**
 * Module event record
 */
export interface ModuleEvent extends BaseModel {
  moduleId: string
  eventType: ModuleEventType
  message: string
  data?: Record<string, unknown>
  level: 'info' | 'warn' | 'error'
  timestamp: string
}

/**
 * Module analytics data
 */
export interface ModuleAnalytics {
  moduleId: string
  period: string
  metrics: {
    columnTypeUsage: Record<string, number>
    generatorInvocations: number
    apiCalls: number
    averageResponseTime: number
    errors: number
    customMetrics: Record<string, number>
  }
}

/**
 * Module install request
 */
export interface ModuleInstallRequest {
  source: ModuleSource
  activate?: boolean
}

/**
 * Module action request
 */
export interface ModuleActionRequest {
  action: 'activate' | 'deactivate' | 'reload'
}

/**
 * Module settings update request
 */
export interface ModuleSettingsUpdateRequest {
  settings: Record<string, unknown>
}

/**
 * Paginated modules response
 */
export type PaginatedModulesResponse = PaginatedResponse<InstalledModule>

/**
 * Paginated module events response
 */
export type PaginatedModuleEventsResponse = PaginatedResponse<ModuleEvent>

/**
 * State badge color mapping
 */
export const moduleStateBadgeVariant: Record<ModuleState, string> = {
  installing: 'badge-info',
  installed: 'badge-secondary',
  activating: 'badge-info',
  active: 'badge-success',
  deactivating: 'badge-warning',
  disabled: 'badge-ghost',
  error: 'badge-error',
  updating: 'badge-info',
  uninstalling: 'badge-warning',
}

/**
 * State display labels
 */
export const moduleStateLabel: Record<ModuleState, string> = {
  installing: 'Installing',
  installed: 'Installed',
  activating: 'Activating',
  active: 'Active',
  deactivating: 'Deactivating',
  disabled: 'Disabled',
  error: 'Error',
  updating: 'Updating',
  uninstalling: 'Uninstalling',
}

/**
 * Capability icon mapping
 */
export const capabilityIcon: Record<ModuleCapabilityType, string> = {
  columnType: 'IconColumn',
  dataGenerator: 'IconWand',
  api: 'IconApi',
  widget: 'IconLayoutDashboard',
  theme: 'IconPalette',
}

/**
 * Capability display labels
 */
export const capabilityLabel: Record<ModuleCapabilityType, string> = {
  columnType: 'Column Type',
  dataGenerator: 'Data Generator',
  api: 'API Extension',
  widget: 'Widget',
  theme: 'Theme',
}
