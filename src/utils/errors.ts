import logger from './logger';

export class ChessAppError extends Error {
  public readonly code: string;
  public readonly context: Record<string, any>;
  public readonly timestamp: string;

  constructor(
    message: string,
    code: string,
    context: Record<string, any> = {}
  ) {
    super(message);
    this.name = 'ChessAppError';
    this.code = code;
    this.context = context;
    this.timestamp = new Date().toISOString();

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, ChessAppError.prototype);

    // Log the error with full context
    logger.error('ChessAppError', message, {
      code: this.code,
      context: this.context,
      stack: this.stack,
      timestamp: this.timestamp
    });
  }

  /**
   * Format error information for AI debugging
   */
  toAIFormat(): string {
    const recentLogs = logger.getRecentLogs(10)
      .map(log => `${log.timestamp} [${log.level}] ${log.category}: ${log.message}`)
      .join('\n');

    return `
ERROR REPORT FOR AI DEBUGGING
=============================

Error: ${this.message}
Code: ${this.code}
Timestamp: ${this.timestamp}
Name: ${this.name}

Context:
${JSON.stringify(this.context, null, 2)}

Stack Trace:
${this.stack}

Recent Actions (Last 10 logs):
${recentLogs}

Environment:
- User Agent: ${navigator.userAgent}
- URL: ${window.location.href}
- Timestamp: ${new Date().toISOString()}
    `.trim();
  }

  /**
   * Get a user-friendly message for display
   */
  getUserMessage(): string {
    // Map error codes to user-friendly messages
    const userMessages: Record<string, string> = {
      'CHESS_MOVE_INVALID': 'Invalid chess move. Please try a different move.',
      'LESSON_LOAD_FAILED': 'Failed to load lesson content. Please refresh and try again.',
      'EXERCISE_VALIDATION_ERROR': 'Unable to validate your answer. Please try again.',
      'STOCKFISH_ERROR': 'Chess engine error. The AI opponent may not be available.',
      'CURRICULUM_PARSE_ERROR': 'Failed to load course content. Please refresh the page.',
      'PROGRESS_SAVE_ERROR': 'Unable to save your progress. Your work may not be saved.',
      'BOARD_RENDER_ERROR': 'Chess board display error. Please refresh the page.',
      'NETWORK_ERROR': 'Network connection issue. Please check your internet connection.',
      'STORAGE_ERROR': 'Local storage error. Your progress may not be saved.',
      'VALIDATION_ERROR': 'Input validation failed. Please check your entries.',
    };

    return userMessages[this.code] || 'An unexpected error occurred. Please try again.';
  }

  /**
   * Check if this error should be reported to user vs. handled silently
   */
  shouldShowToUser(): boolean {
    const silentCodes = ['DEBUG_ERROR', 'PERFORMANCE_WARNING', 'LOG_EXPORT_FAILED'];
    return !silentCodes.includes(this.code);
  }
}

// Common error factory functions for consistent error creation
export const createChessError = {
  invalidMove: (move: any, context: Record<string, any> = {}) =>
    new ChessAppError('Invalid chess move attempted', 'CHESS_MOVE_INVALID', { move, ...context }),

  lessonLoadFailed: (lessonId: string, error: any) =>
    new ChessAppError('Failed to load lesson content', 'LESSON_LOAD_FAILED', { lessonId, originalError: error.message }),

  exerciseValidationError: (exerciseId: string, context: Record<string, any> = {}) =>
    new ChessAppError('Exercise validation failed', 'EXERCISE_VALIDATION_ERROR', { exerciseId, ...context }),

  stockfishError: (operation: string, error: any) =>
    new ChessAppError('Chess engine error', 'STOCKFISH_ERROR', { operation, originalError: error.message }),

  engineError: (message: string, error: any) =>
    new ChessAppError(message, 'ENGINE_ERROR', { originalError: error instanceof Error ? error.message : String(error) }),

  curriculumParseError: (source: string, error: any) =>
    new ChessAppError('Failed to parse curriculum content', 'CURRICULUM_PARSE_ERROR', { source, originalError: error.message }),

  curriculumError: (message: string, code: string, context: Record<string, any> = {}) =>
    new ChessAppError(message, code, context),

  progressSaveError: (data: any, error: any) =>
    new ChessAppError('Failed to save progress', 'PROGRESS_SAVE_ERROR', { data, originalError: error.message }),

  boardRenderError: (component: string, error: any) =>
    new ChessAppError('Chess board rendering failed', 'BOARD_RENDER_ERROR', { component, originalError: error.message }),

  networkError: (url: string, error: any) =>
    new ChessAppError('Network request failed', 'NETWORK_ERROR', { url, originalError: error.message }),

  storageError: (operation: string, error: any) =>
    new ChessAppError('Local storage operation failed', 'STORAGE_ERROR', { operation, originalError: error.message }),

  validationError: (field: string, value: any, reason: string) =>
    new ChessAppError('Input validation failed', 'VALIDATION_ERROR', { field, value, reason }),

  analysisError: (operation: string, error: any) =>
    new ChessAppError('Analysis operation failed', 'ANALYSIS_ERROR', { operation, originalError: error.message })
};

// Export default error handler for async operations
export const handleAsyncError = (error: any, context: Record<string, any> = {}): ChessAppError => {
  if (error instanceof ChessAppError) {
    return error;
  }

  // Convert unknown errors to ChessAppError
  return new ChessAppError(
    error.message || 'Unknown error occurred',
    'UNKNOWN_ERROR',
    { originalError: error, ...context }
  );
};