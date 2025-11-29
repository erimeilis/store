/**
 * Dashboard Page Component
 * Main dashboard overview page - showing dynamic tables marked as "for sale"
 */

import React from 'react'
import {IPaginatedResponse} from '@/types/models'
import {UserTable} from '@/types/dynamic-tables'
import {IconTable} from '@tabler/icons-react'
import {TableList} from '@/components/table-list'

export default function DashboardPage({
                                          tables,
                                          filters,
                                          user
                                      }: {
    tables?: IPaginatedResponse<UserTable> | null,
    filters?: { sort?: string, direction?: 'asc' | 'desc', forSale?: string, tableType?: string },
    user?: { id: string; email: string; name: string; role?: string }
}) {
    return (
        <div className="space-y-6">
            {/* Dashboard Header */}
            <div className="flex items-center gap-3">
                <IconTable className="h-8 w-8 text-primary"/>
                <div>
                    <h1 className="text-2xl font-bold">Store Dashboard</h1>
                    <p className="text-base-content/70">Manage your tables for sale and rent</p>
                </div>
            </div>

            {/* All Store Tables (Sale + Rent) */}
            <TableList
                title="Store Tables"
                items={tables || null}
                filters={filters}
                user={user}
                enableMassActions={true}
                enableCloning={true}
                createRoute={null}
                showTypeColumn={true}
            />
        </div>
    )
}

export const metadata = {
    title: 'Dashboard Overview',
    description: 'Overview of your store inventory and recent activity'
}
