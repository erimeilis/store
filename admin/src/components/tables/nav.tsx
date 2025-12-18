/**
 * Table Navigation Component
 * Provides consistent navigation across all table-related pages
 * Uses the unified PageActions component
 */

import React from 'react'
import { PageActions, type ActionConfig } from '@/components/page/action-buttons'
import {
    IconArrowLeft,
    IconEdit,
    IconColumns,
    IconDatabase,
    IconUpload
} from '@tabler/icons-react'

export type TableNavigationPage = 'list' | 'edit' | 'columns' | 'data' | 'import'

/**
 * Centralized page configuration for table-related pages
 * Single source of truth for titles, labels, routes, and icons
 */
export const TABLE_PAGE_CONFIG: Record<TableNavigationPage, {
    title: string
    shortLabel: string
    getHref: (tableId: string) => string
    icon: React.ComponentType<{ size?: number | string; className?: string }>
}> = {
    list: {
        title: 'Back to Tables',
        shortLabel: 'Tables',
        getHref: () => '/dashboard/tables',
        icon: IconArrowLeft
    },
    edit: {
        title: 'Settings',
        shortLabel: 'Settings',
        getHref: (tableId) => `/dashboard/tables/${tableId}/edit`,
        icon: IconEdit
    },
    columns: {
        title: 'Columns',
        shortLabel: 'Columns',
        getHref: (tableId) => `/dashboard/tables/${tableId}/columns`,
        icon: IconColumns
    },
    data: {
        title: 'Data',
        shortLabel: 'Data',
        getHref: (tableId) => `/dashboard/tables/${tableId}/data`,
        icon: IconDatabase
    },
    import: {
        title: 'Import',
        shortLabel: 'Import',
        getHref: (tableId) => `/dashboard/tables/${tableId}/import`,
        icon: IconUpload
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

export function TableNavigation({ tableId, activePage, className = '' }: TableNavigationProps) {
    const pageKeys: TableNavigationPage[] = ['list', 'edit', 'columns', 'data', 'import']

    const actions: ActionConfig[] = pageKeys.map((key) => {
        const config = TABLE_PAGE_CONFIG[key]
        return {
            key,
            label: config.title,
            shortLabel: config.shortLabel,
            icon: config.icon,
            href: config.getHref(tableId),
            isActive: key === activePage
        }
    })

    return <PageActions actions={actions} className={className} />
}
