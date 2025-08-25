import { auth } from "@/lib/auth"

export default auth((req) => {
  // req.auth contains the session data
  // The authorization logic is handled in the auth config
})

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
