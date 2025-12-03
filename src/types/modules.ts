// Module System Types
// Based on MODULE_SYSTEM_ARCHITECTURE.md specification

// ============================================================================
// MODULE MANIFEST - store-module.json schema
// ============================================================================

/**
 * Module manifest file (store-module.json)
 * Required in every module's root directory
 */
export interface ModuleManifest {
  // Identity
  id: string                       // e.g., '@store/phone-numbers'
  name: string                     // Human-readable name
  version: string                  // Semantic version
  description: string              // Module description
  icon?: string                    // Icon identifier or URL

  // Authorship
  author: ModuleAuthor
  license?: string                 // e.g., 'MIT', 'proprietary'
  repository?: string              // Git repository URL
  homepage?: string                // Documentation URL

  // Compatibility
  engines: {
    store: string                  // Store version requirement, e.g., '>=1.0.0'
    moduleApi: 'v1'                // API version this module targets
  }

  // Capabilities declaration
  capabilities: ModuleCapabilityDeclaration[]

  // Dependencies (other modules this depends on)
  dependencies?: Record<string, string>  // moduleId -> version requirement

  // Module settings schema
  settings?: ModuleSettingDefinition[]

  // Entry points
  main: string                     // Main entry file, e.g., 'dist/index.js'

  // Trust indicators
  trust?: {
    official?: boolean             // Built by Store team
    verified?: boolean             // Verified publisher
  }

  // Permissions required
  permissions?: ModulePermission[]
}

/**
 * Module author information
 */
export interface ModuleAuthor {
  name: string
  email?: string
  url?: string
}

/**
 * Capability declaration in manifest
 */
export type ModuleCapabilityDeclaration =
  | { type: 'columnType'; typeId: string }
  | { type: 'dataGenerator'; generatorId: string }
  | { type: 'api'; basePath: string }

/**
 * Module setting definition (for settings UI)
 */
export interface ModuleSettingDefinition {
  id: string
  type: 'string' | 'number' | 'boolean' | 'select' | 'secret'
  displayName: string
  description?: string
  default?: unknown
  required?: boolean
  options?: { value: string; label: string }[]  // For select type
  validation?: {
    min?: number
    max?: number
    pattern?: string
    patternMessage?: string
  }
}

/**
 * Permissions a module can request
 */
export type ModulePermission =
  | 'network'          // Make HTTP requests
  | 'storage'          // Use KV/R2 storage
  | 'database'         // Create/modify own tables
  | 'scheduler'        // Schedule tasks
  | 'notifications'    // Send notifications

// ============================================================================
// MODULE RUNTIME - Execution context and lifecycle
// ============================================================================

/**
 * The main module interface that modules must implement
 */
export interface StoreModule {
  // Identity (from manifest)
  id: string
  version: string

  // Lifecycle hooks
  onInstall?(context: ModuleContext): Promise<void>
  onActivate?(context: ModuleContext): Promise<void>
  onDeactivate?(context: ModuleContext): Promise<void>
  onUpgrade?(context: ModuleContext, fromVersion: string): Promise<void>
  onUninstall?(context: ModuleContext): Promise<void>

  // Column type definitions
  columnTypes?: ModuleColumnType[]

  // Data generator definitions
  dataGenerators?: ModuleDataGenerator[]

  // API routes
  apiRoutes?: ModuleApiRoute[]

  // Custom methods (for data sources, etc.)
  [key: string]: unknown
}

/**
 * Context provided to modules during execution
 */
export interface ModuleContext {
  // Module identity
  moduleId: string
  version: string

  // Current settings
  settings: Record<string, unknown>

  // Core services
  db: ModuleDatabase
  cache: ModuleCache
  storage: ModuleStorage
  http: ModuleHttp
  logger: ModuleLogger

  // Events
  events: ModuleEvents

  // Analytics
  analytics: ModuleAnalyticsTracker

  // Environment info
  env: {
    isDevelopment: boolean
    isProduction: boolean
    storeVersion: string
  }
}

/**
 * Database interface for modules
 * Modules can only access their own tables (prefixed with moduleId)
 */
export interface ModuleDatabase {
  query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>
  execute(sql: string, params?: unknown[]): Promise<{ changes: number }>
  batch(statements: { sql: string; params?: unknown[] }[]): Promise<void>
}

