/**
 * NotFound View - 404 error page
 * Displayed when users navigate to non-existent routes
 */

import React from 'react';
import { Route, useRouter } from '../index';

export function NotFoundView(): JSX.Element {
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

export default NotFoundView;