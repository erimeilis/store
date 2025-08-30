-- D1 Database Seeding Script
-- Seeds D1 database with the same data as Prisma seed script

-- 1. Create root user
INSERT OR IGNORE INTO users (id, email, name, role, picture, created_at, updated_at) 
VALUES (
  'cm0gqj4kd0000ck8w0j2j8v9x', 
  'eri@admice.com', 
  'Eri Admin', 
  'admin',
  'https://ui-avatars.com/api/?name=Eri%20Admin&background=0D8ABC&color=fff',
  datetime('now'),
  datetime('now')
);

-- 2. Add allowed email for root user domain
INSERT OR IGNORE INTO allowed_emails (id, domain, type, created_at)
VALUES ('root-domain', '@admice.com', 'domain', datetime('now'));

-- 3. Create API tokens for all environments
INSERT OR IGNORE INTO tokens (id, token, name, permissions, allowed_ips, allowed_domains, expires_at, created_at, updated_at)
VALUES 
-- Development Token (all environments)
(
  'cm0gqj4kd0001ck8w0j2j8v9x',
  'dev-local-token-123-secure',
  'Development Token',
  'read,write,delete,admin',
  '["127.0.0.1", "::1", "192.168.0.0/16", "0.0.0.0/0"]',
  '["localhost", "localhost:*", "*.dev", "*.local", "*.pages.dev", "*.workers.dev"]',
  NULL,
  datetime('now'),
  datetime('now')
),
-- Frontend Token (all environments)
(
  'cm0gqj4kd0002ck8w0j2j8v9x',
  '35890e45a5122de41a406cdaa290e711404c1292205b6ad4a10514228df378ce',
  'Frontend Access Token',
  'read,write',
  '["0.0.0.0/0"]',
  '["localhost", "localhost:*", "*.pages.dev", "*.workers.dev", "*.eri-42e.workers.dev", "admice.com", "http://localhost:5173", "http://localhost:*"]',
  NULL,
  datetime('now'),
  datetime('now')
),
-- Read Only Token (for monitoring/corporate use)
(
  'cm0gqj4kd0003ck8w0j2j8v9x',
  'readonly-token-789',
  'Read Only Token',
  'read',
  '["127.0.0.1", "::1", "10.0.0.0/8", "172.16.0.0/12"]',
  '["localhost", "localhost:*", "*.internal", "*.corp", "*.workers.dev"]',
  datetime('now', '+1 year'),
  datetime('now'),
  datetime('now')
);

-- 4. Create table metadata
INSERT OR IGNORE INTO tables (id, name, owner_id, schema, permissions, created_at, updated_at)
VALUES (
  'cm0gqj4kd0004ck8w0j2j8v9x',
  'items',
  'cm0gqj4kd0000ck8w0j2j8v9x',
  '{"columns":[{"name":"id","type":"string","primary":true},{"name":"name","type":"string","required":true},{"name":"description","type":"text","required":false},{"name":"data","type":"json","required":true},{"name":"created_at","type":"datetime","default":"now"},{"name":"updated_at","type":"datetime","default":"now"}],"indexes":[{"name":"idx_items_name","columns":["name"]},{"name":"idx_items_created_at","columns":["created_at"]}]}',
  '{"cm0gqj4kd0000ck8w0j2j8v9x":["read","write","delete","admin"]}',
  datetime('now'),
  datetime('now')
);

-- 5. Create a few sample items (abbreviated version)
INSERT OR IGNORE INTO items (id, name, description, data, created_at, updated_at) VALUES
('cm0gqj4kd0005ck8w0j2j8v9x', 'Premium Wireless Headphones', 'High-quality wireless headphones perfect for everyday use.', '{"price":299.99,"quantity":50,"category":"Electronics","sku":"SKU-WH001","brand":"TechBrand","weight":0.3,"inStock":true,"rating":4.5,"features":["Wireless","Fast charging","HD display"]}', datetime('now'), datetime('now')),
('cm0gqj4kd0006ck8w0j2j8v9x', 'Smart Watch Pro', 'Advanced smartwatch with health monitoring.', '{"price":399.99,"quantity":25,"category":"Electronics","sku":"SKU-SW002","brand":"SmartTech","weight":0.1,"inStock":true,"rating":4.7,"features":["Touch controls","Voice commands","HD display"]}', datetime('now'), datetime('now')),
('cm0gqj4kd0007ck8w0j2j8v9x', 'Coffee Maker Deluxe', 'Professional coffee maker for the home.', '{"price":159.99,"quantity":30,"category":"Home & Garden","sku":"SKU-CM003","brand":"BrewMaster","weight":2.5,"inStock":true,"rating":4.3,"features":["Easy assembly","Durable","Easy to clean"]}', datetime('now'), datetime('now')),
('cm0gqj4kd0008ck8w0j2j8v9x', 'Yoga Mat Eco-Friendly', 'Non-toxic yoga mat made from sustainable materials.', '{"price":79.99,"quantity":75,"category":"Sports & Outdoors","sku":"SKU-YM004","brand":"EcoFit","weight":1.2,"inStock":true,"rating":4.6,"features":["Non-toxic","Weather resistant","Easy to clean"]}', datetime('now'), datetime('now')),
('cm0gqj4kd0009ck8w0j2j8v9x', 'Notebook Premium', 'High-quality notebook for professionals.', '{"price":29.99,"quantity":100,"category":"Office Supplies","sku":"SKU-NB005","brand":"PaperPro","weight":0.5,"inStock":true,"rating":4.2,"features":["High quality","Great value","Popular choice"]}', datetime('now'), datetime('now'));