/**
 * Inventory Tracking Page Component
 * Admin interface for viewing inventory transactions and audit trails
 */

import React from 'react'
import {IColumnDefinition, ModelList} from '@/components/model/model-list'
import {IPaginatedResponse} from '@/types/models'
import {formatApiDate} from '@/lib/date-utils'
import {IconAdjustments, IconEdit, IconMinus, IconPlus, IconShoppingCart} from '@tabler/icons-react'
import {Alert} from '@/components/ui/alert'
import {Button} from '@/components/ui/button'
import {Card, CardBody} from '@/components/ui/card'
import {Modal, ModalBox, ModalAction, ModalBackdrop} from '@/components/ui/modal'

// Inventory transaction interface
interface InventoryTransaction {
    id: string;
    tableId: string;
    tableName: string;
    itemId: string;
    transactionType: 'sale' | 'add' | 'remove' | 'update' | 'adjust';
    quantityChange: number | null;
    previousData: any;
    newData: any;
    referenceId: string | null; // saleId for sales
    createdBy: string;
    createdAt: string;
}

// Transaction type display configuration
const TRANSACTION_TYPE_CONFIG = {
    sale: {label: 'Sale', icon: IconShoppingCart, colorClass: 'text-success', bgClass: 'bg-success/20'},
    add: {label: 'Added', icon: IconPlus, colorClass: 'text-info', bgClass: 'bg-info/20'},
    remove: {label: 'Removed', icon: IconMinus, colorClass: 'text-warning', bgClass: 'bg-warning/20'},
    update: {label: 'Updated', icon: IconEdit, colorClass: 'text-primary', bgClass: 'bg-primary/20'},
    adjust: {label: 'Adjustment', icon: IconAdjustments, colorClass: 'text-secondary', bgClass: 'bg-secondary/20'}
}

