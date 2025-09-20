/**
 * Tables Management Dashboard Page
 * Lists all dynamic user-created tables with CRUD operations
 */

import React from 'react';
import { ModelList, IColumnDefinition, IRowAction } from '@/components/model/model-list';
import { IPaginatedResponse } from '@/types/models';
import { UserTable } from '@/types/dynamic-tables';
import { formatApiDate } from '@/lib/date-utils';
import { IconDatabase, IconColumns3, IconShoppingCart } from '@tabler/icons-react';

// Column definitions for Tables management
const tableColumns: IColumnDefinition<UserTable>[] = [
  { 
    key: 'name', 
    label: 'Table Name', 
    sortable: true, 
    filterable: true,
    filterType: 'text',
    editableInline: true,
    editType: 'text',
    editValidation: { required: true, minLength: 1, maxLength: 100 },
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
    editableInline: true,
    editType: 'text',
    editValidation: { maxLength: 500 },
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
    editableInline: true,
    editType: 'toggle',
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
    key: 'for_sale',
    label: 'Type',
    sortable: true,
    filterable: true,
    filterType: 'select',
    filterOptions: [
      { value: 'true', label: 'For Sale' },
      { value: 'false', label: 'Regular' }
    ],
    editableInline: true,
    editType: 'toggle',
    render: (table) => (
      <div className="flex items-center justify-center">
        {table.for_sale ? (
          <IconShoppingCart className="h-5 w-5 text-success" title="For Sale" />
        ) : (
          <div className="h-5 w-5" title="Regular"></div>
        )}
      </div>
    )
  },
  {
    key: 'created_at',
    label: 'Created',
    sortable: true,
    filterable: true,
    filterType: 'date',
    render: (table) => formatApiDate(table.created_at)
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

// Row actions for individual tables
const tableRowActions: IRowAction<UserTable>[] = [
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

// Mass actions for tables
const tableMassActions = [
  {
    name: 'make_public',
    label: 'Make Public',
    confirmMessage: 'Are you sure you want to make the selected tables public? This will allow all authenticated users to edit them.'
  },
  {
    name: 'make_private',
    label: 'Make Private',
    confirmMessage: 'Are you sure you want to make the selected tables private? Only you will be able to edit them.'
  },
  {
    name: 'delete',
    label: 'Delete Tables',
    confirmMessage: 'Are you sure you want to delete the selected tables? This will permanently delete all table data and cannot be undone.'
  }
];

export default function TablesPage({ 
  tables, 
  filters 
}: { 
  tables?: IPaginatedResponse<UserTable> | null, 
  filters?: { sort?: string, direction?: 'asc' | 'desc' } 
}) {
  return (
      <ModelList<UserTable>
        title="Your Tables"
        items={tables || null}
        filters={filters || {}}
        columns={tableColumns}
        createRoute="/dashboard/tables/create"
        editRoute={(id) => `/dashboard/tables/${id}/edit`}
        deleteRoute={(id) => `/api/tables/${id}`}
        inlineEditRoute={(id) => `/api/tables/${id}`}
        massActionRoute="/api/tables/mass-action"
        massActions={tableMassActions}
        rowActions={tableRowActions}
      />
  );
}

export const metadata = {
  title: 'Dynamic Tables - Dashboard',
  description: 'Manage your custom data tables with configurable columns and permissions'
};
