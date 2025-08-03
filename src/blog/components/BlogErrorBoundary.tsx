import React, { Component, ReactNode } from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import logger from '../../utils/logger';
import BlogAnalytics from '../utils/blog-analytics';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class BlogErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Track error with BlogAnalytics (includes ChessLogger and GA)
    BlogAnalytics.trackError({
      error_type: 'component_error',
      error_message: error.message,
      component: 'BlogErrorBoundary',
      page_path: typeof window !== 'undefined' ? window.location.pathname : undefined
    });

    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    logger.info('BlogErrorBoundary', 'User requested error reset');
    
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
            <div className="flex justify-center mb-4">
              <ExclamationTriangleIcon className="h-12 w-12 text-red-500" />
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Something went wrong
            </h2>
            
            <p className="text-gray-600 mb-6">
              We're sorry, but something unexpected happened while loading the blog. 
              Don't worry - your chess training progress is safe!
            </p>
            
            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowPathIcon className="h-4 w-4" />
                Try Again
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
              >
                Return to Chess Training
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Technical Details (Dev Mode)
                </summary>
                <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-700 overflow-auto">
                  <div className="font-semibold mb-2">Error:</div>
                  <div className="mb-4">{this.state.error.message}</div>
                  
                  {this.state.error.stack && (
                    <>
                      <div className="font-semibold mb-2">Stack Trace:</div>
                      <pre className="whitespace-pre-wrap text-xs">
                        {this.state.error.stack}
                      </pre>
                    </>
                  )}
                  
                  {this.state.errorInfo?.componentStack && (
                    <>
                      <div className="font-semibold mb-2 mt-4">Component Stack:</div>
                      <pre className="whitespace-pre-wrap text-xs">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easier usage
export function withBlogErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithBlogErrorBoundaryComponent(props: P) {
    return (
      <BlogErrorBoundary fallback={fallback}>
        <Component {...props} />
      </BlogErrorBoundary>
    );
  };
}