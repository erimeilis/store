/**
 * Table Columns Management Page
 * Manage column definitions using ModelList component
 */

'use client'

import React, {useEffect, useState} from 'react'
import {IColumnDefinition, IRowAction, ModelList} from '@/components/model/model-list'
import {Alert} from '@/components/ui/alert'
import {Badge} from '@/components/ui/badge'
import {IconCopy, IconPlus} from '@tabler/icons-react'
import {COLUMN_TYPE_OPTIONS, getColumnTypeLabel, isProtectedSaleColumn, TableColumn, TableSchema} from '@/types/dynamic-tables'
import {IMassAction, IPaginatedResponse} from '@/types/models'
import {formatApiDate} from '@/lib/date-utils'
import {clientApiRequest} from '@/lib/client-api'
import {TableNavigation} from '@/components/table-navigation'
import {ProtectedColumnBadge} from '@/components/protected-column-indicator'

interface TableColumnsPageProps {
    tableSchema?: TableSchema | null;
    tableId?: string;
}

// Column interface that extends IModel for ModelList compatibility
interface ColumnModel extends TableColumn {
    // TableColumn already has id, so it's compatible with IModel
}

export default function TableColumnsPage({tableSchema = null, tableId}: TableColumnsPageProps) {
    const [isLoading, setIsLoading] = useState(!tableSchema)
    const [schema, setSchema] = useState<TableSchema | null>(tableSchema)
    const [columnsData, setColumnsData] = useState<IPaginatedResponse<ColumnModel> | null>(null)
    const [error, setError] = useState<string | null>(null)

    // Load table data if not provided
    useEffect(() => {
        if (!tableSchema && tableId) {
            loadTableData()
        }
    }, [tableId, tableSchema])

    // Convert schema columns to paginated response for ModelList
    useEffect(() => {
        if (schema?.columns) {
            const sortedColumns = [...schema.columns].sort((a, b) => a.position - b.position)
            setColumnsData({
                data: sortedColumns,
                current_page: 1,
                last_page: 1,
                per_page: sortedColumns.length,
                total: sortedColumns.length,
                from: 1,
                to: sortedColumns.length,
                links: [],
                prev_page_url: null,
                next_page_url: null,
                last_page_url: null
            })
        }
    }, [schema])

    const loadTableData = async () => {
        if (!tableId) return

        setIsLoading(true)
        setError(null)
        try {
            const response = await clientApiRequest(`/api/tables/${tableId}`)
            if (response.ok) {
                const result = await response.json() as any
                setSchema(result.table)
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


    // Column definitions for the ModelList
    const columnDefinitions: IColumnDefinition<ColumnModel>[] = [
        {
            key: 'order',
            label: 'Order',
            sortable: false,
            className: 'w-16 sm:w-20 md:w-24 text-center'
        },
        /*{
            key: 'position',
            label: 'Position',
            sortable: true,
            className: 'w-20 text-center',
            render: (column) => (
                <span className="text-sm font-mono px-2 py-1 rounded">
                    {column.position}
                </span>
            )
        },*/
        {
            key: 'name',
            label: 'Name',
            sortable: true,
            filterable: true,
            filterType: 'text',
            className: 'min-w-0 w-auto',
            render: (column) => {
                const isProtected = isProtectedSaleColumn(column.name, schema?.table.for_sale || false)
                return (
                    <div className="flex items-center gap-2">
                        <span className="truncate block max-w-[120px] sm:max-w-none" title={column.name}>
                            {column.name}
                        </span>
                        <ProtectedColumnBadge
                            columnName={column.name}
                            isProtected={isProtected}
                            protectionReason="for_sale"
                            variant="icon"
                        />
                    </div>
                )
            },
            editableInline: false,
            editType: 'text',
            editValidation: {
                required: true,
                minLength: 1,
                maxLength: 100
            }
        },
        {
            key: 'type',
            label: 'Type',
            sortable: true,
            filterable: true,
            filterType: 'select',
            className: 'w-20 sm:w-24',
            filterOptions: COLUMN_TYPE_OPTIONS.map(opt => ({value: opt.value, label: opt.label})),
            render: (column) => (
                <Badge color="primary" size="sm" className="text-xs">
                    {getColumnTypeLabel(column.type)}
                </Badge>
            ),
            editableInline: false,
            editType: 'select',
            editOptions: COLUMN_TYPE_OPTIONS.map(opt => ({value: opt.value, label: opt.label}))
        },
        {
            key: 'is_required',
            label: 'Req',
            sortable: true,
            filterable: true,
            filterType: 'select',
            className: 'w-16 sm:w-20 text-center',
            filterOptions: [
                {value: 'true', label: 'Required'},
                {value: 'false', label: 'Optional'}
            ],
            render: (column) => (
                <span className={`badge badge-xs sm:badge-sm ${column.is_required ? 'badge-warning' : 'badge-success'}`}>
          <span className="hidden sm:inline">{column.is_required ? 'Required' : 'Optional'}</span>
          <span className="sm:hidden">{column.is_required ? 'Req' : 'Opt'}</span>
        </span>
            ),
            editableInline: false,
            editType: 'toggle',
            editOptions: [
                {value: 'false', label: 'No'},
                {value: 'true', label: 'Yes'}
            ]
        },
        {
            key: 'default_value',
            label: 'Default',
            sortable: false,
            filterable: true,
            filterType: 'text',
            className: 'hidden md:table-cell w-24 lg:w-32',
            render: (column) => (
                <span className="text-xs text-gray-600 font-mono truncate block max-w-[100px]" title={column.default_value || 'none'}>
          {column.default_value || <em className="text-gray-400">none</em>}
        </span>
            ),
            editableInline: false,
            editType: 'text'
        },
        {
            key: 'created_at',
            label: 'Created',
            sortable: true,
            filterable: true,
            filterType: 'date',
            className: 'hidden lg:table-cell w-28',
            render: (column) => (
                <span className="text-xs text-gray-500">
          {formatApiDate(column.created_at)}
        </span>
            )
        }
    ]

    // Mass actions for columns
    const massActions: IMassAction[] = [
        {
            name: 'make_required',
            label: 'Make Required',
            confirmMessage: 'Are you sure you want to make the selected columns required?'
        },
        {
            name: 'make_optional',
            label: 'Make Optional',
            confirmMessage: 'Are you sure you want to make the selected columns optional?'
        },
        {
            name: 'delete',
            label: 'Delete Columns',
            confirmMessage: 'Are you sure you want to delete the selected columns? This action cannot be undone.'
        }
    ]

    // Generate unique clone name by finding next available number
    const generateCloneName = (baseName: string, existingColumns: ColumnModel[]): string => {
        const existingNames = existingColumns.map(col => col.name.toLowerCase())

        // If base name + " Copy" doesn't exist, use that
        const simpleCopyName = `${baseName} Copy`
        if (!existingNames.includes(simpleCopyName.toLowerCase())) {
            return simpleCopyName
        }

        // Otherwise, find the next available number
        let counter = 2
        let candidateName = `${baseName} Copy ${counter}`

        while (existingNames.includes(candidateName.toLowerCase())) {
            counter++
            candidateName = `${baseName} Copy ${counter}`
        }

        return candidateName
    }

    // Clone column functionality
    const cloneColumn = async (sourceColumn: ColumnModel) => {
        if (!tableId || !schema) return

        try {
            const uniqueName = generateCloneName(sourceColumn.name, schema.columns)

            const clonedColumnData = {
                name: uniqueName,
                type: sourceColumn.type,
                is_required: sourceColumn.is_required,
                default_value: sourceColumn.default_value,
                position: sourceColumn.position + 1 // Position after the source column
            }

            const response = await clientApiRequest(`/api/tables/${tableId}/columns`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(clonedColumnData)
            })

            if (response.ok) {
                // Reload table data to show the new column
                await loadTableData()
                console.log('✅ Column cloned successfully')
            } else {
                const errorData = await response.json() as any
                console.error('❌ Failed to clone column:', errorData)
                alert(`Failed to clone column: ${errorData.message || 'Unknown error'}`)
            }
        } catch (error) {
            console.error('❌ Error cloning column:', error)
            alert(`Error cloning column: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    // Generate unique new column name
    const generateNewColumnName = (existingColumns: ColumnModel[]): string => {
        const existingNames = existingColumns.map(col => col.name.toLowerCase())

        // Try "New Column" first
        if (!existingNames.includes('new column')) {
            return 'New Column'
        }

        // Otherwise, find the next available number
        let counter = 2
        let candidateName = `New Column ${counter}`

        while (existingNames.includes(candidateName.toLowerCase())) {
            counter++
            candidateName = `New Column ${counter}`
        }

        return candidateName
    }

    // Add column after functionality
    const addColumnAfter = async (sourceColumn: ColumnModel) => {
        if (!tableId || !schema) return

        try {
            const uniqueName = generateNewColumnName(schema.columns)

            const newColumnData = {
                name: uniqueName,
                type: 'text' as const,
                is_required: false,
                default_value: null,
                position: sourceColumn.position + 1 // Position after the source column
            }

            const response = await clientApiRequest(`/api/tables/${tableId}/columns`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(newColumnData)
            })

            if (response.ok) {
                // Reload table data to show the new column
                await loadTableData()
                console.log('✅ Column added successfully')
            } else {
                const errorData = await response.json() as any
                console.error('❌ Failed to add column:', errorData)
                alert(`Failed to add column: ${errorData.message || 'Unknown error'}`)
            }
        } catch (error) {
            console.error('❌ Error adding column:', error)
            alert(`Error adding column: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    // Row actions for individual columns
    const rowActions: IRowAction<ColumnModel>[] = [
        {
            icon: IconPlus,
            title: '+ After',
            color: 'accent',
            style: 'soft',
            onClick: addColumnAfter
        },
        {
            icon: IconCopy,
            title: 'Clone',
            color: 'info',
            style: 'soft',
            onClick: cloneColumn
        }
    ]

    if (isLoading) {
        return (
            <div className="container mx-auto p-4">
                <div className="flex justify-center items-center h-64">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto p-4">
                <Alert color="error">
                    {error}
                </Alert>
            </div>
        )
    }

    if (!schema) {
        return (
            <div className="container mx-auto p-4">
                <Alert color="error">
                    Failed to load table schema. Please try again.
                </Alert>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-2 sm:p-4">
            {/* Header */}
            <div className="mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-4">
                    <div className="min-w-0">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Table Columns</h1>
                        <p className="text-gray-600 mt-2 text-sm sm:text-base">
                            Column structure for <strong className="truncate">{schema.table.name}</strong>
                        </p>
                        {schema.table.description && (
                            <p className="text-gray-500 text-xs sm:text-sm mt-1 line-clamp-2">{schema.table.description}</p>
                        )}
                    </div>
                    <TableNavigation
                        tableId={tableId || ''}
                        activePage="columns"
                    />
                </div>
            </div>

            {/* ModelList for Column Management */}
            <ModelList<ColumnModel>
                title="Column Management"
                items={columnsData}
                columns={columnDefinitions}
                massActions={massActions}
                rowActions={rowActions}
                createRoute={undefined}
                editRoute={() => '#'}
                deleteRoute={(id) => `/api/tables/${tableId}/columns/${id}`}
                inlineEditRoute={undefined}
                massActionRoute={`/api/tables/${tableId}/columns/mass-action`}
                orderingConfig={{
                    enabled: true,
                    swapEndpoint: `/api/tables/${tableId}/columns/swap`,
                    positionField: 'position',
                    idField: 'id',
                    recountEndpoint: `/api/tables/${tableId}/columns/recount`,
                    recountDelay: 2000,
                    onReorder: async () => {
                        await loadTableData()
                    }
                }}
                filters={{
                    sort: 'position',
                    direction: 'asc'
                }}
            />
        </div>
    )
}
