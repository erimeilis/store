import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import type { NextAuthConfig } from "next-auth"

export const config = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnProtectedRoute = nextUrl.pathname.startsWith('/')
      
      // Allow access to auth pages and API routes
      if (nextUrl.pathname.startsWith('/auth') || nextUrl.pathname.startsWith('/api/auth')) {
        return true
      }
      
      // Redirect unauthenticated users to sign-in page
      if (isOnProtectedRoute && !isLoggedIn) {
        return false
      }
      
      return true
    },
    jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    session({ session, token }) {
      // Send properties to the client
      return {
        ...session,
        accessToken: token.accessToken,
      }
    },
  },
  session: {
    strategy: "jwt",
  },
  trustHost: true,
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)
