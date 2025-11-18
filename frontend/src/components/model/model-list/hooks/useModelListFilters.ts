import React, { useState, useEffect, useRef, useCallback } from 'react'
import { IColumnDefinition } from '../types'
import { IModel } from '@/types/models'
import { formatDateForInput } from '@/lib/date-utils'

interface UseModelListFiltersProps<T extends IModel> {
    columns: IColumnDefinition<T>[]
    filters?: { [key: string]: any }
    dataEndpoint?: string
    loadData: () => Promise<void>
}

interface UseModelListFiltersReturn {
    columnFilters: Record<string, string>
    setColumnFilters: React.Dispatch<React.SetStateAction<Record<string, string>>>
    showFilters: boolean
    setShowFilters: React.Dispatch<React.SetStateAction<boolean>>
    openDateFilters: Set<string>
    setOpenDateFilters: React.Dispatch<React.SetStateAction<Set<string>>>
    calendarPositions: Record<string, { top: number; left: number; width: number }>
    setCalendarPositions: React.Dispatch<React.SetStateAction<Record<string, { top: number; left: number; width: number }>>>
    calendarTriggersRef: React.MutableRefObject<Record<string, HTMLDivElement | null>>
    handleSort: (columnKey: string) => void
    handleColumnFilter: (columnKey: string, value: string, filterType?: 'text' | 'select' | 'date') => void
    clearAllFilters: () => void
    toggleDateFilter: (columnKey: string) => void
    handleDateSelect: (columnKey: string, date: Date | undefined) => void
    handlePageChange: (page: number) => void
    getFilterParamName: (columnKey: string) => string
}

