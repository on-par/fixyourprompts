/**
 * History View - Session history page
 * Displays and manages previous prompt refinement sessions
 */

import React, { ReactNode } from 'react';
import { Route } from '../index';

export interface HistoryViewProps {
  children?: ReactNode;
}

export function HistoryView({ children }: HistoryViewProps): JSX.Element {
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

export default HistoryView;