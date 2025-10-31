/**
 * Table Import Page
 * Allows importing data from txt, csv, xls files with preview and column mapping
 */

'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardBody, CardTitle } from '@/components/ui/card'
import { TableImportManager } from '@/components/table-import-manager'
import { TablePageHeader } from '@/components/table-page-header'
import { TableSchema } from '@/types/dynamic-tables'
import { clientApiRequest } from '@/lib/client-api'
import { Alert } from '@/components/ui/alert'

interface ImportPageProps {
    params: { id: string }
}

export default function ImportPage({ params }: ImportPageProps) {
    const [schema, setSchema] = useState<TableSchema | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadTableData()
    }, [params.id])

    const loadTableData = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await clientApiRequest(`/api/tables/${params.id}`)
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

    if (isLoading) {
        return (
            <div className="container mx-auto p-2 sm:p-4 max-w-7xl">
                <div className="flex justify-center items-center h-64">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            </div>
        )
    }

    if (error || !schema) {
        return (
            <div className="container mx-auto p-2 sm:p-4 max-w-7xl">
                <Alert color="error">
                    {error || 'Failed to load table data'}
                </Alert>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-2 sm:p-4 max-w-7xl">
            <TablePageHeader
                title="Import Data"
                subtitle={<>Upload and import data into <strong className="truncate">{schema.table.name}</strong></>}
                description={schema.table.description || undefined}
                tableId={params.id}
                activePage="import"
            />

            <Card>
                <CardBody>
                    <CardTitle>Import File Data</CardTitle>
                    <div className="text-sm text-base-content/70 mb-4">
                        Upload a file (txt, csv, xls, xlsx) to import data into your table.
                        You'll be able to preview the data and map columns before importing.
                    </div>
                    <TableImportManager tableId={params.id} />
                </CardBody>
            </Card>
        </div>
    )
}