import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ChessAppError } from '../../utils/errors';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string;
}

class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): State {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Convert to ChessAppError if needed
    const chessError = error instanceof ChessAppError 
      ? error 
      : new ChessAppError(
          error.message || 'Component error occurred',
          'COMPONENT_ERROR',
          {
            componentStack: errorInfo.componentStack,
            errorBoundary: this.constructor.name,
            props: this.props,
            errorInfo
          }
        );

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(chessError, errorInfo);
    }

    // Auto-retry after 5 seconds for certain types of errors
    if (this.shouldAutoRetry(error)) {
      this.resetTimeoutId = window.setTimeout(() => {
        this.resetErrorBoundary();
      }, 5000);
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    if (hasError && prevProps.children !== this.props.children) {
      if (resetOnPropsChange) {
        this.resetErrorBoundary();
      }
    }

    if (hasError && resetKeys) {
      const prevResetKeys = prevProps.resetKeys || [];
      const hasResetKeyChanged = resetKeys.some((key, index) => 
        prevResetKeys[index] !== key
      );

      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  private shouldAutoRetry(error: Error): boolean {
    // Auto-retry for network errors or temporary issues
    if (error instanceof ChessAppError) {
      const retryableCodes = [
        'NETWORK_ERROR',
        'STORAGE_ERROR',
        'STOCKFISH_ERROR'
      ];
      return retryableCodes.includes(error.code);
    }
    return false;
  }

  private resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
      this.resetTimeoutId = null;
    }
    
    this.setState({
      hasError: false,
      error: null,
      errorId: ''
    });
  };

  private handleRetry = () => {
    this.resetErrorBoundary();
  };

  private handleReportError = () => {
    if (this.state.error instanceof ChessAppError) {
      // Copy error details to clipboard for reporting
      const errorReport = this.state.error.toAIFormat();
      navigator.clipboard?.writeText(errorReport).then(() => {
        alert('Error details copied to clipboard. Please share this with support.');
      }).catch(() => {
        // Fallback: show error in console for manual copying
        console.error('Error Report for Support:', errorReport);
        alert('Error details logged to console. Please copy from developer tools.');
      });
    }
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const error = this.state.error;
      const isChessError = error instanceof ChessAppError;
      const userMessage = isChessError ? error.getUserMessage() : 'An unexpected error occurred';
      const shouldShowToUser = isChessError ? error.shouldShowToUser() : true;

      if (!shouldShowToUser) {
        // Return children for silent errors (logging only)
        return this.props.children;
      }

      return (
        <div className="min-h-screen bg-[#161618] flex items-center justify-center p-6">
          <div className="max-w-md w-full">
            <div className="bg-[#1E1E22] rounded-lg border border-red-600/20 p-6">
              {/* Error Icon */}
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-600/10 rounded-full">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>

              {/* Error Message */}
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">Something went wrong</h3>
                <p className="text-slate-300 text-sm">{userMessage}</p>
                
                {isChessError && (
                  <div className="mt-3 text-xs text-slate-500">
                    Error ID: {this.state.errorId}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={this.handleRetry}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Try Again
                </button>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => window.location.href = '/'}
                    className="flex-1 px-4 py-2 bg-[#27272B] hover:bg-[#3A3A3F] text-slate-300 rounded-lg font-medium transition-colors text-sm"
                  >
                    Go Home
                  </button>
                  
                  {isChessError && (
                    <button
                      onClick={this.handleReportError}
                      className="flex-1 px-4 py-2 bg-[#27272B] hover:bg-[#3A3A3F] text-slate-300 rounded-lg font-medium transition-colors text-sm"
                      title="Copy error details for support"
                    >
                      Report
                    </button>
                  )}
                </div>
              </div>

              {/* Auto-retry indicator */}
              {this.shouldAutoRetry(error!) && (
                <div className="mt-4 text-center text-xs text-slate-500">
                  Automatically retrying in a few seconds...
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for easier usage with hooks
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Hook for manual error boundary reset
export const useErrorBoundary = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { resetError, captureError };
};

export default ErrorBoundary;