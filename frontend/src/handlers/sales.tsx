/**
 * Sales Handler - Server-side data fetching for sales management
 */

import type { Context } from 'hono';
import type { Env, Variables } from '@/types/hono';
import { renderDashboardPage, buildPageProps, fetchHandlerData } from '@/lib/handler-utils';

// API endpoints for sales (for future use)
const _SALES_API_ENDPOINTS = {
  sales: '/api/sales',
  salesAnalytics: '/api/sales/analytics',
  salesSummary: '/api/sales/summary',
  inventoryTransactions: '/api/inventory/transactions',
  stockCheck: '/api/inventory/stock-check'
};

/**
 * Handler for sales list page
 */
export async function handleSalesListPage(c: Context<{ Bindings: Env; Variables: Variables }>) {
  const user = c.get('user');

  // Get pagination and filtering parameters
  const page = parseInt(c.req.query('page') || '1');
  const sort = c.req.query('sort') || 'createdAt';
  const direction = c.req.query('direction') || 'desc';

  // Build additional parameters for filtering using camelCase
  const additionalParams: Record<string, string> = {
    sortBy: sort,
    sortOrder: direction
  };
  if (c.req.query('saleStatus')) additionalParams.saleStatus = c.req.query('saleStatus')!;
  if (c.req.query('tableId')) additionalParams.tableId = c.req.query('tableId')!;
  if (c.req.query('customerId')) additionalParams.customerId = c.req.query('customerId')!;
  if (c.req.query('dateFrom')) additionalParams.dateFrom = c.req.query('dateFrom')!;
  if (c.req.query('dateTo')) additionalParams.dateTo = c.req.query('dateTo')!;
  if (c.req.query('search')) additionalParams.search = c.req.query('search')!;

  const sales = await fetchHandlerData('/api/sales', c, {
    page,
    additionalParams
  });

  const pageProps = buildPageProps(user, c, {
    sales,
    filters: {
      sort,
      direction,
      saleStatus: c.req.query('saleStatus'),
      tableId: c.req.query('tableId'),
      customerId: c.req.query('customerId'),
      dateFrom: c.req.query('dateFrom'),
      dateTo: c.req.query('dateTo'),
      search: c.req.query('search')
    }
  });

  return renderDashboardPage(c, '/dashboard/sales', pageProps);
}

/**
 * Handler for sales analytics page
 */
export async function handleSalesAnalyticsPage(c: Context<{ Bindings: Env; Variables: Variables }>) {
  const user = c.get('user');

  // Build additional parameters for analytics using camelCase
  const additionalParams: Record<string, string> = {};
  if (c.req.query('dateFrom')) additionalParams.dateFrom = c.req.query('dateFrom')!;
  if (c.req.query('dateTo')) additionalParams.dateTo = c.req.query('dateTo')!;
  if (c.req.query('tableId')) additionalParams.tableId = c.req.query('tableId')!;

  // Fetch analytics and summary data using universal utilities
  const [analytics, summary] = await Promise.all([
    fetchHandlerData('/api/sales/analytics', c, { additionalParams }),
    fetchHandlerData('/api/sales/summary', c, {})
  ]);

  const pageProps = buildPageProps(user, c, {
    analytics,
    summary,
    dateRange: {
      from: c.req.query('dateFrom'),
      to: c.req.query('dateTo')
    }
  });

  return renderDashboardPage(c, '/dashboard/sales/analytics', pageProps);
}

/**
 * Handler for inventory tracking page
 */