/**
 * Cache interface for modules (KV-backed)
 */
export interface ModuleCache {
  get<T = unknown>(key: string): Promise<T | null>
  set(key: string, value: unknown, ttlSeconds?: number): Promise<void>
  delete(key: string): Promise<void>
  list(prefix?: string): Promise<string[]>
}

/**
 * HTTP client for modules
 */
export interface ModuleHttp {
  fetch(url: string, options?: RequestInit): Promise<Response>
}

/**
 * Logger interface for modules
 */
export interface ModuleLogger {
  debug(message: string, data?: unknown): void
  info(message: string, data?: unknown): void
  warn(message: string, data?: unknown): void
  error(message: string, error?: Error | unknown): void
}

/**
 * Event system for modules
 */
export interface ModuleEvents {
  emit(event: string, data?: unknown): void
  on(event: string, handler: (data: unknown) => void): void
  off(event: string, handler: (data: unknown) => void): void
}

/**
 * Storage interface for modules (R2-backed file storage)
 */
export interface ModuleStorage {
  /**
   * Upload a file to module storage
   */
  put(key: string, data: ArrayBuffer | Blob | string, options?: StoragePutOptions): Promise<void>

  /**
   * Get a file from module storage
   */
  get(key: string): Promise<StorageObject | null>

  /**
   * Delete a file from module storage
   */
  delete(key: string): Promise<void>

  /**
   * List files in module storage
   */
  list(options?: StorageListOptions): Promise<StorageListResult>

  /**
   * Get a public URL for a file (if bucket is configured for public access)
   */
  getPublicUrl(key: string): string | null
}

/**
 * Options for storage put operation
 */
export interface StoragePutOptions {
  contentType?: string
  metadata?: Record<string, string>
  cacheControl?: string
}

/**
 * Storage object returned from get operation
 */
export interface StorageObject {
  key: string
  data: ArrayBuffer
  contentType: string
  size: number
  etag: string
  uploaded: Date
  metadata?: Record<string, string>
}

/**
 * Options for storage list operation
 */
export interface StorageListOptions {
  prefix?: string
  limit?: number
  cursor?: string
}

/**
 * Result of storage list operation
 */
export interface StorageListResult {
  objects: Array<{
    key: string
    size: number
    uploaded: Date
  }>
  truncated: boolean
  cursor?: string
}

/**
 * Analytics tracking for modules
 */
export interface ModuleAnalyticsTracker {
  /**
   * Track a column type being used
   */
  trackColumnTypeUsage(typeId: string): Promise<void>

  /**
   * Track a data generator being invoked
   */
  trackGeneratorInvocation(): Promise<void>

  /**
   * Track an API call
   */
  trackApiCall(responseTimeMs: number): Promise<void>

  /**
   * Track a custom metric
   */
  trackCustomMetric(name: string, value: number): Promise<void>
}

// ============================================================================
// COLUMN TYPES - Module-provided column type definitions
// ============================================================================

/**
 * Column type definition provided by a module
 */
export interface ModuleColumnType {
  // Identity
  id: string                       // e.g., 'did', 'carrier', 'fish_breed'
  displayName: string              // Human-readable name
  description: string              // Shown in column type selector
  icon?: string                    // Icon identifier
  category: string                 // For grouping in UI

  // Configuration options (shown when creating column)
  options?: ColumnTypeOption[]

  // Data source (for dynamic values like API-driven selects)
  dataSource?: ColumnDataSource

  // Validation function
  validate(value: unknown, options?: Record<string, unknown>): ValidationResult

  // Formatting function
  format(value: unknown, options?: Record<string, unknown>): string

  // Parsing function (from string input)
  parse(input: string, options?: Record<string, unknown>): unknown

  // Default value generator (optional)
  getDefaultValue?(options?: Record<string, unknown>): unknown

  // UI Components (optional - for custom editors)
  editorComponent?: string         // React component ID for custom editor
  viewerComponent?: string         // React component ID for custom viewer
}

/**
 * Column type configuration option
 */
export interface ColumnTypeOption {
  id: string
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect'
  displayName: string
  description?: string
  default?: unknown
  required?: boolean
  options?: { value: string; label: string }[]  // For select types
  min?: number                     // For number types
  max?: number                     // For number types
  validation?: string              // Regex pattern for string types
}

/**
 * Data source for column values
 */
