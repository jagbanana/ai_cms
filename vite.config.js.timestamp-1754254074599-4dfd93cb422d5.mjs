// vite.config.js
import { defineConfig, loadEnv } from "file:///mnt/c/Users/jagesso/Desktop/ai_cms/node_modules/vite/dist/node/index.js";
import react from "file:///mnt/c/Users/jagesso/Desktop/ai_cms/node_modules/@vitejs/plugin-react-swc/index.js";
import mdx from "file:///mnt/c/Users/jagesso/Desktop/ai_cms/node_modules/@mdx-js/rollup/index.js";
import remarkFrontmatter from "file:///mnt/c/Users/jagesso/Desktop/ai_cms/node_modules/remark-frontmatter/index.js";
import remarkMdxFrontmatter from "file:///mnt/c/Users/jagesso/Desktop/ai_cms/node_modules/remark-mdx-frontmatter/dist/remark-mdx-frontmatter.js";
import remarkGfm from "file:///mnt/c/Users/jagesso/Desktop/ai_cms/node_modules/remark-gfm/index.js";

// src/blog/utils/remark-image-optimization.ts
import { visit } from "file:///mnt/c/Users/jagesso/Desktop/ai_cms/node_modules/unist-util-visit/index.js";
function remarkImageOptimization() {
  return (tree) => {
    visit(tree, "element", (node) => {
      if (node.tagName === "img") {
        const imgNode = node;
        const { src, alt, title, width, height, ...otherProps } = imgNode.properties;
        if (!src || !alt) {
          return;
        }
        const isBlogAsset = src.includes("/blog-assets/") || src.includes("blog-assets/");
        if (isBlogAsset) {
          node.tagName = "BlogImage";
          node.properties = {
            src,
            alt,
            ...title && { caption: title },
            ...width && { width: typeof width === "string" ? parseInt(width) : width },
            ...height && { height: typeof height === "string" ? parseInt(height) : height },
            ...otherProps
          };
        }
      }
    });
  };
}

