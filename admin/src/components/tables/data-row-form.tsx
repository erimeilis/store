/**
 * DataRowForm - Shared form component for Add and Edit row pages
 * DRY component to avoid duplication between add/page.tsx and edit/[rowId]/page.tsx
 */

'use client'

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { clientApiRequest } from '@/lib/client-api'
import { TableColumn, validateColumnValue } from '@/types/dynamic-tables'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { ChipSelect, type ChipSelectOption } from '@/components/ui/chip-select'
import { Button } from '@/components/ui/button'
import { CountrySelect } from '@/components/ui/country-select'
import { toDisplayName } from '@/utils/column-name-utils'
import { IconPlus, IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react'

export interface ModuleColumnTypeOption {
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
 */
function normalizePhoneNumber(value: string): string {
  if (!value) return ''
  const hasPlus = value.startsWith('+')
  const digits = value.replace(/\D/g, '')
  return hasPlus ? `+${digits}` : digits
}

/**
 * Get business indicator from option's raw.business field
 */
function getBusinessIndicator(option: ModuleColumnTypeOption): 'business' | 'personal' | null {
  if (!option.raw || !('business' in option.raw)) {
    return null
  }
  if (option.raw.business === null) {
    return null
  }
  return option.raw.business === true ? 'business' : 'personal'
}

/**
 * Process module options: add [P]/[B] prefixes and duplicate null business options
 */
function processModuleOptions(options: ModuleColumnTypeOption[]): ModuleColumnTypeOption[] {
  const processedOptions: ModuleColumnTypeOption[] = []

  for (const opt of options) {
    const indicator = getBusinessIndicator(opt)

    if (indicator === 'business') {
      processedOptions.push({
        ...opt,
        value: opt.value.endsWith(':business') ? opt.value : `${opt.value}:business`,
        label: opt.label.startsWith('[B] ') ? opt.label : `[B] ${opt.label}`
      })
    } else if (indicator === 'personal') {
      processedOptions.push({
        ...opt,
        value: opt.value.endsWith(':personal') ? opt.value : `${opt.value}:personal`,
        label: opt.label.startsWith('[P] ') ? opt.label : `[P] ${opt.label}`
      })
    } else if (opt.raw && 'business' in opt.raw && opt.raw.business === null) {
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
      processedOptions.push(opt)
    }
  }

  return processedOptions
}

export interface DataRowFormProps {
  tableId: string
  columns: TableColumn[]
  initialData?: Record<string, any>
  moduleColumnTypeOptions?: Record<string, ModuleColumnTypeOption[]>
  onSubmit: (data: Record<string, any>) => Promise<void>
  onCancel: () => void
  mode: 'add' | 'edit'
  isSubmitting?: boolean
  submitError?: string
}

export function DataRowForm({
  tableId,
  columns,
  initialData = {},
  moduleColumnTypeOptions: prefetchedModuleOptions,
  onSubmit,
  onCancel,
  mode,
  isSubmitting = false,
  submitError
}: DataRowFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [moduleTypeOptions, setModuleTypeOptions] = useState<Record<string, ModuleTypeData>>({})
  const [loadingModuleTypes, setLoadingModuleTypes] = useState<Set<string>>(new Set())

  // Initialize form data when initial data changes (for edit mode)
  useEffect(() => {
    if (Object.keys(initialData).length > 0) {
      setFormData(initialData)
    }
  }, [initialData])

  // Initialize form data with default values for add mode
  useEffect(() => {
    if (mode === 'add' && columns.length > 0 && Object.keys(formData).length === 0) {
      const defaultData: Record<string, any> = {}
      columns.forEach((col: TableColumn) => {
        if (col.defaultValue !== null && col.defaultValue !== undefined) {
          defaultData[col.name] = col.defaultValue
        } else if (col.type === 'boolean') {
          defaultData[col.name] = false
        }
      })
      setFormData(defaultData)
    }
  }, [columns, mode])

  // Process prefetched options
  useEffect(() => {
    if (prefetchedModuleOptions && Object.keys(prefetchedModuleOptions).length > 0) {
      const processed: Record<string, ModuleTypeData> = {}
      for (const [columnName, options] of Object.entries(prefetchedModuleOptions)) {
        processed[columnName] = {
          options: processModuleOptions(options),
          multiValue: false
        }
      }
      setModuleTypeOptions(processed)
    }
  }, [prefetchedModuleOptions])

  // Load options for module column types
  useEffect(() => {
    if (prefetchedModuleOptions && Object.keys(prefetchedModuleOptions).length > 0) {
      return
    }

    const loadAllModuleOptions = async () => {
      await new Promise(resolve => setTimeout(resolve, 500))
      const moduleColumns = columns.filter(c => isModuleColumnType(c.type))
      for (let i = 0; i < moduleColumns.length; i++) {
        const column = moduleColumns[i]
        if (column) {
          await loadModuleTypeOptions(column)
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

  const isModuleColumnType = (type: string): boolean => {
    return type.includes(':')
  }

  const loadModuleTypeOptions = async (column: TableColumn, retryCount = 0): Promise<void> => {
    if (!isModuleColumnType(column.type)) return
    if (moduleTypeOptions[column.name]) return
    if (loadingModuleTypes.has(column.name) && retryCount === 0) return

    if (retryCount === 0) {
      setLoadingModuleTypes(prev => new Set(prev).add(column.name))
    }

    const maxRetries = 2

    try {
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

        const mappedOptions = Array.isArray(rawOptions) ? rawOptions.map((opt: any) => ({
          value: opt.value || opt.id || opt,
          label: opt.label || opt.name || opt.value || opt,
          raw: opt.raw
        })) : []

        const processedOptions = processModuleOptions(mappedOptions)

        setModuleTypeOptions(prev => ({
          ...prev,
          [column.name]: {
            options: processedOptions,
            multiValue: multiValue
          }
        }))
      } else {
        if (response.status >= 500 && retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 200 * (retryCount + 1)))
          return loadModuleTypeOptions(column, retryCount + 1)
        }
        setModuleTypeOptions(prev => ({
          ...prev,
          [column.name]: { options: [], multiValue: false }
        }))
      }
    } catch (error) {
      if (retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 200 * (retryCount + 1)))
        return loadModuleTypeOptions(column, retryCount + 1)
      }
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

    // Normalize phone numbers before submission
    const normalizedFormData = { ...formData }
    columns.forEach(column => {
      if (column.type === 'phone' && normalizedFormData[column.name]) {
        normalizedFormData[column.name] = normalizePhoneNumber(normalizedFormData[column.name])
      }
    })

    await onSubmit(normalizedFormData)
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

      const hasBusinessIndicator = options.some(opt => getBusinessIndicator(opt) !== null)

      const chipOptions: ChipSelectOption[] = options.map(opt => ({
        value: opt.value,
        label: opt.label,
        group: getBusinessIndicator(opt),
        raw: opt.raw
      }))

      // Convert value to array format for ChipSelect
      // Handle: arrays, comma-separated strings, and single values
      // Always trim and filter to ensure clean values for matching
      let arrayValue: string[] = []
      if (Array.isArray(value)) {
        // Trim each value in case of whitespace and filter out empty strings
        arrayValue = value.map(v => typeof v === 'string' ? v.trim() : String(v)).filter(Boolean)
      } else if (typeof value === 'string' && value.trim()) {
        // Split comma-separated values and trim each
        arrayValue = value.split(',').map(v => v.trim()).filter(Boolean)
      }
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
              value={value ? (typeof value === 'string' && value.includes('T') ? value.split('T')[0] : value) : ''}
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
          <div key={column.id} className="form-control w-full md:col-span-2">
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

  const sortedColumns = useMemo(
    () => [...columns].sort((a, b) => a.position - b.position),
    [columns]
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {(submitError || errors._form) && (
        <div className="alert alert-error">
          <svg className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span>{submitError || errors._form}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedColumns.map(column => renderField(column))}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          style="ghost"
          icon={IconArrowLeft}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          color="primary"
          icon={mode === 'add' ? IconPlus : IconDeviceFloppy}
          processing={isSubmitting}
        >
          {mode === 'add' ? 'Add Row' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}
