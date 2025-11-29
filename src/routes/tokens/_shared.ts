/**
 * Shared utilities for token routes
 */

/**
 * Generate secure token using Web Crypto API
 */
export function generateSecureToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}
