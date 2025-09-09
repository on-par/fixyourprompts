import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Build optimizations
  build: {
    // Generate source maps for debugging
    sourcemap: true,
    
    // Optimize chunks
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'utils': ['uuid'],
        },
      },
    },
    
    // Set chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
  
  // Path aliases for cleaner imports
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@services': resolve(__dirname, './src/services'),
      '@types': resolve(__dirname, './src/types'),
      '@utils': resolve(__dirname, './src/utils'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@context': resolve(__dirname, './src/context'),
      '@styles': resolve(__dirname, './src/styles'),
    },
  },
  
  // Development server configuration
  server: {
    port: 5173,
    host: true, // Allow external connections
    open: false, // Don't auto-open browser
  },
  
  // Preview server configuration
  preview: {
    port: 4173,
    host: true,
  },
  
  // Environment variables prefix
  envPrefix: 'VITE_',
})
