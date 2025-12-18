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
  AuthTokenSchema,

  // Rental schemas
  RentalSchema,
  CreateRentalRequestSchema,
  ReleaseRentalRequestSchema,
  UpdateRentalRequestSchema,
  RentalIdParamSchema,
  RentalTableSchema,
  RentalItemSchema,
  RentalAvailabilitySchema,
  RentalStatusEnum
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
Check the health status and basic information of the Store API.

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
// ITEMS ROUTES (Legacy)
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

**Authentication:** Bearer token required with 'read' or 'write' permissions.
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

**Authentication:** Bearer token required with 'write' permissions.
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

**Authentication:** Bearer token required with 'read' or 'write' permissions.
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

**Authentication:** Bearer token required with 'write' permissions.
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

**Authentication:** Bearer token required with 'write' permissions.
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

**Authentication:** Bearer token required with 'read' or 'write' permissions.
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

**Authentication:** Bearer token required with 'write' permissions.
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

// =============================================================================
// RENTALS ROUTES (Admin Management)
// =============================================================================

export const listRentalsRoute = createRoute({
  method: 'get',
  path: '/api/rentals',
  tags: ['Rentals'],
  summary: 'List Rental Transactions',
  description: `
Retrieve a paginated list of rental transactions with filtering and sorting options.

**Features:**
- **Pagination**: Control page size and navigate through results
- **Filtering**: Filter by table, customer, status, date range
- **Sorting**: Sort by rented date, released date, price, rental number
- **Search**: Search in rental number, customer ID, notes

**Query Parameters:**
- **page**: Page number (default: 1)
- **limit**: Items per page (default: 50)
- **tableId**: Filter by source table
- **customerId**: Filter by customer
- **rentalStatus**: Filter by status (active, released, cancelled)
- **dateFrom/dateTo**: Date range filter
- **search**: Text search
- **sortBy**: Field to sort by
- **sortOrder**: asc or desc

**Authentication:** Bearer token required with 'read' or 'write' permissions.
  `,
  request: {
    query: PaginationQuerySchema.extend({
      tableId: z.string().optional().openapi({
        param: { name: 'tableId', in: 'query' },
        description: 'Filter by table ID'
      }),
      customerId: z.string().optional().openapi({
        param: { name: 'customerId', in: 'query' },
        description: 'Filter by customer ID'
      }),
      rentalStatus: RentalStatusEnum.optional().openapi({
        param: { name: 'rentalStatus', in: 'query' },
        description: 'Filter by rental status'
      }),
      dateFrom: z.string().optional().openapi({
        param: { name: 'dateFrom', in: 'query' },
        description: 'Start date for date range filter (ISO format)'
      }),
      dateTo: z.string().optional().openapi({
        param: { name: 'dateTo', in: 'query' },
        description: 'End date for date range filter (ISO format)'
      }),
      search: z.string().optional().openapi({
        param: { name: 'search', in: 'query' },
        description: 'Search in rental number, customer ID, notes'
      }),
      sortBy: z.enum(['rentedAt', 'releasedAt', 'createdAt', 'updatedAt', 'unitPrice', 'rentalNumber']).optional().openapi({
        param: { name: 'sortBy', in: 'query' },
        description: 'Field to sort by'
      }),
      sortOrder: z.enum(['asc', 'desc']).optional().openapi({
        param: { name: 'sortOrder', in: 'query' },
        description: 'Sort direction'
      })
    })
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            data: z.array(RentalSchema),
            total: z.number(),
            pagination: z.object({
              page: z.number(),
              limit: z.number(),
              total: z.number(),
              totalPages: z.number(),
              hasNextPage: z.boolean(),
              hasPrevPage: z.boolean()
            })
          }).openapi('RentalsResponse'),
        },
      },
      description: 'Successfully retrieved rentals list',
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

export const getRentalRoute = createRoute({
  method: 'get',
  path: '/api/rentals/{id}',
  tags: ['Rentals'],
  summary: 'Get Rental by ID',
  description: `
Retrieve detailed information about a specific rental transaction.

**Response includes:**
- Complete rental details
- Item snapshot at time of rental
- Rental status and timestamps
- Customer and notes information

**Authentication:** Bearer token required with 'read' or 'write' permissions.
  `,
  request: {
    params: RentalIdParamSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            rental: RentalSchema
          }),
        },
      },
      description: 'Rental retrieved successfully',
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
      description: 'Rental not found',
    },
  },
  security: [{ BearerAuth: [] }],
})

