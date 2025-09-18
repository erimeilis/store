/**
 * OpenAPI Route Definitions
 * Comprehensive API endpoint documentation with examples
 */

import { createRoute, z } from '@hono/zod-openapi'
import {
  // Common schemas
  ErrorResponseSchema,
  SuccessResponseSchema,
  PaginationQuerySchema,

  // Health schemas
  HealthResponseSchema,

  // Items schemas
  ItemSchema,
  CreateItemRequestSchema,
  UpdateItemRequestSchema,
  ItemsResponseSchema,
  ItemIdParamSchema,

  // Tables schemas
  UserTableSchema,
  CreateTableRequestSchema,
  UpdateTableRequestSchema,
  TableIdParamSchema,
  TableColumnSchema,

  // Table Data schemas
  TableDataRowSchema,
  RowIdParamSchema,

  // Auth schemas
  AuthTokenSchema
} from './schemas.js'

// =============================================================================
// HEALTH ROUTES
// =============================================================================

export const healthRoute = createRoute({
  method: 'get',
  path: '/api/health',
  tags: ['Health'],
  summary: 'API Health Check',
  description: `
Check the health status and basic information of the Store CRUD API.

**Use Cases:**
- Monitor API availability
- Check service status for health checks
- Verify API version and environment
- Troubleshoot connectivity issues

**Response includes:**
- Current API status (healthy/unhealthy)
- Timestamp of the health check
- API version information
- Current environment (development/production)

**No authentication required** - This endpoint is publicly accessible for monitoring purposes.
  `,
  responses: {
    200: {
      content: {
        'application/json': {
          schema: HealthResponseSchema,
        },
      },
      description: 'API is healthy and operational',
    },
    500: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'API is experiencing issues',
    },
  },
})

// =============================================================================
// ITEMS ROUTES (Legacy CRUD)
// =============================================================================

export const listItemsRoute = createRoute({
  method: 'get',
  path: '/api/items',
  tags: ['Items'],
  summary: 'List Store Items',
  description: `
Retrieve a paginated list of all store items with optional filtering and sorting.

**Features:**
- **Pagination**: Control page size and navigate through results
- **Filtering**: Filter by name, description, price, category, etc.
- **Sorting**: Sort by any field (created_at, updated_at, name, price)
- **Search**: Full-text search across item fields

**Use Cases:**
- Display items in the storefront
- Admin inventory management
- Search and filter product catalogs
- Generate reports and analytics

**Authentication:** Bearer token required with 'read' or 'full' permissions.
  `,
  request: {
    query: PaginationQuerySchema.extend({
      sort: z.string().optional().openapi({
        param: { name: 'sort', in: 'query' },
        example: 'created_at',
        description: 'Field to sort by (created_at, updated_at, name, price)'
      }),
      direction: z.enum(['asc', 'desc']).optional().openapi({
        param: { name: 'direction', in: 'query' },
        example: 'desc',
        description: 'Sort direction'
      }),
      search: z.string().optional().openapi({
        param: { name: 'search', in: 'query' },
        example: 'laptop',
        description: 'Search term for filtering items'
      })
    })
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ItemsResponseSchema,
        },
      },
      description: 'Successfully retrieved items list',
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'Unauthorized - Invalid or missing Bearer token',
    },
    500: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'Internal server error',
    },
  },
  security: [{ BearerAuth: [] }],
})

export const createItemRoute = createRoute({
  method: 'post',
  path: '/api/items',
  tags: ['Items'],
  summary: 'Create New Item',
  description: `
Create a new item in the store inventory.

**Required Fields:**
- **name**: Item name (must be unique)
- **price**: Item price (must be >= 0)

**Optional Fields:**
- **description**: Item description
- **image_url**: URL to item image

**Validation:**
- Name must be at least 1 character
- Price cannot be negative
- Image URL must be valid if provided

**Use Cases:**
- Add new products to inventory
- Import items from external sources
- Create product catalogs
- Manage inventory updates

**Authentication:** Bearer token required with 'full' permissions.
  `,
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateItemRequestSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: ItemSchema,
        },
      },
      description: 'Item created successfully',
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'Validation error - Invalid input data',
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'Unauthorized - Requires full access token',
    },
    409: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'Conflict - Item with this name already exists',
    },
  },
  security: [{ BearerAuth: [] }],
})

export const getItemRoute = createRoute({
  method: 'get',
  path: '/api/items/{id}',
  tags: ['Items'],
  summary: 'Get Item by ID',
  description: `
Retrieve detailed information about a specific item by its unique identifier.

**Path Parameters:**
- **id**: Unique item identifier (UUID format)

**Response includes:**
- Complete item details
- Creation and modification timestamps
- All item attributes (name, description, price, image)

**Use Cases:**
- Display item details page
- Fetch item for editing
- Verify item existence
- Generate item reports

**Authentication:** Bearer token required with 'read' or 'full' permissions.
  `,
  request: {
    params: ItemIdParamSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ItemSchema,
        },
      },
      description: 'Item retrieved successfully',
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'Unauthorized - Invalid or missing Bearer token',
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'Item not found',
    },
  },
  security: [{ BearerAuth: [] }],
})

