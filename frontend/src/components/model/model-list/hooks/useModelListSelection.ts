import React, { useState, useEffect } from 'react'
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
}

export function useModelListSelection<T extends IModel>({
    items,
    displayData
}: UseModelListSelectionProps<T>): UseModelListSelectionReturn {
    // Selection state
    const [selectedItems, setSelectedItems] = useState<Set<number | string>>(new Set())

    // Reset selected items when items change
    useEffect(() => {
        setSelectedItems(new Set())
    }, [items])

    const handleItemSelect = (itemId: number | string, checked: boolean) => {
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

        if (checked) {
            const allIds = displayData.data.map((item) => item.id)
            setSelectedItems(new Set(allIds))
        } else {
            setSelectedItems(new Set())
        }
    }

    return {
        selectedItems,
        setSelectedItems,
        handleItemSelect,
        handleSelectAll
    }
}
