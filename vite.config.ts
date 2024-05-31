import path from 'path';
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwind from 'tailwindcss'
import autoprefixer from 'autoprefixer'

export default defineConfig(({ mode }) => {
  const rootDir = path.resolve(__dirname, 'src');
  const env = loadEnv(mode, process.cwd(), '');
  const production = env.NODE_ENV === 'dev';
  // const production = env.NODE_ENV === 'production';

  return {
    root: rootDir,
    base: env.BASEPATH ?? '/',
    publicDir: path.resolve(rootDir, '..', 'public'),
    appType: 'spa',
    plugins: [
      vue(),
    ],
    css: {
      postcss: {
        plugins: [
          autoprefixer(),
          tailwind(),
        ],
      },
    },
    resolve: {
      alias: {
        '@': rootDir,
      }
    },
    server: {
      port: 5173,
    },
    build: {
      minify: production,
      sourcemap: production,
      outDir: path.resolve(rootDir, '..', 'dist'),
    },
  }
});
