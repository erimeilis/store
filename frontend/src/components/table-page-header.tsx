/**
 * Shared Table Page Header Component
 * Provides consistent header across all table detail pages
 */

'use client'

import React from 'react'
import { TableNavigation, getTablePageTitle } from '@/components/table-navigation'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'

interface TablePageHeaderProps {
    subtitle: string | React.ReactNode
    description?: string
    tableId: string
    activePage: 'edit' | 'columns' | 'data' | 'import'
    tableName?: string
}

export function TablePageHeader({
    subtitle,
    description,
    tableId,
    activePage,
    tableName
}: TablePageHeaderProps) {
    const title = getTablePageTitle(activePage)

    return (
        <div className="mb-4 sm:mb-6">
            {/* Breadcrumbs */}
            <Breadcrumbs
                className="mb-2"
                items={[
                    {
                        label: 'Dynamic Tables',
                        href: '/dashboard/tables'
                    },
                    ...(tableName ? [{
                        label: tableName,
                        href: `/dashboard/tables/${tableId}/data`
                    }] : []),
                    {
                        label: title,
                        current: true
                    }
                ]}
            />

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-4">
                <div className="min-w-0 flex-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-base-content">
                        {title}
                    </h1>
                    <p className="text-base-content/70 mt-2 text-sm sm:text-base">
                        {subtitle}
                    </p>
                    {description && (
                        <p className="text-gray-500 text-xs sm:text-sm mt-1 line-clamp-2">
                            {description}
                        </p>
                    )}
                </div>
                <TableNavigation
                    tableId={tableId}
                    activePage={activePage}
                />
            </div>
        </div>
    )
}
