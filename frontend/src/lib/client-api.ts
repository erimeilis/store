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
 * Get the backend API URL for client-side requests
 */
export function getApiUrl(): string {
  // First try to get from global window object (set by server)
  if (typeof window !== 'undefined' && window.__API_URL__) {
    return window.__API_URL__;
  }
  
  // Fallback for development
  return 'http://localhost:8787';
}

/**
 * Get the access token for API requests
 */
export function getAccessToken(): string | null {
  // First try to get from global window object (set by server)
  if (typeof window !== 'undefined' && window.__ACCESS_TOKEN__) {
    return window.__ACCESS_TOKEN__;
  }
  
  // Fallback - would normally get from session/cookies but for now return hardcoded
  return 'eeb77aa92c4763586c086b89876037dc74b3252e19fe5dbd2ea0a80100e3855f';
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