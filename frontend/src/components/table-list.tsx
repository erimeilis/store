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
import { IconColumns3, IconCopy, IconDatabase, IconShoppingCart, IconWand } from '@tabler/icons-react'
import { TableCloneModal } from '@/components/table-clone-modal'
import { generateDummyTables } from '@/handlers/admin'
import { toast } from '@/components/ui/toast'
import { BooleanCircle } from '@/components/ui/boolean-circle'

export interface TableListProps {
  title: string
  items: IPaginatedResponse<UserTable> | null
  filters?: { sort?: string, direction?: 'asc' | 'desc', [key: string]: any }
  user?: { id: string; email: string; name: string; role?: string }

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
  const [_cloneModalOpen, setCloneModalOpen] = useState(false)
  const [selectedTable, setSelectedTable] = useState<UserTable | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showForSaleConfirmModal, setShowForSaleConfirmModal] = useState(false)
  const [isGeneratingForSale, setIsGeneratingForSale] = useState(false)

  // Check if user is admin
  const isAdmin = user?.role === 'admin'

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
      key: 'rowCount',
      label: 'Rows',
      sortable: false,
      filterable: false,
      render: (table) => (
        <div className="flex items-center justify-center">
          <span className="badge badge-neutral">
            {table.rowCount ?? 0}
          </span>
        </div>
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
      editOptions: [
        { value: 'false', label: 'No' },
        { value: 'true', label: 'Yes' }
      ],
      render: (table) => (
        <div className="flex justify-center">
          <BooleanCircle
            value={table.forSale}
            size="md"
            title={table.forSale ? 'For Sale' : 'Regular'}
          />
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

  const handleGenerateDummyTables = async () => {
    if (!user?.id) {
      toast.error('User ID is required to generate tables')
      return
    }

    setIsGenerating(true)
    setShowConfirmModal(false)

    try {
      const result = await generateDummyTables(user.id, 100, 200, false)

      if (result.success) {
        toast.success(`Success! Generated ${result.tablesCreated} tables with ${result.rowsCreated} total rows.`, {
          duration: 5000
        })
        window.location.reload()
      } else {
        toast.error(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error generating dummy tables:', error)
      toast.error('Failed to generate dummy tables. Check console for details.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateForSaleTables = async () => {
    if (!user?.id) {
      toast.error('User ID is required to generate tables')
      return
    }

    setIsGeneratingForSale(true)
    setShowForSaleConfirmModal(false)

    try {
      const result = await generateDummyTables(user.id, 20, 50, true)

      if (result.success) {
        toast.success(`Success! Generated ${result.tablesCreated} FOR SALE tables with ${result.rowsCreated} total rows.`, {
          duration: 5000
        })
        window.location.reload()
      } else {
        toast.error(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error generating for-sale tables:', error)
      toast.error('Failed to generate for-sale tables. Check console for details.')
    } finally {
      setIsGeneratingForSale(false)
    }
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
    dataEndpoint: '/api/tables',
    rowActions: getRowActions(),
    compactPagination: true
  }

  return (
    <>
      {/* Admin Controls Section */}
      {isAdmin && (
        <div className="mb-4 p-4 bg-warning/10 border border-warning rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconWand className="h-5 w-5 text-warning" />
              <div>
                <h3 className="font-semibold text-warning">Admin Tools</h3>
                <p className="text-sm text-gray-600">Generate test data for development and testing</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowForSaleConfirmModal(true)}
                disabled={isGeneratingForSale || isGenerating}
                className="btn btn-success btn-sm"
              >
                {isGeneratingForSale ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    Generating...
                  </>
                ) : (
                  <>
                    <IconShoppingCart className="h-4 w-4" />
                    Generate 20 For Sale Tables
                  </>
                )}
              </button>
              <button
                onClick={() => setShowConfirmModal(true)}
                disabled={isGenerating || isGeneratingForSale}
                className="btn btn-warning btn-sm"
              >
                {isGenerating ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    Generating...
                  </>
                ) : (
                  <>
                    <IconWand className="h-4 w-4" />
                    Generate 100 Test Tables
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Confirmation Modal for Dummy Table Generation */}
      {showConfirmModal && (
        <dialog id="confirm-dummy-modal" className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirm Test Data Generation</h3>
            <p className="py-4">
              This will generate <strong>100 dummy tables</strong> with <strong>200 test records</strong> each.
              This is a <strong>large operation</strong> and may take some time.
            </p>
            <p className="text-warning text-sm">
              ⚠️ This action will create a total of <strong>20,000 test records</strong> in your database.
            </p>
            <div className="modal-action">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="btn btn-ghost"
                disabled={isGenerating}
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateDummyTables}
                className="btn btn-warning"
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Yes, Generate Test Data'}
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowConfirmModal(false)}>close</button>
          </form>
        </dialog>
      )}

      {/* Confirmation Modal for For-Sale Tables Generation */}
      {showForSaleConfirmModal && (
        <dialog id="confirm-forsale-modal" className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <IconShoppingCart className="h-6 w-6 text-success" />
              Confirm For-Sale Tables Generation
            </h3>
            <p className="py-4">
              This will generate <strong>20 tables marked "For Sale"</strong> with <strong>50 test records</strong> each.
            </p>
            <p className="text-success text-sm">
              ✓ This action will create a total of <strong>1,000 test records</strong> in your database.
            </p>
            <p className="text-info text-sm mt-2">
              💡 All generated tables will be marked with the shopping cart icon and available in the Store.
            </p>
            <div className="modal-action">
              <button
                onClick={() => setShowForSaleConfirmModal(false)}
                className="btn btn-ghost"
                disabled={isGeneratingForSale}
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateForSaleTables}
                className="btn btn-success"
                disabled={isGeneratingForSale}
              >
                {isGeneratingForSale ? 'Generating...' : 'Yes, Generate For-Sale Tables'}
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowForSaleConfirmModal(false)}>close</button>
          </form>
        </dialog>
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