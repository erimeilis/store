import { Hono } from 'hono'
import type { Bindings } from '@/types/bindings.js'

// Import middleware
import { corsMiddleware } from '@/middleware/cors.js'
import { notFoundHandler, globalErrorHandler } from '@/middleware/error.js'

// Import existing route groups (will be gradually migrated)
import { itemsRoutes } from '@/routes/items.js'
// import { uploadRoutes } from '@/routes/upload.js'  // Temporarily disabled - legacy route
// import { importRoutes } from '@/routes/import.js'  // Temporarily disabled - legacy route
import usersRoutes from '@/routes/users.js'
import { auth } from '@/routes/auth.js'
import tokensRoutes from '@/routes/tokens.js'
import allowedEmailsRoutes from '@/routes/allowed-emails.js'
import { tablesRoutes } from '@/routes/tables.js'
import { tableDataRoutes } from '@/routes/table-data.js'
import salesRoutes from '@/routes/sales.js'
import inventoryRoutes from '@/routes/inventory.js'
import publicSalesRoutes from '@/routes/public-sales.js'

/**
 * Store CRUD API - Backend Server
 * 
 * A clean, modular Hono application with organized route groups and middleware.
 * Provides CRUD operations for store items with authentication, file upload,
 * and Google Sheets import capabilities.
 * 
 * Architecture:
 * - Middleware: CORS, Authentication, Error handling
 * - Routes: Health, Items CRUD, Upload, Import, Users Management, Tokens, Allowed Emails, Dynamic Tables
 * - Storage: Cloudflare D1 (SQLite), R2 (File storage)
 * - Authentication: Bearer token with D1 database + env fallback
 */

// Create Hono app with bindings
const app = new Hono<{ Bindings: Bindings }>()

// =============================================================================
// MIDDLEWARE REGISTRATION
// =============================================================================

// Apply CORS middleware to all routes
app.use('*', corsMiddleware)

// =============================================================================
// HEALTH CHECK
// =============================================================================

// Simple health check endpoint
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: 'development'
  }, 200)
})

