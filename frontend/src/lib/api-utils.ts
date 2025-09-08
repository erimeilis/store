/**
 * API Utilities
 * Shared utilities for API data transformation and pagination
 */

import { PaginatedResponse } from '../types/models.js'

/**
 * Generate pagination links array for page navigation
 */
function generatePaginationLinks(currentPage: number, totalPages: number) {
  const links = []
  
  for (let i = 1; i <= totalPages; i++) {
    links.push({
      url: `?page=${i}`,
      label: i.toString(),
      active: i === currentPage
    })
  }
  
  return links
}

/**
 * Transform backend response to frontend PaginatedResponse format
 * Handles both users format {data: [...], current_page: ...} and items format {items: [...], pagination: {...}}
 */
export function transformPaginatedResponse<T>(backendResponse: any, itemTransformer?: (item: any) => T): PaginatedResponse<T> | null {
  if (!backendResponse) return null

  // Users API format: {data: [...], current_page: 1, last_page: 1, per_page: 10, total: 2}
  if (backendResponse.data && backendResponse.current_page !== undefined) {
    const items = itemTransformer 
      ? backendResponse.data.map(itemTransformer)
      : backendResponse.data

    return {
      data: items,
      current_page: backendResponse.current_page,
      last_page: backendResponse.last_page,
      per_page: backendResponse.per_page,
      total: backendResponse.total,
      from: backendResponse.total > 0 ? (backendResponse.current_page - 1) * backendResponse.per_page + 1 : null,
      to: backendResponse.total > 0 ? Math.min(backendResponse.current_page * backendResponse.per_page, backendResponse.total) : null,
      links: generatePaginationLinks(backendResponse.current_page, backendResponse.last_page),
      prev_page_url: backendResponse.current_page > 1 ? `?page=${backendResponse.current_page - 1}` : null,
      next_page_url: backendResponse.current_page < backendResponse.last_page ? `?page=${backendResponse.current_page + 1}` : null,
      last_page_url: backendResponse.last_page > 1 ? `?page=${backendResponse.last_page}` : null
    }
  }

  // Items API format: {items: [...], pagination: {page: 1, limit: 10, total: 10, totalPages: 1, ...}}
  if (backendResponse.items && backendResponse.pagination) {
    const items = itemTransformer 
      ? backendResponse.items.map(itemTransformer)
      : backendResponse.items

    return {
      data: items,
      current_page: backendResponse.pagination.page,
      last_page: backendResponse.pagination.totalPages,
      per_page: backendResponse.pagination.limit,
      total: backendResponse.pagination.total,
      from: backendResponse.pagination.total > 0 ? (backendResponse.pagination.page - 1) * backendResponse.pagination.limit + 1 : null,
      to: backendResponse.pagination.total > 0 ? Math.min(backendResponse.pagination.page * backendResponse.pagination.limit, backendResponse.pagination.total) : null,
      links: generatePaginationLinks(backendResponse.pagination.page, backendResponse.pagination.totalPages),
      prev_page_url: backendResponse.pagination.hasPrevPage ? `?page=${backendResponse.pagination.page - 1}` : null,
      next_page_url: backendResponse.pagination.hasNextPage ? `?page=${backendResponse.pagination.page + 1}` : null,
      last_page_url: backendResponse.pagination.totalPages > 1 ? `?page=${backendResponse.pagination.totalPages}` : null
    }
  }

  return null
}

/**
 * Item transformer for dashboard items - extracts price, quantity, category from JSON data field
 */
export function transformDashboardItem(item: any) {
  let price = 0
  let category = ''
  let quantity = 0
  
  try {
    const data = JSON.parse(item.data || '{}')
    price = data.price || 0
    category = data.category || ''
    quantity = data.quantity || 0
  } catch {
    // If parsing fails, use defaults
  }
  
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    price,
    quantity,
    category,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  }
}

/**
 * Generic API fetch with authentication
 */
export async function fetchAPI(url: string, token: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  })
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`)
  }
  
  return response.json()
}