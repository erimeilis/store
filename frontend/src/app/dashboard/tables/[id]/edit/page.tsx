/**
 * Table Edit Page
 * Edit table metadata (name, description, visibility)
 */

'use client'

import React, {useEffect, useState} from 'react'
import {Button} from '@/components/ui/button'
import {Alert} from '@/components/ui/alert'
import {TableInfoForm} from '@/components/table-info-form'
import {ForSaleConversionDialog} from '@/components/for-sale-conversion-dialog'
import {TablePageHeader} from '@/components/table-page-header'
import {TableSchema, UpdateTableRequest} from '@/types/dynamic-tables'
import {clientApiRequest} from '@/lib/client-api'

interface TableEditPageProps {
    tableSchema?: TableSchema | null;
    tableId?: string;
}

interface ValidationErrors {
    general?: string;
    name?: string;

    [key: string]: string | undefined;
}

export default function TableEditPage({tableSchema = null, tableId}: TableEditPageProps) {
    const [isLoading, setIsLoading] = useState(!tableSchema)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errors, setErrors] = useState<ValidationErrors>({})
    const [showConversionDialog, setShowConversionDialog] = useState(false)
    const [pendingForSaleValue, setPendingForSaleValue] = useState<boolean | null>(null)
    const [currentSchema, setCurrentSchema] = useState<TableSchema | null>(tableSchema)

    const [formData, setFormData] = useState({
        name: tableSchema?.table.name || '',
        description: tableSchema?.table.description || '',
        visibility: (tableSchema?.table.visibility as 'private' | 'public' | 'shared') || 'private',
        forSale: Boolean(tableSchema?.table.forSale)
    })

    console.log('🔍 Initial form data from props:', {
        tableSchema,
        tableName: tableSchema?.table.name,
        forSale: tableSchema?.table.forSale,
        formDataForSale: formData.forSale
    })

    // Load table data if not provided
    useEffect(() => {
        if (!tableSchema && tableId) {
            loadTableData()
        }
    }, [tableId, tableSchema])

    const loadTableData = async () => {
        if (!tableId) return

        setIsLoading(true)
        try {
            const response = await clientApiRequest(`/api/tables/${tableId}`)
            if (response.ok) {
                const result = await response.json() as any
                const schema = result.table  // This is the TableSchema object
                setCurrentSchema(schema)
                setFormData({
                    name: schema.table.name,
                    description: schema.table.description || '',
                    visibility: (schema.table.visibility as 'private' | 'public' | 'shared') || 'private',
                    forSale: Boolean(schema.table.forSale)
                })

                console.log('🔍 Loaded table data via API:', {
                    result,
                    schema,
                    tableInfo: schema.table,
                    tableName: schema.table.name,
                    forSale: schema.table.forSale,
                    visibility: schema.table.visibility
                })
            } else {
                const errorData = await response.json() as any
                setErrors({general: errorData.message || 'Failed to load table data'})
            }
        } catch (error) {
            setErrors({general: error instanceof Error ? error.message : 'Failed to load table data'})
        } finally {
            setIsLoading(false)
        }
    }

    const handleInputChange = (field: string, value: any) => {
        // Special handling for forSale changes - show confirmation dialog
        if (field === 'forSale' && value !== formData.forSale) {
            setPendingForSaleValue(value)
            setShowConversionDialog(true)
            return
        }

        setFormData(prev => ({...prev, [field]: value}))
        // Clear related errors
        setErrors(prev => ({...prev, [field]: undefined, general: undefined}))
    }

    const handleForSaleConversion = () => {
        if (pendingForSaleValue !== null) {
            setFormData(prev => ({...prev, forSale: pendingForSaleValue}))
            setShowConversionDialog(false)
            setPendingForSaleValue(null)
        }
    }

    const handleCancelConversion = () => {
        setShowConversionDialog(false)
        setPendingForSaleValue(null)
    }

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {}

        // Validate table name
        if (!formData.name.trim()) {
            newErrors.name = 'Table name is required'
        } else if (formData.name.length > 100) {
            newErrors.name = 'Table name cannot exceed 100 characters'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm() || !tableId) {
            return
        }

        setIsSubmitting(true)
        setErrors({})

        try {
            const requestData: UpdateTableRequest = {
                name: formData.name.trim(),
                description: formData.description.trim() || undefined,
                visibility: formData.visibility,
                forSale: formData.forSale
            }

            const response = await clientApiRequest(`/api/tables/${tableId}`, {
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
                    general: errorData.message || 'Failed to update table'
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

    if (isLoading) {
        return (
            <div className="container mx-auto sm:p-4">
                <div className="flex justify-center items-center h-64">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto sm:p-4">
            <TablePageHeader
                title="Edit Table"
                subtitle="Update table information and access settings"
                tableId={tableId || ''}
                activePage="edit"
                tableName={currentSchema?.table.name || formData.name}
            />

            {errors.general && (
                <Alert color="error" className="mb-6">
                    {errors.general}
                </Alert>
            )}

            <form onSubmit={handleSubmit}>
                <TableInfoForm
                    data={formData}
                    errors={errors}
                    onChange={handleInputChange}
                />

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

            {/* Conversion Confirmation Dialog */}
            {showConversionDialog && pendingForSaleValue !== null && (
                <ForSaleConversionDialog
                    isOpen={showConversionDialog}
                    onClose={handleCancelConversion}
                    onConfirm={handleForSaleConversion}
                    isLoading={false}
                    conversionType={pendingForSaleValue ? 'toSale' : 'fromSale'}
                    tableName={formData.name}
                    hasExistingPriceColumn={currentSchema?.columns.some(col => col.name.toLowerCase() === 'price') || false}
                    hasExistingQtyColumn={currentSchema?.columns.some(col => col.name.toLowerCase() === 'qty') || false}
                />
            )}
        </div>
    )
}

export const metadata = {
    title: 'Edit Table - Dynamic Tables',
    description: 'Edit table information and settings'
}
