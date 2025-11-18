/**
 * API Utilities
 * Shared utilities for API data transformation and pagination
 */

import { PaginatedResponse } from '@/types/models'

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
 * Transform standardized backend response to frontend PaginatedResponse format
 * Handles two formats:
 * 1. Current format: { data/tables/items, currentPage, lastPage, perPage, total, ... } (fields at root)
 * 2. Legacy format: { data/tables/items, pagination: { page, limit, total, totalPages, ... } }
 */
export function transformPaginatedResponse<T>(backendResponse: any, itemTransformer?: (item: any) => T): PaginatedResponse<T> | null {
  if (!backendResponse) return null

  // Extract data array from different possible field names
  let dataArray: any[] = []
  if (backendResponse.data) {
    dataArray = backendResponse.data
  } else if (backendResponse.tables) {
    dataArray = backendResponse.tables
  } else if (backendResponse.items) {
    dataArray = backendResponse.items
  } else {
    return null
  }

  // Transform items if transformer provided
  const items = itemTransformer ? dataArray.map(itemTransformer) : dataArray

  let result: any

  // Check if response has pagination fields at root level (current backend format)
  if (backendResponse.currentPage !== undefined && backendResponse.lastPage !== undefined) {
    // Current format - pagination fields at root
    result = {
      data: items,
      currentPage: backendResponse.currentPage,
      lastPage: backendResponse.lastPage,
      perPage: backendResponse.perPage,
      total: backendResponse.total,
      from: backendResponse.from,
      to: backendResponse.to,
      links: backendResponse.links || generatePaginationLinks(backendResponse.currentPage, backendResponse.lastPage),
      prevPageUrl: backendResponse.prevPageUrl,
      nextPageUrl: backendResponse.nextPageUrl,
      lastPageUrl: backendResponse.lastPageUrl
    }
  } else if (backendResponse.pagination) {
    // Legacy format - pagination object
    const { pagination } = backendResponse
    const { page, limit, total, totalPages, hasNextPage, hasPrevPage } = pagination

    result = {
      data: items,
      currentPage: page,
      lastPage: totalPages,
      perPage: limit,
      total: total,
      from: total > 0 ? (page - 1) * limit + 1 : null,
      to: total > 0 ? Math.min(page * limit, total) : null,
      links: generatePaginationLinks(page, totalPages),
      prevPageUrl: hasPrevPage ? `?page=${page - 1}` : null,
      nextPageUrl: hasNextPage ? `?page=${page + 1}` : null,
      lastPageUrl: totalPages > 1 ? `?page=${totalPages}` : null
    }
  } else {
    // No pagination info found
    return null
  }

  // Preserve _meta field for table data responses (contains column definitions)
  if (backendResponse._meta) {
    result._meta = backendResponse._meta
  }

  return result
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
export async function fetchAPI(url: string, token: string, options: RequestInit = {}, userHeaders?: { email?: string; name?: string; id?: string }) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      // Forward user session information for proper user tracking
      ...(userHeaders?.email && { 'X-User-Email': userHeaders.email }),
      ...(userHeaders?.name && { 'X-User-Name': userHeaders.name }),
      ...(userHeaders?.id && { 'X-User-Id': userHeaders.id }),
      ...options.headers
    }
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`)
  }

  return response.json()
}
