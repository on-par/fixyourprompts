import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

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

export function RouterProvider({ children, initialRoute }: RouterProviderProps) {
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

    const handlePopState = () => {
      const newRoute = getRouteFromPath(window.location.pathname);
      setCurrentRoute(newRoute);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((route: Route) => {
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

export function Route({ route, children, fallback }: RouteProps) {
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

export function Link({ to, children, className = '', activeClassName = '', onClick }: LinkProps) {
  const { navigate, isActive } = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
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

export function RefinementView({ children }: RefinementViewProps) {
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

export function HistoryView({ children }: { children: ReactNode }) {
  return (
    <Route route="history">
      <div className="history-view">
        <div className="page-header">
          <h1>Session History</h1>
          <p>View and manage your previous prompt refinement sessions</p>
        </div>
        {children}
      </div>
    </Route>
  );
}

export function AboutView({ children }: { children: ReactNode }) {
  return (
    <Route route="about">
      <div className="about-view">
        <div className="page-header">
          <h1>About FixYourPrompts</h1>
          <p>Learn more about our AI-powered prompt refinement tool</p>
        </div>
        <div className="about-content">
          <section className="about-section">
            <h2>What We Do</h2>
            <p>
              FixYourPrompts uses advanced AI analysis to identify issues in your prompts
              and provides intelligent refinements to help you get better results from AI systems.
            </p>
          </section>
          
          <section className="about-section">
            <h2>How It Works</h2>
            <ol>
              <li><strong>Analysis:</strong> Our system identifies vagueness, missing context, and structural issues</li>
              <li><strong>Refinement:</strong> AI generates improved versions with clear explanations</li>
              <li><strong>Learning:</strong> Get personalized educational tips to improve your prompting skills</li>
            </ol>
          </section>
          
          <section className="about-section">
            <h2>Features</h2>
            <ul>
              <li>Real-time prompt analysis</li>
              <li>AI-powered refinement suggestions</li>
              <li>Educational content and best practices</li>
              <li>Session history and management</li>
              <li>Responsive design for all devices</li>
            </ul>
          </section>
        </div>
        {children}
      </div>
    </Route>
  );
}

export function HelpView({ children }: { children: ReactNode }) {
  return (
    <Route route="help">
      <div className="help-view">
        <div className="page-header">
          <h1>Help & Documentation</h1>
          <p>Learn how to use FixYourPrompts effectively</p>
        </div>
        <div className="help-content">
          <section className="help-section">
            <h2>Getting Started</h2>
            <p>
              Enter your prompt in the text area and click "Analyze" to get started.
              Our system will identify potential issues and suggest improvements.
            </p>
          </section>
          
          <section className="help-section">
            <h2>Understanding Analysis Results</h2>
            <dl>
              <dt>Vagueness</dt>
              <dd>Your prompt lacks specificity. Add more details about what you want.</dd>
              
              <dt>Missing Context</dt>
              <dd>Provide background information to help the AI understand your needs.</dd>
              
              <dt>Poor Structure</dt>
              <dd>Organize your prompt with clear sections and logical flow.</dd>
              
              <dt>Unclear Constraints</dt>
              <dd>Specify limitations, format requirements, and scope.</dd>
              
              <dt>Tone Inconsistency</dt>
              <dd>Maintain a consistent tone throughout your prompt.</dd>
              
              <dt>Missing Examples</dt>
              <dd>Include concrete examples to clarify your expectations.</dd>
            </dl>
          </section>
          
          <section className="help-section">
            <h2>Tips for Better Prompts</h2>
            <ul>
              <li>Be specific about what you want to achieve</li>
              <li>Provide relevant context and background</li>
              <li>Include examples when possible</li>
              <li>Specify format and length requirements</li>
              <li>Use clear, consistent language</li>
              <li>Break complex requests into steps</li>
            </ul>
          </section>
        </div>
        {children}
      </div>
    </Route>
  );
}

export function NotFoundView() {
  const { navigate } = useRouter();
  
  return (
    <Route route="404">
      <div className="not-found-view">
        <div className="not-found-content">
          <h1>404 - Page Not Found</h1>
          <p>The page you're looking for doesn't exist.</p>
          <button 
            onClick={() => navigate('home')}
            className="back-home-button"
          >
            Go Back Home
          </button>
        </div>
      </div>
    </Route>
  );
}

export { routeConfig };
export type { Route, RouteInfo };