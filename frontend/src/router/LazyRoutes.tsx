/**
 * Lazy-loaded route components for code splitting
 * Each route is loaded on demand to improve initial bundle size
 */

import { createLazyComponent } from '../components/LazyWrapper';

// Lazy load route view components
export const LazyHistoryView = createLazyComponent(
  () => import('./views/HistoryView'),
  {
    loadingProps: {
      message: 'Loading session history...',
      size: 'large'
    },
    errorBoundaryProps: {
      componentName: 'History View'
    }
  }
);

export const LazyAboutView = createLazyComponent(
  () => import('./views/AboutView'),
  {
    loadingProps: {
      message: 'Loading about page...',
      size: 'large'
    },
    errorBoundaryProps: {
      componentName: 'About View'
    }
  }
);

export const LazyHelpView = createLazyComponent(
  () => import('./views/HelpView'),
  {
    loadingProps: {
      message: 'Loading help documentation...',
      size: 'large'
    },
    errorBoundaryProps: {
      componentName: 'Help View'
    }
  }
);

export const LazyNotFoundView = createLazyComponent(
  () => import('./views/NotFoundView'),
  {
    loadingProps: {
      message: 'Loading page...',
      size: 'medium'
    },
    errorBoundaryProps: {
      componentName: '404 View'
    }
  }
);

export default {
  LazyHistoryView,
  LazyAboutView,
  LazyHelpView,
  LazyNotFoundView
};