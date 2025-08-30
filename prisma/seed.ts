/**
 * Prisma Database Seeder
 * Seeds database with configurable root user, tokens, and fake data
 * 
 * Usage:
 *   npx prisma db seed
 *   ADMIN_EMAIL=custom@email.com npx prisma db seed
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Get configurable values from environment
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'eri@admice.com'
const ADMIN_NAME = process.env.ADMIN_NAME || 'Eri Admin'
const DEV_TOKEN = process.env.DEV_TOKEN || 'dev-local-token-123-secure'

async function main() {
  console.log('🌱 Starting database seeding...')

  // 1. Create root user
  console.log(`👤 Creating root user: ${ADMIN_EMAIL}`)
  const rootUser = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      role: 'admin',
      picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(ADMIN_NAME)}&background=0D8ABC&color=fff`
    }
  })

  // 2. Add allowed email for root user domain
  const domain = ADMIN_EMAIL.split('@')[1]
  console.log(`✉️  Adding allowed domain: @${domain}`)
  await prisma.allowedEmail.upsert({
    where: { id: 'root-domain' },
    update: {},
    create: {
      id: 'root-domain',
      domain: `@${domain}`,
      type: 'domain'
    }
  })

  // 3. Create API tokens with IP/domain whitelist examples
  console.log('🔑 Creating API tokens...')
  
  // Development token (all environments)
  await prisma.token.upsert({
    where: { token: DEV_TOKEN },
    update: {},
    create: {
      token: DEV_TOKEN,
      name: 'Development Token',
      permissions: 'read,write,delete,admin',
      allowedIps: JSON.stringify(['127.0.0.1', '::1', '192.168.0.0/16', '0.0.0.0/0']),
      allowedDomains: JSON.stringify(['localhost', 'localhost:*', '*.dev', '*.local', '*.pages.dev', '*.workers.dev']),
      expiresAt: null // Never expires for development
    }
  })

  // Frontend token (all environments) 
  await prisma.token.upsert({
    where: { token: '35890e45a5122de41a406cdaa290e711404c1292205b6ad4a10514228df378ce' },
    update: {},
    create: {
      token: '35890e45a5122de41a406cdaa290e711404c1292205b6ad4a10514228df378ce',
      name: 'Frontend Access Token',
      permissions: 'read,write',
      allowedIps: JSON.stringify(['0.0.0.0/0']), // Allow all IPs
      allowedDomains: JSON.stringify(['localhost', 'localhost:*', '*.pages.dev', '*.workers.dev', '*.eri-42e.workers.dev', domain, 'http://localhost:5173', 'http://localhost:*']),
      expiresAt: null
    }
  })

  // Read-only token (for monitoring/corporate use)
  await prisma.token.upsert({
    where: { token: 'readonly-token-789' },
    update: {},
    create: {
      token: 'readonly-token-789',
      name: 'Read Only Token',
      permissions: 'read',
      allowedIps: JSON.stringify(['127.0.0.1', '::1', '10.0.0.0/8', '172.16.0.0/12']),
      allowedDomains: JSON.stringify(['localhost', 'localhost:*', '*.internal', '*.corp', '*.workers.dev']),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
    }
  })

  // 4. Create example Tables metadata entry
  console.log('📋 Creating example table metadata...')
  await prisma.table.upsert({
    where: { 
      name_ownerId: {
        name: 'items',
        ownerId: rootUser.id
      }
    },
    update: {},
    create: {
      name: 'items',
      ownerId: rootUser.id,
      schema: JSON.stringify({
        columns: [
          { name: 'id', type: 'string', primary: true },
          { name: 'name', type: 'string', required: true },
          { name: 'description', type: 'text', required: false },
          { name: 'data', type: 'json', required: true },
          { name: 'created_at', type: 'datetime', default: 'now' },
          { name: 'updated_at', type: 'datetime', default: 'now' }
        ],
        indexes: [
          { name: 'idx_items_name', columns: ['name'] },
          { name: 'idx_items_created_at', columns: ['created_at'] }
        ]
      }),
      permissions: JSON.stringify({
        [rootUser.id]: ['read', 'write', 'delete', 'admin']
      })
    }
  })

  // 5. Generate 100 fake Items records
  console.log('🏭 Generating 100 fake items...')
  
  const categories = [
    'Electronics', 'Clothing', 'Home & Garden', 'Sports & Outdoors',
    'Books', 'Toys & Games', 'Health & Beauty', 'Automotive',
    'Food & Beverage', 'Office Supplies'
  ]

  const adjectives = [
    'Premium', 'Deluxe', 'Professional', 'Essential', 'Ultimate',
    'Advanced', 'Classic', 'Modern', 'Eco-Friendly', 'Luxury'
  ]

  const products = [
    'Wireless Headphones', 'Smart Watch', 'Coffee Maker', 'Yoga Mat',
    'Notebook', 'Desk Lamp', 'Water Bottle', 'Phone Case', 'Backpack',
    'Keyboard', 'Mouse Pad', 'Plant Pot', 'Candle', 'Picture Frame',
    'USB Cable', 'Power Bank', 'Bluetooth Speaker', 'Tablet Stand',
    'Webcam', 'Monitor', 'Chair', 'Desk', 'Bookshelf', 'Clock'
  ]

  const items = []
  for (let i = 0; i < 100; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)]
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
    const product = products[Math.floor(Math.random() * products.length)]
    const name = Math.random() > 0.5 ? `${adjective} ${product}` : product!
    const price = parseFloat((Math.random() * 500 + 5).toFixed(2))
    const quantity = Math.floor(Math.random() * 100)

    items.push({
      name,
      description: `High-quality ${name.toLowerCase()} perfect for everyday use. ${category} category.`,
      data: JSON.stringify({
        price,
        quantity,
        category,
        sku: `SKU-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        brand: `Brand${Math.floor(Math.random() * 10) + 1}`,
        weight: parseFloat((Math.random() * 5 + 0.1).toFixed(2)),
        inStock: quantity > 0,
        rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
        features: generateFeatures(category!)
      })
    })
  }

  // Insert items in batches for better performance
  const batchSize = 10
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    await prisma.item.createMany({
      data: batch
    })
  }

  console.log('✅ Database seeding completed!')
  console.log(`📊 Summary:`)
  console.log(`   - Root user: ${ADMIN_EMAIL}`)
  console.log(`   - Allowed domain: @${domain}`)
  console.log(`   - API tokens: 3`)
  console.log(`   - Table metadata: 1 (items)`)
  console.log(`   - Sample items: ${items.length}`)
}

function generateFeatures(category: string): string[] {
  const featureMap: Record<string, string[]> = {
    'Electronics': ['Wireless', 'Fast charging', 'HD display', 'Touch controls', 'Voice commands'],
    'Clothing': ['Machine washable', 'Breathable', 'Wrinkle resistant', 'UV protection', 'Stretch fit'],
    'Home & Garden': ['Easy assembly', 'Durable', 'Weather resistant', 'Non-toxic', 'Easy to clean'],
    'Food & Beverage': ['Organic', 'Gluten free', 'No preservatives', 'Rich in vitamins', 'Natural flavors'],
    'default': ['High quality', 'Great value', 'Customer rated', 'Popular choice']
  }

  const features = featureMap[category] || featureMap.default!
  const count = Math.floor(Math.random() * 3) + 2 // 2-4 features
  const shuffled = [...features].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })