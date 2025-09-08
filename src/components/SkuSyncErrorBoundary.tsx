/**
 * Error boundary and monitoring system for SKU synchronization failures
 * Provides graceful degradation and error reporting when SKU/URL sync fails
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { UrlSyncMonitor } from '../hooks/useUrlSync';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

/**
 * Error boundary specifically for SKU synchronization failures
 * Provides fallback UI and error recovery mechanisms
 */
export class SkuSyncErrorBoundary extends Component<Props, State> {
  private monitor = UrlSyncMonitor.getInstance();
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error
    console.error('SKU Sync Error Boundary caught an error:', error, errorInfo);
    
    // Record error in monitor
    this.monitor.recordError();
    
    // Update state with error info
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Report to error tracking service if available
    if (typeof window !== 'undefined' && (window as any).errorTracker) {
      (window as any).errorTracker.captureException(error, {
        context: 'sku-sync',
        errorInfo,
        extra: {
          syncStats: this.monitor.getStats()
        }
      });
    }
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }));
    }
  };

  handleReset = () => {
    // Reset error boundary state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    });

    // Reset monitor stats
    this.monitor.reset();

    // Clear URL to reset state
    try {
      window.history.replaceState({}, '', window.location.pathname);
    } catch (e) {
      console.warn('Failed to reset URL:', e);
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg
                  className="h-8 w-8 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-semibold text-gray-900">
                  Configuration Sync Error
                </h1>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">
                There was an error synchronizing your mirror configuration with the URL.
                Your selections may not be preserved when sharing or reloading.
              </p>
              
              {import.meta.env.DEV && this.state.error && (
                <details className="mb-4">
                  <summary className="text-sm font-medium text-gray-700 cursor-pointer">
                    Technical Details (Dev Mode)
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono">
                    <div className="mb-2">
                      <strong>Error:</strong> {this.state.error.message}
                    </div>
                    <div className="mb-2">
                      <strong>Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap">
                        {this.state.error.stack}
                      </pre>
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="mt-1 whitespace-pre-wrap">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {this.state.retryCount < this.maxRetries && (
                <button
                  onClick={this.handleRetry}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg
                    className="mr-2 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Retry ({this.maxRetries - this.state.retryCount} attempts left)
                </button>
              )}
              
              <button
                onClick={this.handleReset}
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Reset Configurator
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Reload Page
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                The configurator will continue to work, but URL sharing and bookmarking may not function correctly.
                If the problem persists, please contact support.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook for SKU synchronization error handling
 * Provides error reporting and recovery utilities
 */
export function useSkuSyncErrorHandler() {
  const monitor = UrlSyncMonitor.getInstance();

  const reportError = React.useCallback((error: Error, context?: Record<string, any>) => {
    console.error('SKU Sync Error:', error, context);
    
    monitor.recordError();

    // Report to error tracking service if available
    if (typeof window !== 'undefined' && (window as any).errorTracker) {
      (window as any).errorTracker.captureException(error, {
        context: 'sku-sync',
        extra: {
          syncStats: monitor.getStats(),
          ...context
        }
      });
    }
  }, [monitor]);

  const reportWarning = React.useCallback((message: string, context?: Record<string, any>) => {
    console.warn('SKU Sync Warning:', message, context);

    // Report to error tracking service if available
    if (typeof window !== 'undefined' && (window as any).errorTracker) {
      (window as any).errorTracker.captureMessage(message, 'warning', {
        context: 'sku-sync',
        extra: {
          syncStats: monitor.getStats(),
          ...context
        }
      });
    }
  }, [monitor]);

  const getSyncHealth = React.useCallback(() => {
    return monitor.getStats();
  }, [monitor]);

  return {
    reportError,
    reportWarning,
    getSyncHealth
  };
}

/**
 * Development-only component for monitoring SKU sync performance
 */
export function SkuSyncMonitorDisplay() {
  const [stats, setStats] = React.useState(UrlSyncMonitor.getInstance().getStats());
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    if (!import.meta.env.DEV) return;

    const interval = setInterval(() => {
      setStats(UrlSyncMonitor.getInstance().getStats());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Only show in development mode
  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`px-3 py-2 rounded-full text-xs font-mono shadow-lg transition-colors ${
          stats.isHealthy 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white animate-pulse'
        }`}
      >
        SKU Sync: {stats.totalUpdates} updates
      </button>

      {isVisible && (
        <div className="absolute bottom-12 right-0 bg-white border border-gray-300 rounded-lg shadow-xl p-4 min-w-64">
          <div className="text-sm font-semibold mb-3 flex items-center justify-between">
            SKU Sync Monitor
            <button
              onClick={() => UrlSyncMonitor.getInstance().reset()}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Reset
            </button>
          </div>
          
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span>Total Updates:</span>
              <span className="font-semibold">{stats.totalUpdates}</span>
            </div>
            <div className="flex justify-between">
              <span>Error Rate:</span>
              <span className={`font-semibold ${stats.errorRate > 0.05 ? 'text-red-600' : 'text-green-600'}`}>
                {(stats.errorRate * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Avg Time:</span>
              <span className={`font-semibold ${stats.averageUpdateTime > 50 ? 'text-yellow-600' : 'text-green-600'}`}>
                {stats.averageUpdateTime.toFixed(1)}ms
              </span>
            </div>
            <div className="flex justify-between">
              <span>Health:</span>
              <span className={`font-semibold ${stats.isHealthy ? 'text-green-600' : 'text-red-600'}`}>
                {stats.isHealthy ? 'Good' : 'Poor'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
