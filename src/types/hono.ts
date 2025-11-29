/**
 * Hono Context Variables
 */

export interface HonoVariables {
  tokenType?: 'admin' | 'api' | 'user'
  tokenData?: {
    name: string
    permissions: string
  }
  userRole?: 'admin' | 'user'
}