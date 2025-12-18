/**
 * Inventory Alerts Page Component
 * Detailed view of all stock alerts requiring immediate attention
 */

import React from 'react'
import {formatApiDate} from '@/lib/date-utils'
import {IconAlertTriangle, IconExclamationCircle, IconPackage} from '@tabler/icons-react'
import {Button} from '@/components/ui/button'
import {Card, CardActions, CardBody} from '@/components/ui/card'
import {Badge} from '@/components/ui/badge'

// Stock alert interface
interface StockAlert {
    itemId: string;
    tableId: string;
    tableName: string;
    itemName: string;
    currentQuantity: number;
    alertType: 'low_stock' | 'out_of_stock' | 'negative_stock';
    lastTransactionDate?: string;
}

// Alert type configuration
const ALERT_TYPE_CONFIG = {
    negative_stock: {
        label: 'Negative Stock',
        icon: IconExclamationCircle,
        colorClass: 'text-error',
        cardColor: 'error' as const
    },
    out_of_stock: {
        label: 'Out of Stock',
        icon: IconPackage,
        colorClass: 'text-warning',
        cardColor: 'warning' as const
    },
    low_stock: {
        label: 'Low Stock',
        icon: IconAlertTriangle,
        colorClass: 'text-info',
        cardColor: 'info' as const
    }
}

interface InventoryAlertsPageProps {
    alerts?: StockAlert[];
    summary?: {
        total: number;
        negativeStock: number;
        outOfStock: number;
        lowStock: number;
    };
}

export default function InventoryAlertsPage({alerts = [], summary}: InventoryAlertsPageProps) {
    // Group alerts by type
    const alertsByType = alerts.reduce((acc, alert) => {
        if (!acc[alert.alertType]) {
            acc[alert.alertType] = []
        }
        acc[alert.alertType].push(alert)
        return acc
    }, {} as Record<string, StockAlert[]>)

    const alertTypes = Object.keys(ALERT_TYPE_CONFIG) as (keyof typeof ALERT_TYPE_CONFIG)[]

    // Calculate summary if not provided
    const summaryData = summary || {
        total: alerts.length,
        negativeStock: alertsByType.negative_stock?.length || 0,
        outOfStock: alertsByType.out_of_stock?.length || 0,
        lowStock: alertsByType.low_stock?.length || 0
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Stock Alerts</h1>
                    <p className="text-base-content/70 mt-1">
                        Items requiring immediate attention across all inventory tables
                    </p>
                </div>
                <Button
                    style="outline"
                    onClick={() => window.location.href = '/dashboard/sales/inventory'}
                >
                    ← Back to Inventory
                </Button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardBody className="text-center">
                        <div className="text-sm font-medium text-base-content/70">Total Alerts</div>
                        <div className="text-3xl font-bold text-primary mt-2">
                            {summaryData.total}
                        </div>
                        <div className="text-xs text-base-content/50 mt-1">Items needing attention</div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody className="text-center">
                        <div className="text-sm font-medium text-base-content/70">Negative Stock</div>
                        <div className="text-3xl font-bold text-primary mt-2">
                            {summaryData.negativeStock}
                        </div>
                        <div className="text-xs text-base-content/50 mt-1">Critical issues</div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody className="text-center">
                        <div className="text-sm font-medium text-base-content/70">Out of Stock</div>
                        <div className="text-3xl font-bold text-primary mt-2">
                            {summaryData.outOfStock}
                        </div>
                        <div className="text-xs text-base-content/50 mt-1">Need restocking</div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody className="text-center">
                        <div className="text-sm font-medium text-base-content/70">Low Stock</div>
                        <div className="text-3xl font-bold text-primary mt-2">
                            {summaryData.lowStock}
                        </div>
                        <div className="text-xs text-base-content/50 mt-1">Monitor closely</div>
                    </CardBody>
                </Card>
            </div>

            {/* Alerts by Type */}
            {alertTypes.map(alertType => {
                const typeAlerts = alertsByType[alertType]
                if (!typeAlerts || typeAlerts.length === 0) return null

                const config = ALERT_TYPE_CONFIG[alertType]
                const IconComponent = config.icon

                return (
                    <div key={alertType} className="space-y-4">
                        <div className="flex items-center gap-3">
                            <IconComponent size={24} className={config.colorClass}/>
                            <h2 className="text-2xl font-semibold">{config.label}</h2>
                            <Badge variant={config.cardColor}>
                                {typeAlerts.length} items
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {typeAlerts.map((alert, index) => (
                                <Card
                                    key={`${alert.itemId}-${index}`}
                                    shadow="lg"
                                    color={config.cardColor}
                                    style="soft"
                                >
                                    <CardBody className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg truncate" title={alert.itemName}>
                                                    {alert.itemName}
                                                </h3>
                                                <p className="text-sm opacity-80 mb-2">{alert.tableName}</p>

                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className="text-sm font-medium">Current Stock:</span>
                                                    <span className={`font-bold text-lg ${config.colorClass}`}>
                                                        {alert.currentQuantity}
                                                    </span>
                                                </div>

                                                {alert.lastTransactionDate && (
                                                    <p className="text-xs opacity-60">
                                                        Last updated: {formatApiDate(alert.lastTransactionDate, true)}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <IconComponent size={32} className={config.colorClass}/>
                                            </div>
                                        </div>

                                        <CardActions justify="end" className="mt-4">
                                            <Button
                                                size="sm"
                                                style="ghost"
                                                onClick={() => window.location.href = `/dashboard/tables/${alert.tableId}/data`}
                                            >
                                                View Table
                                            </Button>
                                        </CardActions>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>
                    </div>
                )
            })}

            {/* Empty State */}
            {alerts.length === 0 && (
                <div className="text-center py-12">
                    <IconPackage size={64} className="mx-auto mb-4 text-success"/>
                    <h2 className="text-2xl font-semibold mb-2">No Stock Alerts</h2>
                    <p className="text-base-content/70">
                        All inventory levels are within acceptable ranges.
                    </p>
                </div>
            )}
        </div>
    )
}

export const metadata = {
    title: 'Stock Alerts',
    description: 'Detailed view of all inventory alerts requiring immediate attention'
}
