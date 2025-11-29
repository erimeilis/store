/**
 * OpenAPI 3.1 Specification
 */

export function generateOpenAPISpec(baseUrl: string, version: string = '1.0.0') {
  return {
    openapi: '3.1.0',
    info: {
      title: 'Store API',
      version,
      description: `Public REST API for e-commerce and rental operations.

## Authentication

All API endpoints require Bearer token authentication.

\`\`\`
Authorization: Bearer <your-token>
\`\`\`

Tokens are created via the admin interface and provide access to specific tables.

## Token Permissions
- \`read\`: Read-only access (browse tables and items)
- \`read,write\`: Read and write access (create purchases/rentals)

## Table Types
- **Sale tables**: E-commerce with inventory tracking and quantity-based purchases
- **Rent tables**: Rental inventory with availability tracking (used/available states)`,
      contact: { name: 'API Support' },
    },
    servers: [{ url: baseUrl, description: 'Current environment' }],
    tags: [
      { name: 'Health', description: 'API health and status' },
      { name: 'Tables', description: 'Browse public tables and items' },
      { name: 'Sales', description: 'Purchase items from sale-type tables' },
      { name: 'Rentals', description: 'Rent and release items from rent-type tables' },
    ],
    paths: {
      // ===== HEALTH =====
      '/health': {
        get: {
          tags: ['Health'],
          summary: 'API Health Check',
          description: 'Check API health status and version. No authentication required.',
          responses: {
            200: {
              description: 'API is healthy',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/HealthResponse' },
                },
              },
            },
          },
        },
      },

      // ===== TABLES =====
      '/api/public/tables': {
        get: {
          tags: ['Tables'],
          summary: 'List Available Tables',
          description: 'Get all tables your token has access to (sale and rent types only)',
          security: [{ BearerAuth: [] }],
          responses: {
            200: {
              description: 'List of accessible tables',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      tables: { type: 'array', items: { $ref: '#/components/schemas/PublicTable' } },
                      count: { type: 'integer' },
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized - invalid or missing token' },
          },
        },
      },
      '/api/public/tables/{tableId}/items': {
        get: {
          tags: ['Tables'],
          summary: 'Get Table Items',
          description: 'Get all items from a table. Response includes availability status based on table type.',
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: 'tableId', in: 'path', required: true, description: 'Table UUID', schema: { type: 'string', format: 'uuid' } },
          ],
          responses: {
            200: {
              description: 'List of items',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ItemsResponse' },
                },
              },
            },
            403: { description: 'Token does not have access to this table' },
            404: { description: 'Table not found' },
          },
        },
      },
      '/api/public/tables/{tableId}/items/{itemId}': {
        get: {
          tags: ['Tables'],
          summary: 'Get Item Details',
          description: 'Get details for a specific item',
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: 'tableId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
            { name: 'itemId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          responses: {
            200: {
              description: 'Item details',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Item' },
                },
              },
            },
            404: { description: 'Item not found' },
          },
        },
      },
      '/api/public/tables/{tableId}/items/{itemId}/availability': {
        get: {
          tags: ['Tables'],
          summary: 'Check Item Availability',
          description: 'Check if item is available for purchase (sale tables) or rental (rent tables)',
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: 'tableId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
            { name: 'itemId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
            { name: 'quantity', in: 'query', description: 'Quantity to check (sale tables only)', schema: { type: 'integer', minimum: 1, default: 1 } },
          ],
          responses: {
            200: {
              description: 'Availability status',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AvailabilityResponse' },
                },
              },
            },
            404: { description: 'Item not found' },
          },
        },
      },

      // ===== SALES =====
      '/api/public/buy': {
        post: {
          tags: ['Sales'],
          summary: 'Purchase Item',
          description: 'Create a purchase transaction. Only works on sale-type tables. Decreases item quantity.',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PurchaseRequest' },
              },
            },
          },
          responses: {
            201: {
              description: 'Purchase successful',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/PurchaseResponse' },
                },
              },
            },
            400: { description: 'Invalid request or insufficient stock' },
            403: { description: 'Table is not a sale-type table or token lacks access' },
            404: { description: 'Table or item not found' },
          },
        },
      },

      // ===== RENTALS =====
      '/api/public/rent': {
        post: {
          tags: ['Rentals'],
          summary: 'Rent Item',
          description: 'Create a rental transaction. Only works on rent-type tables. Marks item as rented (unavailable).',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RentRequest' },
              },
            },
          },
          responses: {
            201: {
              description: 'Rental successful',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/RentalResponse' },
                },
              },
            },
            400: { description: 'Item not available for rent (already rented or used)' },
            403: { description: 'Table is not a rent-type table or token lacks access' },
            404: { description: 'Table or item not found' },
          },
        },
      },
      '/api/public/release': {
        post: {
          tags: ['Rentals'],
          summary: 'Release Rental',
          description: 'Release a rented item. Marks item as used (no longer available for rent).',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ReleaseRequest' },
              },
            },
          },
          responses: {
            200: {
              description: 'Release successful',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ReleaseResponse' },
                },
              },
            },
            400: { description: 'No active rental found for this item' },
            404: { description: 'Rental not found' },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          description: 'Bearer token from the admin interface. Format: `Authorization: Bearer <token>`',
        },
      },
      schemas: {
        HealthResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'healthy' },
            timestamp: { type: 'string', format: 'date-time' },
            version: { type: 'string', example: version },
            environment: { type: 'string', example: 'production' },
          },
        },
        PublicTable: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Electronics Store' },
            description: { type: 'string', nullable: true },
            tableType: { type: 'string', enum: ['sale', 'rent'] },
            itemCount: { type: 'integer', description: 'Total number of items' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        ItemsResponse: {
          type: 'object',
          properties: {
            table: { $ref: '#/components/schemas/PublicTable' },
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/Item' },
            },
            count: { type: 'integer' },
          },
        },
        Item: {
          type: 'object',
          description: 'Item properties depend on table columns. Common fields shown below.',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Laptop Pro 15' },
            price: { type: 'number', format: 'float', example: 999.99 },
            qty: { type: 'integer', description: 'Stock quantity (sale tables)', example: 10 },
            available: { type: 'boolean', description: 'Is item available for rent (rent tables)' },
            used: { type: 'boolean', description: 'Has item been used/returned (rent tables)' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        AvailabilityResponse: {
          type: 'object',
          properties: {
            available: { type: 'boolean', description: 'Can item be purchased/rented' },
            currentStock: { type: 'integer', description: 'Current quantity (sale tables)' },
            requestedQuantity: { type: 'integer', description: 'Quantity requested' },
            canRent: { type: 'boolean', description: 'Is item available for rent (rent tables)' },
            used: { type: 'boolean', description: 'Has item been used/returned (rent tables)' },
          },
        },
        PurchaseRequest: {
          type: 'object',
          required: ['table_id', 'item_id', 'customer_id', 'quantity_sold'],
          properties: {
            table_id: { type: 'string', format: 'uuid', description: 'Table ID' },
            item_id: { type: 'string', format: 'uuid', description: 'Item ID' },
            customer_id: { type: 'string', description: 'Customer identifier (your reference)', example: 'customer-123' },
            quantity_sold: { type: 'integer', minimum: 1, description: 'Quantity to purchase', example: 2 },
            payment_method: { type: 'string', nullable: true, description: 'Payment method', example: 'credit_card' },
            notes: { type: 'string', nullable: true, description: 'Order notes' },
          },
        },
        PurchaseResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Purchase successful' },
            sale: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                saleNumber: { type: 'string', example: 'SALE-001' },
                tableId: { type: 'string', format: 'uuid' },
                itemId: { type: 'string', format: 'uuid' },
                customerId: { type: 'string' },
                quantitySold: { type: 'integer' },
                unitPrice: { type: 'number', format: 'float' },
                totalAmount: { type: 'number', format: 'float' },
                createdAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
        RentRequest: {
          type: 'object',
          required: ['table_id', 'item_id', 'customer_id'],
          properties: {
            table_id: { type: 'string', format: 'uuid', description: 'Table ID' },
            item_id: { type: 'string', format: 'uuid', description: 'Item ID' },
            customer_id: { type: 'string', description: 'Customer identifier (your reference)', example: 'customer-456' },
            notes: { type: 'string', nullable: true, description: 'Rental notes' },
          },
        },
        RentalResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Rental successful' },
            rental: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                rentalNumber: { type: 'string', example: 'RENT-001' },
                tableId: { type: 'string', format: 'uuid' },
                itemId: { type: 'string', format: 'uuid' },
                customerId: { type: 'string' },
                rentalStatus: { type: 'string', enum: ['active', 'released', 'cancelled'] },
                rentedAt: { type: 'string', format: 'date-time' },
                createdAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
        ReleaseRequest: {
          type: 'object',
          description: 'Provide either rental_id OR both table_id and item_id',
          properties: {
            rental_id: { type: 'string', format: 'uuid', description: 'Option 1: Rental ID directly' },
            table_id: { type: 'string', format: 'uuid', description: 'Option 2: Table ID (with item_id)' },
            item_id: { type: 'string', format: 'uuid', description: 'Option 2: Item ID (with table_id)' },
            notes: { type: 'string', nullable: true, description: 'Release notes' },
          },
        },
        ReleaseResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Item released successfully' },
            rental: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                rentalNumber: { type: 'string' },
                rentalStatus: { type: 'string', example: 'released' },
                releasedAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
    },
    security: [{ BearerAuth: [] }],
  };
}
