import React from 'react';
import logger from './logger';

// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private measurements: Map<string, number> = new Map();

  private constructor() {}

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Start measuring an operation
   */
  startMeasurement(operation: string): void {
    this.measurements.set(operation, performance.now());
    logger.debug('PerformanceMonitor', `Started measuring: ${operation}`);
  }

  /**
   * End measurement and log the duration
   */
  endMeasurement(operation: string, context?: Record<string, any>): number {
    const startTime = this.measurements.get(operation);
    if (!startTime) {
      logger.warn('PerformanceMonitor', `No start time found for operation: ${operation}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.measurements.delete(operation);

    logger.debug('PerformanceMonitor', `Operation completed: ${operation}`, {
      duration: `${duration.toFixed(2)}ms`,
      ...context
    });

    // Warn for slow operations
    if (duration > 1000) {
      logger.warn('PerformanceMonitor', `Slow operation detected: ${operation}`, {
        duration: `${duration.toFixed(2)}ms`,
        threshold: '1000ms',
        ...context
      });
    }

    return duration;
  }

  /**
   * Measure the duration of an async function
   */
  async measureAsync<T>(
    operation: string,
    fn: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<{ result: T; duration: number }> {
    this.startMeasurement(operation);
    try {
      const result = await fn();
      const duration = this.endMeasurement(operation, context);
      return { result, duration };
    } catch (error) {
      this.endMeasurement(operation, { ...context, error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  /**
   * Measure the duration of a synchronous function
   */
  measureSync<T>(
    operation: string,
    fn: () => T,
    context?: Record<string, any>
  ): { result: T; duration: number } {
    this.startMeasurement(operation);
    try {
      const result = fn();
      const duration = this.endMeasurement(operation, context);
      return { result, duration };
    } catch (error) {
      this.endMeasurement(operation, { ...context, error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  /**
   * Get memory usage information
   */
  getMemoryUsage(): Record<string, any> {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        usedMB: Math.round(memory.usedJSHeapSize / 1024 / 1024),
        totalMB: Math.round(memory.totalJSHeapSize / 1024 / 1024),
        limitMB: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
      };
    }
    return { message: 'Memory API not available' };
  }

  /**
   * Log performance metrics
   */
  logPerformanceMetrics(): void {
    const memory = this.getMemoryUsage();
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    logger.info('PerformanceMonitor', 'Current performance metrics', {
      memory,
      navigation: navigation ? {
        domContentLoaded: `${navigation.domContentLoadedEventEnd - navigation.fetchStart}ms`,
        loadComplete: `${navigation.loadEventEnd - navigation.fetchStart}ms`,
        firstPaint: this.getFirstPaint(),
        firstContentfulPaint: this.getFirstContentfulPaint()
      } : 'Navigation timing not available'
    });
  }

  private getFirstPaint(): string | null {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? `${firstPaint.startTime.toFixed(2)}ms` : null;
  }

  private getFirstContentfulPaint(): string | null {
    const paintEntries = performance.getEntriesByType('paint');
    const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return firstContentfulPaint ? `${firstContentfulPaint.startTime.toFixed(2)}ms` : null;
  }
}

// Singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// React hook for performance monitoring
export const usePerformanceMonitor = () => {
  return React.useMemo(() => performanceMonitor, []);
};

// HOC for measuring component render performance
export const withPerformanceMonitoring = <P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
): React.ComponentType<P> => {
  const WrappedComponent: React.FC<P> = (props: P) => {
    const monitor = usePerformanceMonitor();
    const name = componentName || Component.displayName || Component.name;

    React.useEffect(() => {
      monitor.startMeasurement(`${name}_mount`);
      return () => {
        monitor.endMeasurement(`${name}_mount`, { component: name });
      };
    }, [monitor, name]);

    React.useEffect(() => {
      monitor.endMeasurement(`${name}_render`, { component: name, props });
    });

    monitor.startMeasurement(`${name}_render`);

    return React.createElement(Component, props);
  };

  WrappedComponent.displayName = `withPerformanceMonitoring(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Debounce utility for performance optimization
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): T => {
  let timeout: NodeJS.Timeout | null = null;

  const debounced = (...args: Parameters<T>) => {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };

    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };

  return debounced as T;
};

// Throttle utility for performance optimization
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T => {
  let inThrottle: boolean = false;

  const throttled = (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };

  return throttled as T;
};

// Memoization utility with expiration
export const memoizeWithExpiration = <T extends (...args: any[]) => any>(
  fn: T,
  expirationTime: number = 5 * 60 * 1000 // 5 minutes default
): T => {
  const cache = new Map<string, { value: ReturnType<T>; timestamp: number }>();

  const memoized = (...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    const now = Date.now();
    const cached = cache.get(key);

    if (cached && (now - cached.timestamp) < expirationTime) {
      return cached.value;
    }

    const result = fn(...args);
    cache.set(key, { value: result, timestamp: now });

    // Clean up expired entries
    for (const [cacheKey, cacheValue] of cache.entries()) {
      if ((now - cacheValue.timestamp) >= expirationTime) {
        cache.delete(cacheKey);
      }
    }

    return result;
  };

  return memoized as T;
};

// Lazy component loader with retry logic
export const createLazyComponent = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  maxRetries: number = 3,
  retryDelay: number = 1000
) => {
  let retryCount = 0;

  const loadComponent = async (): Promise<{ default: T }> => {
    try {
      return await importFn();
    } catch (error) {
      if (retryCount < maxRetries) {
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, retryDelay * retryCount));
        return loadComponent();
      }
      throw error;
    }
  };

  return React.lazy(loadComponent);
};

// Resource preloader for better performance
export const preloadResources = {
  /**
   * Preload a script
   */
  script: (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'script';
      link.href = src;
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to preload script: ${src}`));
      document.head.appendChild(link);
    });
  },

  /**
   * Preload a stylesheet
   */
  stylesheet: (href: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = href;
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to preload stylesheet: ${href}`));
      document.head.appendChild(link);
    });
  },

  /**
   * Preload an image
   */
  image: (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
      img.src = src;
    });
  }
};