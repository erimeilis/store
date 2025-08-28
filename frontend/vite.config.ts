import { defineConfig } from 'vite'
import devServer from '@hono/vite-dev-server'
import cloudflarePages from '@hono/vite-cloudflare-pages'
import { config } from 'dotenv'
import path from 'path'

// Load environment variables from .env file for development
config()

export default defineConfig(({ mode }) => {
  if (mode === 'client') {
    return {
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        },
      },
      build: {
        manifest: true,
        rollupOptions: {
          input: './src/client.tsx',
          output: {
            entryFileNames: 'static/client.js',
          },
        },
      },
    }
  } else {
    return {
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        },
      },
      esbuild: {
        jsxImportSource: 'react',
      },
      plugins: [
        devServer({
          entry: 'src/index.tsx',
        }),
        cloudflarePages({
          entry: 'src/index.tsx',
        }),
      ],
    }
  }
})
