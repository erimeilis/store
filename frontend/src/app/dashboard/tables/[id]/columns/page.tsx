/**
 * Table Columns Management Page
 * Manage column definitions using ModelList component
 */

'use client'

import React, {useEffect, useState} from 'react'
import {IColumnDefinition, IRowAction, ModelList} from '@/components/model/model-list'
import {Alert} from '@/components/ui/alert'
import {Badge} from '@/components/ui/badge'
import {BooleanCircle} from '@/components/ui/boolean-circle'
import {IconCopy, IconPlus, IconAlertTriangle, IconWand} from '@tabler/icons-react'
import {COLUMN_TYPE_OPTIONS, getColumnTypeLabel, isProtectedColumn, getProtectionReason, TableColumn, TableSchema, TableType} from '@/types/dynamic-tables'
import {IMassAction, IPaginatedResponse} from '@/types/models'
import {formatApiDate} from '@/lib/date-utils'
import {clientApiRequest} from '@/lib/client-api'
import {ProtectedColumnBadge} from '@/components/protected-column-indicator'
import {TablePageHeader} from '@/components/table-page-header'
import {toDisplayName, hasColumnNameIssues, getColumnNameIssues} from '@/utils/column-name-utils'

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

    // Column name issues state
    const [columnIssues, setColumnIssues] = useState<{
        hasIssues: boolean
        totalIssues: number
        affectedColumns: string[]
    } | null>(null)
    const [isFixingColumns, setIsFixingColumns] = useState(false)
    const [columnFixResult, setColumnFixResult] = useState<string | null>(null)

    // Load table data if not provided
    useEffect(() => {
        if (!tableSchema && tableId) {
            loadTableData()
        }
    }, [tableId, tableSchema])

    // Check for column name issues when schema changes
    useEffect(() => {
        if (schema?.columns) {
            checkColumnNameIssues(schema.columns)
        }
    }, [schema])

    // Check for column name issues (non-camelCase names, invalid characters)
    const checkColumnNameIssues = (columns: TableColumn[]) => {
        const affectedColumns: string[] = []

        for (const column of columns) {
            if (hasColumnNameIssues(column.name)) {
                affectedColumns.push(column.name)
            }
        }

        setColumnIssues({
            hasIssues: affectedColumns.length > 0,
            totalIssues: affectedColumns.length,
            affectedColumns
        })
    }

    // Fix all column names
    const handleFixColumnNames = async () => {
        if (!tableId) return

        setIsFixingColumns(true)
        setColumnFixResult(null)

        try {
            const response = await clientApiRequest(`/api/tables/${tableId}/columns/fix-names`, {
                method: 'POST'
            })

            if (response.ok) {
                const result = await response.json() as {
                    fixed: number
                    failed: number
                    message?: string
                }
                if (result.fixed !== undefined) {
                    setColumnFixResult(`Fixed ${result.fixed} column(s)${result.failed > 0 ? `, ${result.failed} failed` : ''}`)
                    // Reload data and recheck issues
                    await loadTableData()
                } else {
                    setColumnFixResult(`Error: ${result.message || 'Unknown error'}`)
                }
            } else {
                const errorData = await response.json() as { message?: string }
                setColumnFixResult(`Error: ${errorData.message || 'Failed to fix column names'}`)
            }
        } catch (err) {
            setColumnFixResult(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
        } finally {
            setIsFixingColumns(false)
        }
    }

    // Convert schema columns to paginated response for ModelList
    useEffect(() => {
        if (schema?.columns) {
            const sortedColumns = [...schema.columns].sort((a, b) => a.position - b.position)
            setColumnsData({
                data: sortedColumns,
                currentPage: 1,
                lastPage: 1,
                perPage: sortedColumns.length,
                total: sortedColumns.length,
                from: 1,
                to: sortedColumns.length,
                links: [],
                prevPageUrl: null,
                nextPageUrl: null,
                lastPageUrl: null
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

    // Optimized silent reload for inline edits (no loading indicator)
    const reloadTableDataSilently = async () => {
        if (!tableId) return

        try {
            const response = await clientApiRequest(`/api/tables/${tableId}`)
            if (response.ok) {
                const result = await response.json() as any
                setSchema(result.table)
            }
        } catch (error) {
            console.error('Silent reload failed:', error)
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
            sortable: false,
            filterable: false,
            filterType: 'text',
            className: 'min-w-0 w-auto',
            render: (column) => {
                const tableType = (schema?.table.tableType || 'default') as TableType
                const forSale = schema?.table.forSale || false
                const isProtected = isProtectedColumn(column.name, tableType, forSale)
                const protectionReason = (tableType === 'sale' || (tableType === 'default' && forSale)) ? 'forSale' : tableType === 'rent' ? 'forRent' : 'system'
                const hasIssues = hasColumnNameIssues(column.name)
                const issues = hasIssues ? getColumnNameIssues(column.name) : []
                const displayName = toDisplayName(column.name)

                return (
                    <div className="flex items-center gap-2">
                        <span className="truncate block max-w-[120px] sm:max-w-none" title={`${displayName} (internal: ${column.name})`}>
                            {displayName}
                        </span>
                        <ProtectedColumnBadge
                            columnName={column.name}
                            isProtected={isProtected}
                            protectionReason={protectionReason}
                            context="name"
                            variant="icon"
                        />
                        {hasIssues && (
                            <span
                                className="tooltip tooltip-warning"
                                data-tip={`Issues: ${issues.join(', ')}`}
                            >
                                <IconAlertTriangle className="h-4 w-4 text-warning" />
                            </span>
                        )}
                    </div>
                )
            },
            editableInline: true,
            isEditableInline: (column) => !isProtectedColumn(column.name, (schema?.table.tableType || 'default') as TableType, schema?.table.forSale || false),
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
            sortable: false,
            filterable: false,
            filterType: 'select',
            className: 'w-20 sm:w-24',
            filterOptions: COLUMN_TYPE_OPTIONS.map(opt => ({value: opt.value, label: opt.label})),
            render: (column) => (
                <Badge color="primary" size="sm" className="text-xs whitespace-nowrap">
                    {getColumnTypeLabel(column.type)}
                </Badge>
            ),
            editableInline: true,
            editType: 'select',
            editOptions: COLUMN_TYPE_OPTIONS.map(opt => ({value: opt.value, label: opt.label}))
        },
        {
            key: 'isRequired',
            label: 'Req',
            sortable: false,
            filterable: false,
            filterType: 'select',
            className: 'w-16 sm:w-20 text-center',
            filterOptions: [
                {value: 'true', label: 'Required'},
                {value: 'false', label: 'Optional'}
            ],
            render: (column) => {
                const tableType = (schema?.table.tableType || 'default') as TableType
                const forSale = schema?.table.forSale || false
                const isProtected = isProtectedColumn(column.name, tableType, forSale)
                const protectionReason = (tableType === 'sale' || (tableType === 'default' && forSale)) ? 'forSale' : tableType === 'rent' ? 'forRent' : 'system'
                return (
                    <div className="flex justify-center items-center gap-1">
                        {column.isRequired ? (
                            <BooleanCircle
                                value={true}
                                size="md"
                                title={isProtected ? "Required (protected)" : "Required"}
                            />
                        ) : (
                            <span className="text-gray-400">-</span>
                        )}
                        <ProtectedColumnBadge columnName={column.name} isProtected={isProtected} protectionReason={protectionReason} context="other" variant="icon" />
                    </div>
                )
            },
            editableInline: true,
            isEditableInline: (column) => !isProtectedColumn(column.name, (schema?.table.tableType || 'default') as TableType, schema?.table.forSale || false),
            editType: 'toggle',
            editOptions: [
                {value: 'false', label: 'No'},
                {value: 'true', label: 'Yes'}
            ]
        },
        {
            key: 'allowDuplicates',
            label: 'Dupes',
            sortable: false,
            filterable: false,
            filterType: 'select',
            className: 'w-16 sm:w-20 text-center',
            filterOptions: [
                {value: 'true', label: 'Allow'},
                {value: 'false', label: 'Block'}
            ],
            render: (column) => {
                const tableType = (schema?.table.tableType || 'default') as TableType
                const forSale = schema?.table.forSale || false
                const isProtected = isProtectedColumn(column.name, tableType, forSale)
                const protectionReason = (tableType === 'sale' || (tableType === 'default' && forSale)) ? 'forSale' : tableType === 'rent' ? 'forRent' : 'system'
                return (
                    <div className="flex justify-center items-center gap-1">
                        {column.allowDuplicates ? (
                            <BooleanCircle
                                value={true}
                                size="md"
                                title={isProtected ? "Allow duplicates (protected)" : "Allow duplicates"}
                            />
                        ) : (
                            <span className="text-gray-400">-</span>
                        )}
                        <ProtectedColumnBadge columnName={column.name} isProtected={isProtected} protectionReason={protectionReason} context="other" variant="icon" />
                    </div>
                )
            },
            editableInline: true,
            isEditableInline: (column) => !isProtectedColumn(column.name, (schema?.table.tableType || 'default') as TableType, schema?.table.forSale || false),
            editType: 'toggle',
            editOptions: [
                {value: 'false', label: 'No'},
                {value: 'true', label: 'Yes'}
            ]
        },
        {
            key: 'defaultValue',
            label: 'Default',
            sortable: false,
            filterable: false,
            filterType: 'text',
            className: 'w-24 lg:w-32',
            render: (column) => (
                <span className="text-xs text-gray-600 font-mono truncate block max-w-[100px]" title={column.defaultValue || 'none'}>
          {column.defaultValue || <em className="text-gray-400">none</em>}
        </span>
            ),
            editableInline: true,
            editType: 'text'
        },
        {
            key: 'created_at',
            label: 'Created',
            sortable: false,
            filterable: false,
            filterType: 'date',
            className: 'w-28',
            render: (column) => (
                <span className="text-xs text-gray-500">
          {formatApiDate(column.createdAt)}
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
                isRequired: sourceColumn.isRequired,
                allowDuplicates: sourceColumn.allowDuplicates,
                defaultValue: sourceColumn.defaultValue,
                position: sourceColumn.position + 1 // Position after the source column
            }

            const response = await clientApiRequest(`/api/tables/${tableId}/columns`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(clonedColumnData)
            })

            if (response.ok) {
                // Reload table data to show the new column
                await reloadTableDataSilently()
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
                isRequired: false,
                allowDuplicates: true,
                defaultValue: null,
                position: sourceColumn.position + 1 // Position after the source column
            }

            const response = await clientApiRequest(`/api/tables/${tableId}/columns`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(newColumnData)
            })

            if (response.ok) {
                // Reload table data to show the new column
                await reloadTableDataSilently()
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
            <div className="container mx-auto sm:p-4">
                <div className="flex justify-center items-center h-64">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto sm:p-4">
                <Alert color="error">
                    {error}
                </Alert>
            </div>
        )
    }

    if (!schema) {
        return (
            <div className="container mx-auto sm:p-4">
                <Alert color="error">
                    Failed to load table schema. Please try again.
                </Alert>
            </div>
        )
    }

    return (
        <div className="container mx-auto sm:p-4">
            <TablePageHeader
                subtitle={<>Column structure for <strong className="truncate">{schema.table.name}</strong></>}
                description={schema.table.description || undefined}
                tableId={tableId || ''}
                activePage="columns"
                tableName={schema.table.name}
            />

            {/* Column Name Issues Banner */}
            {columnIssues?.hasIssues && (
                <div className="alert alert-warning mb-4 shadow-lg">
                    <IconAlertTriangle className="h-5 w-5" />
                    <div className="flex-1">
                        <h3 className="font-bold">Column Names Need Fixing</h3>
                        <p className="text-sm">
                            Found {columnIssues.totalIssues} column(s) with naming issues
                            (non-Latin characters, numbers, or incorrect format).
                            Column names should only contain letters and spaces.
                        </p>
                        {columnFixResult && (
                            <p className={`text-sm mt-1 ${columnFixResult.startsWith('Error') ? 'text-error' : 'text-success'}`}>
                                {columnFixResult}
                            </p>
                        )}
                    </div>
                    <button
                        className="btn btn-sm btn-warning gap-1"
                        onClick={handleFixColumnNames}
                        disabled={isFixingColumns}
                    >
                        {isFixingColumns ? (
                            <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                            <IconWand className="h-4 w-4" />
                        )}
                        {isFixingColumns ? 'Fixing...' : 'Fix All'}
                    </button>
                </div>
            )}

            <ModelList<ColumnModel>
                title="Column Management"
                items={columnsData}
                columns={columnDefinitions}
                massActions={massActions}
                rowActions={rowActions}
                createRoute={undefined}
                editRoute={() => '#'}
                deleteRoute={(id) => `/api/tables/${tableId}/columns/${id}`}
                inlineEditRoute={(id) => `/api/tables/${tableId}/columns/${id}`}
                massActionRoute={`/api/tables/${tableId}/columns/mass-action`}
                onEditSuccess={reloadTableDataSilently}
                orderingConfig={{
                    enabled: true,
                    swapEndpoint: `/api/tables/${tableId}/columns/swap`,
                    positionField: 'position',
                    idField: 'id',
                    recountEndpoint: `/api/tables/${tableId}/columns/recount`,
                    recountDelay: 2000,
                    onReorder: reloadTableDataSilently
                }}
                filters={{
                    sort: 'position',
                    direction: 'asc'
                }}
                dataEndpoint={`/api/tables/${tableId}/columns`}
                compactPagination={true}
            />
        </div>
    )
}