// Serve OpenAPI specification
app.get('/api/openapi.json', (c) => {
  const baseUrl = new URL(c.req.url).origin

  return c.json({
    "openapi": "3.1.0",
    "info": {
      "title": "Store CRUD API",
      "version": "1.0.0",
      "description": "A comprehensive REST API for managing store inventory, dynamic tables, and e-commerce functionality.",
      "contact": {
        "name": "API Support"
      },
      "license": {
        "name": "MIT"
      }
    },
    "servers": [
      {
        "url": baseUrl,
        "description": "Current environment"
      }
    ],
    "tags": [
      {
        "name": "Health",
        "description": "API health and status endpoints"
      },
      {
        "name": "Items",
        "description": "CRUD operations for store items"
      },
      {
        "name": "Tables",
        "description": "Dynamic table schema management"
      },
      {
        "name": "Table Data",
        "description": "Data operations for dynamic tables"
      },
      {
        "name": "Public Sales",
        "description": "Public e-commerce endpoints for browsing and purchasing items"
      }
    ],
    "paths": {
      "/health": {
        "get": {
          "tags": ["Health"],
          "summary": "API Health Check",
          "description": "Check the health and status of the API",
          "responses": {
            "200": {
              "description": "API is healthy",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "status": {
                        "type": "string",
                        "example": "healthy"
                      },
                      "timestamp": {
                        "type": "string",
                        "format": "date-time"
                      },
                      "version": {
                        "type": "string",
                        "example": "1.0.0"
                      },
                      "environment": {
                        "type": "string",
                        "example": "development"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/api/items": {
        "get": {
          "tags": ["Items"],
          "summary": "List Store Items",
          "description": "Retrieve a paginated list of items with filtering and search capabilities",
          "security": [{"BearerAuth": []}],
          "parameters": [
            {
              "name": "page",
              "in": "query",
              "description": "Page number for pagination",
              "schema": {
                "type": "integer",
                "minimum": 1,
                "default": 1
              }
            },
            {
              "name": "limit",
              "in": "query",
              "description": "Number of items per page",
              "schema": {
                "type": "integer",
                "minimum": 1,
                "maximum": 100,
                "default": 10
              }
            }
          ],
          "responses": {
            "200": {
              "description": "List of items",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {"$ref": "#/components/schemas/Item"}
                      },
                      "total": {"type": "integer"},
                      "page": {"type": "integer"},
                      "totalPages": {"type": "integer"}
                    }
                  }
                }
              }
            }
          }
        },
        "post": {
          "tags": ["Items"],
          "summary": "Create New Item",
          "description": "Add a new item to the inventory",
          "security": [{"BearerAuth": []}],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {"$ref": "#/components/schemas/CreateItemRequest"}
              }
            }
          },
          "responses": {
            "201": {
              "description": "Item created successfully",
              "content": {
                "application/json": {
                  "schema": {"$ref": "#/components/schemas/Item"}
                }
              }
            }
          }
        }
      },
      "/api/tables": {
        "get": {
          "tags": ["Tables"],
          "summary": "List Tables",
          "description": "Retrieve user's dynamic tables with metadata",
          "security": [{"BearerAuth": []}],
          "responses": {
            "200": {
              "description": "List of tables",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {"$ref": "#/components/schemas/Table"}
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/api/public/tables": {
        "get": {
          "tags": ["Public Sales"],
          "summary": "Get For-Sale Tables",
          "description": "Retrieve public tables that are available for sale",
          "responses": {
            "200": {
              "description": "List of for-sale tables",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "tables": {
                        "type": "array",
                        "items": {"$ref": "#/components/schemas/PublicTable"}
                      },
                      "count": {
                        "type": "integer",
                        "description": "Total number of tables"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/api/public/tables/{tableId}/items": {
        "get": {
          "tags": ["Public Sales"],
          "summary": "Get Table Items",
          "description": "Retrieve all available items from a public for-sale table",
          "parameters": [
            {
              "name": "tableId",
              "in": "path",
              "required": true,
              "description": "Table ID",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Table items",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "table": {"$ref": "#/components/schemas/PublicTable"},
                      "items": {
                        "type": "array",
                        "items": {"$ref": "#/components/schemas/PublicItem"}
                      }
                    }
                  }
                }
              }
            },
            "404": {
              "description": "Table not found"
            },
            "403": {
              "description": "Table not available for public sales"
            }
          }
        }
      },
      "/api/public/tables/{tableId}/items/{itemId}/availability": {
        "get": {
          "tags": ["Public Sales"],
          "summary": "Check Item Availability",
          "description": "Check if an item is available for purchase and get current stock",
          "parameters": [
            {
              "name": "tableId",
              "in": "path",
              "required": true,
              "description": "Table ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "itemId",
              "in": "path",
              "required": true,
              "description": "Item ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "quantity",
              "in": "query",
              "description": "Quantity to check availability for",
              "schema": {
                "type": "integer",
                "minimum": 1,
                "default": 1
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Availability information",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "available": {
                        "type": "boolean",
                        "description": "Whether the requested quantity is available"
                      },
                      "current_qty": {
                        "type": "integer",
                        "description": "Current quantity in stock"
                      },
                      "max_available": {
                        "type": "integer",
                        "description": "Maximum quantity available"
                      }
                    }
                  }
                }
              }
            },
            "404": {
              "description": "Table or item not found"
            },
            "403": {
              "description": "Table not available for public sales"
            }
          }
        }
      },
      "/api/public/buy": {
        "post": {
          "tags": ["Public Sales"],
          "summary": "Purchase Item",
          "description": "Create a sale transaction for an item",
          "security": [{"BearerAuth": []}],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": ["table_id", "item_id", "customer_id", "quantity_sold"],
                  "properties": {
                    "table_id": {
                      "type": "string",
                      "description": "Table ID"
                    },
                    "item_id": {
                      "type": "string",
                      "description": "Item ID"
                    },
                    "customer_id": {
                      "type": "string",
                      "description": "Customer identifier"
                    },
                    "quantity_sold": {
                      "type": "integer",
                      "minimum": 1,
                      "description": "Quantity to purchase"
                    },
                    "payment_method": {
                      "type": "string",
                      "description": "Payment method used"
                    },
                    "notes": {
                      "type": "string",
                      "description": "Additional notes"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Purchase completed successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "message": {
                        "type": "string"
                      },
                      "sale": {"$ref": "#/components/schemas/Sale"}
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Invalid request or insufficient quantity"
            },
            "404": {
              "description": "Table or item not found"
            },
            "403": {
              "description": "Table not available for public sales"
            }
          }
        }
      }
    },
    "components": {
      "securitySchemes": {
        "BearerAuth": {
          "type": "http",
          "scheme": "bearer",
          "bearerFormat": "JWT",
          "description": "Bearer token authentication. Format: `Bearer <token>`"
        }
      },
      "schemas": {
        "Item": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "description": "Unique item identifier"
            },
            "name": {
              "type": "string",
              "description": "Item name"
            },
            "description": {
              "type": "string",
              "description": "Item description",
              "nullable": true
            },
            "price": {
              "type": "number",
              "format": "float",
              "description": "Item price"
            },
            "created_at": {
              "type": "string",
              "format": "date-time"
            },
            "updated_at": {
              "type": "string",
              "format": "date-time"
            }
          }
        },
        "CreateItemRequest": {
          "type": "object",
          "required": ["name", "price"],
          "properties": {
            "name": {
              "type": "string",
              "description": "Item name"
            },
            "description": {
              "type": "string",
              "description": "Item description"
            },
            "price": {
              "type": "number",
              "format": "float",
              "minimum": 0,
              "description": "Item price"
            }
          }
        },
        "Table": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "description": "Unique table identifier"
            },
            "name": {
              "type": "string",
              "description": "Table name"
            },
            "description": {
              "type": "string",
              "description": "Table description"
            },
            "for_sale": {
              "type": "boolean",
              "description": "Whether this is an e-commerce table"
            },
            "created_at": {
              "type": "string",
              "format": "date-time"
            }
          }
        },
        "PublicTable": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "description": "Unique table identifier"
            },
            "name": {
              "type": "string",
              "description": "Table name"
            },
            "description": {
              "type": "string",
              "description": "Table description",
              "nullable": true
            },
            "item_count": {
              "type": "integer",
              "description": "Number of available items"
            },
            "created_at": {
              "type": "string",
              "format": "date-time"
            },
            "updated_at": {
              "type": "string",
              "format": "date-time"
            }
          }
        },
        "PublicItem": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "description": "Unique item identifier"
            },
            "name": {
              "type": "string",
              "description": "Item name"
            },
            "description": {
              "type": "string",
              "description": "Item description",
              "nullable": true
            },
            "price": {
              "type": "number",
              "format": "float",
              "description": "Item price"
            },
            "qty": {
              "type": "integer",
              "description": "Available quantity"
            },
            "available": {
              "type": "boolean",
              "description": "Whether the item is available for purchase"
            },
            "created_at": {
              "type": "string",
              "format": "date-time"
            },
            "updated_at": {
              "type": "string",
              "format": "date-time"
            }
          }
        },
        "Sale": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "description": "Unique sale identifier"
            },
            "table_id": {
              "type": "string",
              "description": "Table ID"
            },
            "item_id": {
              "type": "string",
              "description": "Item ID"
            },
            "customer_id": {
              "type": "string",
              "description": "Customer identifier"
            },
            "quantity_sold": {
              "type": "integer",
              "description": "Quantity sold"
            },
            "unit_price": {
              "type": "number",
              "format": "float",
              "description": "Unit price at time of sale"
            },
            "total_amount": {
              "type": "number",
              "format": "float",
              "description": "Total sale amount"
            },
            "payment_method": {
              "type": "string",
              "description": "Payment method used",
              "nullable": true
            },
            "notes": {
              "type": "string",
              "description": "Additional notes",
              "nullable": true
            },
            "created_at": {
              "type": "string",
              "format": "date-time"
            }
          }
        }
      }
    },
    "security": [
      {
        "BearerAuth": []
      }
    ]
  })
})

