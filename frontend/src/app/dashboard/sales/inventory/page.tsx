/**
 * Inventory Tracking Page Component
 * Admin interface for viewing inventory transactions and audit trails
 */

import React from 'react';
import { ModelList, IColumnDefinition } from '@/components/model/model-list';
import { IPaginatedResponse } from '@/types/models';
import { formatApiDate } from '@/lib/date-utils';

// Inventory transaction interface
interface InventoryTransaction {
  id: string;
  table_id: string;
  table_name: string;
  item_id: string;
  transaction_type: 'sale' | 'add' | 'remove' | 'update' | 'adjust';
  quantity_change: number | null;
  previous_data: any;
  new_data: any;
  reference_id: string | null; // sale_id for sales
  created_by: string;
  created_at: string;
}

// Transaction type display configuration
const TRANSACTION_TYPE_CONFIG = {
  sale: { label: 'Sale', icon: '🛍️', badgeClass: 'badge-success' },
  add: { label: 'Added', icon: '➕', badgeClass: 'badge-info' },
  remove: { label: 'Removed', icon: '➖', badgeClass: 'badge-warning' },
  update: { label: 'Updated', icon: '✏️', badgeClass: 'badge-primary' },
  adjust: { label: 'Adjustment', icon: '⚖️', badgeClass: 'badge-secondary' }
};

// Column definitions for Inventory Transactions
const inventoryColumns: IColumnDefinition<InventoryTransaction>[] = [
  {
    key: 'transaction_type',
    label: 'Type',
    sortable: true,
    filterable: true,
    filterType: 'select',
    filterOptions: Object.entries(TRANSACTION_TYPE_CONFIG).map(([value, config]) => ({
      value,
      label: config.label
    })),
    render: (transaction) => {
      const config = TRANSACTION_TYPE_CONFIG[transaction.transaction_type];
      return (
        <div className="flex items-center gap-2">
          <span className="text-lg">{config.icon}</span>
          <span className={`badge ${config.badgeClass}`}>
            {config.label}
          </span>
        </div>
      );
    }
  },
  {
    key: 'table_name',
    label: 'Table',
    sortable: true,
    filterable: true,
    filterType: 'text',
    render: (transaction) => (
      <span className="badge badge-outline">
        {transaction.table_name}
      </span>
    )
  },
  {
    key: 'item_name',
    label: 'Item',
    sortable: false,
    filterable: true,
    filterType: 'text',
    render: (transaction) => {
      const itemName = transaction.new_data?.name || transaction.previous_data?.name || 'Unknown Item';
      return (
        <div className="flex flex-col">
          <span className="font-medium truncate max-w-[150px]" title={itemName}>
            {itemName}
          </span>
          <span className="text-xs text-base-content/60 font-mono">
            ID: {transaction.item_id.substring(0, 8)}...
          </span>
        </div>
      );
    }
  },
  {
    key: 'quantity_change',
    label: 'Qty Change',
    sortable: true,
    filterable: true,
    filterType: 'text',
    render: (transaction) => {
      if (transaction.quantity_change === null) {
        return <span className="text-base-content/40">-</span>;
      }

      const change = transaction.quantity_change;
      const isPositive = change > 0;
      const isNegative = change < 0;

      return (
        <div className="text-center">
          <span className={`font-mono font-semibold ${
            isPositive ? 'text-success' : isNegative ? 'text-error' : 'text-base-content'
          }`}>
            {change > 0 ? '+' : ''}{change}
          </span>
        </div>
      );
    }
  },
  {
    key: 'stock_levels',
    label: 'Stock',
    sortable: false,
    filterable: false,
    render: (transaction) => {
      const prevQty = transaction.previous_data?.qty;
      const newQty = transaction.new_data?.qty;

      if (prevQty === undefined && newQty === undefined) {
        return <span className="text-base-content/40">-</span>;
      }

      return (
        <div className="text-center text-sm">
          {prevQty !== undefined && (
            <div className="text-base-content/60">
              From: {prevQty}
            </div>
          )}
          {newQty !== undefined && (
            <div className="font-semibold">
              To: {newQty}
            </div>
          )}
        </div>
      );
    }
  },
  {
    key: 'reference_id',
    label: 'Reference',
    sortable: true,
    filterable: true,
    filterType: 'text',
    render: (transaction) => {
      if (!transaction.reference_id) {
        return <span className="text-base-content/40">-</span>;
      }

      return (
        <a
          href={`/dashboard/sales/edit/${transaction.reference_id}`}
          className="link link-primary font-mono text-xs"
          title="View related sale"
        >
          {transaction.reference_id.substring(0, 8)}...
        </a>
      );
    }
  },
  {
    key: 'created_by',
    label: 'Created By',
    sortable: true,
    filterable: true,
    filterType: 'text',
    render: (transaction) => (
      <span className="text-sm truncate max-w-[100px]" title={transaction.created_by}>
        {transaction.created_by.replace(/^(token:|user:)/, '')}
      </span>
    )
  },
  {
    key: 'created_at',
    label: 'Date',
    sortable: true,
    filterable: true,
    filterType: 'date',
    render: (transaction) => formatApiDate(transaction.created_at, true)
  }
];

