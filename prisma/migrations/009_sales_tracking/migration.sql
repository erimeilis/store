-- Migration 009: Sales Tracking System
-- Creates tables for recording sales transactions and inventory changes

-- Sales transactions table
-- Records sales from "for sale" tables with complete audit trail
CREATE TABLE IF NOT EXISTS sales (
    id TEXT PRIMARY KEY,
    sale_number TEXT UNIQUE NOT NULL,           -- Auto-generated SALE-YYYY-NNN format
    table_id TEXT NOT NULL,                     -- Which "for sale" table (no FK - preserve on deletion)
    table_name TEXT NOT NULL,                   -- Snapshot of table name for reference
    item_id TEXT NOT NULL,                      -- Which specific item (no FK - preserve on deletion)
    item_snapshot TEXT NOT NULL,                -- Complete item JSON at sale time
    customer_id TEXT NOT NULL,                  -- External customer identifier
    quantity_sold INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    sale_status TEXT NOT NULL DEFAULT 'completed' CHECK (sale_status IN ('pending', 'completed', 'cancelled', 'refunded')),
    payment_method TEXT,                        -- Optional payment method tracking
    notes TEXT,                                 -- Optional sale notes
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    -- NO FOREIGN KEY CONSTRAINTS - sales must survive table deletions for audit compliance
);

-- Inventory transactions table
-- Tracks all changes to "for sale" table items for complete audit trail
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id TEXT PRIMARY KEY,
    table_id TEXT NOT NULL,                     -- Which "for sale" table (no FK - preserve on deletion)
    table_name TEXT NOT NULL,                   -- Snapshot of table name for reference
    item_id TEXT NOT NULL,                      -- Which item (no FK - preserve on deletion)
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('sale', 'add', 'remove', 'update', 'adjust')),
    quantity_change INTEGER,                    -- For sales/adjustments (+/- values)
    previous_data TEXT,                         -- Previous item state JSON (null for new items)
    new_data TEXT,                             -- New item state JSON (null for deleted items)
    reference_id TEXT,                         -- sale_id for sales, null for other changes
    created_by TEXT NOT NULL,                  -- User email or system identifier
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    -- NO FOREIGN KEY CONSTRAINTS - transactions must survive table deletions for audit compliance
);

-- Performance indexes for sales queries
CREATE INDEX IF NOT EXISTS idx_sales_table_id ON sales(table_id);
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_sale_number ON sales(sale_number);
CREATE INDEX IF NOT EXISTS idx_sales_sale_status ON sales(sale_status);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_updated_at ON sales(updated_at);

-- Performance indexes for inventory transactions
CREATE INDEX IF NOT EXISTS idx_inventory_table_id ON inventory_transactions(table_id);
CREATE INDEX IF NOT EXISTS idx_inventory_item_id ON inventory_transactions(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transaction_type ON inventory_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_inventory_reference_id ON inventory_transactions(reference_id);
CREATE INDEX IF NOT EXISTS idx_inventory_created_by ON inventory_transactions(created_by);
CREATE INDEX IF NOT EXISTS idx_inventory_created_at ON inventory_transactions(created_at);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_sales_table_status ON sales(table_id, sale_status);
CREATE INDEX IF NOT EXISTS idx_sales_date_range ON sales(created_at, sale_status);
CREATE INDEX IF NOT EXISTS idx_inventory_table_type ON inventory_transactions(table_id, transaction_type);

-- Schema version comment
-- Schema version: 009 - Added sales and inventory_transactions tables for sales tracking system