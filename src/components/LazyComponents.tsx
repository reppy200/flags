import React, { Suspense, lazy } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

// Lazy load components for code splitting
export const FlagDashboard = lazy(() => 
  import('./FlagDashboard').then(module => ({ default: module.FlagDashboard }))
);

export const PerformanceMetrics = lazy(() => 
  import('./PerformanceMetrics').then(module => ({ default: module.PerformanceMetrics }))
);

export const FlagTestingUI = lazy(() => 
  import('./FlagTestingUI').then(module => ({ default: module.FlagTestingUI }))
);

// Loading fallback component
const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="loading-container">
    <div className="loading-spinner" />
    <p>{message}</p>
  </div>
);

// Error fallback component
const ErrorFallback: React.FC<{ error: Error; resetErrorBoundary: () => void }> = ({ 
  error, 
  resetErrorBoundary 
}) => (
  <div className="error-container">
    <h2>Something went wrong</h2>
    <pre>{error.message}</pre>
    <button onClick={resetErrorBoundary}>Try again</button>
  </div>
);

// Higher-order component for wrapping lazy components
export const withLazyLoading = <P extends object>(
  Component: React.LazyExoticComponent<React.ComponentType<P>>,
  loadingMessage?: string
) => {
  return (props: P) => (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<LoadingSpinner message={loadingMessage} />}>
        <Component {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};

// Pre-wrapped lazy components ready to use
export const LazyFlagDashboard = withLazyLoading(FlagDashboard, 'Loading dashboard...');
export const LazyPerformanceMetrics = withLazyLoading(PerformanceMetrics, 'Loading metrics...');
export const LazyFlagTestingUI = withLazyLoading(FlagTestingUI, 'Loading testing interface...');