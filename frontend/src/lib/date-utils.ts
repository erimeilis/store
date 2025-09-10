/**
 * Frontend date utilities for consistent formatting across the application
 * Matches the backend API dd.mm.yyyy format
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
 * Format a date string from API response to display format
 * @param dateString - Date string from API (could be ISO string or dd.mm.yyyy)
 * @param includeTime - Whether to include time (HH:mm) in the format
 * @returns Formatted date string in dd.mm.yyyy format
 */
export function formatApiDate(dateString: string, includeTime: boolean = false): string {
  if (!dateString) return '';
  
  // If already in dd.mm.yyyy format (from new API), return as is
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateString)) {
    return dateString;
  }
  
  // If in ISO format or other parseable format, convert to dd.mm.yyyy
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return dateString; // Return original if can't parse
  }
  
  return includeTime ? formatDateTimeDDMMYYYY(date) : formatDateDDMMYYYY(date);
}

/**
 * Format a date for form input (YYYY-MM-DD)
 * @param date - Date object or date string
 * @returns Date string in YYYY-MM-DD format for HTML inputs
 */
export function formatDateForInput(date: Date | string): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return '';
  
  const year = dateObj.getFullYear();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const day = dateObj.getDate().toString().padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Parse a dd.mm.yyyy string to a Date object
 * @param dateString - Date string in dd.mm.yyyy format
 * @returns Date object or null if invalid
 */
export function parseDDMMYYYY(dateString: string): Date | null {
  if (!dateString || !/^\d{2}\.\d{2}\.\d{4}$/.test(dateString)) {
    return null;
  }
  
  const [day, month, year] = dateString.split('.').map(Number);
  const date = new Date(year, month - 1, day); // month is 0-indexed
  
  // Validate the date is correct (handles invalid dates like 31.02.2025)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  
  return date;
}