/**
 * Authentication API Routes
 *
 * DEPRECATED: This auth routes file is kept for backwards compatibility
 * but all user creation should now use /api/users POST endpoint which has:
 * - Proper email validation via allowed_emails
 * - First-user-admin logic
 * - Consistent security checks
 */

import { Hono } from 'hono'
import type { Bindings } from '@/types/bindings.js'

const auth = new Hono<{ Bindings: Bindings }>()

/**
 * DEPRECATED: /register endpoint
 *
 * This endpoint is deprecated and should not be used.
 * Use POST /api/users instead, which has proper email validation.
 *
 * Keeping this file to prevent breaking existing route registrations,
 * but the /register endpoint has been removed.
 */

export { auth }