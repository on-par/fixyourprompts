import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
// Import lazy-loaded route components
import { 
  LazyHistoryView, 
  LazyAboutView, 
  LazyHelpView, 
  LazyNotFoundView 
} from './LazyRoutes';

export type Route = 
  | 'home'
  | 'refinement'
  | 'history'
  | 'about'
  | 'help'
  | '404';

export interface RouteInfo {
  route: Route;
  title: string;
  path: string;
}

interface RouterContextValue {
  currentRoute: Route;
  navigate: (route: Route) => void;
  getRouteInfo: (route: Route) => RouteInfo;
  isActive: (route: Route) => boolean;
}

const routeConfig: Record<Route, RouteInfo> = {
  home: {
    route: 'home',
    title: 'FixYourPrompts - AI Prompt Refinement Tool',
    path: '/'
  },
  refinement: {
    route: 'refinement',
    title: 'Refine Your Prompt - FixYourPrompts',
    path: '/refine'
  },
  history: {
    route: 'history',
    title: 'Session History - FixYourPrompts',
    path: '/history'
  },
  about: {
    route: 'about',
    title: 'About - FixYourPrompts',
    path: '/about'
  },
  help: {
    route: 'help',
    title: 'Help & Documentation - FixYourPrompts',
    path: '/help'
  },
  '404': {
    route: '404',
    title: 'Page Not Found - FixYourPrompts',
    path: '/404'
  }
};

const RouterContext = createContext<RouterContextValue | null>(null);

function getRouteFromPath(pathname: string): Route {
  const normalizedPath = pathname.toLowerCase();
  
  switch (normalizedPath) {
    case '/':
      return 'home';
    case '/refine':
    case '/refinement':
      return 'refinement';
    case '/history':
      return 'history';
    case '/about':
      return 'about';
    case '/help':
    case '/docs':
      return 'help';
    default:
      return '404';
  }
}

function getPathFromRoute(route: Route): string {
  return routeConfig[route].path;
}

export interface RouterProviderProps {
  children: ReactNode;
  initialRoute?: Route;
}

export function RouterProvider({ children, initialRoute }: RouterProviderProps): JSX.Element {
  // Initialize route from URL or provided initial route
  const [currentRoute, setCurrentRoute] = useState<Route>(() => {
    if (initialRoute) {return initialRoute;}
    if (typeof window !== 'undefined') {
      return getRouteFromPath(window.location.pathname);
    }
    return 'home';
  });

  // Update document title when route changes
  useEffect(() => {
    const routeInfo = routeConfig[currentRoute];
    if (typeof document !== 'undefined') {
      document.title = routeInfo.title;
    }
  }, [currentRoute]);

  // Handle browser navigation
  useEffect(() => {
    if (typeof window === 'undefined') {return;}

    const handlePopState = (): void => {
      const newRoute = getRouteFromPath(window.location.pathname);
      setCurrentRoute(newRoute);
    };

    window.addEventListener('popstate', handlePopState);
    return (): void => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((route: Route): void => {
    if (route === currentRoute) {return;}

    setCurrentRoute(route);
    
    if (typeof window !== 'undefined') {
      const path = getPathFromRoute(route);
      window.history.pushState(null, '', path);
    }
  }, [currentRoute]);

  const getRouteInfo = useCallback((route: Route): RouteInfo => {
    return routeConfig[route];
  }, []);

  const isActive = useCallback((route: Route): boolean => {
    return currentRoute === route;
  }, [currentRoute]);

  const value: RouterContextValue = {
    currentRoute,
    navigate,
    getRouteInfo,
    isActive
  };

  return (
    <RouterContext.Provider value={value}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter(): RouterContextValue {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
}

// Route Components

export interface RouteProps {
  route: Route;
  children: ReactNode;
  fallback?: ReactNode;
}

export function Route({ route, children, fallback }: RouteProps): JSX.Element {
  const { currentRoute } = useRouter();
  
  if (currentRoute === route) {
    return <>{children}</>;
  }
  
  return <>{fallback || null}</>;
}

// Navigation Components

export interface LinkProps {
  to: Route;
  children: ReactNode;
  className?: string;
  activeClassName?: string;
  onClick?: () => void;
}

export function Link({ to, children, className = '', activeClassName = '', onClick }: LinkProps): JSX.Element {
  const { navigate, isActive } = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>): void => {
    e.preventDefault();
    navigate(to);
    onClick?.();
  };

  const finalClassName = `${className} ${isActive(to) ? activeClassName : ''}`.trim();
  const href = getPathFromRoute(to);

  return (
    <a 
      href={href}
      onClick={handleClick}
      className={finalClassName}
      aria-current={isActive(to) ? 'page' : undefined}
    >
      {children}
    </a>
  );
}

// Router Components for rendering different views

interface RefinementViewProps {
  children: ReactNode;
}

export function RefinementView({ children }: RefinementViewProps): JSX.Element {
  return (
    <Route route="refinement" fallback={
      <Route route="home">
        {children}
      </Route>
    }>
      {children}
    </Route>
  );
}

// Export lazy-loaded views with same names as original for backward compatibility
export const HistoryView = LazyHistoryView;
export const AboutView = LazyAboutView;
export const HelpView = LazyHelpView;
export const NotFoundView = LazyNotFoundView;

export { routeConfig };
export type { Route, RouteInfo };