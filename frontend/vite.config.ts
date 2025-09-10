import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import compression from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '')
  const isProduction = mode === 'production'
  const isDevelopment = mode === 'development'

  return {
    plugins: [
      react({
        // Production optimizations
        babel: isProduction ? {
          plugins: [
            ['babel-plugin-transform-remove-console', { exclude: ['error', 'warn'] }]
          ]
        } : undefined,
      }),

      // Gzip and Brotli compression for production
      ...(isProduction ? [
        compression({
          algorithm: 'gzip',
          ext: '.gz',
          deleteOriginFile: false,
          threshold: 1024, // Only compress files larger than 1KB
        }),
        compression({
          algorithm: 'brotliCompress',
          ext: '.br',
          deleteOriginFile: false,
          threshold: 1024,
        }),
      ] : []),

      // Bundle analyzer for production builds
      ...(isProduction && env.ANALYZE === 'true' ? [
        visualizer({
          filename: 'dist/stats.html',
          open: true,
          gzipSize: true,
          brotliSize: true,
          template: 'treemap', // 'treemap', 'sunburst', 'network'
        }),
      ] : []),
    ],
    
    // Build optimizations
    build: {
      // Production-specific settings
      sourcemap: isProduction ? 'hidden' : true, // Hidden source maps in production
      minify: isProduction ? 'terser' : false,
      cssMinify: isProduction,
      
      // Advanced minification options for production
      ...(isProduction && {
        terserOptions: {
          compress: {
            drop_console: true, // Remove console.logs
            drop_debugger: true, // Remove debugger statements
            pure_funcs: ['console.log', 'console.info'], // Remove specific console methods
            passes: 2, // Multiple minification passes for better compression
          },
          mangle: {
            properties: {
              regex: /^_/, // Mangle properties starting with underscore
            },
          },
          format: {
            comments: false, // Remove comments
          },
        } as import('terser').MinifyOptions, // Type assertion to handle Vite/Terser version compatibility
      }),
      
      // Optimize chunks with advanced strategies
      rollupOptions: {
        output: {
          // Advanced chunking strategy
          manualChunks: (id): string | undefined => {
            // Vendor chunks
            if (id.includes('node_modules')) {
              // React ecosystem
              if (id.includes('react') || id.includes('react-dom')) {
                return 'react-vendor'
              }
              // Utilities and smaller libraries
              if (id.includes('uuid') || id.includes('lodash') || id.includes('date-fns')) {
                return 'utils-vendor'
              }
              // Large third-party libraries
              if (id.includes('@') && id.includes('/')) {
                const packageName = id.split('node_modules/')[1].split('/')[0]
                if (packageName.startsWith('@')) {
                  return `vendor-${packageName.replace('@', '').replace('/', '-')}`
                }
                return `vendor-${packageName}`
              }
              // Everything else from node_modules
              return 'vendor'
            }
            
            // Application chunks based on folder structure
            if (id.includes('/components/')) {
              return 'components'
            }
            if (id.includes('/services/')) {
              return 'services'
            }
            if (id.includes('/hooks/') || id.includes('/context/')) {
              return 'hooks-context'
            }
            if (id.includes('/utils/')) {
              return 'utils'
            }
          },
          
          // Optimize file naming for caching
          chunkFileNames: isProduction ? 'js/[name]-[hash].js' : '[name].js',
          entryFileNames: isProduction ? 'js/[name]-[hash].js' : '[name].js',
          assetFileNames: (assetInfo): string => {
            if (assetInfo.name?.endsWith('.css')) {
              return isProduction ? 'css/[name]-[hash][extname]' : '[name][extname]'
            }
            if (/\.(png|jpe?g|gif|svg|webp|avif)$/.test(assetInfo.name || '')) {
              return isProduction ? 'images/[name]-[hash][extname]' : '[name][extname]'
            }
            if (/\.(woff|woff2|eot|ttf|otf)$/.test(assetInfo.name || '')) {
              return isProduction ? 'fonts/[name]-[hash][extname]' : '[name][extname]'
            }
            return isProduction ? 'assets/[name]-[hash][extname]' : '[name][extname]'
          },
        },
        
        // Optimize external dependencies
        external: (id): boolean => {
          // Don't bundle certain large libraries in production if they're available via CDN
          if (isProduction && env.USE_CDN === 'true') {
            return ['react', 'react-dom'].includes(id)
          }
          return false
        },
      },
      
      // Performance optimizations
      chunkSizeWarningLimit: 1000,
      assetsInlineLimit: 4096, // Inline assets smaller than 4KB
      
      // CSS code splitting
      cssCodeSplit: true,
      
      // Report compressed size
      reportCompressedSize: isProduction,
      
      // Output directory
      outDir: 'dist',
      emptyOutDir: true,
      
      // Entry point override for testing
      ...(env.DEMO === 'true' && {
        rollupOptions: {
          input: `${__dirname  }/index-demo.html`,
        },
      }),
      
      // Asset handling
      assetsDir: 'assets',
    },
    
    // CSS optimizations
    css: {
      devSourcemap: isDevelopment,
      ...(isProduction && {
        postcss: {
          plugins: [
            // Add autoprefixer and other PostCSS plugins here if needed
          ],
        },
      }),
    },
    
    // Dependency optimization
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'uuid',
      ],
      // Pre-bundle dependencies for faster development
      force: false,
    },
    
    // Path aliases for cleaner imports
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), './src'),
        '@components': path.resolve(process.cwd(), './src/components'),
        '@services': path.resolve(process.cwd(), './src/services'),
        '@types': path.resolve(process.cwd(), './src/types'),
        '@utils': path.resolve(process.cwd(), './src/utils'),
        '@hooks': path.resolve(process.cwd(), './src/hooks'),
        '@context': path.resolve(process.cwd(), './src/context'),
        '@styles': path.resolve(process.cwd(), './src/styles'),
      },
    },
    
    // Development server configuration
    server: {
      port: 5173,
      host: true, // Allow external connections
      open: false, // Don't auto-open browser
      
      // Performance optimizations for development
      hmr: {
        overlay: true, // Show errors in overlay
      },
      
      // Proxy configuration for API calls if needed
      // proxy: {
      //   '/api': {
      //     target: env.VITE_API_URL || 'http://localhost:3000',
      //     changeOrigin: true,
      //     rewrite: (path) => path.replace(/^\/api/, ''),
      //   },
      // },
    },
    
    // Preview server configuration
    preview: {
      port: 4173,
      host: true,
      cors: true,
    },
    
    // Environment variables prefix
    envPrefix: 'VITE_',
    
    // Define global constants
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '0.0.0'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },
    
    // Performance monitoring
    ...(isProduction && {
      esbuild: {
        drop: ['console', 'debugger'], // Remove console and debugger statements
        legalComments: 'none', // Remove legal comments
      },
    }),
  }
})
