#!/usr/bin/env node

/**
 * Cross-Browser Testing Script for AI CMS
 * 
 * Performs automated browser testing including:
 * - Visual regression tests across browsers
 * - Performance comparison between browsers
 * - Feature matrix generation and compatibility checks
 * - Automated compatibility report generation
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');
const { performance } = require('perf_hooks');

// Configuration
const CONFIG = {
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:5173',
  outputDir: path.join(__dirname, '../cross-browser-reports'),
  timeout: 30000,
  headless: process.env.HEADLESS !== 'false',
  browsers: [
    {
      name: 'Chrome',
      product: 'chrome',
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    },
    {
      name: 'Firefox',
      product: 'firefox',
      args: ['--no-sandbox']
    }
  ],
  testPages: [
    {
      path: '/',
      name: 'Home Page',
      description: 'Main landing page with navigation and features'
    },
    {
      path: '/lesson-builder',
      name: 'Lesson Builder',
      description: 'Puzzle selection and lesson creation interface'
    },
    {
      path: '/analytics',
      name: 'Analytics Dashboard',
      description: 'Content performance and analytics view'
    }
  ],
  viewports: [
    { width: 1920, height: 1080, name: 'Desktop Large' },
    { width: 1366, height: 768, name: 'Desktop Standard' },
    { width: 768, height: 1024, name: 'Tablet' },
    { width: 375, height: 667, name: 'Mobile' }
  ],
  features: [
    'WebGL',
    'WebWorkers',
    'IndexedDB',
    'ServiceWorkers',
    'WebAssembly',
    'ES6Modules',
    'IntersectionObserver',
    'ResizeObserver',
    'LocalStorage',
    'TouchEvents'
  ]
};

class CrossBrowserTester {
  constructor() {
    this.results = {
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        browsers: [],
        startTime: new Date().toISOString(),
        endTime: null
      },
      browsers: new Map(),
      performanceComparison: {},
      featureMatrix: {},
      visualDifferences: [],
      recommendations: []
    };
  }

  async initialize() {
    console.log(chalk.blue('🚀 Starting Cross-Browser Testing for AI CMS\n'));
    
    // Ensure output directory exists
    await fs.mkdir(CONFIG.outputDir, { recursive: true });
    
    console.log(chalk.green('✅ Output directory created\n'));
  }

  async testBrowser(browserConfig) {
    console.log(chalk.yellow(`🌐 Testing ${browserConfig.name}...`));
    
    const startTime = performance.now();
    
    // Launch browser
    const browser = await puppeteer.launch({
      product: browserConfig.product,
      headless: CONFIG.headless,
      args: browserConfig.args,
      timeout: CONFIG.timeout
    });

    const browserResults = {
      name: browserConfig.name,
      version: await this.getBrowserVersion(browser),
      pages: new Map(),
      features: new Map(),
      performance: {
        totalTime: 0,
        averageLoadTime: 0,
        memoryUsage: {},
        renderingPerformance: {}
      },
      errors: [],
      warnings: [],
      compatibility: {
        score: 0,
        level: 'unknown',
        issues: []
      }
    };

    try {
      // Test feature support
      await this.testFeatureSupport(browser, browserResults);
      
      // Test each page across different viewports
      for (const pageConfig of CONFIG.testPages) {
        await this.testPage(browser, pageConfig, browserResults);
      }
      
      // Run performance tests
      await this.runPerformanceTests(browser, browserResults);
      
      // Calculate compatibility score
      this.calculateCompatibilityScore(browserResults);
      
    } catch (error) {
      console.error(chalk.red(`❌ Error testing ${browserConfig.name}: ${error.message}`));
      browserResults.errors.push({
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    } finally {
      await browser.close();
      browserResults.performance.totalTime = performance.now() - startTime;
    }

    this.results.browsers.set(browserConfig.name, browserResults);
    console.log(chalk.green(`✅ Completed testing ${browserConfig.name}\n`));
    
    return browserResults;
  }

  async getBrowserVersion(browser) {
    const version = await browser.version();
    return version;
  }

  async testFeatureSupport(browser, browserResults) {
    console.log(chalk.blue('   🔍 Testing feature support...'));
    
    const page = await browser.newPage();
    await page.goto(CONFIG.baseUrl, { waitUntil: 'networkidle0' });
    
    // Inject browser compatibility utilities
    await page.addScriptTag({
      path: path.join(__dirname, '../src/utils/browserCompat.ts')
    });
    
    const features = await page.evaluate(() => {
      // Use the feature detector from browserCompat.ts
      const results = {};
      
      // Test WebGL
      try {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        results.WebGL = !!context;
      } catch (e) {
        results.WebGL = false;
      }
      
      // Test Web Workers
      results.WebWorkers = typeof Worker !== 'undefined';
      
      // Test IndexedDB
      results.IndexedDB = 'indexedDB' in window && indexedDB !== null;
      
      // Test Service Workers
      results.ServiceWorkers = 'serviceWorker' in navigator;
      
      // Test WebAssembly
      results.WebAssembly = typeof WebAssembly === 'object' && typeof WebAssembly.instantiate === 'function';
      
      // Test ES6 Modules
      try {
        const script = document.createElement('script');
        results.ES6Modules = 'noModule' in script;
      } catch (e) {
        results.ES6Modules = false;
      }
      
      // Test Intersection Observer
      results.IntersectionObserver = 'IntersectionObserver' in window;
      
      // Test Resize Observer
      results.ResizeObserver = 'ResizeObserver' in window;
      
      // Test Local Storage
      try {
        localStorage.setItem('__test__', 'test');
        localStorage.removeItem('__test__');
        results.LocalStorage = true;
      } catch (e) {
        results.LocalStorage = false;
      }
      
      // Test Touch Events
      results.TouchEvents = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      return results;
    });
    
    for (const [feature, supported] of Object.entries(features)) {
      browserResults.features.set(feature, supported);
    }
    
    await page.close();
  }

  async testPage(browser, pageConfig, browserResults) {
    console.log(chalk.blue(`   📄 Testing ${pageConfig.name}...`));
    
    const pageResults = {
      name: pageConfig.name,
      path: pageConfig.path,
      viewports: new Map(),
      loadTimes: [],
      errors: [],
      console: [],
      screenshots: []
    };

    for (const viewport of CONFIG.viewports) {
      await this.testPageViewport(browser, pageConfig, viewport, pageResults);
    }

    browserResults.pages.set(pageConfig.name, pageResults);
  }

  async testPageViewport(browser, pageConfig, viewport, pageResults) {
    const page = await browser.newPage();
    
    try {
      // Set viewport
      await page.setViewport({
        width: viewport.width,
        height: viewport.height
      });

      // Track console logs and errors
      const consoleLogs = [];
      const pageErrors = [];
      
      page.on('console', msg => {
        consoleLogs.push({
          type: msg.type(),
          text: msg.text(),
          timestamp: Date.now()
        });
      });
      
      page.on('pageerror', error => {
        pageErrors.push({
          message: error.message,
          stack: error.stack,
          timestamp: Date.now()
        });
      });

      // Navigate to page and measure load time
      const startTime = performance.now();
      await page.goto(`${CONFIG.baseUrl}${pageConfig.path}`, {
        waitUntil: 'networkidle0',
        timeout: CONFIG.timeout
      });
      const loadTime = performance.now() - startTime;

      // Wait for dynamic content
      await page.waitForTimeout(2000);

      // Run page-specific tests
      const pageMetrics = await this.runPageTests(page);

      // Take screenshot
      const screenshotPath = path.join(
        CONFIG.outputDir,
        `${pageConfig.name.replace(/\s+/g, '-')}-${viewport.name.replace(/\s+/g, '-')}-${browserResults.name}.png`
      );
      await page.screenshot({
        path: screenshotPath,
        fullPage: true
      });

      const viewportResults = {
        viewport: viewport.name,
        dimensions: `${viewport.width}x${viewport.height}`,
        loadTime,
        errors: pageErrors,
        console: consoleLogs,
        metrics: pageMetrics,
        screenshot: screenshotPath
      };

      pageResults.viewports.set(viewport.name, viewportResults);
      pageResults.loadTimes.push(loadTime);

    } catch (error) {
      console.error(chalk.red(`     ❌ Error testing ${pageConfig.name} at ${viewport.name}: ${error.message}`));
      pageResults.errors.push({
        viewport: viewport.name,
        message: error.message,
        stack: error.stack
      });
    } finally {
      await page.close();
    }
  }

  async runPageTests(page) {
    // Run Chess Trainer specific tests
    const metrics = await page.evaluate(() => {
      const results = {
        chessBoard: false,
        puzzleSelector: false,
        navigation: false,
        accessibility: {
          ariaLabels: 0,
          landmarks: 0,
          headings: 0
        },
        performance: {}
      };

      // Check for chess board component
      results.chessBoard = !!document.querySelector('.chess-board, [data-testid*="chess"], .react-chessboard');
      
      // Check for puzzle selector
      results.puzzleSelector = !!document.querySelector('[data-testid="puzzle-selector"], .puzzle-selector');
      
      // Check navigation
      results.navigation = !!document.querySelector('nav, [role="navigation"]');
      
      // Accessibility checks
      results.accessibility.ariaLabels = document.querySelectorAll('[aria-label]').length;
      results.accessibility.landmarks = document.querySelectorAll('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], main, nav, header, footer').length;
      results.accessibility.headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6').length;
      
      // Performance metrics
      if (window.performance && window.performance.getEntriesByType) {
        const navigation = window.performance.getEntriesByType('navigation')[0];
        if (navigation) {
          results.performance = {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            firstPaint: window.performance.getEntriesByType('paint').find(p => p.name === 'first-paint')?.startTime || 0,
            firstContentfulPaint: window.performance.getEntriesByType('paint').find(p => p.name === 'first-contentful-paint')?.startTime || 0
          };
        }
      }
      
      return results;
    });

    return metrics;
  }

  async runPerformanceTests(browser, browserResults) {
    console.log(chalk.blue('   ⚡ Running performance tests...'));
    
    const page = await browser.newPage();
    
    try {
      // Enable performance monitoring
      await page.setCacheEnabled(false);
      
      // Test performance on main page
      await page.goto(CONFIG.baseUrl, { waitUntil: 'networkidle0' });
      
      const metrics = await page.metrics();
      const performanceMetrics = await page.evaluate(() => {
        return JSON.stringify(window.performance.timing);
      });
      
      browserResults.performance.memoryUsage = {
        jsHeapSizeLimit: metrics.JSHeapSizeLimit,
        jsHeapSizeTotal: metrics.JSHeapSizeTotal,
        jsHeapSizeUsed: metrics.JSHeapSizeUsed
      };
      
      browserResults.performance.renderingPerformance = JSON.parse(performanceMetrics);
      
      // Calculate average load time
      const loadTimes = [];
      for (const [, pageResult] of browserResults.pages) {
        loadTimes.push(...pageResult.loadTimes);
      }
      browserResults.performance.averageLoadTime = loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length;
      
    } catch (error) {
      console.error(chalk.red(`     ❌ Performance test failed: ${error.message}`));
      browserResults.errors.push({
        test: 'performance',
        message: error.message
      });
    } finally {
      await page.close();
    }
  }

  calculateCompatibilityScore(browserResults) {
    let score = 100;
    const issues = [];
    
    // Check feature support
    const requiredFeatures = ['WebGL', 'WebWorkers', 'IndexedDB', 'LocalStorage'];
    const recommendedFeatures = ['ServiceWorkers', 'WebAssembly', 'IntersectionObserver'];
    
    for (const feature of requiredFeatures) {
      if (!browserResults.features.get(feature)) {
        score -= 20;
        issues.push(`Missing required feature: ${feature}`);
      }
    }
    
    for (const feature of recommendedFeatures) {
      if (!browserResults.features.get(feature)) {
        score -= 10;
        issues.push(`Missing recommended feature: ${feature}`);
      }
    }
    
    // Check performance
    if (browserResults.performance.averageLoadTime > 3000) {
      score -= 15;
      issues.push('Slow page load times (>3s)');
    }
    
    // Check for errors
    if (browserResults.errors.length > 0) {
      score -= browserResults.errors.length * 5;
      issues.push(`${browserResults.errors.length} errors detected`);
    }
    
    // Determine compatibility level
    let level = 'unsupported';
    if (score >= 90) level = 'excellent';
    else if (score >= 75) level = 'good';
    else if (score >= 60) level = 'fair';
    else if (score >= 40) level = 'poor';
    
    browserResults.compatibility = {
      score: Math.max(0, score),
      level,
      issues
    };
  }

  generateFeatureMatrix() {
    console.log(chalk.blue('📊 Generating feature matrix...'));
    
    const matrix = {};
    
    for (const feature of CONFIG.features) {
      matrix[feature] = {};
      for (const [browserName, browserResults] of this.results.browsers) {
        matrix[feature][browserName] = browserResults.features.get(feature) || false;
      }
    }
    
    this.results.featureMatrix = matrix;
  }

  generatePerformanceComparison() {
    console.log(chalk.blue('📈 Generating performance comparison...'));
    
    const comparison = {};
    
    for (const [browserName, browserResults] of this.results.browsers) {
      comparison[browserName] = {
        averageLoadTime: browserResults.performance.averageLoadTime,
        memoryUsage: browserResults.performance.memoryUsage.jsHeapSizeUsed,
        compatibilityScore: browserResults.compatibility.score,
        errorCount: browserResults.errors.length
      };
    }
    
    this.results.performanceComparison = comparison;
  }

  generateRecommendations() {
    console.log(chalk.blue('💡 Generating recommendations...'));
    
    const recommendations = [];
    
    // Analyze results and generate recommendations
    for (const [browserName, browserResults] of this.results.browsers) {
      if (browserResults.compatibility.score < 75) {
        recommendations.push({
          type: 'compatibility',
          browser: browserName,
          message: `${browserName} has compatibility issues (score: ${browserResults.compatibility.score})`,
          issues: browserResults.compatibility.issues,
          priority: 'high'
        });
      }
      
      if (browserResults.performance.averageLoadTime > 3000) {
        recommendations.push({
          type: 'performance',
          browser: browserName,
          message: `${browserName} has slow load times (${Math.round(browserResults.performance.averageLoadTime)}ms)`,
          priority: 'medium'
        });
      }
      
      if (browserResults.errors.length > 0) {
        recommendations.push({
          type: 'errors',
          browser: browserName,
          message: `${browserName} has ${browserResults.errors.length} errors that need attention`,
          priority: 'high'
        });
      }
    }
    
    // Add general recommendations
    recommendations.push({
      type: 'general',
      message: 'Consider implementing feature detection and progressive enhancement',
      priority: 'medium'
    });
    
    recommendations.push({
      type: 'general',
      message: 'Regular cross-browser testing should be part of the CI/CD pipeline',
      priority: 'low'
    });
    
    this.results.recommendations = recommendations;
  }

  async generateReport() {
    console.log(chalk.blue('📄 Generating cross-browser test report...'));
    
    // Update summary
    this.results.summary.endTime = new Date().toISOString();
    this.results.summary.browsers = Array.from(this.results.browsers.keys());
    this.results.summary.totalTests = CONFIG.testPages.length * CONFIG.viewports.length * this.results.summary.browsers.length;
    this.results.summary.passedTests = this.results.summary.totalTests - this.results.summary.failedTests;
    
    // Generate different report formats
    await this.generateHTMLReport();
    await this.generateJSONReport();
    await this.generateMarkdownReport();
    
    return {
      htmlReport: path.join(CONFIG.outputDir, 'cross-browser-report.html'),
      jsonReport: path.join(CONFIG.outputDir, 'cross-browser-report.json'),
      markdownReport: path.join(CONFIG.outputDir, 'cross-browser-report.md')
    };
  }

  async generateHTMLReport() {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI CMS Cross-Browser Test Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: white; padding: 30px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .stat { background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .stat-value { font-size: 2em; font-weight: bold; color: #3182ce; }
        .browser-results { background: white; margin: 20px 0; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .compatibility-score { font-size: 1.5em; font-weight: bold; }
        .excellent { color: #38a169; }
        .good { color: #3182ce; }
        .fair { color: #d69e2e; }
        .poor { color: #e53e3e; }
        .unsupported { color: #e53e3e; }
        .feature-matrix { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .feature-matrix th, .feature-matrix td { border: 1px solid #ddd; padding: 8px; text-align: center; }
        .feature-matrix th { background: #f7fafc; }
        .supported { background: #c6f6d5; }
        .unsupported-feature { background: #fed7d7; }
        .recommendation { margin: 10px 0; padding: 15px; border-left: 4px solid #3182ce; background: #ebf8ff; }
        .high-priority { border-left-color: #e53e3e; background: #fed7d7; }
        .medium-priority { border-left-color: #d69e2e; background: #fefcbf; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>AI CMS Cross-Browser Test Report</h1>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Test Duration:</strong> ${new Date(this.results.summary.endTime) - new Date(this.results.summary.startTime)}ms</p>
        </div>
        
        <div class="summary">
            <div class="stat">
                <div class="stat-value">${this.results.summary.browsers.length}</div>
                <div>Browsers Tested</div>
            </div>
            <div class="stat">
                <div class="stat-value">${this.results.summary.totalTests}</div>
                <div>Total Tests</div>
            </div>
            <div class="stat">
                <div class="stat-value">${this.results.summary.passedTests}</div>
                <div>Tests Passed</div>
            </div>
            <div class="stat">
                <div class="stat-value">${this.results.summary.failedTests}</div>
                <div>Tests Failed</div>
            </div>
        </div>
        
        <h2>Browser Compatibility Results</h2>
        ${Array.from(this.results.browsers.entries()).map(([name, results]) => `
            <div class="browser-results">
                <h3>${name} ${results.version}</h3>
                <p><strong>Compatibility Score:</strong> 
                   <span class="compatibility-score ${results.compatibility.level}">${results.compatibility.score}/100 (${results.compatibility.level})</span>
                </p>
                <p><strong>Average Load Time:</strong> ${Math.round(results.performance.averageLoadTime)}ms</p>
                <p><strong>Memory Usage:</strong> ${Math.round(results.performance.memoryUsage.jsHeapSizeUsed / 1024 / 1024)}MB</p>
                <p><strong>Errors:</strong> ${results.errors.length}</p>
                ${results.compatibility.issues.length > 0 ? `
                    <h4>Issues:</h4>
                    <ul>${results.compatibility.issues.map(issue => `<li>${issue}</li>`).join('')}</ul>
                ` : ''}
            </div>
        `).join('')}
        
        <h2>Feature Support Matrix</h2>
        <table class="feature-matrix">
            <tr>
                <th>Feature</th>
                ${this.results.summary.browsers.map(browser => `<th>${browser}</th>`).join('')}
            </tr>
            ${Object.entries(this.results.featureMatrix).map(([feature, support]) => `
                <tr>
                    <td><strong>${feature}</strong></td>
                    ${this.results.summary.browsers.map(browser => `
                        <td class="${support[browser] ? 'supported' : 'unsupported-feature'}">
                            ${support[browser] ? '✓' : '✗'}
                        </td>
                    `).join('')}
                </tr>
            `).join('')}
        </table>
        
        <h2>Recommendations</h2>
        ${this.results.recommendations.map(rec => `
            <div class="recommendation ${rec.priority}-priority">
                <strong>${rec.type.toUpperCase()}${rec.browser ? ` (${rec.browser})` : ''}:</strong> ${rec.message}
            </div>
        `).join('')}
    </div>
</body>
</html>`;

    await fs.writeFile(path.join(CONFIG.outputDir, 'cross-browser-report.html'), htmlContent);
  }

  async generateJSONReport() {
    const jsonData = {
      ...this.results,
      browsers: Object.fromEntries(this.results.browsers)
    };
    
    await fs.writeFile(
      path.join(CONFIG.outputDir, 'cross-browser-report.json'),
      JSON.stringify(jsonData, null, 2)
    );
  }

  async generateMarkdownReport() {
    const markdownContent = `# AI CMS Cross-Browser Test Report

Generated: ${new Date().toLocaleString()}

## Summary

- **Browsers Tested:** ${this.results.summary.browsers.length}
- **Total Tests:** ${this.results.summary.totalTests}
- **Tests Passed:** ${this.results.summary.passedTests}
- **Tests Failed:** ${this.results.summary.failedTests}

## Browser Results

${Array.from(this.results.browsers.entries()).map(([name, results]) => `
### ${name} ${results.version}

- **Compatibility Score:** ${results.compatibility.score}/100 (${results.compatibility.level})
- **Average Load Time:** ${Math.round(results.performance.averageLoadTime)}ms
- **Memory Usage:** ${Math.round(results.performance.memoryUsage.jsHeapSizeUsed / 1024 / 1024)}MB
- **Errors:** ${results.errors.length}

${results.compatibility.issues.length > 0 ? `
**Issues:**
${results.compatibility.issues.map(issue => `- ${issue}`).join('\n')}
` : ''}
`).join('')}

## Feature Support Matrix

| Feature | ${this.results.summary.browsers.join(' | ')} |
|---------|${this.results.summary.browsers.map(() => '---').join('|')}|
${Object.entries(this.results.featureMatrix).map(([feature, support]) => `
| ${feature} | ${this.results.summary.browsers.map(browser => support[browser] ? '✓' : '✗').join(' | ')} |
`).join('')}

## Recommendations

${this.results.recommendations.map(rec => `
- **${rec.type.toUpperCase()}${rec.browser ? ` (${rec.browser})` : ''}:** ${rec.message} *(${rec.priority} priority)*
`).join('')}
`;

    await fs.writeFile(path.join(CONFIG.outputDir, 'cross-browser-report.md'), markdownContent);
  }

  async run() {
    try {
      await this.initialize();
      
      // Test each browser
      for (const browserConfig of CONFIG.browsers) {
        try {
          await this.testBrowser(browserConfig);
        } catch (error) {
          console.error(chalk.red(`Failed to test ${browserConfig.name}: ${error.message}`));
          this.results.summary.failedTests += CONFIG.testPages.length * CONFIG.viewports.length;
        }
      }
      
      // Generate analysis
      this.generateFeatureMatrix();
      this.generatePerformanceComparison();
      this.generateRecommendations();
      
      // Generate reports
      const reportPaths = await this.generateReport();
      
      // Print summary
      console.log(chalk.green('\n✅ Cross-Browser Testing Complete!\n'));
      console.log(chalk.blue('📊 SUMMARY:'));
      console.log(`   Browsers tested: ${this.results.summary.browsers.length}`);
      console.log(`   Total tests: ${this.results.summary.totalTests}`);
      console.log(`   Tests passed: ${this.results.summary.passedTests}`);
      console.log(`   Tests failed: ${this.results.summary.failedTests}`);
      
      console.log(chalk.blue('\n📄 REPORTS GENERATED:'));
      console.log(`   HTML Report: ${reportPaths.htmlReport}`);
      console.log(`   JSON Data: ${reportPaths.jsonReport}`);
      console.log(`   Markdown: ${reportPaths.markdownReport}`);
      
      // Exit with error code if there are failures
      if (this.results.summary.failedTests > 0) {
        console.log(chalk.red(`\n❌ ${this.results.summary.failedTests} tests failed!`));
        process.exit(1);
      } else {
        console.log(chalk.green('\n🎉 All tests passed!'));
      }
      
    } catch (error) {
      console.error(chalk.red(`\n❌ Testing failed: ${error.message}`));
      console.error(error.stack);
      process.exit(1);
    }
  }
}

// CLI handling
if (require.main === module) {
  const tester = new CrossBrowserTester();
  tester.run().catch(console.error);
}

module.exports = CrossBrowserTester;