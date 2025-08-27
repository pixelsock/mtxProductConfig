import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      overlay: true,
      protocol: 'ws',
      host: 'localhost'
    },
    watch: {
      usePolling: false,
      interval: 100
    },
    proxy: {
      '/api/directus': {
        target: 'https://pim.dude.digital',
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/api\/directus/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Add the authorization header
            proxyReq.setHeader('Authorization', 'Bearer SatmtC2cTo-k-V17usWeYpBcc6hbtXjC');
          });
        }
      },
      '/api': {
        target: 'http://localhost:8056',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '')
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.tsx'),
      name: 'ProductConfigurator',
      fileName: 'configurator',
      formats: ['umd']
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {}
      }
    },
    cssCodeSplit: false,
    sourcemap: false,
    minify: 'esbuild'
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  }
})
