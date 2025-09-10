/**
 * Hono Context Variables for Store CRUD API
 */

export interface HonoVariables {
  tokenType?: 'admin' | 'api' | 'user'
  tokenData?: {
    name: string
    permissions: string
  }
  userRole?: 'admin' | 'user'
}