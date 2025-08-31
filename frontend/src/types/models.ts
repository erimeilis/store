// Basic model types for pagination component and model list

export interface IModel {
  id: string | number;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
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

// Mass action interface
export interface IMassAction {
  name: string;
  label: string;
  confirmMessage?: string;
}

// Base props interface for model lists
export interface IModelListProps<T extends IModel> {
  items?: {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  } | null;
  filters?: {
    sort?: string;
    direction?: 'asc' | 'desc';
    [key: string]: any;
  };
}