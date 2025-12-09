/**
 * Validation Summary Banner
 * Shows aggregate validation status for table data
 * Part of "Warn-Don't-Block" validation pattern
 */

import React, { useState, useEffect } from 'react'
import { IconAlertTriangle, IconCheck, IconRefresh, IconEye, IconEyeOff, IconTrash } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { clientApiRequest } from '@/lib/client-api'

interface ColumnValidationSummary {
  columnName: string
  columnType: string
  invalidCount: number
  validCount: number
  sampleErrors: string[]
}

interface ValidationSummaryResponse {
  totalRows: number
  validRows: number
  invalidRows: number
  totalWarnings: number
  summary: ColumnValidationSummary[]
}

interface ValidationSummaryProps {
  tableId: string
  onValidationComplete?: (result: ValidationSummaryResponse) => void
  onDataChanged?: () => void
}

export function ValidationSummaryBanner({ tableId, onValidationComplete, onDataChanged }: ValidationSummaryProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [validationResult, setValidationResult] = useState<ValidationSummaryResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const runValidation = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await clientApiRequest(`/api/tables/${tableId}/validate`)

      if (response.ok) {
        const result = await response.json() as { data: ValidationSummaryResponse }
        setValidationResult(result.data)
        onValidationComplete?.(result.data)
      } else {
        const errorData = await response.json() as { message?: string }
        setError(errorData.message || 'Failed to validate table')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate table')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteInvalidRows = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true)
      return
    }

    setIsDeleting(true)
    setDeleteConfirm(false)

    try {
      const response = await clientApiRequest(`/api/tables/${tableId}/invalid-rows`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const result = await response.json() as { data: { deletedCount: number }, message: string }
        // Re-run validation to update the banner
        await runValidation()
        // Notify parent that data changed
        onDataChanged?.()
      } else {
        const errorData = await response.json() as { message?: string }
        setError(errorData.message || 'Failed to delete invalid rows')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete invalid rows')
    } finally {
      setIsDeleting(false)
    }
  }

  // Don't auto-run on mount - let user trigger validation
  // This avoids performance issues on large tables

  if (!validationResult && !isLoading && !error) {
    return (
      <div className="alert alert-info mb-4">
        <IconAlertTriangle className="h-5 w-5" />
        <div className="flex-1">
          <h3 className="font-bold">Data Quality Check Available</h3>
          <p className="text-sm">
            Run validation to check for data type mismatches and formatting issues.
          </p>
        </div>
        <Button
          size="sm"
          color="info"
          style="soft"
          onClick={runValidation}
          disabled={isLoading}
          icon={IconRefresh}
        >
          Validate Data
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="alert mb-4">
        <span className="loading loading-spinner loading-sm"></span>
        <span>Validating table data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-error mb-4">
        <IconAlertTriangle className="h-5 w-5" />
        <div className="flex-1">
          <span>{error}</span>
        </div>
        <Button
          size="sm"
          color="error"
          style="soft"
          onClick={runValidation}
          icon={IconRefresh}
        >
          Retry
        </Button>
      </div>
    )
  }

  if (!validationResult) {
    return null
  }

  // All valid - show success
  if (validationResult.invalidRows === 0) {
    return (
      <div className="alert alert-success mb-4">
        <IconCheck className="h-5 w-5" />
        <div className="flex-1">
          <h3 className="font-bold">All Data Valid</h3>
          <p className="text-sm">
            {validationResult.totalRows} row{validationResult.totalRows !== 1 ? 's' : ''} checked - no issues found.
          </p>
        </div>
        <Button
          size="sm"
          color="success"
          style="ghost"
          onClick={runValidation}
          icon={IconRefresh}
          title="Re-validate"
        >
          Re-check
        </Button>
      </div>
    )
  }

  // Has warnings
  const columnsWithIssues = validationResult.summary.filter(s => s.invalidCount > 0)

  return (
    <div className="alert alert-warning mb-4">
      <IconAlertTriangle className="h-5 w-5 flex-shrink-0" />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-bold">Data Quality Warnings</h3>
          <span className="badge badge-warning badge-sm">
            {validationResult.totalWarnings} issue{validationResult.totalWarnings !== 1 ? 's' : ''}
          </span>
        </div>
        <p className="text-sm">
          {validationResult.invalidRows} of {validationResult.totalRows} row{validationResult.totalRows !== 1 ? 's' : ''}{' '}
          have values that don't match their column type.
        </p>

        {/* Expandable details */}
        {showDetails && (
          <div className="mt-3 space-y-2">
            {columnsWithIssues.map((col) => (
              <div key={col.columnName} className="bg-base-100 p-2 rounded text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{col.columnName}</span>
                  <span className="badge badge-error badge-xs">{col.invalidCount} invalid</span>
                </div>
                <span className="text-xs text-gray-500">Type: {col.columnType}</span>
                {col.sampleErrors.length > 0 && (
                  <ul className="mt-1 text-xs text-gray-600 list-disc list-inside">
                    {col.sampleErrors.slice(0, 2).map((err, idx) => (
                      <li key={idx} className="truncate">{err}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-1">
        <Button
          size="sm"
          color="warning"
          style="ghost"
          onClick={() => setShowDetails(!showDetails)}
          icon={showDetails ? IconEyeOff : IconEye}
          title={showDetails ? 'Hide details' : 'Show details'}
        >
          {showDetails ? 'Hide' : 'Details'}
        </Button>
        <Button
          size="sm"
          color="warning"
          style="ghost"
          onClick={runValidation}
          icon={IconRefresh}
          title="Re-validate"
        >
          Re-check
        </Button>
        <Button
          size="sm"
          color="error"
          style={deleteConfirm ? 'default' : 'ghost'}
          onClick={deleteInvalidRows}
          icon={IconTrash}
          disabled={isDeleting}
          title={deleteConfirm ? 'Click again to confirm deletion' : 'Delete all invalid rows'}
        >
          {isDeleting ? 'Deleting...' : deleteConfirm ? 'Confirm Delete?' : 'Delete Invalid'}
        </Button>
      </div>
    </div>
  )
}
