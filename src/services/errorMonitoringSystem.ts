/**
 * Error Monitoring and Alerting System for Automated Workflows
 * 
 * Provides comprehensive error tracking, alerting, and analysis
 * for AI content generation workflows and system health monitoring.
 */

import { EventEmitter } from 'events';

// Error types and severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ErrorCategory {
  PUZZLE_LOADING = 'puzzle_loading',
  CONTENT_GENERATION = 'content_generation',
  VALIDATION = 'validation',
  PERFORMANCE = 'performance',
  SYSTEM = 'system',
  NETWORK = 'network',
  DATA_INTEGRITY = 'data_integrity'
}

// Error interfaces
export interface ErrorEvent {
  id: string;
  timestamp: Date;
  severity: ErrorSeverity;
  category: ErrorCategory;
  message: string;
  stack?: string;
  context: Record<string, any>;
  source: string;
  userId?: string;
  sessionId?: string;
  resolved: boolean;
  resolutionTime?: Date;
  resolutionMethod?: string;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: AlertCondition;
  actions: AlertAction[];
  enabled: boolean;
  cooldownMs: number;
  lastTriggered?: Date;
}

export interface AlertCondition {
  type: 'error_rate' | 'error_count' | 'specific_error' | 'performance_threshold';
  timeWindowMs: number;
  threshold: number;
  category?: ErrorCategory;
  severity?: ErrorSeverity;
  pattern?: string;
}

export interface AlertAction {
  type: 'email' | 'webhook' | 'slack' | 'console' | 'dashboard';
  config: Record<string, any>;
}

export interface SystemHealthMetrics {
  errorRate: number;
  criticalErrors: number;
  avgResolutionTime: number;
  topErrorCategories: Array<{ category: ErrorCategory; count: number }>;
  systemUptime: number;
  performanceMetrics: {
    avgResponseTime: number;
    throughput: number;
    memoryUsage: number;
    cpuUsage: number;
  };
}

// Main error monitoring system
export class ErrorMonitoringSystem extends EventEmitter {
  private errors: Map<string, ErrorEvent> = new Map();
  private alertRules: Map<string, AlertRule> = new Map();
  private metrics: SystemHealthMetrics;
  private isInitialized = false;

  constructor() {
    super();
    this.metrics = this.initializeMetrics();
    this.setupDefaultAlertRules();
  }

  /**
   * Initialize the monitoring system
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Start background processes
      this.startMetricsCollection();
      this.startAlertMonitoring();
      this.startCleanupProcess();
      
      this.isInitialized = true;
      console.log('✅ Error monitoring system initialized');
    } catch (error) {
      console.error('❌ Failed to initialize error monitoring system:', error);
      throw error;
    }
  }

  /**
   * Log an error event
   */
  logError(
    error: Error | string,
    context: Record<string, any> = {},
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    category: ErrorCategory = ErrorCategory.SYSTEM,
    source = 'unknown'
  ): string {
    const errorEvent: ErrorEvent = {
      id: this.generateErrorId(),
      timestamp: new Date(),
      severity,
      category,
      message: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      context,
      source,
      userId: context.userId,
      sessionId: context.sessionId,
      resolved: false
    };

    this.errors.set(errorEvent.id, errorEvent);
    this.updateMetrics(errorEvent);
    this.emit('error', errorEvent);

    // Check alert rules
    this.checkAlertRules(errorEvent);

    // Log to console based on severity
    this.logToConsole(errorEvent);

    return errorEvent.id;
  }

  /**
   * Mark an error as resolved
   */
  resolveError(errorId: string, resolutionMethod: string): boolean {
    const error = this.errors.get(errorId);
    if (!error) return false;

    error.resolved = true;
    error.resolutionTime = new Date();
    error.resolutionMethod = resolutionMethod;

    this.emit('errorResolved', error);
    return true;
  }

  /**
   * Get error statistics
   */
  getErrorStats(timeWindowMs: number = 24 * 60 * 60 * 1000): {
    totalErrors: number;
    errorsByCategory: Record<ErrorCategory, number>;
    errorsBySeverity: Record<ErrorSeverity, number>;
    avgResolutionTime: number;
    unresolvedCount: number;
  } {
    const cutoffTime = new Date(Date.now() - timeWindowMs);
    const recentErrors = Array.from(this.errors.values())
      .filter(error => error.timestamp > cutoffTime);

    const errorsByCategory = {} as Record<ErrorCategory, number>;
    const errorsBySeverity = {} as Record<ErrorSeverity, number>;
    let totalResolutionTime = 0;
    let resolvedCount = 0;
    let unresolvedCount = 0;

    recentErrors.forEach(error => {
      // Count by category
      errorsByCategory[error.category] = (errorsByCategory[error.category] || 0) + 1;
      
      // Count by severity
      errorsBySeverity[error.severity] = (errorsBySeverity[error.severity] || 0) + 1;
      
      // Resolution time
      if (error.resolved && error.resolutionTime) {
        totalResolutionTime += error.resolutionTime.getTime() - error.timestamp.getTime();
        resolvedCount++;
      } else {
        unresolvedCount++;
      }
    });

    return {
      totalErrors: recentErrors.length,
      errorsByCategory,
      errorsBySeverity,
      avgResolutionTime: resolvedCount > 0 ? totalResolutionTime / resolvedCount : 0,
      unresolvedCount
    };
  }

