/**
 * Postman Collection Generator Service
 * Generates Postman v2.1 collections based on token permissions and table access
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
  forSale: boolean;
}

export class PostmanGeneratorService {
  private apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  /**
   * Generate a Postman collection for a specific token
   */
  async generateCollection(token: Token, tables: Table[]): Promise<PostmanCollection> {
    const permissions = this.parsePermissions(token.permissions);
    const accessibleTables = this.filterAccessibleTables(tables, token.tableAccess);

    const collection: PostmanCollection = {
      info: {
        name: `${token.name} - API Collection`,
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

    // Add health check folder (always available)
    collection.item.push(this.createHealthCheckFolder());

    // Add table-specific folders based on permissions
    for (const table of accessibleTables) {
      const folder = this.createTableFolder(table, permissions);
      collection.item.push(folder);
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
      `API Collection for token: ${token.name}`,
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
   * Create health check folder
   */
  private createHealthCheckFolder(): PostmanFolder {
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
          name: 'List My Tables',
          request: {
            method: 'GET',
            header: [],
            url: {
              raw: '{{api_url}}/api/my-tables',
              host: ['{{api_url}}'],
              path: ['api', 'my-tables'],
            },
            description: 'List all tables accessible to this token. Returns table metadata including name, description, visibility, forSale status, column count, and row count.',
          },
        },
      ],
    };
  }

  /**
   * Create a folder for a specific table with all available operations
   */
  private createTableFolder(table: Table, permissions: Set<string>): PostmanFolder {
    const folder: PostmanFolder = {
      name: table.name,
      item: [],
    };

    // Add read operations
    if (permissions.has('read')) {
      folder.item.push(this.createListRequest(table));
      folder.item.push(this.createGetRequest(table));

      // Add buy operation for "for sale" tables (available with read permission)
      if (table.forSale) {
        folder.item.push(this.createBuyRequest(table));
      }
    }

    // Add write operations
    if (permissions.has('write')) {
      folder.item.push(this.createPostRequest(table));
      folder.item.push(this.createPutRequest(table));
      folder.item.push(this.createDeleteRequest(table));
    }

    return folder;
  }

  /**
   * Create list request (GET all)
   */
  private createListRequest(table: Table): PostmanRequest {
    return {
      name: `List ${table.name}`,
      request: {
        method: 'GET',
        header: [],
        url: {
          raw: `{{api_url}}/api/tables/${table.id}/data?page=1&limit=50`,
          host: ['{{api_url}}'],
          path: ['api', 'tables', table.id, 'data'],
          query: [
            { key: 'page', value: '1', description: 'Page number' },
            { key: 'limit', value: '50', description: 'Items per page' },
            { key: 'sort', value: '', description: 'Sort by column name' },
            { key: 'direction', value: '', description: 'asc or desc' },
          ],
        },
        description: `List all items from ${table.name} table with pagination`,
      },
    };
  }

  /**
   * Create get single item request
   */
  private createGetRequest(table: Table): PostmanRequest {
    return {
      name: `Get ${table.name} Item`,
      request: {
        method: 'GET',
        header: [],
        url: {
          raw: `{{api_url}}/api/tables/${table.id}/data/:id`,
          host: ['{{api_url}}'],
          path: ['api', 'tables', table.id, 'data', ':id'],
        },
        description: `Get a single item from ${table.name} table by ID`,
      },
    };
  }

  /**
   * Create POST request (create)
   */
  private createPostRequest(table: Table): PostmanRequest {
    return {
      name: `Create ${table.name} Item`,
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
          raw: `{{api_url}}/api/tables/${table.id}/data`,
          host: ['{{api_url}}'],
          path: ['api', 'tables', table.id, 'data'],
        },
        body: {
          mode: 'raw',
          raw: JSON.stringify(
            {
              data: {
                // Add example fields based on table columns
                field1: 'value1',
                field2: 'value2',
              },
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
        description: `Create a new item in ${table.name} table`,
      },
    };
  }

  /**
   * Create PUT request (update)
   */
  private createPutRequest(table: Table): PostmanRequest {
    return {
      name: `Update ${table.name} Item`,
      request: {
        method: 'PUT',
        header: [
          {
            key: 'Content-Type',
            value: 'application/json',
            type: 'text',
          },
        ],
        url: {
          raw: `{{api_url}}/api/tables/${table.id}/data/:id`,
          host: ['{{api_url}}'],
          path: ['api', 'tables', table.id, 'data', ':id'],
        },
        body: {
          mode: 'raw',
          raw: JSON.stringify(
            {
              data: {
                // Add example fields based on table columns
                field1: 'updated_value1',
                field2: 'updated_value2',
              },
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
        description: `Update an existing item in ${table.name} table`,
      },
    };
  }

  /**
   * Create DELETE request
   */
  private createDeleteRequest(table: Table): PostmanRequest {
    return {
      name: `Delete ${table.name} Item`,
      request: {
        method: 'DELETE',
        header: [],
        url: {
          raw: `{{api_url}}/api/tables/${table.id}/data/:id`,
          host: ['{{api_url}}'],
          path: ['api', 'tables', table.id, 'data', ':id'],
        },
        description: `Delete an item from ${table.name} table`,
      },
    };
  }

  /**
   * Create BUY request (for "for sale" tables)
   */
  private createBuyRequest(table: Table): PostmanRequest {
    return {
      name: `Buy ${table.name} Item`,
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
        description: `Purchase an item from ${table.name} table. This endpoint is available for "for sale" tables and requires read authentication.`,
      },
    };
  }
}
