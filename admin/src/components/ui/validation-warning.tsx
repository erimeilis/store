/**
 * Validation Warning Indicator
 * Shows visual warning for data that doesn't match column type
 * Part of "Warn-Don't-Block" validation pattern
 */

import React from 'react'
import { IconAlertTriangle } from '@tabler/icons-react'
import { validateValue, type ValidationResult } from '@/lib/validation-utils'

interface ValidationWarningProps {
  value: unknown
  columnType: string
  children: React.ReactNode
}

/**
 * Wrap cell content with validation warning indicator
 * Shows warning icon with tooltip if value is invalid for the column type
 */
export function ValidationWarning({ value, columnType, children }: ValidationWarningProps) {
  // Skip validation for empty values
  if (value === null || value === undefined || value === '') {
    return <>{children}</>
  }

  const result = validateValue(value, columnType)

  if (result.isValid) {
    return <>{children}</>
  }

  const tooltipText = result.error + (result.suggestion ? ` (${result.suggestion})` : '')

  return (
    <div className="flex items-center gap-1">
      <span className="flex-1">{children}</span>
      <div className="dropdown dropdown-end dropdown-hover">
        <div tabIndex={0} role="button" className="cursor-help">
          <IconAlertTriangle className="h-4 w-4 text-warning flex-shrink-0" />
        </div>
        <div tabIndex={0} className="dropdown-content menu bg-warning text-warning-content rounded-box z-50 w-64 p-3 shadow-lg text-sm">
          {tooltipText}
        </div>
      </div>
    </div>
  )
}

/**
 * Hook to validate a row and get validation state
 */
export function useRowValidation(
  data: Record<string, unknown>,
  columns: Array<{ name: string; type: string; isRequired: boolean; defaultValue?: unknown }>
) {
  const [validationResults, setValidationResults] = React.useState<Map<string, ValidationResult>>(new Map())

  React.useEffect(() => {
    const results = new Map<string, ValidationResult>()

    for (const column of columns) {
      const value = data[column.name]

      // Check required fields
      if (column.isRequired && (value === null || value === undefined || value === '')) {
        if (column.defaultValue === null || column.defaultValue === undefined) {
          results.set(column.name, {
            isValid: false,
            error: 'Required field is empty'
          })
          continue
        }
      }

      // Validate value against type
      const result = validateValue(value, column.type)
      results.set(column.name, result)
    }

    setValidationResults(results)
  }, [data, columns])

  const isValid = Array.from(validationResults.values()).every(r => r.isValid)
  const invalidCount = Array.from(validationResults.values()).filter(r => !r.isValid).length

  return {
    validationResults,
    isValid,
    invalidCount,
    getValidation: (columnName: string) => validationResults.get(columnName) || { isValid: true }
  }
}

/**
 * Cell validation badge for showing validation status in compact form
 */
export function ValidationBadge({ result }: { result: ValidationResult }) {
  if (result.isValid) {
    return null
  }

  return (
    <span className="badge badge-warning badge-xs gap-1" title={result.error}>
      <IconAlertTriangle className="h-3 w-3" />
    </span>
  )
}
