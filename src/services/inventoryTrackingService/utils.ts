/**
 * Utility functions for inventory tracking
 */

/**
 * Extract quantity value from item data
 */
export function extractQuantity(itemData: any): number | undefined {
  if (!itemData) return undefined

  const qty = itemData.qty || itemData.quantity
  if (qty === null || qty === undefined || qty === '') return undefined

  const numQty = Number(qty)
  return isNaN(numQty) ? undefined : numQty
}