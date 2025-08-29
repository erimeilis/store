// Import Cloudflare Workers types
/// <reference types="@cloudflare/workers-types" />

// User type for authenticated contexts
export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

// Environment bindings
export interface Env {
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GOOGLE_REDIRECT_URI?: string;
  API_URL?: string;
  VITE_API_URL?: string;
  ENVIRONMENT?: string;
  FULL_ACCESS_TOKEN?: string;
  FRONTEND_ACCESS_TOKEN?: string;
  // eslint-disable-next-line no-undef
  ASSETS?: Fetcher; // Cloudflare Workers static assets
}

// Variables type for Hono context
export interface Variables {
  user: User;
}