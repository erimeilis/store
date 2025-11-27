/**
 * Table Data View and Editing Page - Refactored with ModelList
 * Uses the universal ModelList component for consistent UX
 */

'use client'

import React, {useEffect, useState} from 'react'
import {IColumnDefinition, ModelList} from '@/components/model/model-list'
import {IPaginatedResponse} from '@/types/models'
import {TableColumn, TableDataRow} from '@/types/dynamic-tables'
import {formatApiDate} from '@/lib/date-utils'
import {clientApiRequest} from '@/lib/client-api'
import {CountryDisplay, getCountryOptions} from '@/components/ui/country-select'
import {BooleanCircle} from '@/components/ui/boolean-circle'
import {TablePageHeader} from '@/components/table-page-header'
import {IconFlag, IconWand} from '@tabler/icons-react'
import {toDisplayName} from '@/utils/column-name-utils'

interface TableDataPageProps {
    initialData?: IPaginatedResponse<ExtendedTableDataRow> | null;
    tableId?: string;
}

// Extended TableDataRow to work with ModelList
interface ExtendedTableDataRow extends TableDataRow {
    // Add any additional fields needed by ModelList
    [key: string]: any;
}

export default function TableDataPage({
                                          initialData = null,
                                          tableId
                                      }: TableDataPageProps) {

    console.log('🔍 TableDataPage Props Structure:', JSON.stringify(initialData, null, 2))

    console.log('🔍 TableDataPage Props Summary:', {
        hasInitialData: !!initialData,
        tableId,
        keys: initialData ? Object.keys(initialData) : null,
        meta: initialData?.meta,
        currentPage: initialData?.currentPage,
        dataLength: initialData?.data?.length,
        // Check if meta is in a different location
        metaAlternatives: initialData ? {
            rootMeta: initialData.meta,
            dataMeta: initialData.data?.[0]?.meta,
            hasColumns: !!initialData.meta?.columns
        } : null
    })

    // FORCE EXTRACTION DEBUG - This should show if the fix works
    console.log('🚨 EXTRACTION DEBUG - _meta:', (initialData as any)?._meta)
    console.log('🚨 EXTRACTION DEBUG - _meta.columns length:', (initialData as any)?._meta?.columns?.length || 0)

    // If we have initialData (server-side), use it directly
    // If not, we're in client-side mode and need to load data
    const [paginatedData, setPaginatedData] = useState<IPaginatedResponse<ExtendedTableDataRow> | null>(initialData)
    const [isLoading, setIsLoading] = useState(!initialData)
    const [error, setError] = useState<string>('')

    // Country issue detection state
    const [countryIssues, setCountryIssues] = useState<{
        hasIssues: boolean
        totalIssues: number
        fixableIssues: number
        totalAffectedRows: number
    } | null>(null)
    const [isFixingCountries, setIsFixingCountries] = useState(false)
    const [countryFixResult, setCountryFixResult] = useState<string | null>(null)

    // Get tableId from URL if not passed as prop (client-side)
    const currentTableId = tableId || (typeof window !== 'undefined' ? window.location.pathname.split('/')[3] : undefined)

    useEffect(() => {
        // Only load data if we don't have initialData (client-side scenario)
        if (!initialData && currentTableId) {
            loadTableData()
        } else if (initialData && currentTableId) {
            // If we have initial data, still check for country issues
            checkCountryIssues()
        }
    }, [currentTableId, initialData])

    // Reload data when URL parameters change (pagination, filtering)
    useEffect(() => {
        if (!initialData && currentTableId) {
            loadTableData()
        }
    }, [typeof window !== 'undefined' ? window.location.search : ''])

    const loadTableData = async () => {
        if (!currentTableId) {
            setError('Table ID is required')
            return
        }

        setIsLoading(true)
        try {
            const currentUrl = new URL(window.location.href)
            const queryParams = currentUrl.search
            const apiUrl = `/api/tables/${currentTableId}/data${queryParams}`

            console.log('🔍 TableData loadTableData - API URL:', apiUrl)

            const response = await clientApiRequest(apiUrl)
            if (response.ok) {
                const result = await response.json() as IPaginatedResponse<ExtendedTableDataRow>
                setPaginatedData(result)
                // Check for country issues after loading data
                checkCountryIssues()
            } else {
                const errorData = await response.json() as any
                setError(errorData.message || 'Failed to load table data')
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to load table data')
        } finally {
            setIsLoading(false)
        }
    }

    // Check for country issues (raw names instead of ISO codes)
    const checkCountryIssues = async () => {
        if (!currentTableId) return

        try {
            const response = await clientApiRequest(`/api/tables/${currentTableId}/data/country-issues`)
            if (response.ok) {
                const result = await response.json() as {
                    hasIssues: boolean
                    totalIssues: number
                    fixableIssues: number
                    totalAffectedRows: number
                }
                // Response is the data directly (not wrapped in {success, data})
                if (result.hasIssues !== undefined) {
                    setCountryIssues(result)
                }
            }
        } catch (err) {
            console.error('Failed to check country issues:', err)
        }
    }

    // Fix all country codes
    const handleFixCountries = async () => {
        if (!currentTableId) return

        setIsFixingCountries(true)
        setCountryFixResult(null)

        try {
            const response = await clientApiRequest(`/api/tables/${currentTableId}/data/fix-countries`, {
                method: 'POST'
            })

            if (response.ok) {
                const result = await response.json() as {
                    fixed: number
                    failed: number
                    message?: string
                }
                // Response is the data directly (not wrapped in {success, data})
                if (result.fixed !== undefined) {
                    setCountryFixResult(`Fixed ${result.fixed} row(s)${result.failed > 0 ? `, ${result.failed} failed` : ''}`)
                    // Reload data and recheck issues
                    await loadTableData()
                } else {
                    setCountryFixResult(`Error: ${result.message || 'Unknown error'}`)
                }
            } else {
                const errorData = await response.json() as { message?: string }
                setCountryFixResult(`Error: ${errorData.message || 'Failed to fix countries'}`)
            }
        } catch (err) {
            setCountryFixResult(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
        } finally {
            setIsFixingCountries(false)
        }
    }

    // Generate dynamic column definitions from table schema
    const generateColumnDefinitions = (columns: TableColumn[]): IColumnDefinition<ExtendedTableDataRow>[] => {
        return columns.map(column => {
            // Convert internal camelCase name to display Title Case
            const displayName = toDisplayName(column.name)
            const columnDef: IColumnDefinition<ExtendedTableDataRow> = {
                key: column.name,
                label: displayName + (column.isRequired ? ' *' : '') + (!column.allowDuplicates ? ' ∃!' : ''),
                sortable: true,
                filterable: true,
                filterType: getFilterType(column.type),
                editableInline: true,
                editType: getEditType(column.type),
                editValidation: {
                    required: column.isRequired && (column.defaultValue === null || column.defaultValue === undefined),
                    ...(column.type === 'email' && {pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/})
                },
                render: (row) => renderCellValue(column, row.data[column.name])
            }

            // Add filter options for boolean columns
            if (column.type === 'boolean') {
                columnDef.filterType = 'select'
                columnDef.filterOptions = [
                    {value: 'true', label: 'Yes'},
                    {value: 'false', label: 'No'}
                ]
                columnDef.editType = 'toggle'
                columnDef.editOptions = [
                    {value: 'false', label: 'No'},
                    {value: 'true', label: 'Yes'}
                ]
            }

            // Add filter options and edit options for country columns
            if (column.type === 'country') {
                const countryOptions = getCountryOptions()
                columnDef.filterType = 'select'
                columnDef.filterOptions = countryOptions.map(option => ({
                    value: option.value,
                    label: option.country.name
                }))
                columnDef.editType = 'select'
                columnDef.editOptions = countryOptions.map(option => ({
                    value: option.value,
                    label: option.label
                }))
            }

            return columnDef
        })
    }

    const getFilterType = (columnType: string): 'text' | 'select' | 'date' => {
        switch (columnType) {
            case 'date':
                return 'date'
            case 'boolean':
                return 'select'
            default:
                return 'text'
        }
    }

    const getEditType = (columnType: string): 'text' | 'email' | 'number' | 'select' | 'date' | 'toggle' => {
        switch (columnType) {
            case 'email':
                return 'email'
            case 'number':
                return 'number'
            case 'date':
                return 'date'
            case 'boolean':
                return 'toggle'
            case 'country':
                return 'select'
            default:
                return 'text'
        }
    }

    const renderCellValue = (column: TableColumn, value: any) => {
        // Check if this is a price column in a for sale table
        if (column.name.toLowerCase() === 'price' && table?.forSale && column.type === 'number' && value != null) {
            return (
                <span className="font-mono">
          ${Number(value).toFixed(2)}
        </span>
            )
        }

        switch (column.type) {
            case 'boolean':
                return (
                    <div className="flex justify-center">
                        <BooleanCircle
                            value={value}
                            size="md"
                            title={value ? 'Yes' : 'No'}
                        />
                    </div>
                )
            case 'date':
                return value ? formatApiDate(value) : '-'
            case 'url':
                return value ? (
                    <a href={value} target="_blank" rel="noopener noreferrer" className="link link-primary">
                        {value}
                    </a>
                ) : '-'
            case 'email':
                return value ? (
                    <a href={`mailto:${value}`} className="link link-primary">
                        {value}
                    </a>
                ) : '-'
            case 'country':
                return value ? <CountryDisplay countryCode={value}/> : '-'
            default:
                return value || '-'
        }
    }

    // Extract table metadata from the response - the data is at _meta, not meta
    const metaData = (paginatedData as any)?._meta
    const table = metaData?.table
    const columns = metaData?.columns || []

    console.log('🔍 Fixed extraction - table:', table?.name)
    console.log('🔍 Fixed extraction - columns.length:', columns.length)

    // Mass actions for table data
    const dataMassActions = [
        {
            name: 'delete',
            label: 'Delete Rows',
            confirmMessage: 'Are you sure you want to delete the selected rows? This action cannot be undone.'
        },
        // Add populate actions for forSale tables
        ...(table?.forSale ? [
            {
                name: 'set_field_value',
                label: 'Set Price',
                confirmMessage: 'Enter the price value to set for all selected rows.',
                requiresInput: true,
                fieldName: 'price',
                inputConfig: {
                    type: 'currency' as const,
                    label: 'Price',
                    placeholder: 'Enter price...',
                    min: 0
                }
            },
            {
                name: 'set_field_value',
                label: 'Set Quantity',
                confirmMessage: 'Enter the quantity value to set for all selected rows.',
                requiresInput: true,
                fieldName: 'qty',
                inputConfig: {
                    type: 'integer' as const,
                    label: 'Quantity',
                    placeholder: 'Enter quantity...',
                    min: 0
                }
            }
        ] : [])
    ]

    if (isLoading) {
        return (
            <div className="container mx-auto sm:p-4">
                <div className="flex justify-center items-center h-64">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            </div>
        )
    }

    if (error || !paginatedData) {
        return (
            <div className="container mx-auto sm:p-4">
                <div className="alert alert-error">
                    <svg className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span>{error || 'Failed to load table data'}</span>
                </div>
            </div>
        )
    }

    const columnDefinitions = generateColumnDefinitions(columns)

    // Extract filters from URL parameters (including sort and direction)
    const urlFilters: { [key: string]: any } = {}
    if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search)
        params.forEach((value, key) => {
            urlFilters[key] = value
        })
    }

    // Transform data to include flattened data for ModelList
    const transformedPaginatedData = {
        ...paginatedData,
        data: paginatedData.data.map(row => ({
            ...row,
            // Flatten the data object to top level for easier access
            ...row.data
        }))
    }

    // Debug log to check pagination data
    console.log('🔍 TableData Debug:', {
        title: 'Table Data',
        createRoute: undefined,
        columns: columnDefinitions.length,
        table: table?.name,
        totalRows: transformedPaginatedData.total,
        paginatedData: {
            currentPage: transformedPaginatedData.currentPage,
            lastPage: transformedPaginatedData.lastPage,
            perPage: transformedPaginatedData.perPage,
            total: transformedPaginatedData.total,
            displayedRows: transformedPaginatedData.data.length
        }
    })

    return (
        <div className="container mx-auto sm:p-4">
            <TablePageHeader
                subtitle={<>View and manage data in <strong className="truncate">{table?.name}</strong></>}
                description={table?.description || undefined}
                tableId={currentTableId || ''}
                activePage="data"
                tableName={table?.name}
            />

            {/* Country Issues Banner */}
            {countryIssues?.hasIssues && (
                <div className="alert alert-warning mb-4 shadow-lg">
                    <IconFlag className="h-5 w-5" />
                    <div className="flex-1">
                        <h3 className="font-bold">Country Data Needs Fixing</h3>
                        <p className="text-sm">
                            Found {countryIssues.totalIssues} country value(s) in {countryIssues.totalAffectedRows} row(s)
                            that use full names instead of ISO codes.
                            {countryIssues.fixableIssues > 0 && ` ${countryIssues.fixableIssues} can be automatically converted.`}
                        </p>
                        {countryFixResult && (
                            <p className={`text-sm mt-1 ${countryFixResult.startsWith('Error') ? 'text-error' : 'text-success'}`}>
                                {countryFixResult}
                            </p>
                        )}
                    </div>
                    <button
                        className="btn btn-sm btn-warning gap-1"
                        onClick={handleFixCountries}
                        disabled={isFixingCountries || countryIssues.fixableIssues === 0}
                    >
                        {isFixingCountries ? (
                            <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                            <IconWand className="h-4 w-4" />
                        )}
                        {isFixingCountries ? 'Fixing...' : 'Fix All'}
                    </button>
                </div>
            )}

            <ModelList<ExtendedTableDataRow>
                title="Table Data"
                items={transformedPaginatedData}
                filters={urlFilters}
                columns={columnDefinitions}
                createRoute={undefined}
                editRoute={(id) => `/dashboard/tables/${currentTableId}/data/edit/${id}`}
                deleteRoute={(id) => `/api/tables/${currentTableId}/data/${id}`}
                inlineEditRoute={(id) => `/api/tables/${currentTableId}/data/${id}`}
                massActionRoute={`/api/tables/${currentTableId}/data/mass-action`}
                massActions={dataMassActions}
                onEditSuccess={loadTableData}
                dataEndpoint={`/api/tables/${currentTableId}/data`}
                compactPagination={true}
            />
        </div>
    )
}

export const metadata = {
    title: 'Table Data - Dynamic Tables',
    description: 'View and manage data in your dynamic table'
}
