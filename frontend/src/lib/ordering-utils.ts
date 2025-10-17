/**
 * Reusable ordering utilities for ModelList drag-and-drop functionality
 * Extracted from columns page to make ordering reusable across different models
 */

import React from 'react'
import { clientApiRequest } from '@/lib/client-api'
import { IModel } from '@/types/models'

export interface OrderingContext<T extends IModel> {
  items: T[]
  positionField: keyof T
  idField: keyof T
  swapEndpoint: string
  recountEndpoint?: string
  recountDelay?: number
  onReload: () => Promise<void>
}

export interface DragState<T> {
  draggedItem: T | null
  isDragging: boolean
}

/**
 * Handle drag start event
 */
export function handleDragStart<T extends IModel>(
  e: React.DragEvent,
  item: T,
  setState: (state: DragState<T>) => void,
  idField: keyof T
) {
  setState({ draggedItem: item, isDragging: true })
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', String(item[idField]))

  // Add visual feedback
  if (e.currentTarget instanceof HTMLElement) {
    e.currentTarget.style.opacity = '0.5'
  }
}

/**
 * Handle drag over event
 */
export function handleDragOver(e: React.DragEvent) {
  e.preventDefault()
  e.dataTransfer.dropEffect = 'move'
}

/**
 * Handle drag end event
 */
export function handleDragEnd<T>(
  e: React.DragEvent,
  setState: (state: DragState<T>) => void
) {
  // Reset visual feedback
  if (e.currentTarget instanceof HTMLElement) {
    e.currentTarget.style.opacity = '1'
  }
  setState({ draggedItem: null, isDragging: false })
}

/**
 * Handle drop event with simple swap
 */
export async function handleDrop<T extends IModel>(
  e: React.DragEvent,
  targetItem: T,
  dragState: DragState<T>,
  context: OrderingContext<T>,
  setState: (state: DragState<T>) => void
) {
  e.preventDefault()

  if (!dragState.draggedItem || dragState.draggedItem[context.idField] === targetItem[context.idField]) {
    setState({ draggedItem: null, isDragging: false })
    return
  }

  try {
    // Simple swap using the swap endpoint
    const swapResponse = await clientApiRequest(context.swapEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        columnId1: dragState.draggedItem[context.idField],
        columnId2: targetItem[context.idField]
      })
    })

    if (!swapResponse.ok) {
      const errorData = await swapResponse.json()
      console.error('❌ Failed to swap items:', errorData)
      alert('Failed to reorder items. Please try again.')
      return
    }

    // Reload data
    await context.onReload()
    console.log('✅ Items reordered via drag-and-drop successfully')

    // Schedule recount if configured
    if (context.recountEndpoint) {
      scheduleRecount(context)
    }
  } catch (error) {
    console.error('❌ Error reordering items:', error)
    alert(`Error reordering items: ${error instanceof Error ? error.message : 'Unknown error'}`)
  } finally {
    setState({ draggedItem: null, isDragging: false })

    // Reset visual feedback
    const dragElements = document.querySelectorAll('.drag-handle')
    dragElements.forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.opacity = '1'
      }
    })
  }
}

/**
 * Move item up or down in position (simple swap with adjacent item)
 */
export async function moveItem<T extends IModel>(
  item: T,
  direction: 'up' | 'down',
  context: OrderingContext<T>
) {
  // Sort items by position to find the actual adjacent item
  const sortedItems = [...context.items].sort((a, b) =>
    Number(a[context.positionField]) - Number(b[context.positionField])
  )
  const currentIndex = sortedItems.findIndex(sortedItem =>
    sortedItem[context.idField] === item[context.idField]
  )

  // Find the target index based on direction
  let targetIndex: number
  if (direction === 'up') {
    targetIndex = currentIndex - 1
  } else {
    targetIndex = currentIndex + 1
  }

  // Check bounds
  if (targetIndex < 0 || targetIndex >= sortedItems.length) {
    return
  }

  const targetItem = sortedItems[targetIndex]

  try {
    // Simple swap with adjacent item using the swap endpoint
    const swapResponse = await clientApiRequest(context.swapEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        columnId1: item[context.idField],
        columnId2: targetItem[context.idField]
      })
    })

    if (!swapResponse.ok) {
      const errorData = await swapResponse.json()
      console.error('❌ Failed to swap items:', errorData)
      alert('Failed to reorder items. Please try again.')
      return
    }

    // Reload data
    await context.onReload()
    console.log(`✅ Item moved ${direction} successfully via swap`)
  } catch (error) {
    console.error('❌ Error moving item:', error)
    alert(`Error moving item: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Schedule automatic position recount
 */
export function scheduleRecount<T extends IModel>(context: OrderingContext<T>) {
  if (!context.recountEndpoint) return

  const delay = context.recountDelay || 2000 // Default 2 seconds

  setTimeout(async () => {
    try {
      await clientApiRequest(context.recountEndpoint!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      await context.onReload() // Reload to show recounted positions
      console.log('✅ Item positions recounted')
    } catch (error) {
      console.error('❌ Failed to recount positions:', error)
    }
  }, delay)
}

/**
 * Get position in sorted order for up/down button state
 */
export function getItemPositionInfo<T extends IModel>(
  item: T,
  items: T[],
  positionField: keyof T,
  idField: keyof T
): { isFirst: boolean; isLast: boolean; sortedIndex: number } {
  const sortedItems = [...items].sort((a, b) =>
    Number(a[positionField]) - Number(b[positionField])
  )

  const sortedIndex = sortedItems.findIndex(sortedItem =>
    sortedItem[idField] === item[idField]
  )

  return {
    isFirst: sortedIndex === 0,
    isLast: sortedIndex === sortedItems.length - 1,
    sortedIndex
  }
}