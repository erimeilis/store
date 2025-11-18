import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { IModel, IPaginatedResponse } from '@/types/models'
import { clientApiRequest } from '@/lib/client-api'
import { extractErrorMessage } from '../utils/api-error-handler'

interface UseModelListDataProps<T extends IModel> {
    items: IPaginatedResponse<T> | null
    dataEndpoint?: string
}

interface UseModelListDataReturn<T extends IModel> {
    clientData: IPaginatedResponse<T> | null
    setClientData: React.Dispatch<React.SetStateAction<IPaginatedResponse<T> | null>>
    isLoadingData: boolean
    dataError: string | null
    displayData: IPaginatedResponse<T> | null
    loadData: () => Promise<void>
}

export function useModelListData<T extends IModel>({
    items,
    dataEndpoint
}: UseModelListDataProps<T>): UseModelListDataReturn<T> {
    // Client-side data fetching state - initialize with SSR data if available
    const [clientData, setClientData] = useState<IPaginatedResponse<T> | null>(items || null)
    const [isLoadingData, _setIsLoadingData] = useState<boolean>(false)
    const [dataError, setDataError] = useState<string | null>(null)

    // Use client-side data if dataEndpoint is provided, otherwise use SSR data
    // Memoize to prevent unnecessary re-renders
    const displayData = useMemo((): IPaginatedResponse<T> | null => {
        const result = dataEndpoint ? (clientData || items) : items
        return result || null
    }, [dataEndpoint, clientData, items])

    // Client-side data fetching function
    const loadData = useCallback(async () => {
        if (!dataEndpoint) {
            return
        }

        // Don't set loading state - causes unnecessary blink
        // The table will smoothly update when new data arrives
        setDataError(null)

        try {
            const params = new URLSearchParams(window.location.search)
            const url = `${dataEndpoint}?${params.toString()}`

            const response = await clientApiRequest(url)

            if (response.ok) {
                const result = await response.json() as any

                // Transform nested pagination structure to flat structure
                // Some APIs return { data: [], pagination: {} }, others return flat { data: [], total: number, ... }
                const transformedResult: IPaginatedResponse<T> = result.pagination ? {
                    data: result.data,
                    currentPage: result.pagination.currentPage ?? 1,
                    lastPage: result.pagination.lastPage ?? 1,
                    perPage: result.pagination.perPage ?? items?.perPage ?? 10,
                    total: result.pagination.total ?? 0,
                    from: result.pagination.from ?? null,
                    to: result.pagination.to ?? null,
                    links: result.pagination.links ?? [],
                    prevPageUrl: result.pagination.prevPageUrl ?? null,
                    nextPageUrl: result.pagination.nextPageUrl ?? null,
                    lastPageUrl: result.pagination.lastPageUrl ?? null
                } : result as IPaginatedResponse<T>

                setClientData(transformedResult)
            } else {
                const errorMessage = await extractErrorMessage(response)
                setDataError(errorMessage)
            }
        } catch (error) {
            setDataError(error instanceof Error ? error.message : 'Failed to load data')
        }
    }, [dataEndpoint])

    // Sync clientData when items prop changes (e.g., from parent's onEditSuccess)
    useEffect(() => {
        if (items) {
            setClientData(items)
        }
    }, [items])

    // Only load data on mount if we don't have SSR data
    useEffect(() => {
        if (dataEndpoint && !items) {
            loadData()
        }

    }, [dataEndpoint])

    return {
        clientData,
        setClientData,
        isLoadingData,
        dataError,
        displayData,
        loadData
    }
}
