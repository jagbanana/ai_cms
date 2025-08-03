module.exports = {
  ci: {
    collect: {
      // URLs to audit
      url: [
        'http://localhost:4173/blog',
        'http://localhost:4173/blog/tips',
        'http://localhost:4173/blog/guides',
        'http://localhost:4173/blog/news',
        'http://localhost:4173/blog/tips/test-chess-tips',
        'http://localhost:4173/best-chess-apps-2025'
      ],
      startServerCommand: 'npm run preview',
      startServerReadyPattern: 'Local:',
      numberOfRuns: 3,
      settings: {
        // Lighthouse config
        preset: 'desktop',
        throttlingMethod: 'devtools',
        // Skip certain audits for faster runs
        skipAudits: [
          'canonical',
          'robots-txt',
          'hreflang'
        ],
        // Custom budget assertions
        budgets: [{
          resourceSizes: [
            { resourceType: 'total', budget: 500 },
            { resourceType: 'script', budget: 200 },
            { resourceType: 'stylesheet', budget: 50 },
            { resourceType: 'image', budget: 200 }
          ],
          timings: [
            { metric: 'first-contentful-paint', budget: 1800 },
            { metric: 'largest-contentful-paint', budget: 2500 },
            { metric: 'cumulative-layout-shift', budget: 0.1 },
            { metric: 'first-input-delay', budget: 100 },
            { metric: 'speed-index', budget: 3000 }
          ]
        }]
      }
    },
    assert: {
      assertions: {
        // Performance assertions
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        
        // Core Web Vitals
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'speed-index': ['error', { maxNumericValue: 3000 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        
        // Resource hints
        'uses-rel-preconnect': 'warn',
        'uses-rel-preload': 'warn',
        'preload-lcp-image': 'warn',
        
        // Images
        'modern-image-formats': 'warn',
        'efficiently-encode-images': 'warn',
        'properly-size-images': 'warn',
        
        // JavaScript
        'unused-javascript': 'warn',
        'legacy-javascript': 'warn',
        'duplicated-javascript': 'warn',
        
        // CSS
        'unused-css-rules': 'warn',
        'unminified-css': 'error',
        
        // Fonts
        'font-display': 'warn',
        'preload-fonts': 'warn'
      }
    },
    upload: {
      target: 'filesystem',
      outputDir: './lighthouse-reports',
      reportFilenamePattern: '%%PATHNAME%%-%%DATETIME%%.report.%%EXTENSION%%'
    },
    wizard: {
      // Interactive setup
      preset: 'custom'
    }
  }
};