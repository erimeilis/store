/**
 * Sales Handler - Server-side data fetching for sales management
 * Now includes both Sales and Rentals in unified transactions view
 */

import type { Context } from 'hono';
import type { Env, Variables } from '@/types/hono';
import { renderDashboardPage, buildPageProps, fetchHandlerData } from '@/lib/handler-utils';
import type { Sale } from '@/types/sales';
import type { Rental, UnifiedTransaction } from '@/types/rentals';

// API endpoints for sales (for future use)
const _SALES_API_ENDPOINTS = {
  sales: '/api/sales',
  rentals: '/api/rentals',
  salesAnalytics: '/api/sales/analytics',
  salesSummary: '/api/sales/summary',
  inventoryTransactions: '/api/inventory/transactions',
  stockCheck: '/api/inventory/stock-check'
};

/**
 * Extract a display name from item snapshot data
 */
function extractItemName(snapshot: Record<string, any> | null | undefined): string {
  if (!snapshot) return 'Unknown Item';

  // Common name fields to try first
  const nameFields = ['name', 'productName', 'itemName', 'title', 'description'];
  for (const field of nameFields) {
    if (snapshot[field] && typeof snapshot[field] === 'string') {
      return snapshot[field];
    }
  }

  // For phone numbers: combine number with country/area
  if (snapshot.number) {
    const parts = [snapshot.number];
    if (snapshot.country) parts.push(`(${snapshot.country})`);
    else if (snapshot.area) parts.push(`(${snapshot.area})`);
    return parts.join(' ');
  }

  // If no common name field, use first string field
  for (const [key, value] of Object.entries(snapshot)) {
    if (typeof value === 'string' && value.trim() && key !== 'id') {
      return value;
    }
  }

  return 'Unknown Item';
}

/**
 * Convert a sale to unified transaction format
 */
function saleToUnified(sale: Sale): UnifiedTransaction {
  return {
    id: sale.id,
    transactionNumber: sale.saleNumber,
    transactionType: 'sale',
    tableId: sale.tableId,
    tableName: sale.tableName,
    itemId: sale.itemId,
    itemName: extractItemName(sale.itemSnapshot),
    itemSnapshot: sale.itemSnapshot,
    customerId: sale.customerId,
    unitPrice: sale.unitPrice,
    quantity: sale.quantitySold,
    totalAmount: sale.totalAmount,
    status: sale.saleStatus,
    paymentMethod: sale.paymentMethod,
    notes: sale.notes,
    transactionDate: sale.createdAt,
    createdAt: sale.createdAt,
    updatedAt: sale.updatedAt
  };
}

/**
 * Convert a rental to unified transaction format
 * Returns array of transactions (1 for active, 2 for released - rent + release events)
 */
function rentalToUnified(rental: Rental): UnifiedTransaction[] {
  const transactions: UnifiedTransaction[] = [];
  const itemName = extractItemName(rental.itemSnapshot);
  const rentId = `${rental.id}-rent`;
  const releaseId = `${rental.id}-release`;

  // Always create the rent event
  transactions.push({
    id: rentId,
    transactionNumber: rental.rentalNumber,
    transactionType: 'rental',
    eventType: 'rent',
    tableId: rental.tableId,
    tableName: rental.tableName,
    itemId: rental.itemId,
    itemName,
    itemSnapshot: rental.itemSnapshot,
    customerId: rental.customerId,
    unitPrice: rental.unitPrice,
    quantity: 1,
    totalAmount: rental.unitPrice,
    status: rental.rentalStatus,
    paymentMethod: null,
    notes: rental.notes,
    transactionDate: rental.rentedAt,
    releasedAt: rental.releasedAt,
    relatedTransactionId: rental.releasedAt ? releaseId : undefined,
    createdAt: rental.createdAt,
    updatedAt: rental.updatedAt
  });

  // If released, also create the release event
  if (rental.releasedAt) {
    transactions.push({
      id: releaseId,
      transactionNumber: rental.rentalNumber,
      transactionType: 'rental',
      eventType: 'release',
      tableId: rental.tableId,
      tableName: rental.tableName,
      itemId: rental.itemId,
      itemName,
      itemSnapshot: rental.itemSnapshot,
      customerId: rental.customerId,
      unitPrice: 0, // Release doesn't cost anything
      quantity: 1,
      totalAmount: 0,
      status: 'released',
      paymentMethod: null,
      notes: rental.notes,
      transactionDate: rental.releasedAt,
      releasedAt: rental.releasedAt,
      relatedTransactionId: rentId,
      createdAt: rental.createdAt,
      updatedAt: rental.updatedAt
    });
  }

  return transactions;
}

/**
 * Handler for sales list page - now shows unified transactions (sales + rentals)
 */