export const updateRentalRoute = createRoute({
  method: 'put',
  path: '/api/rentals/{id}',
  tags: ['Rentals'],
  summary: 'Update Rental (Admin)',
  description: `
Update a rental transaction. Only status and notes can be updated.

**Updatable Fields:**
- **rentalStatus**: Change status (active, released, cancelled)
- **notes**: Update notes

**Note:** Financial and item data cannot be updated for audit compliance.

**Authentication:** Bearer token required with 'write' permissions.
  `,
  request: {
    params: RentalIdParamSchema,
    body: {
      content: {
        'application/json': {
          schema: UpdateRentalRequestSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
            rental: RentalSchema
          }),
        },
      },
      description: 'Rental updated successfully',
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
      description: 'Rental not found',
    },
  },
  security: [{ BearerAuth: [] }],
})

export const deleteRentalRoute = createRoute({
  method: 'delete',
  path: '/api/rentals/{id}',
  tags: ['Rentals'],
  summary: 'Delete Rental (Admin)',
  description: `
Delete a rental transaction record.

**Warning:** This is a permanent deletion. Consider using status update instead.

**Authentication:** Bearer token required with 'write' permissions.
  `,
  request: {
    params: RentalIdParamSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
            rental: RentalSchema
          }),
        },
      },
      description: 'Rental deleted successfully',
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
      description: 'Rental not found',
    },
  },
  security: [{ BearerAuth: [] }],
})

export const getRentalsByCustomerRoute = createRoute({
  method: 'get',
  path: '/api/rentals/customer/{customerId}',
  tags: ['Rentals'],
  summary: 'Get Rentals by Customer',
  description: `
Retrieve all rental transactions for a specific customer.

**Use Cases:**
- View customer rental history
- Check active rentals for a customer
- Generate customer reports

**Authentication:** Bearer token required with 'read' or 'write' permissions.
  `,
  request: {
    params: z.object({
      customerId: z.string().min(1).openapi({
        param: { name: 'customerId', in: 'path' },
        example: 'customer_456',
        description: 'Customer ID'
      })
    }),
    query: z.object({
      limit: z.string().optional().openapi({
        param: { name: 'limit', in: 'query' },
        example: '50',
        description: 'Maximum results to return'
      })
    })
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            data: z.array(RentalSchema),
            total: z.number()
          }),
        },
      },
      description: 'Successfully retrieved customer rentals',
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

export const getRentalsByTableRoute = createRoute({
  method: 'get',
  path: '/api/rentals/table/{tableId}',
  tags: ['Rentals'],
  summary: 'Get Rentals by Table',
  description: `
Retrieve all rental transactions for a specific table.

**Use Cases:**
- View table rental history
- Check active rentals from a table
- Generate inventory reports

**Authentication:** Bearer token required with 'read' or 'write' permissions.
  `,
  request: {
    params: TableIdParamSchema,
    query: z.object({
      limit: z.string().optional().openapi({
        param: { name: 'limit', in: 'query' },
        example: '50',
        description: 'Maximum results to return'
      })
    })
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            data: z.array(RentalSchema),
            total: z.number()
          }),
        },
      },
      description: 'Successfully retrieved table rentals',
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

export const getRentalAnalyticsRoute = createRoute({
  method: 'get',
  path: '/api/rentals/analytics',
  tags: ['Rentals'],
  summary: 'Get Rental Analytics',
  description: `
Retrieve rental analytics and statistics.

**Analytics includes:**
- Total, active, released, cancelled rental counts
- Total and average revenue
- Top rented items
- Rentals by date

**Query Parameters:**
- **dateFrom/dateTo**: Date range for analytics
- **tableId**: Filter analytics by table

**Authentication:** Bearer token required with 'read' or 'write' permissions.
  `,
  request: {
    query: z.object({
      dateFrom: z.string().optional().openapi({
        param: { name: 'dateFrom', in: 'query' },
        description: 'Start date (ISO format)'
      }),
      dateTo: z.string().optional().openapi({
        param: { name: 'dateTo', in: 'query' },
        description: 'End date (ISO format)'
      }),
      tableId: z.string().optional().openapi({
        param: { name: 'tableId', in: 'query' },
        description: 'Filter by table ID'
      })
    })
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            totalRentals: z.number(),
            activeRentals: z.number(),
            releasedRentals: z.number(),
            cancelledRentals: z.number(),
            totalRevenue: z.number(),
            averageRentalPrice: z.number()
          }).openapi('RentalAnalytics'),
        },
      },
      description: 'Successfully retrieved rental analytics',
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

// =============================================================================
// PUBLIC RENTALS ROUTES (Customer-facing)
// =============================================================================

export const listRentalTablesRoute = createRoute({
  method: 'get',
  path: '/api/public/rental-tables',
  tags: ['Public Rentals'],
  summary: 'List Available Rental Tables',
  description: `
Get a list of public tables configured for rentals.

**No authentication required** - This is a public endpoint for browsing rental catalogs.

**Response includes:**
- Table name and description
- Item count and available count
  `,
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            tables: z.array(RentalTableSchema),
            count: z.number()
          }),
        },
      },
      description: 'Successfully retrieved rental tables',
    },
  },
})

