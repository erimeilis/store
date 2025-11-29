-- Migration 004: Commerce System
-- Creates tables for sales tracking, inventory changes, and rental transactions

-- Sales transactions table
-- Records sales from "sale" type tables with complete audit trail
CREATE TABLE IF NOT EXISTS sales (
    id TEXT PRIMARY KEY,
    saleNumber TEXT UNIQUE NOT NULL,
    tableId TEXT NOT NULL,
    tableName TEXT NOT NULL,
    itemId TEXT NOT NULL,
    itemSnapshot TEXT NOT NULL,
    customerId TEXT NOT NULL,
    quantitySold INTEGER NOT NULL DEFAULT 1,
    unitPrice DECIMAL(10,2) NOT NULL,
    totalAmount DECIMAL(10,2) NOT NULL,
    saleStatus TEXT NOT NULL DEFAULT 'completed' CHECK (saleStatus IN ('pending', 'completed', 'cancelled', 'refunded')),
    paymentMethod TEXT,
    notes TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sales indexes
CREATE INDEX IF NOT EXISTS idx_sales_tableId ON sales(tableId);
CREATE INDEX IF NOT EXISTS idx_sales_customerId ON sales(customerId);
CREATE INDEX IF NOT EXISTS idx_sales_saleNumber ON sales(saleNumber);
CREATE INDEX IF NOT EXISTS idx_sales_saleStatus ON sales(saleStatus);
CREATE INDEX IF NOT EXISTS idx_sales_createdAt ON sales(createdAt);
CREATE INDEX IF NOT EXISTS idx_sales_table_status ON sales(tableId, saleStatus);
CREATE INDEX IF NOT EXISTS idx_sales_date_range ON sales(createdAt, saleStatus);

-- Inventory transactions table
-- Tracks all changes to "sale" type table items for complete audit trail
CREATE TABLE IF NOT EXISTS inventoryTransactions (
    id TEXT PRIMARY KEY,
    tableId TEXT NOT NULL,
    tableName TEXT NOT NULL,
    itemId TEXT NOT NULL,
    transactionType TEXT NOT NULL CHECK (transactionType IN ('sale', 'rent', 'release', 'add', 'remove', 'update', 'adjust')),
    quantityChange INTEGER,
    previousData TEXT,
    newData TEXT,
    referenceId TEXT,
    createdBy TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Inventory transactions indexes
CREATE INDEX IF NOT EXISTS idx_inventory_tableId ON inventoryTransactions(tableId);
CREATE INDEX IF NOT EXISTS idx_inventory_itemId ON inventoryTransactions(itemId);
CREATE INDEX IF NOT EXISTS idx_inventory_transactionType ON inventoryTransactions(transactionType);
CREATE INDEX IF NOT EXISTS idx_inventory_referenceId ON inventoryTransactions(referenceId);
CREATE INDEX IF NOT EXISTS idx_inventory_createdBy ON inventoryTransactions(createdBy);
CREATE INDEX IF NOT EXISTS idx_inventory_createdAt ON inventoryTransactions(createdAt);
CREATE INDEX IF NOT EXISTS idx_inventory_table_type ON inventoryTransactions(tableId, transactionType);

-- Rental transactions table
-- Records rentals from "rent" type tables with rental lifecycle tracking
CREATE TABLE IF NOT EXISTS rentals (
    id TEXT PRIMARY KEY,
    rentalNumber TEXT UNIQUE NOT NULL,
    tableId TEXT NOT NULL,
    tableName TEXT NOT NULL,
    itemId TEXT NOT NULL,
    itemSnapshot TEXT NOT NULL,
    customerId TEXT NOT NULL,
    unitPrice DECIMAL(10,2) NOT NULL,
    rentalStatus TEXT NOT NULL DEFAULT 'active' CHECK (rentalStatus IN ('active', 'released', 'cancelled')),
    rentedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    releasedAt DATETIME,
    notes TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Rentals indexes
CREATE INDEX IF NOT EXISTS idx_rentals_tableId ON rentals(tableId);
CREATE INDEX IF NOT EXISTS idx_rentals_customerId ON rentals(customerId);
CREATE INDEX IF NOT EXISTS idx_rentals_rentalNumber ON rentals(rentalNumber);
CREATE INDEX IF NOT EXISTS idx_rentals_rentalStatus ON rentals(rentalStatus);
CREATE INDEX IF NOT EXISTS idx_rentals_itemId ON rentals(itemId);
CREATE INDEX IF NOT EXISTS idx_rentals_rentedAt ON rentals(rentedAt);
CREATE INDEX IF NOT EXISTS idx_rentals_table_status ON rentals(tableId, rentalStatus);

-- Schema version: 004 - Commerce system (sales, inventory, rentals)
