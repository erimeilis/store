/**
 * Postman Collection Generator Service
 * Generates Postman v2.1 collections for PUBLIC routes only
 * Regular tokens can only access /api/public/* routes
 */

interface PostmanCollection {
  info: {
    name: string;
    description: string;
    schema: string;
  };
  auth: {
    type: string;
    bearer: Array<{ key: string; value: string; type: string }>;
  };
  variable: Array<{ key: string; value: string; type: string }>;
  item: PostmanFolder[];
}

interface PostmanFolder {
  name: string;
  item: PostmanRequest[];
}

interface PostmanRequest {
  name: string;
  request: {
    method: string;
    header: Array<{ key: string; value: string; type: string }>;
    url: {
      raw: string;
      host: string[];
      path: string[];
      query?: Array<{ key: string; value: string; description: string }>;
    };
    body?: {
      mode: string;
      raw: string;
      options: {
        raw: {
          language: string;
        };
      };
    };
    description?: string;
  };
}

interface Token {
  id: string;
  token: string;
  name: string;
  permissions: string;
  tableAccess: string[] | null;
  allowedIps: string | null;
  allowedDomains: string | null;
  expiresAt: Date | null;
}

interface Table {
  id: string;
  name: string;
  description: string | null;
  tableType?: string;
  /** @deprecated Use tableType instead */
  forSale?: boolean;
}

export class PostmanGeneratorService {
  private apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  /**
   * Generate a Postman collection for a specific token
   * Only includes PUBLIC routes that regular tokens can access
   */
  async generateCollection(token: Token, tables: Table[]): Promise<PostmanCollection> {
    const permissions = this.parsePermissions(token.permissions);
    const accessibleTables = this.filterAccessibleTables(tables, token.tableAccess);

    // Separate tables by type
    const saleTables = accessibleTables.filter(t => t.tableType === 'sale' || t.forSale === true);
    const rentTables = accessibleTables.filter(t => t.tableType === 'rent');

    const collection: PostmanCollection = {
      info: {
        name: `${token.name} - Public API Collection`,
        description: this.generateDescription(token, permissions),
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
      },
      auth: {
        type: 'bearer',
        bearer: [
          {
            key: 'token',
            value: '{{api_token}}',
            type: 'string',
          },
        ],
      },
      variable: [
        {
          key: 'api_url',
          value: this.apiUrl,
          type: 'string',
        },
        {
          key: 'api_token',
          value: token.token,
          type: 'string',
        },
      ],
      item: [],
    };

    // Add system folder (health check, list tables)
    collection.item.push(this.createSystemFolder());

    // Add sale tables folder if any
    if (saleTables.length > 0) {
      collection.item.push(this.createSalesFolder(saleTables, permissions));
    }

    // Add rental tables folder if any
    if (rentTables.length > 0) {
      collection.item.push(this.createRentalsFolder(rentTables, permissions));
    }

    return collection;
  }

  /**
   * Parse permissions string into a set of permissions
   */
  private parsePermissions(permissionsStr: string): Set<string> {
    return new Set(permissionsStr.split(',').map((p) => p.trim()));
  }

  /**
   * Filter tables based on token's table access
   */
  private filterAccessibleTables(tables: Table[], tableAccess: string[] | null): Table[] {
    if (!tableAccess || tableAccess.length === 0) {
      return tables; // If no restrictions, all tables are accessible
    }
    return tables.filter((table) => tableAccess.includes(table.id));
  }

  /**
   * Generate collection description
   */
  private generateDescription(token: Token, permissions: Set<string>): string {
    const lines = [
      `Public API Collection for token: ${token.name}`,
      '',
      '**Note:** This collection includes only PUBLIC routes accessible to regular API tokens.',
      'Admin-only routes (table management, data operations) are not included.',
      '',
      '**Permissions:**',
      ...Array.from(permissions).map((p) => `- ${p}`),
    ];

    if (token.allowedIps) {
      lines.push('', '**IP Restrictions:**', token.allowedIps);
    }

    if (token.allowedDomains) {
      lines.push('', '**Domain Restrictions:**', token.allowedDomains);
    }

    if (token.expiresAt) {
      lines.push('', `**Expires:** ${new Date(token.expiresAt).toLocaleString()}`);
    }

    return lines.join('\n');
  }

  /**
   * Create system folder with health check and public table list
   */
  private createSystemFolder(): PostmanFolder {
    return {
      name: 'System',
      item: [
        {
          name: 'Health Check',
          request: {
            method: 'GET',
            header: [],
            url: {
              raw: '{{api_url}}/health',
              host: ['{{api_url}}'],
              path: ['health'],
            },
            description: 'Check API health status',
          },
        },
        {
          name: 'List Public Tables',
          request: {
            method: 'GET',
            header: [],
            url: {
              raw: '{{api_url}}/api/public/tables',
              host: ['{{api_url}}'],
              path: ['api', 'public', 'tables'],
            },
            description: 'List all public tables (both sale and rent types). Use the tableType field to determine which item endpoints to use.',
          },
        },
      ],
    };
  }

  /**
   * Create folder for sale-type tables
   */
  private createSalesFolder(tables: Table[], permissions: Set<string>): PostmanFolder {
    const folder: PostmanFolder = {
      name: 'Sales',
      item: [],
    };

    // Add table-specific items
    for (const table of tables) {
      folder.item.push(this.createSaleTableItemsRequest(table));
      folder.item.push(this.createSaleItemAvailabilityRequest(table));
      folder.item.push(this.createBuyRequest(table));
    }

    return folder;
  }

