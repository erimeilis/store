/**
 * Sales Chart Component
 * Simple CSS-based charts for sales data visualization
 */

import React from 'react';
import { SalesByDate, TopSellingItem } from '@/types/sales';
import { formatCurrency } from '@/lib/date-utils';

interface SalesChartProps {
  data: SalesByDate[];
  title?: string;
  height?: number;
}

/**
 * Simple bar chart using CSS for sales trends
 */
export function SalesTrendsChart({ data, title = 'Sales Trends', height = 200 }: SalesChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-48 flex items-center justify-center bg-base-200 rounded-lg">
        <div className="text-center text-base-content/60">
          <div className="text-2xl mb-2">📊</div>
          <div>No sales data available</div>
        </div>
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map(d => d.revenue));
  const maxSales = Math.max(...data.map(d => d.sales_count));

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-2" style={{ height: `${height}px` }}>
        {data.slice(-7).map((item, index) => {
          const revenueHeight = (item.revenue / maxRevenue) * (height - 60);
          const salesHeight = (item.sales_count / maxSales) * (height - 60);

          return (
            <div key={item.date} className="flex items-end space-x-2">
              <div className="flex-shrink-0 w-16 text-xs text-base-content/60">
                {new Date(item.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })}
              </div>

              <div className="flex-1 flex items-end space-x-1">
                {/* Revenue Bar */}
                <div className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-primary rounded-t-sm transition-all duration-300 hover:bg-primary-focus"
                    style={{ height: `${Math.max(revenueHeight, 4)}px` }}
                    title={`Revenue: ${formatCurrency(item.revenue)}`}
                  />
                  <div className="text-xs text-center mt-1 text-base-content/60">
                    {formatCurrency(item.revenue)}
                  </div>
                </div>

                {/* Sales Count Bar */}
                <div className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-secondary rounded-t-sm transition-all duration-300 hover:bg-secondary-focus"
                    style={{ height: `${Math.max(salesHeight, 4)}px` }}
                    title={`Sales: ${item.sales_count}`}
                  />
                  <div className="text-xs text-center mt-1 text-base-content/60">
                    {item.sales_count}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex justify-center space-x-4 mt-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-primary rounded"></div>
          <span className="text-sm">Revenue</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-secondary rounded"></div>
          <span className="text-sm">Sales Count</span>
        </div>
      </div>
    </div>
  );
}

interface TopItemsChartProps {
  data: TopSellingItem[];
  title?: string;
}

/**
 * Horizontal bar chart for top selling items
 */
export function TopItemsChart({ data, title = 'Top Selling Items' }: TopItemsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-48 flex items-center justify-center bg-base-200 rounded-lg">
        <div className="text-center text-base-content/60">
          <div className="text-2xl mb-2">🏆</div>
          <div>No top items data available</div>
        </div>
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map(d => d.total_revenue));

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-3">
        {data.slice(0, 5).map((item, index) => {
          const widthPercentage = (item.total_revenue / maxRevenue) * 100;

          return (
            <div key={item.item_id} className="flex items-center space-x-3">
              {/* Rank */}
              <div className="w-6 h-6 rounded-full bg-primary text-primary-content flex items-center justify-center text-xs font-bold flex-shrink-0">
                {index + 1}
              </div>

              {/* Item Info */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate" title={item.item_name}>
                  {item.item_name}
                </div>
                <div className="text-xs text-base-content/60">
                  {item.table_name} • {item.quantity_sold} sold
                </div>
              </div>

              {/* Progress Bar */}
              <div className="flex-1 max-w-[200px]">
                <div className="w-full bg-base-300 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-primary to-primary-focus h-2 rounded-full transition-all duration-500"
                    style={{ width: `${widthPercentage}%` }}
                  />
                </div>
              </div>

              {/* Revenue */}
              <div className="text-sm font-semibold text-right flex-shrink-0 w-20">
                {formatCurrency(item.total_revenue)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface DonutChartProps {
  data: Record<string, number>;
  title?: string;
  colors?: string[];
}

/**
 * Simple CSS-based donut chart for status distribution
 */
export function StatusDonutChart({
  data,
  title = 'Sales by Status',
  colors = ['#10b981', '#f59e0b', '#ef4444', '#06b6d4']
}: DonutChartProps) {
  const total = Object.values(data).reduce((sum, value) => sum + value, 0);

  if (total === 0) {
    return (
      <div className="w-full h-48 flex items-center justify-center bg-base-200 rounded-lg">
        <div className="text-center text-base-content/60">
          <div className="text-2xl mb-2">🍩</div>
          <div>No status data available</div>
        </div>
      </div>
    );
  }

  const entries = Object.entries(data);
  let cumulativePercentage = 0;

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>

      <div className="flex flex-col items-center">
        {/* Donut Chart using CSS Conic Gradient */}
        <div className="relative w-32 h-32 mb-4">
          <div
            className="w-full h-full rounded-full"
            style={{
              background: `conic-gradient(${entries.map(([key, value], index) => {
                const percentage = (value / total) * 100;
                const startAngle = cumulativePercentage;
                cumulativePercentage += percentage;
                return `${colors[index % colors.length]} ${startAngle}% ${cumulativePercentage}%`;
              }).join(', ')})`
            }}
          />
          <div className="absolute inset-4 bg-base-100 rounded-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-bold">{total}</div>
              <div className="text-xs text-base-content/60">Total</div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
          {entries.map(([key, value], index) => {
            const percentage = ((value / total) * 100).toFixed(1);

            return (
              <div key={key} className="flex items-center space-x-2 text-sm">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium capitalize truncate">{key}</div>
                  <div className="text-xs text-base-content/60">
                    {value} ({percentage}%)
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Sales summary cards component
 */
interface SummaryCardsProps {
  summary: {
    total_sales: number;
    total_revenue: number;
    total_items_sold: number;
    average_sale_amount?: number;
  };
}

export function SalesSummaryCards({ summary }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="stat bg-gradient-to-br from-primary to-primary-focus text-primary-content rounded-lg">
        <div className="stat-figure text-4xl opacity-75">💰</div>
        <div className="stat-title text-primary-content/80">Total Revenue</div>
        <div className="stat-value text-2xl">{formatCurrency(summary.total_revenue)}</div>
        <div className="stat-desc text-primary-content/70">
          {summary.average_sale_amount && `Avg: ${formatCurrency(summary.average_sale_amount)}`}
        </div>
      </div>

      <div className="stat bg-gradient-to-br from-secondary to-secondary-focus text-secondary-content rounded-lg">
        <div className="stat-figure text-4xl opacity-75">🛍️</div>
        <div className="stat-title text-secondary-content/80">Total Sales</div>
        <div className="stat-value text-2xl">{summary.total_sales.toLocaleString()}</div>
        <div className="stat-desc text-secondary-content/70">Transactions</div>
      </div>

      <div className="stat bg-gradient-to-br from-accent to-accent-focus text-accent-content rounded-lg">
        <div className="stat-figure text-4xl opacity-75">📦</div>
        <div className="stat-title text-accent-content/80">Items Sold</div>
        <div className="stat-value text-2xl">{summary.total_items_sold.toLocaleString()}</div>
        <div className="stat-desc text-accent-content/70">Total quantity</div>
      </div>

      <div className="stat bg-gradient-to-br from-neutral to-neutral-focus text-neutral-content rounded-lg">
        <div className="stat-figure text-4xl opacity-75">📊</div>
        <div className="stat-title text-neutral-content/80">Performance</div>
        <div className="stat-value text-lg">
          {summary.average_sale_amount ? formatCurrency(summary.average_sale_amount) : '-'}
        </div>
        <div className="stat-desc text-neutral-content/70">Average sale</div>
      </div>
    </div>
  );
}