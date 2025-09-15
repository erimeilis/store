/**
 * Table Edit Page
 * Edit table metadata (name, description, visibility)
 */

'use client'

import React, {useEffect, useState} from 'react'
import {Button} from '@/components/ui/button'
import {Alert} from '@/components/ui/alert'
import {TableInfoForm} from '@/components/table-info-form'
import {TableNavigation} from '@/components/table-navigation'
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

    const [formData, setFormData] = useState({
        name: tableSchema?.table.name || '',
        description: tableSchema?.table.description || '',
        is_public: tableSchema?.table.is_public || false
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
                const schema = result.table
                setFormData({
                    name: schema.table.name,
                    description: schema.table.description || '',
                    is_public: schema.table.is_public
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
        setFormData(prev => ({...prev, [field]: value}))
        // Clear related errors
        setErrors(prev => ({...prev, [field]: undefined, general: undefined}))
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
                is_public: formData.is_public
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
            <div className="container mx-auto p-4 max-w-2xl">
                <div className="flex justify-center items-center h-64">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <div className="mb-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Edit Table</h1>
                        <p className="text-gray-600 mt-2">
                            Update table information and access settings.
                        </p>
                    </div>
                    <TableNavigation
                        tableId={tableId || ''}
                        activePage="edit"
                    />
                </div>
            </div>

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
        </div>
    )
}

export const metadata = {
    title: 'Edit Table - Dynamic Tables',
    description: 'Edit table information and settings'
}