  /**
   * Add alert rule
   */
  addAlertRule(rule: AlertRule): void {
    this.alertRules.set(rule.id, rule);
    console.log(`📋 Added alert rule: ${rule.name}`);
  }

  /**
   * Remove alert rule
   */
  removeAlertRule(ruleId: string): boolean {
    return this.alertRules.delete(ruleId);
  }

  /**
   * Get system health metrics
   */
  getSystemHealth(): SystemHealthMetrics {
    return { ...this.metrics };
  }

  /**
   * Get recent errors
   */
  getRecentErrors(
    limit: number = 100,
    category?: ErrorCategory,
    severity?: ErrorSeverity
  ): ErrorEvent[] {
    let errors = Array.from(this.errors.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (category) {
      errors = errors.filter(error => error.category === category);
    }

    if (severity) {
      errors = errors.filter(error => error.severity === severity);
    }

    return errors.slice(0, limit);
  }

  /**
   * Analyze error patterns
   */
  analyzeErrorPatterns(timeWindowMs: number = 24 * 60 * 60 * 1000): {
    frequentMessages: Array<{ message: string; count: number }>;
    errorSpikes: Array<{ timestamp: Date; count: number }>;
    correlations: Array<{ category: ErrorCategory; relatedCategories: ErrorCategory[] }>;
  } {
    const cutoffTime = new Date(Date.now() - timeWindowMs);
    const recentErrors = Array.from(this.errors.values())
      .filter(error => error.timestamp > cutoffTime);

    // Frequent messages
    const messageCount = new Map<string, number>();
    recentErrors.forEach(error => {
      const count = messageCount.get(error.message) || 0;
      messageCount.set(error.message, count + 1);
    });

    const frequentMessages = Array.from(messageCount.entries())
      .map(([message, count]) => ({ message, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Error spikes (group by hour)
    const hourlyErrors = new Map<string, number>();
    recentErrors.forEach(error => {
      const hour = new Date(error.timestamp);
      hour.setMinutes(0, 0, 0);
      const key = hour.toISOString();
      const count = hourlyErrors.get(key) || 0;
      hourlyErrors.set(key, count + 1);
    });

    const avgErrorsPerHour = Array.from(hourlyErrors.values())
      .reduce((sum, count) => sum + count, 0) / hourlyErrors.size;

    const errorSpikes = Array.from(hourlyErrors.entries())
      .filter(([, count]) => count > avgErrorsPerHour * 2)
      .map(([timestamp, count]) => ({ timestamp: new Date(timestamp), count }))
      .sort((a, b) => b.count - a.count);

    // Category correlations (simplified)
    const correlations: Array<{ category: ErrorCategory; relatedCategories: ErrorCategory[] }> = [];
    // This would involve more complex analysis in a real implementation

    return {
      frequentMessages,
      errorSpikes,
      correlations
    };
  }

  // Private methods

  private initializeMetrics(): SystemHealthMetrics {
    return {
      errorRate: 0,
      criticalErrors: 0,
      avgResolutionTime: 0,
      topErrorCategories: [],
      systemUptime: 0,
      performanceMetrics: {
        avgResponseTime: 0,
        throughput: 0,
        memoryUsage: 0,
        cpuUsage: 0
      }
    };
  }

  private setupDefaultAlertRules(): void {
    // Critical error alert
    this.addAlertRule({
      id: 'critical-errors',
      name: 'Critical Error Alert',
      condition: {
        type: 'specific_error',
        timeWindowMs: 0, // Immediate
        threshold: 1,
        severity: ErrorSeverity.CRITICAL
      },
      actions: [
        { type: 'console', config: { level: 'error' } },
        { type: 'dashboard', config: { highlight: true } }
      ],
      enabled: true,
      cooldownMs: 60000 // 1 minute
    });

    // High error rate alert
    this.addAlertRule({
      id: 'high-error-rate',
      name: 'High Error Rate',
      condition: {
        type: 'error_rate',
        timeWindowMs: 5 * 60 * 1000, // 5 minutes
        threshold: 0.1 // 10% error rate
      },
      actions: [
        { type: 'console', config: { level: 'warn' } }
      ],
      enabled: true,
      cooldownMs: 10 * 60 * 1000 // 10 minutes
    });

    // Puzzle loading errors
    this.addAlertRule({
      id: 'puzzle-loading-errors',
      name: 'Puzzle Loading Failures',
      condition: {
        type: 'error_count',
        timeWindowMs: 10 * 60 * 1000, // 10 minutes
        threshold: 10,
        category: ErrorCategory.PUZZLE_LOADING
      },
      actions: [
        { type: 'console', config: { level: 'warn' } }
      ],
      enabled: true,
      cooldownMs: 15 * 60 * 1000 // 15 minutes
    });
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private updateMetrics(errorEvent: ErrorEvent): void {
    // Update error rate
    const recentErrors = this.getErrorStats(60 * 60 * 1000); // 1 hour
    this.metrics.errorRate = recentErrors.totalErrors / 3600; // errors per second

    // Update critical errors
    if (errorEvent.severity === ErrorSeverity.CRITICAL) {
      this.metrics.criticalErrors++;
    }

    // Update top error categories
    this.metrics.topErrorCategories = Object.entries(recentErrors.errorsByCategory)
      .map(([category, count]) => ({ category: category as ErrorCategory, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Update average resolution time
    this.metrics.avgResolutionTime = recentErrors.avgResolutionTime;
  }

  private checkAlertRules(errorEvent: ErrorEvent): void {
    for (const rule of this.alertRules.values()) {
      if (!rule.enabled) continue;

      // Check cooldown
      if (rule.lastTriggered && 
          Date.now() - rule.lastTriggered.getTime() < rule.cooldownMs) {
        continue;
      }

      if (this.shouldTriggerAlert(rule, errorEvent)) {
        this.triggerAlert(rule, errorEvent);
        rule.lastTriggered = new Date();
      }
    }
  }

  private shouldTriggerAlert(rule: AlertRule, errorEvent: ErrorEvent): boolean {
    const { condition } = rule;

    switch (condition.type) {
      case 'specific_error':
        if (condition.severity && errorEvent.severity !== condition.severity) return false;
        if (condition.category && errorEvent.category !== condition.category) return false;
        if (condition.pattern && !errorEvent.message.includes(condition.pattern)) return false;
        return true;

      case 'error_count':
        return this.checkErrorCount(condition);

      case 'error_rate':
        return this.checkErrorRate(condition);

      case 'performance_threshold':
        return this.checkPerformanceThreshold(condition);

      default:
        return false;
    }
  }

  private checkErrorCount(condition: AlertCondition): boolean {
    const cutoffTime = new Date(Date.now() - condition.timeWindowMs);
    const recentErrors = Array.from(this.errors.values())
      .filter(error => {
        if (error.timestamp < cutoffTime) return false;
        if (condition.category && error.category !== condition.category) return false;
        if (condition.severity && error.severity !== condition.severity) return false;
        return true;
      });

    return recentErrors.length >= condition.threshold;
  }

  private checkErrorRate(condition: AlertCondition): boolean {
    const stats = this.getErrorStats(condition.timeWindowMs);
    const totalOperations = Math.max(stats.totalErrors * 10, 1); // Estimate
    const errorRate = stats.totalErrors / totalOperations;
    return errorRate >= condition.threshold;
  }

  private checkPerformanceThreshold(condition: AlertCondition): boolean {
    // This would check various performance metrics
    return this.metrics.performanceMetrics.avgResponseTime > condition.threshold;
  }

  private triggerAlert(rule: AlertRule, errorEvent: ErrorEvent): void {
    console.log(`🚨 Alert triggered: ${rule.name}`);
    
    for (const action of rule.actions) {
      this.executeAlertAction(action, rule, errorEvent);
    }

    this.emit('alert', { rule, errorEvent });
  }

  private executeAlertAction(
    action: AlertAction, 
    rule: AlertRule, 
    errorEvent: ErrorEvent
  ): void {
    switch (action.type) {
      case 'console':
        const level = action.config.level || 'error';
        console[level](`🚨 ${rule.name}: ${errorEvent.message}`, {
          error: errorEvent,
          rule: rule.name
        });
        break;

      case 'webhook':
        this.sendWebhookAlert(action.config, rule, errorEvent);
        break;

      case 'email':
        this.sendEmailAlert(action.config, rule, errorEvent);
        break;

      case 'slack':
        this.sendSlackAlert(action.config, rule, errorEvent);
        break;

      case 'dashboard':
        this.sendDashboardAlert(action.config, rule, errorEvent);
        break;

      default:
        console.warn(`Unknown alert action type: ${action.type}`);
    }
  }

  private async sendWebhookAlert(
    config: Record<string, any>,
    rule: AlertRule,
    errorEvent: ErrorEvent
  ): Promise<void> {
    try {
      const payload = {
        alert: rule.name,
        error: {
          id: errorEvent.id,
          message: errorEvent.message,
          severity: errorEvent.severity,
          category: errorEvent.category,
          timestamp: errorEvent.timestamp
        },
        metrics: this.getSystemHealth()
      };

      // In a real implementation, you would make an HTTP request
      console.log('📤 Webhook alert payload:', payload);
    } catch (error) {
      console.error('Failed to send webhook alert:', error);
    }
  }

  private async sendEmailAlert(
    config: Record<string, any>,
    rule: AlertRule,
    errorEvent: ErrorEvent
  ): Promise<void> {
    // Email implementation would go here
    console.log('📧 Email alert (not implemented):', { rule: rule.name, error: errorEvent.message });
  }

  private async sendSlackAlert(
    config: Record<string, any>,
    rule: AlertRule,
    errorEvent: ErrorEvent
  ): Promise<void> {
    // Slack implementation would go here
    console.log('💬 Slack alert (not implemented):', { rule: rule.name, error: errorEvent.message });
  }

  private sendDashboardAlert(
    config: Record<string, any>,
    rule: AlertRule,
    errorEvent: ErrorEvent
  ): void {
    // Dashboard notification implementation
    this.emit('dashboardAlert', {
      type: 'alert',
      severity: errorEvent.severity,
      message: `${rule.name}: ${errorEvent.message}`,
      highlight: config.highlight || false
    });
  }

  private logToConsole(errorEvent: ErrorEvent): void {
    const prefix = this.getSeverityPrefix(errorEvent.severity);
    const message = `${prefix} [${errorEvent.category}] ${errorEvent.message}`;
    
    switch (errorEvent.severity) {
      case ErrorSeverity.CRITICAL:
        console.error(message, errorEvent);
        break;
      case ErrorSeverity.HIGH:
        console.error(message, errorEvent.context);
        break;
      case ErrorSeverity.MEDIUM:
        console.warn(message, errorEvent.context);
        break;
      case ErrorSeverity.LOW:
        console.info(message);
        break;
    }
  }

  private getSeverityPrefix(severity: ErrorSeverity): string {
    switch (severity) {
      case ErrorSeverity.CRITICAL: return '🔴 CRITICAL';
      case ErrorSeverity.HIGH: return '🟠 HIGH';
      case ErrorSeverity.MEDIUM: return '🟡 MEDIUM';
      case ErrorSeverity.LOW: return '🟢 LOW';
      default: return '⚪ UNKNOWN';
    }
  }

  private startMetricsCollection(): void {
    setInterval(() => {
      // Update system uptime
      this.metrics.systemUptime = process.uptime();

      // Update performance metrics
      if (typeof process !== 'undefined' && process.memoryUsage) {
        const memUsage = process.memoryUsage();
        this.metrics.performanceMetrics.memoryUsage = memUsage.heapUsed / memUsage.heapTotal;
      }

      // Emit metrics update
      this.emit('metricsUpdate', this.metrics);
    }, 30000); // Every 30 seconds
  }

  private startAlertMonitoring(): void {
    // Monitor for patterns that might indicate system issues
    setInterval(() => {
      const stats = this.getErrorStats(5 * 60 * 1000); // 5 minutes
      
      // Check for unusual error patterns
      if (stats.totalErrors > 50) {
        this.logError(
          'High error volume detected',
          { errorCount: stats.totalErrors },
          ErrorSeverity.HIGH,
          ErrorCategory.SYSTEM,
          'error-monitor'
        );
      }
    }, 60000); // Every minute
  }

  private startCleanupProcess(): void {
    // Clean up old errors periodically
    setInterval(() => {
      const cutoffTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days
      let cleanedCount = 0;

      for (const [id, error] of this.errors.entries()) {
        if (error.timestamp < cutoffTime && error.resolved) {
          this.errors.delete(id);
          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        console.log(`🧹 Cleaned up ${cleanedCount} old error records`);
      }
    }, 24 * 60 * 60 * 1000); // Daily
  }
}

// Singleton instance
export const errorMonitor = new ErrorMonitoringSystem();

// Convenience functions
export const logError = (
  error: Error | string,
  context?: Record<string, any>,
  severity?: ErrorSeverity,
  category?: ErrorCategory,
  source?: string
) => errorMonitor.logError(error, context, severity, category, source);

export const resolveError = (errorId: string, resolutionMethod: string) =>
  errorMonitor.resolveError(errorId, resolutionMethod);

export const getSystemHealth = () => errorMonitor.getSystemHealth();

export const getErrorStats = (timeWindowMs?: number) => errorMonitor.getErrorStats(timeWindowMs);

// Auto-initialize in browser/Node.js environments
if (typeof window !== 'undefined' || typeof process !== 'undefined') {
  errorMonitor.initialize().catch(console.error);
}

// Default export
export default errorMonitor;