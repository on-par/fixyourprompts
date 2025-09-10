/**
 * About View - About page with product information
 * Provides information about FixYourPrompts and its features
 */

import React, { ReactNode } from 'react';
import { Route } from '../index';

export interface AboutViewProps {
  children?: ReactNode;
}

export function AboutView({ children }: AboutViewProps): JSX.Element {
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

export default AboutView;