/**
 * Error Tracking Service for ChessTrainer.org
 * 
 * Provides integration with error tracking services like Sentry,
 * custom error analytics, and performance monitoring.
 */

import React from 'react';
import { ErrorDetails } from './errorHandler';
import logger from '../utils/logger';

export interface ErrorTrackingConfig {
  dsn?: string;
  environment: string;
  release?: string;
  userId?: string;
  enabled: boolean;
  sampleRate: number;
  maxBreadcrumbs: number;
  beforeSend?: (event: any) => any | null;
  filters?: {
    excludeErrorTypes?: string[];
    excludeUrls?: RegExp[];
    includeUserAgent?: boolean;
  };
}

export interface ErrorEvent {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  fingerprint: string[];
  tags: Record<string, string>;
  contexts: Record<string, any>;
  breadcrumbs: Breadcrumb[];
  user?: {
    id?: string;
    email?: string;
    username?: string;
    ip_address?: string;
  };
  extra: Record<string, any>;
}

export interface Breadcrumb {
  timestamp: string;
  message: string;
  category: string;
  level: 'error' | 'warning' | 'info' | 'debug';
  data?: Record<string, any>;
}

export interface PerformanceEntry {
  name: string;
  entryType: string;
  startTime: number;
  duration: number;
  transferSize?: number;
  encodedBodySize?: number;
  decodedBodySize?: number;
}

class ErrorTrackingService {
  private logger = logger;
  private config: ErrorTrackingConfig;
  private breadcrumbs: Breadcrumb[] = [];
  private sessionId: string;
  private isInitialized = false;
  private sentryInstance: any = null;
  private errorCounts = new Map<string, number>();

  constructor(config: Partial<ErrorTrackingConfig> = {}) {
    this.config = {
      environment: process.env.NODE_ENV || 'development',
      enabled: true,
      sampleRate: 1.0,
      maxBreadcrumbs: 100,
      filters: {
        includeUserAgent: true
      },
      ...config
    };

    this.sessionId = this.generateSessionId();
    this.initializeTracking();
  }

  /**
   * Initialize error tracking service
   */
  private async initializeTracking(): Promise<void> {
    if (!this.config.enabled) {
      this.logger.info('Error tracking disabled', 'Tracking service not initialized');
      return;
    }

    try {
      // Initialize Sentry if DSN is provided
      if (this.config.dsn) {
        await this.initializeSentry();
      }

      // Set up performance monitoring
      this.setupPerformanceMonitoring();

      // Set up global error handlers
      this.setupGlobalErrorHandlers();

      this.isInitialized = true;
      this.logger.info('Error tracking initialized', 'Service ready for error reporting');
    } catch (error) {
      this.logger.error('Failed to initialize error tracking', (error as Error).message);
    }
  }

  /**
   * Initialize Sentry error tracking
   */
  private async initializeSentry(): Promise<void> {
    try {
      // Skip Sentry initialization if not available in development
      if (process.env.NODE_ENV === 'development') {
        this.logger.info('ErrorTracking', 'Skipping Sentry initialization in development mode');
        return;
      }
      
      // Dynamic import to avoid bundling Sentry if not needed
      // const Sentry = await import('@sentry/browser');
      // const { Integrations } = await import('@sentry/tracing');
      
      throw new Error('Sentry packages not installed');

      /*
      Sentry.init({
        dsn: this.config.dsn,
        environment: this.config.environment,
        release: this.config.release,
        sampleRate: this.config.sampleRate,
        maxBreadcrumbs: this.config.maxBreadcrumbs,
        beforeSend: this.config.beforeSend || this.defaultBeforeSend.bind(this),
        integrations: [
          new Integrations.BrowserTracing({
            tracingOrigins: [window.location.hostname, /^\//],
          }),
        ],
        tracesSampleRate: 0.1,
      });

      this.sentryInstance = Sentry;
      this.logger.info('Sentry initialized', 'External error tracking enabled');
      */
    } catch (error) {
      this.logger.warn('ErrorTracking', 'Using fallback error tracking', {
        error: (error as Error).message
      });
    }
  }

