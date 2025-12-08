/**
 * Table Data Row Edit Page
 * Edit a specific row of data within a dynamic table
 */

'use client'

import React, {useEffect, useState} from 'react'
import {Button} from '@/components/ui/button'
import {Card, CardBody, CardTitle} from '@/components/ui/card'
import {Input} from '@/components/ui/input'
import {Textarea} from '@/components/ui/textarea'
import {Checkbox} from '@/components/ui/checkbox'
import {Alert} from '@/components/ui/alert'
import {Select} from '@/components/ui/select'
import InputError from '@/components/ui/input-error'
import {PageHeader} from '@/components/page/page-header'
import {IconEdit} from '@tabler/icons-react'
import {CountrySelect} from '@/components/ui/country-select'
import {ParsedTableData, TableColumn, TableDataRow, TableSchema, UpdateTableDataRequest, validateColumnValue} from '@/types/dynamic-tables'
import {clientApiRequest} from '@/lib/client-api'
import {toDisplayName} from '@/utils/column-name-utils'

interface ValidationErrors {
    general?: string;

    [key: string]: string | undefined;
}

interface ModuleColumnTypeOptions {
    [columnName: string]: Array<{ value: string; label: string }>
}

interface TableDataEditPageProps {
    tableId?: string;
    rowId?: string;
    initialTableSchema?: TableSchema | null;
    initialRowData?: TableDataRow | null;
}

