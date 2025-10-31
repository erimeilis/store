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

  // Extract filter parameters from frontend (filter_* format)
  // Backend sales route expects direct params (no filter_ prefix)
  const filterSaleStatus = c.req.query('filter_saleStatus')
  const filterTableId = c.req.query('filter_tableId')
  const filterCustomerId = c.req.query('filter_customerId')
  const filterDateFrom = c.req.query('filter_dateFrom')
  const filterDateTo = c.req.query('filter_dateTo')
  const filterSearch = c.req.query('filter_search')

  // Build additional parameters - strip filter_ prefix for backend
  const additionalParams: Record<string, string> = {
    sort_by: sort,
    sort_order: direction
  };
  if (filterSaleStatus) additionalParams.saleStatus = filterSaleStatus;
  if (filterTableId) additionalParams.tableId = filterTableId;
  if (filterCustomerId) additionalParams.customerId = filterCustomerId;
  if (filterDateFrom) additionalParams.date_from = filterDateFrom;
  if (filterDateTo) additionalParams.date_to = filterDateTo;
  if (filterSearch) additionalParams.search = filterSearch;

  const sales = await fetchHandlerData('/api/sales', c, {
    page,
    additionalParams
  });

  const pageProps = buildPageProps(user, c, {
    sales,
    filters: {
      sort,
      direction,
      filterSaleStatus,
      filterTableId,
      filterCustomerId,
      filterDateFrom,
      filterDateTo,
      filterSearch
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
    // Get pagination and filtering parameters
    const page = parseInt(c.req.query('page') || '1')
    const sort = c.req.query('sort') || 'createdAt'
    const direction = c.req.query('direction') || 'desc'

    // Extract filter parameters from frontend (filter_* format)
    // Backend inventory route expects direct params (no filter_ prefix, camelCase)
    const filterTransactionType = c.req.query('filter_transactionType')
    const filterTableName = c.req.query('filter_tableName')
    const filterItemName = c.req.query('filter_itemName')
    const filterQuantityChange = c.req.query('filter_quantityChange')
    const filterReferenceId = c.req.query('filter_referenceId')
    const filterCreatedBy = c.req.query('filter_createdBy')
    const filterCreatedAt = c.req.query('filter_createdAt')

    // Build additional parameters - strip filter_ prefix, use backend expected names
    const additionalParams: Record<string, string> = {
      sortBy: sort,
      sortOrder: direction
    }

    // Map filter parameters to backend expected names
    if (filterTransactionType) additionalParams.transactionType = filterTransactionType
    if (filterTableName) additionalParams.tableNameSearch = filterTableName
    if (filterItemName) additionalParams.itemSearch = filterItemName
    if (filterQuantityChange) additionalParams.quantityChange = filterQuantityChange
    if (filterReferenceId) additionalParams.referenceId = filterReferenceId
    if (filterCreatedBy) additionalParams.createdBy = filterCreatedBy
    if (filterCreatedAt) additionalParams.dateFrom = filterCreatedAt

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
        // Pass filter values for ModelList component state
        filterTransactionType,
        filterTableName,
        filterItemName,
        filterQuantityChange,
        filterReferenceId,
        filterCreatedBy,
        filterCreatedAt
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