// Module System Types - JSON-Only Architecture
// Modules are pure JSON configuration, no executable code

// ============================================================================
// MODULE MANIFEST - store-module.json schema
// ============================================================================

/**
 * Module manifest file (store-module.json)
 * This IS the entire module - no separate JS files
 */
export interface ModuleManifest {
  // Identity
  id: string // e.g., '@store/phone-numbers'
  name: string // Human-readable name
  version: string // Semantic version
  description: string // Module description
  icon?: string // Tabler icon name

  // Authorship
  author: ModuleAuthor
  license?: string // e.g., 'MIT', 'proprietary'

  // Compatibility
  engines: {
    store: string // Store version requirement, e.g., '>=1.0.0'
    moduleApi: 'v1' // API version this module targets
  }

  // Module settings schema (user-configurable options)
  settings?: ModuleSettingDefinition[]

  // Trust indicators
  trust?: {
    official?: boolean // Built by Store team
    verified?: boolean // Verified publisher
  }

  // ========== CAPABILITIES (JSON declarations) ==========

  // Column type definitions
  columnTypes?: ColumnTypeDefinition[]

  // Table generator definitions
  tableGenerators?: TableGeneratorDefinition[]
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
 * Module setting definition (for settings UI)
 */
export interface ModuleSettingDefinition {
  id: string
  type: 'string' | 'number' | 'boolean' | 'select' | 'secret'
  displayName: string
  description?: string
  default?: unknown
  required?: boolean
  options?: { value: string; label: string }[] // For select type
  validation?: {
    min?: number
    max?: number
    pattern?: string
    patternMessage?: string
  }
}

// ============================================================================
// COLUMN TYPE DEFINITIONS - JSON-based column type declarations
// ============================================================================

/**
 * Base types that columns can be stored as
 */
export type ColumnBaseType = 'string' | 'number' | 'boolean' | 'json'

/**
 * Column type definition - pure JSON, no executable code
 */
export interface ColumnTypeDefinition {
  // Identity
  id: string // e.g., 'phone', 'voice', 'provider'
  displayName: string
  description?: string
  icon?: string // Tabler icon name
  category?: string // For grouping in UI

  // Base storage type
  baseType: ColumnBaseType

  // Multi-value support (for multiselect fields)
  multiValue?: boolean

  // Default value (static)
  default?: unknown

  // Validation rules (uses built-in handlers)
  validation?: ValidationRule

  // Formatting rules (uses built-in handlers)
  format?: FormatRule

  // Data source for dynamic values (select fields, API data)
  source?: DataSourceDefinition

  // Configuration options shown when creating column
  options?: ColumnOptionDefinition[]
}

/**
 * Validation rule - references built-in validation handlers
 */
export type ValidationRule =
  | { handler: 'required' }
  | { handler: 'regex'; pattern: string; message?: string }
  | { handler: 'phone'; allowExtension?: boolean }
  | { handler: 'email' }
  | { handler: 'url' }
  | { handler: 'range'; min?: number; max?: number }
  | { handler: 'length'; min?: number; max?: number }
  | { handler: 'enum'; values: string[] }
  | { handler: 'json-schema'; schema: Record<string, unknown> }
  | { handler: 'composite'; rules: ValidationRule[]; mode: 'all' | 'any' }

/**
 * Format rule - references built-in format handlers
 */
export type FormatRule =
  | { handler: 'none' }
  | { handler: 'phone'; style?: 'e164' | 'national' | 'international' }
  | { handler: 'currency'; currency?: string; decimals?: number }
  | { handler: 'number'; decimals?: number; thousandsSeparator?: boolean }
  | { handler: 'date'; format?: string }
  | { handler: 'boolean'; trueLabel?: string; falseLabel?: string }
  | { handler: 'json'; pretty?: boolean }
  | { handler: 'uppercase' }
  | { handler: 'lowercase' }
  | { handler: 'template'; template: string }

/**
 * Data source for dynamic column values
 */
export interface DataSourceDefinition {
  type: 'static' | 'api'

