import { useState } from 'react'
import React from 'react'
import { IModel, IPaginatedResponse } from '@/types/models'
import {
    DragState,
    getItemPositionInfo,
    handleDragEnd,
    handleDragOver,
    handleDragStart,
    handleDrop,
    moveItem,
    OrderingContext
} from '@/lib/ordering-utils'
import { IOrderingConfig, IOrderingHandlers } from '../types'

interface UseOrderingProps<T extends IModel> {
    displayData: IPaginatedResponse<T> | null
    orderingConfig?: IOrderingConfig<T>
}

interface UseOrderingReturn<T extends IModel> {
    dragState: DragState<T>
    setDragState: React.Dispatch<React.SetStateAction<DragState<T>>>
    orderingContext: OrderingContext<T> | null
    orderingHandlers: IOrderingHandlers<T> | undefined
}

export function useOrdering<T extends IModel>({
    displayData,
    orderingConfig
}: UseOrderingProps<T>): UseOrderingReturn<T> {
    // Ordering state
    const [dragState, setDragState] = useState<DragState<T>>({draggedItem: null, isDragging: false})

    // Create ordering context and handlers if ordering is enabled
    const orderingContext: OrderingContext<T> | null = orderingConfig?.enabled ? {
        items: displayData?.data || [],
        positionField: String(orderingConfig.positionField),
        idField: String(orderingConfig.idField),
        swapEndpoint: orderingConfig.swapEndpoint,
        recountEndpoint: orderingConfig.recountEndpoint,
        recountDelay: orderingConfig.recountDelay,
        onReload: async () => {
            if (orderingConfig.onReorder) {
                // Use custom reload function to avoid page reload
                await orderingConfig.onReorder([] as any, (() => {
                }) as any)
            } else {
                // Fallback to page reload if no custom reload function provided
                window.location.reload()
            }
        }
    } : null

    const orderingHandlers: IOrderingHandlers<T> | undefined = orderingContext ? {
        onDragStart: (e: React.DragEvent, item: T) =>
            handleDragStart(e, item, setDragState, orderingContext.idField),
        onDragOver: handleDragOver,
        onDragEnd: (e: React.DragEvent) =>
            handleDragEnd(e, setDragState),
        onDrop: (e: React.DragEvent, targetItem: T) =>
            handleDrop(e, targetItem, dragState, orderingContext, setDragState),
        onMoveItem: (item: T, direction: 'up' | 'down') =>
            moveItem(item, direction, orderingContext),
        getPositionInfo: (item: T) => {
            const info = getItemPositionInfo(item, orderingContext.items, orderingContext.positionField, orderingContext.idField)
            return {
                isFirst: info.isFirst,
                isLast: info.isLast,
                sortedIndex: orderingContext.items.findIndex(i => i[orderingContext.idField as keyof T] === item[orderingContext.idField as keyof T])
            }
        }
    } : undefined

    return {
        dragState,
        setDragState,
        orderingContext,
        orderingHandlers
    }
}
