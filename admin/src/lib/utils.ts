import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function to merge Tailwind CSS classes with conditional logic
 * Uses clsx for conditional class handling and tailwind-merge to resolve conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Build a URL to view a specific item in a table with precise column filtering
 * Format: /dashboard/tables/{tableId}/data?search={itemId}&filterColumnName={value}
 */
export function buildItemUrl(
  tableId: string,
  itemId: string,
  itemData?: Record<string, any> | null
): string {
  const baseUrl = `/dashboard/tables/${tableId}/data`
  const params = new URLSearchParams()
  params.set('search', itemId)

  // Add specific column filter from item data (camelCase: filterColumnName)
  if (itemData) {
    if (itemData.number) {
      params.set('filterNumber', String(itemData.number))
    } else if (itemData.name) {
      params.set('filterName', String(itemData.name))
    } else if (itemData.sku) {
      params.set('filterSku', String(itemData.sku))
    } else if (itemData.code) {
      params.set('filterCode', String(itemData.code))
    } else if (itemData.productName) {
      params.set('filterProductName', String(itemData.productName))
    }
  }

  return `${baseUrl}?${params.toString()}`
}
