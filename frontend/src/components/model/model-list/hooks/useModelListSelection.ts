import React, { useState, useEffect, useMemo } from 'react'
import { IModel, IPaginatedResponse } from '@/types/models'

interface UseModelListSelectionProps<T extends IModel> {
    items: IPaginatedResponse<T> | null
    displayData: IPaginatedResponse<T> | null
}

interface UseModelListSelectionReturn {
    selectedItems: Set<number | string>
    setSelectedItems: React.Dispatch<React.SetStateAction<Set<number | string>>>
    handleItemSelect: (itemId: number | string, checked: boolean) => void
    handleSelectAll: (checked: boolean) => void
    // All pages selection
    isAllPagesSelected: boolean
    setIsAllPagesSelected: React.Dispatch<React.SetStateAction<boolean>>
    handleSelectAllPages: () => void
    clearAllPagesSelection: () => void
    // Derived state for showing banner
    isAllCurrentPageSelected: boolean
    totalItems: number
    currentPageItemCount: number
}

export function useModelListSelection<T extends IModel>({
    items,
    displayData
}: UseModelListSelectionProps<T>): UseModelListSelectionReturn {
    // Selection state
    const [selectedItems, setSelectedItems] = useState<Set<number | string>>(new Set())
    // Track if user selected "all pages" (Gmail-style)
    const [isAllPagesSelected, setIsAllPagesSelected] = useState<boolean>(false)

    // Derived values
    const totalItems = displayData?.total || 0
    const currentPageItemCount = displayData?.data?.length || 0

    // Check if all items on current page are selected
    const isAllCurrentPageSelected = useMemo(() => {
        if (!displayData?.data || displayData.data.length === 0) return false
        return displayData.data.every((item) => selectedItems.has(item.id))
    }, [displayData?.data, selectedItems])

    // Reset selected items when items change (e.g., page change, filtering)
    useEffect(() => {
        setSelectedItems(new Set())
        setIsAllPagesSelected(false)
    }, [items])

    const handleItemSelect = (itemId: number | string, checked: boolean) => {
        // When user manually selects/deselects, clear "all pages" selection
        setIsAllPagesSelected(false)
        setSelectedItems((prev) => {
            const newSet = new Set(prev)
            if (checked) {
                newSet.add(itemId)
            } else {
                newSet.delete(itemId)
            }
            return newSet
        })
    }

    const handleSelectAll = (checked: boolean) => {
        if (!displayData?.data) return

        // Clear "all pages" selection when using page-level select all
        setIsAllPagesSelected(false)

        if (checked) {
            const allIds = displayData.data.map((item) => item.id)
            setSelectedItems(new Set(allIds))
        } else {
            setSelectedItems(new Set())
        }
    }

    // Select all items across all pages
    const handleSelectAllPages = () => {
        if (!displayData?.data) return
        // Select all current page items visually
        const allIds = displayData.data.map((item) => item.id)
        setSelectedItems(new Set(allIds))
        // Mark that we want ALL pages
        setIsAllPagesSelected(true)
    }

    // Clear all pages selection and go back to normal selection
    const clearAllPagesSelection = () => {
        setIsAllPagesSelected(false)
        // Keep current page selection
    }

    return {
        selectedItems,
        setSelectedItems,
        handleItemSelect,
        handleSelectAll,
        // All pages selection
        isAllPagesSelected,
        setIsAllPagesSelected,
        handleSelectAllPages,
        clearAllPagesSelection,
        // Derived state
        isAllCurrentPageSelected,
        totalItems,
        currentPageItemCount
    }
}
