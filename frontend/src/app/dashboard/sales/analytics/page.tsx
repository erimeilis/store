/**
 * Sales Analytics Page Component
 * Comprehensive sales reporting and analytics dashboard
 */

import React from 'react';
import { SalesAnalytics, SalesSummary } from '@/types/sales';
import { formatCurrency, formatApiDate } from '@/lib/date-utils';
import {
  SalesTrendsChart,
  TopItemsChart,
  StatusDonutChart,
  SalesSummaryCards
} from '@/components/sales/SalesChart';

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
  summary,
  dateRange
}: SalesAnalyticsPageProps) {
  // Mock data for demonstration if no real data is provided
  const mockSummary: SalesSummary = summary || {
    today: { total_sales: 5, total_revenue: 1250.00, total_items_sold: 12 },
    this_week: { total_sales: 34, total_revenue: 8750.00, total_items_sold: 89 },
    this_month: { total_sales: 142, total_revenue: 35600.00, total_items_sold: 378 },
    all_time: { total_sales: 1247, total_revenue: 156800.00, total_items_sold: 3456, average_sale_amount: 125.74 },
    top_selling_items: [],
    recent_sales_by_date: []
  };

  const mockAnalytics: SalesAnalytics = analytics || {
    total_sales: mockSummary.all_time.total_sales,
    total_revenue: mockSummary.all_time.total_revenue,
    total_items_sold: mockSummary.all_time.total_items_sold,
    average_sale_amount: mockSummary.all_time.average_sale_amount,
    sales_by_status: {
      completed: 1100,
      pending: 47,
      cancelled: 85,
      refunded: 15
    },
    revenue_by_status: {
      completed: 145600.00,
      pending: 5890.00,
      cancelled: 4200.00,
      refunded: 1110.00
    },
    top_selling_items: [
      { item_id: '1', table_name: 'Electronics', item_name: 'Wireless Headphones', quantity_sold: 156, total_revenue: 23400.00 },
      { item_id: '2', table_name: 'Books', item_name: 'JavaScript Guide', quantity_sold: 89, total_revenue: 2670.00 },
      { item_id: '3', table_name: 'Clothing', item_name: 'Cotton T-Shirt', quantity_sold: 203, total_revenue: 6090.00 }
    ],
    sales_by_date: []
  };

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

        <div className="flex gap-2">
          <button className="btn btn-outline">
            📊 Export Report
          </button>
          <button className="btn btn-primary">
            📅 Date Range
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <SalesSummaryCards summary={mockAnalytics} />

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Status */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <StatusDonutChart data={mockAnalytics.sales_by_status} />
          </div>
        </div>

        {/* Top Selling Items */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <TopItemsChart data={mockAnalytics.top_selling_items} />
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-figure text-primary">
            <div className="text-3xl">💰</div>
          </div>
          <div className="stat-title">Total Revenue</div>
          <div className="stat-value text-primary">{formatCurrency(mockAnalytics.total_revenue)}</div>
          <div className="stat-desc">Across all transactions</div>
        </div>

        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-figure text-secondary">
            <div className="text-3xl">🛍️</div>
          </div>
          <div className="stat-title">Items Sold</div>
          <div className="stat-value text-secondary">{mockAnalytics.total_items_sold.toLocaleString()}</div>
          <div className="stat-desc">Total quantity sold</div>
        </div>

        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-figure text-accent">
            <div className="text-3xl">📊</div>
          </div>
          <div className="stat-title">Avg Sale Amount</div>
          <div className="stat-value text-accent">{formatCurrency(mockAnalytics.average_sale_amount)}</div>
          <div className="stat-desc">Per transaction</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <SalesTrendsChart
              data={[
                { date: '2025-09-12', sales_count: 8, revenue: 1250 },
                { date: '2025-09-13', sales_count: 12, revenue: 1890 },
                { date: '2025-09-14', sales_count: 6, revenue: 950 },
                { date: '2025-09-15', sales_count: 15, revenue: 2340 },
                { date: '2025-09-16', sales_count: 10, revenue: 1670 },
                { date: '2025-09-17', sales_count: 18, revenue: 2890 },
                { date: '2025-09-18', sales_count: 5, revenue: 780 }
              ]}
              title="Last 7 Days Sales Trends"
            />
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <StatusDonutChart
              data={mockAnalytics.revenue_by_status}
              title="Revenue by Status"
              colors={['#10b981', '#f59e0b', '#ef4444', '#06b6d4']}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function for status badge classes
function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'completed': return 'badge-success';
    case 'pending': return 'badge-warning';
    case 'cancelled': return 'badge-error';
    case 'refunded': return 'badge-info';
    default: return 'badge-neutral';
  }
}

export const metadata = {
  title: 'Sales Analytics',
  description: 'Comprehensive sales performance analytics and reporting'
};