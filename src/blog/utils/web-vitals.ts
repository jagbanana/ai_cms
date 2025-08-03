import React from 'react';
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

// gtag type already declared in analytics.ts

// Web Vitals thresholds based on Google's recommendations
const THRESHOLDS = {
  CLS: { good: 0.1, needsImprovement: 0.25 },
  FID: { good: 100, needsImprovement: 300 },
  FCP: { good: 1800, needsImprovement: 3000 },
  LCP: { good: 2500, needsImprovement: 4000 },
  TTFB: { good: 800, needsImprovement: 1800 }
};

// Web Vitals tracking interface
interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

// Performance budget interface
export interface PerformanceBudget {
  FCP: number;
  LCP: number;
  CLS: number;
  FID: number;
  TTFB: number;
}

// Default performance budget for blog pages
const DEFAULT_PERFORMANCE_BUDGET: PerformanceBudget = {
  FCP: 1800,  // First Contentful Paint < 1.8s
  LCP: 2500,  // Largest Contentful Paint < 2.5s
  CLS: 0.1,   // Cumulative Layout Shift < 0.1
  FID: 100,   // First Input Delay < 100ms
  TTFB: 800   // Time to First Byte < 800ms
};

// Web Vitals collector class
class WebVitalsCollector {
  private metrics: Map<string, WebVitalsMetric> = new Map();
  private budget: PerformanceBudget;
  private listeners: Array<(metric: WebVitalsMetric) => void> = [];

  constructor(budget: PerformanceBudget = DEFAULT_PERFORMANCE_BUDGET) {
    this.budget = budget;
    this.initializeCollection();
  }

  private initializeCollection() {
    // Collect Core Web Vitals
    onCLS(this.handleMetric.bind(this));
    onFID(this.handleMetric.bind(this));
    onFCP(this.handleMetric.bind(this));
    onLCP(this.handleMetric.bind(this));
    onTTFB(this.handleMetric.bind(this));
  }

  private handleMetric(metric: any) {
    const webVitalsMetric: WebVitalsMetric = {
      name: metric.name,
      value: metric.value,
      rating: this.getRating(metric.name, metric.value),
      delta: metric.delta,
      id: metric.id
    };

    this.metrics.set(metric.name, webVitalsMetric);
    
    // Notify listeners
    this.listeners.forEach(listener => listener(webVitalsMetric));
    
    // Send to analytics if available
    this.sendToAnalytics(webVitalsMetric);
    
    // Check budget compliance
    this.checkBudgetCompliance(webVitalsMetric);
  }

  private getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
    if (!threshold) return 'good';
    
    if (value <= threshold.good) return 'good';
    if (value <= threshold.needsImprovement) return 'needs-improvement';
    return 'poor';
  }

  private sendToAnalytics(metric: WebVitalsMetric) {
    // Send to Google Analytics 4
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        custom_map: {
          metric_rating: metric.rating,
          page_path: window.location.pathname
        }
      });
    }

    // Send to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Web Vitals - ${metric.name}:`, {
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id
      });
    }
  }

  private checkBudgetCompliance(metric: WebVitalsMetric) {
    const budgetValue = this.budget[metric.name as keyof PerformanceBudget];
    if (budgetValue && metric.value > budgetValue) {
      console.warn(`Performance Budget Exceeded: ${metric.name}`, {
        actual: metric.value,
        budget: budgetValue,
        exceedsBy: metric.value - budgetValue,
        rating: metric.rating
      });

      // Track budget violations
      if (typeof window.gtag !== 'undefined') {
        window.gtag('event', 'performance_budget_violation', {
          event_category: 'Performance',
          event_label: metric.name,
          value: Math.round(metric.value - budgetValue),
          custom_map: {
            metric_name: metric.name,
            actual_value: metric.value,
            budget_value: budgetValue
          }
        });
      }
    }
  }

  // Public methods
  public addListener(listener: (metric: WebVitalsMetric) => void) {
    this.listeners.push(listener);
  }

  public removeListener(listener: (metric: WebVitalsMetric) => void) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  public getMetrics(): WebVitalsMetric[] {
    return Array.from(this.metrics.values());
  }

  public getMetric(name: string): WebVitalsMetric | undefined {
    return this.metrics.get(name);
  }

  public getBudgetCompliance(): { [key: string]: boolean } {
    const compliance: { [key: string]: boolean } = {};
    
    for (const [name, metric] of this.metrics) {
      const budgetValue = this.budget[name as keyof PerformanceBudget];
      compliance[name] = budgetValue ? metric.value <= budgetValue : true;
    }
    
    return compliance;
  }

  public getPerformanceScore(): number {
    const metrics = this.getMetrics();
    if (metrics.length === 0) return 0;

    const scores = metrics.map(metric => {
      switch (metric.rating) {
        case 'good': return 100;
        case 'needs-improvement': return 50;
        case 'poor': return 0;
        default: return 0;
      }
    });

    return Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length);
  }
}

// Performance monitoring hook
export function useWebVitals(budget?: PerformanceBudget) {
  const [collector] = React.useState(() => new WebVitalsCollector(budget));
  const [metrics, setMetrics] = React.useState<WebVitalsMetric[]>([]);
  const [performanceScore, setPerformanceScore] = React.useState(0);

  React.useEffect(() => {
    const listener = () => {
      setMetrics(collector.getMetrics());
      setPerformanceScore(collector.getPerformanceScore());
    };

    collector.addListener(listener);
    
    return () => {
      collector.removeListener(listener);
    };
  }, [collector]);

  return {
    metrics,
    performanceScore,
    budgetCompliance: collector.getBudgetCompliance(),
    collector
  };
}

// Global Web Vitals collector instance
let globalWebVitalsCollector: WebVitalsCollector | null = null;

// Initialize Web Vitals tracking
export function initializeWebVitals(budget?: PerformanceBudget) {
  if (typeof window !== 'undefined' && !globalWebVitalsCollector) {
    globalWebVitalsCollector = new WebVitalsCollector(budget);
  }
  return globalWebVitalsCollector;
}

// Get the global collector
export function getWebVitalsCollector(): WebVitalsCollector | null {
  return globalWebVitalsCollector;
}

// Performance budget configuration
export const BLOG_PERFORMANCE_BUDGET: PerformanceBudget = {
  FCP: 1800,  // First Contentful Paint < 1.8s
  LCP: 2500,  // Largest Contentful Paint < 2.5s
  CLS: 0.1,   // Cumulative Layout Shift < 0.1
  FID: 100,   // First Input Delay < 100ms
  TTFB: 800   // Time to First Byte < 800ms
};

export default WebVitalsCollector;