// =============================================================================
// LEGACY ROUTE GROUPS (TO BE MIGRATED)
// =============================================================================

// Items CRUD operations (protected with auth middleware)
app.route('/', itemsRoutes)

// File upload and processing (protected with auth middleware) - Temporarily disabled
// app.route('/', uploadRoutes)

// Data import from external sources (protected with auth middleware) - Temporarily disabled
// app.route('/', importRoutes)

// Users management operations (protected with auth middleware)
app.route('/api/users', usersRoutes)
// Authentication operations (user registration after OAuth)
app.route('/api/auth', auth)

// Tokens management operations (protected with auth middleware)
app.route('/api/tokens', tokensRoutes)
// Allowed emails management operations (protected with auth middleware)
app.route('/api/allowed-emails', allowedEmailsRoutes)

// Dynamic tables management operations (protected with auth middleware)
app.route('/', tablesRoutes)
app.route('/', tableDataRoutes)

// Sales tracking system (protected with auth middleware)
app.route('/', salesRoutes)
app.route('/', inventoryRoutes)

// Public sales API (browse and purchase items from "for sale" tables)
app.route('/', publicSalesRoutes)

// =============================================================================
// ERROR HANDLING
// =============================================================================

// 404 handler for unknown routes
app.notFound(notFoundHandler)

// Global error handler for uncaught exceptions
app.onError(globalErrorHandler)

// =============================================================================
// EXPORT APPLICATION
// =============================================================================

export default app