export const updateItemRoute = createRoute({
  method: 'put',
  path: '/api/items/{id}',
  tags: ['Items'],
  summary: 'Update Item',
  description: `
Update an existing item's information. All fields are optional - only provided fields will be updated.

**Updatable Fields:**
- **name**: Item name
- **description**: Item description
- **price**: Item price (must be >= 0)
- **image_url**: URL to item image

**Validation:**
- Price cannot be negative if provided
- Name must be unique if changed
- Image URL must be valid if provided

**Use Cases:**
- Edit product information
- Update pricing
- Modify descriptions and images
- Bulk update operations

**Authentication:** Bearer token required with 'full' permissions.
  `,
  request: {
    params: ItemIdParamSchema,
    body: {
      content: {
        'application/json': {
          schema: UpdateItemRequestSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ItemSchema,
        },
      },
      description: 'Item updated successfully',
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'Validation error - Invalid input data',
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'Unauthorized - Requires full access token',
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'Item not found',
    },
    409: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'Conflict - Item name already exists',
    },
  },
  security: [{ BearerAuth: [] }],
})

export const deleteItemRoute = createRoute({
  method: 'delete',
  path: '/api/items/{id}',
  tags: ['Items'],
  summary: 'Delete Item',
  description: `
Permanently delete an item from the store inventory.

**Warning:** This operation is irreversible. The item and all its data will be permanently removed.

**Path Parameters:**
- **id**: Unique item identifier to delete

**Use Cases:**
- Remove discontinued products
- Clean up test data
- Manage inventory lifecycle
- Bulk deletion operations

**Best Practices:**
- Consider soft deletion for production systems
- Backup data before deletion
- Verify item is not referenced elsewhere

**Authentication:** Bearer token required with 'full' permissions.
  `,
  request: {
    params: ItemIdParamSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: SuccessResponseSchema,
        },
      },
      description: 'Item deleted successfully',
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'Unauthorized - Requires full access token',
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'Item not found',
    },
    409: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'Cannot delete - Item may be referenced by other records',
    },
  },
  security: [{ BearerAuth: [] }],
})

// =============================================================================
// TABLES ROUTES (Dynamic Tables)
// =============================================================================

export const listTablesRoute = createRoute({
  method: 'get',
  path: '/api/tables',
  tags: ['Tables'],
  summary: 'List User Tables',
  description: `
Retrieve a paginated list of dynamic tables owned by the authenticated user.

**Features:**
- **User-scoped**: Only returns tables owned by the authenticated user
- **Pagination**: Control page size and navigate through results
- **Sorting**: Sort by creation date, update date, or name
- **Public tables**: Optionally include public tables

**Response includes:**
- Table metadata (name, description, creation date)
- For sale status and column counts
- Public/private visibility settings
- Table ownership information

**Use Cases:**
- Display user's table dashboard
- Table management interface
- Generate table reports
- Backup and synchronization

**Authentication:** Bearer token required with 'read' or 'full' permissions.
  `,
  request: {
    query: PaginationQuerySchema.extend({
      include_public: z.boolean().optional().openapi({
        param: { name: 'include_public', in: 'query' },
        example: false,
        description: 'Include public tables in results'
      })
    })
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            data: z.array(UserTableSchema),
            total: z.number(),
            page: z.number(),
            totalPages: z.number()
          }).openapi('TablesResponse'),
        },
      },
      description: 'Successfully retrieved tables list',
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'Unauthorized - Invalid or missing Bearer token',
    },
  },
  security: [{ BearerAuth: [] }],
})

export const createTableRoute = createRoute({
  method: 'post',
  path: '/api/tables',
  tags: ['Tables'],
  summary: 'Create Dynamic Table',
  description: `
Create a new dynamic table with custom schema and optional initial columns.

**Table Features:**
- **Custom schemas**: Define your own column types and validation
- **E-commerce support**: "For sale" tables with automatic price/qty columns
- **Flexible data types**: text, number, boolean, date columns
- **Validation rules**: Required fields and default values

**For Sale Tables:**
When \`for_sale: true\`, automatically creates:
- **price** column (number, default: 0)
- **qty** column (number, default: 1)
- **Protected columns**: Cannot be deleted/renamed while for_sale is true

**Use Cases:**
- Create product catalogs
- Build custom data collection forms
- Set up inventory management systems
- Create survey and feedback tables

**Authentication:** Bearer token required with 'full' permissions.
  `,
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateTableRequestSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: UserTableSchema,
        },
      },
      description: 'Table created successfully',
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'Validation error - Invalid table configuration',
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'Unauthorized - Requires full access token',
    },
  },
  security: [{ BearerAuth: [] }],
})