export interface ColumnDataSource {
  type: 'static' | 'api' | 'module'

  // For static data
  values?: { value: string; label: string }[]

  // For API data
  endpoint?: string
  refreshInterval?: string         // e.g., '24h', '1h', '30m'
  cacheKey?: string

  // For module-provided data
  moduleId?: string
  methodName?: string

  // Transformation
  transform?: {
    valuePath: string              // JSONPath to value
    labelPath: string              // JSONPath to label
  }
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean
  error?: string
  warnings?: string[]
  transformedValue?: unknown       // If validation also transforms
}

// ============================================================================
// DATA GENERATORS - Module-provided fake data generators
// ============================================================================

/**
 * Data generator definition provided by a module
 */
export interface ModuleDataGenerator {
  // Identity
  id: string                       // e.g., 'phone', 'fish', 'crm_lead'
  displayName: string
  description: string
  icon?: string

  // Column requirements
  requiredColumns: ColumnRequirement[]
  optionalColumns?: ColumnRequirement[]

  // Column dependencies (for generation order)
  // e.g., { carrier: 'country', areaCode: 'country' }
  dependencies?: Record<string, string | null>

  // Generation settings
  settings?: GeneratorSetting[]

  // Generate function
  generate(
    context: GeneratorContext,
    options?: Record<string, unknown>
  ): Promise<GeneratedRow> | GeneratedRow

  // Batch generate for performance
  generateBatch?(
    context: GeneratorContext,
    count: number,
    options?: Record<string, unknown>
  ): Promise<GeneratedRow[]> | GeneratedRow[]
}

/**
 * Column requirement for a generator
 */
export interface ColumnRequirement {
  name: string
  displayName: string
  description?: string
  defaultType: string              // Default column type
  allowedTypes?: string[]          // Alternative types allowed
}

/**
 * Generator setting
 */
export interface GeneratorSetting {
  id: string
  type: 'string' | 'number' | 'boolean' | 'select'
  displayName: string
  description?: string
  default?: unknown
  options?: { value: string; label: string }[]
}

/**
 * Context provided to generator
 */
export interface GeneratorContext {
  // Faker instance
  faker: unknown                   // Faker.js instance

  // Previously generated values in this row
  row: Record<string, unknown>

  // Column mappings
  columns: Record<string, string>  // generator column -> table column name

  // Settings for this generator
  settings: Record<string, unknown>

  // Module cache for lookups
  cache: ModuleCache

  // Row index (for batch generation)
  index: number

  // Total rows being generated
  total: number
}

/**
 * Generated row output
 */
export type GeneratedRow = Record<string, unknown>

// ============================================================================
// API ROUTES - Module-provided API endpoints
// ============================================================================

/**
 * API route definition
 */
export interface ModuleApiRoute {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  path: string                     // Relative to /api/modules/:moduleId/
  handler: ModuleApiHandler
  middleware?: ModuleApiMiddleware[]
  description?: string
  authentication?: 'required' | 'optional' | 'none'
}

/**
 * API request context
 */
export interface ModuleApiRequest {
  params: Record<string, string>
  query: Record<string, string>
  body: unknown
  headers: Record<string, string>
  moduleContext: ModuleContext
}

/**
 * API response helpers
 */
export interface ModuleApiResponse {
  json(data: unknown, status?: number): Response
  text(data: string, status?: number): Response
  error(message: string, status?: number): Response
  redirect(url: string, status?: number): Response
}

/**
 * API handler function
 */
export type ModuleApiHandler = (
  req: ModuleApiRequest,
  res: ModuleApiResponse
) => Promise<Response> | Response

/**
 * API middleware function
 */
export type ModuleApiMiddleware = (
  req: ModuleApiRequest,
  next: () => Promise<Response>
) => Promise<Response>

// ============================================================================
// MODULE REGISTRY - Installed module tracking
// ============================================================================

/**
 * Module source for installation
 */
export interface ModuleSource {
  type: 'npm' | 'git' | 'local' | 'upload'
  url?: string
  version?: string
  branch?: string                  // For git sources
  auth?: {
    token?: string
    registry?: string              // For private npm registries
  }
}

/**
 * Installed module record (stored in D1)
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
  installedAt: Date
  updatedAt: Date
  activatedAt: Date | null
  settings: Record<string, unknown>
  manifest: ModuleManifest
  error?: string | undefined
  errorAt?: Date | undefined
}

/**
 * Module status
 */