  /**
   * Set up performance monitoring
   */
  private setupPerformanceMonitoring(): void {
    if ('PerformanceObserver' in window) {
      try {
        // Monitor Long Tasks
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) { // Tasks longer than 50ms
              this.addBreadcrumb({
                message: `Long task detected: ${entry.duration.toFixed(2)}ms`,
                category: 'performance',
                level: 'warning',
                data: {
                  duration: entry.duration,
                  startTime: entry.startTime,
                  name: entry.name
                }
              });
            }
          }
        });

        longTaskObserver.observe({ entryTypes: ['longtask'] });

        // Monitor Navigation Timing
        const navigationObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.trackPerformanceMetric('navigation', entry as any);
          }
        });

        navigationObserver.observe({ entryTypes: ['navigation'] });

        // Monitor Resource Loading
        const resourceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const resourceEntry = entry as any;
            if (resourceEntry.duration > 1000) { // Resources taking > 1s
              this.addBreadcrumb({
                message: `Slow resource load: ${resourceEntry.name}`,
                category: 'performance',
                level: 'warning',
                data: {
                  duration: resourceEntry.duration,
                  transferSize: resourceEntry.transferSize,
                  name: resourceEntry.name
                }
              });
            }
          }
        });

        resourceObserver.observe({ entryTypes: ['resource'] });

        this.logger.debug('Performance monitoring enabled', 'Observers registered');
      } catch (error) {
        this.logger.warn('Performance monitoring setup failed', (error as Error).message);
      }
    }
  }

  /**
   * Set up global error handlers
   */
  private setupGlobalErrorHandlers(): void {
    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason;
      this.captureError(error, {
        type: 'unhandled_promise_rejection',
        promise: event.promise
      });
    });

    // Capture JavaScript errors
    window.addEventListener('error', (event) => {
      this.captureError(event.error || new Error(event.message), {
        type: 'javascript_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });
  }

  /**
   * Capture and track an error
   */
  public captureError(error: Error | ErrorDetails, context?: Record<string, any>): string {
    if (!this.config.enabled) {
      return '';
    }

    const errorEvent = this.createErrorEvent(error, context);

    // Check if this error should be filtered out
    if (this.shouldFilterError(errorEvent)) {
      return errorEvent.id;
    }

    // Rate limiting based on error fingerprint
    const fingerprint = errorEvent.fingerprint.join(':');
    const currentCount = this.errorCounts.get(fingerprint) || 0;
    
    if (currentCount >= 10) { // Max 10 of the same error per session
      this.logger.debug('ErrorTracking', 'Too many similar errors', {
        fingerprint,
        count: currentCount
      });
      return errorEvent.id;
    }

    this.errorCounts.set(fingerprint, currentCount + 1);

    // Send to external tracking service
    if (this.sentryInstance) {
      this.sendToSentry(errorEvent);
    }

    // Store locally for analytics
    this.storeErrorLocally(errorEvent);

    // Add breadcrumb for this error
    this.addBreadcrumb({
      message: `Error captured: ${errorEvent.message}`,
      category: 'error',
      level: 'error',
      data: {
        errorId: errorEvent.id,
        type: errorEvent.tags.type
      }
    });

    this.logger.debug('ErrorTracking', 'Error sent to tracking service', {
      errorId: errorEvent.id,
      type: errorEvent.tags.type
    });

    return errorEvent.id;
  }

  /**
   * Add a breadcrumb for context tracking
   */
  public addBreadcrumb(breadcrumb: Omit<Breadcrumb, 'timestamp'>): void {
    const fullBreadcrumb: Breadcrumb = {
      ...breadcrumb,
      timestamp: new Date().toISOString()
    };

    this.breadcrumbs.push(fullBreadcrumb);

    // Keep only the most recent breadcrumbs
    if (this.breadcrumbs.length > this.config.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.config.maxBreadcrumbs);
    }

    // Send to Sentry if available
    if (this.sentryInstance) {
      this.sentryInstance.addBreadcrumb(fullBreadcrumb);
    }
  }

  /**
   * Set user context
   */
  public setUser(user: {
    id?: string;
    email?: string;
    username?: string;
  }): void {
    if (this.sentryInstance) {
      this.sentryInstance.setUser(user);
    }

    this.addBreadcrumb({
      message: 'User context updated',
      category: 'user',
      level: 'info',
      data: { userId: user.id, username: user.username }
    });
  }

  /**
   * Set custom tags
   */
  public setTag(key: string, value: string): void {
    if (this.sentryInstance) {
      this.sentryInstance.setTag(key, value);
    }
  }

  /**
   * Set custom context
   */
  public setContext(key: string, context: Record<string, any>): void {
    if (this.sentryInstance) {
      this.sentryInstance.setContext(key, context);
    }
  }

  /**
   * Track performance metric
   */
  public trackPerformanceMetric(name: string, entry: PerformanceEntry): void {
    const metric = {
      name,
      duration: entry.duration,
      startTime: entry.startTime,
      transferSize: entry.transferSize,
      timestamp: new Date().toISOString()
    };

    // Store performance data locally
    this.storePerformanceMetric(metric);

    // Add breadcrumb for significant performance events
    if (entry.duration > 1000) {
      this.addBreadcrumb({
        message: `Performance: ${name} took ${entry.duration.toFixed(2)}ms`,
        category: 'performance',
        level: entry.duration > 3000 ? 'warning' : 'info',
        data: metric
      });
    }
  }

  /**
   * Get error statistics
   */
  public getErrorStatistics(): {
    totalErrors: number;
    errorsByType: Record<string, number>;
    sessionId: string;
    breadcrumbCount: number;
  } {
    const errorsByType: Record<string, number> = {};
    let totalErrors = 0;

    this.errorCounts.forEach((count, fingerprint) => {
      const type = fingerprint.split(':')[0] || 'unknown';
      errorsByType[type] = (errorsByType[type] || 0) + count;
      totalErrors += count;
    });

    return {
      totalErrors,
      errorsByType,
      sessionId: this.sessionId,
      breadcrumbCount: this.breadcrumbs.length
    };
  }

  /**
   * Export error data for analysis
   */
  public exportErrorData(): {
    errors: any[];
    performance: any[];
    breadcrumbs: Breadcrumb[];
    statistics: any;
  } {
    return {
      errors: this.getStoredErrors(),
      performance: this.getStoredPerformanceMetrics(),
      breadcrumbs: this.breadcrumbs,
      statistics: this.getErrorStatistics()
    };
  }

  /**
   * Clear all tracking data
   */
  public clearTrackingData(): void {
    this.breadcrumbs = [];
    this.errorCounts.clear();
    localStorage.removeItem('chess-trainer-errors');
    localStorage.removeItem('chess-trainer-performance');
    
    this.logger.info('Tracking data cleared', 'All local tracking data removed');
  }

  // Private helper methods

  private createErrorEvent(error: Error | ErrorDetails, context?: Record<string, any>): ErrorEvent {
    const isErrorDetails = 'id' in error && 'type' in error;
    const errorDetails = isErrorDetails ? error as ErrorDetails : null;
    const errorObj = isErrorDetails ? new Error(errorDetails!.message) : error as Error;

    const fingerprint = this.generateFingerprint(errorObj, errorDetails);

    return {
      id: errorDetails?.id || this.generateErrorId(),
      timestamp: new Date().toISOString(),
      level: errorDetails?.category === 'critical' ? 'error' : 'warning',
      message: errorObj.message,
      fingerprint,
      tags: {
        type: errorDetails?.type || 'unknown',
        category: errorDetails?.category || 'medium',
        component: errorDetails?.affectedComponent || 'unknown',
        sessionId: this.sessionId
      },
      contexts: {
        error: {
          stack: errorObj.stack,
          name: errorObj.name,
          retryCount: errorDetails?.retryCount || 0
        },
        browser: {
          userAgent: navigator.userAgent,
          url: window.location.href,
          referrer: document.referrer
        },
        custom: context || {}
      },
      breadcrumbs: [...this.breadcrumbs],
      extra: {
        errorDetails: errorDetails ? { ...errorDetails } : null,
        context
      }
    };
  }

  private generateFingerprint(error: Error, errorDetails?: ErrorDetails): string[] {
    const type = errorDetails?.type || 'javascript_error';
    const message = error.message.replace(/\d+/g, 'N'); // Normalize numbers
    const component = errorDetails?.affectedComponent || 'unknown';
    
    return [type, component, message];
  }

  private shouldFilterError(errorEvent: ErrorEvent): boolean {
    const filters = this.config.filters;
    if (!filters) return false;

    // Filter by error type
    if (filters.excludeErrorTypes?.includes(errorEvent.tags.type)) {
      return true;
    }

    // Filter by URL
    if (filters.excludeUrls?.some(pattern => pattern.test(window.location.href))) {
      return true;
    }

    return false;
  }

  private defaultBeforeSend(event: any): any | null {
    // Filter out development errors in production
    if (this.config.environment === 'production' && event.tags?.source === 'development') {
      return null;
    }

    // Add session context
    event.tags = event.tags || {};
    event.tags.sessionId = this.sessionId;

    return event;
  }

  private sendToSentry(errorEvent: ErrorEvent): void {
    if (!this.sentryInstance) return;

    this.sentryInstance.withScope((scope: any) => {
      // Set tags
      Object.entries(errorEvent.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });

      // Set contexts
      Object.entries(errorEvent.contexts).forEach(([key, value]) => {
        scope.setContext(key, value);
      });

      // Set extra data
      Object.entries(errorEvent.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });

      // Set level
      scope.setLevel(errorEvent.level);

      // Capture the error
      this.sentryInstance.captureException(new Error(errorEvent.message));
    });
  }

  private storeErrorLocally(errorEvent: ErrorEvent): void {
    try {
      const stored = this.getStoredErrors();
      stored.push(errorEvent);

      // Keep only the most recent 50 errors
      const recentErrors = stored.slice(-50);

      localStorage.setItem('chess-trainer-errors', JSON.stringify(recentErrors));
    } catch (error) {
      this.logger.warn('Failed to store error locally', (error as Error).message);
    }
  }

  private storePerformanceMetric(metric: any): void {
    try {
      const stored = this.getStoredPerformanceMetrics();
      stored.push(metric);

      // Keep only the most recent 100 metrics
      const recentMetrics = stored.slice(-100);

      localStorage.setItem('chess-trainer-performance', JSON.stringify(recentMetrics));
    } catch (error) {
      this.logger.warn('Failed to store performance metric', (error as Error).message);
    }
  }

  private getStoredErrors(): any[] {
    try {
      const stored = localStorage.getItem('chess-trainer-errors');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private getStoredPerformanceMetrics(): any[] {
    try {
      const stored = localStorage.getItem('chess-trainer-performance');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  private generateErrorId(): string {
    return 'err_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }
}

// Default configuration
const defaultConfig: Partial<ErrorTrackingConfig> = {
  environment: process.env.NODE_ENV || 'development',
  enabled: process.env.NODE_ENV === 'production',
  sampleRate: 1.0,
  maxBreadcrumbs: 100
};

// Global instance
export const errorTracking = new ErrorTrackingService(defaultConfig);

// React hook for error tracking
export const useErrorTracking = () => {
  const [statistics, setStatistics] = React.useState(errorTracking.getErrorStatistics());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setStatistics(errorTracking.getErrorStatistics());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    captureError: errorTracking.captureError.bind(errorTracking),
    addBreadcrumb: errorTracking.addBreadcrumb.bind(errorTracking),
    setUser: errorTracking.setUser.bind(errorTracking),
    setTag: errorTracking.setTag.bind(errorTracking),
    setContext: errorTracking.setContext.bind(errorTracking),
    statistics,
    exportData: errorTracking.exportErrorData.bind(errorTracking),
    clearData: errorTracking.clearTrackingData.bind(errorTracking)
  };
};

export default errorTracking;