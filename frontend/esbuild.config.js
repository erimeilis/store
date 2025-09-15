import { build } from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
  entryPoints: ['src/client.tsx'],
  bundle: true,
  outfile: 'dist/client.js',
  format: 'esm',
  jsx: 'automatic',
  external: ['*.css'],
  conditions: ['style'],
  tsconfig: 'tsconfig.json',
  plugins: [
    {
      name: 'path-alias-resolver',
      setup(build) {
        build.onResolve({ filter: /^@\// }, (args) => {
          const pathWithoutPrefix = args.path.replace(/^@\//, '');
          const basePath = path.resolve(__dirname, 'src', pathWithoutPrefix);

          // Try different extensions
          const extensions = ['.ts', '.tsx', '.js', '.jsx'];
          for (const ext of extensions) {
            const fullPath = basePath + ext;
            if (fs.existsSync(fullPath)) {
              return { path: fullPath };
            }
          }

          // If no extension worked, try as directory with index file
          for (const ext of extensions) {
            const indexPath = path.join(basePath, 'index' + ext);
            if (fs.existsSync(indexPath)) {
              return { path: indexPath };
            }
          }

          // Fallback to original path
          return { path: basePath };
        });
      },
    },
  ],
};

if (process.argv.includes('--watch')) {
  config.watch = true;
}

await build(config).catch(() => process.exit(1));