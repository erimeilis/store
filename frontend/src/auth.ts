import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"

// NextAuth v5 configuration
export const { handlers, auth, signIn, signOut } = NextAuth({
  // Authentication providers
  providers: [
    // Google OAuth provider (recommended for production)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    
    // Credentials provider for demo purposes
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Simple demo authentication - replace with your actual auth logic
        if (credentials?.username === "admin" && credentials?.password === "password") {
          return {
            id: "1",
            name: "Admin User",
            email: "admin@example.com",
          }
        }
        return null
      }
    })
  ],
  
  // Callbacks for session and JWT handling
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id = token.id as string
      }
      return session
    },
  },
  
  // Pages configuration
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
  
  // Security settings for production
  secret: process.env.NEXTAUTH_SECRET,
})