export async function handleSalesListPage(c: Context<{ Bindings: Env; Variables: Variables }>) {
  const user = c.get('user');

  // Get pagination and filtering parameters
  const page = parseInt(c.req.query('page') || '1');
  const sort = c.req.query('sort') || 'createdAt';
  const direction = c.req.query('direction') || 'desc';

  // Extract filter parameters from frontend (filter_* format)
  const filterTransactionType = c.req.query('filter_transactionType') // 'sale' | 'rental' | ''
  const filterStatus = c.req.query('filter_status')
  const filterTableId = c.req.query('filter_tableId')
  const filterCustomerId = c.req.query('filter_customerId')
  const filterDateFrom = c.req.query('filter_dateFrom')
  const filterDateTo = c.req.query('filter_dateTo')
  const filterSearch = c.req.query('filter_search')

  // Build additional parameters for sales API
  const salesParams: Record<string, string> = {
    sort_by: sort,
    sort_order: direction
  };
  if (filterStatus) salesParams.saleStatus = filterStatus;
  if (filterTableId) salesParams.tableId = filterTableId;
  if (filterCustomerId) salesParams.customerId = filterCustomerId;
  if (filterDateFrom) salesParams.date_from = filterDateFrom;
  if (filterDateTo) salesParams.date_to = filterDateTo;
  if (filterSearch) salesParams.search = filterSearch;

  // Build additional parameters for rentals API
  const rentalsParams: Record<string, string> = {
    sortBy: sort === 'createdAt' ? 'rentedAt' : sort,
    sortOrder: direction
  };
  if (filterStatus) rentalsParams.rentalStatus = filterStatus;
  if (filterTableId) rentalsParams.tableId = filterTableId;
  if (filterCustomerId) rentalsParams.customerId = filterCustomerId;
  if (filterDateFrom) rentalsParams.dateFrom = filterDateFrom;
  if (filterDateTo) rentalsParams.dateTo = filterDateTo;
  if (filterSearch) rentalsParams.search = filterSearch;

  // Fetch both sales and rentals in parallel (unless filtered to one type)
  const shouldFetchSales = !filterTransactionType || filterTransactionType === 'sale';
  const shouldFetchRentals = !filterTransactionType || filterTransactionType === 'rental';

  const [salesResponse, rentalsResponse] = await Promise.all([
    shouldFetchSales
      ? fetchHandlerData('/api/sales', c, { page, additionalParams: salesParams })
      : Promise.resolve({ data: [], total: 0 }),
    shouldFetchRentals
      ? fetchHandlerData('/api/rentals', c, { page, additionalParams: rentalsParams })
      : Promise.resolve({ data: [], total: 0 })
  ]);

  // Convert to unified transactions
  const salesData = (salesResponse as any)?.data || [];
  const rentalsData = (rentalsResponse as any)?.data || [];

  const unifiedSales: UnifiedTransaction[] = salesData.map((sale: Sale) => saleToUnified(sale));
  // flatMap because rentalToUnified returns array (rent + optional release events)
  const unifiedRentals: UnifiedTransaction[] = rentalsData.flatMap((rental: Rental) => rentalToUnified(rental));

  // Combine and sort by transaction date
  const allTransactions = [...unifiedSales, ...unifiedRentals].sort((a, b) => {
    const dateA = new Date(a.transactionDate).getTime();
    const dateB = new Date(b.transactionDate).getTime();
    return direction === 'desc' ? dateB - dateA : dateA - dateB;
  });

  // Build combined response with proper IPaginatedResponse structure
  const totalSales = (salesResponse as any)?.total || salesData.length;
  const totalRentals = (rentalsResponse as any)?.total || rentalsData.length;
  const totalItems = totalSales + totalRentals;
  const perPage = 50;
  const totalPages = Math.ceil(totalItems / perPage);

  const transactions = {
    // Required IPaginatedResponse fields
    data: allTransactions,
    currentPage: page,
    lastPage: totalPages,
    perPage: perPage,
    total: totalItems,
    from: totalItems > 0 ? (page - 1) * perPage + 1 : null,
    to: totalItems > 0 ? Math.min(page * perPage, totalItems) : null,
    links: Array.from({ length: totalPages }, (_, i) => ({
      url: `?page=${i + 1}`,
      label: String(i + 1),
      active: i + 1 === page
    })),
    prevPageUrl: page > 1 ? `?page=${page - 1}` : null,
    nextPageUrl: page < totalPages ? `?page=${page + 1}` : null,
    lastPageUrl: totalPages > 1 ? `?page=${totalPages}` : null,
    // Extra fields for stats display
    salesCount: totalSales,
    rentalsCount: totalRentals
  };

  const pageProps = buildPageProps(user, c, {
    transactions,
    sales: salesResponse, // Keep original for stats
    rentals: rentalsResponse, // Keep original for stats
    filters: {
      sort,
      direction,
      filterTransactionType,
      filterStatus,
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