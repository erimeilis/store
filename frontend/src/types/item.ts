// Item type definition matching the backend API
export interface Item {
  id: number
  name: string
  description?: string
  data?: any
  created_at: string
  updated_at: string
}
