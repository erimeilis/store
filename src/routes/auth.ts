/**
 * Authentication API Routes
 * Handles user registration and management after OAuth
 */

import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'
import type { Bindings } from '../../types/bindings.js'
import { writeAuthMiddleware } from '@/middleware/auth.js'

const auth = new Hono<{ Bindings: Bindings }>()

/**
 * Register or update user after successful OAuth
 * Frontend calls this after getting user info from Google
 */
auth.post('/register', writeAuthMiddleware, async (c) => {
  console.log('=== BACKEND USER REGISTER ENDPOINT ===')
  console.log('Request method:', c.req.method)
  const headers: Record<string, string> = {}
  c.req.raw.headers.forEach((value, key) => {
    headers[key] = value
  })
  console.log('Request headers:', headers)
  
  try {
    const body = await c.req.json()
    const { name, email, picture } = body
    
    console.log('Request body:', { name, email, picture })

    if (!email) {
      console.log('ERROR: Email is missing from request')
      return c.json({ error: 'Email is required' }, 400)
    }

    // Create Prisma client with D1 adapter
    const adapter = new PrismaD1(c.env.DB)
    const prisma = new PrismaClient({ adapter })

    // Check if user exists in database
    let user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Check if this is the first user (should be admin)
      const userCount = await prisma.user.count()
      const isFirstUser = userCount === 0

      // Create new user
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0],
          picture,
          role: isFirstUser ? 'admin' : 'user'
        }
      })

      console.log(`Created new ${isFirstUser ? 'admin' : 'user'} account for: ${email}`)
    } else {
      // Update existing user info from Google
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: name || user.name,
          picture: picture || user.picture
        }
      })

      console.log(`Updated user info for: ${email}`)
    }

    return c.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        picture: user.picture
      }
    })

  } catch (error) {
    console.error('User registration error:', error)
    return c.json({ error: 'Failed to register user' }, 500)
  }
})

export { auth }