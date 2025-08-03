import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import mdx from '@mdx-js/rollup';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
import remarkGfm from 'remark-gfm';
import { remarkImageOptimization } from './src/blog/utils/remark-image-optimization';
import legacy from '@vitejs/plugin-legacy';

// Custom plugin to handle HTML transformations for SEO and analytics
function htmlTransformPlugin(env) {
  return {
    name: 'html-transform',
    transformIndexHtml(html, ctx) {
      // Get environment variables
      const googleAnalyticsId = env.VITE_GOOGLE_ANALYTICS_ID;
      
      // Add SEO-friendly meta tags
      const productionMetaTags = `
    <meta name="description" content="AI-First Content Management System for modern websites. Built with React, MDX, and Vite with automatic SEO optimization.">
    <meta name="keywords" content="AI CMS, content management, MDX, React, SEO, website builder, blog system">
    <meta name="og:title" content="AI CMS - AI-First Content Management System">
    <meta name="og:description" content="AI-First Content Management System for modern websites. Built with React, MDX, and Vite with automatic SEO optimization.">
    <meta name="og:type" content="website">
    <meta name="og:url" content="https://example.com">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="AI CMS - AI-First Content Management System">
    <meta name="twitter:description" content="AI-First Content Management System for modern websites. Built with React, MDX, and Vite with automatic SEO optimization.">`;
      
      html = html.replace('<!--VITE_META_TAGS-->', productionMetaTags);
      
      // Replace Google Analytics
      if (googleAnalyticsId) {
        const googleAnalytics = `
    <script async src="https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${googleAnalyticsId}');
    </script>`;
        html = html.replace('<!--VITE_GOOGLE_ANALYTICS-->', googleAnalytics);
      } else {
        // Remove the placeholder if no analytics
        html = html.replace('<!--VITE_GOOGLE_ANALYTICS-->', '');
      }
      
      return html;
    }
  };
}

export default defineConfig(({ command, mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');
  const isLegacyBuild = env.VITE_LEGACY_BUILD === 'true';
  const isCloudflarePages = env.CLOUDFLARE_PAGES === '1' || env.CF_PAGES === '1';
  
  const plugins = [
    // HTML transformation plugin for SEO and analytics
    htmlTransformPlugin(env),
    
    // IMPORTANT: MDX plugin must be before React plugin
    mdx({
      providerImportSource: '@mdx-js/react',
      remarkPlugins: [
        remarkFrontmatter,
        remarkMdxFrontmatter,
        remarkGfm,
        remarkImageOptimization
      ]
    }),
    
    react(),
  ];

  // Add legacy support if needed
  if (isLegacyBuild) {
    plugins.push(
      legacy({
        targets: [
          'Chrome >= 70',
          'Firefox >= 68',
          'Safari >= 10',
          'Edge >= 79',
          'iOS >= 10',
          'Android >= 67',
          '> 1%',
          'not dead'
        ],
        additionalLegacyPolyfills: [
          'regenerator-runtime/runtime',
          'core-js/stable',
          'whatwg-fetch'
        ],
        modernPolyfills: [
          'es.promise.finally',
          'es/map',
          'es/set',
          'es.array.flat',
          'es.array.flat-map',
          'es.object.from-entries',
          'web.dom-collections.iterator'
        ],
        renderLegacyChunks: true,
        externalSystemJS: false
      })
    );
  }

  // Only add imagetools if not on Cloudflare Pages
  if (!isCloudflarePages) {
    try {
      const { imagetools } = await import('vite-imagetools');
      plugins.push(
        imagetools({
          defaultDirectives: (url) => {
            // Apply default optimizations to blog images
            if (url.searchParams.has('blog')) {
              return new URLSearchParams({
                format: 'webp',
                quality: '80',
                w: '640;768;1024;1280',
                as: 'srcset'
              });
            }
            return new URLSearchParams();
          }
        })
      );
    } catch (e) {
      console.warn('vite-imagetools not available, skipping image optimization');
    }
  }

  return {
    plugins,
    server: {
      headers: {
        // Development-friendly CSP that allows external resources
        'Content-Security-Policy': [
          "default-src 'self'",
          "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "img-src 'self' data: blob: https:",
          "font-src 'self' data: https://fonts.gstatic.com https://fonts.googleapis.com",
          "connect-src 'self' ws: wss: https: https://www.google-analytics.com https://region1.google-analytics.com",
          "media-src 'self'",
          "object-src 'none'",
          "frame-src 'none'",
          "base-uri 'self'",
          "form-action 'self'"
        ].join('; ')
      },
      fs: {
        allow: ['..']
      }
    },
    define: {
      'process.env': {},
    },
    worker: {
      format: 'iife'
    },
    build: {
      // Target modern browsers by default, legacy for compatibility build
      target: isLegacyBuild ? 'es2015' : 'es2020',
      
      // Performance optimizations
      cssCodeSplit: true,
      
      rollupOptions: {
        output: {
          // Chunk splitting for better caching
          manualChunks: {
            // Vendor chunks
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: ['@headlessui/react', '@heroicons/react'],
            // Blog chunks
            blog: ['@mdx-js/react', 'gray-matter'],
            // Analytics chunk  
            analytics: ['react-helmet-async']
          },
          
          // Optimize chunk names
          chunkFileNames: (chunkInfo) => {
            if (chunkInfo.name === 'blog') {
              return 'assets/blog-[hash].js';
            }
            return 'assets/[name]-[hash].js';
          },
          
          // Optimize asset names
          assetFileNames: (assetInfo) => {
            if (assetInfo.name?.endsWith('.css')) {
              return 'assets/[name]-[hash].css';
            }
            return 'assets/[name]-[hash][extname]';
          }
        }
      },
      
      // Enable source maps for debugging in development
      sourcemap: command === 'serve',
      
      // Minify for production (using esbuild for modern, terser for legacy)
      minify: isLegacyBuild ? 'terser' : 'esbuild',
      
      // Optimize CSS
      cssMinify: true,
      
      // Report bundle size
      reportCompressedSize: true,
      
      // Chunk size limit (larger for legacy builds due to polyfills)
      chunkSizeWarningLimit: isLegacyBuild ? 1500 : 1000,
      
      ...(isLegacyBuild && {
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true
          },
          mangle: {
            safari10: true
          }
        }
      })
    }
  };
});