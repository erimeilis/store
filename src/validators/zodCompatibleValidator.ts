import { z } from 'zod'
import type {
  CreateTableRequest,
  UpdateTableRequest,
  TableMassAction,
  AddTableDataRequest,
  UpdateTableDataRequest,
  TableDataMassAction,
  ParsedTableData
} from '@/types/dynamic-tables.js'

/**
 * Zod schemas that match existing types exactly
 */

// Valid column types matching the existing enum
const validColumnTypes = ['text', 'number', 'date', 'boolean', 'email', 'url', 'textarea', 'country'] as const

const ColumnSchema = z.object({
  name: z.string().min(1, 'Column name is required'),
  type: z.enum(validColumnTypes, { message: `Column type must be one of: ${validColumnTypes.join(', ')}` }),
  isRequired: z.boolean().default(false),
  allowDuplicates: z.boolean().default(true),
  defaultValue: z.any().optional(),
  position: z.number().optional() // For compatibility with existing schema
})

const CreateTableRequestSchema = z.object({
  name: z.string().min(1, 'Table name is required'),
  description: z.string().optional(),
  visibility: z.enum(['private', 'public', 'shared'], {
    message: "Visibility must be one of: private, public, shared"
  }).default('private'),
  tableType: z.enum(['default', 'sale', 'rent'], {
    message: "Table type must be one of: default, sale, rent"
  }).default('default'),
  /** @deprecated Use tableType instead */
  forSale: z.boolean().optional(),
  user_id: z.string().optional(), // For compatibility
  columns: z.array(ColumnSchema).min(1, 'At least one column is required')
})