export function useModelListFilters<T extends IModel>({
    columns,
    filters,
    dataEndpoint,
    loadData
}: UseModelListFiltersProps<T>): UseModelListFiltersReturn {
    // Filter state
    const [columnFilters, setColumnFilters] = useState<Record<string, string>>({})
    const [showFilters, setShowFilters] = useState<boolean>(false)
    const [openDateFilters, setOpenDateFilters] = useState<Set<string>>(new Set())
    const [calendarPositions, setCalendarPositions] = useState<Record<string, { top: number; left: number; width: number }>>({})
    const calendarTriggersRef = useRef<Record<string, HTMLDivElement | null>>({})

    // Debounce ref for text filters
    const debounceTimeouts = useRef<Record<string, NodeJS.Timeout>>({})

    // Convert column key to camelCase filter parameter (email -> filterEmail)
    const getFilterParamName = (columnKey: string) => {
        return `filter${columnKey.charAt(0).toUpperCase()}${columnKey.slice(1)}`
    }

    // Initialize column filters from URL parameters
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        const initialFilters: Record<string, string> = {}
        columns.forEach((column) => {
            if (column.filterable) {
                const columnKey = String(column.key)
                const filterParam = getFilterParamName(columnKey)
                const filterValue = urlParams.get(filterParam)
                if (filterValue) {
                    initialFilters[columnKey] = filterValue
                }
            }
        })
        setColumnFilters(initialFilters)
        // Keep filters open if there are any active filters
        if (Object.keys(initialFilters).length > 0) {
            setShowFilters(true)
        }
    }, [columns])

    // Cleanup debounce timeouts on unmount
    useEffect(() => {
        const timeouts = debounceTimeouts.current
        return () => {
            Object.values(timeouts).forEach((timeout) => {
                if (timeout) clearTimeout(timeout)
            })
        }
    }, [])

    // Close date filter dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: globalThis.MouseEvent) => {
            if (openDateFilters.size > 0) {
                const target = event.target as Element
                const isCalendarTriggerClick = target.closest('[data-calendar-dropdown]')
                const isCalendarContentClick = target.closest('.rdp') || target.closest('[data-calendar-portal]')
                if (!isCalendarTriggerClick && !isCalendarContentClick) {
                    setOpenDateFilters(new Set())
                }
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [openDateFilters])

    // Handle sorting
    const handleSort = (columnKey: string) => {
        const currentSort = filters?.sort
        const currentDirection = filters?.direction || 'asc'

        let newDirection: 'asc' | 'desc' = 'asc'
        if (currentSort === columnKey && currentDirection === 'asc') {
            newDirection = 'desc'
        }

        const params = new URLSearchParams(window.location.search)
        params.set('sort', columnKey)
        params.set('direction', newDirection)
        params.set('page', '1') // Reset to first page when sorting

        // Update URL in browser history without reload
        window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`)

        // Fetch data with new sort if using client-side data fetching
        if (dataEndpoint) {
            loadData()
        } else {
            // Fallback to page reload for SSR mode
            window.location.reload()
        }
    }

    // Handle pagination changes without page reload
    const handlePageChange = useCallback((page: number) => {

        const params = new URLSearchParams(window.location.search)
        params.set('page', page.toString())

        const newUrl = `${window.location.pathname}?${params.toString()}`

        // Update URL in browser history without reload
        window.history.pushState({}, '', newUrl)

        // Fetch data for new page if using client-side data fetching
        if (dataEndpoint) {
            loadData()
        } else {
            // Fallback to page reload for SSR mode
            window.location.reload()
        }
         
    }, [dataEndpoint])

    // Handle column filtering with debouncing for text inputs
    const updateUrlWithFilter = useCallback((columnKey: string, value: string) => {

        const params = new URLSearchParams(window.location.search)
        const filterParam = getFilterParamName(columnKey)

        if (value.trim() === '') {
            params.delete(filterParam)
        } else {
            params.set(filterParam, value)
        }
        params.set('page', '1') // Reset to first page when filtering

        const newUrl = `${window.location.pathname}?${params.toString()}`

        // Update URL in browser history without reload
        window.history.pushState({}, '', newUrl)

        // Fetch data with new filter if using client-side data fetching
        if (dataEndpoint) {
            loadData()
        } else {
            // Fallback to page reload for SSR mode
            window.location.reload()
        }
         
    }, [dataEndpoint])

    const handleColumnFilter = (columnKey: string, value: string, filterType?: 'text' | 'select' | 'date') => {

        const newFilters = {...columnFilters}

        if (value.trim() === '') {
            delete newFilters[columnKey]
        } else {
            newFilters[columnKey] = value
        }

        setColumnFilters(newFilters)

        // Clear any existing timeout for this column
        if (debounceTimeouts.current[columnKey]) {
            clearTimeout(debounceTimeouts.current[columnKey])
        }

        // For text filters, debounce the URL update
        if (filterType === 'text') {
            debounceTimeouts.current[columnKey] = setTimeout(() => {
                updateUrlWithFilter(columnKey, value)
            }, 1500) // 1500ms debounce for better UX
        } else {
            // For select and date filters, update immediately
            updateUrlWithFilter(columnKey, value)
        }
    }

    // Clear all column filters
    const clearAllFilters = () => {
        setColumnFilters({})
        // Don't close filter panel - let user control it with Filter button

        const params = new URLSearchParams(window.location.search)
        columns.forEach((column) => {
            if (column.filterable) {
                const filterParam = getFilterParamName(String(column.key))
                params.delete(filterParam)
            }
        })

        // Update URL in browser history without reload
        window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`)

        // Fetch data with cleared filters if using client-side data fetching
        if (dataEndpoint) {
            loadData()
        } else {
            // Fallback to page reload for SSR mode
            window.location.reload()
        }
    }

    // Handle date filter dropdown toggle
    const toggleDateFilter = (columnKey: string) => {
        setOpenDateFilters((prev) => {
            const newSet = new Set(prev)
            if (newSet.has(columnKey)) {
                newSet.delete(columnKey)
                // Remove position data when closing
                setCalendarPositions((prevPos) => {
                    const newPos = {...prevPos}
                    delete newPos[columnKey]
                    return newPos
                })
            } else {
                newSet.add(columnKey)
                // Calculate position when opening
                const triggerElement = calendarTriggersRef.current[columnKey]
                if (triggerElement) {
                    const rect = triggerElement.getBoundingClientRect()
                    setCalendarPositions((prevPos) => ({
                        ...prevPos,
                        [columnKey]: {
                            top: rect.bottom + window.scrollY + 4, // 4px margin
                            left: rect.left + window.scrollX,
                            width: rect.width,
                        },
                    }))
                }
            }
            return newSet
        })
    }

    // Handle date selection from calendar
    const handleDateSelect = (columnKey: string, date: Date | undefined) => {
        const dateValue = date ? formatDateForInput(date) : ''
        handleColumnFilter(columnKey, dateValue, 'date')
        // Close the dropdown after selection
        setOpenDateFilters((prev) => {
            const newSet = new Set(prev)
            newSet.delete(columnKey)
            return newSet
        })
    }

    return {
        columnFilters,
        setColumnFilters,
        showFilters,
        setShowFilters,
        openDateFilters,
        setOpenDateFilters,
        calendarPositions,
        setCalendarPositions,
        calendarTriggersRef,
        handleSort,
        handleColumnFilter,
        clearAllFilters,
        toggleDateFilter,
        handleDateSelect,
        handlePageChange,
        getFilterParamName
    }
}
