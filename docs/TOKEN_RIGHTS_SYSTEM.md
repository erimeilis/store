# Token Rights System Documentation

## Overview

The token rights system allows users to create API tokens with specific permissions to access their tables. This system ensures that tokens cannot exceed the permissions of the user who created them.

## Token Permission Levels

### Available Permissions

1. **Read Only (`ro`)**
   - Can only read/view data from tables
   - Cannot create, update, or delete records
   - Cannot modify table structure

2. **Read & Write (`wr`)**
   - Can read and create/update data in tables
   - Cannot delete records
   - Cannot modify table structure

### Important Notes

- **No Admin tokens**: There are no admin-level tokens to maintain security
- **No Delete permissions**: Tokens cannot delete data to prevent accidental data loss
- **No Table Structure modification**: Tokens cannot create, modify, or delete tables

## Table Access Control

### Token Table Visibility

When creating a token, users can select which tables the token can access:

- **Table Selection**: Users choose specific tables from their accessible tables
- **Inheritance**: Tokens can only access tables that the creating user has access to
- **No Elevation**: Tokens cannot access tables the user cannot access

### Example Scenarios

#### Scenario 1: User with Read Access
```
User has: Read-only access to "Sales Data" table
Creates token with: "wr" permissions for "Sales Data" table
Result: Token can only READ from "Sales Data" table (user's limitation applies)
```

#### Scenario 2: User with Write Access
```
User has: Read & write access to "Inventory" table
Creates token with: "ro" permissions for "Inventory" table
Result: Token can only READ from "Inventory" table (token limitation applies)
```

## Security Model

### Principle of Least Privilege

The system follows the principle of least privilege:

1. **User Permission Boundary**: Tokens cannot exceed the permissions of their creator
2. **Explicit Table Selection**: Only explicitly selected tables are accessible
3. **Immutable Permissions**: Token permissions are set at creation and cannot be elevated

### Permission Resolution

When a token makes a request:

```
User Permissions ∩ Token Permissions ∩ Selected Tables = Effective Permissions
```

Where:
- **User Permissions**: What the token creator can do
- **Token Permissions**: What the token is configured to do
- **Selected Tables**: Which tables the token can access

## Implementation Details

### Token Structure

```typescript
interface Token {
  id: string;
  name: string;           // Human-readable token name
  permissions: string;   // "read" or "read,write"
  allowedIps?: string;   // JSON array of allowed IP addresses
  expiresAt?: string;    // Optional expiration date
  tableAccess: string[]; // Array of accessible table IDs
}
```

### Permission Validation

The system validates permissions at multiple levels:

1. **Token Creation**: Validates user has permissions for selected tables
2. **API Requests**: Validates token has required permissions for the operation
3. **Table Access**: Validates token has access to the requested table

### API Endpoints

#### Token Management
- `GET /api/tokens` - List user's tokens
- `POST /api/tokens` - Create new token
- `PUT /api/tokens/:id` - Update token permissions
- `DELETE /api/tokens/:id` - Delete token

#### Data Access (with token authentication)
- `GET /api/tables/:id/data` - Read table data
- `POST /api/tables/:id/data` - Create records (if token has write permissions)
- `PUT /api/tables/:id/data/:rowId` - Update records (if token has write permissions)

## Best Practices

### For Token Creators

1. **Use Read-Only when possible**: Default to read-only tokens unless write access is specifically needed
2. **Limit Table Access**: Only grant access to necessary tables
3. **Set Expiration**: Use expiration dates for temporary access
4. **IP Restrictions**: Use IP allowlists for production environments

### For System Administrators

1. **Regular Audits**: Review token usage and permissions regularly
2. **Monitor Access Patterns**: Watch for unusual access patterns
3. **Revoke Unused Tokens**: Clean up expired or unused tokens

## Examples

### Creating a Read-Only Token

```bash
curl -X POST /api/tokens \
  -H "Authorization: Bearer <user_token>" \
  -d '{
    "name": "Production Read Access",
    "permissions": "read",
    "tableAccess": ["table_id_1", "table_id_2"],
    "allowedIps": ["192.168.1.0/24"],
    "expiresAt": "2024-12-31T23:59:59Z"
  }'
```

### Creating a Read-Write Token

```bash
curl -X POST /api/tokens \
  -H "Authorization: Bearer <user_token>" \
  -d '{
    "name": "Development Access",
    "permissions": "read,write",
    "tableAccess": ["dev_table_id"],
    "expiresAt": "2024-06-30T23:59:59Z"
  }'
```

## Troubleshooting

### Common Issues

1. **"Permission Denied"**: Check if token has required permissions and table access
2. **"Table Not Found"**: Verify the table ID is in the token's allowed tables
3. **"Token Expired"**: Check expiration date and renew if necessary
4. **"IP Not Allowed"**: Verify request comes from allowed IP range

### Debugging

Enable debug logging to see permission resolution:

```
DEBUG=token-permissions npm run dev
```

This will show detailed permission checks for each request.
