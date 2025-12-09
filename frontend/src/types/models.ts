// Basic model types for pagination component and model list

export interface BaseModel {
  id: string | number;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface PaginatedResponse<T> {
  data: T[]
  currentPage: number
  lastPage: number
  perPage: number
  total: number
  from: number | null
  to: number | null
  links: PaginationLink[]
  prevPageUrl: string | null
  nextPageUrl: string | null
  lastPageUrl: string | null
  meta?: any // Optional metadata field for table data responses (contains column definitions)
}

export interface PaginationLink {
  url: string | null
  label: string
  active: boolean
}

/**
 * Input field types for mass actions and forms
 *
 * Text Types:
 * - text: Single line string
 * - textarea: Multi-line text
 * - email: Email address with validation
 * - url: Web address with protocol validation
 * - phone: Phone number (allows + ( ) - spaces digits)
 * - country: ISO 3166-1 alpha-2 code (2 letters)
 *
 * Numeric Types:
 * - integer: Whole numbers only (uses parseInt)
 * - float: Decimal numbers (uses parseFloat)
 * - currency: Money amount (2 decimal places)
 * - percentage: Percent value (0-100)
 * - number: @deprecated Use 'integer' or 'float' instead
 *
 * Date/Time Types:
 * - date: Calendar date (YYYY-MM-DD)
 * - time: Time only (HH:MM)
 * - datetime: Date + time (ISO format)
 *
 * Other Types:
 * - boolean: True/false toggle
 * - select: Dropdown options (requires options config)
 * - rating: Star rating (1-5 integer)
 * - color: Color picker (hex format)
 */
export type InputFieldType =
  // Text types
  | 'text'
  | 'textarea'
  | 'email'
  | 'url'
  | 'phone'
  | 'country'
  // Numeric types
  | 'integer'
  | 'float'
  | 'currency'
  | 'percentage'
  | 'number' // @deprecated - use 'integer' or 'float'
  // Date/Time types
  | 'date'
  | 'time'
  | 'datetime'
  // Other types
  | 'boolean'
  | 'select'
  | 'rating'
  | 'color';

/**
 * Configuration for input fields in mass actions
 */
export interface InputConfig {
  type: InputFieldType;
  label: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string; label: string }[];
}

// Mass action interface
export interface MassAction {
  name: string;
  label: string;
  confirmMessage?: string;
  /** If true, shows an input field in the modal for user to enter a value */
  requiresInput?: boolean;
  /** Input configuration for actions that require user input */
  inputConfig?: InputConfig;
  /** Field name to update (for bulk update actions) */
  fieldName?: string;
  /**
   * If true, this action is handled by a custom callback instead of the standard modal.
   * When clicked, `onCustomMassAction` callback will be called with the action and selected IDs.
   */
  custom?: boolean;
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
  googleId?: string;
  avatar?: string;
}

export interface Token extends BaseModel {
  name: string;
  token: string;
  permissions: 'read' | 'full';
  allowedDomains?: string[];
  expiresAt?: string;
  lastUsedAt?: string;
}

export interface Item extends BaseModel {
  name: string;
  description?: string;
  price?: number;
  category?: string;
  stock?: number;
  imageUrl?: string;
}

export interface AllowedEmail extends BaseModel {
  email?: string;
  domain?: string;
  type: 'email' | 'domain';
  createdBy?: string;
}