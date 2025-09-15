#!/usr/bin/env tsx

/**
 * Dynamic Items Seed Generator
 * Generates faker.js data for items table with environment-specific counts
 */

import { faker } from '@faker-js/faker';
import { writeFileSync } from 'fs';

interface ItemData {
  price: number;
  category: string;
  quantity: number;
  brand?: string;
  rating?: number;
  sku?: string;
}

interface Item {
  id: string;
  name: string;
  description: string;
  data: ItemData;
}

const CATEGORIES = ['Electronics', 'Home', 'Fashion', 'Sports', 'Office', 'Books', 'Garden', 'Health'];

export function generateItems(count: number, environment: string): Item[] {
  // Use environment-specific seed for consistent results
  const seeds: Record<string, number> = {
    local: 1001,
    preview: 2002,
    production: 3003
  };

  faker.seed(seeds[environment] || 1001);
  
  const items: Item[] = [];

  for (let i = 1; i <= count; i++) {
    const category = faker.helpers.arrayElement(CATEGORIES);
    const item: Item = {
      id: `${environment}-item-${i.toString().padStart(3, '0')}`,
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      data: {
        price: parseFloat(faker.commerce.price({ min: 5, max: 500 })),
        category,
        quantity: faker.number.int({ min: 0, max: 100 }),
        brand: faker.company.name(),
        rating: parseFloat(faker.number.float({ min: 3.5, max: 5.0, fractionDigits: 1 }).toFixed(1)),
        sku: `${category.substring(0, 3).toUpperCase()}-${faker.string.alphanumeric(8).toUpperCase()}`
      }
    };
    items.push(item);
  }

  return items;
}

export function generateSQL(items: Item[], environment: string): string {
  const header = `-- Dynamic Items Seed for ${environment.toUpperCase()} environment
-- Generated with faker.js - ${items.length} items

-- Insert ${items.length} dynamically generated items
INSERT OR IGNORE INTO items (id, name, description, data, created_at, updated_at) VALUES `;

  const values = items.map(item => 
    `('${item.id}', '${item.name.replace(/'/g, "''")}', '${item.description.replace(/'/g, "''")}', '${JSON.stringify(item.data).replace(/'/g, "''")}', datetime('now'), datetime('now'))`
  );

  const footer = `;\n\n-- Report completion\nSELECT '${environment.toUpperCase()} items seed completed: ${items.length} items created' as result;\n`;

  return header + values.join(',\n') + footer;
}

export function generateSeedFile(environment: string, count: number): void {
  console.log(`🎲 Generating ${count} items for ${environment} environment...`);
  
  const items = generateItems(count, environment);
  const sql = generateSQL(items, environment);
  
  const fileName = `seeds/faker-items-${environment}.sql`;
  writeFileSync(fileName, sql);
  
  console.log(`✅ Generated ${fileName} with ${count} items`);
}

// CLI usage - check if this file is being run directly
const isRunDirectly = process.argv[1]?.endsWith('faker-items-generator.ts');
if (isRunDirectly) {
  const environment = process.argv[2];
  const count = parseInt(process.argv[3]);

  if (!environment || !count) {
    console.error('Usage: tsx seeds/faker-items-generator.ts <environment> <count>');
    console.error('Example: tsx seeds/faker-items-generator.ts local 10');
    process.exit(1);
  }

  generateSeedFile(environment, count);
}