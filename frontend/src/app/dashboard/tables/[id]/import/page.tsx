/**
 * Table Import Page
 * Allows importing data from txt, csv, xls files with preview and column mapping
 */

import React from 'react'
import { Card, CardBody, CardTitle } from '@/components/ui/card'
import { TableNavigation } from '@/components/table-navigation'
import { TableImportManager } from '@/components/table-import-manager'

interface ImportPageProps {
    params: { id: string }
}

export default function ImportPage({ params }: ImportPageProps) {
    const tableId = params.id

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Import Data</h1>
            </div>

            {/* Table Navigation */}
            <TableNavigation
                tableId={tableId}
                activePage="import"
                className="mb-4"
            />

            {/* Import Manager */}
            <Card>
                <CardBody>
                    <CardTitle>Import File Data</CardTitle>
                    <div className="text-sm text-base-content/70 mb-4">
                        Upload a file (txt, csv, xls, xlsx) to import data into your table.
                        You'll be able to preview the data and map columns before importing.
                    </div>
                    <TableImportManager tableId={tableId} />
                </CardBody>
            </Card>
        </div>
    )
}