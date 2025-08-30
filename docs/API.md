# API Reference

## 🔐 Authentication

All API endpoints require Bearer token authentication:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8787/api/endpoint
```

**Available Tokens:**
- `35890e45a5122de41a406cdaa290e711404c1292205b6ad4a10514228df378ce` - Frontend token (read/write)
- `dev-local-token-123-secure` - Development token (admin)
- `readonly-token-789` - Read-only token

## 📋 Items API

### List Items
```http
GET /api/items
```

**Response:**
```json
{
  "success": true,
  "items": [
    {
      "id": "item001",
      "name": "Premium Wireless Headphones",
      "description": "High-quality premium wireless headphones...",
      "data": {
        "price": 299.99,
        "quantity": 42,
        "category": "Electronics",
        "sku": "SKU-A7F2G8H1",
        "brand": "Brand3",
        "weight": 0.8,
        "inStock": true,
        "rating": 4.2,
        "features": ["Wireless", "Fast charging", "HD display"]
      },
      "created_at": "2024-08-30T12:00:00Z",
      "updated_at": "2024-08-30T12:00:00Z"
    }
  ],
  "total": 205
}
```

### Get Item
```http
GET /api/items/:id
```

### Create Item
```http
POST /api/items
Content-Type: application/json

{
  "name": "New Product",
  "description": "Product description",
  "data": {
    "price": 99.99,
    "quantity": 10,
    "category": "Electronics"
  }
}
```

### Update Item
```http
PUT /api/items/:id
Content-Type: application/json

{
  "name": "Updated Product Name",
  "data": {
    "price": 149.99,
    "quantity": 5
  }
}
```

### Delete Item
```http
DELETE /api/items/:id
```

## 🏥 System Endpoints

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-08-30T12:00:00Z",
  "environment": "development"
}
```

### API Status
```http
GET /
```

## 🔑 Authentication Endpoints

### Google OAuth
```http
GET /auth/google
```
Redirects to Google OAuth consent screen.

### OAuth Callback
```http
GET /auth/callback/google?code=OAUTH_CODE
```
Handles Google OAuth callback and creates session.

### Logout
```http
POST /auth/logout
```

## 🚨 Error Responses

**401 Unauthorized:**
```json
{
  "error": "Unauthorized",
  "message": "Token not found"
}
```

**404 Not Found:**
```json
{
  "error": "Not Found",
  "message": "Item not found"
}
```

**400 Bad Request:**
```json
{
  "error": "Validation Error",
  "message": "Invalid request data",
  "details": ["name is required"]
}
```