// Mass actions for inventory transactions
const inventoryMassActions = [
  {
    name: 'export_csv',
    label: 'Export to CSV',
    confirmMessage: 'Export the selected inventory transactions to CSV format?'
  },
  {
    name: 'generate_report',
    label: 'Generate Report',
    confirmMessage: 'Generate an inventory report for the selected transactions?'
  }
];

interface InventoryPageProps {
  transactions?: IPaginatedResponse<InventoryTransaction> | null;
  filters?: {
    sort?: string;
    direction?: 'asc' | 'desc';
    transaction_type?: string;
    table_id?: string;
    date_from?: string;
    date_to?: string;
    created_by?: string;
  };
  stockAlerts?: Array<{
    item_id: string;
    table_name: string;
    item_name: string;
    current_quantity: number;
    alert_type: 'low_stock' | 'out_of_stock' | 'negative_stock';
  }> | null;
}

export default function InventoryPage({ transactions, filters, stockAlerts }: InventoryPageProps) {
  // Mock stock alerts for demonstration
  const mockStockAlerts = stockAlerts || [
    { item_id: '1', table_name: 'Electronics', item_name: 'Wireless Mouse', current_quantity: 2, alert_type: 'low_stock' as const },
    { item_id: '2', table_name: 'Books', item_name: 'React Handbook', current_quantity: 0, alert_type: 'out_of_stock' as const },
    { item_id: '3', table_name: 'Clothing', item_name: 'Summer Dress', current_quantity: -1, alert_type: 'negative_stock' as const }
  ];

  return (
    <div className="space-y-6">
      {/* Stock Alerts */}
      {mockStockAlerts.length > 0 && (
        <div className="alert alert-warning">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-semibold">Stock Alerts</h3>
                <div className="text-sm mt-1">
                  {mockStockAlerts.length} items require attention
                </div>
              </div>
            </div>
          </div>
          <div className="flex-none">
            <button className="btn btn-sm btn-ghost">
              View All Alerts
            </button>
          </div>
        </div>
      )}

      {/* Quick Stock Alerts Grid */}
      {mockStockAlerts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockStockAlerts.slice(0, 3).map((alert) => (
            <div key={alert.item_id} className={`card shadow-lg ${
              alert.alert_type === 'out_of_stock' ? 'bg-error text-error-content' :
              alert.alert_type === 'negative_stock' ? 'bg-warning text-warning-content' :
              'bg-orange-100 border border-orange-300'
            }`}>
              <div className="card-body p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-sm truncate" title={alert.item_name}>
                      {alert.item_name}
                    </h4>
                    <p className="text-xs opacity-80">{alert.table_name}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      {alert.current_quantity}
                    </div>
                    <div className="text-xs">
                      {alert.alert_type === 'out_of_stock' ? 'Out of Stock' :
                       alert.alert_type === 'negative_stock' ? 'Negative Stock' :
                       'Low Stock'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inventory Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-title">Total Transactions</div>
          <div className="stat-value text-primary">
            {transactions?.meta.total || 0}
          </div>
          <div className="stat-desc">All inventory changes</div>
        </div>

        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-title">Sales Today</div>
          <div className="stat-value text-success">
            {transactions?.data.filter(t =>
              t.transaction_type === 'sale' &&
              new Date(t.created_at).toDateString() === new Date().toDateString()
            ).length || 0}
          </div>
          <div className="stat-desc">Items sold today</div>
        </div>

        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-title">Stock Alerts</div>
          <div className="stat-value text-warning">
            {mockStockAlerts.length}
          </div>
          <div className="stat-desc">Require attention</div>
        </div>

        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-title">Tables Tracked</div>
          <div className="stat-value text-info">
            {new Set(transactions?.data.map(t => t.table_id) || []).size}
          </div>
          <div className="stat-desc">Active tables</div>
        </div>
      </div>

      {/* Inventory Transactions Table */}
      <ModelList<InventoryTransaction>
        title="Inventory Transactions"
        items={transactions || null}
        filters={filters || {}}
        columns={inventoryColumns}
        editRoute={() => '#'} // No edit for transactions
        deleteRoute={() => '#'} // No delete for audit trail
        massActionRoute="/api/inventory/mass-action"
        massActions={inventoryMassActions}
        defaultSort="created_at"
        defaultDirection="desc"
        enableExport={true}
        exportFormats={['csv', 'xlsx']}
        customActions={[
          {
            name: 'stock_check',
            label: 'Stock Check',
            icon: '📊',
            href: '/api/inventory/stock-check'
          },
          {
            name: 'analytics',
            label: 'Inventory Analytics',
            icon: '📈',
            href: '/dashboard/sales/inventory/analytics'
          }
        ]}
        disableInlineEdit={true} // No inline editing for audit trail
        disableDelete={true} // No deletion for audit compliance
        disableCreate={true} // No manual creation - inventory is tracked automatically
      />
    </div>
  );
}

export const metadata = {
  title: 'Inventory Tracking',
  description: 'Monitor inventory changes, track stock levels, and view transaction audit trail'
};