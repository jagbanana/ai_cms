// vite.config.cloudflare.js
import { defineConfig, loadEnv } from "file:///mnt/c/Users/jagesso/Desktop/ai_cms/node_modules/vite/dist/node/index.js";
import react from "file:///mnt/c/Users/jagesso/Desktop/ai_cms/node_modules/@vitejs/plugin-react-swc/index.js";
import mdx from "file:///mnt/c/Users/jagesso/Desktop/ai_cms/node_modules/@mdx-js/rollup/index.js";
import remarkFrontmatter from "file:///mnt/c/Users/jagesso/Desktop/ai_cms/node_modules/remark-frontmatter/index.js";
import remarkMdxFrontmatter from "file:///mnt/c/Users/jagesso/Desktop/ai_cms/node_modules/remark-mdx-frontmatter/dist/remark-mdx-frontmatter.js";
import remarkGfm from "file:///mnt/c/Users/jagesso/Desktop/ai_cms/node_modules/remark-gfm/index.js";

// src/blog/utils/remark-image-optimization.js
import { visit } from "file:///mnt/c/Users/jagesso/Desktop/ai_cms/node_modules/unist-util-visit/index.js";
var __assign = function() {
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
var __rest = function(s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
    t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
};
function remarkImageOptimization() {
  return function(tree) {
    visit(tree, "element", function(node) {
      if (node.tagName === "img") {
        var imgNode = node;
        var _a = imgNode.properties, src = _a.src, alt = _a.alt, title = _a.title, width = _a.width, height = _a.height, otherProps = __rest(_a, ["src", "alt", "title", "width", "height"]);
        if (!src || !alt) {
          return;
        }
        var isBlogAsset = src.includes("/blog-assets/") || src.includes("blog-assets/");
        if (isBlogAsset) {
          node.tagName = "BlogImage";
          node.properties = __assign(__assign(__assign(__assign({ src, alt }, title && { caption: title }), width && { width: typeof width === "string" ? parseInt(width) : width }), height && { height: typeof height === "string" ? parseInt(height) : height }), otherProps);
        }
      }
    });
  };
}

// vite.config.cloudflare.js
import legacy from "file:///mnt/c/Users/jagesso/Desktop/ai_cms/node_modules/@vitejs/plugin-legacy/dist/index.mjs";
function htmlTransformPlugin(env) {
  return {
    name: "html-transform",
    transformIndexHtml(html, ctx) {
      const googleAnalyticsId = env.VITE_GOOGLE_ANALYTICS_ID;
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
      html = html.replace("<!--VITE_META_TAGS-->", productionMetaTags);
      if (googleAnalyticsId) {
        const googleAnalytics = `
    <script async src="https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${googleAnalyticsId}');
    </script>`;
        html = html.replace("<!--VITE_GOOGLE_ANALYTICS-->", googleAnalytics);
      } else {
        html = html.replace("<!--VITE_GOOGLE_ANALYTICS-->", "");
      }
      return html;
    }
  };
}
var vite_config_cloudflare_default = defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const isLegacyBuild = env.VITE_LEGACY_BUILD === "true";
  const plugins = [
    // HTML transformation plugin for SEO and analytics
    htmlTransformPlugin(env),
    // IMPORTANT: MDX plugin must be before React plugin
    mdx({
      providerImportSource: "@mdx-js/react",
      remarkPlugins: [
        remarkFrontmatter,
        remarkMdxFrontmatter,
        remarkGfm,
        remarkImageOptimization
      ]
    }),
    react()
  ];
  if (isLegacyBuild) {
    plugins.push(
      legacy({
        targets: [
          "Chrome >= 70",
          "Firefox >= 68",
          "Safari >= 10",
          "Edge >= 79",
          "iOS >= 10",
          "Android >= 67",
          "> 1%",
          "not dead"
        ],
        additionalLegacyPolyfills: [
          "regenerator-runtime/runtime",
          "core-js/stable",
          "whatwg-fetch"
        ],
        modernPolyfills: [
          "es.promise.finally",
          "es/map",
          "es/set",
          "es.array.flat",
          "es.array.flat-map",
          "es.object.from-entries",
          "web.dom-collections.iterator"
        ],
        renderLegacyChunks: true,
        externalSystemJS: false
      })
    );
  }
  return {
    plugins,
    server: {
      headers: {
        // Development-friendly CSP that allows external resources
        "Content-Security-Policy": [
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
        ].join("; ")
      },
      fs: {
        allow: [".."]
      }
    },
    define: {
      "process.env": {}
    },
    worker: {
      format: "iife"
    },
    build: {
      // Target modern browsers by default, legacy for compatibility build
      target: isLegacyBuild ? "es2015" : "es2020",
      // Performance optimizations
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          // Chunk splitting for better caching
          manualChunks: {
            // Vendor chunks
            vendor: ["react", "react-dom", "react-router-dom"],
            ui: ["@headlessui/react", "@heroicons/react"],
            // Blog chunks
            blog: ["@mdx-js/react", "gray-matter"],
            // Analytics chunk  
            analytics: ["react-helmet-async"]
          },
          // Optimize chunk names
          chunkFileNames: (chunkInfo) => {
            if (chunkInfo.name === "blog") {
              return "assets/blog-[hash].js";
            }
            return "assets/[name]-[hash].js";
          },
          // Optimize asset names
          assetFileNames: (assetInfo) => {
            if (assetInfo.name?.endsWith(".css")) {
              return "assets/[name]-[hash].css";
            }
            return "assets/[name]-[hash][extname]";
          }
        }
      },
      // Enable source maps for debugging in development
      sourcemap: command === "serve",
      // Minify for production (using esbuild for modern, terser for legacy)
      minify: isLegacyBuild ? "terser" : "esbuild",
      // Optimize CSS
      cssMinify: true,
      // Report bundle size
      reportCompressedSize: true,
      // Chunk size limit (larger for legacy builds due to polyfills)
      chunkSizeWarningLimit: isLegacyBuild ? 1500 : 1e3,
      ...isLegacyBuild && {
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true
          },
          mangle: {
            safari10: true
          }
        }
      }
    }
  };
});
export {
  vite_config_cloudflare_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuY2xvdWRmbGFyZS5qcyIsICJzcmMvYmxvZy91dGlscy9yZW1hcmstaW1hZ2Utb3B0aW1pemF0aW9uLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL21udC9jL1VzZXJzL2phZ2Vzc28vRGVza3RvcC9haV9jbXNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9tbnQvYy9Vc2Vycy9qYWdlc3NvL0Rlc2t0b3AvYWlfY21zL3ZpdGUuY29uZmlnLmNsb3VkZmxhcmUuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL21udC9jL1VzZXJzL2phZ2Vzc28vRGVza3RvcC9haV9jbXMvdml0ZS5jb25maWcuY2xvdWRmbGFyZS5qc1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZywgbG9hZEVudiB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0LXN3Yyc7XG5pbXBvcnQgbWR4IGZyb20gJ0BtZHgtanMvcm9sbHVwJztcbmltcG9ydCByZW1hcmtGcm9udG1hdHRlciBmcm9tICdyZW1hcmstZnJvbnRtYXR0ZXInO1xuaW1wb3J0IHJlbWFya01keEZyb250bWF0dGVyIGZyb20gJ3JlbWFyay1tZHgtZnJvbnRtYXR0ZXInO1xuaW1wb3J0IHJlbWFya0dmbSBmcm9tICdyZW1hcmstZ2ZtJztcbmltcG9ydCB7IHJlbWFya0ltYWdlT3B0aW1pemF0aW9uIH0gZnJvbSAnLi9zcmMvYmxvZy91dGlscy9yZW1hcmstaW1hZ2Utb3B0aW1pemF0aW9uLmpzJztcbmltcG9ydCBsZWdhY3kgZnJvbSAnQHZpdGVqcy9wbHVnaW4tbGVnYWN5JztcblxuLy8gQ3VzdG9tIHBsdWdpbiB0byBoYW5kbGUgSFRNTCB0cmFuc2Zvcm1hdGlvbnMgZm9yIFNFTyBhbmQgYW5hbHl0aWNzXG5mdW5jdGlvbiBodG1sVHJhbnNmb3JtUGx1Z2luKGVudikge1xuICByZXR1cm4ge1xuICAgIG5hbWU6ICdodG1sLXRyYW5zZm9ybScsXG4gICAgdHJhbnNmb3JtSW5kZXhIdG1sKGh0bWwsIGN0eCkge1xuICAgICAgLy8gR2V0IGVudmlyb25tZW50IHZhcmlhYmxlc1xuICAgICAgY29uc3QgZ29vZ2xlQW5hbHl0aWNzSWQgPSBlbnYuVklURV9HT09HTEVfQU5BTFlUSUNTX0lEO1xuICAgICAgXG4gICAgICAvLyBBZGQgU0VPLWZyaWVuZGx5IG1ldGEgdGFnc1xuICAgICAgY29uc3QgcHJvZHVjdGlvbk1ldGFUYWdzID0gYFxuICAgIDxtZXRhIG5hbWU9XCJkZXNjcmlwdGlvblwiIGNvbnRlbnQ9XCJBSS1GaXJzdCBDb250ZW50IE1hbmFnZW1lbnQgU3lzdGVtIGZvciBtb2Rlcm4gd2Vic2l0ZXMuIEJ1aWx0IHdpdGggUmVhY3QsIE1EWCwgYW5kIFZpdGUgd2l0aCBhdXRvbWF0aWMgU0VPIG9wdGltaXphdGlvbi5cIj5cbiAgICA8bWV0YSBuYW1lPVwia2V5d29yZHNcIiBjb250ZW50PVwiQUkgQ01TLCBjb250ZW50IG1hbmFnZW1lbnQsIE1EWCwgUmVhY3QsIFNFTywgd2Vic2l0ZSBidWlsZGVyLCBibG9nIHN5c3RlbVwiPlxuICAgIDxtZXRhIG5hbWU9XCJvZzp0aXRsZVwiIGNvbnRlbnQ9XCJBSSBDTVMgLSBBSS1GaXJzdCBDb250ZW50IE1hbmFnZW1lbnQgU3lzdGVtXCI+XG4gICAgPG1ldGEgbmFtZT1cIm9nOmRlc2NyaXB0aW9uXCIgY29udGVudD1cIkFJLUZpcnN0IENvbnRlbnQgTWFuYWdlbWVudCBTeXN0ZW0gZm9yIG1vZGVybiB3ZWJzaXRlcy4gQnVpbHQgd2l0aCBSZWFjdCwgTURYLCBhbmQgVml0ZSB3aXRoIGF1dG9tYXRpYyBTRU8gb3B0aW1pemF0aW9uLlwiPlxuICAgIDxtZXRhIG5hbWU9XCJvZzp0eXBlXCIgY29udGVudD1cIndlYnNpdGVcIj5cbiAgICA8bWV0YSBuYW1lPVwib2c6dXJsXCIgY29udGVudD1cImh0dHBzOi8vZXhhbXBsZS5jb21cIj5cbiAgICA8bWV0YSBuYW1lPVwidHdpdHRlcjpjYXJkXCIgY29udGVudD1cInN1bW1hcnlfbGFyZ2VfaW1hZ2VcIj5cbiAgICA8bWV0YSBuYW1lPVwidHdpdHRlcjp0aXRsZVwiIGNvbnRlbnQ9XCJBSSBDTVMgLSBBSS1GaXJzdCBDb250ZW50IE1hbmFnZW1lbnQgU3lzdGVtXCI+XG4gICAgPG1ldGEgbmFtZT1cInR3aXR0ZXI6ZGVzY3JpcHRpb25cIiBjb250ZW50PVwiQUktRmlyc3QgQ29udGVudCBNYW5hZ2VtZW50IFN5c3RlbSBmb3IgbW9kZXJuIHdlYnNpdGVzLiBCdWlsdCB3aXRoIFJlYWN0LCBNRFgsIGFuZCBWaXRlIHdpdGggYXV0b21hdGljIFNFTyBvcHRpbWl6YXRpb24uXCI+YDtcbiAgICAgIFxuICAgICAgaHRtbCA9IGh0bWwucmVwbGFjZSgnPCEtLVZJVEVfTUVUQV9UQUdTLS0+JywgcHJvZHVjdGlvbk1ldGFUYWdzKTtcbiAgICAgIFxuICAgICAgLy8gUmVwbGFjZSBHb29nbGUgQW5hbHl0aWNzXG4gICAgICBpZiAoZ29vZ2xlQW5hbHl0aWNzSWQpIHtcbiAgICAgICAgY29uc3QgZ29vZ2xlQW5hbHl0aWNzID0gYFxuICAgIDxzY3JpcHQgYXN5bmMgc3JjPVwiaHR0cHM6Ly93d3cuZ29vZ2xldGFnbWFuYWdlci5jb20vZ3RhZy9qcz9pZD0ke2dvb2dsZUFuYWx5dGljc0lkfVwiPjwvc2NyaXB0PlxuICAgIDxzY3JpcHQ+XG4gICAgICB3aW5kb3cuZGF0YUxheWVyID0gd2luZG93LmRhdGFMYXllciB8fCBbXTtcbiAgICAgIGZ1bmN0aW9uIGd0YWcoKXtkYXRhTGF5ZXIucHVzaChhcmd1bWVudHMpO31cbiAgICAgIGd0YWcoJ2pzJywgbmV3IERhdGUoKSk7XG4gICAgICBndGFnKCdjb25maWcnLCAnJHtnb29nbGVBbmFseXRpY3NJZH0nKTtcbiAgICA8L3NjcmlwdD5gO1xuICAgICAgICBodG1sID0gaHRtbC5yZXBsYWNlKCc8IS0tVklURV9HT09HTEVfQU5BTFlUSUNTLS0+JywgZ29vZ2xlQW5hbHl0aWNzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFJlbW92ZSB0aGUgcGxhY2Vob2xkZXIgaWYgbm8gYW5hbHl0aWNzXG4gICAgICAgIGh0bWwgPSBodG1sLnJlcGxhY2UoJzwhLS1WSVRFX0dPT0dMRV9BTkFMWVRJQ1MtLT4nLCAnJyk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIHJldHVybiBodG1sO1xuICAgIH1cbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IGNvbW1hbmQsIG1vZGUgfSkgPT4ge1xuICAvLyBMb2FkIGVudmlyb25tZW50IHZhcmlhYmxlc1xuICBjb25zdCBlbnYgPSBsb2FkRW52KG1vZGUsIHByb2Nlc3MuY3dkKCksICcnKTtcbiAgY29uc3QgaXNMZWdhY3lCdWlsZCA9IGVudi5WSVRFX0xFR0FDWV9CVUlMRCA9PT0gJ3RydWUnO1xuICBcbiAgY29uc3QgcGx1Z2lucyA9IFtcbiAgICAvLyBIVE1MIHRyYW5zZm9ybWF0aW9uIHBsdWdpbiBmb3IgU0VPIGFuZCBhbmFseXRpY3NcbiAgICBodG1sVHJhbnNmb3JtUGx1Z2luKGVudiksXG4gICAgXG4gICAgLy8gSU1QT1JUQU5UOiBNRFggcGx1Z2luIG11c3QgYmUgYmVmb3JlIFJlYWN0IHBsdWdpblxuICAgIG1keCh7XG4gICAgICBwcm92aWRlckltcG9ydFNvdXJjZTogJ0BtZHgtanMvcmVhY3QnLFxuICAgICAgcmVtYXJrUGx1Z2luczogW1xuICAgICAgICByZW1hcmtGcm9udG1hdHRlcixcbiAgICAgICAgcmVtYXJrTWR4RnJvbnRtYXR0ZXIsXG4gICAgICAgIHJlbWFya0dmbSxcbiAgICAgICAgcmVtYXJrSW1hZ2VPcHRpbWl6YXRpb25cbiAgICAgIF1cbiAgICB9KSxcbiAgICBcbiAgICByZWFjdCgpLFxuICBdO1xuXG4gIC8vIEFkZCBsZWdhY3kgc3VwcG9ydCBpZiBuZWVkZWRcbiAgaWYgKGlzTGVnYWN5QnVpbGQpIHtcbiAgICBwbHVnaW5zLnB1c2goXG4gICAgICBsZWdhY3koe1xuICAgICAgICB0YXJnZXRzOiBbXG4gICAgICAgICAgJ0Nocm9tZSA+PSA3MCcsXG4gICAgICAgICAgJ0ZpcmVmb3ggPj0gNjgnLFxuICAgICAgICAgICdTYWZhcmkgPj0gMTAnLFxuICAgICAgICAgICdFZGdlID49IDc5JyxcbiAgICAgICAgICAnaU9TID49IDEwJyxcbiAgICAgICAgICAnQW5kcm9pZCA+PSA2NycsXG4gICAgICAgICAgJz4gMSUnLFxuICAgICAgICAgICdub3QgZGVhZCdcbiAgICAgICAgXSxcbiAgICAgICAgYWRkaXRpb25hbExlZ2FjeVBvbHlmaWxsczogW1xuICAgICAgICAgICdyZWdlbmVyYXRvci1ydW50aW1lL3J1bnRpbWUnLFxuICAgICAgICAgICdjb3JlLWpzL3N0YWJsZScsXG4gICAgICAgICAgJ3doYXR3Zy1mZXRjaCdcbiAgICAgICAgXSxcbiAgICAgICAgbW9kZXJuUG9seWZpbGxzOiBbXG4gICAgICAgICAgJ2VzLnByb21pc2UuZmluYWxseScsXG4gICAgICAgICAgJ2VzL21hcCcsXG4gICAgICAgICAgJ2VzL3NldCcsXG4gICAgICAgICAgJ2VzLmFycmF5LmZsYXQnLFxuICAgICAgICAgICdlcy5hcnJheS5mbGF0LW1hcCcsXG4gICAgICAgICAgJ2VzLm9iamVjdC5mcm9tLWVudHJpZXMnLFxuICAgICAgICAgICd3ZWIuZG9tLWNvbGxlY3Rpb25zLml0ZXJhdG9yJ1xuICAgICAgICBdLFxuICAgICAgICByZW5kZXJMZWdhY3lDaHVua3M6IHRydWUsXG4gICAgICAgIGV4dGVybmFsU3lzdGVtSlM6IGZhbHNlXG4gICAgICB9KVxuICAgICk7XG4gIH1cblxuICAvLyBOb3RlOiB2aXRlLWltYWdldG9vbHMgaXMgZXhjbHVkZWQgZm9yIENsb3VkZmxhcmUgUGFnZXMgZHVlIHRvIHNoYXJwIGRlcGVuZGVuY3lcblxuICByZXR1cm4ge1xuICAgIHBsdWdpbnMsXG4gICAgc2VydmVyOiB7XG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgIC8vIERldmVsb3BtZW50LWZyaWVuZGx5IENTUCB0aGF0IGFsbG93cyBleHRlcm5hbCByZXNvdXJjZXNcbiAgICAgICAgJ0NvbnRlbnQtU2VjdXJpdHktUG9saWN5JzogW1xuICAgICAgICAgIFwiZGVmYXVsdC1zcmMgJ3NlbGYnXCIsXG4gICAgICAgICAgXCJzY3JpcHQtc3JjICdzZWxmJyAndW5zYWZlLWV2YWwnICd1bnNhZmUtaW5saW5lJyBodHRwczovL3d3dy5nb29nbGV0YWdtYW5hZ2VyLmNvbSBodHRwczovL3d3dy5nb29nbGUtYW5hbHl0aWNzLmNvbVwiLFxuICAgICAgICAgIFwic3R5bGUtc3JjICdzZWxmJyAndW5zYWZlLWlubGluZScgaHR0cHM6Ly9mb250cy5nb29nbGVhcGlzLmNvbVwiLFxuICAgICAgICAgIFwiaW1nLXNyYyAnc2VsZicgZGF0YTogYmxvYjogaHR0cHM6XCIsXG4gICAgICAgICAgXCJmb250LXNyYyAnc2VsZicgZGF0YTogaHR0cHM6Ly9mb250cy5nc3RhdGljLmNvbSBodHRwczovL2ZvbnRzLmdvb2dsZWFwaXMuY29tXCIsXG4gICAgICAgICAgXCJjb25uZWN0LXNyYyAnc2VsZicgd3M6IHdzczogaHR0cHM6IGh0dHBzOi8vd3d3Lmdvb2dsZS1hbmFseXRpY3MuY29tIGh0dHBzOi8vcmVnaW9uMS5nb29nbGUtYW5hbHl0aWNzLmNvbVwiLFxuICAgICAgICAgIFwibWVkaWEtc3JjICdzZWxmJ1wiLFxuICAgICAgICAgIFwib2JqZWN0LXNyYyAnbm9uZSdcIixcbiAgICAgICAgICBcImZyYW1lLXNyYyAnbm9uZSdcIixcbiAgICAgICAgICBcImJhc2UtdXJpICdzZWxmJ1wiLFxuICAgICAgICAgIFwiZm9ybS1hY3Rpb24gJ3NlbGYnXCJcbiAgICAgICAgXS5qb2luKCc7ICcpXG4gICAgICB9LFxuICAgICAgZnM6IHtcbiAgICAgICAgYWxsb3c6IFsnLi4nXVxuICAgICAgfVxuICAgIH0sXG4gICAgZGVmaW5lOiB7XG4gICAgICAncHJvY2Vzcy5lbnYnOiB7fSxcbiAgICB9LFxuICAgIHdvcmtlcjoge1xuICAgICAgZm9ybWF0OiAnaWlmZSdcbiAgICB9LFxuICAgIGJ1aWxkOiB7XG4gICAgICAvLyBUYXJnZXQgbW9kZXJuIGJyb3dzZXJzIGJ5IGRlZmF1bHQsIGxlZ2FjeSBmb3IgY29tcGF0aWJpbGl0eSBidWlsZFxuICAgICAgdGFyZ2V0OiBpc0xlZ2FjeUJ1aWxkID8gJ2VzMjAxNScgOiAnZXMyMDIwJyxcbiAgICAgIFxuICAgICAgLy8gUGVyZm9ybWFuY2Ugb3B0aW1pemF0aW9uc1xuICAgICAgY3NzQ29kZVNwbGl0OiB0cnVlLFxuICAgICAgXG4gICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgIG91dHB1dDoge1xuICAgICAgICAgIC8vIENodW5rIHNwbGl0dGluZyBmb3IgYmV0dGVyIGNhY2hpbmdcbiAgICAgICAgICBtYW51YWxDaHVua3M6IHtcbiAgICAgICAgICAgIC8vIFZlbmRvciBjaHVua3NcbiAgICAgICAgICAgIHZlbmRvcjogWydyZWFjdCcsICdyZWFjdC1kb20nLCAncmVhY3Qtcm91dGVyLWRvbSddLFxuICAgICAgICAgICAgdWk6IFsnQGhlYWRsZXNzdWkvcmVhY3QnLCAnQGhlcm9pY29ucy9yZWFjdCddLFxuICAgICAgICAgICAgLy8gQmxvZyBjaHVua3NcbiAgICAgICAgICAgIGJsb2c6IFsnQG1keC1qcy9yZWFjdCcsICdncmF5LW1hdHRlciddLFxuICAgICAgICAgICAgLy8gQW5hbHl0aWNzIGNodW5rICBcbiAgICAgICAgICAgIGFuYWx5dGljczogWydyZWFjdC1oZWxtZXQtYXN5bmMnXVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXG4gICAgICAgICAgLy8gT3B0aW1pemUgY2h1bmsgbmFtZXNcbiAgICAgICAgICBjaHVua0ZpbGVOYW1lczogKGNodW5rSW5mbykgPT4ge1xuICAgICAgICAgICAgaWYgKGNodW5rSW5mby5uYW1lID09PSAnYmxvZycpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICdhc3NldHMvYmxvZy1baGFzaF0uanMnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuICdhc3NldHMvW25hbWVdLVtoYXNoXS5qcyc7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBcbiAgICAgICAgICAvLyBPcHRpbWl6ZSBhc3NldCBuYW1lc1xuICAgICAgICAgIGFzc2V0RmlsZU5hbWVzOiAoYXNzZXRJbmZvKSA9PiB7XG4gICAgICAgICAgICBpZiAoYXNzZXRJbmZvLm5hbWU/LmVuZHNXaXRoKCcuY3NzJykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICdhc3NldHMvW25hbWVdLVtoYXNoXS5jc3MnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuICdhc3NldHMvW25hbWVdLVtoYXNoXVtleHRuYW1lXSc7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgXG4gICAgICAvLyBFbmFibGUgc291cmNlIG1hcHMgZm9yIGRlYnVnZ2luZyBpbiBkZXZlbG9wbWVudFxuICAgICAgc291cmNlbWFwOiBjb21tYW5kID09PSAnc2VydmUnLFxuICAgICAgXG4gICAgICAvLyBNaW5pZnkgZm9yIHByb2R1Y3Rpb24gKHVzaW5nIGVzYnVpbGQgZm9yIG1vZGVybiwgdGVyc2VyIGZvciBsZWdhY3kpXG4gICAgICBtaW5pZnk6IGlzTGVnYWN5QnVpbGQgPyAndGVyc2VyJyA6ICdlc2J1aWxkJyxcbiAgICAgIFxuICAgICAgLy8gT3B0aW1pemUgQ1NTXG4gICAgICBjc3NNaW5pZnk6IHRydWUsXG4gICAgICBcbiAgICAgIC8vIFJlcG9ydCBidW5kbGUgc2l6ZVxuICAgICAgcmVwb3J0Q29tcHJlc3NlZFNpemU6IHRydWUsXG4gICAgICBcbiAgICAgIC8vIENodW5rIHNpemUgbGltaXQgKGxhcmdlciBmb3IgbGVnYWN5IGJ1aWxkcyBkdWUgdG8gcG9seWZpbGxzKVxuICAgICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiBpc0xlZ2FjeUJ1aWxkID8gMTUwMCA6IDEwMDAsXG4gICAgICBcbiAgICAgIC4uLihpc0xlZ2FjeUJ1aWxkICYmIHtcbiAgICAgICAgdGVyc2VyT3B0aW9uczoge1xuICAgICAgICAgIGNvbXByZXNzOiB7XG4gICAgICAgICAgICBkcm9wX2NvbnNvbGU6IHRydWUsXG4gICAgICAgICAgICBkcm9wX2RlYnVnZ2VyOiB0cnVlXG4gICAgICAgICAgfSxcbiAgICAgICAgICBtYW5nbGU6IHtcbiAgICAgICAgICAgIHNhZmFyaTEwOiB0cnVlXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgfTtcbn0pOyIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL21udC9jL1VzZXJzL2phZ2Vzc28vRGVza3RvcC9haV9jbXMvc3JjL2Jsb2cvdXRpbHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9tbnQvYy9Vc2Vycy9qYWdlc3NvL0Rlc2t0b3AvYWlfY21zL3NyYy9ibG9nL3V0aWxzL3JlbWFyay1pbWFnZS1vcHRpbWl6YXRpb24uanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL21udC9jL1VzZXJzL2phZ2Vzc28vRGVza3RvcC9haV9jbXMvc3JjL2Jsb2cvdXRpbHMvcmVtYXJrLWltYWdlLW9wdGltaXphdGlvbi5qc1wiO3ZhciBfX2Fzc2lnbiA9ICh0aGlzICYmIHRoaXMuX19hc3NpZ24pIHx8IGZ1bmN0aW9uICgpIHtcbiAgICBfX2Fzc2lnbiA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24odCkge1xuICAgICAgICBmb3IgKHZhciBzLCBpID0gMSwgbiA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgICAgIHMgPSBhcmd1bWVudHNbaV07XG4gICAgICAgICAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkpXG4gICAgICAgICAgICAgICAgdFtwXSA9IHNbcF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHQ7XG4gICAgfTtcbiAgICByZXR1cm4gX19hc3NpZ24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG52YXIgX19yZXN0ID0gKHRoaXMgJiYgdGhpcy5fX3Jlc3QpIHx8IGZ1bmN0aW9uIChzLCBlKSB7XG4gICAgdmFyIHQgPSB7fTtcbiAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkgJiYgZS5pbmRleE9mKHApIDwgMClcbiAgICAgICAgdFtwXSA9IHNbcF07XG4gICAgaWYgKHMgIT0gbnVsbCAmJiB0eXBlb2YgT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyA9PT0gXCJmdW5jdGlvblwiKVxuICAgICAgICBmb3IgKHZhciBpID0gMCwgcCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMocyk7IGkgPCBwLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoZS5pbmRleE9mKHBbaV0pIDwgMCAmJiBPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwocywgcFtpXSkpXG4gICAgICAgICAgICAgICAgdFtwW2ldXSA9IHNbcFtpXV07XG4gICAgICAgIH1cbiAgICByZXR1cm4gdDtcbn07XG5pbXBvcnQgeyB2aXNpdCB9IGZyb20gJ3VuaXN0LXV0aWwtdmlzaXQnO1xuLy8gUmVtYXJrIHBsdWdpbiB0byB0cmFuc2Zvcm0gaW1nIHRhZ3MgdG8gb3B0aW1pemVkIEJsb2dJbWFnZSBjb21wb25lbnRzXG5leHBvcnQgZnVuY3Rpb24gcmVtYXJrSW1hZ2VPcHRpbWl6YXRpb24oKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0cmVlKSB7XG4gICAgICAgIHZpc2l0KHRyZWUsICdlbGVtZW50JywgZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgICAgIGlmIChub2RlLnRhZ05hbWUgPT09ICdpbWcnKSB7XG4gICAgICAgICAgICAgICAgdmFyIGltZ05vZGUgPSBub2RlO1xuICAgICAgICAgICAgICAgIHZhciBfYSA9IGltZ05vZGUucHJvcGVydGllcywgc3JjID0gX2Euc3JjLCBhbHQgPSBfYS5hbHQsIHRpdGxlID0gX2EudGl0bGUsIHdpZHRoID0gX2Eud2lkdGgsIGhlaWdodCA9IF9hLmhlaWdodCwgb3RoZXJQcm9wcyA9IF9fcmVzdChfYSwgW1wic3JjXCIsIFwiYWx0XCIsIFwidGl0bGVcIiwgXCJ3aWR0aFwiLCBcImhlaWdodFwiXSk7XG4gICAgICAgICAgICAgICAgLy8gU2tpcCBpZiBubyBzcmMgb3IgYWx0IChhbHQgaXMgcmVxdWlyZWQgZm9yIGFjY2Vzc2liaWxpdHkpXG4gICAgICAgICAgICAgICAgaWYgKCFzcmMgfHwgIWFsdCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIENoZWNrIGlmIHRoZSBpbWFnZSBpcyBmcm9tIGJsb2ctYXNzZXRzXG4gICAgICAgICAgICAgICAgdmFyIGlzQmxvZ0Fzc2V0ID0gc3JjLmluY2x1ZGVzKCcvYmxvZy1hc3NldHMvJykgfHwgc3JjLmluY2x1ZGVzKCdibG9nLWFzc2V0cy8nKTtcbiAgICAgICAgICAgICAgICBpZiAoaXNCbG9nQXNzZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVHJhbnNmb3JtIHRvIEJsb2dJbWFnZSBjb21wb25lbnRcbiAgICAgICAgICAgICAgICAgICAgbm9kZS50YWdOYW1lID0gJ0Jsb2dJbWFnZSc7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUucHJvcGVydGllcyA9IF9fYXNzaWduKF9fYXNzaWduKF9fYXNzaWduKF9fYXNzaWduKHsgc3JjOiBzcmMsIGFsdDogYWx0IH0sICh0aXRsZSAmJiB7IGNhcHRpb246IHRpdGxlIH0pKSwgKHdpZHRoICYmIHsgd2lkdGg6IHR5cGVvZiB3aWR0aCA9PT0gJ3N0cmluZycgPyBwYXJzZUludCh3aWR0aCkgOiB3aWR0aCB9KSksIChoZWlnaHQgJiYgeyBoZWlnaHQ6IHR5cGVvZiBoZWlnaHQgPT09ICdzdHJpbmcnID8gcGFyc2VJbnQoaGVpZ2h0KSA6IGhlaWdodCB9KSksIG90aGVyUHJvcHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcbn1cbi8vIFBsdWdpbiB0byBwcm9jZXNzIGltYWdlIGltcG9ydHMgYXQgYnVpbGQgdGltZVxuZXhwb3J0IGZ1bmN0aW9uIHJlbWFya0ltYWdlSW1wb3J0cygpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHRyZWUpIHtcbiAgICAgICAgLy8gU2ltcGxlIHRyYW5zZm9ybWF0aW9uIC0gbGV0IHRoZSBNRFggY29tcG9uZW50cyBoYW5kbGUgb3B0aW1pemF0aW9uXG4gICAgICAgIHZpc2l0KHRyZWUsICdlbGVtZW50JywgZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgICAgIHZhciBfYTtcbiAgICAgICAgICAgIGlmIChub2RlLnRhZ05hbWUgPT09ICdpbWcnKSB7XG4gICAgICAgICAgICAgICAgdmFyIHNyYyA9IChfYSA9IG5vZGUucHJvcGVydGllcykgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLnNyYztcbiAgICAgICAgICAgICAgICBpZiAoc3JjICYmIHNyYy5zdGFydHNXaXRoKCcvYmxvZy1hc3NldHMvJykpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gTWFyayBmb3Igb3B0aW1pemF0aW9uIGJ5IGFkZGluZyBhIGRhdGEgYXR0cmlidXRlXG4gICAgICAgICAgICAgICAgICAgIG5vZGUucHJvcGVydGllcyA9IF9fYXNzaWduKF9fYXNzaWduKHt9LCBub2RlLnByb3BlcnRpZXMpLCB7ICdkYXRhLW9wdGltaXplJzogJ3RydWUnIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcbn1cbi8vIGdlbmVyYXRlSW1wb3J0TmFtZSBmdW5jdGlvbiByZW1vdmVkIC0gbm90IHVzZWRcbi8vIEFsdGVybmF0aXZlIGFwcHJvYWNoOiBUcmFuc2Zvcm0gYXQgcnVudGltZSBpbiBNRFggY29tcG9uZW50c1xuZXhwb3J0IHZhciBtZHhJbWFnZUNvbXBvbmVudHMgPSB7XG4gICAgaW1nOiAnT3B0aW1pemVkSW1nJyAvLyBUaGlzIHdpbGwgYmUgcmVwbGFjZWQgYnkgdGhlIGFjdHVhbCBjb21wb25lbnQgaW4gTURYQ29tcG9uZW50cy50c3hcbn07XG4vLyBIZWxwZXIgZnVuY3Rpb24gdG8gZGV0ZWN0IGlmIGFuIGltYWdlIHNob3VsZCBiZSBvcHRpbWl6ZWRcbmV4cG9ydCBmdW5jdGlvbiBzaG91bGRPcHRpbWl6ZUltYWdlKHNyYykge1xuICAgIC8vIERvbid0IG9wdGltaXplIGV4dGVybmFsIGltYWdlc1xuICAgIGlmIChzcmMuc3RhcnRzV2l0aCgnaHR0cCcpIHx8IHNyYy5zdGFydHNXaXRoKCcvLycpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLy8gRG9uJ3Qgb3B0aW1pemUgU1ZHcyAodGhleSdyZSBhbHJlYWR5IG9wdGltaXplZClcbiAgICBpZiAoc3JjLmVuZHNXaXRoKCcuc3ZnJykpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAvLyBPcHRpbWl6ZSBpbWFnZXMgZnJvbSBibG9nLWFzc2V0c1xuICAgIGlmIChzcmMuaW5jbHVkZXMoJ2Jsb2ctYXNzZXRzJykpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIC8vIERlZmF1bHQgdG8gb3B0aW1pemluZyBsb2NhbCBpbWFnZXNcbiAgICByZXR1cm4gIXNyYy5zdGFydHNXaXRoKCdodHRwJyk7XG59XG4vLyBHZW5lcmF0ZSBtZXRhIGluZm9ybWF0aW9uIGZvciBpbWFnZXNcbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZUltYWdlTWV0YShzcmMsIGFsdCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHNyYzogc3JjLFxuICAgICAgICBhbHQ6IGFsdCxcbiAgICAgICAgbG9hZGluZzogJ2xhenknLFxuICAgICAgICBkZWNvZGluZzogJ2FzeW5jJyxcbiAgICAgICAgc2l6ZXM6ICcobWF4LXdpZHRoOiA2NDBweCkgMTAwdncsIChtYXgtd2lkdGg6IDc2OHB4KSA3NjhweCwgKG1heC13aWR0aDogMTAyNHB4KSAxMDI0cHgsIDEyODBweCdcbiAgICB9O1xufVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFpVCxTQUFTLGNBQWMsZUFBZTtBQUN2VixPQUFPLFdBQVc7QUFDbEIsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sdUJBQXVCO0FBQzlCLE9BQU8sMEJBQTBCO0FBQ2pDLE9BQU8sZUFBZTs7O0FDaUJ0QixTQUFTLGFBQWE7QUF0QjhVLElBQUksV0FBc0MsV0FBWTtBQUN0WixhQUFXLE9BQU8sVUFBVSxTQUFTLEdBQUc7QUFDcEMsYUFBUyxHQUFHLElBQUksR0FBRyxJQUFJLFVBQVUsUUFBUSxJQUFJLEdBQUcsS0FBSztBQUNqRCxVQUFJLFVBQVUsQ0FBQztBQUNmLGVBQVMsS0FBSyxFQUFHLEtBQUksT0FBTyxVQUFVLGVBQWUsS0FBSyxHQUFHLENBQUM7QUFDMUQsVUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQUEsSUFDbEI7QUFDQSxXQUFPO0FBQUEsRUFDWDtBQUNBLFNBQU8sU0FBUyxNQUFNLE1BQU0sU0FBUztBQUN6QztBQUNBLElBQUksU0FBa0MsU0FBVSxHQUFHLEdBQUc7QUFDbEQsTUFBSSxJQUFJLENBQUM7QUFDVCxXQUFTLEtBQUssRUFBRyxLQUFJLE9BQU8sVUFBVSxlQUFlLEtBQUssR0FBRyxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsSUFBSTtBQUM5RSxNQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDZCxNQUFJLEtBQUssUUFBUSxPQUFPLE9BQU8sMEJBQTBCO0FBQ3JELGFBQVMsSUFBSSxHQUFHLElBQUksT0FB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
