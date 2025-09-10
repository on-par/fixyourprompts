/**
 * Core type definitions for FixYourPrompts React Application
 * 
 * Based on the data model specification at:
 * specs/001-fixyourprompts-com-is/data-model.md
 */

// ============================================
// Main Session and Analysis Types
// ============================================

export interface PromptRefinementSession {
  id: string; // UUID v4 generated client-side
  createdAt: Date; // Session creation timestamp
  originalPrompt: string; // User's initial input (max 4096 chars)
  refinedPrompt: string | null; // Generated refined version
  analysisResults: PromptAnalysis[]; // Array of analysis findings
  improvements: PromptImprovement[]; // Specific improvements made
  educationTips: EducationTip[]; // Contextual learning content
  status: RefinementStatus; // Current session state
}

export interface PromptAnalysis {
  id: string;
  type: AnalysisType;
  issue: string; // Description of the problem found
  severity: 'low' | 'medium' | 'high';
  suggestion: string; // How to improve this aspect
  originalText?: string; // Specific text that triggered this analysis
  position?: { start: number; end: number }; // Character positions
}

export interface PromptImprovement {
  id: string;
  type: ImprovementType;
  description: string; // What was changed
  before: string; // Original text
  after: string; // Improved text
  rationale: string; // Why this improvement helps
}

export interface EducationTip {
  id: string;
  technique: string; // e.g., "Reverse Prompting", "Context Setting"
  title: string;
  description: string;
  example: string;
  category: EducationCategory;
  relevanceScore: number; // 0-1, how relevant to current prompt
}

// ============================================
// Additional Service-Related Types
// ============================================

/**
 * Result of a prompt refinement operation
 */
export interface RefinementResult {
  refinedPrompt: string;
  improvements: PromptImprovement[];
  confidenceScore: number; // 0-1, how confident the system is in the refinement
  processingTime: number; // Time taken in milliseconds
}

/**
 * Simplified issue representation for quick analysis
 */
export interface PromptIssue {
  type: AnalysisType;
  severity: 'low' | 'medium' | 'high';
  message: string;
  position?: { start: number; end: number };
}

/**
 * Performance monitoring data
 */
export interface PerformanceReport {
  averageAnalysisTime: number;
  averageRefinementTime: number;
  slowestComponents: Array<{
    name: string;
    averageRenderTime: number;
  }>;
}

// ============================================
// Enums and Union Types
// ============================================

export type RefinementStatus = 
  | 'draft' // User is entering prompt
  | 'analyzing' // System is analyzing the prompt
  | 'refined' // Refinement complete
  | 'error'; // Processing error occurred

export type AnalysisType = 
  | 'vagueness' // Prompt lacks specificity
  | 'missing_context' // Needs more background info
  | 'unclear_constraints' // Missing limitations or requirements
  | 'poor_structure' // Formatting and organization issues
  | 'tone_inconsistency' // Mixed or unclear tone
  | 'missing_examples'; // Would benefit from examples

export type ImprovementType = 
  | 'context_added' // Added background context
  | 'constraints_clarified' // Added specific limitations
  | 'structure_improved' // Better organization
  | 'examples_added' // Included examples
  | 'tone_adjusted' // Made tone more consistent
  | 'specificity_increased'; // Made more specific

export type EducationCategory = 
  | 'fundamentals' // Basic prompting principles
  | 'advanced_techniques' // Complex methods like reverse prompting
  | 'domain_specific' // Specialized use cases
  | 'troubleshooting' // Common problems and solutions
  | 'best_practices'; // General guidelines

// ============================================
// Application State Types
// ============================================

// Main application state interface
export interface AppState {
  currentSession: PromptRefinementSession | null;
  sessionHistory: PromptRefinementSession[]; // Stored in localStorage
  educationContentLibrary: EducationTip[]; // Static content
  userPreferences: UserPreferences;
}

export interface UserPreferences {
  showEducationTips: boolean;
  preferredComplexityLevel: 'beginner' | 'intermediate' | 'advanced';
  darkMode: boolean;
}

// ============================================
// Error Types
// ============================================

export interface RefinementError {
  type: 'analysis' | 'refinement' | 'storage' | 'validation';
  message: string;
  originalPrompt?: string;
  context?: Record<string, unknown>;
  recoverable: boolean;
}