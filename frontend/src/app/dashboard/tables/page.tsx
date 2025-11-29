/**
 * Tables Management Dashboard Page
 */

'use client'

import React from 'react'
import {IPaginatedResponse} from '@/types/models'
import {UserTable} from '@/types/dynamic-tables'
import {TableList} from '@/components/table-list'

export default function TablesPage({
                                       tables,
                                       filters,
                                       user
                                   }: {
    tables?: IPaginatedResponse<UserTable> | null,
    filters?: { sort?: string, direction?: 'asc' | 'desc' },
    user?: { id: string; email: string; name: string; role?: string }
}) {
    return (
        <TableList
            title="Your Tables"
            items={tables || null}
            filters={filters || {}}
            user={user}
            showForSaleFilter={false}
            enableMassActions={true}
            enableCloning={true}
            createRoute="/dashboard/tables/create"
            showTypeColumn={true}
        />
    )
}

export const metadata = {
    title: 'Dynamic Tables - Dashboard',
    description: 'Manage your custom data tables with configurable columns and permissions'
}
