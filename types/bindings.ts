// Cloudflare Workers environment bindings
export type Bindings = {
  // Resources
  DB: D1Database
  BUCKET: R2Bucket
  KV?: KVNamespace
  
  // Environment variables
  NODE_ENV?: string
  API_URL?: string
  AUTH_BASE_URL?: string
  ALLOWED_ORIGINS?: string
  
  // Authentication tokens
  FULL_ACCESS_TOKEN?: string
  READ_ONLY_TOKEN?: string
  AUTH_SECRET?: string
  
  // Google OAuth & API
  GOOGLE_CLIENT_ID?: string
  GOOGLE_CLIENT_SECRET?: string
  GOOGLE_API_KEY?: string
  GOOGLE_SHEETS_API_KEY?: string
}
