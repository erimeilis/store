// Cloudflare Workers environment bindings
export type Bindings = {
  DB: D1Database
  BUCKET: R2Bucket
  KV?: KVNamespace
  GOOGLE_API_KEY?: string
}
