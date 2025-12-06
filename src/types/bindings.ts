// Cloudflare Workers environment bindings
export type Bindings = {
  // Resources
  DB: D1Database
  BUCKET: R2Bucket
  KV: KVNamespace

  // Environment variables
  NODE_ENV?: string
  APP_VERSION?: string
  API_URL?: string
  AUTH_BASE_URL?: string
  ALLOWED_ORIGINS?: string
  PAGE_SIZE?: string
  
  // Authentication tokens
  ADMIN_ACCESS_TOKEN?: string
  READ_ONLY_TOKEN?: string
  AUTH_SECRET?: string
  
  // Google OAuth & API
  GOOGLE_CLIENT_ID?: string
  GOOGLE_CLIENT_SECRET?: string
  GOOGLE_API_KEY?: string
  GOOGLE_SHEETS_API_KEY?: string

  // Storage
  R2_PUBLIC_URL?: string
}