export default function TableDataEditPage({
                                              tableId,
                                              rowId,
                                              initialTableSchema = null,
                                              initialRowData = null
                                          }: TableDataEditPageProps) {

    const [isLoading, setIsLoading] = useState(!initialTableSchema || !initialRowData)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errors, setErrors] = useState<ValidationErrors>({})

    const [tableSchema, setTableSchema] = useState<TableSchema | null>(initialTableSchema)
    const [rowData, setRowData] = useState<TableDataRow | null>(initialRowData)
    const [formData, setFormData] = useState<ParsedTableData>(initialRowData?.data || {})
    const [moduleTypeOptions, setModuleTypeOptions] = useState<ModuleColumnTypeOptions>({})
    const [loadingModuleTypes, setLoadingModuleTypes] = useState<Set<string>>(new Set())

    // Load table schema and row data if not provided
    useEffect(() => {
        if (!tableSchema || !rowData) {
            if (tableId && rowId) {
                loadData()
            }
        }
    }, [tableId, rowId, tableSchema, rowData])

    // Load options for module column types
    useEffect(() => {
        if (tableSchema?.columns) {
            tableSchema.columns.forEach(column => {
                if (isModuleColumnType(column.type)) {
                    loadModuleTypeOptions(column)
                }
            })
        }
    }, [tableSchema])

    const isModuleColumnType = (type: string): boolean => {
        // Module column types contain a colon (e.g., "@store/phone-numbers:provider")
        return type.includes(':')
    }

    const loadModuleTypeOptions = async (column: TableColumn) => {
        if (!isModuleColumnType(column.type)) return
        if (moduleTypeOptions[column.name]) return // Already loaded
        if (loadingModuleTypes.has(column.name)) return // Already loading

        setLoadingModuleTypes(prev => new Set(prev).add(column.name))

        try {
            // Call the module's data source endpoint
            // The type is in format "moduleId:columnTypeId"
            const [moduleId, columnTypeId] = column.type.split(':')

            const response = await clientApiRequest(`/api/admin/modules/${encodeURIComponent(moduleId)}/column-types/${encodeURIComponent(columnTypeId)}/options`)

            if (response.ok) {
                const result = await response.json() as { data?: Array<{ value: string; label: string }>; options?: Array<{ value: string; label: string }> }
                const options = result.data || result.options || []

                setModuleTypeOptions(prev => ({
                    ...prev,
                    [column.name]: Array.isArray(options) ? options.map((opt: any) => ({
                        value: opt.value || opt.id || opt,
                        label: opt.label || opt.name || opt.value || opt
                    })) : []
                }))
            } else {
                console.error(`Failed to load options for ${column.type}:`, await response.text())
                setModuleTypeOptions(prev => ({
                    ...prev,
                    [column.name]: []
                }))
            }
        } catch (error) {
            console.error(`Error loading module type options for ${column.name}:`, error)
            setModuleTypeOptions(prev => ({
                ...prev,
                [column.name]: []
            }))
        } finally {
            setLoadingModuleTypes(prev => {
                const next = new Set(prev)
                next.delete(column.name)
                return next
            })
        }
    }

    const loadData = async () => {
        setIsLoading(true)
        try {
            // Load table schema and row data in parallel
            const [schemaResponse, rowResponse] = await Promise.all([
                clientApiRequest(`/api/tables/${tableId}`),
                clientApiRequest(`/api/tables/${tableId}/data/${rowId}`)
            ])

            if (!schemaResponse.ok) {
                const errorData = await schemaResponse.json() as any
                setErrors({general: errorData.message || 'Failed to load table schema'})
                return
            }

            if (!rowResponse.ok) {
                const errorData = await rowResponse.json() as any
                setErrors({general: errorData.message || 'Failed to load row data'})
                return
            }

            const schemaResult = await schemaResponse.json() as any
            const rowResult = await rowResponse.json() as any

            setTableSchema(schemaResult.table)
            setRowData(rowResult.row)
            setFormData(rowResult.row.data || {})

        } catch (error) {
            setErrors({
                general: error instanceof Error ? error.message : 'Failed to load data'
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleInputChange = (columnName: string, value: any) => {
        setFormData(prev => ({...prev, [columnName]: value}))
        // Clear related errors
        setErrors(prev => ({...prev, [columnName]: undefined, general: undefined}))
    }

    const validateForm = (): boolean => {
        if (!tableSchema) return false

        const newErrors: ValidationErrors = {}

        // Validate each column
        for (const column of tableSchema.columns) {
            const value = formData[column.name]
            const validation = validateColumnValue(value, column)

            if (!validation.valid && validation.error) {
                newErrors[column.name] = validation.error
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm() || !tableId || !rowId) {
            return
        }

        setIsSubmitting(true)
        setErrors({})

        try {
            const requestData: UpdateTableDataRequest = {
                data: formData
            }

            const response = await clientApiRequest(`/api/tables/${tableId}/data/${rowId}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(requestData)
            })

            if (response.ok) {
                // Navigate back to table data view
                window.location.href = `/dashboard/tables/${tableId}/data`
            } else {
                const errorData = await response.json() as any
                setErrors({
                    general: errorData.message || 'Failed to update row'
                })
            }
        } catch (error) {
            setErrors({
                general: error instanceof Error ? error.message : 'An unexpected error occurred'
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCancel = () => {
        window.location.href = `/dashboard/tables/${tableId}/data`
    }

    const renderField = (column: TableColumn) => {
        const displayName = toDisplayName(column.name)
        const value = formData[column.name] ?? (column.defaultValue || column.default_value || '')
        const error = errors[column.name]
        const isRequired = (column.isRequired || column.is_required) && !(column.defaultValue || column.default_value)

        // Handle module column types first
        if (isModuleColumnType(column.type)) {
            const options = moduleTypeOptions[column.name] || []
            const isLoadingOptions = loadingModuleTypes.has(column.name)

            return (
                <div className="form-control w-full">
                    <label className="label">
                        <span className="label-text">
                            {displayName}
                            {isRequired && <span className="text-error ml-1">*</span>}
                        </span>
                    </label>
                    {isLoadingOptions ? (
                        <div className="flex items-center gap-2 h-12 px-4 border rounded-lg border-base-300">
                            <span className="loading loading-spinner loading-sm"></span>
                            <span className="text-base-content/60">Loading options...</span>
                        </div>
                    ) : options.length > 0 ? (
                        <Select
                            value={value}
                            onChange={(e) => handleInputChange(column.name, e.target.value)}
                            options={options}
                            placeholder={`Select ${displayName.toLowerCase()}...`}
                            color={error ? 'error' : 'default'}
                        />
                    ) : (
                        <Input
                            value={value}
                            onChange={(e) => handleInputChange(column.name, e.target.value)}
                            placeholder={`Enter ${displayName.toLowerCase()}...`}
                            color={error ? 'error' : 'default'}
                        />
                    )}
                </div>
            )
        }

        // Handle built-in column types
        switch (column.type) {
            case 'textarea':
                return (
                    <Textarea
                        value={value}
                        onChange={(e) => handleInputChange(column.name, e.target.value)}
                        label={displayName}
                        placeholder={`Type ${column.type}`}
                        rows={4}
                        color={error ? 'error' : 'default'}
                        required={isRequired}
                    />
                )

            case 'number':
            case 'integer':
            case 'float':
            case 'currency':
            case 'percentage':
                return (
                    <Input
                        type="number"
                        value={value}
                        onChange={(e) => handleInputChange(column.name, e.target.value === '' ? '' : Number(e.target.value))}
                        label={displayName}
                        placeholder={`Enter ${displayName.toLowerCase()}...`}
                        step={column.type === 'integer' ? '1' : 'any'}
                        color={error ? 'error' : 'default'}
                        required={isRequired}
                    />
                )

            case 'date':
                return (
                    <Input
                        type="date"
                        value={value ? new Date(value).toISOString().split('T')[0] : ''}
                        onChange={(e) => handleInputChange(column.name, e.target.value)}
                        label={displayName}
                        placeholder={`Select ${displayName.toLowerCase()}...`}
                        color={error ? 'error' : 'default'}
                        required={isRequired}
                    />
                )

            case 'datetime':
                return (
                    <Input
                        type="datetime-local"
                        value={value}
                        onChange={(e) => handleInputChange(column.name, e.target.value)}
                        label={displayName}
                        color={error ? 'error' : 'default'}
                        required={isRequired}
                    />
                )

            case 'time':
                return (
                    <Input
                        type="time"
                        value={value}
                        onChange={(e) => handleInputChange(column.name, e.target.value)}
                        label={displayName}
                        color={error ? 'error' : 'default'}
                        required={isRequired}
                    />
                )

            case 'boolean':
                return (
                    <div className="form-control w-full">
                        <label className="label cursor-pointer justify-start gap-4">
                            <input
                                type="checkbox"
                                className="toggle toggle-primary"
                                checked={value === true || value === 'true'}
                                onChange={(e) => handleInputChange(column.name, e.target.checked)}
                            />
                            <span className="label-text">
                                {displayName}
                                {isRequired && <span className="text-error ml-1">*</span>}
                            </span>
                        </label>
                    </div>
                )

            case 'email':
                return (
                    <Input
                        type="email"
                        value={value}
                        onChange={(e) => handleInputChange(column.name, e.target.value)}
                        label={displayName}
                        placeholder={`Enter ${displayName.toLowerCase()}...`}
                        color={error ? 'error' : 'default'}
                        required={isRequired}
                        autoComplete="off"
                    />
                )

            case 'url':
                return (
                    <Input
                        type="url"
                        value={value}
                        onChange={(e) => handleInputChange(column.name, e.target.value)}
                        label={displayName}
                        placeholder="https://..."
                        color={error ? 'error' : 'default'}
                        required={isRequired}
                        autoComplete="off"
                    />
                )

            case 'country':
                return (
                    <CountrySelect
                        value={value}
                        onChange={(v) => handleInputChange(column.name, v)}
                        label={displayName}
                        placeholder="Select a country..."
                        color={error ? 'error' : 'default'}
                        required={isRequired}
                    />
                )

            case 'color':
                return (
                    <div className="form-control w-full">
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
                                onChange={(e) => handleInputChange(column.name, e.target.value)}
                                className="w-12 h-12 rounded cursor-pointer border-0"
                            />
                            <Input
                                value={value}
                                onChange={(e) => handleInputChange(column.name, e.target.value)}
                                placeholder="#000000"
                                color={error ? 'error' : 'default'}
                                className="flex-1"
                            />
                        </div>
                    </div>
                )

            case 'rating':
                return (
                    <div className="form-control w-full">
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
                                    onChange={() => handleInputChange(column.name, star)}
                                />
                            ))}
                        </div>
                    </div>
                )

            case 'text':
            default:
                return (
                    <Input
                        type="text"
                        value={value}
                        onChange={(e) => handleInputChange(column.name, e.target.value)}
                        label={displayName}
                        placeholder={`Enter ${displayName.toLowerCase()}...`}
                        color={error ? 'error' : 'default'}
                        required={isRequired}
                        autoComplete="off"
                    />
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

    if (!tableSchema || !rowData) {
        return (
            <div className="space-y-6">
                <Alert color="error">
                    Failed to load table data. Please try again.
                </Alert>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <PageHeader
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Tables', href: '/dashboard/tables' },
                    { label: tableSchema.table.name, href: `/dashboard/tables/${tableId}/data` },
                    { label: 'Edit Row', current: true }
                ]}
                icon={IconEdit}
                title="Edit Row"
                subtitle={`Update data for this row in ${tableSchema.table.name}`}
            />

            {errors.general && (
                <Alert color="error" className="mb-6">
                    {errors.general}
                </Alert>
            )}

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardBody>
                        <CardTitle>Row Data</CardTitle>

                        {tableSchema.columns.map((column) => (
                            <div key={column.id}>
                                {renderField(column)}
                                <InputError message={errors[column.name]}/>
                                {column.default_value && (
                                    <p className="text-gray-500 text-xs mt-1">
                                        Default: {column.default_value}
                                    </p>
                                )}
                            </div>
                        ))}
                    </CardBody>
                </Card>

                {/* Actions */}
                <div className="flex justify-between items-center mt-6">
                    <Button
                        type="button"
                        style="ghost"
                        onClick={handleCancel}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        style="soft"
                        color="primary"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="loading loading-spinner loading-sm mr-2"></span>
                                Saving Changes...
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}

export const metadata = {
    title: 'Edit Row - Dynamic Tables',
    description: 'Edit table row data'
}