const UpdateTableRequestSchema = z.object({
  name: z.string().min(1, 'Table name is required').optional(),
  description: z.string().optional(),
  visibility: z.enum(['private', 'public', 'shared'], {
    message: "Visibility must be one of: private, public, shared"
  }).optional(),
  tableType: z.enum(['default', 'sale', 'rent'], {
    message: "Table type must be one of: default, sale, rent"
  }).optional(),
  /** @deprecated Use tableType instead */
  forSale: z.boolean().optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' }
)

const AddTableDataRequestSchema = z.object({
  data: z.record(z.string(), z.any())
})

const UpdateTableDataRequestSchema = z.object({
  data: z.record(z.string(), z.any())
})

/**
 * Compatible validator that maintains the old interface structure
 */
export class ZodCompatibleValidator {
  /**
   * Validate create table request
   */
  validateCreateRequest(data: unknown): { valid: boolean; errors: string[] } {
    try {
      CreateTableRequestSchema.parse(data)
      return { valid: true, errors: [] }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map((issue: any) =>
          issue.path.length > 0 ? `${issue.path.join('.')}: ${issue.message}` : issue.message
        )
        return { valid: false, errors }
      }
      return { valid: false, errors: ['Validation failed'] }
    }
  }

  /**
   * Validate update table request
   */
  validateUpdateTableRequest(data: unknown): { valid: boolean; errors: string[] } {
    try {
      UpdateTableRequestSchema.parse(data)
      return { valid: true, errors: [] }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map((issue: any) =>
          issue.path.length > 0 ? `${issue.path.join('.')}: ${issue.message}` : issue.message
        )
        return { valid: false, errors }
      }
      return { valid: false, errors: ['Validation failed'] }
    }
  }

  /**
   * Validate table ID
   */
  validateTableId(tableId: unknown): { valid: boolean; errors: string[] } {
    try {
      z.string().min(1, 'Table ID is required').parse(tableId)
      return { valid: true, errors: [] }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map((issue: any) => issue.message)
        return { valid: false, errors }
      }
      return { valid: false, errors: ['Table ID validation failed'] }
    }
  }

  /**
   * Validate table mass action request
   */
  validateMassAction(action: TableMassAction | TableDataMassAction, ids: string[]): { valid: boolean; errors: string[] } {
    try {
      // Allow both table and table data mass actions
      z.enum(['delete', 'export', 'make_public', 'make_private', 'make_shared', 'set_field_value']).parse(action)
      z.array(z.string().min(1, 'ID cannot be empty')).min(1, 'No items selected').parse(ids)
      return { valid: true, errors: [] }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map((issue: any) => issue.message)
        return { valid: false, errors }
      }
      return { valid: false, errors: ['Mass action validation failed'] }
    }
  }

  /**
   * Validate add table data request
   */
  validateAddRequest(data: unknown): { valid: boolean; errors: string[] } {
    try {
      AddTableDataRequestSchema.parse(data)
      return { valid: true, errors: [] }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map((issue: any) =>
          issue.path.length > 0 ? `${issue.path.join('.')}: ${issue.message}` : issue.message
        )
        return { valid: false, errors }
      }
      return { valid: false, errors: ['Add request validation failed'] }
    }
  }

  /**
   * Validate update table data request
   */
  validateUpdateRequest(data: unknown): { valid: boolean; errors: string[] } {
    try {
      UpdateTableDataRequestSchema.parse(data)
      return { valid: true, errors: [] }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map((issue: any) =>
          issue.path.length > 0 ? `${issue.path.join('.')}: ${issue.message}` : issue.message
        )
        return { valid: false, errors }
      }
      return { valid: false, errors: ['Update request validation failed'] }
    }
  }

  /**
   * Validate IDs
   */
  validateIds(tableId: unknown, rowId?: unknown): { valid: boolean; errors: string[] } {
    try {
      z.string().min(1, 'Table ID is required').parse(tableId)
      if (rowId !== undefined) {
        z.string().min(1, 'Row ID is required').parse(rowId)
      }
      return { valid: true, errors: [] }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map((issue: any) => issue.message)
        return { valid: false, errors }
      }
      return { valid: false, errors: ['ID validation failed'] }
    }
  }

  /**
   * Validate table data against schema
   */
  async validateTableData(
    tableColumns: Array<{ name: string; type: string; isRequired: boolean; defaultValue: any }>,
    data: ParsedTableData
  ): Promise<{ valid: boolean; errors: string[]; validatedData?: ParsedTableData }> {
    try {
      // Create dynamic schema based on table columns
      const schemaFields: Record<string, z.ZodSchema> = {}

      for (const column of tableColumns) {
        let columnValidator: z.ZodSchema

        switch (column.type) {
          case 'text':
          case 'textarea':
            columnValidator = z.string()
            break
          case 'number':
            columnValidator = z.coerce.number()
            break
          case 'boolean':
            // Preprocess boolean values to handle string "false" correctly
            columnValidator = z.preprocess((val) => {
              if (val === 'false' || val === '0' || val === 0 || val === false) {
                return false
              }
              if (val === 'true' || val === '1' || val === 1 || val === true) {
                return true
              }
              // For other values, use default coercion
              return Boolean(val)
            }, z.boolean())
            break
          case 'date':
            columnValidator = z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
            break
          case 'email':
            columnValidator = z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Must be a valid email address')
            break
          case 'url':
            columnValidator = z.string().regex(/^https?:\/\/.+/, 'Must be a valid URL')
            break
          case 'country':
            // For country fields, only validate format when there's a meaningful value
            // Allow empty-like values ("", "false", null, undefined) for non-required fields
            columnValidator = z.string().refine(val => {
              // If empty-like value, it's valid (will be handled by optional/nullable logic)
              if (!val || val === '' || val === 'false' || val === 'null' || val === 'undefined') {
                return true
              }
              // Otherwise, must be valid 2 or 3 character ISO code
              return val.length === 2 || val.length === 3
            }, { message: 'Must be a valid country code (2-3 characters)' })
            break
          default:
            columnValidator = z.any()
        }

        // A column is effectively optional if:
        // 1. It's not required, OR
        // 2. It has a default value (since the system will use the default when no value is provided)
        const hasDefaultValue = column.defaultValue !== null && column.defaultValue !== undefined;
        const isEffectivelyOptional = !column.isRequired || hasDefaultValue;

        if (isEffectivelyOptional) {
          columnValidator = columnValidator.optional().nullable()
        }

        // Add default value transformation if specified
        if (column.defaultValue !== null && column.defaultValue !== undefined) {
          columnValidator = columnValidator.transform(val =>
            val === undefined || val === null ? column.defaultValue : val
          )
        }

        schemaFields[column.name] = columnValidator
      }

      const tableSchema = z.object(schemaFields)
      const validatedData = tableSchema.parse(data)

      return { valid: true, errors: [], validatedData }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map((issue: any) =>
          issue.path.length > 0 ? `Column '${issue.path.join('.')}': ${issue.message}` : issue.message
        )
        return { valid: false, errors }
      }
      return { valid: false, errors: ['Table data validation failed'] }
    }
  }

  /**
   * Extract filters from query parameters
   * Supports both camelCase (filterColumnName) and underscore (filter_column_name) formats
   */
  extractFilters(queryParams: URLSearchParams): { [key: string]: string } {
    const filters: { [key: string]: string } = {}

    for (const [key, value] of queryParams.entries()) {
      // Handle camelCase format: filterColumnName -> columnName
      if (key.startsWith('filter') && key !== 'filter' && value.trim()) {
        // Remove 'filter' prefix and lowercase the first letter
        // filterLikes -> likes, filterType -> type
        const columnName = key.charAt(6).toLowerCase() + key.slice(7)
        filters[columnName] = value.trim()
      }
      // Also support legacy underscore format for backward compatibility
      else if (key.startsWith('filter_') && value.trim()) {
        const columnName = key.replace('filter_', '')
        filters[columnName] = value.trim()
      }
    }

    return filters
  }
}