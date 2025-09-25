/**
 * OpenAPI Schemas using Zod
 * All request/response schemas for API documentation
 */

import { z } from '@hono/zod-openapi'

// =============================================================================
// COMMON SCHEMAS
// =============================================================================

export const ErrorResponseSchema = z.object({
  message: z.string().openapi({
    example: 'Something went wrong',
    description: 'Error message describing what went wrong'
  }),
  details: z.string().optional().openapi({
    example: 'Additional error details',
    description: 'Optional additional error information'
  }),
  errors: z.array(z.string()).optional().openapi({
    example: ['Field validation error'],
    description: 'Array of validation errors when applicable'
  })
}).openapi('ErrorResponse')

export const SuccessResponseSchema = z.object({
  message: z.string().openapi({
    example: 'Operation completed successfully',
    description: 'Success message'
  })
}).openapi('SuccessResponse')

export const PaginationQuerySchema = z.object({
  page: z.string().optional().openapi({
    param: { name: 'page', in: 'query' },
    example: '1',
    description: 'Page number for pagination (1-based)'
  }),
  limit: z.string().optional().openapi({
    param: { name: 'limit', in: 'query' },
    example: '10',
    description: 'Number of items per page (max 100)'
  })
})

// =============================================================================
// AUTHENTICATION SCHEMAS
// =============================================================================

export const AuthTokenSchema = z.object({
  token: z.string().openapi({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT authentication token'
  }),
  user: z.object({
    id: z.string().openapi({ example: 'user_123' }),
    email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).openapi({ example: 'user@example.com' }),
    name: z.string().openapi({ example: 'John Doe' }),
    picture: z.string().regex(/^https?:\/\/.+/).optional().openapi({ example: 'https://example.com/avatar.jpg' })
  })
}).openapi('AuthToken')

// =============================================================================
// ITEMS SCHEMAS (Legacy CRUD)
// =============================================================================

export const ItemSchema = z.object({
  id: z.string().openapi({
    example: 'item_123',
    description: 'Unique item identifier'
  }),
  name: z.string().openapi({
    example: 'Product Name',
    description: 'Item name'
  }),
  description: z.string().nullable().openapi({
    example: 'Product description',
    description: 'Item description'
  }),
  price: z.number().openapi({
    example: 29.99,
    description: 'Item price'
  }),
  image_url: z.string().regex(/^https?:\/\/.+/).nullable().openapi({
    example: 'https://example.com/image.jpg',
    description: 'Item image URL'
  }),
  created_at: z.string().openapi({
    example: '2023-12-01T10:00:00Z',
    description: 'Creation timestamp'
  }),
  updated_at: z.string().openapi({
    example: '2023-12-01T10:00:00Z',
    description: 'Last update timestamp'
  })
}).openapi('Item')

export const CreateItemRequestSchema = z.object({
  name: z.string().min(1).openapi({
    example: 'New Product',
    description: 'Item name (required)'
  }),
  description: z.string().optional().openapi({
    example: 'Product description',
    description: 'Item description (optional)'
  }),
  price: z.number().min(0).openapi({
    example: 19.99,
    description: 'Item price (required, must be >= 0)'
  }),
  image_url: z.string().regex(/^https?:\/\/.+/).optional().openapi({
    example: 'https://example.com/image.jpg',
    description: 'Item image URL (optional)'
  })
}).openapi('CreateItemRequest')

export const UpdateItemRequestSchema = CreateItemRequestSchema.partial().openapi('UpdateItemRequest')

export const ItemsResponseSchema = z.object({
  data: z.array(ItemSchema),
  total: z.number().openapi({
    example: 50,
    description: 'Total number of items'
  }),
  page: z.number().openapi({
    example: 1,
    description: 'Current page number'
  }),
  totalPages: z.number().openapi({
    example: 5,
    description: 'Total number of pages'
  })
}).openapi('ItemsResponse')

// =============================================================================
// DYNAMIC TABLES SCHEMAS
// =============================================================================

export const ColumnTypeEnum = z.enum(['text', 'number', 'boolean', 'date', 'email', 'url', 'textarea', 'country']).openapi({
  description: 'Column data type'
})

