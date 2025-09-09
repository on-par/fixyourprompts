/**
 * React Component Props Interfaces for FixYourPrompts Application
 * 
 * This file defines TypeScript interfaces for React component props
 * based on the component contracts specification.
 */

import React from 'react';

// ============================================
// Core Types (to be imported from './core' when available)
// ============================================

// Note: These types should be moved to './core' once that file is created
export interface PromptRefinementSession {
  id: string;
  originalPrompt: string;
  refinedPrompt?: string;
  analyses: PromptAnalysis[];
  improvements: PromptImprovement[];
  status: 'analyzing' | 'complete' | 'error';
  createdAt: Date;
  updatedAt: Date;
}

export interface PromptAnalysis {
  id: string;
  type: string;
  score: number;
  message: string;
  severity: 'low' | 'medium' | 'high';
  suggestions: string[];
}

export interface PromptIssue {
  id: string;
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  position?: { start: number; end: number };
}

export interface PromptImprovement {
  id: string;
  title: string;
  description: string;
  rationale: string;
  impact: 'low' | 'medium' | 'high';
  category: string;
  applied: boolean;
}

export interface EducationTip {
  id: string;
  title: string;
  content: string;
  category: EducationCategory;
  level: 'beginner' | 'intermediate' | 'advanced';
  examples?: string[];
}

export interface EducationCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

export interface RefinementResult {
  refinedPrompt: string;
  improvements: PromptImprovement[];
  confidence: number;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  educationEnabled: boolean;
  level: 'beginner' | 'intermediate' | 'advanced';
  showAnalysisDetails: boolean;
}

export interface RefinementError {
  type: 'analysis' | 'refinement' | 'storage' | 'validation';
  message: string;
  originalPrompt?: string;
  context?: Record<string, unknown>;
  recoverable: boolean;
}

// ============================================
// React Component Props Interfaces
// ============================================

/**
 * Main App component props
 */
export interface AppProps {
  /** Initial theme setting for the application */
  initialTheme?: 'light' | 'dark';
  /** Whether to show the welcome screen on first load */
  showWelcome?: boolean;
}

/**
 * PromptInput component props for the main prompt input interface
 */
export interface PromptInputProps {
  /** Current value of the prompt input */
  value: string;
  /** Handler called when the input value changes */
  onChange: (value: string) => void;
  /** Handler called when the prompt is submitted for analysis */
  onSubmit: (prompt: string) => void;
  /** Placeholder text for the input field */
  placeholder?: string;
  /** Maximum length of the prompt input */
  maxLength?: number;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Error message to display */
  error?: string;
}

/**
 * PromptOutput component props for displaying refinement results
 */
export interface PromptOutputProps {
  /** The current prompt refinement session */
  session: PromptRefinementSession;
  /** Handler called when user copies the refined prompt */
  onCopyRefined: (text: string) => void;
  /** Handler called when user wants to start a new session */
  onStartNewSession: () => void;
  /** Whether to show original vs refined comparison */
  showComparison?: boolean;
}

/**
 * AnalysisPanel component props for displaying prompt analysis results
 */
export interface AnalysisPanelProps {
  /** Array of analysis results to display */
  analyses: PromptAnalysis[];
  /** Handler called when an analysis item is selected */
  onAnalysisSelect?: (analysis: PromptAnalysis) => void;
  /** Whether to show a compact view of the analysis */
  compact?: boolean;
}

/**
 * EducationPanel component props for displaying educational content
 */
export interface EducationPanelProps {
  /** Educational tips to display */
  tips: EducationTip[];
  /** Category filter for tips */
  category?: EducationCategory;
  /** Handler called when user expands a tip for more details */
  onTipExpand?: (tip: EducationTip) => void;
  /** User's current learning level for content filtering */
  userLevel: 'beginner' | 'intermediate' | 'advanced';
}

/**
 * ImprovementsList component props for displaying suggested improvements
 */
export interface ImprovementsListProps {
  /** List of improvements to display */
  improvements: PromptImprovement[];
  /** Handler called when user toggles an improvement on/off */
  onImprovementToggle?: (improvement: PromptImprovement) => void;
  /** Whether to show detailed rationale for each improvement */
  showRationale?: boolean;
}

/**
 * ErrorBoundary component props for handling React errors
 */
export interface ErrorBoundaryProps {
  /** Fallback component to render when an error occurs */
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  /** Handler called when an error is caught */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /** Child components to wrap with error boundary */
  children: React.ReactNode;
}

// ============================================
// Event Handler Interface Contracts
// ============================================

/**
 * Event handlers for the refinement workflow
 */
export interface RefinementEventHandlers {
  /** Handler for when a prompt is submitted for analysis */
  onPromptSubmit: (prompt: string) => Promise<void>;
  /** Handler for when prompt analysis is complete */
  onAnalysisComplete: (session: PromptRefinementSession) => void;
  /** Handler for when prompt refinement is complete */
  onRefinementComplete: (session: PromptRefinementSession) => void;
  /** Handler for when an error occurs during refinement */
  onError: (error: RefinementError) => void;
  /** Handler for when the session is reset */
  onSessionReset: () => void;
}

/**
 * Event handlers for user preference changes
 */
export interface PreferenceEventHandlers {
  /** Handler for theme changes */
  onThemeChange: (theme: 'light' | 'dark') => void;
  /** Handler for toggling educational content */
  onEducationToggle: (enabled: boolean) => void;
  /** Handler for changing user experience level */
  onLevelChange: (level: 'beginner' | 'intermediate' | 'advanced') => void;
}