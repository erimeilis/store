/**
 * Table Navigation Component
 * Provides consistent navigation across all table-related pages
 */

import React from 'react'
import {Button} from '@/components/ui/button'

export type TableNavigationPage = 'list' | 'edit' | 'columns' | 'data' | 'import'

interface TableNavigationProps {
    tableId: string
    activePage: TableNavigationPage
    className?: string
}

export function TableNavigation({tableId, activePage, className = ''}: TableNavigationProps) {
    const buttons = [
        {
            key: 'list',
            label: 'Back to Tables',
            shortLabel: '← Tables',
            href: '/dashboard/tables'
        },
        {
            key: 'edit',
            label: 'Edit Table Info',
            shortLabel: 'Edit Info',
            href: `/dashboard/tables/${tableId}/edit`
        },
        {
            key: 'columns',
            label: 'Edit Columns',
            shortLabel: 'Columns',
            href: `/dashboard/tables/${tableId}/columns`
        },
        {
            key: 'data',
            label: 'Edit Data',
            shortLabel: 'Data',
            href: `/dashboard/tables/${tableId}/data`
        },
        {
            key: 'import',
            label: 'Import Data',
            shortLabel: 'Import',
            href: `/dashboard/tables/${tableId}/import`
        }
    ]

    return (
        <div className={`flex flex-col sm:flex-row gap-2 shrink-0 ${className}`}>
            {buttons.map((button) => {
                const isActive = button.key === activePage

                return (
                    <Button
                        key={button.key}
                        type="button"
                        size="sm"
                        color={isActive ? 'primary' : 'neutral'}
                        style={isActive ? 'soft' : 'ghost'}
                        onClick={() => window.location.href = button.href}
                        className={isActive ? 'font-semibold' : ''}
                    >
                        <span className="hidden sm:inline">{button.label}</span>
                        <span className="sm:hidden">{button.shortLabel}</span>
                    </Button>
                )
            })}
        </div>
    )
}
