/**
 * Add Row Page - Create new data row in a dynamic table
 * Handles both built-in column types and module-provided column types
 */

'use client'

import React, { useEffect, useState } from 'react'
import { clientApiRequest } from '@/lib/client-api'
import { TableColumn, validateColumnValue } from '@/types/dynamic-tables'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { ChipSelect, type ChipSelectOption } from '@/components/ui/chip-select'
import { Button } from '@/components/ui/button'
import { CountrySelect } from '@/components/ui/country-select'
import { TablePageHeader } from '@/components/tables/page-header'
import { toDisplayName } from '@/utils/column-name-utils'
import { IconPlus, IconArrowLeft } from '@tabler/icons-react'

interface ModuleColumnTypeOption {
  value: string
  label: string
  raw?: Record<string, unknown>
}

interface ModuleTypeData {
  options: ModuleColumnTypeOption[]
  multiValue: boolean
}

/**
 * Normalize phone number to digits only (with optional leading +)
 * Accepts formats like +1 (555) 123-4567, (555) 123-4567, 555.123.4567
 * Returns only digits (optionally with leading +)
 */
function normalizePhoneNumber(value: string): string {
  if (!value) return ''
  const hasPlus = value.startsWith('+')
  const digits = value.replace(/\D/g, '')
  return hasPlus ? `+${digits}` : digits
}

// Helper to determine if an option is for business (from option's raw.business field)
// Returns 'business' for true, 'personal' for false, null for null (meaning both)
function getBusinessIndicator(option: ModuleColumnTypeOption): 'business' | 'personal' | null {
  if (!option.raw || !('business' in option.raw)) {
    return null
  }
  if (option.raw.business === null) {
    return null // null means it could be either business or personal
  }
  return option.raw.business === true ? 'business' : 'personal'
}

// Process module options: add [P]/[B] prefixes and duplicate null business options
function processModuleOptions(options: ModuleColumnTypeOption[]): ModuleColumnTypeOption[] {
  const processedOptions: ModuleColumnTypeOption[] = []

  for (const opt of options) {
    const indicator = getBusinessIndicator(opt)

    if (indicator === 'business') {
      // Business option - add [B] prefix and ensure unique value
      processedOptions.push({
        ...opt,
        value: opt.value.endsWith(':business') ? opt.value : `${opt.value}:business`,
        label: opt.label.startsWith('[B] ') ? opt.label : `[B] ${opt.label}`
      })
    } else if (indicator === 'personal') {
      // Personal option - add [P] prefix and ensure unique value
      processedOptions.push({
        ...opt,
        value: opt.value.endsWith(':personal') ? opt.value : `${opt.value}:personal`,
        label: opt.label.startsWith('[P] ') ? opt.label : `[P] ${opt.label}`
      })
    } else if (opt.raw && 'business' in opt.raw && opt.raw.business === null) {
      // Null business - duplicate as both [P] and [B] with unique values
      processedOptions.push({
        value: `${opt.value}:personal`,
        label: opt.label.startsWith('[P] ') ? opt.label : `[P] ${opt.label}`,
        raw: { ...opt.raw, business: false }
      })
      processedOptions.push({
        value: `${opt.value}:business`,
        label: opt.label.startsWith('[B] ') ? opt.label : `[B] ${opt.label}`,
        raw: { ...opt.raw, business: true }
      })
    } else {
      // No business indicator - keep as is
      processedOptions.push(opt)
    }
  }

  return processedOptions
}

// Process prefetched options if available
function processPreFetchedModuleOptions(
  prefetched: Record<string, ModuleColumnTypeOption[]> | undefined
): Record<string, ModuleTypeData> {
  if (!prefetched) return {}

  const processed: Record<string, ModuleTypeData> = {}
  for (const [columnName, options] of Object.entries(prefetched)) {
    // Legacy prefetched data doesn't have multiValue, default to false
    processed[columnName] = {
      options: processModuleOptions(options),
      multiValue: false
    }
  }
  return processed
}

