/**
 * Date utilities for consistent formatting across the API
 */

/**
 * Format a Date object to dd.mm.yyyy format
 * @param date - The Date object to format
 * @returns Formatted date string in dd.mm.yyyy format
 */
export function formatDateDDMMYYYY(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
  const year = date.getFullYear().toString();
  
  return `${day}.${month}.${year}`;
}

/**
 * Format a Date object to dd.mm.yyyy HH:mm format
 * @param date - The Date object to format
 * @returns Formatted datetime string in dd.mm.yyyy HH:mm format
 */
export function formatDateTimeDDMMYYYY(date: Date): string {
  const dateStr = formatDateDDMMYYYY(date);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${dateStr} ${hours}:${minutes}`;
}

/**
 * Format a date field for API response
 * Uses dd.mm.yyyy format for consistency across the application
 * @param date - The Date object to format
 * @param includeTime - Whether to include time (HH:mm) in the format
 * @returns Formatted date string
 */
export function formatApiDate(date: Date, includeTime: boolean = false): string {
  return includeTime ? formatDateTimeDDMMYYYY(date) : formatDateDDMMYYYY(date);
}

/**
 * Format multiple date fields in an object for API response
 * @param obj - Object containing date fields
 * @param dateFields - Array of field names that contain dates
 * @param includeTime - Whether to include time in the format
 * @returns Object with formatted date fields
 */
export function formatApiDates<T extends Record<string, any>>(
  obj: T, 
  dateFields: (keyof T)[], 
  includeTime: boolean = false
): T {
  const formatted = { ...obj };
  
  for (const field of dateFields) {
    if (formatted[field] && (formatted[field] as any) instanceof Date) {
      formatted[field] = formatApiDate(formatted[field] as Date, includeTime) as T[keyof T];
    }
  }
  
  return formatted;
}