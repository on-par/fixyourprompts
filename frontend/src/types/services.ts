/**
 * Service Contract Interfaces for FixYourPrompts React Application
 * 
 * This file defines the contracts for all service layer components,
 * including analysis, refinement, education, storage, and testing utilities.
 * 
 * Based on component contracts at:
 * specs/001-fixyourprompts-com-is/contracts/component-contracts.ts
 */

import React from 'react';
import {
  PromptRefinementSession,
  PromptAnalysis,
  PromptImprovement,
  EducationTip,
  EducationCategory,
  UserPreferences,
  RefinementResult,
  PromptIssue,
  PerformanceReport,
} from './core';

// ============================================
// Core Service Contracts
// ============================================

/**
 * Contract for the PromptAnalyzer service
 * Responsible for analyzing prompts and identifying issues
 */
export interface PromptAnalyzerContract {
  /**
   * Analyzes a prompt and returns detailed analysis results
   * @param prompt - The prompt text to analyze
   * @returns Promise resolving to array of analysis results
   */
  analyzePrompt(prompt: string): Promise<PromptAnalysis[]>;

  /**
   * Quickly identifies issues in a prompt without detailed analysis
   * @param prompt - The prompt text to check
   * @returns Array of identified issues
   */
  identifyIssues(prompt: string): PromptIssue[];

  /**
   * Calculates a complexity score for the prompt
   * @param prompt - The prompt text to score
   * @returns Complexity score (0-100)
   */
  calculateComplexityScore(prompt: string): number;
}

/**
 * Contract for the PromptRefiner service
 * Responsible for improving prompts based on analysis results
 */
export interface PromptRefinerContract {
  /**
   * Refines a prompt based on analysis results
   * @param originalPrompt - The original prompt text
   * @param analyses - Analysis results to address
   * @returns Promise resolving to refinement result
   */
  refinePrompt(
    originalPrompt: string, 
    analyses: PromptAnalysis[]
  ): Promise<RefinementResult>;
  
  /**
   * Generates specific improvements for identified issues
   * @param prompt - The prompt text to improve
   * @param issues - Issues to address
   * @returns Array of suggested improvements
   */
  generateImprovements(
    prompt: string, 
    issues: PromptIssue[]
  ): PromptImprovement[];
  
  /**
   * Applies a set of improvements to the original prompt
   * @param originalPrompt - The original prompt text
   * @param improvements - Improvements to apply
   * @returns The refined prompt text
   */
  applyRefinements(
    originalPrompt: string,
    improvements: PromptImprovement[]
  ): string;
}

/**
 * Contract for the Education Content service
 * Responsible for providing contextual learning tips and content
 */
export interface EducationContentContract {
  /**
   * Gets education tips relevant to the current prompt and analysis
   * @param prompt - The prompt being analyzed
   * @param analyses - Current analysis results
   * @returns Array of relevant education tips
   */
  getRelevantTips(
    prompt: string, 
    analyses: PromptAnalysis[]
  ): EducationTip[];
  
  /**
   * Gets all available education categories
   * @returns Array of all education categories
   */
  getAllCategories(): EducationCategory[];
  
  /**
   * Gets all tips for a specific category
   * @param category - The education category to filter by
   * @returns Array of tips in the specified category
   */
  getTipsByCategory(category: EducationCategory): EducationTip[];
}

// ============================================
// Data Management Service Contracts
// ============================================

/**
 * Contract for session serialization/deserialization
 * Handles converting sessions to/from storage formats
 */
export interface SessionSerializerContract {
  /**
   * Serializes a session to a string format for storage
   * @param session - The session to serialize
   * @returns Serialized session data
   */
  serialize(session: PromptRefinementSession): string;

  /**
   * Deserializes session data from storage format
   * @param data - Serialized session data
   * @returns Deserialized session object
   */
  deserialize(data: string): PromptRefinementSession;

  /**
   * Validates that an object is a valid session
   * @param session - Object to validate
   * @returns Type guard confirming session validity
   */
  validateSession(session: unknown): session is PromptRefinementSession;
}

/**
 * Contract for local storage operations
 * Handles persistence of sessions and user preferences
 */
export interface StorageContract {
  /**
   * Saves a session to local storage
   * @param session - The session to save
   */
  saveSession(session: PromptRefinementSession): void;

  /**
   * Loads all saved sessions from local storage
   * @returns Array of saved sessions
   */
  loadSessions(): PromptRefinementSession[];

  /**
   * Clears all saved sessions from local storage
   */
  clearSessions(): void;

  /**
   * Saves user preferences to local storage
   * @param prefs - User preferences to save
   */
  savePreferences(prefs: UserPreferences): void;

  /**
   * Loads user preferences from local storage
   * @returns User preferences or null if none saved
   */
  loadPreferences(): UserPreferences | null;
}

