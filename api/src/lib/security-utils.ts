/**
 * Security Utilities
 * Core security functions for user management and access control
 */

import type { PrismaClient } from '@prisma/client'

export interface AdminCountResult {
  canProceed: boolean
  adminCount: number
  message: string
}

export interface EmailValidationResult {
  isAllowed: boolean
  matchType: 'exact' | 'domain' | 'grandfathered' | null
  message: string
}

/**
 * Check if admin deletion/role change is allowed
 * Ensures at least one admin always exists
 */
export async function validateAdminCount(
  database: PrismaClient,
  userIdToCheck: string,
  newRole?: string
): Promise<AdminCountResult> {
  try {
    // Get current admin count
    const adminCount = await database.user.count({
      where: { role: 'admin' }
    })

    // Get the user being modified
    const user = await database.user.findUnique({
      where: { id: userIdToCheck },
      select: { role: true, email: true }
    })

    if (!user) {
      return {
        canProceed: false,
        adminCount,
        message: 'User not found'
      }
    }

    // If user is currently admin and we're removing admin role or deleting
    if (user.role === 'admin') {
      // If this is the last admin, prevent the action
      if (adminCount <= 1) {
        return {
          canProceed: false,
          adminCount,
          message: 'Cannot remove the last admin user. At least one admin must exist.'
        }
      }

      // If changing role from admin to user, check if safe
      if (newRole && newRole !== 'admin') {
        if (adminCount <= 1) {
          return {
            canProceed: false,
            adminCount,
            message: 'Cannot change the last admin to user role. At least one admin must exist.'
          }
        }
      }
    }

    return {
      canProceed: true,
      adminCount,
      message: `Operation allowed. ${adminCount} admin(s) currently exist.`
    }

  } catch (error) {
    console.error('Error validating admin count:', error)
    return {
      canProceed: false,
      adminCount: 0,
      message: 'Failed to validate admin count due to database error'
    }
  }
}

/**
 * Validate if an email is allowed for new user registration
 * Checks against allowed_emails table for exact match or domain match
 */
export async function validateEmailAllowed(
  database: PrismaClient,
  email: string
): Promise<EmailValidationResult> {
  try {
    const normalizedEmail = email.toLowerCase().trim()

    // Check if user already exists (grandfathered access)
    const existingUser = await database.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true }
    })

    if (existingUser) {
      return {
        isAllowed: true,
        matchType: 'grandfathered',
        message: 'Existing user - grandfathered access'
      }
    }

    // Check for exact email match in allowed_emails
    const exactMatch = await database.allowedEmail.findFirst({
      where: {
        type: 'email',
        email: normalizedEmail
      }
    })

    if (exactMatch) {
      return {
        isAllowed: true,
        matchType: 'exact',
        message: 'Email explicitly allowed'
      }
    }

    // Check for domain matches
    const emailDomain = normalizedEmail.split('@')[1]
    if (!emailDomain) {
      return {
        isAllowed: false,
        matchType: null,
        message: 'Invalid email format'
      }
    }

    // Check domain patterns in allowed_emails
    const domainMatches = await database.allowedEmail.findMany({
      where: {
        type: 'domain'
      }
    })

    for (const domainRule of domainMatches) {
      if (!domainRule.domain) continue

      // Remove @ prefix if present in stored domain
      const storedDomain = domainRule.domain.startsWith('@') 
        ? domainRule.domain.substring(1) 
        : domainRule.domain

      // Check for exact domain match
      if (emailDomain === storedDomain.toLowerCase()) {
        return {
          isAllowed: true,
          matchType: 'domain',
          message: `Domain ${emailDomain} is allowed`
        }
      }

      // Check for subdomain match (if domain rule includes wildcards)
      if (storedDomain.startsWith('*.') && emailDomain.endsWith(storedDomain.substring(2))) {
        return {
          isAllowed: true,
          matchType: 'domain',
          message: `Subdomain of ${storedDomain} is allowed`
        }
      }
    }

    return {
      isAllowed: false,
      matchType: null,
      message: `Email ${email} is not in the allowed list. Contact admin to add your email or domain.`
    }

  } catch (error) {
    console.error('Error validating email:', error)
    return {
      isAllowed: false,
      matchType: null,
      message: 'Failed to validate email due to database error'
    }
  }
}

/**
 * Validate bulk admin operations to ensure admin protection
 */
export async function validateBulkAdminOperation(
  database: PrismaClient,
  userIds: string[],
  operation: 'delete' | 'make_user' | 'make_admin'
): Promise<AdminCountResult> {
  try {
    const adminCount = await database.user.count({
      where: { role: 'admin' }
    })

    // Get admin users in the operation list
    const adminUsersInOperation = await database.user.findMany({
      where: {
        id: { in: userIds },
        role: 'admin'
      },
      select: { id: true, email: true }
    })

    const adminUsersAffected = adminUsersInOperation.length

    if (operation === 'delete' || operation === 'make_user') {
      // Check if this operation would remove all admins
      if (adminUsersAffected >= adminCount) {
        return {
          canProceed: false,
          adminCount,
          message: `Cannot ${operation === 'delete' ? 'delete' : 'demote'} all ${adminUsersAffected} admin user(s). At least one admin must exist.`
        }
      }

      // Warning if removing most admins
      if (adminUsersAffected > 0 && (adminCount - adminUsersAffected) <= 1) {
        return {
          canProceed: true,
          adminCount,
          message: `Warning: This operation will ${operation === 'delete' ? 'delete' : 'demote'} ${adminUsersAffected} admin(s), leaving only ${adminCount - adminUsersAffected} admin(s).`
        }
      }
    }

    return {
      canProceed: true,
      adminCount,
      message: `Bulk operation allowed. ${adminCount} admin(s) currently exist, ${adminUsersAffected} will be affected.`
    }

  } catch (error) {
    console.error('Error validating bulk admin operation:', error)
    return {
      canProceed: false,
      adminCount: 0,
      message: 'Failed to validate bulk operation due to database error'
    }
  }
}