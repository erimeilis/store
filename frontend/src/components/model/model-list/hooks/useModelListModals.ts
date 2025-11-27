import React, { useState } from 'react'
import { IModel, IMassAction } from '@/types/models'
import { clientApiRequest } from '@/lib/client-api'
import { extractErrorMessage } from '../utils/api-error-handler'

interface UseModelListModalsProps {
    deleteRoute: (id: number | string) => string
    massActionRoute: string
    selectedItems: Set<number | string>
    setSelectedItems: React.Dispatch<React.SetStateAction<Set<number | string>>>
    onEditSuccess?: () => Promise<void> | void
    // All pages selection support
    isAllPagesSelected?: boolean
    setIsAllPagesSelected?: React.Dispatch<React.SetStateAction<boolean>>
}

interface UseModelListModalsReturn<T extends IModel> {
    // Delete modal
    deleteModalOpen: boolean
    itemToDelete: T | null
    isDeleting: boolean
    deleteError: string
    openDeleteModal: (item: T) => void
    closeDeleteModal: () => void
    handleDeleteConfirm: () => Promise<void>
    // Mass action modal
    massActionModalOpen: boolean
    selectedMassAction: IMassAction | null
    isExecutingMassAction: boolean
    massActionError: string
    openMassActionModal: (action: IMassAction) => void
    closeMassActionModal: () => void
    handleMassActionConfirm: (inputValue?: string | number) => Promise<void>
}

export function useModelListModals<T extends IModel>({
    deleteRoute,
    massActionRoute,
    selectedItems,
    setSelectedItems,
    onEditSuccess,
    isAllPagesSelected,
    setIsAllPagesSelected
}: UseModelListModalsProps): UseModelListModalsReturn<T> {
    // Delete modal state
    const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false)
    const [itemToDelete, setItemToDelete] = useState<T | null>(null)
    const [isDeleting, setIsDeleting] = useState<boolean>(false)
    const [deleteError, setDeleteError] = useState<string>('')

    // Mass action modal state
    const [massActionModalOpen, setMassActionModalOpen] = useState<boolean>(false)
    const [selectedMassAction, setSelectedMassAction] = useState<IMassAction | null>(null)
    const [isExecutingMassAction, setIsExecutingMassAction] = useState<boolean>(false)
    const [massActionError, setMassActionError] = useState<string>('')

    // Handle delete modal
    const openDeleteModal = (item: T) => {
        setItemToDelete(item)
        setDeleteModalOpen(true)
        setDeleteError('') // Reset any previous error
    }

    const closeDeleteModal = () => {
        setDeleteModalOpen(false)
        setItemToDelete(null)
        setIsDeleting(false)
        setDeleteError('') // Reset error when closing
    }

    const handleDeleteConfirm = async () => {
        if (!itemToDelete) return

        setIsDeleting(true)

        try {
            const response = await clientApiRequest(deleteRoute(itemToDelete.id), {
                method: 'DELETE',
            })

            if (response.ok) {
                closeDeleteModal()
                // Refresh data without page reload
                if (onEditSuccess) {
                    await onEditSuccess()
                } else {
                    window.location.reload()
                }
            } else {
                const errorMessage = await extractErrorMessage(response)
                setDeleteError(errorMessage)
                console.error('Delete failed:', response.statusText)
                setIsDeleting(false)
            }
        } catch (error) {
            console.error('Delete error:', error)
            setDeleteError('An unexpected error occurred while deleting the item.')
            setIsDeleting(false)
        }
    }

    // Handle mass action modal
    const openMassActionModal = (action: IMassAction) => {
        if (selectedItems.size === 0) {
            alert('Please select items from the table first.')
            return
        }
        setSelectedMassAction(action)
        setMassActionModalOpen(true)
        setMassActionError('') // Reset any previous error
    }

    const closeMassActionModal = () => {
        setMassActionModalOpen(false)
        setSelectedMassAction(null)
        setIsExecutingMassAction(false)
        setMassActionError('') // Reset error when closing
    }

    const handleMassActionConfirm = async (inputValue?: string | number) => {
        if (!selectedMassAction) {
            setMassActionError('No action selected')
            return
        }

        if (selectedItems.size === 0) {
            setMassActionError('No items selected. Please select items from the table first.')
            setIsExecutingMassAction(false)
            return
        }

        setIsExecutingMassAction(true)
        const selectedItemIds = Array.from(selectedItems)

        try {
            // Determine the correct parameter name based on the route
            const isColumnsRoute = massActionRoute.includes('/columns/mass-action')
            const idsParam = isColumnsRoute ? 'columnIds' : 'ids'

            // Build request body
            const requestBody: Record<string, any> = {
                action: selectedMassAction.name,
                [idsParam]: selectedItemIds,
            }

            // Add selectAll flag for all-pages selection (Gmail-style)
            if (isAllPagesSelected) {
                requestBody.selectAll = true
            }

            // Add field name and value for actions that require input
            if (selectedMassAction.requiresInput && inputValue !== undefined) {
                if (selectedMassAction.fieldName) {
                    requestBody.fieldName = selectedMassAction.fieldName
                }
                requestBody.value = inputValue
            }

            const response = await clientApiRequest(massActionRoute, {
                method: 'POST',
                body: JSON.stringify(requestBody),
            })

            if (response.ok) {
                closeMassActionModal()
                setSelectedItems(new Set()) // Clear selection after successful mass action
                // Clear all-pages selection flag
                if (setIsAllPagesSelected) {
                    setIsAllPagesSelected(false)
                }
                // Refresh data without page reload
                if (onEditSuccess) {
                    await onEditSuccess()
                } else {
                    window.location.reload()
                }
            } else {
                const errorMessage = await extractErrorMessage(response)
                setMassActionError(errorMessage)
                console.error('Mass action failed:', response.statusText)
                setIsExecutingMassAction(false)
            }
        } catch (error) {
            console.error('Mass action error:', error)
            setMassActionError('An unexpected error occurred while executing the mass action.')
            setIsExecutingMassAction(false)
        }
    }

    return {
        // Delete modal
        deleteModalOpen,
        itemToDelete,
        isDeleting,
        deleteError,
        openDeleteModal,
        closeDeleteModal,
        handleDeleteConfirm,
        // Mass action modal
        massActionModalOpen,
        selectedMassAction,
        isExecutingMassAction,
        massActionError,
        openMassActionModal,
        closeMassActionModal,
        handleMassActionConfirm
    }
}
