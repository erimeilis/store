# Token Security & IP/Domain Whitelist

## Overview
The Store CRUD API implements comprehensive token-based authentication with IP address and domain whitelisting for enhanced security. This system prevents unauthorized token usage even if tokens are compromised.

## Token Structure

### Database Schema
```sql
CREATE TABLE tokens (
    id TEXT PRIMARY KEY,
    token TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    permissions TEXT DEFAULT 'read',           -- Comma-separated: read,write,delete,admin
    allowed_ips TEXT,                          -- JSON array of IP addresses/CIDR ranges
    allowed_domains TEXT,                      -- JSON array of domain patterns  
    expires_at DATETIME,                       -- Optional expiration
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Token Example
```json
{
  "id": "cm0gqj4kd0001ck8w0j2j8v9x",
  "token": "dev-local-token-123-secure", 
  "name": "Development Token",
  "permissions": "read,write,delete,admin",
  "allowed_ips": "[\"127.0.0.1\", \"::1\", \"192.168.0.0/16\"]",
  "allowed_domains": "[\"localhost\", \"*.dev\", \"*.local\"]",
  "expires_at": null
}
```

## Permission System

### Permission Levels
- **`read`**: View data only (GET operations)
- **`write`**: Create and update data (POST, PUT operations)  
- **`delete`**: Remove data (DELETE operations)
- **`admin`**: Full access to all operations and management

### Permission Hierarchy
- `admin` includes all other permissions
- `write` includes `read` permission
- `delete` requires explicit permission
- Permissions are comma-separated: `"read,write,admin"`

### Usage in Code
```typescript
// Check permission
if (!hasPermission(user.permissions, 'write')) {
  return c.json({ error: 'Forbidden' }, 403)
}

// Permission middleware
export const writeAuthMiddleware = createBearerAuthMiddleware('write')
```

## IP Address Whitelisting

### Supported Formats
1. **Individual IPs**: `"127.0.0.1"`, `"::1"` (IPv6)
2. **CIDR Ranges**: `"192.168.0.0/16"`, `"10.0.0.0/8"`
3. **Special Values**: `"0.0.0.0/0"` (allow all)

### JSON Configuration
```json
{
  "allowed_ips": [
    "127.0.0.1",           // Localhost IPv4
    "::1",                 // Localhost IPv6  
    "192.168.0.0/16",      // Private network
    "10.0.0.0/8",          // Corporate network
    "172.16.0.0/12"        // Docker networks
  ]
}
```

### IP Detection
The system extracts client IP from:
1. `CF-Connecting-IP` header (Cloudflare's real client IP)
2. `X-Forwarded-For` header (first IP)
3. Fallback to `127.0.0.1`

### Implementation
```typescript
function getClientIp(request: Request): string {
  return request.headers.get('CF-Connecting-IP') || 
         request.headers.get('x-forwarded-for')?.split(',')[0] || 
         '127.0.0.1'
}

function checkIpWhitelist(clientIp: string, allowedIps: string | null): IpCheckResult {
  // Parsing and matching logic
  // Supports exact matches and CIDR ranges
}
```

## Domain Whitelisting

### Supported Patterns
1. **Exact Match**: `"example.com"`
2. **Wildcard Subdomains**: `"*.example.com"`
3. **Port Wildcards**: `"localhost:*"`
4. **Development Patterns**: `"*.dev"`, `"*.local"`

### JSON Configuration
```json
{
  "allowed_domains": [
    "localhost",           // Local development
    "localhost:*",         // Any localhost port
    "*.pages.dev",         // Cloudflare Pages
    "*.workers.dev",       // Cloudflare Workers  
    "example.com",         // Exact domain
    "*.example.com"        // Subdomains
  ]
}
```

### Domain Detection
The system extracts domain from:
1. `Origin` header (CORS requests)
2. `Referer` header (navigation requests)
3. `Host` header (direct requests)

### Implementation
```typescript
function getRequestDomain(request: Request): string | null {
  return request.headers.get('Origin') || 
         request.headers.get('Referer')?.match(/https?:\/\/([^\/]+)/)?.[1] ||
         request.headers.get('Host') ||
         null
}

function checkDomainWhitelist(domain: string, allowedDomains: string | null): DomainCheckResult {
  // Pattern matching for wildcards and exact matches
}
```

## Token Validation Flow

```mermaid
graph TD
    A[API Request] --> B[Extract Bearer Token]
    B --> C[Find Token in Database]
    C --> D{Token Exists?}
    D -->|No| E[401 Unauthorized]
    D -->|Yes| F[Check Expiration]
    F --> G{Expired?}
    G -->|Yes| H[401 Token Expired]
    G -->|No| I[Extract Client IP]
    I --> J[Check IP Whitelist]
    J --> K{IP Allowed?}
    K -->|No| L[401 IP Not Allowed]
    K -->|Yes| M[Extract Request Domain]
    M --> N[Check Domain Whitelist]
    N --> O{Domain Allowed?}
    O -->|No| P[401 Domain Not Allowed]
    O -->|Yes| Q[Check Permissions]
    Q --> R{Has Required Permission?}
    R -->|No| S[403 Insufficient Permissions]
    R -->|Yes| T[Allow Request]