// Column definitions for Inventory Transactions
const inventoryColumns: IColumnDefinition<InventoryTransaction>[] = [
    {
        key: 'transactionType',
        label: 'Type',
        sortable: true,
        filterable: true,
        filterType: 'select',
        filterOptions: Object.entries(TRANSACTION_TYPE_CONFIG).map(([value, config]) => ({
            value,
            label: config.label
        })),
        render: (transaction) => {
            const config = TRANSACTION_TYPE_CONFIG[transaction.transactionType]
            const IconComponent = config.icon
            return (
                <div className="flex items-center justify-center">
                    <div
                        className={`tooltip tooltip-right`}
                        data-tip={config.label}
                    >
                        <div className={`
              flex items-center justify-center w-8 h-8 rounded-full
              ${config.bgClass} ${config.colorClass}
              hover:scale-110 transition-transform duration-200
            `}>
                            <IconComponent size={16}/>
                        </div>
                    </div>
                </div>
            )
        }
    },
    {
        key: 'tableName',
        label: 'Table',
        sortable: true,
        filterable: true,
        filterType: 'text',
        render: (transaction) => (
            <span className="text-sm">
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
        render: (transaction) => {
            // Helper function to extract item name from first text-like field
            const extractItemName = (data: any) => {
                if (!data) return null

                // Common name fields to try first
                const nameFields = ['name', 'productName', 'itemName', 'title', 'description']
                for (const field of nameFields) {
                    if (data[field] && typeof data[field] === 'string') {
                        return data[field]
                    }
                }

                // If no common name field, use first string field
                for (const [key, value] of Object.entries(data)) {
                    if (typeof value === 'string' && value.trim() && key !== 'id') {
                        return value
                    }
                }

                return null
            }

            const itemName = extractItemName(transaction.newData) ||
                extractItemName(transaction.previousData) ||
                'Unknown Item'

            return (
                <div className="flex flex-col">
          <span className="font-medium truncate max-w-[150px]" title={itemName}>
            {itemName}
          </span>
                    <span className="text-xs text-base-content/60 font-mono">
            ID: {transaction.itemId.substring(0, 8)}...
          </span>
                </div>
            )
        }
    },
    {
        key: 'quantityChange',
        label: 'Qty Change',
        sortable: true,
        filterable: true,
        filterType: 'text',
        render: (transaction) => {
            if (transaction.quantityChange === null) {
                return <span className="text-base-content/40">-</span>
            }

            const change = transaction.quantityChange
            const isPositive = change > 0
            const isNegative = change < 0

            return (
                <div className="text-center">
          <span className={`font-mono font-semibold ${
              isPositive ? 'text-success' : isNegative ? 'text-error' : 'text-base-content'
          }`}>
            {change > 0 ? '+' : ''}{change}
          </span>
                </div>
            )
        }
    },
    {
        key: 'stockLevels',
        label: 'Stock',
        sortable: false,
        filterable: false,
        render: (transaction) => {
            const prevQty = transaction.previousData?.qty
            const newQty = transaction.newData?.qty

            if (prevQty === undefined && newQty === undefined) {
                return <span className="text-base-content/40">-</span>
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
            )
        }
    },
    {
        key: 'referenceId',
        label: 'Reference',
        sortable: true,
        filterable: true,
        filterType: 'text',
        render: (transaction) => {
            if (!transaction.referenceId) {
                return <span className="text-base-content/40">-</span>
            }

            return (
                <Button
                    size="sm"
                    style="ghost"
                    color="primary"
                    onClick={() => window.location.href = `/dashboard/sales/edit/${transaction.referenceId}`}
                >
                    {transaction.referenceId.substring(0, 8)}...
                </Button>
            )
        }
    },
    {
        key: 'createdBy',
        label: 'Created By',
        sortable: true,
        filterable: true,
        filterType: 'text',
        render: (transaction) => (
            <span className="text-sm truncate max-w-[100px]" title={transaction.createdBy}>
        {transaction.createdBy.replace(/^(token:|user:)/, '')}
      </span>
        )
    },
    {
        key: 'createdAt',
        label: 'Date',
        sortable: true,
        filterable: true,
        filterType: 'date',
        render: (transaction) => formatApiDate(transaction.createdAt, true)
    }
]

// Remove unused mass actions variable

interface InventoryPageProps {
    transactions?: IPaginatedResponse<InventoryTransaction> | null;
    filters?: {
        sort?: string;
        direction?: 'asc' | 'desc';
        transactionType?: string;
        tableId?: string;
        dateFrom?: string;
        dateTo?: string;
        createdBy?: string;
    };
    stockAlerts?: Array<{
        itemId: string;
        tableName: string;
        itemName: string;
        currentQuantity: number;
        alertType: 'low_stock' | 'out_of_stock' | 'negative_stock';
    }> | null;
}

export default function InventoryPage({transactions, filters, stockAlerts}: InventoryPageProps) {
    // Helper function to extract item name from transaction data
    const extractItemNameFromTransaction = (transaction: InventoryTransaction) => {
        const data = transaction.newData || transaction.previousData
        if (!data) return null

        // Common name fields to try first
        const nameFields = ['name', 'productName', 'itemName', 'title', 'description']
        for (const field of nameFields) {
            if (data[field] && typeof data[field] === 'string') {
                return data[field]
            }
        }

        // If no common name field, use first string field
        for (const [key, value] of Object.entries(data)) {
            if (typeof value === 'string' && value.trim() && key !== 'id') {
                return value
            }
        }

        return null
    }

    // Calculate stock alerts from actual transaction data if not provided
    const calculateStockAlerts = () => {
        if (stockAlerts) return stockAlerts
        if (!transactions?.data?.length) return []

        // Group transactions by table and item to calculate current stock levels
        const stockLevels = new Map<string, {
            tableName: string;
            itemName: string;
            currentQuantity: number;
            tableId: string;
            itemId: string;
        }>()

        // Process transactions to calculate current stock
        transactions.data.forEach(transaction => {
            const key = `${transaction.tableId}-${transaction.itemId}`
            const existing = stockLevels.get(key)

            if (!existing) {
                const itemName = extractItemNameFromTransaction(transaction) || 'Unknown Item'
                stockLevels.set(key, {
                    tableName: transaction.tableName,
                    itemName: itemName,
                    currentQuantity: transaction.newData?.qty || 0,
                    tableId: transaction.tableId,
                    itemId: transaction.itemId
                })
            } else {
                // Update quantity based on transaction type
                if (transaction.quantityChange) {
                    existing.currentQuantity += transaction.quantityChange
                }
            }
        })

        // Generate alerts based on stock levels
        const alerts: Array<{
            itemId: string;
            tableName: string;
            itemName: string;
            currentQuantity: number;
            alertType: 'low_stock' | 'out_of_stock' | 'negative_stock';
        }> = []

        stockLevels.forEach((stock) => {
            if (stock.currentQuantity < 0) {
                alerts.push({
                    itemId: stock.itemId,
                    tableName: stock.tableName,
                    itemName: stock.itemName,
                    currentQuantity: stock.currentQuantity,
                    alertType: 'negative_stock'
                })
            } else if (stock.currentQuantity === 0) {
                alerts.push({
                    itemId: stock.itemId,
                    tableName: stock.tableName,
                    itemName: stock.itemName,
                    currentQuantity: stock.currentQuantity,
                    alertType: 'out_of_stock'
                })
            } else if (stock.currentQuantity <= 5) { // Low stock threshold
                alerts.push({
                    itemId: stock.itemId,
                    tableName: stock.tableName,
                    itemName: stock.itemName,
                    currentQuantity: stock.currentQuantity,
                    alertType: 'low_stock'
                })
            }
        })

        return alerts
    }

    const currentStockAlerts = calculateStockAlerts()

    return (
        <div className="space-y-6">
            {/* Stock Alerts */}
            {currentStockAlerts.length > 0 && (
                <Alert
                    color="warning"
                    style="soft"
                    className="mb-4 flex justify-between items-center gap-2"
                >
                    <div className="flex flex-col">
                        <h3 className="font-semibold">Stock Alerts</h3>
                        <div className="text-sm mt-1">
                            {currentStockAlerts.length} items require attention
                        </div>
                    </div>
                    <Button
                        size="sm"
                        color="warning"
                        style="soft"
                        onClick={() => window.location.href = '/dashboard/sales/inventory/alerts'}
                    >
                        View All Alerts
                    </Button>
                </Alert>
            )}

            {/* Inventory Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardBody className="text-center">
                        <div className="text-sm font-medium text-base-content/70">Total Transactions</div>
                        <div className="text-3xl font-bold text-primary mt-2">
                            {transactions?.total || 0}
                        </div>
                        <div className="text-xs text-base-content/50 mt-1">All inventory changes</div>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody className="text-center">
                        <div className="text-sm font-medium text-base-content/70">Sales Today</div>
                        <div className="text-3xl font-bold text-success mt-2">
                            {transactions?.data.filter(t =>
                                t.transactionType === 'sale' &&
                                new Date(t.createdAt).toDateString() === new Date().toDateString()
                            ).length || 0}
                        </div>
                        <div className="text-xs text-base-content/50 mt-1">Items sold today</div>
                    </CardBody>
                </Card>

                <Card className="hover:bg-base-300 transition-colors cursor-pointer" onClick={() => window.location.href = '/dashboard/sales/inventory/alerts'}>
                    <CardBody className="text-center">
                        <div className="text-sm font-medium text-base-content/70">Stock Alerts</div>
                        <div className="text-3xl font-bold text-warning mt-2">
                            {currentStockAlerts.length}
                        </div>
                        <div className="text-xs text-base-content/50 mt-1">Click to view all alerts</div>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody className="text-center">
                        <div className="text-sm font-medium text-base-content/70">Tables Tracked</div>
                        <div className="text-3xl font-bold text-info mt-2">
                            {new Set(transactions?.data.map(t => t.tableId) || []).size}
                        </div>
                        <div className="text-xs text-base-content/50 mt-1">Active tables</div>
                    </CardBody>
                </Card>
            </div>


            {/* Inventory Transactions Table */}
            <ModelList<InventoryTransaction>
                title="Inventory Transactions"
                items={transactions || null}
                filters={filters || {}}
                columns={inventoryColumns}
                createRoute={null} // No creation for audit trail
                editRoute={() => '#'} // No edit for transactions
                deleteRoute={() => '#'} // No individual delete for audit trail
                massActionRoute=""
                massActions={[]}
                dataEndpoint="/api/sales/inventory"
                compactPagination={true}
            />

            {/* Clear All Confirmation Modal */}
            <Modal id="clear-all-modal">
                <ModalBox>
                    <h3 className="font-bold text-lg">Clear All Inventory Transactions</h3>
                    <p className="py-4">
                        Are you sure you want to clear all inventory transactions? This will delete{' '}
                        <span className="font-semibold text-error">
                            {transactions?.total || transactions?.data?.length || 0} transactions
                        </span>
                        {Object.keys(filters || {}).some(key => filters![key as keyof typeof filters]) && (
                            <span className="text-warning"> matching the current filters</span>
                        )}.
                    </p>
                    <p className="text-sm text-base-content/70">
                        <strong>This action cannot be undone.</strong>
                    </p>
                    <ModalAction>
                        <Button
                            color="error"
                            onClick={() => {
                                // Build query params from current filters
                                const queryParams = new URLSearchParams();
                                if (filters) {
                                    Object.entries(filters).forEach(([key, value]) => {
                                        if (value) queryParams.append(key, value as string);
                                    });
                                }

                                // Call clear all endpoint
                                fetch(`/api/inventory/clear-all?${queryParams.toString()}`, {
                                    method: 'DELETE',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    }
                                })
                                .then(response => {
                                    if (response.ok) {
                                        window.location.reload();
                                    } else {
                                        // Close modal and show error (could be improved with better error handling)
                                        const modal = document.getElementById('clear-all-modal') as HTMLDialogElement;
                                        modal?.close();
                                        alert('Failed to clear transactions. Please try again.');
                                    }
                                })
                                .catch(error => {
                                    console.error('Clear all error:', error);
                                    const modal = document.getElementById('clear-all-modal') as HTMLDialogElement;
                                    modal?.close();
                                    alert('Failed to clear transactions. Please try again.');
                                });
                            }}
                        >
                            Clear All
                        </Button>
                        <form method="dialog">
                            <Button style="ghost">Cancel</Button>
                        </form>
                    </ModalAction>
                </ModalBox>
                <ModalBackdrop />
            </Modal>
        </div>
    )
}

export const metadata = {
    title: 'Inventory Tracking',
    description: 'Monitor inventory changes, track stock levels, and view transaction audit trail'
}
