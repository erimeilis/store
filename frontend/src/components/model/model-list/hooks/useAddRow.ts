import { useState } from 'react'
import { IModel } from '@/types/models'
import { IColumnDefinition } from '../types'
import { clientApiRequest } from '@/lib/client-api'
import { extractErrorMessage } from '../utils/api-error-handler'

interface UseAddRowProps<T extends IModel> {
    columns: IColumnDefinition<T>[]
    inlineEditRoute?: (id: number | string) => string
    massActionRoute: string
    onEditSuccess?: () => Promise<void> | void
}

interface UseAddRowReturn {
    isAddingNewRow: boolean
    newRowData: Record<string, string>
    newRowError: string
    isSavingNewRow: boolean
    startAddingNewRow: () => void
    cancelAddingNewRow: () => void
    updateNewRowData: (columnKey: string, value: string) => void
    saveNewRow: () => Promise<void>
}

export function useAddRow<T extends IModel>({
    columns,
    inlineEditRoute,
    massActionRoute,
    onEditSuccess
}: UseAddRowProps<T>): UseAddRowReturn {
    // Add row state
    const [isAddingNewRow, setIsAddingNewRow] = useState<boolean>(false)
    const [newRowData, setNewRowData] = useState<Record<string, string>>({})
    const [newRowError, setNewRowError] = useState<string>('')
    const [isSavingNewRow, setIsSavingNewRow] = useState<boolean>(false)

    // Add Row functionality
    const startAddingNewRow = () => {

        // Initialize newRowData with default values based on column types
        // Only include editable columns (skip system columns like 'order')
        const initialData: Record<string, string> = {}
        columns.forEach(column => {
            const columnKey = String(column.key)

            // Skip system/non-editable columns like 'order', 'created_at', etc.
            if (!column.editableInline && !column.editType) {
                return
            }

            // Skip columns that are clearly system-generated
            if (columnKey === 'order' || columnKey === 'created_at' || columnKey === 'updated_at' || columnKey === 'id') {
                return
            }

            if (column.editType === 'toggle' || column.filterType === 'select') {
                initialData[columnKey] = 'false' // Default for boolean fields
            } else if (columnKey === 'type') {
                initialData[columnKey] = 'text' // Default column type to "text"
            } else {
                initialData[columnKey] = column.editValidation?.required ? '' : ''
            }
        })

        setNewRowData(initialData)
        setIsAddingNewRow(true)
        setNewRowError('')
    }

    const cancelAddingNewRow = () => {
        setIsAddingNewRow(false)
        setNewRowData({})
        setNewRowError('')
        setIsSavingNewRow(false)
    }

    const updateNewRowData = (columnKey: string, value: string) => {
        setNewRowData(prev => ({
            ...prev,
            [columnKey]: value
        }))
        // Clear error when user starts typing
        if (newRowError) {
            setNewRowError('')
        }
    }

    const saveNewRow = async () => {

        // Validate required fields (only for editable columns)
        for (const column of columns) {
            const columnKey = String(column.key)

            // Skip system/non-editable columns
            if (!column.editableInline && !column.editType) {
                continue
            }

            // Skip columns that are clearly system-generated
            if (columnKey === 'order' || columnKey === 'created_at' || columnKey === 'updated_at' || columnKey === 'id') {
                continue
            }

            const value = newRowData[columnKey] || ''

            if (column.editValidation?.required && !value.trim()) {
                setNewRowError(`${column.label.replace(' *', '')} is required`)
                return
            }

            // Validate patterns
            if (column.editValidation?.pattern && value.trim()) {
                if (!column.editValidation.pattern.test(value)) {
                    setNewRowError(`${column.label.replace(' *', '')} has invalid format`)
                    return
                }
            }
        }

        setIsSavingNewRow(true)
        setNewRowError('')

        try {
            // Use the same base route as inlineEditRoute but without the ID (POST to create)
            const baseUrl = inlineEditRoute ? inlineEditRoute('').replace('/undefined', '').replace('/null', '') : massActionRoute.replace('/mass-action', '')
            const createUrl = baseUrl.replace(/\/$/, '')

            // Check if this is a table data API endpoint and wrap data accordingly
            const isTableDataApi = createUrl.includes('/tables/') && createUrl.includes('/data')
            const requestBody = isTableDataApi ? {data: newRowData} : newRowData

            const response = await clientApiRequest(createUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            })

            if (response.ok) {
                // Success - refresh data without page reload
                cancelAddingNewRow()

                // Call the onEditSuccess callback if provided, otherwise reload
                if (onEditSuccess) {
                    await onEditSuccess()
                } else {
                    window.location.reload()
                }
            } else {
                const errorMessage = await extractErrorMessage(response)
                setNewRowError(errorMessage)
            }
        } catch (error) {
            console.error('Error saving new row:', error)
            setNewRowError(error instanceof Error ? error.message : 'Failed to save new row')
        } finally {
            setIsSavingNewRow(false)
        }
    }

    return {
        isAddingNewRow,
        newRowData,
        newRowError,
        isSavingNewRow,
        startAddingNewRow,
        cancelAddingNewRow,
        updateNewRowData,
        saveNewRow
    }
}