export const getRentalTableItemsRoute = createRoute({
  method: 'get',
  path: '/api/public/rental-tables/{tableId}/items',
  tags: ['Public Rentals'],
  summary: 'List Items in Rental Table',
  description: `
Get all items from a public rental table.

**No authentication required** - This is a public endpoint for browsing items.

**Response includes:**
- Item data with all columns
- Availability and used status
- Rental price
  `,
  request: {
    params: TableIdParamSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            items: z.array(RentalItemSchema),
            columns: z.array(z.object({
              name: z.string(),
              type: z.string()
            })),
            table: z.object({
              id: z.string(),
              name: z.string()
            })
          }),
        },
      },
      description: 'Successfully retrieved table items',
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'Table not found or not public',
    },
  },
})

export const getRentalItemRoute = createRoute({
  method: 'get',
  path: '/api/public/rental-tables/{tableId}/items/{itemId}',
  tags: ['Public Rentals'],
  summary: 'Get Rental Item Details',
  description: `
Get detailed information about a specific rental item.

**No authentication required** - This is a public endpoint.
  `,
  request: {
    params: z.object({
      tableId: z.string().min(1).openapi({
        param: { name: 'tableId', in: 'path' },
        description: 'Table ID'
      }),
      itemId: z.string().min(1).openapi({
        param: { name: 'itemId', in: 'path' },
        description: 'Item ID'
      })
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            item: RentalItemSchema,
            table: z.object({
              id: z.string(),
              name: z.string()
            })
          }),
        },
      },
      description: 'Successfully retrieved item details',
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'Item or table not found',
    },
  },
})

export const checkRentalAvailabilityRoute = createRoute({
  method: 'get',
  path: '/api/public/rental-tables/{tableId}/items/{itemId}/availability',
  tags: ['Public Rentals'],
  summary: 'Check Item Rental Availability',
  description: `
Check if an item is available for rental and get its current state.

**No authentication required** - This is a public endpoint.

**Response includes:**
- Whether item can be rented
- Whether item has been used
- Whether item is currently rented
- Rental price
- Active rental ID if currently rented
  `,
  request: {
    params: z.object({
      tableId: z.string().min(1).openapi({
        param: { name: 'tableId', in: 'path' },
        description: 'Table ID'
      }),
      itemId: z.string().min(1).openapi({
        param: { name: 'itemId', in: 'path' },
        description: 'Item ID'
      })
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: RentalAvailabilitySchema,
        },
      },
      description: 'Successfully retrieved availability',
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'Item or table not found',
    },
  },
})

export const rentItemRoute = createRoute({
  method: 'post',
  path: '/api/public/rent',
  tags: ['Public Rentals'],
  summary: 'Rent an Item',
  description: `
Create a rental transaction for an item.

**Rental Lifecycle:**
1. Initial state: \`used=false, available=true\` (item can be rented)
2. After rent: \`used=false, available=false\` (item is rented)
3. After release: \`used=true, available=false\` (item cannot be rented again)

**Request body:**
- **tableId**: Table containing the item
- **itemId**: Item to rent
- **customerId**: Customer identifier
- **notes**: Optional notes

**Authentication:** Bearer token required with 'read' or 'write' permissions.
  `,
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateRentalRequestSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
            rental: RentalSchema
          }),
        },
      },
      description: 'Item rented successfully',
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'Invalid request or item not available',
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'Unauthorized - Bearer token required',
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'Item or table not found',
    },
  },
  security: [{ BearerAuth: [] }],
})

export const releaseItemRoute = createRoute({
  method: 'post',
  path: '/api/public/release',
  tags: ['Public Rentals'],
  summary: 'Release a Rented Item',
  description: `
Release a rental and mark the item as used.

**Important:** After release, the item cannot be rented again (one-time rental items).

**Request body (option 1 - by rental ID):**
- **rentalId**: Rental transaction ID
- **notes**: Optional notes

**Request body (option 2 - by item):**
- **tableId**: Table containing the item
- **itemId**: Item to release
- **notes**: Optional notes

**State change:** \`available=false, used=false\` → \`available=false, used=true\`

**Authentication:** Bearer token required with 'read' or 'write' permissions.
  `,
  request: {
    body: {
      content: {
        'application/json': {
          schema: ReleaseRentalRequestSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
            rental: RentalSchema
          }),
        },
      },
      description: 'Item released successfully',
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'Invalid request or item not currently rented',
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'Unauthorized - Bearer token required',
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'Rental, item, or table not found',
    },
  },
  security: [{ BearerAuth: [] }],
})