  // For static data
  values?: Array<string | { value: string; label: string }>

  // For API data
  endpoint?: string // Relative to API base or absolute URL
  method?: 'GET' | 'POST'
  headers?: Record<string, string>

  // Authentication - references module setting by name
  auth?: {
    type: 'bearer' | 'basic' | 'header'
    // Reference to module setting: "$settings.apiToken" or static value
    token?: string
    // For header auth: header name
    headerName?: string
  }

  // Response mapping
  responseSchema?: {
    // JSON path to array of items, e.g., 'data', 'items', 'results'
    dataPath?: string
    // Example response for documentation
    example?: unknown
  }
  valueField?: string // JSON path to value in each item, e.g., 'id'
  labelField?: string // JSON path to label in each item, e.g., 'name'

  // Cache settings
  cache?: string // Cache duration, e.g., '24h', '1h', '5m'

  // Refresh settings
  refreshOn?: 'mount' | 'focus' | 'interval'
  refreshInterval?: string
}

/**
 * Column option definition (configuration when creating column)
 */
export interface ColumnOptionDefinition {
  id: string
  type: 'string' | 'number' | 'boolean' | 'select'
  displayName: string
  description?: string
  default?: unknown
  required?: boolean
  options?: { value: string; label: string }[] // For select type
}

// ============================================================================
// TABLE GENERATOR DEFINITIONS - For bulk table/data generation
// ============================================================================

/**
 * Table generator definition - generates tables with predefined structure
 */
export interface TableGeneratorDefinition {
  id: string // e.g., 'phone-rental-tables'
  displayName: string // e.g., 'Phone Rental Tables'
  description?: string
  icon?: string // Tabler icon name
  category?: string

  // What type of tables to generate
  tableType: 'sale' | 'rent' | 'default'

  // Default counts
  defaultTableCount: number
  defaultRowCount: number

  // UI styling
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error'

  // Column schema for generated tables
  columns?: GeneratorColumnDefinition[]
}

/**
 * Column definition for table generator
 */
export interface GeneratorColumnDefinition {
  name: string // Column name
  displayName: string
  type: string // Column type ID (from this module or built-in): 'string' | 'number' | 'boolean' | 'json' or module type
  required?: boolean
  default?: unknown

  // Generation rules for fake data
  generate?: GenerationRule

