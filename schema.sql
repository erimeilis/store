-- Create items table
CREATE TABLE items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  data JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX idx_items_name ON items(name);
CREATE INDEX idx_items_created_at ON items(created_at);

-- Insert sample data for testing
INSERT INTO items (name, description, data) VALUES 
  ('Premium Coffee Beans', 'High-quality arabica coffee beans from Colombia', '{"price": 24.99, "quantity": 50, "category": "Beverages"}'),
  ('Wireless Headphones', 'Bluetooth noise-canceling headphones', '{"price": 199.99, "quantity": 8, "category": "Electronics"}'),
  ('Organic Green Tea', 'Premium organic green tea leaves', '{"price": 15.50, "quantity": 0, "category": "Beverages"}');

-- Auth.js required tables for D1 adapter
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  emailVerified INTEGER,
  image TEXT
);

CREATE TABLE accounts (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  providerAccountId TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(provider, providerAccountId)
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  sessionToken TEXT UNIQUE NOT NULL,
  userId TEXT NOT NULL,
  expires INTEGER NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires INTEGER NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- Create tokens table for Bearer token authentication
CREATE TABLE tokens (
  id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
  token TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  permissions TEXT DEFAULT 'read', -- comma-separated permissions: read,write,delete,admin
  expires_at DATETIME, -- NULL means never expires
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default tokens for development
INSERT INTO tokens (token, name, permissions) VALUES 
  ('35890e45a5122de41a406cdaa290e711404c1292205b6ad4a10514228df378ce', 'Frontend Access Token', 'read,write'),
  ('eeb77aa92c4763586c086b89876037dc74b3252e19fe5dbd2ea0a80100e3855f', 'Full Access Token', 'read,write,delete,admin'),
  ('dev-read-only-token', 'Read Only Token', 'read');

-- Create indexes for faster queries on auth tables
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_accounts_userId ON accounts(userId);
CREATE INDEX idx_sessions_userId ON sessions(userId);
CREATE INDEX idx_sessions_sessionToken ON sessions(sessionToken);
CREATE INDEX idx_tokens_token ON tokens(token);
CREATE INDEX idx_tokens_expires_at ON tokens(expires_at);
