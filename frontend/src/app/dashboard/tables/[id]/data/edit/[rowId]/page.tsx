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
import {Breadcrumbs} from '@/components/ui/breadcrumbs'
import {CountrySelect} from '@/components/ui/country-select'
import {ParsedTableData, TableColumn, TableDataRow, TableSchema, UpdateTableDataRequest, validateColumnValue} from '@/types/dynamic-tables'
import {clientApiRequest} from '@/lib/client-api'

interface ValidationErrors {
    general?: string;

    [key: string]: string | undefined;
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

    // Load table schema and row data if not provided
    useEffect(() => {
        if (!tableSchema || !rowData) {
            if (tableId && rowId) {
                loadData()
            }
        }
    }, [tableId, rowId, tableSchema, rowData])

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
        const value = formData[column.name] ?? (column.default_value || '')
        const error = errors[column.name]

        switch (column.type) {
            case 'textarea':
                return (
                    <Textarea
                        value={value}
                        onChange={(e) => handleInputChange(column.name, e.target.value)}
                        label={column.name}
                        placeholder={`Type ${column.type}`}
                        rows={4}
                        color={error ? 'error' : 'default'}
                        required={column.is_required}
                    />
                )

            case 'number':
                return (
                    <Input
                        type="number"
                        value={value}
                        onChange={(e) => handleInputChange(column.name, e.target.value)}
                        label={column.name}
                        placeholder={`Type ${column.type}`}
                        color={error ? 'error' : 'default'}
                        required={column.is_required}
                    />
                )

            case 'date':
                return (
                    <Input
                        type="date"
                        value={value ? new Date(value).toISOString().split('T')[0] : ''}
                        onChange={(e) => handleInputChange(column.name, e.target.value)}
                        label={column.name}
                        placeholder={`Type ${column.type}`}
                        color={error ? 'error' : 'default'}
                        required={column.is_required}
                    />
                )

            case 'boolean':
                return (
                    <Checkbox
                        checked={Boolean(value)}
                        onChange={(e) => handleInputChange(column.name, e.target.checked)}
                    />
                )

            case 'email':
                return (
                    <Input
                        type="email"
                        value={value}
                        onChange={(e) => handleInputChange(column.name, e.target.value)}
                        label={column.name}
                        placeholder={`Type ${column.type}`}
                        color={error ? 'error' : 'default'}
                        required={column.is_required}
                    />
                )

            case 'url':
                return (
                    <Input
                        type="url"
                        value={value}
                        onChange={(e) => handleInputChange(column.name, e.target.value)}
                        label={column.name}
                        placeholder={`Type ${column.type}`}
                        color={error ? 'error' : 'default'}
                        required={column.is_required}
                    />
                )

            case 'country':
                return (
                    <CountrySelect
                        value={value}
                        onChange={(value) => handleInputChange(column.name, value)}
                        label={column.name}
                        placeholder="Select a country..."
                        color={error ? 'error' : 'default'}
                        required={column.is_required}
                    />
                )

            case 'text':
            default:
                return (
                    <Input
                        type="text"
                        value={value}
                        onChange={(e) => handleInputChange(column.name, e.target.value)}
                        label={column.name}
                        placeholder={`Type ${column.type}`}
                        color={error ? 'error' : 'default'}
                        required={column.is_required}
                    />
                )
        }
    }

    if (isLoading) {
        return (
            <div className="container mx-auto p-4 max-w-2xl">
                <div className="flex justify-center items-center h-64">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            </div>
        )
    }

    if (!tableSchema || !rowData) {
        return (
            <div className="container mx-auto p-4 max-w-2xl">
                <Alert color="error">
                    Failed to load table data. Please try again.
                </Alert>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            {/* Header */}
            <div className="mb-6">
                <Breadcrumbs
                    className="mb-2"
                    items={[
                        {
                            label: 'Dynamic Tables',
                            href: '/dashboard/tables'
                        },
                        {
                            label: tableSchema.table.name,
                            href: `/dashboard/tables/${tableId}/data`
                        },
                        {
                            label: 'Edit Row',
                            current: true
                        }
                    ]}
                />

                <h1 className="text-3xl font-bold text-gray-800">Edit Row</h1>
                <p className="text-gray-600 mt-2">
                    Update data for this row in {tableSchema.table.name}.
                </p>
            </div>

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
                                {errors[column.name] && (
                                    <p className="text-error text-sm mt-1">{errors[column.name]}</p>
                                )}
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
