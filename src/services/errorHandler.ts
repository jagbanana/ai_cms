/**
 * Global Error Handling Service for ChessTrainer.org
 * 
 * Provides comprehensive error handling with categorization, retry logic,
 * user notifications, and error tracking for the puzzle system.
 */

import logger from '../utils/logger';

export interface ErrorDetails {
  id: string;
  type: ErrorType;
  category: ErrorCategory;
  message: string;
  userMessage: string;
  context?: Record<string, any>;
  timestamp: string;
  retryCount: number;
  maxRetries: number;
  isRecoverable: boolean;
  stackTrace?: string;
  affectedComponent?: string;
  userAgent?: string;
  url?: string;
}

export type ErrorType = 
  | 'network'
  | 'data_validation'
  | 'user_input'
  | 'system'
  | 'permission'
  | 'timeout'
  | 'offline'
  | 'puzzle_load'
  | 'lesson_generation'
  | 'component_render';

export type ErrorCategory = 'critical' | 'high' | 'medium' | 'low';

export type ErrorAction = 'retry' | 'fallback' | 'redirect' | 'ignore' | 'manual';

export interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  backoffMultiplier: number;
  maxDelay: number;
  retryCondition?: (error: ErrorDetails) => boolean;
}

export interface NotificationConfig {
  type: 'toast' | 'modal' | 'banner' | 'none';
  duration?: number;
  persistent?: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
    style?: 'primary' | 'secondary' | 'danger';
  }>;
}

export interface ErrorRecoveryAction {
  id: string;
  label: string;
  description: string;
  action: () => Promise<void> | void;
  icon?: string;
  style?: 'primary' | 'secondary' | 'danger';
}

class GlobalErrorHandler {
  private logger = logger;
  private errorQueue: ErrorDetails[] = [];
  private retryTimers = new Map<string, NodeJS.Timeout>();
  private notificationHandlers = new Map<string, (notification: any) => void>();
  private onlineStatus = navigator.onLine;
  private errorTracker?: (error: ErrorDetails) => Promise<void>;

  constructor() {
    this.setupGlobalHandlers();
    this.setupOnlineStatusMonitoring();
  }

  /**
   * Main error handling entry point
   */
  public async handleError(
    error: Error | ErrorDetails,
    context?: Record<string, any>,
    component?: string
  ): Promise<ErrorDetails> {
    const errorDetails = this.normalizeError(error, context, component);
    
    this.logger.error('ErrorHandler', errorDetails.message, {
      errorId: errorDetails.id,
      type: errorDetails.type,
      category: errorDetails.category,
      context: errorDetails.context
    });

    // Store error for tracking
    this.errorQueue.push(errorDetails);

    // Send to external tracking if configured
    if (this.errorTracker) {
      try {
        await this.errorTracker(errorDetails);
      } catch (trackingError) {
        console.error('Error tracking failed:', trackingError);
      }
    }

    // Determine recovery strategy
    const recoveryActions = this.getRecoveryActions(errorDetails);
    
    // Show user notification
    this.showUserNotification(errorDetails, recoveryActions);

    // Attempt automatic recovery if possible
    if (errorDetails.isRecoverable && errorDetails.retryCount < errorDetails.maxRetries) {
      await this.attemptRecovery(errorDetails);
    }

    return errorDetails;
  }