```

## Pre-configured Tokens

### 1. Development Token
```json
{
  "token": "dev-local-token-123-secure",
  "name": "Development Token", 
  "permissions": "read,write,delete,admin",
  "allowed_ips": ["127.0.0.1", "::1", "192.168.0.0/16"],
  "allowed_domains": ["localhost", "*.dev", "*.local"],
  "expires_at": null
}
```
**Use Case**: Local development, full permissions, restricted to local networks

### 2. Frontend Token  
```json
{
  "token": "frontend-secure-token-456",
  "name": "Frontend Access Token",
  "permissions": "read,write", 
  "allowed_ips": ["0.0.0.0/0"],
  "allowed_domains": ["*.pages.dev", "*.workers.dev", "yourdomain.com"],
  "expires_at": null
}
```
**Use Case**: Frontend applications, read/write access, domain-restricted

### 3. Read-only Token
```json
{
  "token": "readonly-token-789",
  "name": "Read Only Token",
  "permissions": "read",
  "allowed_ips": ["10.0.0.0/8", "172.16.0.0/12"],
  "allowed_domains": ["*.internal", "*.corp"],
  "expires_at": "2026-08-29T00:00:00Z"
}
```
**Use Case**: Monitoring systems, corporate networks, expires in 1 year

## Security Best Practices

### Token Management
1. **Unique Tokens**: Generate cryptographically secure random tokens
2. **Rotation**: Regularly rotate production tokens
3. **Expiration**: Set reasonable expiration dates for production tokens
4. **Least Privilege**: Grant minimum required permissions
5. **Environment Separation**: Use different tokens per environment

### IP Whitelisting
1. **Specific Networks**: Avoid `0.0.0.0/0` unless necessary
2. **Corporate Networks**: Use company IP ranges for internal tools
3. **Development**: Restrict to local networks (192.168.0.0/16, 10.0.0.0/8)
4. **Regular Audits**: Review and update IP whitelists regularly

### Domain Whitelisting  
1. **Exact Domains**: Use specific domains when possible
2. **Wildcard Caution**: Be careful with broad wildcards like `*.*`
3. **Development Domains**: Separate patterns for dev environments
4. **HTTPS Only**: Consider enforcing HTTPS-only domains

### Monitoring
1. **Failed Attempts**: Log and monitor authentication failures
2. **IP Violations**: Alert on IP whitelist violations
3. **Token Usage**: Track token usage patterns
4. **Domain Violations**: Monitor unexpected domain access

## API Usage Examples

### Valid Request
```bash
curl -H "Authorization: Bearer dev-local-token-123-secure" \
     -H "Origin: http://localhost:3000" \
     http://localhost:8787/api/items
```

### Error Responses

**Invalid Token:**
```json
{
  "error": "Unauthorized",
  "message": "Token not found"
}
```

**IP Blocked:**
```json
{
  "error": "Unauthorized", 
  "message": "IP address 203.0.113.1 not allowed for this token"
}
```

**Domain Blocked:**
```json
{
  "error": "Unauthorized",
  "message": "Domain malicious.com not allowed for this token"
}
```

**Insufficient Permissions:**
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions. Required: write"
}
```

## Token Administration

### Creating New Tokens
```sql
INSERT INTO tokens (id, token, name, permissions, allowed_ips, allowed_domains, expires_at)
VALUES (
  'new-token-id',
  'secure-random-token-string',
  'API Integration Token',
  'read,write',
  '["203.0.113.0/24"]',
  '["api.example.com", "*.example.com"]',
  datetime('now', '+1 year')
);
```

### Updating Token Permissions
```sql
UPDATE tokens 
SET permissions = 'read,write,delete'
WHERE token = 'existing-token';
```

### Revoking Tokens
```sql
-- Immediate revocation
DELETE FROM tokens WHERE token = 'compromised-token';

-- Expire token
UPDATE tokens 
SET expires_at = datetime('now') 
WHERE token = 'old-token';
```

### Whitelist Updates
```sql
-- Add new IP to whitelist
UPDATE tokens 
SET allowed_ips = json_insert(allowed_ips, '$[#]', '203.0.113.100')
WHERE token = 'target-token';

-- Update domain whitelist
UPDATE tokens
SET allowed_domains = '["newdomain.com", "*.newdomain.com"]'
WHERE token = 'target-token';
```

This security system provides defense-in-depth protection against token abuse while maintaining flexibility for various deployment scenarios.