  /**
   * Create folder for rent-type tables
   */
  private createRentalsFolder(tables: Table[], permissions: Set<string>): PostmanFolder {
    const folder: PostmanFolder = {
      name: 'Rentals',
      item: [],
    };

    // Add table-specific items
    for (const table of tables) {
      folder.item.push(this.createRentalTableItemsRequest(table));
      folder.item.push(this.createRentalItemAvailabilityRequest(table));
      folder.item.push(this.createRentRequest(table));
      folder.item.push(this.createReleaseRequest(table));
    }

    return folder;
  }

  /**
   * Create request to list items from a sale-type table
   */
  private createSaleTableItemsRequest(table: Table): PostmanRequest {
    return {
      name: `List ${table.name} Items`,
      request: {
        method: 'GET',
        header: [],
        url: {
          raw: `{{api_url}}/api/public/tables/${table.id}/items`,
          host: ['{{api_url}}'],
          path: ['api', 'public', 'tables', table.id, 'items'],
        },
        description: `List all available items from ${table.name} table for purchase`,
      },
    };
  }

  /**
   * Create request to check sale item availability
   */
  private createSaleItemAvailabilityRequest(table: Table): PostmanRequest {
    return {
      name: `Check ${table.name} Item Availability`,
      request: {
        method: 'GET',
        header: [],
        url: {
          raw: `{{api_url}}/api/public/tables/${table.id}/items/:itemId/availability?quantity=1`,
          host: ['{{api_url}}'],
          path: ['api', 'public', 'tables', table.id, 'items', ':itemId', 'availability'],
          query: [
            { key: 'quantity', value: '1', description: 'Quantity to check availability for' },
          ],
        },
        description: `Check if an item from ${table.name} is available for purchase and get current stock`,
      },
    };
  }

  /**
   * Create request to list items from a rent-type table
   * Uses unified /api/public/tables/:id/items endpoint
   */
  private createRentalTableItemsRequest(table: Table): PostmanRequest {
    return {
      name: `List ${table.name} Items`,
      request: {
        method: 'GET',
        header: [],
        url: {
          raw: `{{api_url}}/api/public/tables/${table.id}/items`,
          host: ['{{api_url}}'],
          path: ['api', 'public', 'tables', table.id, 'items'],
        },
        description: `List all items from ${table.name} rental table with rental status (used, available, canRent)`,
      },
    };
  }

  /**
   * Create request to check rental item availability
   * Uses unified /api/public/tables/:id/items/:itemId/availability endpoint
   */
  private createRentalItemAvailabilityRequest(table: Table): PostmanRequest {
    return {
      name: `Check ${table.name} Rental Availability`,
      request: {
        method: 'GET',
        header: [],
        url: {
          raw: `{{api_url}}/api/public/tables/${table.id}/items/:itemId/availability`,
          host: ['{{api_url}}'],
          path: ['api', 'public', 'tables', table.id, 'items', ':itemId', 'availability'],
        },
        description: `Check if an item from ${table.name} is available for rental (returns used, available, currentlyRented, rentalPrice)`,
      },
    };
  }

  /**
   * Create BUY request (for "sale" type tables)
   */
  private createBuyRequest(table: Table): PostmanRequest {
    return {
      name: `Buy from ${table.name}`,
      request: {
        method: 'POST',
        header: [
          {
            key: 'Content-Type',
            value: 'application/json',
            type: 'text',
          },
        ],
        url: {
          raw: `{{api_url}}/api/public/buy`,
          host: ['{{api_url}}'],
          path: ['api', 'public', 'buy'],
        },
        body: {
          mode: 'raw',
          raw: JSON.stringify(
            {
              tableId: table.id,
              itemId: 'item_id_here',
              customerId: 'customer_identifier',
              quantitySold: 1,
              paymentMethod: 'credit_card',
              notes: 'Optional purchase notes',
            },
            null,
            2
          ),
          options: {
            raw: {
              language: 'json',
            },
          },
        },
        description: `Purchase an item from ${table.name}. Decrements item quantity.`,
      },
    };
  }

  /**
   * Create RENT request (for "rent" type tables)
   */
  private createRentRequest(table: Table): PostmanRequest {
    return {
      name: `Rent from ${table.name}`,
      request: {
        method: 'POST',
        header: [
          {
            key: 'Content-Type',
            value: 'application/json',
            type: 'text',
          },
        ],
        url: {
          raw: `{{api_url}}/api/public/rent`,
          host: ['{{api_url}}'],
          path: ['api', 'public', 'rent'],
        },
        body: {
          mode: 'raw',
          raw: JSON.stringify(
            {
              tableId: table.id,
              itemId: 'item_id_here',
              customerId: 'customer_identifier',
              notes: 'Optional rental notes',
            },
            null,
            2
          ),
          options: {
            raw: {
              language: 'json',
            },
          },
        },
        description: `Rent an item from ${table.name}. Sets available=false for the item.`,
      },
    };
  }

  /**
   * Create RELEASE request (for "rent" type tables)
   */
  private createReleaseRequest(table: Table): PostmanRequest {
    return {
      name: `Release ${table.name} Rental`,
      request: {
        method: 'POST',
        header: [
          {
            key: 'Content-Type',
            value: 'application/json',
            type: 'text',
          },
        ],
        url: {
          raw: `{{api_url}}/api/public/release`,
          host: ['{{api_url}}'],
          path: ['api', 'public', 'release'],
        },
        body: {
          mode: 'raw',
          raw: JSON.stringify(
            {
              tableId: table.id,
              itemId: 'item_id_here',
              notes: 'Optional release notes',
            },
            null,
            2
          ),
          options: {
            raw: {
              language: 'json',
            },
          },
        },
        description: `Release a rented item from ${table.name}. Sets used=true, preventing future rentals.`,
      },
    };
  }
}
