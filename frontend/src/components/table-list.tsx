/**
 * Unified Table List Component
 * Reusable component for displaying user tables with configurable options
 */

'use client'

import React, { useState } from 'react'
import { IColumnDefinition, IRowAction, ModelList } from '@/components/model/model-list'
import { IPaginatedResponse } from '@/types/models'
import { UserTable } from '@/types/dynamic-tables'
import { formatApiDate } from '@/lib/date-utils'
import { IconColumns3, IconCopy, IconDatabase, IconShoppingCart } from '@tabler/icons-react'
import { TableCloneModal } from '@/components/table-clone-modal'

export interface TableListProps {
  title: string
  items: IPaginatedResponse<UserTable> | null
  filters?: { sort?: string, direction?: 'asc' | 'desc', [key: string]: any }
  user?: { id: string; email: string; name: string }

  // Configuration options
  showForSaleFilter?: boolean  // Filter to only "for sale" tables
  enableMassActions?: boolean  // Enable mass action functionality
  enableCloning?: boolean      // Show clone buttons
  createRoute?: string | null  // Route for "Create New" button
  showTypeColumn?: boolean     // Show the Type column with shopping cart icons
}

export function TableList({
  title,
  items,
  filters = {},
  user,
  showForSaleFilter = false,
  enableMassActions = true,
  enableCloning = true,
  createRoute = '/dashboard/tables/create',
  showTypeColumn = true
}: TableListProps) {
  const [cloneModalOpen, setCloneModalOpen] = useState(false)
  const [selectedTable, setSelectedTable] = useState<UserTable | null>(null)

  // Base column definitions
  const baseColumns: IColumnDefinition<UserTable>[] = [
    {
      key: 'name',
      label: 'Table Name',
      sortable: true,
      filterable: true,
      filterType: 'text',
      editableInline: true,
      editType: 'text',
      editValidation: { required: true, minLength: 1, maxLength: 100 },
      render: (table) => (
        <span className="font-medium">{table.name}</span>
      )
    },
    {
      key: 'description',
      label: 'Description',
      sortable: true,
      filterable: true,
      filterType: 'text',
      editableInline: true,
      editType: 'text',
      editValidation: { maxLength: 500 },
      render: (table) => table.description || (
        <span className="text-gray-500 italic">No description</span>
      )
    },
    {
      key: 'createdBy',
      label: 'Owner',
      sortable: true,
      filterable: true,
      filterType: 'text',
      render: (table) => (
        <span className="text-sm">
          {table.ownerDisplayName || table.createdBy}
        </span>
      )
    },
    {
      key: 'visibility',
      label: 'Visibility',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { value: 'private', label: 'Private' },
        { value: 'public', label: 'Public' },
        { value: 'shared', label: 'Shared' }
      ],
      editableInline: true,
      editType: 'select',
      editOptions: [
        { value: 'private', label: 'Private' },
        { value: 'public', label: 'Public' },
        { value: 'shared', label: 'Shared' }
      ],
      render: (table) => {
        const badgeClass = table.visibility === 'public'
          ? 'badge-success'
          : table.visibility === 'shared'
            ? 'badge-info'
            : 'badge-warning'

        const label = table.visibility === 'public' ? 'Public' :
          table.visibility === 'shared' ? 'Shared' : 'Private'

        return (
          <span className={`badge ${badgeClass}`}>
            {label}
          </span>
        )
      }
    }
  ]

  // Add Type column if enabled
  if (showTypeColumn) {
    baseColumns.push({
      key: 'forSale',
      label: 'Type',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { value: 'true', label: 'For Sale' },
        { value: 'false', label: 'Regular' }
      ],
      editableInline: true,
      editType: 'toggle',
      render: (table) => (
        <div className="flex items-center justify-center">
          {table.forSale ? (
            <IconShoppingCart className="h-5 w-5 text-success" title="For Sale" />
          ) : (
            <div className="h-5 w-5" title="Regular"></div>
          )}
        </div>
      )
    })
  }

  // Add timestamp columns
  baseColumns.push(
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      filterable: true,
      filterType: 'date',
      render: (table) => formatApiDate(table.createdAt)
    },
    {
      key: 'updatedAt',
      label: 'Updated',
      sortable: true,
      filterable: true,
      filterType: 'date',
      render: (table) => formatApiDate(table.updatedAt)
    }
  )

  // Row actions with conditional cloning
  const getRowActions = (): IRowAction<UserTable>[] => {
    const actions: IRowAction<UserTable>[] = [
      {
        icon: IconDatabase,
        title: 'View Data',
        color: 'success',
        style: 'soft',
        onClick: (table) => window.location.href = `/dashboard/tables/${table.id}/data`
      },
      {
        icon: IconColumns3,
        title: 'Manage Columns',
        color: 'warning',
        style: 'soft',
        onClick: (table) => window.location.href = `/dashboard/tables/${table.id}/columns`
      }
    ]

    // Add clone action if enabled
    if (enableCloning) {
      actions.push({
        icon: IconCopy,
        title: 'Clone Table',
        color: 'info',
        style: 'soft',
        onClick: (table) => {
          setSelectedTable(table)
          setCloneModalOpen(true)
          // Manually add the modal-open class for DaisyUI
          setTimeout(() => {
            const modal = document.getElementById('table-clone-modal')
            if (modal) {
              modal.classList.add('modal-open')
            }
          }, 0)
        }
      })
    }

    return actions
  }

  // Mass actions (only if enabled)
  const massActions = enableMassActions ? [
    {
      name: 'make_public',
      label: 'Make Public',
      confirmMessage: 'Are you sure you want to make the selected tables public? This will allow everyone to view them.'
    },
    {
      name: 'make_shared',
      label: 'Make Shared',
      confirmMessage: 'Are you sure you want to make the selected tables shared? This will allow all authenticated users to view and edit them.'
    },
    {
      name: 'make_private',
      label: 'Make Private',
      confirmMessage: 'Are you sure you want to make the selected tables private? Only you will be able to access them.'
    },
    {
      name: 'delete',
      label: 'Delete Tables',
      confirmMessage: 'Are you sure you want to delete the selected tables? This will permanently delete all table data and cannot be undone.'
    }
  ] : undefined

  // Apply forSale filter if needed
  const effectiveFilters = showForSaleFilter
    ? { ...filters, forSale: 'true' }
    : filters

  const handleCloneSuccess = () => {
    // Refresh the page to show the new table
    window.location.reload()
  }

  const handleCloseModal = () => {
    // Remove DaisyUI modal-open class
    const modal = document.getElementById('table-clone-modal')
    if (modal) {
      modal.classList.remove('modal-open')
    }
    setCloneModalOpen(false)
    setSelectedTable(null)
  }

  // Build base props
  const baseProps = {
    title,
    items,
    filters: effectiveFilters,
    columns: baseColumns,
    createRoute,
    editRoute: (id: string | number) => `/dashboard/tables/${id}/edit`,
    deleteRoute: (id: string | number) => `/api/tables/${id}`,
    inlineEditRoute: (id: string | number) => `/api/tables/${id}`,
    rowActions: getRowActions()
  }

  return (
    <>
      {enableMassActions ? (
        <ModelList<UserTable>
          {...baseProps}
          massActionRoute="/api/tables/mass-action"
          massActions={massActions}
        />
      ) : (
        <ModelList<UserTable>
          {...baseProps}
          massActionRoute=""
        />
      )}

      {/* Clone Modal (only if cloning is enabled) */}
      {enableCloning && (
        <TableCloneModal
          modalId="table-clone-modal"
          sourceTable={selectedTable}
          user={user}
          onClose={handleCloseModal}
          onSuccess={handleCloneSuccess}
        />
      )}
    </>
  )
}