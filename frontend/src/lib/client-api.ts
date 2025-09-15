/**
 * Client-side API utilities
 * Handles API calls from the browser to the backend server
 */

// Get the API URL from a global variable that will be set by the server
declare global {
  interface Window {
    __API_URL__?: string;
    __ACCESS_TOKEN__?: string;
  }
}

/**
 * Get the API URL for client-side requests
 * This should point to the frontend server so requests go through the proxy handler
 * which adds session headers before forwarding to the backend
 */
export function getApiUrl(): string {
  // For client-side requests, always use the current origin (frontend server)
  // so requests go through the proxy handler with session headers
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Fallback for development (should not be used in practice)
  return 'http://localhost:5173';
}

/**
 * Get the access token for API requests
 */
export function getAccessToken(): string | null {
  // Get from global window object (set by server)
  if (typeof window !== 'undefined' && window.__ACCESS_TOKEN__) {
    return window.__ACCESS_TOKEN__;
  }
  
  // No token available
  return null;
}

/**
 * Make an API request to the backend from client-side
 */
export async function clientApiRequest(path: string, options: RequestInit = {}) {
  const apiUrl = getApiUrl();
  const token = getAccessToken();
  
  const url = `${apiUrl}${path}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add authorization if token is available
  if (token) {
    (headers as any)['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  return response;
}
