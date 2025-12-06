// Re-export types from the main Store types
// In a real module, these would come from @store/module-sdk package

/**
 * Validation result from column type validation
 */
export interface ValidationResult {
  valid: boolean
  error?: string
}

/**
 * Column type option definition
 */
export interface ColumnTypeOption {
  id: string
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect'
  displayName: string
  description?: string
  default?: unknown
  required?: boolean
  options?: { value: string; label: string }[]
}

/**
 * Data source for dynamic column values
 */
export interface ColumnDataSource {
  type: 'static' | 'api' | 'module' | 'database'
  values?: string[] | { value: string; label: string }[]
  endpoint?: string
  query?: string
}

/**
 * Column type definition provided by a module
 */
export interface ModuleColumnType {
  id: string
  displayName: string
  description: string
  icon?: string
  category: string
  options?: ColumnTypeOption[]
  dataSource?: ColumnDataSource

  validate(value: unknown, options?: Record<string, unknown>): ValidationResult
  format(value: unknown, options?: Record<string, unknown>): string
  parse(input: string, options?: Record<string, unknown>): unknown
  getDefaultValue?(options?: Record<string, unknown>): unknown
  editorComponent?: string
  viewerComponent?: string
}

/**
 * Generator option definition
 */
export interface GeneratorOption {
  id: string
  type: 'string' | 'number' | 'boolean' | 'select'
  displayName: string
  description?: string
  default?: unknown
  required?: boolean
  options?: { value: string; label: string }[]
}

/**
 * Data generator definition (for individual cell values)
 */
export interface ModuleDataGenerator {
  id: string
  displayName: string
  description: string
  icon?: string
  category: string
  outputType: string
  options?: GeneratorOption[]

  generate(count: number, options?: Record<string, unknown>): Promise<unknown[]> | unknown[]
  preview?(options?: Record<string, unknown>): string
}

/**
 * Table generator definition (for generating complete tables with schema and data)
 */
export interface ModuleTableGenerator {
  id: string
  displayName: string
  description: string
  icon?: string
  category?: string
  tableType: 'sale' | 'rent' | 'default'
  defaultTableCount: number
  defaultRowCount: number
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error'
  customGenerator?: boolean
}

/**
 * Module context for runtime operations
 */
export interface ModuleContext {
  moduleId: string
  version: string
  settings: Record<string, unknown>
  logger: {
    debug(message: string, data?: unknown): void
    info(message: string, data?: unknown): void
    warn(message: string, data?: unknown): void
    error(message: string, error?: Error | unknown): void
  }
  analytics: {
    trackColumnTypeUsage(typeId: string): Promise<void>
    trackGeneratorInvocation(): Promise<void>
  }
}

/**
 * Store module interface
 */
export interface StoreModule {
  id: string
  version: string
  columnTypes?: ModuleColumnType[]
  dataGenerators?: ModuleDataGenerator[]
  tableGenerators?: ModuleTableGenerator[]
  onActivate?(context: ModuleContext): Promise<void> | void
  onDeactivate?(context: ModuleContext): Promise<void> | void
}