interface AddRowPageProps {
  params: { id: string }
  columns?: TableColumn[]
  tableSchema?: { name?: string }
  moduleColumnTypeOptions?: Record<string, ModuleColumnTypeOption[]>
}

export default function AddRowPage({
  params,
  columns: prefetchedColumns,
  tableSchema: prefetchedTableSchema,
  moduleColumnTypeOptions: prefetchedModuleOptions
}: AddRowPageProps) {
  const tableId = params.id
  const [columns, setColumns] = useState<TableColumn[]>(prefetchedColumns || [])
  const [tableName, setTableName] = useState<string>(prefetchedTableSchema?.name || '')
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(!prefetchedColumns)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [moduleTypeOptions, setModuleTypeOptions] = useState<Record<string, ModuleTypeData>>(() => processPreFetchedModuleOptions(prefetchedModuleOptions))
  const [loadingModuleTypes, setLoadingModuleTypes] = useState<Set<string>>(new Set())

  // Use tableId from params
  const currentTableId = tableId

  // Initialize form data from prefetched columns
  useEffect(() => {
    if (prefetchedColumns && prefetchedColumns.length > 0) {
      const initialData: Record<string, any> = {}
      prefetchedColumns.forEach((col: TableColumn) => {
        if (col.defaultValue !== null && col.defaultValue !== undefined) {
          initialData[col.name] = col.defaultValue
        } else if (col.type === 'boolean') {
          initialData[col.name] = false
        }
      })
      setFormData(initialData)
    }
  }, [prefetchedColumns])

  // Only fetch schema if not prefetched
  useEffect(() => {
    if (currentTableId && !prefetchedColumns) {
      loadTableSchema()
    }
  }, [currentTableId, prefetchedColumns])

  // Load options for module column types - only if not prefetched
  useEffect(() => {
    if (prefetchedModuleOptions && Object.keys(prefetchedModuleOptions).length > 0) {
      // Already have prefetched options
      return
    }

    const loadAllModuleOptions = async () => {
      // Wait for hydration and initial requests to settle
      await new Promise(resolve => setTimeout(resolve, 500))

      const moduleColumns = columns.filter(c => isModuleColumnType(c.type))
      for (let i = 0; i < moduleColumns.length; i++) {
        const column = moduleColumns[i]
        if (column) {
          await loadModuleTypeOptions(column)
          // Delay between requests to avoid Workers runtime issues in dev
          if (i < moduleColumns.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 300))
          }
        }
      }
    }
    if (columns.length > 0) {
      loadAllModuleOptions()
    }
  }, [columns, prefetchedModuleOptions])

  const loadTableSchema = async () => {
    if (!currentTableId) return

    setIsLoading(true)
    try {
      const response = await clientApiRequest(`/api/tables/${currentTableId}/columns`)
      if (response.ok) {
        const result = await response.json() as { data?: TableColumn[] } | TableColumn[]
        const columnsData = (result as { data?: TableColumn[] }).data || result as TableColumn[]
        setColumns(columnsData)

        // Initialize form data with default values
        const initialData: Record<string, any> = {}
        columnsData.forEach((col: TableColumn) => {
          if (col.defaultValue !== null && col.defaultValue !== undefined) {
            initialData[col.name] = col.defaultValue
          } else if (col.type === 'boolean') {
            initialData[col.name] = false
          }
        })
        setFormData(initialData)
      }

      // Get table info for the header
      const tableResponse = await clientApiRequest(`/api/tables/${currentTableId}`)
      if (tableResponse.ok) {
        const tableResult = await tableResponse.json() as { data?: { name?: string }; name?: string }
        setTableName(tableResult.data?.name || tableResult.name || '')
      }
    } catch (error) {
      console.error('Failed to load table schema:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const isModuleColumnType = (type: string): boolean => {
    // Module column types contain a colon (e.g., "@store/phone-numbers:provider")
    return type.includes(':')
  }

  const loadModuleTypeOptions = async (column: TableColumn, retryCount = 0): Promise<void> => {
    if (!isModuleColumnType(column.type)) return
    if (moduleTypeOptions[column.name]) return // Already loaded
    if (loadingModuleTypes.has(column.name) && retryCount === 0) return // Already loading (but allow retries)

    if (retryCount === 0) {
      setLoadingModuleTypes(prev => new Set(prev).add(column.name))
    }

    const maxRetries = 2

    try {
      // Call the module's data source endpoint
      // The type is in format "moduleId:columnTypeId"
      const [moduleId, columnTypeId] = column.type.split(':')

      const response = await clientApiRequest(`/api/admin/modules/${encodeURIComponent(moduleId)}/column-types/${encodeURIComponent(columnTypeId)}/options`)

      if (response.ok) {
        const result = await response.json() as {
          data?: Array<{ value: string; label: string; raw?: Record<string, unknown> }>;
          options?: Array<{ value: string; label: string; raw?: Record<string, unknown> }>;
          multiValue?: boolean;
        }
        const rawOptions = result.data || result.options || []
        const multiValue = result.multiValue || false

        // Map options with raw field included
        const mappedOptions = Array.isArray(rawOptions) ? rawOptions.map((opt: any) => ({
          value: opt.value || opt.id || opt,
          label: opt.label || opt.name || opt.value || opt,
          raw: opt.raw
        })) : []

        // Process options to add [P]/[B] prefixes and duplicate null business options
        const processedOptions = processModuleOptions(mappedOptions)

        setModuleTypeOptions(prev => ({
          ...prev,
          [column.name]: {
            options: processedOptions,
            multiValue: multiValue
          }
        }))
      } else {
        // Retry on server errors
        if (response.status >= 500 && retryCount < maxRetries) {
          console.log(`Retrying ${column.type} (attempt ${retryCount + 2}/${maxRetries + 1})...`)
          await new Promise(resolve => setTimeout(resolve, 200 * (retryCount + 1)))
          return loadModuleTypeOptions(column, retryCount + 1)
        }
        console.error(`Failed to load options for ${column.type}:`, await response.text())
        setModuleTypeOptions(prev => ({
          ...prev,
          [column.name]: { options: [], multiValue: false }
        }))
      }
    } catch (error) {
      // Retry on network errors (including Workers runtime cancellation)
      if (retryCount < maxRetries) {
        console.log(`Retrying ${column.type} after error (attempt ${retryCount + 2}/${maxRetries + 1})...`)
        await new Promise(resolve => setTimeout(resolve, 200 * (retryCount + 1)))
        return loadModuleTypeOptions(column, retryCount + 1)
      }
      console.error(`Error loading module type options for ${column.name}:`, error)
      setModuleTypeOptions(prev => ({
        ...prev,
        [column.name]: { options: [], multiValue: false }
      }))
    } finally {
      if (retryCount === 0 || retryCount >= maxRetries || moduleTypeOptions[column.name]?.options?.length) {
        setLoadingModuleTypes(prev => {
          const next = new Set(prev)
          next.delete(column.name)
          return next
        })
      }
    }
  }

  const handleChange = (columnName: string, value: any) => {
    setFormData(prev => ({ ...prev, [columnName]: value }))
    // Clear error when user changes value
    if (errors[columnName]) {
      setErrors(prev => {
        const next = { ...prev }
        delete next[columnName]
        return next
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    columns.forEach(column => {
      const value = formData[column.name]
      const validation = validateColumnValue(value, column)
      if (!validation.valid && validation.error) {
        newErrors[column.name] = validation.error
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      // Normalize phone numbers before submission
      const normalizedFormData = { ...formData }
      columns.forEach(column => {
        if (column.type === 'phone' && normalizedFormData[column.name]) {
          normalizedFormData[column.name] = normalizePhoneNumber(normalizedFormData[column.name])
        }
      })

      const response = await clientApiRequest(`/api/tables/${currentTableId}/data`, {
        method: 'POST',
        body: JSON.stringify({ data: normalizedFormData })
      })

      if (response.ok) {
        // Navigate back to data page
        window.location.href = `/dashboard/tables/${currentTableId}/data`
      } else {
        const errorResult = await response.json() as { message?: string }
        setErrors({ _form: errorResult.message || 'Failed to create row' })
      }
    } catch (error) {
      setErrors({ _form: error instanceof Error ? error.message : 'Failed to create row' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderField = (column: TableColumn) => {
    const displayName = toDisplayName(column.name)
    const value = formData[column.name] ?? ''
    const error = errors[column.name]
    const isRequired = column.isRequired && !column.defaultValue

    // Handle module column types
    if (isModuleColumnType(column.type)) {
      const moduleTypeData = moduleTypeOptions[column.name]
      const options = moduleTypeData?.options || []
      const multiValue = moduleTypeData?.multiValue || false
      const isLoadingOptions = loadingModuleTypes.has(column.name)

      // Check if any option has business indicator (for styling with [B]/[P] badges)
      const hasBusinessIndicator = options.some(opt => getBusinessIndicator(opt) !== null)

      // Convert options to ChipSelectOption format
      const chipOptions: ChipSelectOption[] = options.map(opt => ({
        value: opt.value,
        label: opt.label,
        group: getBusinessIndicator(opt),
        raw: opt.raw
      }))

      // For multi-select fields (multiValue from module manifest), value should be an array
      const arrayValue = Array.isArray(value) ? value : (value ? [value] : [])

      // Only span full width for ChipSelect (multi-select with business indicator)
      const spanFullWidth = hasBusinessIndicator

      return (
        <div key={column.id} className={`form-control w-full ${spanFullWidth ? 'md:col-span-2' : ''}`}>
          <label className="label">
            <span className="label-text">
              {displayName}
              {isRequired && <span className="text-error ml-1">*</span>}
            </span>
            {hasBusinessIndicator && (
              <span className="label-text-alt flex gap-2">
                <span className="badge badge-xs badge-primary">B = Business</span>
                <span className="badge badge-xs badge-ghost">P = Personal</span>
              </span>
            )}
          </label>
          {isLoadingOptions ? (
            <div className="flex items-center gap-2 h-12 px-4 border rounded-lg border-base-300">
              <span className="loading loading-spinner loading-sm"></span>
              <span className="text-base-content/60">Loading options...</span>
            </div>
          ) : options.length > 0 ? (
            // Use ChipSelect for multiValue columns (from module manifest) OR columns with business indicators
            multiValue || hasBusinessIndicator ? (
              <ChipSelect
                options={chipOptions}
                value={arrayValue}
                onChange={(values) => handleChange(column.name, values)}
                placeholder={`Select ${displayName.toLowerCase()}...`}
                showGroupBadges={hasBusinessIndicator}
                error={error}
              />
            ) : (
              <Select
                value={value}
                onChange={(e) => handleChange(column.name, e.target.value)}
                options={options}
                placeholder={`Select ${displayName.toLowerCase()}...`}
                color={error ? 'error' : 'default'}
              />
            )
          ) : (
            <Input
              value={value}
              onChange={(e) => handleChange(column.name, e.target.value)}
              placeholder={`Enter ${displayName.toLowerCase()}...`}
              color={error ? 'error' : 'default'}
            />
          )}
          {error && !(multiValue || hasBusinessIndicator) && (
            <label className="label">
              <span className="label-text-alt text-error">{error}</span>
            </label>
          )}
        </div>
      )
    }

    // Handle built-in column types
    switch (column.type) {
      case 'boolean':
        return (
          <div key={column.id} className="form-control w-full">
            <label className="label cursor-pointer justify-start gap-4">
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={value === true || value === 'true'}
                onChange={(e) => handleChange(column.name, e.target.checked)}
              />
              <span className="label-text">
                {displayName}
                {isRequired && <span className="text-error ml-1">*</span>}
              </span>
            </label>
            {error && (
              <label className="label">
                <span className="label-text-alt text-error">{error}</span>
              </label>
            )}
          </div>
        )

      case 'country':
        return (
          <div key={column.id} className="form-control w-full">
            <CountrySelect
              label={displayName}
              value={value}
              onChange={(val) => handleChange(column.name, val)}
              required={isRequired}
              color={error ? 'error' : 'default'}
            />
            {error && (
              <label className="label">
                <span className="label-text-alt text-error">{error}</span>
              </label>
            )}
          </div>
        )

      case 'date':
        return (
          <div key={column.id} className="form-control w-full">
            <label className="label">
              <span className="label-text">
                {displayName}
                {isRequired && <span className="text-error ml-1">*</span>}
              </span>
            </label>
            <Input
              type="date"
              value={value}
              onChange={(e) => handleChange(column.name, e.target.value)}
              color={error ? 'error' : 'default'}
            />
            {error && (
              <label className="label">
                <span className="label-text-alt text-error">{error}</span>
              </label>
            )}
          </div>
        )

      case 'datetime':
        return (
          <div key={column.id} className="form-control w-full">
            <label className="label">
              <span className="label-text">
                {displayName}
                {isRequired && <span className="text-error ml-1">*</span>}
              </span>
            </label>
            <Input
              type="datetime-local"
              value={value}
              onChange={(e) => handleChange(column.name, e.target.value)}
              color={error ? 'error' : 'default'}
            />
            {error && (
              <label className="label">
                <span className="label-text-alt text-error">{error}</span>
              </label>
            )}
          </div>
        )

      case 'time':
        return (
          <div key={column.id} className="form-control w-full">
            <label className="label">
              <span className="label-text">
                {displayName}
                {isRequired && <span className="text-error ml-1">*</span>}
              </span>
            </label>
            <Input
              type="time"
              value={value}
              onChange={(e) => handleChange(column.name, e.target.value)}
              color={error ? 'error' : 'default'}
            />
            {error && (
              <label className="label">
                <span className="label-text-alt text-error">{error}</span>
              </label>
            )}
          </div>
        )

      case 'number':
      case 'integer':
      case 'float':
      case 'currency':
      case 'percentage':
        return (
          <div key={column.id} className="form-control w-full">
            <label className="label">
              <span className="label-text">
                {displayName}
                {isRequired && <span className="text-error ml-1">*</span>}
              </span>
            </label>
            <Input
              type="number"
              value={value}
              onChange={(e) => handleChange(column.name, e.target.value === '' ? '' : Number(e.target.value))}
              step={column.type === 'integer' ? '1' : 'any'}
              placeholder={`Enter ${displayName.toLowerCase()}...`}
              color={error ? 'error' : 'default'}
            />
            {error && (
              <label className="label">
                <span className="label-text-alt text-error">{error}</span>
              </label>
            )}
          </div>
        )

      case 'email':
        return (
          <div key={column.id} className="form-control w-full">
            <label className="label">
              <span className="label-text">
                {displayName}
                {isRequired && <span className="text-error ml-1">*</span>}
              </span>
            </label>
            <Input
              type="email"
              value={value}
              onChange={(e) => handleChange(column.name, e.target.value)}
              placeholder={`Enter ${displayName.toLowerCase()}...`}
              color={error ? 'error' : 'default'}
              autoComplete="off"
            />
            {error && (
              <label className="label">
                <span className="label-text-alt text-error">{error}</span>
              </label>
            )}
          </div>
        )

      case 'url':
        return (
          <div key={column.id} className="form-control w-full">
            <label className="label">
              <span className="label-text">
                {displayName}
                {isRequired && <span className="text-error ml-1">*</span>}
              </span>
            </label>
            <Input
              type="url"
              value={value}
              onChange={(e) => handleChange(column.name, e.target.value)}
              placeholder="https://..."
              color={error ? 'error' : 'default'}
              autoComplete="off"
            />
            {error && (
              <label className="label">
                <span className="label-text-alt text-error">{error}</span>
              </label>
            )}
          </div>
        )

      case 'textarea':
        return (
          <div key={column.id} className="form-control w-full">
            <label className="label">
              <span className="label-text">
                {displayName}
                {isRequired && <span className="text-error ml-1">*</span>}
              </span>
            </label>
            <textarea
              className={`textarea textarea-bordered w-full ${error ? 'textarea-error' : ''}`}
              value={value}
              onChange={(e) => handleChange(column.name, e.target.value)}
              placeholder={`Enter ${displayName.toLowerCase()}...`}
              rows={4}
            />
            {error && (
              <label className="label">
                <span className="label-text-alt text-error">{error}</span>
              </label>
            )}
          </div>
        )

      case 'color':
        return (
          <div key={column.id} className="form-control w-full">
            <label className="label">
              <span className="label-text">
                {displayName}
                {isRequired && <span className="text-error ml-1">*</span>}
              </span>
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={value || '#000000'}
                onChange={(e) => handleChange(column.name, e.target.value)}
                className="w-12 h-12 rounded cursor-pointer border-0"
              />
              <Input
                value={value}
                onChange={(e) => handleChange(column.name, e.target.value)}
                placeholder="#000000"
                color={error ? 'error' : 'default'}
                className="flex-1"
              />
            </div>
            {error && (
              <label className="label">
                <span className="label-text-alt text-error">{error}</span>
              </label>
            )}
          </div>
        )

      case 'rating':
        return (
          <div key={column.id} className="form-control w-full">
            <label className="label">
              <span className="label-text">
                {displayName}
                {isRequired && <span className="text-error ml-1">*</span>}
              </span>
            </label>
            <div className="rating rating-lg">
              {[1, 2, 3, 4, 5].map(star => (
                <input
                  key={star}
                  type="radio"
                  name={`rating-${column.id}`}
                  className="mask mask-star-2 bg-orange-400"
                  checked={value === star}
                  onChange={() => handleChange(column.name, star)}
                />
              ))}
            </div>
            {error && (
              <label className="label">
                <span className="label-text-alt text-error">{error}</span>
              </label>
            )}
          </div>
        )

      case 'text':
      default:
        return (
          <div key={column.id} className="form-control w-full">
            <label className="label">
              <span className="label-text">
                {displayName}
                {isRequired && <span className="text-error ml-1">*</span>}
              </span>
            </label>
            <Input
              value={value}
              onChange={(e) => handleChange(column.name, e.target.value)}
              placeholder={`Enter ${displayName.toLowerCase()}...`}
              color={error ? 'error' : 'default'}
              autoComplete="off"
            />
            {error && (
              <label className="label">
                <span className="label-text-alt text-error">{error}</span>
              </label>
            )}
          </div>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <TablePageHeader
        subtitle={<>Add new row to <strong>{tableName}</strong></>}
        tableId={currentTableId || ''}
        activePage="data"
        tableName={tableName}
        icon={IconPlus}
      />

      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors._form && (
              <div className="alert alert-error">
                <svg className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>{errors._form}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {columns
                .sort((a, b) => a.position - b.position)
                .map(column => renderField(column))}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                style="ghost"
                icon={IconArrowLeft}
                onClick={() => window.location.href = `/dashboard/tables/${currentTableId}/data`}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                color="primary"
                icon={IconPlus}
                processing={isSubmitting}
              >
                Add Row
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
