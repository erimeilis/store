/**
 * Sales Dashboard Page Component
 * Unified interface for managing sales AND rental transactions
 */

import React from 'react';
import { ModelList, IColumnDefinition } from '@/components/model/model-list';
import { IPaginatedResponse } from '@/types/models';
import { SALE_STATUS_CONFIG, PAYMENT_METHOD_LABELS } from '@/types/sales';
import { RENTAL_STATUS_CONFIG, UnifiedTransaction } from '@/types/rentals';
import { formatApiDate, formatCurrency } from '@/lib/date-utils';
import { Card, CardBody } from '@/components/ui/card';
import { IconShoppingCart, IconClockDollar } from '@tabler/icons-react';

// Transaction type display configuration
const TRANSACTION_TYPE_CONFIG = {
  sale: {
    label: 'Sale',
    icon: IconShoppingCart,
    colorClass: 'text-success',
    bgClass: 'bg-success/20',
    badgeClass: 'badge-success'
  },
  rental: {
    label: 'Rental',
    icon: IconClockDollar,
    colorClass: 'text-info',
    bgClass: 'bg-info/20',
    badgeClass: 'badge-info'
  }
};

// Combined status config
const getStatusConfig = (transactionType: string, status: string) => {
  if (transactionType === 'sale') {
    return SALE_STATUS_CONFIG[status as keyof typeof SALE_STATUS_CONFIG] || {
      label: status,
      badgeClass: 'badge-neutral'
    };
  }
  return RENTAL_STATUS_CONFIG[status as keyof typeof RENTAL_STATUS_CONFIG] || {
    label: status,
    badgeClass: 'badge-neutral'
  };
};

// Column definitions for unified transactions
const transactionColumns: IColumnDefinition<UnifiedTransaction>[] = [
  {
    key: 'transactionType',
    label: 'Type',
    sortable: true,
    filterable: true,
    filterType: 'select',
    filterOptions: [
      { value: 'sale', label: 'Sale' },
      { value: 'rental', label: 'Rental' }
    ],
    render: (transaction) => {
      const config = TRANSACTION_TYPE_CONFIG[transaction.transactionType];
      const IconComponent = config.icon;
      return (
        <div className="flex items-center justify-center">
          <div
            className="tooltip tooltip-right"
            data-tip={config.label}
          >
            <div className={`
              flex items-center justify-center w-8 h-8 rounded-full
              ${config.bgClass} ${config.colorClass}
              hover:scale-110 transition-transform duration-200
            `}>
              <IconComponent size={16} />
            </div>
          </div>
        </div>
      );
    }
  },
  {
    key: 'transactionNumber',
    label: 'Transaction #',
    sortable: true,
    filterable: true,
    filterType: 'text',
    render: (transaction) => (
      <span className="font-mono text-sm font-medium">
        {transaction.transactionNumber}
      </span>
    )
  },
  {
    key: 'customerId',
    label: 'Customer',
    sortable: true,
    filterable: true,
    filterType: 'text',
    render: (transaction) => (
      <span className="truncate max-w-[150px]" title={transaction.customerId}>
        {transaction.customerId}
      </span>
    )
  },
  {
    key: 'tableName',
    label: 'Table',
    sortable: true,
    filterable: true,
    filterType: 'text',
    render: (transaction) => (
      <span className="badge badge-outline">
        {transaction.tableName}
      </span>
    )
  },
  {
    key: 'itemName',
    label: 'Item',
    sortable: false,
    filterable: true,
    filterType: 'text',
    render: (transaction) => (
      <div className="flex flex-col">
        <span className="font-medium truncate max-w-[120px]" title={transaction.itemName}>
          {transaction.itemName || 'Unknown Item'}
        </span>
        {transaction.quantity > 1 && (
          <span className="text-xs text-base-content/60">
            Qty: {transaction.quantity}
          </span>
        )}
      </div>
    )
  },
  {
    key: 'totalAmount',
    label: 'Amount',
    sortable: true,
    filterable: true,
    filterType: 'text',
    render: (transaction) => (
      <div className="text-right">
        <div className="font-mono font-semibold">
          {formatCurrency(transaction.totalAmount)}
        </div>
        {transaction.quantity > 1 && (
          <div className="text-xs text-base-content/60">
            {formatCurrency(transaction.unitPrice)} × {transaction.quantity}
          </div>
        )}
      </div>
    )
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    filterable: true,
    filterType: 'select',
    filterOptions: [
      // Sale statuses
      { value: 'pending', label: 'Pending' },
      { value: 'completed', label: 'Completed' },
      { value: 'cancelled', label: 'Cancelled' },
      { value: 'refunded', label: 'Refunded' },
      // Rental statuses
      { value: 'active', label: 'Active' },
      { value: 'released', label: 'Released' }
    ],
    render: (transaction) => {
      const config = getStatusConfig(transaction.transactionType, transaction.status);
      return (
        <span className={`badge ${config.badgeClass}`}>
          {config.label}
        </span>
      );
    }
  },
  {
    key: 'paymentMethod',
    label: 'Payment',
    sortable: true,
    filterable: true,
    filterType: 'select',
    filterOptions: Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => ({
      value,
      label
    })),
    render: (transaction) => {
      if (transaction.transactionType === 'rental') {
        return <span className="text-base-content/40">-</span>;
      }
      return transaction.paymentMethod
        ? PAYMENT_METHOD_LABELS[transaction.paymentMethod as keyof typeof PAYMENT_METHOD_LABELS] || transaction.paymentMethod
        : '-';
    }
  },
  {
    key: 'transactionDate',
    label: 'Date',
    sortable: true,
    filterable: true,
    filterType: 'date',
    render: (transaction) => formatApiDate(transaction.transactionDate)
  }
];

