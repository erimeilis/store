/**
 * Table Navigation Component
 * Provides consistent navigation across all table-related pages
 */

import React from 'react'
import {Button} from '@/components/ui/button'

export type TableNavigationPage = 'list' | 'edit' | 'columns' | 'data' | 'import'

/**
 * Centralized page configuration for table-related pages
 * Single source of truth for titles, labels, and routes
 */
export const TABLE_PAGE_CONFIG: Record<TableNavigationPage, {
    title: string
    shortLabel: string
    getHref: (tableId: string) => string
}> = {
    list: {
        title: 'Back to Tables',
        shortLabel: '← Tables',
        getHref: () => '/dashboard/tables'
    },
    edit: {
        title: 'Edit Table Info',
        shortLabel: 'Edit Info',
        getHref: (tableId) => `/dashboard/tables/${tableId}/edit`
    },
    columns: {
        title: 'Edit Columns',
        shortLabel: 'Columns',
        getHref: (tableId) => `/dashboard/tables/${tableId}/columns`
    },
    data: {
        title: 'Edit Data',
        shortLabel: 'Data',
        getHref: (tableId) => `/dashboard/tables/${tableId}/data`
    },
    import: {
        title: 'Import Data',
        shortLabel: 'Import',
        getHref: (tableId) => `/dashboard/tables/${tableId}/import`
    }
}

/**
 * Get page title by page key
 */
export function getTablePageTitle(page: TableNavigationPage): string {
    return TABLE_PAGE_CONFIG[page].title
}

interface TableNavigationProps {
    tableId: string
    activePage: TableNavigationPage
    className?: string
}

export function TableNavigation({tableId, activePage, className = ''}: TableNavigationProps) {
    const pageKeys: TableNavigationPage[] = ['list', 'edit', 'columns', 'data', 'import']

    return (
        <div className={`flex flex-col sm:flex-row gap-2 shrink-0 ${className}`}>
            {pageKeys.map((key) => {
                const config = TABLE_PAGE_CONFIG[key]
                const isActive = key === activePage

                return (
                    <Button
                        key={key}
                        type="button"
                        size="sm"
                        color={isActive ? 'primary' : 'info'}
                        style={isActive ? 'soft' : 'ghost'}
                        onClick={() => window.location.href = config.getHref(tableId)}
                        className={isActive ? 'font-semibold' : ''}
                    >
                        <span className="hidden sm:inline">{config.title}</span>
                        <span className="sm:hidden">{config.shortLabel}</span>
                    </Button>
                )
            })}
        </div>
    )
}
