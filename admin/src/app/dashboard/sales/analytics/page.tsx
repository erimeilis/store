/**
 * Sales Analytics Page Component
 * Comprehensive sales reporting and analytics dashboard
 */

import React from 'react'
import {SalesAnalytics, SalesSummary} from '@/types/sales'
import {formatApiDate, formatCurrency} from '@/lib/date-utils'
import {SalesSummaryCards, SalesTrendsChart, StatusDonutChart, TopItemsChart} from '@/components/sales/SalesChart'
import {Card, CardBody} from '@/components/ui/card'
import {IconCash, IconShoppingCart, IconChartLine} from '@tabler/icons-react'

interface SalesAnalyticsPageProps {
    analytics?: SalesAnalytics | null;
    summary?: SalesSummary | null;
    dateRange?: {
        from?: string;
        to?: string;
    };
}

export default function SalesAnalyticsPage({
                                               analytics,
                                               dateRange
                                           }: SalesAnalyticsPageProps) {
    // Use real data or show empty state if no data is provided

    const defaultAnalytics: SalesAnalytics = {
        totalSales: 0,
        totalRevenue: 0,
        totalItemsSold: 0,
        averageSaleAmount: 0,
        salesByStatus: {
            completed: 0,
            pending: 0,
            cancelled: 0,
            refunded: 0
        },
        revenueByStatus: {
            completed: 0,
            pending: 0,
            cancelled: 0,
            refunded: 0
        },
        topSellingItems: [],
        salesByDate: []
    }

    const actualAnalytics = analytics || defaultAnalytics

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Sales Analytics</h1>
                    <p className="text-base-content/60 mt-2">
                        {dateRange?.from && dateRange?.to
                            ? `Analytics for ${formatApiDate(dateRange.from)} - ${formatApiDate(dateRange.to)}`
                            : 'Comprehensive sales performance overview'
                        }
                    </p>
                </div>
            </div>

            {/* Summary Cards */}
            <SalesSummaryCards summary={actualAnalytics}/>

            {/* Main Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales by Status */}
                <Card shadow="lg">
                    <CardBody>
                        <StatusDonutChart data={actualAnalytics.salesByStatus}/>
                    </CardBody>
                </Card>

                {/* Top Selling Items */}
                <Card shadow="lg">
                    <CardBody>
                        <TopItemsChart data={actualAnalytics.topSellingItems}/>
                    </CardBody>
                </Card>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="stat bg-base-200 rounded-lg">
                    <div className="stat-figure text-primary">
                        <IconCash size={32} />
                    </div>
                    <div className="stat-title">Total Revenue</div>
                    <div className="stat-value text-primary">{formatCurrency(actualAnalytics.totalRevenue)}</div>
                    <div className="stat-desc">Across all transactions</div>
                </div>

                <div className="stat bg-base-200 rounded-lg">
                    <div className="stat-figure text-secondary">
                        <IconShoppingCart size={32} />
                    </div>
                    <div className="stat-title">Items Sold</div>
                    <div className="stat-value text-secondary">{actualAnalytics.totalItemsSold.toLocaleString()}</div>
                    <div className="stat-desc">Total quantity sold</div>
                </div>

                <div className="stat bg-base-200 rounded-lg">
                    <div className="stat-figure text-accent">
                        <IconChartLine size={32} />
                    </div>
                    <div className="stat-title">Avg Sale Amount</div>
                    <div className="stat-value text-accent">{formatCurrency(actualAnalytics.averageSaleAmount)}</div>
                    <div className="stat-desc">Per transaction</div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card shadow="lg">
                    <CardBody>
                        <SalesTrendsChart
                            data={actualAnalytics.salesByDate}
                            title="Sales Trends"
                        />
                    </CardBody>
                </Card>

                <Card shadow="lg">
                    <CardBody>
                        <StatusDonutChart
                            data={actualAnalytics.revenueByStatus}
                            title="Revenue by Status"
                            colors={['#10b981', '#f59e0b', '#ef4444', '#06b6d4']}
                        />
                    </CardBody>
                </Card>
            </div>
        </div>
    )
}


export const metadata = {
    title: 'Sales Analytics',
    description: 'Comprehensive sales performance analytics and reporting'
}
