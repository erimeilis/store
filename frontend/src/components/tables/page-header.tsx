/**
 * Table Page Header Component
 * Specialized header for table detail pages (data, columns, edit, import)
 * Built on top of the unified PageHeader component
 */

'use client'

import React from 'react'
import { PageHeader } from '@/components/page/page-header'
import { TableNavigation, getTablePageTitle } from '@/components/tables/nav'
import {
    IconTable,
    IconColumns,
    IconDatabase,
    IconUpload,
    IconEdit
} from '@tabler/icons-react'

// Icon mapping for each page type
const PAGE_ICONS = {
    edit: IconEdit,
    columns: IconColumns,
    data: IconDatabase,
    import: IconUpload
} as const

interface TablePageHeaderProps {
    subtitle: string | React.ReactNode
    description?: string
    tableId: string
    activePage: 'edit' | 'columns' | 'data' | 'import'
    tableName?: string
    /** Optional custom icon override */
    icon?: React.ComponentType<{ className?: string; size?: number }>
}

export function TablePageHeader({
    subtitle,
    description,
    tableId,
    activePage,
    tableName,
    icon
}: TablePageHeaderProps) {
    const title = getTablePageTitle(activePage)
    // Use provided icon or auto-select based on page type
    const PageIcon = icon || PAGE_ICONS[activePage] || IconTable

    // Build breadcrumbs for table pages - consistent with all other pages
    const breadcrumbs = [
        {
            label: 'Dashboard',
            href: '/dashboard'
        },
        {
            label: 'Tables',
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
    ]

    return (
        <PageHeader
            breadcrumbs={breadcrumbs}
            icon={PageIcon}
            title={title}
            subtitle={subtitle}
            description={description}
            actions={
                <TableNavigation
                    tableId={tableId}
                    activePage={activePage}
                />
            }
        />
    )
}
