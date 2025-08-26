/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove static export to enable server-side features for NextAuth
  // output: 'export', // Commented out for OpenNext.js
  
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8787'
  },
  
  // Enable server-side features for NextAuth and OpenNext.js
  experimental: {
    // Add experimental features as needed
  },
  
  // Image optimization can be enabled with OpenNext.js
  images: {
    domains: [], // Add your image domains here
  }
}

module.exports = nextConfig
