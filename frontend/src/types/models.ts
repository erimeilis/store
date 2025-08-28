// Basic model types for pagination component

export interface IModel {
  id: string | number
}

export interface IPaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number | null
  to: number | null
  links: PaginationLink[]
  prev_page_url: string | null
  next_page_url: string | null
  last_page_url: string | null
}

export interface PaginationLink {
  url: string | null
  label: string
  active: boolean
}