export type ModuleStatus =
  | 'installing'     // Being installed
  | 'installed'      // Installed but not active
  | 'activating'     // Being activated
  | 'active'         // Running and available
  | 'deactivating'   // Being deactivated
  | 'disabled'       // Manually disabled
  | 'error'          // Error state
  | 'updating'       // Being updated
  | 'uninstalling'   // Being removed

/**
 * Module lifecycle state machine
 */
export const MODULE_STATUS_TRANSITIONS: Record<ModuleStatus, ModuleStatus[]> = {
  installing: ['installed', 'error'],
  installed: ['activating', 'uninstalling'],
  activating: ['active', 'error'],
  active: ['deactivating', 'updating', 'error'],
  deactivating: ['disabled', 'error'],
  disabled: ['activating', 'uninstalling'],
  error: ['installing', 'activating', 'uninstalling'],
  updating: ['active', 'error'],
  uninstalling: [],
}

// ============================================================================
// MODULE MANAGER - Installation and lifecycle
// ============================================================================

/**
 * Installation result
 */
export interface InstallResult {
  success: boolean
  moduleId: string
  version: string
  error?: string
}

/**
 * Update check result
 */
export interface UpdateInfo {
  moduleId: string
  currentVersion: string
  latestVersion: string
  releaseNotes?: string
  publishedAt?: Date
}

/**
 * Update result
 */
export interface UpdateResult {
  success: boolean
  moduleId: string
  fromVersion: string
  toVersion: string
  error?: string
}

/**
 * Module registry interface
 */
export interface ModuleRegistry {
  // CRUD
  list(): Promise<InstalledModule[]>
  get(moduleId: string): Promise<InstalledModule | null>
  add(module: InstalledModule): Promise<void>
  remove(moduleId: string): Promise<void>
  update(moduleId: string, updates: Partial<InstalledModule>): Promise<void>

  // Queries
  findByStatus(status: ModuleStatus): Promise<InstalledModule[]>
  findByCapability(capability: ModuleCapabilityDeclaration): Promise<InstalledModule[]>
  getColumnTypeProvider(typeId: string): Promise<InstalledModule | null>
  getDataGeneratorProvider(generatorId: string): Promise<InstalledModule | null>
}

/**
 * Module manager interface
 */
export interface ModuleManager {
  // Registry access
  registry: ModuleRegistry

  // Installation
  install(source: ModuleSource): Promise<InstallResult>
  uninstall(moduleId: string): Promise<void>

  // Lifecycle
  activate(moduleId: string): Promise<void>
  deactivate(moduleId: string): Promise<void>
  reload(moduleId: string): Promise<void>
  reloadAll(): Promise<void>

  // Updates
  checkUpdates(): Promise<UpdateInfo[]>
  checkModuleUpdate(moduleId: string): Promise<UpdateInfo | null>
  update(moduleId: string, version?: string): Promise<UpdateResult>

  // Settings
  getSettings(moduleId: string): Promise<Record<string, unknown>>
  setSettings(moduleId: string, settings: Record<string, unknown>): Promise<void>

  // Queries
  getColumnTypes(): ModuleColumnType[]
  getDataGenerators(): ModuleDataGenerator[]
  getApiRoutes(): Array<ModuleApiRoute & { moduleId: string }>

  // Runtime
  getModuleInstance(moduleId: string): StoreModule | null
  getModuleContext(moduleId: string): ModuleContext | null
}

// ============================================================================
// MODULE ANALYTICS
// ============================================================================

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
  } | undefined
  avgActivationTimeMs: number
  avgApiResponseTimeMs: number
  columnTypeUsage: Record<string, number>
  generatorInvocations: number
  updatedAt: Date
}

// ============================================================================
// TRUST & CERTIFICATION
// ============================================================================

/**
 * Trust level for modules
 */
export type ModuleTrustLevel = 'official' | 'verified' | 'community' | 'unverified'

/**
 * Get trust level from manifest
 */
export function getModuleTrustLevel(manifest: ModuleManifest): ModuleTrustLevel {
  if (manifest.trust?.official) return 'official'
  if (manifest.trust?.verified) return 'verified'
  if (manifest.repository) return 'community'
  return 'unverified'
}