// vite.config.js
import { imagetools } from "file:///mnt/c/Users/jagesso/Desktop/ai_cms/node_modules/vite-imagetools/dist/index.js";
import legacy from "file:///mnt/c/Users/jagesso/Desktop/ai_cms/node_modules/@vitejs/plugin-legacy/dist/index.mjs";
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
var __spreadArray = function(to, from, pack) {
  if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
    if (ar || !(i in from)) {
      if (!ar) ar = Array.prototype.slice.call(from, 0, i);
      ar[i] = from[i];
    }
  }
  return to.concat(ar || Array.prototype.slice.call(from));
};
function htmlTransformPlugin(env) {
  return {
    name: "html-transform",
    transformIndexHtml: function(html, ctx) {
      var googleAnalyticsId = env.VITE_GOOGLE_ANALYTICS_ID;
      var productionMetaTags = '\n    <meta name="description" content="AI-First Content Management System for modern websites. Built with React, MDX, and Vite with automatic SEO optimization.">\n    <meta name="keywords" content="AI CMS, content management, MDX, React, SEO, website builder, blog system">\n    <meta name="og:title" content="AI CMS - AI-First Content Management System">\n    <meta name="og:description" content="AI-First Content Management System for modern websites. Built with React, MDX, and Vite with automatic SEO optimization.">\n    <meta name="og:type" content="website">\n    <meta name="og:url" content="https://example.com">\n    <meta name="twitter:card" content="summary_large_image">\n    <meta name="twitter:title" content="AI CMS - AI-First Content Management System">\n    <meta name="twitter:description" content="AI-First Content Management System for modern websites. Built with React, MDX, and Vite with automatic SEO optimization.">';
      html = html.replace("<!--VITE_META_TAGS-->", productionMetaTags);
      if (googleAnalyticsId) {
        var googleAnalytics = '\n    <script async src="https://www.googletagmanager.com/gtag/js?id='.concat(googleAnalyticsId, `"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '`).concat(googleAnalyticsId, "');\n    </script>");
        html = html.replace("<!--VITE_GOOGLE_ANALYTICS-->", googleAnalytics);
      } else {
        html = html.replace("<!--VITE_GOOGLE_ANALYTICS-->", "");
      }
      return html;
    }
  };
}
var vite_config_default = defineConfig(function(_a) {
  var command = _a.command, mode = _a.mode;
  var env = loadEnv(mode, process.cwd(), "");
  var isLegacyBuild = env.VITE_LEGACY_BUILD === "true";
  return {
    plugins: __spreadArray(__spreadArray([
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
    ], isLegacyBuild ? [
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
    ] : [], true), [
      // Image optimization plugin
      imagetools({
        defaultDirectives: function(url) {
          if (url.searchParams.has("blog")) {
            return new URLSearchParams({
              format: "webp",
              quality: "80",
              w: "640;768;1024;1280",
              as: "srcset"
            });
          }
          return new URLSearchParams();
        }
      })
    ], false),
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
    build: __assign({
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
          chunkFileNames: function(chunkInfo) {
            if (chunkInfo.name === "blog") {
              return "assets/blog-[hash].js";
            }
            return "assets/[name]-[hash].js";
          },
          // Optimize asset names
          assetFileNames: function(assetInfo) {
            var _a2;
            if ((_a2 = assetInfo.name) === null || _a2 === void 0 ? void 0 : _a2.endsWith(".css")) {
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
      chunkSizeWarningLimit: isLegacyBuild ? 1500 : 1e3
    }, isLegacyBuild && {
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
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiLCAic3JjL2Jsb2cvdXRpbHMvcmVtYXJrLWltYWdlLW9wdGltaXphdGlvbi50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9tbnQvYy9Vc2Vycy9qYWdlc3NvL0Rlc2t0b3AvYWlfY21zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvbW50L2MvVXNlcnMvamFnZXNzby9EZXNrdG9wL2FpX2Ntcy92aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vbW50L2MvVXNlcnMvamFnZXNzby9EZXNrdG9wL2FpX2Ntcy92aXRlLmNvbmZpZy5qc1wiO3ZhciBfX2Fzc2lnbiA9ICh0aGlzICYmIHRoaXMuX19hc3NpZ24pIHx8IGZ1bmN0aW9uICgpIHtcbiAgICBfX2Fzc2lnbiA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24odCkge1xuICAgICAgICBmb3IgKHZhciBzLCBpID0gMSwgbiA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgICAgIHMgPSBhcmd1bWVudHNbaV07XG4gICAgICAgICAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkpXG4gICAgICAgICAgICAgICAgdFtwXSA9IHNbcF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHQ7XG4gICAgfTtcbiAgICByZXR1cm4gX19hc3NpZ24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG52YXIgX19zcHJlYWRBcnJheSA9ICh0aGlzICYmIHRoaXMuX19zcHJlYWRBcnJheSkgfHwgZnVuY3Rpb24gKHRvLCBmcm9tLCBwYWNrKSB7XG4gICAgaWYgKHBhY2sgfHwgYXJndW1lbnRzLmxlbmd0aCA9PT0gMikgZm9yICh2YXIgaSA9IDAsIGwgPSBmcm9tLmxlbmd0aCwgYXI7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgaWYgKGFyIHx8ICEoaSBpbiBmcm9tKSkge1xuICAgICAgICAgICAgaWYgKCFhcikgYXIgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChmcm9tLCAwLCBpKTtcbiAgICAgICAgICAgIGFyW2ldID0gZnJvbVtpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdG8uY29uY2F0KGFyIHx8IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGZyb20pKTtcbn07XG5pbXBvcnQgeyBkZWZpbmVDb25maWcsIGxvYWRFbnYgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2MnO1xuaW1wb3J0IG1keCBmcm9tICdAbWR4LWpzL3JvbGx1cCc7XG5pbXBvcnQgcmVtYXJrRnJvbnRtYXR0ZXIgZnJvbSAncmVtYXJrLWZyb250bWF0dGVyJztcbmltcG9ydCByZW1hcmtNZHhGcm9udG1hdHRlciBmcm9tICdyZW1hcmstbWR4LWZyb250bWF0dGVyJztcbmltcG9ydCByZW1hcmtHZm0gZnJvbSAncmVtYXJrLWdmbSc7XG5pbXBvcnQgeyByZW1hcmtJbWFnZU9wdGltaXphdGlvbiB9IGZyb20gJy4vc3JjL2Jsb2cvdXRpbHMvcmVtYXJrLWltYWdlLW9wdGltaXphdGlvbic7XG5pbXBvcnQgeyBpbWFnZXRvb2xzIH0gZnJvbSAndml0ZS1pbWFnZXRvb2xzJztcbmltcG9ydCBsZWdhY3kgZnJvbSAnQHZpdGVqcy9wbHVnaW4tbGVnYWN5Jztcbi8vIEN1c3RvbSBwbHVnaW4gdG8gaGFuZGxlIEhUTUwgdHJhbnNmb3JtYXRpb25zIGZvciBTRU8gYW5kIGFuYWx5dGljc1xuZnVuY3Rpb24gaHRtbFRyYW5zZm9ybVBsdWdpbihlbnYpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBuYW1lOiAnaHRtbC10cmFuc2Zvcm0nLFxuICAgICAgICB0cmFuc2Zvcm1JbmRleEh0bWw6IGZ1bmN0aW9uIChodG1sLCBjdHgpIHtcbiAgICAgICAgICAgIC8vIEdldCBlbnZpcm9ubWVudCB2YXJpYWJsZXNcbiAgICAgICAgICAgIHZhciBnb29nbGVBbmFseXRpY3NJZCA9IGVudi5WSVRFX0dPT0dMRV9BTkFMWVRJQ1NfSUQ7XG4gICAgICAgICAgICAvLyBBZGQgU0VPLWZyaWVuZGx5IG1ldGEgdGFnc1xuICAgICAgICAgICAgdmFyIHByb2R1Y3Rpb25NZXRhVGFncyA9IFwiXFxuICAgIDxtZXRhIG5hbWU9XFxcImRlc2NyaXB0aW9uXFxcIiBjb250ZW50PVxcXCJBSS1GaXJzdCBDb250ZW50IE1hbmFnZW1lbnQgU3lzdGVtIGZvciBtb2Rlcm4gd2Vic2l0ZXMuIEJ1aWx0IHdpdGggUmVhY3QsIE1EWCwgYW5kIFZpdGUgd2l0aCBhdXRvbWF0aWMgU0VPIG9wdGltaXphdGlvbi5cXFwiPlxcbiAgICA8bWV0YSBuYW1lPVxcXCJrZXl3b3Jkc1xcXCIgY29udGVudD1cXFwiQUkgQ01TLCBjb250ZW50IG1hbmFnZW1lbnQsIE1EWCwgUmVhY3QsIFNFTywgd2Vic2l0ZSBidWlsZGVyLCBibG9nIHN5c3RlbVxcXCI+XFxuICAgIDxtZXRhIG5hbWU9XFxcIm9nOnRpdGxlXFxcIiBjb250ZW50PVxcXCJBSSBDTVMgLSBBSS1GaXJzdCBDb250ZW50IE1hbmFnZW1lbnQgU3lzdGVtXFxcIj5cXG4gICAgPG1ldGEgbmFtZT1cXFwib2c6ZGVzY3JpcHRpb25cXFwiIGNvbnRlbnQ9XFxcIkFJLUZpcnN0IENvbnRlbnQgTWFuYWdlbWVudCBTeXN0ZW0gZm9yIG1vZGVybiB3ZWJzaXRlcy4gQnVpbHQgd2l0aCBSZWFjdCwgTURYLCBhbmQgVml0ZSB3aXRoIGF1dG9tYXRpYyBTRU8gb3B0aW1pemF0aW9uLlxcXCI+XFxuICAgIDxtZXRhIG5hbWU9XFxcIm9nOnR5cGVcXFwiIGNvbnRlbnQ9XFxcIndlYnNpdGVcXFwiPlxcbiAgICA8bWV0YSBuYW1lPVxcXCJvZzp1cmxcXFwiIGNvbnRlbnQ9XFxcImh0dHBzOi8vZXhhbXBsZS5jb21cXFwiPlxcbiAgICA8bWV0YSBuYW1lPVxcXCJ0d2l0dGVyOmNhcmRcXFwiIGNvbnRlbnQ9XFxcInN1bW1hcnlfbGFyZ2VfaW1hZ2VcXFwiPlxcbiAgICA8bWV0YSBuYW1lPVxcXCJ0d2l0dGVyOnRpdGxlXFxcIiBjb250ZW50PVxcXCJBSSBDTVMgLSBBSS1GaXJzdCBDb250ZW50IE1hbmFnZW1lbnQgU3lzdGVtXFxcIj5cXG4gICAgPG1ldGEgbmFtZT1cXFwidHdpdHRlcjpkZXNjcmlwdGlvblxcXCIgY29udGVudD1cXFwiQUktRmlyc3QgQ29udGVudCBNYW5hZ2VtZW50IFN5c3RlbSBmb3IgbW9kZXJuIHdlYnNpdGVzLiBCdWlsdCB3aXRoIFJlYWN0LCBNRFgsIGFuZCBWaXRlIHdpdGggYXV0b21hdGljIFNFTyBvcHRpbWl6YXRpb24uXFxcIj5cIjtcbiAgICAgICAgICAgIGh0bWwgPSBodG1sLnJlcGxhY2UoJzwhLS1WSVRFX01FVEFfVEFHUy0tPicsIHByb2R1Y3Rpb25NZXRhVGFncyk7XG4gICAgICAgICAgICAvLyBSZXBsYWNlIEdvb2dsZSBBbmFseXRpY3NcbiAgICAgICAgICAgIGlmIChnb29nbGVBbmFseXRpY3NJZCkge1xuICAgICAgICAgICAgICAgIHZhciBnb29nbGVBbmFseXRpY3MgPSBcIlxcbiAgICA8c2NyaXB0IGFzeW5jIHNyYz1cXFwiaHR0cHM6Ly93d3cuZ29vZ2xldGFnbWFuYWdlci5jb20vZ3RhZy9qcz9pZD1cIi5jb25jYXQoZ29vZ2xlQW5hbHl0aWNzSWQsIFwiXFxcIj48L3NjcmlwdD5cXG4gICAgPHNjcmlwdD5cXG4gICAgICB3aW5kb3cuZGF0YUxheWVyID0gd2luZG93LmRhdGFMYXllciB8fCBbXTtcXG4gICAgICBmdW5jdGlvbiBndGFnKCl7ZGF0YUxheWVyLnB1c2goYXJndW1lbnRzKTt9XFxuICAgICAgZ3RhZygnanMnLCBuZXcgRGF0ZSgpKTtcXG4gICAgICBndGFnKCdjb25maWcnLCAnXCIpLmNvbmNhdChnb29nbGVBbmFseXRpY3NJZCwgXCInKTtcXG4gICAgPC9zY3JpcHQ+XCIpO1xuICAgICAgICAgICAgICAgIGh0bWwgPSBodG1sLnJlcGxhY2UoJzwhLS1WSVRFX0dPT0dMRV9BTkFMWVRJQ1MtLT4nLCBnb29nbGVBbmFseXRpY3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gUmVtb3ZlIHRoZSBwbGFjZWhvbGRlciBpZiBubyBhbmFseXRpY3NcbiAgICAgICAgICAgICAgICBodG1sID0gaHRtbC5yZXBsYWNlKCc8IS0tVklURV9HT09HTEVfQU5BTFlUSUNTLS0+JywgJycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgICAgIH1cbiAgICB9O1xufVxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKGZ1bmN0aW9uIChfYSkge1xuICAgIHZhciBjb21tYW5kID0gX2EuY29tbWFuZCwgbW9kZSA9IF9hLm1vZGU7XG4gICAgLy8gTG9hZCBlbnZpcm9ubWVudCB2YXJpYWJsZXNcbiAgICB2YXIgZW52ID0gbG9hZEVudihtb2RlLCBwcm9jZXNzLmN3ZCgpLCAnJyk7XG4gICAgdmFyIGlzTGVnYWN5QnVpbGQgPSBlbnYuVklURV9MRUdBQ1lfQlVJTEQgPT09ICd0cnVlJztcbiAgICByZXR1cm4ge1xuICAgICAgICBwbHVnaW5zOiBfX3NwcmVhZEFycmF5KF9fc3ByZWFkQXJyYXkoW1xuICAgICAgICAgICAgLy8gSFRNTCB0cmFuc2Zvcm1hdGlvbiBwbHVnaW4gZm9yIFNFTyBhbmQgYW5hbHl0aWNzXG4gICAgICAgICAgICBodG1sVHJhbnNmb3JtUGx1Z2luKGVudiksXG4gICAgICAgICAgICAvLyBJTVBPUlRBTlQ6IE1EWCBwbHVnaW4gbXVzdCBiZSBiZWZvcmUgUmVhY3QgcGx1Z2luXG4gICAgICAgICAgICBtZHgoe1xuICAgICAgICAgICAgICAgIHByb3ZpZGVySW1wb3J0U291cmNlOiAnQG1keC1qcy9yZWFjdCcsXG4gICAgICAgICAgICAgICAgcmVtYXJrUGx1Z2luczogW1xuICAgICAgICAgICAgICAgICAgICByZW1hcmtGcm9udG1hdHRlcixcbiAgICAgICAgICAgICAgICAgICAgcmVtYXJrTWR4RnJvbnRtYXR0ZXIsXG4gICAgICAgICAgICAgICAgICAgIHJlbWFya0dmbSxcbiAgICAgICAgICAgICAgICAgICAgcmVtYXJrSW1hZ2VPcHRpbWl6YXRpb25cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIHJlYWN0KClcbiAgICAgICAgXSwgKGlzTGVnYWN5QnVpbGQgPyBbXG4gICAgICAgICAgICBsZWdhY3koe1xuICAgICAgICAgICAgICAgIHRhcmdldHM6IFtcbiAgICAgICAgICAgICAgICAgICAgJ0Nocm9tZSA+PSA3MCcsXG4gICAgICAgICAgICAgICAgICAgICdGaXJlZm94ID49IDY4JyxcbiAgICAgICAgICAgICAgICAgICAgJ1NhZmFyaSA+PSAxMCcsXG4gICAgICAgICAgICAgICAgICAgICdFZGdlID49IDc5JyxcbiAgICAgICAgICAgICAgICAgICAgJ2lPUyA+PSAxMCcsXG4gICAgICAgICAgICAgICAgICAgICdBbmRyb2lkID49IDY3JyxcbiAgICAgICAgICAgICAgICAgICAgJz4gMSUnLFxuICAgICAgICAgICAgICAgICAgICAnbm90IGRlYWQnXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBhZGRpdGlvbmFsTGVnYWN5UG9seWZpbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgICdyZWdlbmVyYXRvci1ydW50aW1lL3J1bnRpbWUnLFxuICAgICAgICAgICAgICAgICAgICAnY29yZS1qcy9zdGFibGUnLFxuICAgICAgICAgICAgICAgICAgICAnd2hhdHdnLWZldGNoJ1xuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgbW9kZXJuUG9seWZpbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgICdlcy5wcm9taXNlLmZpbmFsbHknLFxuICAgICAgICAgICAgICAgICAgICAnZXMvbWFwJyxcbiAgICAgICAgICAgICAgICAgICAgJ2VzL3NldCcsXG4gICAgICAgICAgICAgICAgICAgICdlcy5hcnJheS5mbGF0JyxcbiAgICAgICAgICAgICAgICAgICAgJ2VzLmFycmF5LmZsYXQtbWFwJyxcbiAgICAgICAgICAgICAgICAgICAgJ2VzLm9iamVjdC5mcm9tLWVudHJpZXMnLFxuICAgICAgICAgICAgICAgICAgICAnd2ViLmRvbS1jb2xsZWN0aW9ucy5pdGVyYXRvcidcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlbmRlckxlZ2FjeUNodW5rczogdHJ1ZSxcbiAgICAgICAgICAgICAgICBleHRlcm5hbFN5c3RlbUpTOiBmYWxzZVxuICAgICAgICAgICAgfSlcbiAgICAgICAgXSA6IFtdKSwgdHJ1ZSksIFtcbiAgICAgICAgICAgIC8vIEltYWdlIG9wdGltaXphdGlvbiBwbHVnaW5cbiAgICAgICAgICAgIGltYWdldG9vbHMoe1xuICAgICAgICAgICAgICAgIGRlZmF1bHREaXJlY3RpdmVzOiBmdW5jdGlvbiAodXJsKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEFwcGx5IGRlZmF1bHQgb3B0aW1pemF0aW9ucyB0byBibG9nIGltYWdlc1xuICAgICAgICAgICAgICAgICAgICBpZiAodXJsLnNlYXJjaFBhcmFtcy5oYXMoJ2Jsb2cnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBVUkxTZWFyY2hQYXJhbXMoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcm1hdDogJ3dlYnAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1YWxpdHk6ICc4MCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdzogJzY0MDs3Njg7MTAyNDsxMjgwJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhczogJ3NyY3NldCdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVVJMU2VhcmNoUGFyYW1zKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgXSwgZmFsc2UpLFxuICAgICAgICBzZXJ2ZXI6IHtcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAvLyBEZXZlbG9wbWVudC1mcmllbmRseSBDU1AgdGhhdCBhbGxvd3MgZXh0ZXJuYWwgcmVzb3VyY2VzXG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtU2VjdXJpdHktUG9saWN5JzogW1xuICAgICAgICAgICAgICAgICAgICBcImRlZmF1bHQtc3JjICdzZWxmJ1wiLFxuICAgICAgICAgICAgICAgICAgICBcInNjcmlwdC1zcmMgJ3NlbGYnICd1bnNhZmUtZXZhbCcgJ3Vuc2FmZS1pbmxpbmUnIGh0dHBzOi8vd3d3Lmdvb2dsZXRhZ21hbmFnZXIuY29tIGh0dHBzOi8vd3d3Lmdvb2dsZS1hbmFseXRpY3MuY29tXCIsXG4gICAgICAgICAgICAgICAgICAgIFwic3R5bGUtc3JjICdzZWxmJyAndW5zYWZlLWlubGluZScgaHR0cHM6Ly9mb250cy5nb29nbGVhcGlzLmNvbVwiLFxuICAgICAgICAgICAgICAgICAgICBcImltZy1zcmMgJ3NlbGYnIGRhdGE6IGJsb2I6IGh0dHBzOlwiLFxuICAgICAgICAgICAgICAgICAgICBcImZvbnQtc3JjICdzZWxmJyBkYXRhOiBodHRwczovL2ZvbnRzLmdzdGF0aWMuY29tIGh0dHBzOi8vZm9udHMuZ29vZ2xlYXBpcy5jb21cIixcbiAgICAgICAgICAgICAgICAgICAgXCJjb25uZWN0LXNyYyAnc2VsZicgd3M6IHdzczogaHR0cHM6IGh0dHBzOi8vd3d3Lmdvb2dsZS1hbmFseXRpY3MuY29tIGh0dHBzOi8vcmVnaW9uMS5nb29nbGUtYW5hbHl0aWNzLmNvbVwiLFxuICAgICAgICAgICAgICAgICAgICBcIm1lZGlhLXNyYyAnc2VsZidcIixcbiAgICAgICAgICAgICAgICAgICAgXCJvYmplY3Qtc3JjICdub25lJ1wiLFxuICAgICAgICAgICAgICAgICAgICBcImZyYW1lLXNyYyAnbm9uZSdcIixcbiAgICAgICAgICAgICAgICAgICAgXCJiYXNlLXVyaSAnc2VsZidcIixcbiAgICAgICAgICAgICAgICAgICAgXCJmb3JtLWFjdGlvbiAnc2VsZidcIlxuICAgICAgICAgICAgICAgIF0uam9pbignOyAnKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZzOiB7XG4gICAgICAgICAgICAgICAgYWxsb3c6IFsnLi4nXVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBkZWZpbmU6IHtcbiAgICAgICAgICAgICdwcm9jZXNzLmVudic6IHt9LFxuICAgICAgICB9LFxuICAgICAgICB3b3JrZXI6IHtcbiAgICAgICAgICAgIGZvcm1hdDogJ2lpZmUnXG4gICAgICAgIH0sXG4gICAgICAgIGJ1aWxkOiBfX2Fzc2lnbih7IFxuICAgICAgICAgICAgLy8gVGFyZ2V0IG1vZGVybiBicm93c2VycyBieSBkZWZhdWx0LCBsZWdhY3kgZm9yIGNvbXBhdGliaWxpdHkgYnVpbGRcbiAgICAgICAgICAgIHRhcmdldDogaXNMZWdhY3lCdWlsZCA/ICdlczIwMTUnIDogJ2VzMjAyMCcsIFxuICAgICAgICAgICAgLy8gUGVyZm9ybWFuY2Ugb3B0aW1pemF0aW9uc1xuICAgICAgICAgICAgY3NzQ29kZVNwbGl0OiB0cnVlLCByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgb3V0cHV0OiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIENodW5rIHNwbGl0dGluZyBmb3IgYmV0dGVyIGNhY2hpbmdcbiAgICAgICAgICAgICAgICAgICAgbWFudWFsQ2h1bmtzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBWZW5kb3IgY2h1bmtzXG4gICAgICAgICAgICAgICAgICAgICAgICB2ZW5kb3I6IFsncmVhY3QnLCAncmVhY3QtZG9tJywgJ3JlYWN0LXJvdXRlci1kb20nXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVpOiBbJ0BoZWFkbGVzc3VpL3JlYWN0JywgJ0BoZXJvaWNvbnMvcmVhY3QnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEJsb2cgY2h1bmtzXG4gICAgICAgICAgICAgICAgICAgICAgICBibG9nOiBbJ0BtZHgtanMvcmVhY3QnLCAnZ3JheS1tYXR0ZXInXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFuYWx5dGljcyBjaHVuayAgXG4gICAgICAgICAgICAgICAgICAgICAgICBhbmFseXRpY3M6IFsncmVhY3QtaGVsbWV0LWFzeW5jJ11cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgLy8gT3B0aW1pemUgY2h1bmsgbmFtZXNcbiAgICAgICAgICAgICAgICAgICAgY2h1bmtGaWxlTmFtZXM6IGZ1bmN0aW9uIChjaHVua0luZm8pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaHVua0luZm8ubmFtZSA9PT0gJ2Jsb2cnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdhc3NldHMvYmxvZy1baGFzaF0uanMnO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdhc3NldHMvW25hbWVdLVtoYXNoXS5qcyc7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIC8vIE9wdGltaXplIGFzc2V0IG5hbWVzXG4gICAgICAgICAgICAgICAgICAgIGFzc2V0RmlsZU5hbWVzOiBmdW5jdGlvbiAoYXNzZXRJbmZvKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgX2E7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoKF9hID0gYXNzZXRJbmZvLm5hbWUpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5lbmRzV2l0aCgnLmNzcycpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdhc3NldHMvW25hbWVdLVtoYXNoXS5jc3MnO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdhc3NldHMvW25hbWVdLVtoYXNoXVtleHRuYW1lXSc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCBcbiAgICAgICAgICAgIC8vIEVuYWJsZSBzb3VyY2UgbWFwcyBmb3IgZGVidWdnaW5nIGluIGRldmVsb3BtZW50XG4gICAgICAgICAgICBzb3VyY2VtYXA6IGNvbW1hbmQgPT09ICdzZXJ2ZScsIFxuICAgICAgICAgICAgLy8gTWluaWZ5IGZvciBwcm9kdWN0aW9uICh1c2luZyBlc2J1aWxkIGZvciBtb2Rlcm4sIHRlcnNlciBmb3IgbGVnYWN5KVxuICAgICAgICAgICAgbWluaWZ5OiBpc0xlZ2FjeUJ1aWxkID8gJ3RlcnNlcicgOiAnZXNidWlsZCcsIFxuICAgICAgICAgICAgLy8gT3B0aW1pemUgQ1NTXG4gICAgICAgICAgICBjc3NNaW5pZnk6IHRydWUsIFxuICAgICAgICAgICAgLy8gUmVwb3J0IGJ1bmRsZSBzaXplXG4gICAgICAgICAgICByZXBvcnRDb21wcmVzc2VkU2l6ZTogdHJ1ZSwgXG4gICAgICAgICAgICAvLyBDaHVuayBzaXplIGxpbWl0IChsYXJnZXIgZm9yIGxlZ2FjeSBidWlsZHMgZHVlIHRvIHBvbHlmaWxscylcbiAgICAgICAgICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogaXNMZWdhY3lCdWlsZCA/IDE1MDAgOiAxMDAwIH0sIChpc0xlZ2FjeUJ1aWxkICYmIHtcbiAgICAgICAgICAgIHRlcnNlck9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICBjb21wcmVzczoge1xuICAgICAgICAgICAgICAgICAgICBkcm9wX2NvbnNvbGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGRyb3BfZGVidWdnZXI6IHRydWVcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG1hbmdsZToge1xuICAgICAgICAgICAgICAgICAgICBzYWZhcmkxMDogdHJ1ZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpXG4gICAgfTtcbn0pO1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvbW50L2MvVXNlcnMvamFnZXNzby9EZXNrdG9wL2FpX2Ntcy9zcmMvYmxvZy91dGlsc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL21udC9jL1VzZXJzL2phZ2Vzc28vRGVza3RvcC9haV9jbXMvc3JjL2Jsb2cvdXRpbHMvcmVtYXJrLWltYWdlLW9wdGltaXphdGlvbi50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vbW50L2MvVXNlcnMvamFnZXNzby9EZXNrdG9wL2FpX2Ntcy9zcmMvYmxvZy91dGlscy9yZW1hcmstaW1hZ2Utb3B0aW1pemF0aW9uLnRzXCI7aW1wb3J0IHsgdmlzaXQgfSBmcm9tICd1bmlzdC11dGlsLXZpc2l0JztcclxuaW1wb3J0IHR5cGUgeyBSb290LCBFbGVtZW50IH0gZnJvbSAnaGFzdCc7XHJcblxyXG5pbnRlcmZhY2UgSW1hZ2VOb2RlIGV4dGVuZHMgRWxlbWVudCB7XHJcbiAgdGFnTmFtZTogJ2ltZyc7XHJcbiAgcHJvcGVydGllczoge1xyXG4gICAgc3JjOiBzdHJpbmc7XHJcbiAgICBhbHQ/OiBzdHJpbmc7XHJcbiAgICB0aXRsZT86IHN0cmluZztcclxuICAgIHdpZHRoPzogc3RyaW5nIHwgbnVtYmVyO1xyXG4gICAgaGVpZ2h0Pzogc3RyaW5nIHwgbnVtYmVyO1xyXG4gICAgW2tleTogc3RyaW5nXTogYW55O1xyXG4gIH07XHJcbn1cclxuXHJcbi8vIFJlbWFyayBwbHVnaW4gdG8gdHJhbnNmb3JtIGltZyB0YWdzIHRvIG9wdGltaXplZCBCbG9nSW1hZ2UgY29tcG9uZW50c1xyXG5leHBvcnQgZnVuY3Rpb24gcmVtYXJrSW1hZ2VPcHRpbWl6YXRpb24oKSB7XHJcbiAgcmV0dXJuICh0cmVlOiBSb290KSA9PiB7XHJcbiAgICB2aXNpdCh0cmVlLCAnZWxlbWVudCcsIChub2RlOiBFbGVtZW50KSA9PiB7XHJcbiAgICAgIGlmIChub2RlLnRhZ05hbWUgPT09ICdpbWcnKSB7XHJcbiAgICAgICAgY29uc3QgaW1nTm9kZSA9IG5vZGUgYXMgSW1hZ2VOb2RlO1xyXG4gICAgICAgIGNvbnN0IHsgc3JjLCBhbHQsIHRpdGxlLCB3aWR0aCwgaGVpZ2h0LCAuLi5vdGhlclByb3BzIH0gPSBpbWdOb2RlLnByb3BlcnRpZXM7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gU2tpcCBpZiBubyBzcmMgb3IgYWx0IChhbHQgaXMgcmVxdWlyZWQgZm9yIGFjY2Vzc2liaWxpdHkpXHJcbiAgICAgICAgaWYgKCFzcmMgfHwgIWFsdCkge1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQ2hlY2sgaWYgdGhlIGltYWdlIGlzIGZyb20gYmxvZy1hc3NldHNcclxuICAgICAgICBjb25zdCBpc0Jsb2dBc3NldCA9IHNyYy5pbmNsdWRlcygnL2Jsb2ctYXNzZXRzLycpIHx8IHNyYy5pbmNsdWRlcygnYmxvZy1hc3NldHMvJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKGlzQmxvZ0Fzc2V0KSB7XHJcbiAgICAgICAgICAvLyBUcmFuc2Zvcm0gdG8gQmxvZ0ltYWdlIGNvbXBvbmVudFxyXG4gICAgICAgICAgbm9kZS50YWdOYW1lID0gJ0Jsb2dJbWFnZSc7XHJcbiAgICAgICAgICBub2RlLnByb3BlcnRpZXMgPSB7XHJcbiAgICAgICAgICAgIHNyYzogc3JjLFxyXG4gICAgICAgICAgICBhbHQ6IGFsdCxcclxuICAgICAgICAgICAgLi4uKHRpdGxlICYmIHsgY2FwdGlvbjogdGl0bGUgfSksXHJcbiAgICAgICAgICAgIC4uLih3aWR0aCAmJiB7IHdpZHRoOiB0eXBlb2Ygd2lkdGggPT09ICdzdHJpbmcnID8gcGFyc2VJbnQod2lkdGgpIDogd2lkdGggfSksXHJcbiAgICAgICAgICAgIC4uLihoZWlnaHQgJiYgeyBoZWlnaHQ6IHR5cGVvZiBoZWlnaHQgPT09ICdzdHJpbmcnID8gcGFyc2VJbnQoaGVpZ2h0KSA6IGhlaWdodCB9KSxcclxuICAgICAgICAgICAgLi4ub3RoZXJQcm9wc1xyXG4gICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH07XHJcbn1cclxuXHJcbi8vIFBsdWdpbiB0byBwcm9jZXNzIGltYWdlIGltcG9ydHMgYXQgYnVpbGQgdGltZVxyXG5leHBvcnQgZnVuY3Rpb24gcmVtYXJrSW1hZ2VJbXBvcnRzKCkge1xyXG4gIHJldHVybiAodHJlZTogUm9vdCkgPT4ge1xyXG4gICAgLy8gU2ltcGxlIHRyYW5zZm9ybWF0aW9uIC0gbGV0IHRoZSBNRFggY29tcG9uZW50cyBoYW5kbGUgb3B0aW1pemF0aW9uXHJcbiAgICB2aXNpdCh0cmVlLCAnZWxlbWVudCcsIChub2RlOiBFbGVtZW50KSA9PiB7XHJcbiAgICAgIGlmIChub2RlLnRhZ05hbWUgPT09ICdpbWcnKSB7XHJcbiAgICAgICAgY29uc3Qgc3JjID0gbm9kZS5wcm9wZXJ0aWVzPy5zcmMgYXMgc3RyaW5nO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmIChzcmMgJiYgc3JjLnN0YXJ0c1dpdGgoJy9ibG9nLWFzc2V0cy8nKSkge1xyXG4gICAgICAgICAgLy8gTWFyayBmb3Igb3B0aW1pemF0aW9uIGJ5IGFkZGluZyBhIGRhdGEgYXR0cmlidXRlXHJcbiAgICAgICAgICBub2RlLnByb3BlcnRpZXMgPSB7XHJcbiAgICAgICAgICAgIC4uLm5vZGUucHJvcGVydGllcyxcclxuICAgICAgICAgICAgJ2RhdGEtb3B0aW1pemUnOiAndHJ1ZSdcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9O1xyXG59XHJcblxyXG4vLyBnZW5lcmF0ZUltcG9ydE5hbWUgZnVuY3Rpb24gcmVtb3ZlZCAtIG5vdCB1c2VkXHJcblxyXG4vLyBBbHRlcm5hdGl2ZSBhcHByb2FjaDogVHJhbnNmb3JtIGF0IHJ1bnRpbWUgaW4gTURYIGNvbXBvbmVudHNcclxuZXhwb3J0IGNvbnN0IG1keEltYWdlQ29tcG9uZW50cyA9IHtcclxuICBpbWc6ICdPcHRpbWl6ZWRJbWcnIC8vIFRoaXMgd2lsbCBiZSByZXBsYWNlZCBieSB0aGUgYWN0dWFsIGNvbXBvbmVudCBpbiBNRFhDb21wb25lbnRzLnRzeFxyXG59O1xyXG5cclxuLy8gSGVscGVyIGZ1bmN0aW9uIHRvIGRldGVjdCBpZiBhbiBpbWFnZSBzaG91bGQgYmUgb3B0aW1pemVkXHJcbmV4cG9ydCBmdW5jdGlvbiBzaG91bGRPcHRpbWl6ZUltYWdlKHNyYzogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgLy8gRG9uJ3Qgb3B0aW1pemUgZXh0ZXJuYWwgaW1hZ2VzXHJcbiAgaWYgKHNyYy5zdGFydHNXaXRoKCdodHRwJykgfHwgc3JjLnN0YXJ0c1dpdGgoJy8vJykpIHtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcbiAgXHJcbiAgLy8gRG9uJ3Qgb3B0aW1pemUgU1ZHcyAodGhleSdyZSBhbHJlYWR5IG9wdGltaXplZClcclxuICBpZiAoc3JjLmVuZHNXaXRoKCcuc3ZnJykpIHtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcbiAgXHJcbiAgLy8gT3B0aW1pemUgaW1hZ2VzIGZyb20gYmxvZy1hc3NldHNcclxuICBpZiAoc3JjLmluY2x1ZGVzKCdibG9nLWFzc2V0cycpKSB7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcbiAgXHJcbiAgLy8gRGVmYXVsdCB0byBvcHRpbWl6aW5nIGxvY2FsIGltYWdlc1xyXG4gIHJldHVybiAhc3JjLnN0YXJ0c1dpdGgoJ2h0dHAnKTtcclxufVxyXG5cclxuLy8gR2VuZXJhdGUgbWV0YSBpbmZvcm1hdGlvbiBmb3IgaW1hZ2VzXHJcbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZUltYWdlTWV0YShzcmM6IHN0cmluZywgYWx0OiBzdHJpbmcpIHtcclxuICByZXR1cm4ge1xyXG4gICAgc3JjLFxyXG4gICAgYWx0LFxyXG4gICAgbG9hZGluZzogJ2xhenknIGFzIGNvbnN0LFxyXG4gICAgZGVjb2Rpbmc6ICdhc3luYycgYXMgY29uc3QsXHJcbiAgICBzaXplczogJyhtYXgtd2lkdGg6IDY0MHB4KSAxMDB2dywgKG1heC13aWR0aDogNzY4cHgpIDc2OHB4LCAobWF4LXdpZHRoOiAxMDI0cHgpIDEwMjRweCwgMTI4MHB4J1xyXG4gIH07XHJcbn0iXSwKICAibWFwcGluZ3MiOiAiO0FBb0JBLFNBQVMsY0FBYyxlQUFlO0FBQ3RDLE9BQU8sV0FBVztBQUNsQixPQUFPLFNBQVM7QUFDaEIsT0FBTyx1QkFBdUI7QUFDOUIsT0FBTywwQkFBMEI7QUFDakMsT0FBTyxlQUFlOzs7QUN6QjhVLFNBQVMsYUFBYTtBQWdCblgsU0FBUywwQkFBMEI7QUFDeEMsU0FBTyxDQUFDLFNBQWU7QUFDckIsVUFBTSxNQUFNLFdBQVcsQ0FBQyxTQUFrQjtBQUN4QyxVQUFJLEtBQUssWUFBWSxPQUFPO0FBQzFCLGNBQU0sVUFBVTtBQUNoQixjQUFNLEVBQUUsS0FBSyxLQUFLLE9BQU8sT0FBTyxRQUFRLEdBQUcsV0FBVyxJQUFJLFFBQVE7QUFHbEUsWUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLO0FBQ2hCO0FBQUEsUUFDRjtBQUdBLGNBQU0sY0FBYyxJQUFJLFNBQVMsZUFBZSxLQUFLLElBQUksU0FBUyxjQUFjO0FBRWhGLFlBQUksYUFBYTtBQUVmLGVBQUssVUFBVTtBQUNmLGVBQUssYUFBYTtBQUFBLFlBQ2hCO0FBQUEsWUFDQTtBQUFBLFlBQ0EsR0FBSSxTQUFTLEVBQUUsU0FBUyxNQUFNO0FBQUEsWUFDOUIs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
