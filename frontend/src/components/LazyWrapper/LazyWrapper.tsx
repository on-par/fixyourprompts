/**
 * Lazy Wrapper utility for creating lazy-loaded components
 * Provides consistent loading states and error boundaries for code splitting
 */

import React, { Suspense, ComponentType, ReactNode } from 'react';
import { LazyErrorBoundary, LazyErrorBoundaryProps } from '../LazyErrorBoundary';
import { LoadingFallback, LoadingFallbackProps } from '../LoadingFallback';

export interface LazyWrapperOptions {
  /** Loading fallback props */
  loadingProps?: Partial<LoadingFallbackProps>;
  /** Error boundary props */
  errorBoundaryProps?: Partial<LazyErrorBoundaryProps>;
  /** Custom loading component */
  customLoading?: ReactNode;
  /** Custom error fallback */
  customErrorFallback?: ReactNode;
}

/**
 * Creates a lazy-loaded component with consistent loading and error handling
 * @param importFn - Dynamic import function that returns the component
 * @param options - Configuration options for loading and error states
 * @returns Wrapped lazy component with Suspense and error boundary
 */
export function createLazyComponent<T extends ComponentType<Record<string, unknown>>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyWrapperOptions = {}
): ComponentType<React.ComponentProps<T>> {
  // Create the lazy component
  const LazyComponent = React.lazy(importFn);
  
  // Return the wrapped component
  return function LazyWrapper(props: React.ComponentProps<T>) {
    const {
      loadingProps = {},
      errorBoundaryProps = {},
      customLoading,
      customErrorFallback
    } = options;

    // Determine loading fallback
    const loadingFallback = customLoading || (
      <LoadingFallback 
        message="Loading component..."
        size="medium"
        {...loadingProps}
      />
    );

    // Determine error fallback
    const errorFallback = customErrorFallback || undefined;

    return (
      <LazyErrorBoundary
        fallback={errorFallback}
        componentName={LazyComponent.name || 'LazyComponent'}
        allowRetry={true}
        {...errorBoundaryProps}
      >
        <Suspense fallback={loadingFallback}>
          <LazyComponent {...props} />
        </Suspense>
      </LazyErrorBoundary>
    );
  };
}

/**
 * Higher-order component for wrapping existing components with lazy loading
 * @param WrappedComponent - Component to wrap
 * @param options - Configuration options
 */
export function withLazyWrapper<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: LazyWrapperOptions = {}
): ComponentType<P> {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  
  function LazyWrapperHOC(props: P): JSX.Element {
    const {
      loadingProps = {},
      errorBoundaryProps = {},
      customLoading,
      customErrorFallback
    } = options;

    // Determine loading fallback
    const loadingFallback = customLoading || (
      <LoadingFallback 
        message={`Loading ${displayName}...`}
        size="medium"
        {...loadingProps}
      />
    );

    // Determine error fallback
    const errorFallback = customErrorFallback || undefined;

    return (
      <LazyErrorBoundary
        fallback={errorFallback}
        componentName={displayName}
        allowRetry={true}
        {...errorBoundaryProps}
      >
        <Suspense fallback={loadingFallback}>
          <WrappedComponent {...props} />
        </Suspense>
      </LazyErrorBoundary>
    );
  }

  LazyWrapperHOC.displayName = `LazyWrapper(${displayName})`;
  
  return LazyWrapperHOC;
}

/**
 * Simple wrapper component for manual use
 */
export interface LazyWrapperProps extends LazyWrapperOptions {
  children: ReactNode;
  componentName?: string;
}

export function LazyWrapper({
  children,
  componentName = 'Component',
  loadingProps = {},
  errorBoundaryProps = {},
  customLoading,
  customErrorFallback
}: LazyWrapperProps): JSX.Element {
  const loadingFallback = customLoading || (
    <LoadingFallback 
      message={`Loading ${componentName}...`}
      size="medium"
      {...loadingProps}
    />
  );

  const errorFallback = customErrorFallback || undefined;

  return (
    <LazyErrorBoundary
      fallback={errorFallback}
      componentName={componentName}
      allowRetry={true}
      {...errorBoundaryProps}
    >
      <Suspense fallback={loadingFallback}>
        {children}
      </Suspense>
    </LazyErrorBoundary>
  );
}

export default LazyWrapper;