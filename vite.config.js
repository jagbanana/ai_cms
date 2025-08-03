var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import mdx from '@mdx-js/rollup';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
import remarkGfm from 'remark-gfm';
import { remarkImageOptimization } from './src/blog/utils/remark-image-optimization';
import { imagetools } from 'vite-imagetools';
import legacy from '@vitejs/plugin-legacy';
// Custom plugin to handle HTML transformations for SEO and analytics
function htmlTransformPlugin(env) {
    return {
        name: 'html-transform',
        transformIndexHtml: function (html, ctx) {
            // Get environment variables
            var googleAnalyticsId = env.VITE_GOOGLE_ANALYTICS_ID;
            // Add SEO-friendly meta tags
            var productionMetaTags = "\n    <meta name=\"description\" content=\"AI-First Content Management System for modern websites. Built with React, MDX, and Vite with automatic SEO optimization.\">\n    <meta name=\"keywords\" content=\"AI CMS, content management, MDX, React, SEO, website builder, blog system\">\n    <meta name=\"og:title\" content=\"AI CMS - AI-First Content Management System\">\n    <meta name=\"og:description\" content=\"AI-First Content Management System for modern websites. Built with React, MDX, and Vite with automatic SEO optimization.\">\n    <meta name=\"og:type\" content=\"website\">\n    <meta name=\"og:url\" content=\"https://example.com\">\n    <meta name=\"twitter:card\" content=\"summary_large_image\">\n    <meta name=\"twitter:title\" content=\"AI CMS - AI-First Content Management System\">\n    <meta name=\"twitter:description\" content=\"AI-First Content Management System for modern websites. Built with React, MDX, and Vite with automatic SEO optimization.\">";
            html = html.replace('<!--VITE_META_TAGS-->', productionMetaTags);
            // Replace Google Analytics
            if (googleAnalyticsId) {
                var googleAnalytics = "\n    <script async src=\"https://www.googletagmanager.com/gtag/js?id=".concat(googleAnalyticsId, "\"></script>\n    <script>\n      window.dataLayer = window.dataLayer || [];\n      function gtag(){dataLayer.push(arguments);}\n      gtag('js', new Date());\n      gtag('config', '").concat(googleAnalyticsId, "');\n    </script>");
                html = html.replace('<!--VITE_GOOGLE_ANALYTICS-->', googleAnalytics);
            }
            else {
                // Remove the placeholder if no analytics
                html = html.replace('<!--VITE_GOOGLE_ANALYTICS-->', '');
            }
            return html;
        }
    };
}
export default defineConfig(function (_a) {
    var command = _a.command, mode = _a.mode;
    // Load environment variables
    var env = loadEnv(mode, process.cwd(), '');
    var isLegacyBuild = env.VITE_LEGACY_BUILD === 'true';
    return {
        plugins: __spreadArray(__spreadArray([
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
            react()
        ], (isLegacyBuild ? [
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
        ] : []), true), [
            // Image optimization plugin
            imagetools({
                defaultDirectives: function (url) {
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
        ], false),
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
        build: __assign({ 
            // Target modern browsers by default, legacy for compatibility build
            target: isLegacyBuild ? 'es2015' : 'es2020', 
            // Performance optimizations
            cssCodeSplit: true, rollupOptions: {
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
                    chunkFileNames: function (chunkInfo) {
                        if (chunkInfo.name === 'blog') {
                            return 'assets/blog-[hash].js';
                        }
                        return 'assets/[name]-[hash].js';
                    },
                    // Optimize asset names
                    assetFileNames: function (assetInfo) {
                        var _a;
                        if ((_a = assetInfo.name) === null || _a === void 0 ? void 0 : _a.endsWith('.css')) {
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
            chunkSizeWarningLimit: isLegacyBuild ? 1500 : 1000 }, (isLegacyBuild && {
            terserOptions: {
                compress: {
                    drop_console: true,
                    drop_debugger: true
                },
                mangle: {
                    safari10: true
                }
            }
        }))
    };
});
