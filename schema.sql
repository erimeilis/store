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
  ('Sample Item 1', 'This is a test item', '{"category": "test", "priority": "high"}'),
  ('Sample Item 2', 'Another test item', '{"category": "demo", "priority": "medium"}');
