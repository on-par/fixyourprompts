# Phase 1: Data Model

This document defines the TypeScript interfaces and data structures for the FixYourPrompts client-side application.

## TypeScript Interface Definitions

### 1. PromptRefinementSession

Represents a complete prompt refinement session in the React application state.

```typescript
interface PromptRefinementSession {
  id: string; // UUID v4 generated client-side
  createdAt: Date; // Session creation timestamp
  originalPrompt: string; // User's initial input (max 4096 chars)
  refinedPrompt: string | null; // Generated refined version
  analysisResults: PromptAnalysis[]; // Array of analysis findings
  improvements: PromptImprovement[]; // Specific improvements made
  educationTips: EducationTip[]; // Contextual learning content
  status: RefinementStatus; // Current session state
}
```

### 2. PromptAnalysis

Represents analysis findings for a specific aspect of the prompt.

```typescript
interface PromptAnalysis {
  id: string;
  type: AnalysisType;
  issue: string; // Description of the problem found
  severity: 'low' | 'medium' | 'high';
  suggestion: string; // How to improve this aspect
  originalText?: string; // Specific text that triggered this analysis
  position?: { start: number; end: number }; // Character positions
}
```

### 3. PromptImprovement

Represents a specific improvement made to the prompt.

```typescript
interface PromptImprovement {
  id: string;
  type: ImprovementType;
  description: string; // What was changed
  before: string; // Original text
  after: string; // Improved text
  rationale: string; // Why this improvement helps
}
```

### 4. EducationTip

Contextual educational content shown during refinement.

```typescript
interface EducationTip {
  id: string;
  technique: string; // e.g., "Reverse Prompting", "Context Setting"
  title: string;
  description: string;
  example: string;
  category: EducationCategory;
  relevanceScore: number; // 0-1, how relevant to current prompt
}
```

## Supporting Types and Enums

### Status and Category Enums

```typescript
type RefinementStatus = 
  | 'draft' // User is entering prompt
  | 'analyzing' // System is analyzing the prompt
  | 'refined' // Refinement complete
  | 'error'; // Processing error occurred

type AnalysisType = 
  | 'vagueness' // Prompt lacks specificity
  | 'missing_context' // Needs more background info
  | 'unclear_constraints' // Missing limitations or requirements
  | 'poor_structure' // Formatting and organization issues
  | 'tone_inconsistency' // Mixed or unclear tone
  | 'missing_examples'; // Would benefit from examples

type ImprovementType = 
  | 'context_added' // Added background context
  | 'constraints_clarified' // Added specific limitations
  | 'structure_improved' // Better organization
  | 'examples_added' // Included examples
  | 'tone_adjusted' // Made tone more consistent
  | 'specificity_increased'; // Made more specific

type EducationCategory = 
  | 'fundamentals' // Basic prompting principles
  | 'advanced_techniques' // Complex methods like reverse prompting
  | 'domain_specific' // Specialized use cases
  | 'troubleshooting' // Common problems and solutions
  | 'best_practices'; // General guidelines
```

## React Component Props

### Main Application State

```typescript
interface AppState {
  currentSession: PromptRefinementSession | null;
  sessionHistory: PromptRefinementSession[]; // Stored in localStorage
  educationContentLibrary: EducationTip[]; // Static content
  userPreferences: UserPreferences;
}

interface UserPreferences {
  showEducationTips: boolean;
  preferredComplexityLevel: 'beginner' | 'intermediate' | 'advanced';
  darkMode: boolean;
}
```

## Data Validation Rules

- `originalPrompt`: 1-4096 characters, required
- `refinedPrompt`: Generated content, no length limit initially
- All IDs: UUID v4 format
- `createdAt`: ISO 8601 timestamp
- `severity`: Must be one of the defined literal types
- `relevanceScore`: Number between 0 and 1 inclusive

## Client-Side Storage Strategy

- **Session State**: React state + Context API
- **Persistence**: localStorage for session history (optional, user privacy focused)
- **Education Content**: Static JSON files bundled with application
- **No server-side storage** required for MVP

## Relationships

- Each `PromptRefinementSession` contains arrays of related analysis, improvements, and tips
- No database relationships needed - everything is contained within the session object
- Education tips are matched to sessions via relevance scoring algorithm
