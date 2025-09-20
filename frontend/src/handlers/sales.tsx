/**
 * Sales Handler - Server-side data fetching for sales management
 * Connects frontend components with backend sales API
 */

import type { Context } from 'hono';
import type { Env, Variables } from '@/types/hono';
import { Sale, SalesAnalytics, SalesSummary, SaleListQuery } from '@/types/sales';
import { IPaginatedResponse } from '@/types/models';
import { renderDashboardPage, buildPageProps } from '@/lib/handler-utils';

// Sales API base URL - will be retrieved from context environment

/**
 * API client with authentication headers
 */
class SalesAPIClient {
  private baseUrl: string;
  private authToken: string;

  constructor(baseUrl: string, authToken: string) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    return response.json();
  }

  async getSales(query: SaleListQuery = {}): Promise<IPaginatedResponse<Sale>> {
    const searchParams = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });

    const endpoint = `/api/sales${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request<IPaginatedResponse<Sale>>(endpoint);
  }

  async getSale(id: string): Promise<{ sale: Sale }> {
    return this.request<{ sale: Sale }>(`/api/sales/${id}`);
  }

  async getSalesAnalytics(params: {
    date_from?: string;
    date_to?: string;
    table_id?: string;
  } = {}): Promise<SalesAnalytics> {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        searchParams.append(key, value);
      }
    });

    const endpoint = `/api/sales/analytics${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request<SalesAnalytics>(endpoint);
  }

  async getSalesSummary(): Promise<SalesSummary> {
    return this.request<SalesSummary>('/api/sales/summary');
  }

  async getInventoryTransactions(query: any = {}): Promise<any> {
    const searchParams = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });

    const endpoint = `/api/inventory/transactions${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request<any>(endpoint);
  }

  async getStockAlerts(params: {
    table_id?: string;
    low_stock_threshold?: number;
  } = {}): Promise<any> {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const endpoint = `/api/inventory/stock-check${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request<any>(endpoint);
  }
}

/**
 * Get authentication token from environment or headers
 */
