/**
 * Shared Table Page Header Component
 * Provides consistent header across all table detail pages
 */

'use client'

import React from 'react'
import { TableNavigation } from '@/components/table-navigation'

interface TablePageHeaderProps {
    title: string
    subtitle: string | React.ReactNode
    description?: string
    tableId: string
    activePage: 'edit' | 'columns' | 'data' | 'import'
}

export function TablePageHeader({
    title,
    subtitle,
    description,
    tableId,
    activePage
}: TablePageHeaderProps) {
    return (
        <div className="mb-4 sm:mb-6">
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
