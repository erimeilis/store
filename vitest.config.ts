import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/middleware': path.resolve(__dirname, './src/middleware'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/repositories': path.resolve(__dirname, './src/repositories'),
      '@/validators': path.resolve(__dirname, './src/validators'),
      '@/routes': path.resolve(__dirname, './src/routes')
    }
  }
})