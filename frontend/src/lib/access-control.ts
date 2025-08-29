// Access control utilities for user permission management
import { D1Database } from '@cloudflare/workers-types'

export interface AllowedUser {
  id: number
  email: string
  added_by: string | null
  added_at: string
  is_admin: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export interface AllowedDomain {
  id: number
  domain: string
  added_by: string | null
  added_at: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface SystemSetting {
  key: string
  value: string
  created_at: string
  updated_at: string
}

// Check if a user email is allowed to access the system
export async function isUserAllowed(db: D1Database, email: string): Promise<boolean> {
  try {
    // Check if email is explicitly allowed
    const userResult = await db.prepare(
      'SELECT id FROM allowed_users WHERE email = ?'
    ).bind(email).first()
    
    if (userResult) {
      return true
    }
    
    // Check if email matches any allowed domains
    const emailDomain = email.split('@')[1]
    if (!emailDomain) {
      return false
    }
    
    const domainResults = await db.prepare(
      'SELECT domain FROM allowed_domains'
    ).all()
    
    for (const row of domainResults.results) {
      const allowedDomain = (row as any).domain
      // Handle both "@company.com" and "company.com" formats
      const cleanDomain = allowedDomain.startsWith('@') ? allowedDomain.slice(1) : allowedDomain
      
      if (emailDomain === cleanDomain) {
        return true
      }
    }
    
    return false
  } catch (error) {
    console.error('Error checking user access:', error)
    return false
  }
}

// Check if this is the first user in the system
export async function isFirstUser(db: D1Database): Promise<boolean> {
  try {
    const setting = await db.prepare(
      'SELECT value FROM system_settings WHERE key = ?'
    ).bind('first_user_setup').first() as SystemSetting | null
    
    return setting?.value === 'false'
  } catch (error) {
    console.error('Error checking first user status:', error)
    return false
  }
}

// Mark first user as set up and add them to allowed users
export async function setupFirstUser(db: D1Database, email: string, _name?: string): Promise<void> {
  try {
    // Start a transaction-like batch
    const batch = [
      // Add user to allowed_users table as admin
      db.prepare(
        'INSERT INTO allowed_users (email, added_by, is_admin, notes) VALUES (?, ?, ?, ?)'
      ).bind(email, 'system', true, 'First user - automatically granted admin access'),
      
      // Update system setting
      db.prepare(
        'UPDATE system_settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?'
      ).bind('true', 'first_user_setup')
    ]
    
    // Execute all statements
    for (const stmt of batch) {
      await stmt.run()
    }
    
    console.log(`First user ${email} has been set up with admin access`)
  } catch (error) {
    console.error('Error setting up first user:', error)
    throw error
  }
}

// Add a user to the allowed list
export async function addAllowedUser(
  db: D1Database, 
  email: string, 
  addedBy: string, 
  isAdmin: boolean = false, 
  notes?: string
): Promise<AllowedUser> {
  try {
    const result = await db.prepare(
      'INSERT INTO allowed_users (email, added_by, is_admin, notes) VALUES (?, ?, ?, ?) RETURNING *'
    ).bind(email, addedBy, isAdmin, notes || null).first()
    
    return result as unknown as AllowedUser
  } catch (error) {
    console.error('Error adding allowed user:', error)
    throw error
  }
}

// Add a domain to the allowed list
export async function addAllowedDomain(
  db: D1Database, 
  domain: string, 
  addedBy: string, 
  notes?: string
): Promise<AllowedDomain> {
  try {
    // Normalize domain format (ensure it doesn't start with @)
    const cleanDomain = domain.startsWith('@') ? domain.slice(1) : domain
    
    const result = await db.prepare(
      'INSERT INTO allowed_domains (domain, added_by, notes) VALUES (?, ?, ?) RETURNING *'
    ).bind(cleanDomain, addedBy, notes || null).first()
    
    return result as unknown as AllowedDomain
  } catch (error) {
    console.error('Error adding allowed domain:', error)
    throw error
  }
}

// Get all allowed users
export async function getAllowedUsers(db: D1Database): Promise<AllowedUser[]> {
  try {
    const result = await db.prepare(
      'SELECT * FROM allowed_users ORDER BY created_at DESC'
    ).all()
    
    return result.results as unknown as AllowedUser[]
  } catch (error) {
    console.error('Error fetching allowed users:', error)
    return []
  }
}

// Get all allowed domains
export async function getAllowedDomains(db: D1Database): Promise<AllowedDomain[]> {
  try {
    const result = await db.prepare(
      'SELECT * FROM allowed_domains ORDER BY created_at DESC'
    ).all()
    
    return result.results as unknown as AllowedDomain[]
  } catch (error) {
    console.error('Error fetching allowed domains:', error)
    return []
  }
}

// Remove a user from allowed list
export async function removeAllowedUser(db: D1Database, id: number): Promise<boolean> {
  try {
    const result = await db.prepare(
      'DELETE FROM allowed_users WHERE id = ?'
    ).bind(id).run()
    
    return (result.meta?.changes ?? 0) > 0
  } catch (error) {
    console.error('Error removing allowed user:', error)
    return false
  }
}

// Remove a domain from allowed list
export async function removeAllowedDomain(db: D1Database, id: number): Promise<boolean> {
  try {
    const result = await db.prepare(
      'DELETE FROM allowed_domains WHERE id = ?'
    ).bind(id).run()
    
    return (result.meta?.changes ?? 0) > 0
  } catch (error) {
    console.error('Error removing allowed domain:', error)
    return false
  }
}

// Check if user is admin
export async function isUserAdmin(db: D1Database, email: string): Promise<boolean> {
  try {
    const result = await db.prepare(
      'SELECT is_admin FROM allowed_users WHERE email = ?'
    ).bind(email).first()
    
    return result ? Boolean((result as any).is_admin) : false
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}