export async function handleInventoryPage(c: Context<{ Bindings: Env; Variables: Variables }>) {
  const user = c.get('user');

  try {
    // Get pagination and filtering parameters using universal system
    const page = parseInt(c.req.query('page') || '1')
    const sort = c.req.query('sort') || 'createdAt'
    const direction = c.req.query('direction') || 'desc'

    // Build additional parameters for filtering using camelCase
    console.log('🚨 HANDLER DEBUG: Using camelCase parameters!', { sort, direction })
    const additionalParams: Record<string, string> = {
      sortBy: sort,
      sortOrder: direction
    }

    // Map frontend filter parameters to backend API camelCase parameters
    if (c.req.query('filterTransactionType')) additionalParams.transactionType = c.req.query('filterTransactionType')!
    if (c.req.query('filterTableName')) additionalParams.tableNameSearch = c.req.query('filterTableName')!
    if (c.req.query('filterItemName')) additionalParams.itemSearch = c.req.query('filterItemName')!
    if (c.req.query('filterQuantityChange')) additionalParams.quantityChange = c.req.query('filterQuantityChange')!
    if (c.req.query('filterReferenceId')) additionalParams.referenceId = c.req.query('filterReferenceId')!
    if (c.req.query('filterCreatedBy')) additionalParams.createdBy = c.req.query('filterCreatedBy')!
    if (c.req.query('filterCreatedAt')) additionalParams.dateFrom = c.req.query('filterCreatedAt')!

    // Legacy parameter support (in case called directly) - convert to camelCase
    if (c.req.query('transactionType')) additionalParams.transactionType = c.req.query('transactionType')!
    if (c.req.query('tableId')) additionalParams.tableId = c.req.query('tableId')!
    if (c.req.query('dateFrom')) additionalParams.dateFrom = c.req.query('dateFrom')!
    if (c.req.query('dateTo')) additionalParams.dateTo = c.req.query('dateTo')!
    if (c.req.query('createdBy')) additionalParams.createdBy = c.req.query('createdBy')!

    // Use fetchHandlerData like other handlers
    const transactions = await fetchHandlerData('/api/inventory/transactions', c, {
      page,
      additionalParams
    });

    // Fetch stock alerts directly since this endpoint has custom response format
    const apiUrl = c.env?.API_URL || 'http://localhost:8787';
    const { fetchAPI } = await import('@/lib/api-utils');

    const stockUrl = new URL('/api/inventory/stock-check', apiUrl);
    stockUrl.searchParams.set('lowStockThreshold', '10');

    const stockAlertsData = await fetchAPI(
      stockUrl.toString(),
      c.env?.ADMIN_ACCESS_TOKEN || ''
    );
    const stockAlerts = (stockAlertsData as any)?.alerts || [];

    const pageProps = buildPageProps(user, c, {
      transactions,
      stockAlerts,
      filters: {
        sort,
        direction,
        // Frontend filter parameters (for ModelList component state)
        filterTransactionType: c.req.query('filterTransactionType'),
        filterTableName: c.req.query('filterTableName'),
        filterItemName: c.req.query('filterItemName'),
        filterQuantityChange: c.req.query('filterQuantityChange'),
        filterReferenceId: c.req.query('filterReferenceId'),
        filterCreatedBy: c.req.query('filterCreatedBy'),
        filterCreatedAt: c.req.query('filterCreatedAt'),
        // Legacy parameters (backward compatibility)
        transactionType: c.req.query('transactionType'),
        tableId: c.req.query('tableId'),
        dateFrom: c.req.query('dateFrom'),
        dateTo: c.req.query('dateTo'),
        createdBy: c.req.query('createdBy')
      }
    });

    return renderDashboardPage(c, '/dashboard/sales/inventory', pageProps);
  } catch (error) {
    console.error('Error fetching inventory data:', error);
    throw error;
  }
}

/**
 * Handler for inventory alerts page
 */
export async function handleInventoryAlertsPage(c: Context<{ Bindings: Env; Variables: Variables }>) {
  const user = c.get('user');

  try {
    // Fetch stock alerts directly since this endpoint has custom response format
    const apiUrl = c.env?.API_URL || 'http://localhost:8787';
    const { fetchAPI } = await import('@/lib/api-utils');

    const url = new URL('/api/inventory/stock-check', apiUrl);
    url.searchParams.set('lowStockThreshold', '10');
    url.searchParams.set('includeDetails', 'true');

    const stockAlertsData = await fetchAPI(
      url.toString(),
      c.env?.ADMIN_ACCESS_TOKEN || ''
    );

    const alerts = (stockAlertsData as any)?.alerts || [];

    const pageProps = buildPageProps(user, c, {
      alerts,
      summary: {
        total: alerts.length,
        negativeStock: alerts.filter((a: any) => a.alertType === 'negative_stock').length,
        outOfStock: alerts.filter((a: any) => a.alertType === 'out_of_stock').length,
        lowStock: alerts.filter((a: any) => a.alertType === 'low_stock').length
      }
    });

    return renderDashboardPage(c, '/dashboard/sales/inventory/alerts', pageProps);
  } catch (error) {
    console.error('Error fetching inventory alerts:', error);
    throw error;
  }
}

/**
 * Handler for individual sale details page
 */
export async function handleSaleDetailsPage(c: Context<{ Bindings: Env; Variables: Variables }>, saleId: string) {
  const user = c.get('user');

  try {
    // Fetch sale details using universal utilities
    const saleResponse = await fetchHandlerData(`/api/sales/${saleId}`, c, {});
    const sale = (saleResponse as any)?.sale || saleResponse;

    const pageProps = buildPageProps(user, c, { sale });

    return renderDashboardPage(c, `/dashboard/sales/${saleId}`, pageProps);
  } catch (error) {
    console.error('Error fetching sale details:', error);

    const pageProps = buildPageProps(user, c, { sale: null });

    return renderDashboardPage(c, `/dashboard/sales/${saleId}`, pageProps);
  }
}