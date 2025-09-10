/**
 * Lazy-loaded component definitions
 * Creates lazy versions of heavy components for code splitting
 */

import { createLazyComponent } from './LazyWrapper';

// Lazy load large components for better initial bundle size
export const LazyAnalysisPanel = createLazyComponent(
  () => import('./AnalysisPanel'),
  {
    loadingProps: {
      message: 'Loading analysis panel...',
      size: 'medium'
    },
    errorBoundaryProps: {
      componentName: 'Analysis Panel'
    }
  }
);

export const LazyPromptOutput = createLazyComponent(
  () => import('./PromptOutput'),
  {
    loadingProps: {
      message: 'Loading prompt output...',
      size: 'medium'
    },
    errorBoundaryProps: {
      componentName: 'Prompt Output'
    }
  }
);

export const LazyEducationPanel = createLazyComponent(
  () => import('./EducationPanel'),
  {
    loadingProps: {
      message: 'Loading education panel...',
      size: 'medium'
    },
    errorBoundaryProps: {
      componentName: 'Education Panel'
    }
  }
);

// Header and Footer are less critical for lazy loading since they're always visible
// but we can still lazy load them for consistency
export const LazyHeader = createLazyComponent(
  () => import('./Header'),
  {
    loadingProps: {
      message: 'Loading header...',
      size: 'small',
      minimal: true
    },
    errorBoundaryProps: {
      componentName: 'Header'
    }
  }
);

export const LazyFooter = createLazyComponent(
  () => import('./Footer'),
  {
    loadingProps: {
      message: 'Loading footer...',
      size: 'small',
      minimal: true
    },
    errorBoundaryProps: {
      componentName: 'Footer'
    }
  }
);

// Keep PromptInput eagerly loaded as it's the main interaction point
// ErrorBoundary should not be lazy loaded as it's critical for error handling

export default {
  LazyAnalysisPanel,
  LazyPromptOutput,
  LazyEducationPanel,
  LazyHeader,
  LazyFooter
};