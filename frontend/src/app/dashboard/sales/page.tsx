/**
 * Sales Dashboard Page Component
 * Admin interface for managing sales transactions and viewing analytics
 */

import React from 'react';
import { ModelList, IColumnDefinition } from '@/components/model/model-list';
import { IPaginatedResponse } from '@/types/models';
import { Sale, SaleStatus, SALE_STATUS_CONFIG, PAYMENT_METHOD_LABELS } from '@/types/sales';
import { formatApiDate, formatCurrency } from '@/lib/date-utils';

// Column definitions for Sales management
const salesColumns: IColumnDefinition<Sale>[] = [
  {
    key: 'sale_number',
    label: 'Sale #',
    sortable: true,
    filterable: true,
    filterType: 'text',
    render: (sale) => (
      <span className="font-mono text-sm font-medium">
        {sale.sale_number}
      </span>
    )
  },
  {
    key: 'customer_id',
    label: 'Customer',
    sortable: true,
    filterable: true,
    filterType: 'text',
    render: (sale) => (
      <span className="truncate max-w-[150px]" title={sale.customer_id}>
        {sale.customer_id}
      </span>
    )
  },
  {
    key: 'table_name',
    label: 'Table',
    sortable: true,
    filterable: true,
    filterType: 'text',
    render: (sale) => (
      <span className="badge badge-outline">
        {sale.table_name}
      </span>
    )
  },
  {
    key: 'item_snapshot.name',
    label: 'Item',
    sortable: false,
    filterable: true,
    filterType: 'text',
    render: (sale) => (
      <div className="flex flex-col">
        <span className="font-medium truncate max-w-[120px]" title={sale.item_snapshot.name}>
          {sale.item_snapshot.name || 'Unknown Item'}
        </span>
        <span className="text-xs text-base-content/60">
          Qty: {sale.quantity_sold}
        </span>
      </div>
    )
  },
  {
    key: 'total_amount',
    label: 'Total',
    sortable: true,
    filterable: true,
    filterType: 'text',
    render: (sale) => (
      <div className="text-right">
        <div className="font-mono font-semibold">
          {formatCurrency(sale.total_amount)}
        </div>
        <div className="text-xs text-base-content/60">
          {formatCurrency(sale.unit_price)} × {sale.quantity_sold}
        </div>
      </div>
    )
  },
  {
    key: 'sale_status',
    label: 'Status',
    sortable: true,
    filterable: true,
    filterType: 'select',
    filterOptions: Object.entries(SALE_STATUS_CONFIG).map(([value, config]) => ({
      value,
      label: config.label
    })),
    editableInline: true,
    editType: 'select',
    editOptions: Object.entries(SALE_STATUS_CONFIG).map(([value, config]) => ({
      value,
      label: config.label
    })),
    render: (sale) => {
      const config = SALE_STATUS_CONFIG[sale.sale_status];
      return (
        <span className={`badge ${config.badgeClass}`}>
          {config.label}
        </span>
      );
    }
  },
  {
    key: 'payment_method',
    label: 'Payment',
    sortable: true,
    filterable: true,
    filterType: 'select',
    filterOptions: Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => ({
      value,
      label
    })),
    editableInline: true,
    editType: 'select',
    editOptions: Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => ({
      value,
      label
    })),
    render: (sale) => sale.payment_method ? PAYMENT_METHOD_LABELS[sale.payment_method as keyof typeof PAYMENT_METHOD_LABELS] || sale.payment_method : '-'
  },
  {
    key: 'created_at',
    label: 'Sale Date',
    sortable: true,
    filterable: true,
    filterType: 'date',
    render: (sale) => formatApiDate(sale.created_at)
  }
];

// Mass actions for sales
const salesMassActions = [
  {
    name: 'update_status',
    label: 'Update Status',
    confirmMessage: 'Are you sure you want to update the status for the selected sales?'
  },
  {
    name: 'export_csv',
    label: 'Export to CSV',
    confirmMessage: 'Export the selected sales to CSV format?'
  },
  {
    name: 'cancel_sales',
    label: 'Cancel Sales',
    confirmMessage: 'Are you sure you want to cancel the selected sales? This action can be undone.'
  }
];

interface SalesPageProps {
  sales?: IPaginatedResponse<Sale> | null;
  filters?: {
    sort?: string;
    direction?: 'asc' | 'desc';
    sale_status?: SaleStatus;
    date_from?: string;
    date_to?: string;
    table_id?: string;
    customer_id?: string;
  };
}

export default function SalesPage({ sales, filters }: SalesPageProps) {
  // Provide fallback data structure when sales is undefined
  const salesData = sales || {
    data: [],
    meta: {
      page: 1,
      limit: 50,
      total: 0,
      totalPages: 0
    }
  };

  return (
    <div className="space-y-6">
      {/* Sales Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-title">Total Sales</div>
          <div className="stat-value text-primary">
            {salesData.meta.total}
          </div>
          <div className="stat-desc">All time transactions</div>
        </div>

        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-title">Revenue</div>
          <div className="stat-value text-success">
            {formatCurrency(
              salesData.data.reduce((sum, sale) => sum + sale.total_amount, 0)
            )}
          </div>
          <div className="stat-desc">From current page</div>
        </div>

        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-title">Avg. Sale</div>
          <div className="stat-value">
            {salesData.data.length ?
              formatCurrency(
                salesData.data.reduce((sum, sale) => sum + sale.total_amount, 0) / salesData.data.length
              ) : formatCurrency(0)
            }
          </div>
          <div className="stat-desc">Average transaction</div>
        </div>

        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-title">Items Sold</div>
          <div className="stat-value text-info">
            {salesData.data.reduce((sum, sale) => sum + sale.quantity_sold, 0)}
          </div>
          <div className="stat-desc">Total quantity</div>
        </div>
      </div>

      {/* Sales Management Table */}
      <ModelList<Sale>
        title="Sales Transactions"
        items={salesData}
        filters={filters || {}}
        columns={salesColumns}
        editRoute={(id) => `/dashboard/sales/edit/${id}`}
        inlineEditRoute={(id) => `/api/sales/${id}`}
        deleteRoute={(id) => `/api/sales/${id}`}
        massActionRoute="/api/sales/mass-action"
        massActions={salesMassActions}
        defaultSort="created_at"
        defaultDirection="desc"
        enableExport={true}
        exportFormats={['csv', 'xlsx']}
        customActions={[
          {
            name: 'analytics',
            label: 'View Analytics',
            icon: '📊',
            href: '/dashboard/sales/analytics'
          },
          {
            name: 'inventory',
            label: 'Inventory Report',
            icon: '📦',
            href: '/dashboard/sales/inventory'
          }
        ]}
        disableCreate={true} // Sales are created via API only
      />
    </div>
  );
}

export const metadata = {
  title: 'Sales Management',
  description: 'Manage sales transactions, view analytics, and track inventory changes'
};