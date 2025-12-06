/**
 * Table Creation Page
 * Form interface for creating new dynamic tables with columns
 */

'use client'

import React, {useState, useMemo} from 'react'
import {Button} from '@/components/ui/button'
import {Card, CardBody, CardTitle} from '@/components/ui/card'
import InputError from '@/components/ui/input-error'
import {Input} from '@/components/ui/input'
import {Select} from '@/components/ui/select'
import {Checkbox} from '@/components/ui/checkbox'
import {Alert} from '@/components/ui/alert'
import {TableInfoForm} from '@/components/tables/info-form'
import {
    ColumnFormData,
    ColumnType,
    TableFormData,
    TableType
} from '@/types/dynamic-tables'
import {useColumnTypes} from '@/hooks/useColumnTypes'
import {
    IconArrowDown,
    IconArrowUp,
    IconPlus,
    IconTrash,
    IconShoppingCart,
    IconCurrencyDollar,
    IconPackage,
    IconInfoCircle,
    IconClock,
    IconCheck
} from '@tabler/icons-react'

interface ValidationErrors {
    general?: string;
    name?: string;
    columns?: string;

    [key: string]: string | undefined;
}

export default function CreateTablePage() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errors, setErrors] = useState<ValidationErrors>({})

    // Fetch column types from API (includes module types when modules are active)
    const { columnTypes, builtInTypes, moduleTypes, isLoading: columnTypesLoading } = useColumnTypes()

    const [formData, setFormData] = useState<TableFormData>({
        name: '',
        description: '',
        visibility: 'private',
        tableType: 'default',
        productIdColumn: '',
        rentalPeriod: 'month',
        forSale: false, // Deprecated, kept for backwards compatibility
        columns: [
            {
                name: '',
                type: 'text',
                isRequired: false,
                allowDuplicates: true,
                defaultValue: '',
                position: 0
            }
        ]
    })

    // Get column names for productIdColumn selector
    const columnNames = useMemo(() => {
        return formData.columns.map(col => col.name).filter(name => name.trim() !== '')
    }, [formData.columns])

    const handleInputChange = (field: keyof TableFormData, value: any) => {
        setFormData(prev => ({...prev, [field]: value}))
        // Clear related errors
        setErrors(prev => ({...prev, [field]: undefined, general: undefined}))
    }

    const handleColumnChange = (index: number, field: keyof ColumnFormData, value: any) => {
        const newColumns = [...formData.columns]
        newColumns[index] = {...newColumns[index], [field]: value}
        setFormData(prev => ({...prev, columns: newColumns}))
        // Clear related errors
        setErrors(prev => ({...prev, [`column_${index}_${field}`]: undefined, columns: undefined, general: undefined}))
    }

    const addColumn = () => {
        const newColumn: ColumnFormData = {
            name: '',
            type: 'text',
            isRequired: false,
            allowDuplicates: true,
            defaultValue: '',
            position: formData.columns.length
        }
        setFormData(prev => ({...prev, columns: [...prev.columns, newColumn]}))
    }

    const removeColumn = (index: number) => {
        if (formData.columns.length <= 1) {
            setErrors(prev => ({...prev, columns: 'At least one column is required'}))
            return
        }

        const newColumns = formData.columns.filter((_, i) => i !== index)
        // Update positions
        newColumns.forEach((col, i) => {
            col.position = i
        })
        setFormData(prev => ({...prev, columns: newColumns}))
    }

    const moveColumn = (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1
        if (newIndex < 0 || newIndex >= formData.columns.length) return

        const newColumns = [...formData.columns];
        [newColumns[index], newColumns[newIndex]] = [newColumns[newIndex], newColumns[index]]

        // Update positions
        newColumns.forEach((col, i) => {
            col.position = i
        })
        setFormData(prev => ({...prev, columns: newColumns}))
    }

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {}

        // Validate table name
        if (!formData.name.trim()) {
            newErrors.name = 'Table name is required'
        } else if (formData.name.length > 100) {
            newErrors.name = 'Table name cannot exceed 100 characters'
        }

        // Validate columns
        if (formData.columns.length === 0) {
            newErrors.columns = 'At least one column is required'
        } else {
            const columnNames = new Set<string>()
            formData.columns.forEach((col, index) => {
                if (!col.name.trim()) {
                    newErrors[`column_${index}_name`] = 'Column name is required'
                } else if (col.name.length > 100) {
                    newErrors[`column_${index}_name`] = 'Column name cannot exceed 100 characters'
                } else if (columnNames.has(col.name.toLowerCase())) {
                    newErrors[`column_${index}_name`] = 'Column names must be unique'
                } else {
                    columnNames.add(col.name.toLowerCase())
                }
            })
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setIsSubmitting(true)
        setErrors({})

        // Simple form submission - let the server handle everything
        const form = e.target as HTMLFormElement
        const formDataObj = new FormData(form)

        try {
            const response = await fetch('/api/tables/create', {
                method: 'POST',
                body: formDataObj
            })

            if (response.ok) {
                const result = await response.json() as any
                window.location.href = `/dashboard/tables/${result.tableId}/data`
            } else {
                const errorData = await response.json() as any
                setErrors({
                    general: errorData.message || 'Failed to create table'
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

    const isEcommerceTable = formData.tableType === 'sale' || formData.tableType === 'rent'

    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-base-content">Create New Table</h1>
                <p className="text-base-content/70 mt-2">
                    Design a custom data table with configurable columns and access controls.
                </p>
            </div>

            {errors.general && (
                <Alert color="error" className="mb-6">
                    {errors.general}
                </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Hidden fields for form data */}
                <input type="hidden" name="tableData" value={JSON.stringify({
                    name: formData.name.trim(),
                    description: formData.description.trim() || undefined,
                    visibility: formData.visibility,
                    tableType: formData.tableType,
                    productIdColumn: formData.productIdColumn || undefined,
                    rentalPeriod: formData.tableType === 'rent' ? formData.rentalPeriod : undefined,
                    forSale: formData.tableType === 'sale', // Backwards compatibility
                    columns: formData.columns.map(col => ({
                        name: col.name.trim(),
                        type: col.type,
                        isRequired: col.isRequired,
                        allowDuplicates: col.allowDuplicates,
                        defaultValue: col.defaultValue.trim() || undefined,
                        position: col.position
                    }))
                })}/>
                {/* Table Information with E-commerce Settings */}
                <TableInfoForm
                    data={{
                        name: formData.name,
                        description: formData.description,
                        visibility: formData.visibility,
                        tableType: formData.tableType,
                        productIdColumn: formData.productIdColumn,
                        rentalPeriod: formData.rentalPeriod,
                        forSale: formData.tableType === 'sale'
                    }}
                    errors={errors}
                    onChange={handleInputChange}
                    columnNames={columnNames}
                />

                {/* Auto-Column Preview for E-commerce Tables */}
                {formData.tableType === 'sale' && (
                    <Card color="success" style="soft">
                        <CardBody>
                            <CardTitle className="flex items-center gap-2">
                                <IconShoppingCart className="h-5 w-5" />
                                <span>Sale Columns</span>
                                <span className="badge badge-success badge-sm">Auto-created</span>
                            </CardTitle>
                            <p className="text-sm mb-3">
                                These columns will be automatically added for selling items:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="p-3 rounded-lg border border-success/30 bg-success/5">
                                    <div className="flex items-center gap-2 mb-1">
                                        <IconCurrencyDollar className="h-4 w-4" />
                                        <span className="font-medium">price</span>
                                        <span className="badge badge-warning badge-xs">Protected</span>
                                    </div>
                                    <p className="text-xs">Number • Required • No default</p>
                                    <p className="text-xs mt-1">Item price for selling</p>
                                </div>
                                <div className="p-3 rounded-lg border border-success/30 bg-success/5">
                                    <div className="flex items-center gap-2 mb-1">
                                        <IconPackage className="h-4 w-4" />
                                        <span className="font-medium">qty</span>
                                        <span className="badge badge-warning badge-xs">Protected</span>
                                    </div>
                                    <p className="text-xs">Integer • Required • Default: 1</p>
                                    <p className="text-xs mt-1">Available quantity</p>
                                </div>
                            </div>
                            <div className="alert alert-warning mt-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <IconInfoCircle className="h-4 w-4 flex-shrink-0" />
                                    <span>These columns cannot be deleted or renamed while the table is "for sale"</span>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                )}

                {formData.tableType === 'rent' && (
                    <Card color="info" style="soft">
                        <CardBody>
                            <CardTitle className="flex items-center gap-2">
                                <IconClock className="h-5 w-5" />
                                <span>Rental Columns</span>
                                <span className="badge badge-info badge-sm">Auto-created</span>
                            </CardTitle>
                            <p className="text-sm mb-3">
                                These columns will be automatically added for renting items:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="p-3 rounded-lg border border-info/30 bg-info/5">
                                    <div className="flex items-center gap-2 mb-1">
                                        <IconCurrencyDollar className="h-4 w-4" />
                                        <span className="font-medium">price</span>
                                        <span className="badge badge-warning badge-xs">Protected</span>
                                    </div>
                                    <p className="text-xs">Number • Required • No default</p>
                                    <p className="text-xs mt-1">Rental price per {formData.rentalPeriod}</p>
                                </div>
                                <div className="p-3 rounded-lg border border-info/30 bg-info/5">
                                    <div className="flex items-center gap-2 mb-1">
                                        <IconCurrencyDollar className="h-4 w-4" />
                                        <span className="font-medium">fee</span>
                                        <span className="badge badge-warning badge-xs">Protected</span>
                                    </div>
                                    <p className="text-xs">Number • Required • Default: 0</p>
                                    <p className="text-xs mt-1">One-time rental fee/deposit</p>
                                </div>
                                <div className="p-3 rounded-lg border border-info/30 bg-info/5">
                                    <div className="flex items-center gap-2 mb-1">
                                        <IconCheck className="h-4 w-4" />
                                        <span className="font-medium">used</span>
                                        <span className="badge badge-warning badge-xs">Protected</span>
                                    </div>
                                    <p className="text-xs">Boolean • Required • Default: false</p>
                                    <p className="text-xs mt-1">Whether item has been rented before</p>
                                </div>
                                <div className="p-3 rounded-lg border border-info/30 bg-info/5">
                                    <div className="flex items-center gap-2 mb-1">
                                        <IconCheck className="h-4 w-4" />
                                        <span className="font-medium">available</span>
                                        <span className="badge badge-warning badge-xs">Protected</span>
                                    </div>
                                    <p className="text-xs">Boolean • Required • Default: true</p>
                                    <p className="text-xs mt-1">Whether item is available for rent</p>
                                </div>
                            </div>
                            <div className="alert alert-warning mt-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <IconInfoCircle className="h-4 w-4 flex-shrink-0" />
                                    <span>These columns cannot be deleted or renamed while the table is "for rent"</span>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                )}

                {/* Column Definition */}
                <Card>
                    <CardBody>
                        <div className="flex flex-row items-center justify-between mb-4">
                            <CardTitle>
                                {isEcommerceTable ? 'Additional Columns' : 'Column Configuration'}
                            </CardTitle>
                            <Button
                                type="button"
                                onClick={addColumn}
                                style="outline"
                                size="sm"
                                icon={IconPlus}>
                                Add Column
                            </Button>
                        </div>
                        {errors.columns && (
                            <Alert color="error" className="mb-4">
                                {errors.columns}
                            </Alert>
                        )}

                        <div className="space-y-4">
                            {formData.columns.map((column, index) => (
                                <Card
                                    key={index}
                                    color="info"
                                    style="soft"
                                >
                                    <CardBody>
                                        <div className="flex flex-row items-center justify-between mb-4">
                                            <CardTitle>Column {index + 1}</CardTitle>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    type="button"
                                                    onClick={() => moveColumn(index, 'up')}
                                                    disabled={index === 0}
                                                    style="ghost"
                                                    size="icon"
                                                    icon={IconArrowUp}
                                                />
                                                <Button
                                                    type="button"
                                                    onClick={() => moveColumn(index, 'down')}
                                                    disabled={index === formData.columns.length - 1}
                                                    style="ghost"
                                                    size="icon"
                                                    icon={IconArrowDown}
                                                />
                                                <Button
                                                    type="button"
                                                    onClick={() => removeColumn(index)}
                                                    disabled={formData.columns.length <= 1}
                                                    style="soft"
                                                    size="icon"
                                                    color="error"
                                                    icon={IconTrash}
                                                />
                                            </div>
                                        </div>
                                        {/* Column details */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Input
                                                    type="text"
                                                    value={column.name}
                                                    onChange={(e) => handleColumnChange(index, 'name', e.target.value)}
                                                    label="Column Name *"
                                                    placeholder="Enter column name..."
                                                    maxLength={100}
                                                    className={errors[`column_${index}_name`] ? 'input-error' : ''}
                                                    required
                                                />
                                                <InputError message={errors[`column_${index}_name`]} />
                                            </div>

                                            <div>
                                                <label className="label">
                                                    <span className="label-text">Data Type</span>
                                                </label>
                                                <Select
                                                    value={column.type}
                                                    onChange={(e) => handleColumnChange(index, 'type', e.target.value as ColumnType)}
                                                    disabled={columnTypesLoading}
                                                >
                                                    {/* Built-in types */}
                                                    {builtInTypes.length > 0 && (
                                                        <optgroup label="Built-in Types">
                                                            {builtInTypes.map(option => (
                                                                <option key={option.value} value={option.value}>
                                                                    {option.label}
                                                                </option>
                                                            ))}
                                                        </optgroup>
                                                    )}
                                                    {/* Module types (if any modules are active) */}
                                                    {moduleTypes.length > 0 && (
                                                        <optgroup label="Module Types">
                                                            {moduleTypes.map(option => (
                                                                <option key={option.value} value={option.value}>
                                                                    {option.label} {option.moduleName ? `(${option.moduleName})` : ''}
                                                                </option>
                                                            ))}
                                                        </optgroup>
                                                    )}
                                                </Select>
                                            </div>

                                            <div>
                                                <Input
                                                    type="text"
                                                    value={column.defaultValue}
                                                    onChange={(e) => handleColumnChange(index, 'defaultValue', e.target.value)}
                                                    label="Default Value"
                                                    placeholder="Optional default value..."
                                                />
                                            </div>

                                            <div className="flex items-start pt-6 gap-6">
                                                <Checkbox
                                                    checked={column.isRequired}
                                                    onChange={(e) => handleColumnChange(index, 'isRequired', e.target.checked)}
                                                    label="Required Field"
                                                    labelPosition="right"
                                                />
                                                <Checkbox
                                                    checked={column.allowDuplicates}
                                                    onChange={(e) => handleColumnChange(index, 'allowDuplicates', e.target.checked)}
                                                    label="Allow Duplicates"
                                                    labelPosition="right"
                                                />
                                            </div>
                                        </div>
                                        {/* Column type description */}
                                        <div className="mt-2 text-sm text-gray-600">
                                            {columnTypes.find(opt => opt.value === column.type)?.description}
                                        </div>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>
                    </CardBody>
                </Card>

                {/* Actions */}
                <div className="flex justify-between items-center">
                    <Button
                        type="button"
                        style="ghost"
                        onClick={() => window.location.href = '/dashboard/tables'}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        color="primary"
                        style="soft"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="loading loading-spinner loading-sm mr-2"></span>
                                Creating Table...
                            </>
                        ) : (
                            'Create Table'
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}

export const metadata = {
    title: 'Create Table - Dynamic Tables',
    description: 'Create a new dynamic table with custom columns'
}
