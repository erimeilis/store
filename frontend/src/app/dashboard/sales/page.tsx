/**
 * Sales Dashboard Page Component
 * Admin interface for managing sales transactions and viewing analytics
 */

import React from 'react';
import { ModelList, IColumnDefinition } from '@/components/model/model-list';
import { IPaginatedResponse } from '@/types/models';
import { Sale, SaleStatus, SALE_STATUS_CONFIG, PAYMENT_METHOD_LABELS } from '@/types/sales';
import { formatApiDate, formatCurrency } from '@/lib/date-utils';
import { Card, CardBody } from '@/components/ui/card';

// Column definitions for Sales management
const salesColumns: IColumnDefinition<Sale>[] = [
  {
    key: 'saleNumber',
    label: 'Sale #',
    sortable: true,
    filterable: true,
    filterType: 'text',
    render: (sale) => (
      <span className="font-mono text-sm font-medium">
        {sale.saleNumber}
      </span>
    )
  },
  {
    key: 'customerId',
    label: 'Customer',
    sortable: true,
    filterable: true,
    filterType: 'text',
    render: (sale) => (
      <span className="truncate max-w-[150px]" title={sale.customerId}>
        {sale.customerId}
      </span>
    )
  },
  {
    key: 'tableName',
    label: 'Table',
    sortable: true,
    filterable: true,
    filterType: 'text',
    render: (sale) => (
      <span className="badge badge-outline">
        {sale.tableName}
      </span>
    )
  },
  {
    key: 'itemSnapshot.name',
    label: 'Item',
    sortable: false,
    filterable: true,
    filterType: 'text',
    render: (sale) => (
      <div className="flex flex-col">
        <span className="font-medium truncate max-w-[120px]" title={sale.itemSnapshot.name}>
          {sale.itemSnapshot.name || 'Unknown Item'}
        </span>
        <span className="text-xs text-base-content/60">
          Qty: {sale.quantitySold}
        </span>
      </div>
    )
  },
  {
    key: 'totalAmount',
    label: 'Total',
    sortable: true,
    filterable: true,
    filterType: 'text',
    render: (sale) => (
      <div className="text-right">
        <div className="font-mono font-semibold">
          {formatCurrency(sale.totalAmount)}
        </div>
        <div className="text-xs text-base-content/60">
          {formatCurrency(sale.unitPrice)} × {sale.quantitySold}
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
      const config = SALE_STATUS_CONFIG[sale.saleStatus];
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
    render: (sale) => sale.paymentMethod ? PAYMENT_METHOD_LABELS[sale.paymentMethod as keyof typeof PAYMENT_METHOD_LABELS] || sale.paymentMethod : '-'
  },
  {
    key: 'created_at',
    label: 'Sale Date',
    sortable: true,
    filterable: true,
    filterType: 'date',
    render: (sale) => formatApiDate(sale.createdAt)
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
        <Card>
          <CardBody className="text-center">
            <div className="text-sm font-medium text-base-content/70">Total Sales</div>
            <div className="text-3xl font-bold text-primary mt-2">
              {(salesData as any)?.total || salesData?.data?.length || 0}
            </div>
            <div className="text-xs text-base-content/50 mt-1">All time transactions</div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-center">
            <div className="text-sm font-medium text-base-content/70">Revenue</div>
            <div className="text-3xl font-bold text-success mt-2">
              {formatCurrency(
                salesData.data.reduce((sum, sale) => sum + sale.totalAmount, 0)
              )}
            </div>
            <div className="text-xs text-base-content/50 mt-1">From current page</div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-center">
            <div className="text-sm font-medium text-base-content/70">Avg. Sale</div>
            <div className="text-3xl font-bold mt-2">
              {salesData.data.length ?
                formatCurrency(
                  salesData.data.reduce((sum, sale) => sum + sale.totalAmount, 0) / salesData.data.length
                ) : formatCurrency(0)
              }
            </div>
            <div className="text-xs text-base-content/50 mt-1">Average transaction</div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-center">
            <div className="text-sm font-medium text-base-content/70">Items Sold</div>
            <div className="text-3xl font-bold text-info mt-2">
              {salesData.data.reduce((sum, sale) => sum + sale.quantitySold, 0)}
            </div>
            <div className="text-xs text-base-content/50 mt-1">Total quantity</div>
          </CardBody>
        </Card>
      </div>

      {/* Sales Management Table */}
      <ModelList<Sale>
        title="Sales Transactions"
        items={salesData as IPaginatedResponse<Sale> | null}
        filters={filters || {}}
        columns={salesColumns}
        editRoute={(id) => `/dashboard/sales/edit/${id}`}
        inlineEditRoute={(id) => `/api/sales/${id}`}
        deleteRoute={(id) => `/api/sales/${id}`}
        massActionRoute="/api/sales/mass-action"
        massActions={salesMassActions}
        dataEndpoint="/api/sales"
        compactPagination={true}
      />
    </div>
  );
}

export const metadata = {
  title: 'Sales Management',
  description: 'Manage sales transactions, view analytics, and track inventory changes'
};