  /**
   * Retry mechanism with exponential backoff
   */
  public async retryWithBackoff<T>(
    operation: () => Promise<T>,
    config: Partial<RetryConfig> = {},
    context?: Record<string, any>
  ): Promise<T> {
    const retryConfig: RetryConfig = {
      maxRetries: 3,
      initialDelay: 1000,
      backoffMultiplier: 2,
      maxDelay: 30000,
      ...config
    };

    let lastError: Error;
    let attempt = 0;

    while (attempt <= retryConfig.maxRetries) {
      try {
        const result = await operation();
        
        // Log successful retry
        if (attempt > 0) {
          this.logger.info('ErrorHandler', 'Retry successful', {
            attempt,
            context
          });
        }
        
        return result;
      } catch (error) {
        lastError = error as Error;
        attempt++;

        // Check if we should retry this error
        if (retryConfig.retryCondition && !retryConfig.retryCondition(
          this.normalizeError(lastError, context)
        )) {
          break;
        }

        // If we've exhausted retries, break
        if (attempt > retryConfig.maxRetries) {
          break;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          retryConfig.initialDelay * Math.pow(retryConfig.backoffMultiplier, attempt - 1),
          retryConfig.maxDelay
        );

        this.logger.warn('ErrorHandler', `Attempt ${attempt}/${retryConfig.maxRetries}`, {
          error: lastError.message,
          nextRetryIn: delay,
          context
        });

        // Wait before retrying
        await this.delay(delay);
      }
    }

    // All retries exhausted, handle the final error
    const errorDetails = await this.handleError(lastError!, context);
    throw new Error(`Operation failed after ${retryConfig.maxRetries} retries: ${errorDetails.userMessage}`);
  }

  /**
   * Create debounced error handler for rapid-fire errors
   */
  public createDebouncedErrorHandler(
    handler: (error: ErrorDetails) => void,
    delay: number = 1000
  ): (error: Error | ErrorDetails, context?: Record<string, any>) => void {
    const debouncedHandlers = new Map<string, NodeJS.Timeout>();

    return (error: Error | ErrorDetails, context?: Record<string, any>) => {
      const errorDetails = this.normalizeError(error, context);
      const key = `${errorDetails.type}-${errorDetails.message}`;

      // Clear existing timer
      if (debouncedHandlers.has(key)) {
        clearTimeout(debouncedHandlers.get(key)!);
      }

      // Set new timer
      const timer = setTimeout(() => {
        handler(errorDetails);
        debouncedHandlers.delete(key);
      }, delay);

      debouncedHandlers.set(key, timer);
    };
  }

  /**
   * Register error tracking service (e.g., Sentry)
   */
  public registerErrorTracker(tracker: (error: ErrorDetails) => Promise<void>): void {
    this.errorTracker = tracker;
  }

  /**
   * Register notification handler
   */
  public registerNotificationHandler(
    type: string,
    handler: (notification: any) => void
  ): void {
    this.notificationHandlers.set(type, handler);
  }

  /**
   * Get error statistics and insights
   */
  public getErrorStatistics(): {
    totalErrors: number;
    errorsByType: Record<ErrorType, number>;
    errorsByCategory: Record<ErrorCategory, number>;
    recentErrors: ErrorDetails[];
    recoverySuccessRate: number;
  } {
    const totalErrors = this.errorQueue.length;
    const errorsByType = {} as Record<ErrorType, number>;
    const errorsByCategory = {} as Record<ErrorCategory, number>;
    let successfulRecoveries = 0;

    this.errorQueue.forEach(error => {
      errorsByType[error.type] = (errorsByType[error.type] || 0) + 1;
      errorsByCategory[error.category] = (errorsByCategory[error.category] || 0) + 1;
      
      if (error.retryCount > 0 && error.retryCount < error.maxRetries) {
        successfulRecoveries++;
      }
    });

    return {
      totalErrors,
      errorsByType,
      errorsByCategory,
      recentErrors: this.errorQueue.slice(-10),
      recoverySuccessRate: totalErrors > 0 ? successfulRecoveries / totalErrors : 0
    };
  }

  /**
   * Clear error history (for testing or privacy)
   */
  public clearErrorHistory(): void {
    this.errorQueue = [];
    this.retryTimers.forEach(timer => clearTimeout(timer));
    this.retryTimers.clear();
  }

  /**
   * Check if system is in degraded state
   */
  public isSystemDegraded(): boolean {
    const recentErrors = this.errorQueue.filter(
      error => Date.now() - new Date(error.timestamp).getTime() < 5 * 60 * 1000 // 5 minutes
    );

    const criticalErrors = recentErrors.filter(error => error.category === 'critical').length;
    const totalRecent = recentErrors.length;

    return criticalErrors > 3 || totalRecent > 10;
  }

