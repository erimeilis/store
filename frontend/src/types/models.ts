// Basic model types for pagination component and model list

export interface BaseModel {
  id: string | number;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface PaginatedResponse<T> {
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
  _meta?: any // Optional metadata field for table data responses (contains column definitions)
}

export interface PaginationLink {
  url: string | null
  label: string
  active: boolean
}

// Mass action interface
export interface MassAction {
  name: string;
  label: string;
  confirmMessage?: string;
}

// Base props interface for model lists
export interface ModelListProps<T extends BaseModel> {
  items?: PaginatedResponse<T> | null;
  filters?: {
    sort?: string;
    direction?: 'asc' | 'desc';
    [key: string]: any;
  };
}

// Base props interface for model edit forms
export interface ModelEditProps<T extends BaseModel> {
  item?: T;
  readonly?: boolean;
  onSubmit?: (data: T) => Promise<void> | void;
  onCancel?: () => void;
  validationErrors?: Partial<Record<keyof T, string>>;
  processing?: boolean;
}

// Legacy interface aliases for backward compatibility
export interface IPaginatedResponse<T> extends PaginatedResponse<T> {}
export interface IMassAction extends MassAction {}
export interface IModel extends BaseModel {}
export interface IModelListProps<T extends BaseModel> extends ModelListProps<T> {}
export interface IModelEditProps<T extends BaseModel> extends ModelEditProps<T> {}

// Specific model interfaces
export interface User extends BaseModel {
  email: string;
  name: string;
  role?: string;
  google_id?: string;
  avatar?: string;
}

export interface Token extends BaseModel {
  name: string;
  token: string;
  permissions: 'read' | 'full';
  allowed_domains?: string[];
  expires_at?: string;
  last_used_at?: string;
}

export interface Item extends BaseModel {
  name: string;
  description?: string;
  price?: number;
  category?: string;
  stock?: number;
  image_url?: string;
}

export interface AllowedEmail extends BaseModel {
  email?: string;
  domain?: string;
  type: 'email' | 'domain';
  created_by?: string;
}