import React, { useState } from 'react'
import { IModel, IPaginatedResponse } from '@/types/models'
import { IColumnDefinition, EditingCell } from '../types'
import { clientApiRequest } from '@/lib/client-api'
import { formatDateForInput, parseDDMMYYYY } from '@/lib/date-utils'

interface UseInlineEditingProps<T extends IModel> {
    displayData: IPaginatedResponse<T> | null
    columns: IColumnDefinition<T>[]
    inlineEditRoute?: (id: number | string) => string
    onEditSuccess?: () => Promise<void> | void
}

interface UseInlineEditingReturn<T extends IModel> {
    editingCell: EditingCell | null
    editValue: string
    isEditingSaving: boolean
    editingError: string
    isClickingSaveButton: boolean
    editingSaveSuccess: boolean
    setEditValue: React.Dispatch<React.SetStateAction<string>>
    setIsClickingSaveButton: React.Dispatch<React.SetStateAction<boolean>>
    startEditing: (item: T, column: IColumnDefinition<T>) => void
    cancelEditing: () => void
    saveEditing: (valueToSave?: string) => Promise<void>
    handleEditKeyPress: (e: React.KeyboardEvent) => void
    handleInputBlur: () => void
}

export function useInlineEditing<T extends IModel>({
    displayData,
    columns,
    inlineEditRoute,
    onEditSuccess
}: UseInlineEditingProps<T>): UseInlineEditingReturn<T> {
    // Inline editing state
    const [editingCell, setEditingCell] = useState<EditingCell | null>(null)
    const [editValue, setEditValue] = useState<string>('')
    const [isEditingSaving, setIsEditingSaving] = useState<boolean>(false)
    const [editingError, setEditingError] = useState<string>('')
    const [isClickingSaveButton, setIsClickingSaveButton] = useState<boolean>(false)
    const [editingSaveSuccess, setEditingSaveSuccess] = useState<boolean>(false)

    // Handle inline editing
    const startEditing = (item: T, column: IColumnDefinition<T>) => {
        if (!column.editableInline) return

        const columnKey = String(column.key)
        setEditingCell({itemId: item.id, columnKey})

        // Use custom getEditValue if provided
        if (column.getEditValue) {
            setEditValue(column.getEditValue(item))
            setEditingError('')
            return
        }

        // Check if this is a dynamic table data row (has nested data property)
        const isDynamicTableData = 'data' in item && typeof (item as any).data === 'object'
        const currentValue = isDynamicTableData
            ? (item as any).data[columnKey]
            : item[column.key as keyof T]

        // For select/toggle fields with boolean values, convert properly
        let editValueToSet: string
        if ((column.editType === 'select' || column.editType === 'toggle') && typeof currentValue === 'boolean') {
            editValueToSet = currentValue ? 'true' : 'false'
        } else {
            // Use ?? instead of || to preserve falsy values like false, 0, ''
            editValueToSet = String(currentValue ?? '')
        }

        setEditValue(editValueToSet)
        setEditingError('')
    }

    const cancelEditing = () => {
        setEditingCell(null)
        setEditValue('')
        setEditingError('')
        setIsEditingSaving(false)
        setIsClickingSaveButton(false)
        setEditingSaveSuccess(false)
    }

    const handleSaveSuccess = async () => {
        setEditingSaveSuccess(true)
        // Show success feedback briefly before canceling editing
        // Keep isEditingSaving true to prevent blur from canceling
        setTimeout(async () => {
            setIsEditingSaving(false)
            cancelEditing()
            // Call the onEditSuccess callback if provided, otherwise reload
            if (onEditSuccess) {
                await onEditSuccess()
            } else {
                window.location.reload()
            }
        }, 800)
    }

    const handleInputBlur = () => {
        // Don't cancel if user is clicking the save button or if currently saving
        if (!isClickingSaveButton && !isEditingSaving) {
            cancelEditing()
        }
    }

    const validateEditValue = (column: IColumnDefinition<T>, value: string): string => {
        if (!column.editValidation) return ''

        const validation = column.editValidation

        if (validation.required && !value.trim()) {
            return 'This field is required'
        }

        if (validation.minLength && value.length < validation.minLength) {
            return `Minimum length is ${validation.minLength} characters`
        }

        if (validation.maxLength && value.length > validation.maxLength) {
            return `Maximum length is ${validation.maxLength} characters`
        }

        if (validation.pattern && !validation.pattern.test(value)) {
            return 'Invalid format'
        }

        return ''
    }

    const saveEditing = async (valueToSave?: string) => {
        if (!editingCell) {
            return
        }

        const item = displayData?.data?.find((i) => i.id === editingCell.itemId)
        const column = columns.find((c) => String(c.key) === editingCell.columnKey)

        // Check if this is a dynamic table data row (has nested data property)
        const isDynamicTableData = item && 'data' in item && typeof (item as any).data === 'object'
        const _currentItemValue = isDynamicTableData
            ? (item as any).data[editingCell.columnKey]
            : item ? item[editingCell.columnKey as keyof typeof item] : null

        if (!item || !column || !column.editableInline) {
            return
        }

        // Use provided value or fall back to current editValue
        let currentValue = valueToSave ?? editValue

        // Apply transform if provided (e.g., convert display name to internal format)
        if (column.transformEditValue) {
            currentValue = column.transformEditValue(currentValue)
        }

        const validationError = validateEditValue(column, currentValue)
        if (validationError) {
            setEditingError(validationError)
            return
        }

        setIsEditingSaving(true)
        setEditingError('')

        try {
            if (column.onSave) {
                await column.onSave(item, currentValue)
                handleSaveSuccess()
            } else {
                // Default save behavior - make a PATCH request
                // Convert currentValue to proper type based on column configuration
                let convertedValue: string | boolean | number = currentValue

                if (column.editType === 'select' && column.editOptions) {
                    // For select fields, find the actual value from editOptions
                    const selectedOption = column.editOptions.find((opt) => opt.label === currentValue || String(opt.value) === currentValue)
                    if (selectedOption) {
                        convertedValue = selectedOption.value
                    } else {
                        // Try to convert boolean strings
                        if (currentValue === 'true' || currentValue === 'Active') {
                            convertedValue = true
                        } else if (currentValue === 'false' || currentValue === 'Inactive') {
                            convertedValue = false
                        }
                    }
                } else if (column.editType === 'number') {
                    convertedValue = Number(currentValue)
                } else if (column.editType === 'toggle') {
                    // Convert checkbox values to proper booleans
                    convertedValue = currentValue === '1' || currentValue === 'true' || (currentValue as any) === true
                } else if (column.filterType === 'date' && currentValue) {
                    // Convert date from dd.mm.yyyy (display format) to yyyy-mm-dd (API format)
                    const parsedDate = parseDDMMYYYY(currentValue)
                    if (parsedDate) {
                        convertedValue = formatDateForInput(parsedDate)
                    }
                }

                try {
                    const editUrl = inlineEditRoute
                        ? inlineEditRoute(item.id)
                        : `${window.location.pathname}/${item.id}`

                    // Check if this is a table data API endpoint and wrap data accordingly
                    const isTableDataEditApi = editUrl.includes('/tables/') && editUrl.includes('/data')
                    const editPayload = isTableDataEditApi
                        ? {
                            data: {
                                ...(isDynamicTableData ? (item as any).data : {}), // Preserve existing data
                                [editingCell.columnKey]: convertedValue  // Override with new value
                            }
                        }
                        : {[editingCell.columnKey]: convertedValue}

                    const response = await clientApiRequest(editUrl, {
                        method: 'PATCH',
                        body: JSON.stringify(editPayload),
                    })

                    if (response.ok) {
                        handleSaveSuccess()
                    } else {
                        console.error('❌ Save failed:', response.statusText)
                        // Extract specific error message from backend response
                        try {
                            const errorData = await response.json()

                            // Check if there are detailed validation errors
                            if ((errorData as any)?.details && Array.isArray((errorData as any).details)) {
                                const details = (errorData as any).details as string[]

                                // Try to find error for current column
                                const currentColumnError = details.find((err: string) =>
                                    err.toLowerCase().includes(`column '${editingCell.columnKey.toLowerCase()}'`)
                                )

                                if (currentColumnError) {
                                    // Extract the error message after the column name
                                    const match = currentColumnError.match(/Column '.*?':\s*(.+)/i)
                                    setEditingError(match ? match[1] : currentColumnError)
                                } else {
                                    // Show the first error if current column not found
                                    setEditingError(details[0] || 'Validation failed')
                                }
                            } else {
                                // Fallback to generic error messages
                                const errorMessage = (errorData as any)?.message || (errorData as any)?.error || 'Failed to save changes'
                                setEditingError(errorMessage)
                            }
                        } catch {
                            setEditingError('Failed to save changes')
                        }
                        setIsEditingSaving(false)
                    }
                } catch (error) {
                    console.error('💥 Save error:', error)
                    setEditingError('Failed to save changes')
                    setIsEditingSaving(false)
                }
            }
        } catch (error) {
            console.error('Save error:', error)
            setEditingError('Failed to save changes')
            setIsEditingSaving(false)
        }
    }

    const handleEditKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            saveEditing()
        } else if (e.key === 'Escape') {
            e.preventDefault()
            cancelEditing()
        }
    }

    return {
        editingCell,
        editValue,
        isEditingSaving,
        editingError,
        isClickingSaveButton,
        editingSaveSuccess,
        setEditValue,
        setIsClickingSaveButton,
        startEditing,
        cancelEditing,
        saveEditing,
        handleEditKeyPress,
        handleInputBlur
    }
}