  /**
   * Get system health status
   */
  public getSystemHealth(): {
    status: 'healthy' | 'degraded' | 'critical';
    errors: number;
    uptime: string;
    onlineStatus: boolean;
  } {
    const recentErrors = this.errorQueue.filter(
      error => Date.now() - new Date(error.timestamp).getTime() < 5 * 60 * 1000
    );

    let status: 'healthy' | 'degraded' | 'critical' = 'healthy';
    
    if (!this.onlineStatus) {
      status = 'degraded';
    } else if (this.isSystemDegraded()) {
      status = 'critical';
    } else if (recentErrors.length > 5) {
      status = 'degraded';
    }

    return {
      status,
      errors: recentErrors.length,
      uptime: this.formatUptime(),
      onlineStatus: this.onlineStatus
    };
  }

  // Private methods
  private setupGlobalHandlers(): void {
    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(
        new Error(event.reason?.message || 'Unhandled promise rejection'),
        { originalReason: event.reason },
        'global'
      );
    });

    // JavaScript errors
    window.addEventListener('error', (event) => {
      this.handleError(
        new Error(event.message),
        { 
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno 
        },
        'global'
      );
    });

    // Resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.handleError(
          new Error(`Failed to load resource: ${(event.target as any)?.src || 'unknown'}`),
          { resourceType: (event.target as any)?.tagName },
          'resource'
        );
      }
    }, true);
  }

  private setupOnlineStatusMonitoring(): void {
    window.addEventListener('online', () => {
      this.onlineStatus = true;
      this.logger.info('Network connection restored', 'Back online');
      this.processOfflineQueue();
    });

    window.addEventListener('offline', () => {
      this.onlineStatus = false;
      this.logger.warn('Network connection lost', 'Gone offline');
    });
  }

  private normalizeError(
    error: Error | ErrorDetails,
    context?: Record<string, any>,
    component?: string
  ): ErrorDetails {
    if ('id' in error && 'type' in error) {
      return error as ErrorDetails;
    }

    const err = error as Error;
    const errorType = this.categorizeError(err, context);
    const category = this.getErrorCategory(errorType, err);

    return {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: errorType,
      category,
      message: err.message,
      userMessage: this.getUserFriendlyMessage(errorType, err),
      context: { ...context, originalError: err.name },
      timestamp: new Date().toISOString(),
      retryCount: 0,
      maxRetries: this.getMaxRetries(errorType),
      isRecoverable: this.isRecoverableError(errorType, err),
      stackTrace: err.stack,
      affectedComponent: component,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
  }

  private categorizeError(error: Error, context?: Record<string, any>): ErrorType {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();

    // Network-related errors
    if (message.includes('fetch') || message.includes('network') || 
        message.includes('connection') || name.includes('networkerror')) {
      return 'network';
    }

    // Offline errors
    if (!navigator.onLine || message.includes('offline')) {
      return 'offline';
    }

    // Timeout errors
    if (message.includes('timeout') || name.includes('timeout')) {
      return 'timeout';
    }

    // Puzzle-specific errors
    if (message.includes('puzzle') || message.includes('fen') || 
        context?.component?.includes('Puzzle')) {
      return 'puzzle_load';
    }

    // Lesson generation errors
    if (message.includes('lesson') || message.includes('generate') ||
        context?.component?.includes('Lesson')) {
      return 'lesson_generation';
    }

    // React render errors
    if (message.includes('render') || name.includes('render') ||
        context?.component?.includes('Component')) {
      return 'component_render';
    }

    // Data validation errors
    if (message.includes('validation') || message.includes('invalid') ||
        message.includes('format')) {
      return 'data_validation';
    }

    // Permission errors
    if (message.includes('permission') || message.includes('unauthorized') ||
        message.includes('forbidden')) {
      return 'permission';
    }

    // User input errors
    if (context?.userInput || message.includes('input')) {
      return 'user_input';
    }

    return 'system';
  }

  private getErrorCategory(type: ErrorType, error: Error): ErrorCategory {
    switch (type) {
      case 'component_render':
      case 'system':
        return 'critical';
      
      case 'network':
      case 'timeout':
      case 'puzzle_load':
      case 'lesson_generation':
        return 'high';
      
      case 'offline':
      case 'data_validation':
        return 'medium';
      
      case 'user_input':
      case 'permission':
        return 'low';
      
      default:
        return 'medium';
    }
  }

  private getUserFriendlyMessage(type: ErrorType, error: Error): string {
    switch (type) {
      case 'network':
        return 'Unable to connect to the server. Please check your internet connection and try again.';
      
      case 'offline':
        return 'You appear to be offline. Some features may not be available until your connection is restored.';
      
      case 'timeout':
        return 'The request took too long to complete. Please try again.';
      
      case 'puzzle_load':
        return 'There was a problem loading the chess puzzle. Please try selecting a different puzzle.';
      
      case 'lesson_generation':
        return 'Unable to generate the lesson at this time. Please try again or contact support if the problem persists.';
      
      case 'component_render':
        return 'A display error occurred. Please refresh the page to continue.';
      
      case 'data_validation':
        return 'The data format is invalid. Please check your input and try again.';
      
      case 'permission':
        return 'You don\'t have permission to perform this action.';
      
      case 'user_input':
        return 'Please check your input and try again.';
      
      default:
        return 'An unexpected error occurred. Please try again or contact support if the problem persists.';
    }
  }

  private getMaxRetries(type: ErrorType): number {
    switch (type) {
      case 'network':
      case 'timeout':
        return 3;
      
      case 'puzzle_load':
      case 'lesson_generation':
        return 2;
      
      case 'offline':
        return 5; // Keep trying when back online
      
      case 'component_render':
      case 'system':
        return 0; // Don't auto-retry critical errors
      
      default:
        return 1;
    }
  }

  private isRecoverableError(type: ErrorType, error: Error): boolean {
    switch (type) {
      case 'network':
      case 'timeout':
      case 'puzzle_load':
      case 'lesson_generation':
      case 'offline':
        return true;
      
      case 'component_render':
      case 'system':
      case 'permission':
        return false;
      
      default:
        return true;
    }
  }

  private getRecoveryActions(error: ErrorDetails): ErrorRecoveryAction[] {
    const actions: ErrorRecoveryAction[] = [];

    switch (error.type) {
      case 'network':
      case 'timeout':
        actions.push({
          id: 'retry',
          label: 'Try Again',
          description: 'Retry the failed operation',
          action: () => this.attemptRecovery(error),
          icon: '🔄',
          style: 'primary'
        });
        break;

      case 'offline':
        actions.push({
          id: 'offline_mode',
          label: 'Continue Offline',
          description: 'Use cached content while offline',
          action: () => this.enableOfflineMode(),
          icon: '📱'
        });
        break;

      case 'puzzle_load':
        actions.push({
          id: 'reload_puzzles',
          label: 'Reload Puzzles',
          description: 'Refresh the puzzle database',
          action: () => this.reloadPuzzles(),
          icon: '♟️',
          style: 'primary'
        });
        actions.push({
          id: 'different_puzzle',
          label: 'Try Different Puzzle',
          description: 'Load an alternative puzzle',
          action: () => this.loadAlternativePuzzle(),
          icon: '🎯'
        });
        break;

      case 'component_render':
        actions.push({
          id: 'refresh_page',
          label: 'Refresh Page',
          description: 'Reload the current page',
          action: () => window.location.reload(),
          icon: '🔄',
          style: 'primary'
        });
        break;
    }

    // Always add report option for high/critical errors
    if (error.category === 'high' || error.category === 'critical') {
      actions.push({
        id: 'report_error',
        label: 'Report Issue',
        description: 'Send error details to support team',
        action: () => this.reportError(error),
        icon: '📧',
        style: 'secondary'
      });
    }

    return actions;
  }

  private async attemptRecovery(error: ErrorDetails): Promise<void> {
    if (error.retryCount >= error.maxRetries) {
      return;
    }

    error.retryCount++;
    
    const delay = Math.min(
      1000 * Math.pow(2, error.retryCount - 1),
      30000
    );

    this.logger.info('ErrorHandler', `Retry ${error.retryCount}/${error.maxRetries}`, {
      errorId: error.id,
      delay
    });

    await this.delay(delay);

    // Recovery logic would be implemented based on error type
    // This is a placeholder for the actual recovery mechanism
  }

  private showUserNotification(error: ErrorDetails, actions: ErrorRecoveryAction[]): void {
    const notificationConfig: NotificationConfig = {
      type: this.getNotificationType(error),
      duration: this.getNotificationDuration(error),
      persistent: error.category === 'critical',
      actions: actions.map(action => ({
        label: action.label,
        action: action.action,
        style: action.style
      }))
    };

    const handler = this.notificationHandlers.get(notificationConfig.type);
    if (handler) {
      handler({
        id: error.id,
        message: error.userMessage,
        type: error.category,
        config: notificationConfig,
        actions
      });
    } else {
      // Fallback to console for development
      console.error(`[${error.category.toUpperCase()}] ${error.userMessage}`, {
        error,
        actions
      });
    }
  }

  private getNotificationType(error: ErrorDetails): 'toast' | 'modal' | 'banner' | 'none' {
    switch (error.category) {
      case 'critical':
        return 'modal';
      case 'high':
        return 'banner';
      case 'medium':
        return 'toast';
      case 'low':
        return 'none';
      default:
        return 'toast';
    }
  }

  private getNotificationDuration(error: ErrorDetails): number {
    switch (error.category) {
      case 'critical':
        return 0; // Persistent
      case 'high':
        return 10000; // 10 seconds
      case 'medium':
        return 5000; // 5 seconds
      case 'low':
        return 3000; // 3 seconds
      default:
        return 5000;
    }
  }

  private async processOfflineQueue(): Promise<void> {
    // Process any queued operations when coming back online
    const offlineErrors = this.errorQueue.filter(error => error.type === 'offline');
    
    for (const error of offlineErrors) {
      if (error.isRecoverable) {
        await this.attemptRecovery(error);
      }
    }
  }

  private async enableOfflineMode(): Promise<void> {
    this.logger.info('Enabling offline mode', 'Offline mode activated');
    // Implementation would enable offline features
  }

  private async reloadPuzzles(): Promise<void> {
    this.logger.info('Reloading puzzles', 'Puzzle reload initiated');
    // Implementation would reload puzzle data
  }

  private async loadAlternativePuzzle(): Promise<void> {
    this.logger.info('Loading alternative puzzle', 'Alternative puzzle requested');
    // Implementation would load different puzzle
  }

  private async reportError(error: ErrorDetails): Promise<void> {
    this.logger.info('ErrorHandler', 'Error report submitted', {
      errorId: error.id
    });
    // Implementation would send error report
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private formatUptime(): string {
    const uptime = performance.now();
    const hours = Math.floor(uptime / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }
}

// Global error handler instance
export const globalErrorHandler = new GlobalErrorHandler();

// Convenience functions
export const handleError = (
  error: Error | ErrorDetails,
  context?: Record<string, any>,
  component?: string
) => globalErrorHandler.handleError(error, context, component);

export const retryWithBackoff = <T>(
  operation: () => Promise<T>,
  config?: Partial<RetryConfig>,
  context?: Record<string, any>
) => globalErrorHandler.retryWithBackoff(operation, config, context);

export const createDebouncedErrorHandler = (
  handler: (error: ErrorDetails) => void,
  delay?: number
) => globalErrorHandler.createDebouncedErrorHandler(handler, delay);

// Error boundary hook for React components
export const useErrorHandler = () => {
  return {
    handleError: (error: Error, context?: Record<string, any>, component?: string) =>
      globalErrorHandler.handleError(error, context, component),
    
    retryWithBackoff: <T>(
      operation: () => Promise<T>,
      config?: Partial<RetryConfig>
    ) => globalErrorHandler.retryWithBackoff(operation, config),
    
    getSystemHealth: () => globalErrorHandler.getSystemHealth(),
    
    isSystemDegraded: () => globalErrorHandler.isSystemDegraded()
  };
};

// Export the handler instance directly
export const errorHandler = globalErrorHandler;

export default globalErrorHandler;