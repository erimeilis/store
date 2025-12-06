-- Migration 007: Module System
-- Creates tables for the module extension system
-- Supports module installation, lifecycle management, and analytics

-- ============================================================================
-- INSTALLED MODULES - Track installed modules and their state
-- ============================================================================

CREATE TABLE IF NOT EXISTS installedModules (
    id TEXT PRIMARY KEY,                    -- Module ID (e.g., '@store/phone-numbers')
    name TEXT NOT NULL,                     -- Package name
    version TEXT NOT NULL,                  -- Semantic version
    displayName TEXT NOT NULL,              -- Human-readable name
    description TEXT,                       -- Module description
    author TEXT NOT NULL,                   -- JSON: { name, email?, url? }
    source TEXT NOT NULL,                   -- JSON: { type, url?, version?, branch?, auth? }
    status TEXT NOT NULL DEFAULT 'installed' CHECK (status IN (
        'installing', 'installed', 'activating', 'active',
        'deactivating', 'disabled', 'error', 'updating', 'uninstalling'
    )),
    manifest TEXT NOT NULL,                 -- Full manifest JSON
    settings TEXT DEFAULT '{}',             -- Module settings JSON
    error TEXT,                             -- Last error message
    errorAt DATETIME,                       -- When error occurred
    installedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    activatedAt DATETIME                    -- When last activated
);

-- Indexes for installedModules
CREATE INDEX IF NOT EXISTS idx_installedModules_status ON installedModules(status);
CREATE INDEX IF NOT EXISTS idx_installedModules_name ON installedModules(name);

-- ============================================================================
-- MODULE CAPABILITIES - Index of what each module provides
-- ============================================================================

CREATE TABLE IF NOT EXISTS moduleCapabilities (
    id TEXT PRIMARY KEY,                    -- UUID
    moduleId TEXT NOT NULL,                 -- Reference to installedModules
    type TEXT NOT NULL CHECK (type IN ('columnType', 'dataGenerator', 'api')),
    identifier TEXT NOT NULL,               -- typeId, generatorId, or basePath
    metadata TEXT,                          -- Additional capability metadata JSON
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (moduleId) REFERENCES installedModules(id) ON DELETE CASCADE,
    UNIQUE(moduleId, type, identifier)
);

-- Indexes for moduleCapabilities
CREATE INDEX IF NOT EXISTS idx_moduleCapabilities_moduleId ON moduleCapabilities(moduleId);
CREATE INDEX IF NOT EXISTS idx_moduleCapabilities_type ON moduleCapabilities(type);
CREATE INDEX IF NOT EXISTS idx_moduleCapabilities_type_identifier ON moduleCapabilities(type, identifier);

-- ============================================================================
-- MODULE ANALYTICS - Usage tracking (opt-out capable)
-- ============================================================================

CREATE TABLE IF NOT EXISTS moduleAnalytics (
    id TEXT PRIMARY KEY,                    -- UUID
    moduleId TEXT NOT NULL UNIQUE,          -- Reference to installedModules
    installCount INTEGER DEFAULT 1,         -- Number of installations
    activationCount INTEGER DEFAULT 0,      -- Number of activations
    errorCount INTEGER DEFAULT 0,           -- Total errors
    lastErrorMessage TEXT,                  -- Last error message
    lastErrorAt DATETIME,                   -- When last error occurred
    totalActivationTimeMs INTEGER DEFAULT 0, -- Cumulative activation time
    totalApiCalls INTEGER DEFAULT 0,        -- Total API calls handled
    totalApiTimeMs INTEGER DEFAULT 0,       -- Cumulative API response time
    columnTypeUsage TEXT DEFAULT '{}',      -- JSON: { typeId: count }
    generatorInvocations INTEGER DEFAULT 0, -- Total generator calls
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (moduleId) REFERENCES installedModules(id) ON DELETE CASCADE
);

-- Index for moduleAnalytics
CREATE INDEX IF NOT EXISTS idx_moduleAnalytics_moduleId ON moduleAnalytics(moduleId);

-- ============================================================================
-- MODULE EVENTS - Audit log for module lifecycle events
-- ============================================================================

CREATE TABLE IF NOT EXISTS moduleEvents (
    id TEXT PRIMARY KEY,                    -- UUID
    moduleId TEXT NOT NULL,                 -- Reference to installedModules
    eventType TEXT NOT NULL CHECK (eventType IN (
        'install', 'activate', 'deactivate', 'update',
        'uninstall', 'error', 'settings_change', 'reload'
    )),
    previousVersion TEXT,                   -- For update events
    newVersion TEXT,                        -- For install/update events
    previousStatus TEXT,                    -- Status before event
    newStatus TEXT,                         -- Status after event
    details TEXT,                           -- Additional JSON details
    createdBy TEXT,                         -- User who triggered event
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (moduleId) REFERENCES installedModules(id) ON DELETE CASCADE
);

-- Indexes for moduleEvents
CREATE INDEX IF NOT EXISTS idx_moduleEvents_moduleId ON moduleEvents(moduleId);
CREATE INDEX IF NOT EXISTS idx_moduleEvents_eventType ON moduleEvents(eventType);
CREATE INDEX IF NOT EXISTS idx_moduleEvents_createdAt ON moduleEvents(createdAt);

-- Schema version: 007 - Module system with capabilities, analytics, and events
