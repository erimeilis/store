# Task: Sales Tracking System

## Objective

Create a comprehensive sales tracking system to record and manage sales transactions when items from "for sale" tables are sold via API. The frontend serves as an admin panel for viewing, filtering, and managing sales records - no direct selling functionality.

## Approach

1. **Database Schema Extension**: Create new tables `sales` and `inventory_transactions` via migration 009
2. **API-Only Sales**: Sales are recorded exclusively through API endpoints with customer_id from external buyers
3. **Admin Panel**: Frontend provides sortable, filterable, searchable, paginated sales management for admins only
4. **Inventory Tracking**: Track all changes to "for sale" table items (additions, removals, sales, modifications)

### Technical Strategy

- **API-First**: All sales operations via API endpoints with proper authentication
- **Multi-Table Support**: Sales table tracks both table_id and item_id for multiple "for sale" tables
- **Item Snapshots**: Preserve complete item JSON at time of sale for audit trail
- **Admin-Only Frontend**: No customer-facing sales interface, admin management only
- **Comprehensive Inventory**: Track all inventory changes across all "for sale" tables
- **Data Preservation**: Sales records must survive table deletions for audit compliance

## Files to Modify/Create

### Database Layer

- `prisma/migrations/009_sales_tracking/migration.sql` - New sales and inventory tables
- `scripts/db-reset.ts` - Update to handle new tables and test all environments (local, preview, production)

### Backend Types

- `src/types/sales.ts` - Sales-related TypeScript interfaces
- `src/types/inventory.ts` - Inventory management types

### Repository Layer

- `src/repositories/salesRepository.ts` - Sales data access with filtering/pagination
- `src/repositories/inventoryRepository.ts` - Inventory transaction access

### Service Layer

- `src/services/salesService/` - Sales business logic modules
    - `createSale.ts` - Process API sales with customer_id validation
    - `updateSale.ts` - Admin-only sale modifications
    - `getSales.ts` - Retrieve sales with sorting, filtering, searching, pagination
- `src/services/inventoryService/` - Inventory tracking
    - `trackInventoryChange.ts` - Log all "for sale" table changes
    - `getTransactions.ts` - Transaction history with filtering

### API Routes

- `src/routes/sales.ts` - Sales API endpoints
    - `POST /api/sales` - Record sale (external customer API)
    - `GET /api/sales` - List sales with admin filtering
    - `PUT /api/sales/{id}` - Admin-only sale updates
    - `DELETE /api/sales/{id}` - Admin-only sale deletion
- `src/routes/inventory.ts` - Inventory tracking endpoints
    - `GET /api/inventory/transactions` - Transaction history

### Frontend Admin Panel

- `frontend/src/app/dashboard/sales/` - Sales management pages (admin only)
    - `page.tsx` - Sales list with sorting, filtering, searching, pagination
    - `[id]/page.tsx` - Sale details view with item snapshot
    - `[id]/edit/page.tsx` - Admin sale editing
- `frontend/src/components/sales/` - Sales admin components
    - `sales-list.tsx` - Advanced table with all admin features
    - `sale-detail-card.tsx` - Display sale with item snapshot
    - `sales-filters.tsx` - Advanced filtering interface

### Enhanced Existing Files

- `frontend/src/types/dynamic-tables.ts` - Extend with sales-related interfaces
- `src/openapi/routes.ts` - Add sales API documentation
- `src/openapi/schemas.ts` - Sales API schema definitions

## Database Schema Details

### Sales Table
```sql
sales (
    id TEXT PRIMARY KEY,
    sale_number TEXT UNIQUE,           -- Auto-generated SALE-YYYY-NNN
    table_id TEXT NOT NULL,            -- Which "for sale" table (no FK - preserve on deletion)
    table_name TEXT NOT NULL,          -- Snapshot of table name for reference
    item_id TEXT NOT NULL,             -- Which specific item (no FK - preserve on deletion)
    item_snapshot TEXT NOT NULL,       -- Complete item JSON at sale time
    customer_id TEXT NOT NULL,         -- External customer identifier
    quantity_sold INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    sale_status TEXT DEFAULT 'completed',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    -- NO FOREIGN KEY CONSTRAINTS - sales must survive table deletions
)
```

### Inventory Transactions Table
```sql
inventory_transactions (
    id TEXT PRIMARY KEY,
    table_id TEXT NOT NULL,            -- Which "for sale" table (no FK - preserve on deletion)
    table_name TEXT NOT NULL,          -- Snapshot of table name for reference
    item_id TEXT NOT NULL,             -- Which item (no FK - preserve on deletion)
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('sale', 'add', 'remove', 'update')),
    quantity_change INTEGER,           -- For sales/adjustments
    previous_data TEXT,                -- Previous item state JSON
    new_data TEXT,                     -- New item state JSON
    reference_id TEXT,                 -- sale_id for sales, null for other changes
    created_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    -- NO FOREIGN KEY CONSTRAINTS - transactions must survive table deletions
)
```

### Key Design Decisions

1. **No Foreign Key Constraints**: Sales and inventory records must survive table deletions
2. **Table Name Snapshots**: Store table names for human-readable references
3. **Complete Data Preservation**: Item snapshots and previous/new state tracking
4. **Audit Trail Integrity**: All historical records remain accessible indefinitely

## Testing Strategy

### Database Testing

1. **Migration Verification**: Ensure migration 009 creates correct schema
2. **Multi-Environment Reset**: Test db-reset on local, preview, AND production
3. **Table Deletion Survival**: Test that sales survive when source tables are deleted
4. **Data Integrity**: Verify snapshot preservation and audit trails

### API Testing

1. **Sales API**: Test external customer sale recording
2. **Admin API**: Test admin-only operations (view, edit, delete)
3. **Authentication**: Verify proper API token validation
4. **Inventory Tracking**: Test automatic inventory transaction logging
5. **Orphaned Records**: Test sales/inventory access after table deletion

### Frontend Admin Testing

1. **Sales Management**: Test sorting, filtering, searching, pagination
2. **Item Snapshots**: Verify complete item data preservation
3. **Admin Permissions**: Confirm only admins can access sales panel
4. **Responsive Design**: Test admin interface on all screen sizes
5. **Deleted Table Handling**: Test UI behavior with orphaned sales records

### End-to-End Testing

1. **API Sales Flow**: External API → Record sale → Update inventory → Admin view
2. **Multi-Table Sales**: Test sales from different "for sale" tables
3. **Inventory Tracking**: Verify all "for sale" changes are logged
4. **Data Consistency**: Ensure referential integrity across operations
5. **Table Lifecycle**: Create table → Add items → Record sales → Delete table → Verify sales persistence

### Post-Implementation Verification

- **Database Reset Testing**: Run and verify on ALL environments:
    - `tsx scripts/db-reset.ts local`
    - `tsx scripts/db-reset.ts preview`
    - `tsx scripts/db-reset.ts production`
- **API Documentation**: Verify OpenAPI specs for external integration
- **Admin Interface**: Test complete sales management workflow
- **Performance**: Test with large datasets and concurrent operations
- **Audit Compliance**: Verify sales records survive all table operations
