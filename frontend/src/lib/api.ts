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
  return import.meta.env.VITE_API_URL || import.meta.env.API_URL || 'http://localhost:8787'
}

const API_BASE_URL = getApiUrl()

/**
 * Get bearer token for API authentication
 */
function getBearerToken(): string | null {
  if (typeof window === 'undefined') return null
  
  // Use token from environment variables for deployment
  return import.meta.env.VITE_FULL_ACCESS_TOKEN || 'eeb77aa92c4763586c086b89876037dc74b3252e19fe5dbd2ea0a80100e3855f'
}

/**
 * Make authenticated API request
 */
async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const token = getBearerToken()
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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