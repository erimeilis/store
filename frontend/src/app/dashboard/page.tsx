/**
 * Dashboard Page Component
 * Main dashboard overview page - using ModelList for items
 */

import React from 'react';
import { ModelList, IColumnDefinition } from '@/components/model/model-list';
import { IPaginatedResponse } from '@/types/models';
import { formatApiDate } from '@/lib/date-utils';

// Item interface based on the backend structure with adapted frontend data
interface Item {
  id: string;
  name: string;
  description: string | null;
  price: number;
  quantity: number;
  category: string;
  createdAt: string;
  updatedAt: string;
}

// Column definitions for Items management
const itemColumns: IColumnDefinition<Item>[] = [
  { 
    key: 'name', 
    label: 'Name', 
    sortable: true, 
    filterable: true,
    filterType: 'text',
    editableInline: true,
    editType: 'text',
    editValidation: { required: true, minLength: 1, maxLength: 255 }
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
    render: (item) => item.description || '-'
  },
  { 
    key: 'price', 
    label: 'Price', 
    sortable: true,
    filterable: true,
    filterType: 'text',
    editableInline: true,
    editType: 'number',
    render: (item) => (
      <span className="font-mono">
        ${item.price.toFixed(2)}
      </span>
    )
  },
  { 
    key: 'quantity', 
    label: 'Quantity', 
    sortable: true,
    filterable: true,
    filterType: 'text',
    editableInline: true,
    editType: 'number',
    render: (item) => (
      <span className={`badge ${
        item.quantity === 0 
          ? 'badge-error' 
          : item.quantity < 10 
          ? 'badge-warning' 
          : 'badge-success'
      }`}>
        {item.quantity}
      </span>
    )
  },
  { 
    key: 'category', 
    label: 'Category', 
    sortable: true,
    filterable: true,
    filterType: 'text',
    editableInline: true,
    editType: 'text',
    editValidation: { maxLength: 100 },
    render: (item) => item.category || '-'
  },
  { 
    key: 'updatedAt', 
    label: 'Updated', 
    sortable: true,
    filterable: true,
    filterType: 'date',
    render: (item) => formatApiDate(item.updatedAt)
  }
];

// Mass actions for items
const itemMassActions = [
  {
    name: 'bulk_update_category',
    label: 'Update Category',
    confirmMessage: 'Are you sure you want to update the category for the selected items?'
  },
  {
    name: 'bulk_discount',
    label: 'Apply Discount',
    confirmMessage: 'Are you sure you want to apply a discount to the selected items?'
  },
  {
    name: 'delete',
    label: 'Delete Items',
    confirmMessage: 'Are you sure you want to delete the selected items? This action cannot be undone.'
  }
];

export default function DashboardPage({ 
  items, 
  filters 
}: { 
  items?: IPaginatedResponse<Item> | null, 
  filters?: { sort?: string, direction?: 'asc' | 'desc' } 
}) {
  return (
    <ModelList<Item>
      title="Store Items"
      items={items || null}
      filters={filters || {}}
      columns={itemColumns}
      createRoute="/dashboard/items/create"
      editRoute={(id) => `/dashboard/items/edit/${id}`}
      inlineEditRoute={(id) => `/api/items/${id}`}
      deleteRoute={(id) => `/api/items/${id}`}
      massActionRoute="/api/items/mass-action"
      massActions={itemMassActions}
    />
  );
}

export const metadata = {
  title: 'Dashboard Overview',
  description: 'Overview of your store inventory and recent activity'
}
