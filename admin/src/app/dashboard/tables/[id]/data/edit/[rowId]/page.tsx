/**
 * Edit Row Page - Update existing data row in a dynamic table
 * Uses shared DataRowForm component for DRY principle
 */

'use client'

import React, { useEffect, useState } from 'react'
import { clientApiRequest } from '@/lib/client-api'
import { TableDataRow, TableSchema, UpdateTableDataRequest } from '@/types/dynamic-tables'
import { TablePageHeader } from '@/components/tables/page-header'
import { DataRowForm, ModuleColumnTypeOption } from '@/components/tables/data-row-form'
import { Alert } from '@/components/ui/alert'
import { IconEdit } from '@tabler/icons-react'

interface TableDataEditPageProps {
  // Props passed directly from handler (not in params)
  tableId: string
  rowId: string
  initialTableSchema?: TableSchema | null
  initialRowData?: TableDataRow | null
  moduleColumnTypeOptions?: Record<string, ModuleColumnTypeOption[]>
}

export default function TableDataEditPage({
  tableId,
  rowId,
  initialTableSchema = null,
  initialRowData = null,
  moduleColumnTypeOptions: prefetchedModuleOptions
}: TableDataEditPageProps) {

  const [isLoading, setIsLoading] = useState(!initialTableSchema || !initialRowData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string>()
  const [loadError, setLoadError] = useState<string>()

  const [tableSchema, setTableSchema] = useState<TableSchema | null>(initialTableSchema)
  const [rowData, setRowData] = useState<TableDataRow | null>(initialRowData)

  // Load table schema and row data if not provided
  useEffect(() => {
    if (!tableSchema || !rowData) {
      if (tableId && rowId) {
        loadData()
      }
    }
  }, [tableId, rowId, tableSchema, rowData])

  const loadData = async () => {
    setIsLoading(true)
    try {
      // Load table schema and row data in parallel
      const [schemaResponse, rowResponse] = await Promise.all([
        clientApiRequest(`/api/tables/${tableId}`),
        clientApiRequest(`/api/tables/${tableId}/data/${rowId}`)
      ])

      if (!schemaResponse.ok) {
        const errorData = await schemaResponse.json() as any
        setLoadError(errorData.message || 'Failed to load table schema')
        return
      }

      if (!rowResponse.ok) {
        const errorData = await rowResponse.json() as any
        setLoadError(errorData.message || 'Failed to load row data')
        return
      }

      const schemaResult = await schemaResponse.json() as any
      const rowResult = await rowResponse.json() as any

      setTableSchema(schemaResult.table)
      setRowData(rowResult.row)
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (data: Record<string, any>) => {
    if (!tableId || !rowId) return

    setIsSubmitting(true)
    setSubmitError(undefined)

    try {
      const requestData: UpdateTableDataRequest = { data }

      const response = await clientApiRequest(`/api/tables/${tableId}/data/${rowId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })

      if (response.ok) {
        window.location.href = `/dashboard/tables/${tableId}/data`
      } else {
        const errorData = await response.json() as any
        setSubmitError(errorData.message || 'Failed to update row')
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    window.location.href = `/dashboard/tables/${tableId}/data`
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    )
  }

  if (loadError || !tableSchema || !rowData) {
    return (
      <div className="space-y-6">
        <Alert color="error">
          {loadError || 'Failed to load table data. Please try again.'}
        </Alert>
      </div>
    )
  }

  const tableName = tableSchema.table?.name || ''

  return (
    <div className="space-y-6">
      <TablePageHeader
        subtitle={<>Update data for this row in <strong>{tableName}</strong></>}
        tableId={tableId}
        activePage="data"
        tableName={tableName}
        icon={IconEdit}
      />

      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <DataRowForm
            tableId={tableId}
            columns={tableSchema.columns}
            initialData={rowData.data || {}}
            moduleColumnTypeOptions={prefetchedModuleOptions}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            mode="edit"
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
        </div>
      </div>
    </div>
  )
}
