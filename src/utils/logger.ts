/**
 * Simple logger utility for AI CMS
 * Provides structured logging for development and debugging
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
  stackTrace?: string;
}

class CMSLogger {
  private static instance: CMSLogger;
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;

  private constructor() {}

  static getInstance(): CMSLogger {
    if (!CMSLogger.instance) {
      CMSLogger.instance = new CMSLogger();
    }
    return CMSLogger.instance;
  }

  log(level: LogLevel, category: string, message: string, data?: any): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data,
      stackTrace: level === LogLevel.ERROR ? new Error().stack : undefined
    };

    this.logs.push(entry);

    // Keep logs under maxLogs limit
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    this.consoleOutput(entry);
  }

  private consoleOutput(entry: LogEntry): void {
    const prefix = `[${entry.category}] ${entry.message}`;
    
    switch (entry.level) {
      case LogLevel.DEBUG:
        if (entry.data) {
          console.debug(prefix, entry.data);
        } else {
          console.debug(prefix);
        }
        break;
      case LogLevel.INFO:
        if (entry.data) {
          console.info(prefix, entry.data);
        } else {
          console.info(prefix);
        }
        break;
      case LogLevel.WARN:
        if (entry.data) {
          console.warn(prefix, entry.data);
        } else {
          console.warn(prefix);
        }
        break;
      case LogLevel.ERROR:
        if (entry.data) {
          console.error(prefix, entry.data);
        } else {
          console.error(prefix);
        }
        if (entry.stackTrace) {
          console.error('Stack trace:', entry.stackTrace);
        }
        break;
    }
  }

  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logs.slice(-count);
  }

  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  getLogsByCategory(category: string): LogEntry[] {
    return this.logs.filter(log => log.category === category);
  }

  clearLogs(): void {
    this.logs = [];
    console.clear();
  }

  // Convenience methods
  debug(category: string, message: string, data?: any): void {
    this.log(LogLevel.DEBUG, category, message, data);
  }

  info(category: string, message: string, data?: any): void {
    this.log(LogLevel.INFO, category, message, data);
  }

  warn(category: string, message: string, data?: any): void {
    this.log(LogLevel.WARN, category, message, data);
  }

  error(category: string, message: string, data?: any): void {
    this.log(LogLevel.ERROR, category, message, data);
  }

  // CMS-specific logging methods
  contentAction(message: string, data?: any): void {
    this.log(LogLevel.INFO, 'Content', message, data);
  }

  performanceMetric(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, 'Performance', message, data);
  }

  buildAction(message: string, data?: any): void {
    this.log(LogLevel.INFO, 'Build', message, data);
  }

  seoAction(message: string, data?: any): void {
    this.log(LogLevel.INFO, 'SEO', message, data);
  }

  userAction(category: string, message: string, data?: any): void {
    this.log(LogLevel.INFO, category, message, data);
  }
}

const logger = CMSLogger.getInstance();

export default logger;
export { CMSLogger };