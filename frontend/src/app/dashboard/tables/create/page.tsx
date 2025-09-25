/**
 * Table Creation Page
 * Form interface for creating new dynamic tables with columns
 */

'use client'

import React, {useState} from 'react'
import {Button} from '@/components/ui/button'
import {Card, CardBody, CardTitle} from '@/components/ui/card'
import {Input} from '@/components/ui/input'
import {Select} from '@/components/ui/select'
import {Checkbox} from '@/components/ui/checkbox'
import {Alert} from '@/components/ui/alert'
import {TableInfoForm} from '@/components/table-info-form'
import {COLUMN_TYPE_OPTIONS, ColumnFormData, ColumnType, TableFormData} from '@/types/dynamic-tables'
import {IconArrowDown, IconArrowUp, IconPlus, IconTrash, IconShoppingCart, IconCurrencyDollar, IconPackage, IconInfoCircle} from '@tabler/icons-react'

interface ValidationErrors {
    general?: string;
    name?: string;
    columns?: string;

    [key: string]: string | undefined;
}

export default function CreateTablePage() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errors, setErrors] = useState<ValidationErrors>({})

    const [formData, setFormData] = useState<TableFormData>({
        name: '',
        description: '',
        isPublic: false,
        forSale: false,
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
        const formData = new FormData(form)

        try {
            const response = await fetch('/api/tables/create', {
                method: 'POST',
                body: formData
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

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Create New Table</h1>
                <p className="text-gray-600 mt-2">
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
                    isPublic: formData.isPublic,
                    forSale: formData.forSale,
                    columns: formData.columns.map(col => ({
                        name: col.name.trim(),
                        type: col.type,
                        isRequired: col.isRequired,
                        defaultValue: col.defaultValue.trim() || undefined,
                        position: col.position
                    }))
                })}/>
                {/* Table Information */}
                <TableInfoForm
                    data={{
                        name: formData.name,
                        description: formData.description,
                        isPublic: formData.isPublic,
                        forSale: formData.forSale
                    }}
                    errors={errors}
                    onChange={handleInputChange}
                />

                {/* Auto-Column Preview for For Sale Tables */}
                {formData.forSale && (
                    <Card color="info" style="soft">
                        <CardBody>
                            <CardTitle className="flex items-center gap-2">
                                <IconShoppingCart className="h-5 w-5" />
                                <span>E-commerce Columns</span>
                                <span className="badge badge-info badge-sm">Auto-created</span>
                            </CardTitle>
                            <p className="text-sm mb-3">
                                These columns will be automatically added to your table for e-commerce functionality:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="p-3 rounded-lg border">
                                    <div className="flex items-center gap-2 mb-1">
                                        <IconCurrencyDollar className="h-4 w-4" />
                                        <span className="font-medium">price</span>
                                        <span className="badge badge-warning badge-xs">Protected</span>
                                    </div>
                                    <p className="text-xs">Number • Required • No default</p>
                                    <p className="text-xs mt-1">Item price for selling</p>
                                </div>
                                <div className="p-3 rounded-lg border">
                                    <div className="flex items-center gap-2 mb-1">
                                        <IconPackage className="h-4 w-4" />
                                        <span className="font-medium">qty</span>
                                        <span className="badge badge-warning badge-xs">Protected</span>
                                    </div>
                                    <p className="text-xs">Number • Required • Default: 1</p>
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

                {/* Column Definition */}
                <Card>
                    <CardBody>
                        <div className="flex flex-row items-center justify-between mb-4">
                            <CardTitle>
                                {formData.forSale ? 'Additional Columns' : 'Column Configuration'}
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
                                                {errors[`column_${index}_name`] && (
                                                    <p className="text-error text-sm mt-1">{errors[`column_${index}_name`]}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="label">
                                                    <span className="label-text">Data Type</span>
                                                </label>
                                                <Select
                                                    value={column.type}
                                                    onChange={(e) => handleColumnChange(index, 'type', e.target.value as ColumnType)}
                                                >
                                                    {COLUMN_TYPE_OPTIONS.map(option => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
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
                                            {COLUMN_TYPE_OPTIONS.find(opt => opt.value === column.type)?.description}
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
