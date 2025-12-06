/**
 * Table Edit Page
 * Edit table metadata (name, description, visibility) and e-commerce settings
 */

'use client'

import React, {useEffect, useState} from 'react'
import {Button} from '@/components/ui/button'
import {Alert} from '@/components/ui/alert'
import {TableInfoForm, TableInfoData} from '@/components/tables/info-form'
import {TableTypeConversionDialog} from '@/components/tables/type-conversion-dialog'
import {TablePageHeader} from '@/components/tables/page-header'
import {TableSchema, UpdateTableRequest, TableType, RentalPeriod, TypeChangeApplyRequest} from '@/types/dynamic-tables'
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
    const [pendingTableType, setPendingTableType] = useState<TableType | null>(null)
    const [currentSchema, setCurrentSchema] = useState<TableSchema | null>(tableSchema)

    // Derive tableType from forSale or tableType field
    const getTableType = (table: any): TableType => {
        if (table.tableType) return table.tableType as TableType
        // Legacy: convert forSale to tableType
        return table.forSale ? 'sale' : 'default'
    }

    const [formData, setFormData] = useState<TableInfoData>({
        name: tableSchema?.table.name || '',
        description: tableSchema?.table.description || '',
        visibility: (tableSchema?.table.visibility as 'private' | 'public' | 'shared') || 'private',
        tableType: tableSchema ? getTableType(tableSchema.table) : 'default',
        productIdColumn: (tableSchema?.table as any)?.productIdColumn || '',
        rentalPeriod: ((tableSchema?.table as any)?.rentalPeriod as RentalPeriod) || 'month',
        forSale: Boolean(tableSchema?.table.forSale)
    })

    console.log('🔍 Initial form data from props:', {
        tableSchema,
        tableName: tableSchema?.table.name,
        tableType: formData.tableType,
        productIdColumn: formData.productIdColumn,
        rentalPeriod: formData.rentalPeriod
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

                const tableType = getTableType(schema.table)
                setFormData({
                    name: schema.table.name,
                    description: schema.table.description || '',
                    visibility: (schema.table.visibility as 'private' | 'public' | 'shared') || 'private',
                    tableType: tableType,
                    productIdColumn: schema.table.productIdColumn || '',
                    rentalPeriod: (schema.table.rentalPeriod as RentalPeriod) || 'month',
                    forSale: tableType === 'sale'
                })

                console.log('🔍 Loaded table data via API:', {
                    result,
                    schema,
                    tableInfo: schema.table,
                    tableType,
                    productIdColumn: schema.table.productIdColumn,
                    rentalPeriod: schema.table.rentalPeriod
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

    const handleInputChange = (field: keyof TableInfoData, value: any) => {
        // Special handling for tableType changes - show confirmation dialog
        if (field === 'tableType' && value !== formData.tableType) {
            // Only show dialog when changing to/from e-commerce types
            const currentIsEcommerce = formData.tableType === 'sale' || formData.tableType === 'rent'
            const newIsEcommerce = value === 'sale' || value === 'rent'

            if (currentIsEcommerce || newIsEcommerce) {
                setPendingTableType(value)
                setShowConversionDialog(true)
                return
            }
        }

        setFormData(prev => ({...prev, [field]: value}))
        // Clear related errors
        setErrors(prev => ({...prev, [field]: undefined, general: undefined}))
    }

    const handleTableTypeConversion = async (
        mappings: Array<{ requiredColumn: string; existingColumnId: string | null }>,
        rentalPeriod?: RentalPeriod
    ) => {
        if (pendingTableType === null || !tableId) return

        setIsSubmitting(true)
        setErrors({})

        try {
            // For 'default' type, we don't need mappings - just update the table type
            if (pendingTableType === 'default') {
                const requestData: UpdateTableRequest = {
                    tableType: 'default'
                }

                const response = await clientApiRequest(`/api/tables/${tableId}`, {
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(requestData)
                })

                if (response.ok) {
                    // Update local state
                    setFormData(prev => ({
                        ...prev,
                        tableType: 'default',
                        forSale: false
                    }))
                    setShowConversionDialog(false)
                    setPendingTableType(null)
                    // Reload table data to get updated columns
                    await loadTableData()
                } else {
                    const errorData = await response.json() as any
                    setErrors({general: errorData.message || 'Failed to change table type'})
                }
            } else {
                // For sale/rent types, use the apply-type-change endpoint with mappings
                const requestData: TypeChangeApplyRequest = {
                    targetType: pendingTableType,
                    columnMappings: mappings,
                    rentalPeriod: pendingTableType === 'rent' ? rentalPeriod : undefined
                }

                const response = await clientApiRequest(`/api/tables/${tableId}/apply-type-change`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(requestData)
                })

                if (response.ok) {
                    // Update local state
                    setFormData(prev => ({
                        ...prev,
                        tableType: pendingTableType,
                        forSale: pendingTableType === 'sale',
                        rentalPeriod: pendingTableType === 'rent' ? (rentalPeriod || 'month') : prev.rentalPeriod
                    }))
                    setShowConversionDialog(false)
                    setPendingTableType(null)
                    // Reload table data to get updated columns
                    await loadTableData()
                } else {
                    const errorData = await response.json() as any
                    setErrors({general: errorData.message || 'Failed to apply type change'})
                }
            }
        } catch (error) {
            setErrors({general: error instanceof Error ? error.message : 'Failed to apply type change'})
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCancelConversion = () => {
        setShowConversionDialog(false)
        setPendingTableType(null)
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
                tableType: formData.tableType,
                productIdColumn: formData.productIdColumn || null,
                rentalPeriod: formData.tableType === 'rent' ? formData.rentalPeriod : undefined,
                forSale: formData.tableType === 'sale' // Backwards compatibility
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
                subtitle="Update table information and e-commerce settings"
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
                    availableColumns={currentSchema?.columns || []}
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

            {/* Table Type Conversion Confirmation Dialog */}
            {showConversionDialog && pendingTableType !== null && tableId && (
                <TableTypeConversionDialog
                    isOpen={showConversionDialog}
                    onClose={handleCancelConversion}
                    onConfirm={handleTableTypeConversion}
                    isLoading={isSubmitting}
                    currentType={formData.tableType}
                    newType={pendingTableType}
                    tableName={formData.name}
                    tableId={tableId}
                />
            )}
        </div>
    )
}

export const metadata = {
    title: 'Edit Table - Dynamic Tables',
    description: 'Edit table information and settings'
}
