// API service for backend communication

// Backend database item structure 
interface BackendItem {
  id: number
  name: string
  description?: string
  data?: string | null
  created_at: string
  updated_at: string
}

// Frontend display structure
export interface StoreItem {
  id: string
  name: string
  description?: string
  price: number
  quantity: number
  category?: string
  createdAt: string
  updatedAt: string
}

// Adapter function to convert backend items to frontend format
function adaptBackendItem(backendItem: BackendItem): StoreItem {
  let parsedData = { price: 0, quantity: 0, category: '' }
  
  try {
    if (backendItem.data) {
      const data = JSON.parse(backendItem.data)
      parsedData = {
        price: parseFloat(data.price) || 0,
        quantity: parseInt(data.quantity) || 0,
        category: data.category || ''
      }
    }
  } catch {
    // Keep default values if JSON parsing fails
  }
  
  return {
    id: backendItem.id.toString(),
    name: backendItem.name,
    description: backendItem.description,
    price: parsedData.price,
    quantity: parsedData.quantity,
    category: parsedData.category,
    createdAt: backendItem.created_at,
    updatedAt: backendItem.updated_at
  }
}

export interface CreateItemRequest {
  name: string
  description?: string
  price: number
  quantity: number
  category?: string
}

export interface UpdateItemRequest extends Partial<CreateItemRequest> {}

// API configuration - get from window props if available, fallback to env vars
const getApiUrl = () => {
  if (typeof window !== 'undefined' && (window as any).__INITIAL_PROPS__?.apiUrl) {
    return (window as any).__INITIAL_PROPS__.apiUrl
  }
  // Fallback - this won't work in production but needed for build
  return 'http://localhost:8787'
}

// Cache for the bearer token
const _cachedToken: string | null = null

/**
 * Get bearer token for API authentication
 */
async function getBearerToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null
  
  // Get token from server-side props (passed from environment)
  const initialProps = (window as any).__INITIAL_PROPS__
  if (initialProps?.apiToken) {
    return initialProps.apiToken
  }
  
  // Development fallback
  return '35890e45a5122de41a406cdaa290e711404c1292205b6ad4a10514228df378ce'
}

/**
 * Make authenticated API request
 */
async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const token = await getBearerToken()
  const apiBaseUrl = getApiUrl()
  
  console.log('DEBUG: API request', {
    url: `${apiBaseUrl}${endpoint}`,
    token: token ? `${token.substring(0, 10)}...` : 'null',
    hasToken: !!token,
    apiBaseUrl,
    initialProps: (window as any).__INITIAL_PROPS__
  })
  
  const response = await fetch(`${apiBaseUrl}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    credentials: 'include', // Include cookies for session
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error('API Error:', response.status, errorText)
    throw new Error(`API Error ${response.status}: ${errorText}`)
  }
  
  return response.json()
}

/**
 * Fetch all items from the backend
 */
export async function getItems(): Promise<StoreItem[]> {
  const response = await apiRequest<{items: BackendItem[], count: number}>('/api/items')
  return response.items.map(adaptBackendItem)
}

/**
 * Create a new item
 */
export async function createItem(item: CreateItemRequest): Promise<StoreItem> {
  return apiRequest<StoreItem>('/api/items', {
    method: 'POST',
    body: JSON.stringify(item),
  })
}

/**
 * Update an existing item
 */
export async function updateItem(id: string, updates: UpdateItemRequest): Promise<StoreItem> {
  return apiRequest<StoreItem>(`/api/items/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
}

/**
 * Delete an item
 */
export async function deleteItem(id: string): Promise<void> {
  return apiRequest<void>(`/api/items/${id}`, {
    method: 'DELETE',
  })
}