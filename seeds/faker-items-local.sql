-- Dynamic Items Seed for LOCAL environment
-- Generated with faker.js - 5 items

-- Insert 5 dynamically generated items
INSERT OR IGNORE INTO items (id, name, description, data, created_at, updated_at) VALUES ('local-item-001', 'Frozen Bronze Gloves', 'Discover the fox-like agility of our Cheese, perfect for ornery users', '{"price":427.59,"category":"Fashion","quantity":93,"brand":"Jenkins - Kovacek","rating":3.7,"sku":"FAS-Y1HXLBDZ"}', datetime('now'), datetime('now')),
('local-item-002', 'Practical Bronze Shoes', 'Featuring Hafnium-enhanced technology, our Shoes offers unparalleled beloved performance', '{"price":454.09,"category":"Books","quantity":39,"brand":"Brown, Kerluke and Mante","rating":3.5,"sku":"BOO-MTFYRVIQ"}', datetime('now'), datetime('now')),
('local-item-003', 'Handmade Marble Shirt', 'The sleek and short-term Keyboard comes with silver LED lighting for smart functionality', '{"price":255.69,"category":"Home","quantity":16,"brand":"Renner - Maggio","rating":4.9,"sku":"HOM-CT2RTFOF"}', datetime('now'), datetime('now')),
('local-item-004', 'Practical Metal Pizza', 'Rustic Tuna designed with Wooden for shady performance', '{"price":376.28,"category":"Home","quantity":75,"brand":"Von - Renner","rating":3.8,"sku":"HOM-LVLV9TCQ"}', datetime('now'), datetime('now')),
('local-item-005', 'Bespoke Cotton Chips', 'New teal Computer with ergonomic design for youthful comfort', '{"price":441.88,"category":"Electronics","quantity":56,"brand":"Hagenes - Bruen","rating":4.5,"sku":"ELE-GLPESNIV"}', datetime('now'), datetime('now'));

-- Report completion
SELECT 'LOCAL items seed completed: 5 items created' as result;