function getAuthToken(c: Context): string {
  // For development, use the admin token from environment
  const devToken = c.env?.ADMIN_ACCESS_TOKEN;

  if (devToken) {
    return devToken;
  }

  // In production, this would come from user session/cookies
  const authHeader = c.req.header('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Fallback - this should be replaced with proper authentication
  return 'default-admin-token';
}

/**
 * Get API base URL from context environment
 */
function getApiBaseUrl(c: Context): string {
  return c.env?.API_URL || 'http://localhost:8787';
}

/**
 * Handler for sales list page
 */
export async function handleSalesListPage(c: Context<{ Bindings: Env; Variables: Variables }>) {
  const user = c.get('user');

  try {
    const authToken = getAuthToken(c);
    const apiBaseUrl = getApiBaseUrl(c);
    const apiClient = new SalesAPIClient(apiBaseUrl, authToken);

    // Extract query parameters
    const query: SaleListQuery = {
      page: parseInt(c.req.query('page') || '1'),
      limit: parseInt(c.req.query('limit') || '50'),
      sort_by: c.req.query('sort_by') as any || 'created_at',
      sort_order: c.req.query('sort_order') as any || 'desc',
      sale_status: c.req.query('sale_status') as any,
      table_id: c.req.query('table_id'),
      customer_id: c.req.query('customer_id'),
      date_from: c.req.query('date_from'),
      date_to: c.req.query('date_to'),
      search: c.req.query('search')
    };

    // Fetch sales data
    const sales = await apiClient.getSales(query);

    // Build props and render page
    const pageProps = buildPageProps(user, c, {
      sales,
      filters: {
        sort: query.sort_by,
        direction: query.sort_order,
        sale_status: query.sale_status,
        table_id: query.table_id,
        customer_id: query.customer_id,
        date_from: query.date_from,
        date_to: query.date_to
      }
    });

    return renderDashboardPage(c, '/dashboard/sales', pageProps);
  } catch (error) {
    console.error('Error fetching sales data:', error);

    // Return mock data for development
    const pageProps = buildPageProps(user, c, {
      sales: {
        data: [],
        meta: {
          page: 1,
          limit: 50,
          total: 0,
          totalPages: 0
        }
      },
      filters: {}
    });

    return renderDashboardPage(c, '/dashboard/sales', pageProps);
  }
}

/**
 * Handler for sales analytics page
 */
export async function handleSalesAnalyticsPage(c: Context<{ Bindings: Env; Variables: Variables }>) {
  const user = c.get('user');

  try {
    const authToken = getAuthToken(c);
    const apiBaseUrl = getApiBaseUrl(c);
    const apiClient = new SalesAPIClient(apiBaseUrl, authToken);

    const params = {
      date_from: c.req.query('date_from'),
      date_to: c.req.query('date_to'),
      table_id: c.req.query('table_id')
    };

    // Fetch analytics data
    const [analytics, summary] = await Promise.all([
      apiClient.getSalesAnalytics(params),
      apiClient.getSalesSummary()
    ]);

    const pageProps = buildPageProps(user, c, {
      analytics,
      summary,
      dateRange: {
        from: params.date_from,
        to: params.date_to
      }
    });

    return renderDashboardPage(c, '/dashboard/sales/analytics', pageProps);
  } catch (error) {
    console.error('Error fetching sales analytics:', error);

    // Return null to use mock data in component
    const pageProps = buildPageProps(user, c, {
      analytics: null,
      summary: null,
      dateRange: {}
    });

    return renderDashboardPage(c, '/dashboard/sales/analytics', pageProps);
  }
}

/**
 * Handler for inventory tracking page
 */
export async function handleInventoryPage(c: Context<{ Bindings: Env; Variables: Variables }>) {
  const user = c.get('user');

  try {
    const authToken = getAuthToken(c);
    const apiBaseUrl = getApiBaseUrl(c);
    const apiClient = new SalesAPIClient(apiBaseUrl, authToken);

    const query = {
      page: parseInt(c.req.query('page') || '1'),
      limit: parseInt(c.req.query('limit') || '50'),
      sort_by: c.req.query('sort_by') || 'created_at',
      sort_order: c.req.query('sort_order') || 'desc',
      transaction_type: c.req.query('transaction_type'),
      table_id: c.req.query('table_id'),
      date_from: c.req.query('date_from'),
      date_to: c.req.query('date_to'),
      created_by: c.req.query('created_by')
    };

    // Fetch inventory data and stock alerts
    const [transactions, stockAlerts] = await Promise.all([
      apiClient.getInventoryTransactions(query),
      apiClient.getStockAlerts({ low_stock_threshold: 10 })
    ]);

    const pageProps = buildPageProps(user, c, {
      transactions,
      stockAlerts: stockAlerts.alerts || [],
      filters: {
        sort: query.sort_by,
        direction: query.sort_order,
        transaction_type: query.transaction_type,
        table_id: query.table_id,
        date_from: query.date_from,
        date_to: query.date_to,
        created_by: query.created_by
      }
    });

    return renderDashboardPage(c, '/dashboard/sales/inventory', pageProps);
  } catch (error) {
    console.error('Error fetching inventory data:', error);

    // Return empty data for development
    const pageProps = buildPageProps(user, c, {
      transactions: {
        data: [],
        meta: {
          page: 1,
          limit: 50,
          total: 0,
          totalPages: 0
        }
      },
      stockAlerts: [],
      filters: {}
    });

    return renderDashboardPage(c, '/dashboard/sales/inventory', pageProps);
  }
}

/**
 * Handler for individual sale details page
 */
export async function handleSaleDetailsPage(c: Context<{ Bindings: Env; Variables: Variables }>, saleId: string) {
  const user = c.get('user');

  try {
    const authToken = getAuthToken(c);
    const apiBaseUrl = getApiBaseUrl(c);
    const apiClient = new SalesAPIClient(apiBaseUrl, authToken);

    const { sale } = await apiClient.getSale(saleId);

    const pageProps = buildPageProps(user, c, { sale });

    return renderDashboardPage(c, `/dashboard/sales/${saleId}`, pageProps);
  } catch (error) {
    console.error('Error fetching sale details:', error);

    const pageProps = buildPageProps(user, c, { sale: null });

    return renderDashboardPage(c, `/dashboard/sales/${saleId}`, pageProps);
  }
}