// ============================================
// Performance Monitoring Contract
// ============================================

/**
 * Contract for performance tracking and monitoring
 * Collects timing data and performance metrics
 */
export interface PerformanceContract {
  /**
   * Records analysis operation timing
   * @param startTime - Analysis start timestamp
   * @param endTime - Analysis end timestamp
   */
  trackAnalysisTime(startTime: number, endTime: number): void;

  /**
   * Records refinement operation timing
   * @param startTime - Refinement start timestamp
   * @param endTime - Refinement end timestamp
   */
  trackRefinementTime(startTime: number, endTime: number): void;

  /**
   * Records component render timing
   * @param componentName - Name of the component
   * @param renderTime - Time taken to render in milliseconds
   */
  trackComponentRender(componentName: string, renderTime: number): void;

  /**
   * Generates a performance report with collected metrics
   * @returns Comprehensive performance report
   */
  getPerformanceReport(): PerformanceReport;
}

// ============================================
// Testing Utilities Contract
// ============================================

/**
 * Contract for component testing utilities
 * Provides helpers for testing React components
 */
export interface ComponentTestContract {
  /**
   * Renders a component with all necessary providers
   * @param component - React element to render
   * @returns Render result from testing library
   */
  renderWithProviders(component: React.ReactElement): {
    container: HTMLElement;
    rerender: (ui: React.ReactElement) => void;
    unmount: () => void;
  };

  /**
   * Creates a mock prompt analysis for testing
   * @param overrides - Optional property overrides
   * @returns Mock PromptAnalysis object
   */
  mockPromptAnalysis(overrides?: Partial<PromptAnalysis>): PromptAnalysis;

  /**
   * Creates a mock refinement session for testing
   * @param overrides - Optional property overrides
   * @returns Mock PromptRefinementSession object
   */
  mockRefinementSession(overrides?: Partial<PromptRefinementSession>): PromptRefinementSession;

  /**
   * Simulates user input on an element
   * @param element - DOM element to interact with
   * @param text - Text to input
   */
  simulateUserInput(element: HTMLElement, text: string): void;
}

// ============================================
// API Key Management Types
// ============================================

/**
 * Supported AI providers for API keys
 */
export type ProviderType = 'openai' | 'anthropic' | 'openrouter';

/**
 * API key record structure
 */
export interface ApiKeyRecord {
  id: number;
  userId: string;
  provider: ProviderType;
  maskedKey: string;
  isValid: boolean;
  lastValidatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * API key validation result
 */
export interface ValidationResult {
  valid: boolean;
  message: string;
}

/**
 * Request types for API key operations
 */
export interface StoreApiKeyRequest {
  provider: ProviderType;
  key: string;
}

export interface UpdateApiKeyRequest {
  key: string;
}

export interface ValidateApiKeyRequest {
  provider: ProviderType;
  key: string;
}

/**
 * Contract for the API Key service
 * Handles user-provided API keys for AI providers
 */
export interface ApiKeyServiceContract {
  /**
   * Stores a new API key for a provider
   * @param request - Store request containing provider and key
   * @returns Promise resolving to the stored key record
   */
  storeApiKey(request: StoreApiKeyRequest): Promise<ApiKeyRecord>;

  /**
   * Lists all API keys for the current user
   * @returns Promise resolving to array of key records
   */
  listApiKeys(): Promise<ApiKeyRecord[]>;

  /**
   * Updates an existing API key for a provider
   * @param provider - The provider to update
   * @param request - Update request containing new key
   * @returns Promise resolving to the updated key record
   */
  updateApiKey(provider: ProviderType, request: UpdateApiKeyRequest): Promise<ApiKeyRecord>;

  /**
   * Deletes an API key for a provider
   * @param provider - The provider to delete
   * @returns Promise resolving when deletion is complete
   */
  deleteApiKey(provider: ProviderType): Promise<void>;

  /**
   * Validates an API key without storing it
   * @param request - Validation request containing provider and key
   * @returns Promise resolving to validation result
   */
  validateApiKey(request: ValidateApiKeyRequest): Promise<ValidationResult>;

  /**
   * Gets the decrypted API key for a provider (used internally by prompt service)
   * @param provider - The provider to get key for
   * @returns Promise resolving to the decrypted key or null
   */
  getDecryptedKey(provider: ProviderType): Promise<string | null>;
}

// ============================================
// Re-export Core Types for Convenience
// ============================================

// Re-export commonly used types for convenience
export type {
  PromptRefinementSession,
  PromptAnalysis,
  PromptImprovement,
  EducationTip,
  EducationCategory,
  UserPreferences,
  RefinementResult,
  PromptIssue,
  PerformanceReport,
} from './core';