export const TableColumnSchema = z.object({
  id: z.number().openapi({
    example: 1,
    description: 'Column ID'
  }),
  name: z.string().openapi({
    example: 'product_name',
    description: 'Column name'
  }),
  type: ColumnTypeEnum,
  is_required: z.boolean().openapi({
    example: true,
    description: 'Whether the column is required'
  }),
  default_value: z.any().nullable().openapi({
    example: 'Default value',
    description: 'Default value for the column'
  }),
  order_index: z.number().openapi({
    example: 1,
    description: 'Column display order'
  })
}).openapi('TableColumn')

export const UserTableSchema = z.object({
  id: z.string().openapi({
    example: 'table_123',
    description: 'Unique table identifier'
  }),
  name: z.string().openapi({
    example: 'My Products',
    description: 'Table name'
  }),
  description: z.string().nullable().openapi({
    example: 'Product inventory table',
    description: 'Table description'
  }),
  for_sale: z.boolean().openapi({
    example: false,
    description: 'Whether this is an e-commerce table with protected price/qty columns'
  }),
  is_public: z.boolean().openapi({
    example: false,
    description: 'Whether the table is publicly accessible'
  }),
  user_id: z.string().openapi({
    example: 'user_123',
    description: 'Table owner ID'
  }),
  created_at: z.string().openapi({
    example: '2023-12-01T10:00:00Z',
    description: 'Creation timestamp'
  }),
  updated_at: z.string().openapi({
    example: '2023-12-01T10:00:00Z',
    description: 'Last update timestamp'
  })
}).openapi('UserTable')

export const CreateTableRequestSchema = z.object({
  name: z.string().min(1).openapi({
    example: 'My New Table',
    description: 'Table name (required)'
  }),
  description: z.string().optional().openapi({
    example: 'Table description',
    description: 'Table description (optional)'
  }),
  for_sale: z.boolean().optional().openapi({
    example: false,
    description: 'Mark as e-commerce table (auto-creates price/qty columns)'
  }),
  is_public: z.boolean().optional().openapi({
    example: false,
    description: 'Make table publicly accessible'
  }),
  columns: z.array(z.object({
    name: z.string().min(1),
    type: ColumnTypeEnum,
    is_required: z.boolean().optional(),
    default_value: z.any().optional()
  })).optional().openapi({
    description: 'Initial columns to create with the table'
  })
}).openapi('CreateTableRequest')

export const UpdateTableRequestSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  for_sale: z.boolean().optional(),
  is_public: z.boolean().optional()
}).openapi('UpdateTableRequest')

export const TableDataRowSchema = z.object({
  id: z.string().openapi({
    example: 'row_123',
    description: 'Unique row identifier'
  }),
  table_id: z.string().openapi({
    example: 'table_123',
    description: 'Parent table ID'
  }),
  data: z.record(z.string(), z.any()).openapi({
    example: { name: 'Product 1', price: 29.99 },
    description: 'Row data as key-value pairs'
  }),
  created_by: z.string().openapi({
    example: 'user@example.com',
    description: 'User who created this row'
  }),
  created_at: z.string().openapi({
    example: '2023-12-01T10:00:00Z',
    description: 'Creation timestamp'
  }),
  updated_at: z.string().openapi({
    example: '2023-12-01T10:00:00Z',
    description: 'Last update timestamp'
  })
}).openapi('TableDataRow')

// =============================================================================
// PARAMETER SCHEMAS
// =============================================================================

export const TableIdParamSchema = z.object({
  id: z.string().min(1).openapi({
    param: { name: 'id', in: 'path' },
    example: 'table_123',
    description: 'Table ID'
  })
})

export const ItemIdParamSchema = z.object({
  id: z.string().min(1).openapi({
    param: { name: 'id', in: 'path' },
    example: 'item_123',
    description: 'Item ID'
  })
})

export const RowIdParamSchema = z.object({
  rowId: z.string().min(1).openapi({
    param: { name: 'rowId', in: 'path' },
    example: 'row_123',
    description: 'Row ID'
  })
})

// =============================================================================
// HEALTH CHECK SCHEMAS
// =============================================================================

export const HealthResponseSchema = z.object({
  status: z.string().openapi({
    example: 'healthy',
    description: 'API health status'
  }),
  timestamp: z.string().openapi({
    example: '2023-12-01T10:00:00Z',
    description: 'Health check timestamp'
  }),
  version: z.string().openapi({
    example: '1.0.0',
    description: 'API version'
  }),
  environment: z.string().openapi({
    example: 'production',
    description: 'Current environment'
  })
}).openapi('HealthResponse')