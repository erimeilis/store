/**
 * Dashboard Page Component
 * Main dashboard overview page - showing dynamic tables marked as "for sale"
 */

import React from 'react';
import { ModelList, IColumnDefinition, IRowAction } from '@/components/model/model-list';
import { IPaginatedResponse } from '@/types/models';
import { UserTable } from '@/types/dynamic-tables';
import { formatApiDate } from '@/lib/date-utils';
import { IconDatabase, IconColumns3, IconShoppingCart } from '@tabler/icons-react';

// Column definitions for "for sale" Tables on dashboard
const forSaleTableColumns: IColumnDefinition<UserTable>[] = [
  {
    key: 'name',
    label: 'Table Name',
    sortable: true,
    filterable: true,
    filterType: 'text',
    render: (table) => (
      <span className="font-medium">{table.name}</span>
    )
  },
  {
    key: 'description',
    label: 'Description',
    sortable: true,
    filterable: true,
    filterType: 'text',
    render: (table) => table.description || (
      <span className="text-gray-500 italic">No description</span>
    )
  },
  {
    key: 'created_by',
    label: 'Owner',
    sortable: true,
    filterable: true,
    filterType: 'text',
    render: (table) => (
      <span className="text-sm">
        {table.owner_display_name || table.created_by}
      </span>
    )
  },
  {
    key: 'is_public',
    label: 'Visibility',
    sortable: true,
    filterable: true,
    filterType: 'select',
    filterOptions: [
      { value: 'true', label: 'Public' },
      { value: 'false', label: 'Private' }
    ],
    render: (table) => (
      <span className={`badge ${
        table.is_public
          ? 'badge-success'
          : 'badge-warning'
      }`}>
        {table.is_public ? 'Public' : 'Private'}
      </span>
    )
  },
  {
    key: 'updated_at',
    label: 'Updated',
    sortable: true,
    filterable: true,
    filterType: 'date',
    render: (table) => formatApiDate(table.updated_at)
  }
];

// Row actions for individual "for sale" tables
const forSaleTableRowActions: IRowAction<UserTable>[] = [
  {
    icon: IconDatabase,
    title: 'View Data',
    color: 'info',
    style: 'soft',
    onClick: (table) => window.location.href = `/dashboard/tables/${table.id}/data`
  },
  {
    icon: IconColumns3,
    title: 'Manage Columns',
    color: 'warning',
    style: 'soft',
    onClick: (table) => window.location.href = `/dashboard/tables/${table.id}/columns`
  }
];

export default function DashboardPage({
  tables,
  filters
}: {
  tables?: IPaginatedResponse<UserTable> | null,
  filters?: { sort?: string, direction?: 'asc' | 'desc', for_sale?: string }
}) {
  // Filter to show only "for sale" tables
  const forSaleFilters = {
    ...filters,
    for_sale: 'true'
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center gap-3">
        <IconShoppingCart className="h-8 w-8 text-success" />
        <div>
          <h1 className="text-2xl font-bold">For Sale Tables</h1>
          <p className="text-base-content/70">Manage your tables that are available for purchase</p>
        </div>
      </div>

      {/* For Sale Tables List */}
      <ModelList<UserTable>
        title="Your For Sale Tables"
        items={tables || null}
        filters={forSaleFilters}
        columns={forSaleTableColumns}
        createRoute={null}
        editRoute={(id) => `/dashboard/tables/${id}/edit`}
        deleteRoute={(id) => `/api/tables/${id}`}
        inlineEditRoute={(id) => `/api/tables/${id}`}
        massActionRoute="/api/tables/mass-action"
        rowActions={forSaleTableRowActions}
        emptyStateMessage="No for sale tables found. Create a table and mark it as 'for sale' to see it here."
      />
    </div>
  );
}

export const metadata = {
  title: 'Dashboard Overview',
  description: 'Overview of your store inventory and recent activity'
}
