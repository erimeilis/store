/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove static export for NextAuth.js compatibility
  // Use 'export' only for static deployment builds
  // output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8787'
  }
}

// For static export builds, use environment variable
if (process.env.BUILD_STATIC === 'true') {
  nextConfig.output = 'export'
}

module.exports = nextConfig
