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
  ENVIRONMENT?: string;
}

// Variables type for Hono context
export interface Variables {
  user: User;
}