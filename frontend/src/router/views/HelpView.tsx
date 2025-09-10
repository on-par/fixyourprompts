/**
 * Help View - Help and documentation page
 * Provides user guidance and feature documentation
 */

import React, { ReactNode } from 'react';
import { Route } from '../index';

export interface HelpViewProps {
  children?: ReactNode;
}

export function HelpView({ children }: HelpViewProps): JSX.Element {
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

export default HelpView;