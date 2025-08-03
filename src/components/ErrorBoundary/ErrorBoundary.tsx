import React, { Component, ErrorInfo, ReactNode } from 'react';
import logger from '../../utils/logger';
import { ChessAppError } from '../../utils/errors';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorReport: string;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorReport: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Generate comprehensive error report
    const errorReport = this.generateErrorReport(error, errorInfo);
    
    // Log the error with ChessLogger
    logger.error('ErrorBoundary', 'React error caught', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
      timestamp: new Date().toISOString()
    });

    // Update state with error details
    this.setState({
      error,
      errorInfo,
      errorReport
    });

    // If it's a ChessAppError, we already have structured logging
    if (error instanceof ChessAppError) {
      logger.error('ErrorBoundary', 'ChessAppError caught by boundary', {
        code: error.code,
        context: error.context,
        userMessage: error.getUserMessage()
      });
    }
  }

  private generateErrorReport(error: Error, errorInfo: ErrorInfo): string {
    const timestamp = new Date().toISOString();
    const recentLogs = logger.getRecentLogs(20)
      .map(log => `${log.timestamp} [${log.level}] ${log.category}: ${log.message}`)
      .join('\n');

    return `
REACT ERROR BOUNDARY REPORT
===========================

Timestamp: ${timestamp}
Error: ${error.message}
Name: ${error.name}

Stack Trace:
${error.stack}

Component Stack:
${errorInfo.componentStack}

Environment:
- User Agent: ${navigator.userAgent}
- URL: ${window.location.href}
- React Version: ${React.version}
- Viewport: ${window.innerWidth}x${window.innerHeight}

Recent Application Logs (Last 20 entries):
${recentLogs}

Additional Context:
${error instanceof ChessAppError ? `
Chess App Error Details:
- Code: ${error.code}
- Context: ${JSON.stringify(error.context, null, 2)}
- User Message: ${error.getUserMessage()}
` : 'Standard JavaScript Error'}
    `.trim();
  }

  private copyErrorReport = async () => {
    try {
      await navigator.clipboard.writeText(this.state.errorReport);
      
      // Show feedback
      const button = document.getElementById('copy-error-btn');
      if (button) {
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.className = button.className.replace('bg-blue-600', 'bg-green-600');
        
        setTimeout(() => {
          button.textContent = originalText;
          button.className = button.className.replace('bg-green-600', 'bg-blue-600');
        }, 2000);
      }

      logger.userAction('ErrorBoundary', 'Error report copied to clipboard');
    } catch (err) {
      logger.error('ErrorBoundary', 'Failed to copy error report', { error: err });
      alert('Failed to copy to clipboard. Please manually select and copy the error report.');
    }
  };

  private reloadApplication = () => {
    logger.userAction('ErrorBoundary', 'Application reload requested');
    window.location.reload();
  };

  private resetErrorBoundary = () => {
    logger.userAction('ErrorBoundary', 'Error boundary reset requested');
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorReport: ''
    });
  };

  render() {
    if (this.state.hasError) {
      const { error } = this.state;
      const isChessAppError = error instanceof ChessAppError;
      const userMessage = isChessAppError 
        ? error.getUserMessage() 
        : 'An unexpected error occurred in the application.';

      // Custom fallback UI can be provided via props
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#161618] flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-[#1E1E22] rounded-lg shadow-xl border border-red-500/30">
            {/* Header */}
            <div className="bg-red-600/20 border-b border-red-500/30 px-6 py-4 rounded-t-lg">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-red-400">
                    Something went wrong
                  </h1>
                  <p className="text-red-300 text-sm mt-1">
                    Chess Trainer encountered an unexpected error
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-6">
              {/* User-friendly message */}
              <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4">
                <h3 className="font-medium text-blue-400 mb-2">What happened?</h3>
                <p className="text-blue-300">
                  {userMessage}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={this.resetErrorBoundary}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Try Again
                </button>
                
                <button
                  onClick={this.reloadApplication}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Reload App
                </button>

                <button
                  id="copy-error-btn"
                  onClick={this.copyErrorReport}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Copy Error Report for AI Debugging
                </button>
              </div>

              {/* Technical details (collapsible) */}
              <details className="bg-[#27272B] border border-[#1E1E22] rounded-lg">
                <summary className="px-4 py-3 cursor-pointer font-medium text-slate-300 hover:bg-[#161618] rounded-t-lg">
                  Technical Details (for developers)
                </summary>
                <div className="px-4 py-3 border-t border-[#1E1E22]">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-white mb-1">Error Message:</h4>
                      <code className="text-sm bg-red-600/20 text-red-400 px-2 py-1 rounded">
                        {error?.message}
                      </code>
                    </div>
                    
                    {isChessAppError && (
                      <div>
                        <h4 className="font-medium text-white mb-1">Error Code:</h4>
                        <code className="text-sm bg-blue-600/20 text-blue-400 px-2 py-1 rounded">
                          {(error as ChessAppError).code}
                        </code>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium text-white mb-1">Timestamp:</h4>
                      <code className="text-sm bg-[#161618] text-slate-300 px-2 py-1 rounded">
                        {new Date().toISOString()}
                      </code>
                    </div>
                  </div>
                </div>
              </details>

              {/* Help text */}
              <div className="text-sm text-slate-400 bg-[#27272B] rounded-lg p-4">
                <p className="mb-2">
                  <strong>What you can do:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Try the "Try Again" button to continue where you left off</li>
                  <li>Click "Reload App" for a fresh start</li>
                  <li>Copy the error report if you need technical support</li>
                  <li>Check your internet connection and try again</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;