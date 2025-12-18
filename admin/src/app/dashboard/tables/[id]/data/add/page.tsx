/**
 * Add Row Page - Create new data row in a dynamic table
 * Uses shared DataRowForm component for DRY principle
 */

'use client'

import React, { useEffect, useState } from 'react'
import { clientApiRequest } from '@/lib/client-api'
import { TableColumn } from '@/types/dynamic-tables'
import { TablePageHeader } from '@/components/tables/page-header'
import { DataRowForm, ModuleColumnTypeOption } from '@/components/tables/data-row-form'
import { IconPlus } from '@tabler/icons-react'

interface AddRowPageProps {
  // Props passed directly from handler
  tableId: string
  columns?: TableColumn[]
  tableSchema?: { name?: string }
  moduleColumnTypeOptions?: Record<string, ModuleColumnTypeOption[]>
}

export default function AddRowPage({
  tableId,
  columns: prefetchedColumns,
  tableSchema: prefetchedTableSchema,
  moduleColumnTypeOptions: prefetchedModuleOptions
}: AddRowPageProps) {
  const [columns, setColumns] = useState<TableColumn[]>(prefetchedColumns || [])
  const [tableName, setTableName] = useState<string>(prefetchedTableSchema?.name || '')
  const [isLoading, setIsLoading] = useState(!prefetchedColumns)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string>()

  // Only fetch schema if not prefetched
  useEffect(() => {
    if (tableId && !prefetchedColumns) {
      loadTableSchema()
    }
  }, [tableId, prefetchedColumns])

  const loadTableSchema = async () => {
    if (!tableId) return

    setIsLoading(true)
    try {
      const response = await clientApiRequest(`/api/tables/${tableId}/columns`)
      if (response.ok) {
        const result = await response.json() as { data?: TableColumn[] } | TableColumn[]
        const columnsData = (result as { data?: TableColumn[] }).data || result as TableColumn[]
        setColumns(columnsData)
      }

      // Get table info for the header
      const tableResponse = await clientApiRequest(`/api/tables/${tableId}`)
      if (tableResponse.ok) {
        const tableResult = await tableResponse.json() as { data?: { name?: string }; name?: string }
        setTableName(tableResult.data?.name || tableResult.name || '')
      }
    } catch (error) {
      console.error('Failed to load table schema:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (data: Record<string, any>) => {
    setIsSubmitting(true)
    setSubmitError(undefined)

    try {
      const response = await clientApiRequest(`/api/tables/${tableId}/data`, {
        method: 'POST',
        body: JSON.stringify({ data })
      })

      if (response.ok) {
        window.location.href = `/dashboard/tables/${tableId}/data`
      } else {
        const errorResult = await response.json() as { message?: string }
        setSubmitError(errorResult.message || 'Failed to create row')
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to create row')
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

  return (
    <div className="space-y-6">
      <TablePageHeader
        subtitle={<>Add new row to <strong>{tableName}</strong></>}
        tableId={tableId || ''}
        activePage="data"
        tableName={tableName}
        icon={IconPlus}
      />

      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <DataRowForm
            tableId={tableId}
            columns={columns}
            moduleColumnTypeOptions={prefetchedModuleOptions}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            mode="add"
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
        </div>
      </div>
    </div>
  )
}
