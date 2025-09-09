/**
 * Component Contracts for FixYourPrompts React Application
 * 
 * This file defines the contracts between React components,
 * including props interfaces and callback signatures.
 */

// ============================================
// Core Service Contracts
// ============================================

/**
 * Contract for the PromptAnalyzer service
 */
export interface PromptAnalyzerContract {
  analyzePrompt(prompt: string): Promise<PromptAnalysis[]>;
  identifyIssues(prompt: string): PromptIssue[];
  calculateComplexityScore(prompt: string): number;
}

/**
 * Contract for the PromptRefiner service
 */
export interface PromptRefinerContract {
  refinePrompt(
    originalPrompt: string, 
    analyses: PromptAnalysis[]
  ): Promise<RefinementResult>;
  
  generateImprovements(
    prompt: string, 
    issues: PromptIssue[]
  ): PromptImprovement[];
  
  applyRefinements(
    originalPrompt: string,
    improvements: PromptImprovement[]
  ): string;
}

/**
 * Contract for the Education Content service
 */
export interface EducationContentContract {
  getRelevantTips(
    prompt: string, 
    analyses: PromptAnalysis[]
  ): EducationTip[];
  
  getAllCategories(): EducationCategory[];
  
  getTipsByCategory(category: EducationCategory): EducationTip[];
}

// ============================================
// React Component Props Contracts
// ============================================

/**
 * Main App component props
 */
export interface AppProps {
  initialTheme?: 'light' | 'dark';
  showWelcome?: boolean;
}

/**
 * PromptInput component props
 */
export interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (prompt: string) => void;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  error?: string;
}

/**
 * PromptOutput component props
 */
export interface PromptOutputProps {
  session: PromptRefinementSession;
  onCopyRefined: (text: string) => void;
  onStartNewSession: () => void;
  showComparison?: boolean;
}

/**
 * AnalysisPanel component props
 */
export interface AnalysisPanelProps {
  analyses: PromptAnalysis[];
  onAnalysisSelect?: (analysis: PromptAnalysis) => void;
  compact?: boolean;
}

/**
 * EducationPanel component props
 */
export interface EducationPanelProps {
  tips: EducationTip[];
  category?: EducationCategory;
  onTipExpand?: (tip: EducationTip) => void;
  userLevel: 'beginner' | 'intermediate' | 'advanced';
}

/**
 * ImprovementsList component props
 */
export interface ImprovementsListProps {
  improvements: PromptImprovement[];
  onImprovementToggle?: (improvement: PromptImprovement) => void;
  showRationale?: boolean;
}

// ============================================
// Event Handler Contracts
// ============================================

/**
 * Contract for refinement workflow events
 */
export interface RefinementEventHandlers {
  onPromptSubmit: (prompt: string) => Promise<void>;
  onAnalysisComplete: (session: PromptRefinementSession) => void;
  onRefinementComplete: (session: PromptRefinementSession) => void;
  onError: (error: RefinementError) => void;
  onSessionReset: () => void;
}

/**
 * Contract for user preference events
 */
export interface PreferenceEventHandlers {
  onThemeChange: (theme: 'light' | 'dark') => void;
  onEducationToggle: (enabled: boolean) => void;
  onLevelChange: (level: 'beginner' | 'intermediate' | 'advanced') => void;
}

// ============================================
// Data Transformation Contracts
// ============================================

/**
 * Contract for session serialization/deserialization
 */
export interface SessionSerializerContract {
  serialize(session: PromptRefinementSession): string;
  deserialize(data: string): PromptRefinementSession;
  validateSession(session: unknown): session is PromptRefinementSession;
}

/**
 * Contract for local storage operations
 */
export interface StorageContract {
  saveSession(session: PromptRefinementSession): void;
  loadSessions(): PromptRefinementSession[];
  clearSessions(): void;
  savePreferences(prefs: UserPreferences): void;
  loadPreferences(): UserPreferences | null;
}

// ============================================
// Testing Contracts
// ============================================

/**
 * Contract for component testing utilities
 */
export interface ComponentTestContract {
  renderWithProviders(component: React.ReactElement): RenderResult;
  mockPromptAnalysis(overrides?: Partial<PromptAnalysis>): PromptAnalysis;
  mockRefinementSession(overrides?: Partial<PromptRefinementSession>): PromptRefinementSession;
  simulateUserInput(element: HTMLElement, text: string): void;
}

// ============================================
// Error Handling Contracts
// ============================================

/**
 * Contract for application errors
 */
export interface RefinementError {
  type: 'analysis' | 'refinement' | 'storage' | 'validation';
  message: string;
  originalPrompt?: string;
  context?: Record<string, unknown>;
  recoverable: boolean;
}

/**
 * Contract for error boundary
 */
export interface ErrorBoundaryProps {
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  children: React.ReactNode;
}

// ============================================
// Performance Monitoring Contracts
// ============================================

/**
 * Contract for performance tracking
 */
export interface PerformanceContract {
  trackAnalysisTime(startTime: number, endTime: number): void;
  trackRefinementTime(startTime: number, endTime: number): void;
  trackComponentRender(componentName: string, renderTime: number): void;
  getPerformanceReport(): PerformanceReport;
}

export interface PerformanceReport {
  averageAnalysisTime: number;
  averageRefinementTime: number;
  slowestComponents: Array<{
    name: string;
    averageRenderTime: number;
  }>;
}