  // Inter-column constraints for generation logic
  constraints?: GeneratorColumnConstraints
}

/**
 * Constraints for generator column relationships
 */
export interface GeneratorColumnConstraints {
  // This column excludes these columns (mutually exclusive)
  excludes?: string[]
  // This column implies these columns must be true
  implies?: string[]
  // This column is required if any of these columns are true
  requiredIf?: { any?: string[]; all?: string[] }
  // This column should be null/empty if any of these columns are true
  nullIf?: { any?: string[]; all?: string[] }
}

/**
 * Generation rule for fake data
 */
export type GenerationRule =
  | { handler: 'static'; value: unknown }
  | { handler: 'faker'; method: string; args?: unknown[] } // e.g., 'phone.number', 'company.name'
  | { handler: 'random-int'; min: number; max: number }
  | { handler: 'random-float'; min: number; max: number; decimals?: number }
  | { handler: 'random-boolean'; probability?: number }
  | { handler: 'random-enum'; values: unknown[] }
  | { handler: 'from-source' } // Fetches values from column type's API data source
  | { handler: 'sequence'; start?: number; step?: number }
  | { handler: 'pattern'; pattern: string } // e.g., '+1 (###) ###-####'
  | { handler: 'template'; template: string; data?: Record<string, GenerationRule> }

// ============================================================================
// INSTALLED MODULE - Runtime state stored in D1
// ============================================================================

/**
 * Installed module record (stored in D1)
 */
export interface InstalledModule {
  id: string
  name: string
  version: string
  displayName?: string | null | undefined // Human-readable display name from manifest
  description: string
  author: ModuleAuthor
  source: ModuleSource
  status: ModuleStatus
  installedAt: Date
  updatedAt: Date
  activatedAt: Date | null
  settings: Record<string, unknown>
  manifest: ModuleManifest // The full JSON manifest
  error?: string | undefined
  errorAt?: Date | undefined
}

/**
 * Module source for installation
 */
export interface ModuleSource {
  type: 'local' | 'url' | 'upload'
  path?: string // For local sources (e.g., 'modules/phone-numbers')
  url?: string // For URL sources
  manifest?: ModuleManifest // For upload sources - the manifest content directly
}

/**
 * Module status
 */
export type ModuleStatus =
  | 'installing' // Being installed
  | 'installed' // Installed but not active
  | 'active' // Running and available
  | 'disabled' // Manually disabled
  | 'error' // Error state
  | 'updating' // Being updated
  | 'uninstalling' // Being removed

/**
 * Module lifecycle state machine
 */
export const MODULE_STATUS_TRANSITIONS: Record<ModuleStatus, ModuleStatus[]> = {
  installing: ['installed', 'error'],
  installed: ['active', 'uninstalling'],
  active: ['disabled', 'updating', 'error'],
  disabled: ['active', 'uninstalling'],
  error: ['installing', 'active', 'uninstalling'],
  updating: ['active', 'error'],
  uninstalling: [],
}

// ============================================================================
// MODULE REGISTRY & MANAGER INTERFACES
// ============================================================================

/**
 * Module registry interface
 */
export interface ModuleRegistry {
  list(): Promise<InstalledModule[]>
  get(moduleId: string): Promise<InstalledModule | null>
  add(module: InstalledModule): Promise<void>
  remove(moduleId: string): Promise<void>
  update(moduleId: string, updates: Partial<InstalledModule>): Promise<void>
  findByStatus(status: ModuleStatus): Promise<InstalledModule[]>
  getColumnTypeProvider(typeId: string): Promise<InstalledModule | null>
}

/**
 * Module manager interface
 */
export interface ModuleManager {
  registry: ModuleRegistry

  // Installation
  install(source: ModuleSource): Promise<InstallResult>
  uninstall(moduleId: string): Promise<void>

  // Lifecycle (simplified - just enable/disable)
  activate(moduleId: string): Promise<void>
  deactivate(moduleId: string): Promise<void>

  // Settings
  getSettings(moduleId: string): Promise<Record<string, unknown>>
  setSettings(moduleId: string, settings: Record<string, unknown>): Promise<void>

  // Queries - returns JSON definitions, not executable code
  getColumnTypes(): ColumnTypeDefinition[]
  getTableGenerators(): TableGeneratorDefinition[]
}

/**
 * Installation result
 */
export interface InstallResult {
  success: boolean
  moduleId: string
  version: string
  error?: string
}

// ============================================================================
// BUILT-IN HANDLER TYPES (for type safety in handler implementations)
// ============================================================================

/**
 * Validation result from handlers
 */
export interface ValidationResult {
  valid: boolean
  error?: string
}

/**
 * Validation handler function signature
 */
export type ValidationHandler = (
  value: unknown,
  rule: ValidationRule,
  options?: Record<string, unknown>
) => ValidationResult

/**
 * Format handler function signature
 */
export type FormatHandler = (
  value: unknown,
  rule: FormatRule,
  options?: Record<string, unknown>
) => string

/**
 * Generation handler function signature
 */
export type GenerationHandler = (
  rule: GenerationRule,
  context: { index: number; total: number; row: Record<string, unknown> }
) => unknown

// ============================================================================
// TRUST & HELPERS
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
  return 'unverified'
}

// ============================================================================
// ANALYTICS (for repository compatibility)
// ============================================================================

/**
 * Module analytics
 */
export interface ModuleAnalytics {
  moduleId: string
  installCount: number
  activeInstances: number
  errorCount: number
  lastError?: { message: string; occurredAt: Date } | undefined
  avgActivationTimeMs: number
  avgApiResponseTimeMs: number
  columnTypeUsage: Record<string, number>
  generatorInvocations: number
  updatedAt: Date
}