// Mass actions for transactions
const transactionMassActions = [
  {
    name: 'export_csv',
    label: 'Export to CSV',
    confirmMessage: 'Export the selected transactions to CSV format?'
  }
];

interface TransactionsPageProps {
  transactions?: IPaginatedResponse<UnifiedTransaction> & {
    salesCount?: number;
    rentalsCount?: number;
  } | null;
  sales?: IPaginatedResponse<any> | null;
  rentals?: IPaginatedResponse<any> | null;
  filters?: {
    sort?: string;
    direction?: 'asc' | 'desc';
    filterTransactionType?: string;
    filterStatus?: string;
    filterTableId?: string;
    filterCustomerId?: string;
    filterDateFrom?: string;
    filterDateTo?: string;
    filterSearch?: string;
  };
}

export default function TransactionsPage({ transactions, sales, rentals, filters }: TransactionsPageProps) {
  // Provide fallback data structure with all IPaginatedResponse fields
  const transactionsData = transactions || {
    data: [],
    currentPage: 1,
    lastPage: 0,
    perPage: 50,
    total: 0,
    from: null,
    to: null,
    links: [],
    prevPageUrl: null,
    nextPageUrl: null,
    lastPageUrl: null,
    salesCount: 0,
    rentalsCount: 0
  };

  // Calculate stats from transactions data
  const salesTotal = transactionsData.data
    .filter(t => t.transactionType === 'sale')
    .reduce((sum, t) => sum + t.totalAmount, 0);

  const rentalsTotal = transactionsData.data
    .filter(t => t.transactionType === 'rental')
    .reduce((sum, t) => sum + t.totalAmount, 0);

  const activeRentals = transactionsData.data
    .filter(t => t.transactionType === 'rental' && t.status === 'active')
    .length;

  return (
    <div className="space-y-6">
      {/* Transactions Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardBody className="text-center">
            <div className="text-sm font-medium text-base-content/70">Total Transactions</div>
            <div className="text-3xl font-bold text-primary mt-2">
              {transactionsData.total}
            </div>
            <div className="text-xs text-base-content/50 mt-1">All time</div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-center">
            <div className="text-sm font-medium text-base-content/70 flex items-center justify-center gap-1">
              <IconShoppingCart className="h-4 w-4 text-success" />
              Sales
            </div>
            <div className="text-3xl font-bold text-success mt-2">
              {transactionsData.salesCount}
            </div>
            <div className="text-xs text-base-content/50 mt-1">
              {formatCurrency(salesTotal)} revenue
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-center">
            <div className="text-sm font-medium text-base-content/70 flex items-center justify-center gap-1">
              <IconClockDollar className="h-4 w-4 text-info" />
              Rentals
            </div>
            <div className="text-3xl font-bold text-info mt-2">
              {transactionsData.rentalsCount}
            </div>
            <div className="text-xs text-base-content/50 mt-1">
              {formatCurrency(rentalsTotal)} revenue
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-center">
            <div className="text-sm font-medium text-base-content/70">Active Rentals</div>
            <div className="text-3xl font-bold text-warning mt-2">
              {activeRentals}
            </div>
            <div className="text-xs text-base-content/50 mt-1">Currently rented</div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-center">
            <div className="text-sm font-medium text-base-content/70">Total Revenue</div>
            <div className="text-3xl font-bold mt-2">
              {formatCurrency(salesTotal + rentalsTotal)}
            </div>
            <div className="text-xs text-base-content/50 mt-1">From current page</div>
          </CardBody>
        </Card>
      </div>

      {/* Transactions Table */}
      <ModelList<UnifiedTransaction>
        title="Transactions"
        items={transactionsData as IPaginatedResponse<UnifiedTransaction>}
        filters={filters || {}}
        columns={transactionColumns}
        createRoute={null}
        editRoute={() => '#'}
        deleteRoute={() => '#'}
        massActionRoute=""
        massActions={transactionMassActions}
        dataEndpoint="" // Empty to prevent client-side refetching (handler provides unified data)
        compactPagination={true}
      />
    </div>
  );
}

export const metadata = {
  title: 'Transactions',
  description: 'Manage sales and rental transactions, view analytics, and track revenue'
};
