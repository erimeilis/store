-- Migration 009: Sales Tracking System
-- Creates tables for recording sales transactions and inventory changes

-- Sales transactions table
-- Records sales from "for sale" tables with complete audit trail
CREATE TABLE IF NOT EXISTS sales (
    id TEXT PRIMARY KEY,
    saleNumber TEXT UNIQUE NOT NULL,           -- Auto-generated SALE-YYYY-NNN format
    tableId TEXT NOT NULL,                     -- Which "for sale" table (no FK - preserve on deletion)
    tableName TEXT NOT NULL,                   -- Snapshot of table name for reference
    itemId TEXT NOT NULL,                      -- Which specific item (no FK - preserve on deletion)
    itemSnapshot TEXT NOT NULL,                -- Complete item JSON at sale time
    customerId TEXT NOT NULL,                  -- External customer identifier
    quantitySold INTEGER NOT NULL DEFAULT 1,
    unitPrice DECIMAL(10,2) NOT NULL,
    totalAmount DECIMAL(10,2) NOT NULL,
    saleStatus TEXT NOT NULL DEFAULT 'completed' CHECK (saleStatus IN ('pending', 'completed', 'cancelled', 'refunded')),
    paymentMethod TEXT,                        -- Optional payment method tracking
    notes TEXT,                                 -- Optional sale notes
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    -- NO FOREIGN KEY CONSTRAINTS - sales must survive table deletions for audit compliance
);

-- Inventory transactions table
-- Tracks all changes to "for sale" table items for complete audit trail
CREATE TABLE IF NOT EXISTS inventoryTransactions (
    id TEXT PRIMARY KEY,
    tableId TEXT NOT NULL,                     -- Which "for sale" table (no FK - preserve on deletion)
    tableName TEXT NOT NULL,                   -- Snapshot of table name for reference
    itemId TEXT NOT NULL,                      -- Which item (no FK - preserve on deletion)
    transactionType TEXT NOT NULL CHECK (transactionType IN ('sale', 'add', 'remove', 'update', 'adjust')),
    quantityChange INTEGER,                    -- For sales/adjustments (+/- values)
    previousData TEXT,                         -- Previous item state JSON (null for new items)
    newData TEXT,                             -- New item state JSON (null for deleted items)
    referenceId TEXT,                         -- sale_id for sales, null for other changes
    createdBy TEXT NOT NULL,                  -- User email or system identifier
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    -- NO FOREIGN KEY CONSTRAINTS - transactions must survive table deletions for audit compliance
);

-- Performance indexes for sales queries
CREATE INDEX IF NOT EXISTS idx_sales_tableId ON sales(tableId);
CREATE INDEX IF NOT EXISTS idx_sales_customerId ON sales(customerId);
CREATE INDEX IF NOT EXISTS idx_sales_saleNumber ON sales(saleNumber);
CREATE INDEX IF NOT EXISTS idx_sales_saleStatus ON sales(saleStatus);
CREATE INDEX IF NOT EXISTS idx_sales_createdAt ON sales(createdAt);
CREATE INDEX IF NOT EXISTS idx_sales_updatedAt ON sales(updatedAt);

-- Performance indexes for inventory transactions
CREATE INDEX IF NOT EXISTS idx_inventory_tableId ON inventoryTransactions(tableId);
CREATE INDEX IF NOT EXISTS idx_inventory_itemId ON inventoryTransactions(itemId);
CREATE INDEX IF NOT EXISTS idx_inventory_transactionType ON inventoryTransactions(transactionType);
CREATE INDEX IF NOT EXISTS idx_inventory_referenceId ON inventoryTransactions(referenceId);
CREATE INDEX IF NOT EXISTS idx_inventory_createdBy ON inventoryTransactions(createdBy);
CREATE INDEX IF NOT EXISTS idx_inventory_createdAt ON inventoryTransactions(createdAt);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_sales_table_status ON sales(tableId, saleStatus);
CREATE INDEX IF NOT EXISTS idx_sales_date_range ON sales(createdAt, saleStatus);
CREATE INDEX IF NOT EXISTS idx_inventory_table_type ON inventoryTransactions(tableId, transactionType);

-- Schema version comment
-- Schema version: 009 - Added sales and inventoryTransactions tables for sales tracking system