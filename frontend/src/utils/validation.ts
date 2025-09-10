/**
 * Validation schemas and functions for the FixYourPrompts application
 * Provides comprehensive validation for all data types and user inputs
 */

import {
  PromptRefinementSession,
  PromptAnalysis,
  PromptImprovement,
  EducationTip,
  RefinementStatus,
  AnalysisType,
  ImprovementType,
  EducationCategory
} from '../types/core';

// Validation Constants
export const MIN_PROMPT_LENGTH = 1;
export const MAX_PROMPT_LENGTH = 4096;
export const MIN_RELEVANCE_SCORE = 0;
export const MAX_RELEVANCE_SCORE = 1;

// Validation Result Types
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export type ValidationErrors = {
  [field: string]: string;
};

// UUID v4 Regex Pattern
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validates prompt input text
 * @param prompt - The prompt text to validate
 * @returns ValidationResult with success status and optional error message
 * @example
 * ```typescript
 * const result = validatePromptInput("Tell me about cats");
 * if (result.valid) {
 *   // Process valid prompt
 * } else {
 *   console.error(result.error);
 * }
 * ```
 */
export function validatePromptInput(prompt: string): ValidationResult {
  if (typeof prompt !== 'string') {
    return { valid: false, error: 'Prompt must be a string' };
  }

  const trimmedPrompt = prompt.trim();
  
  if (trimmedPrompt.length < MIN_PROMPT_LENGTH) {
    return { valid: false, error: `Prompt must be at least ${MIN_PROMPT_LENGTH} character(s) long` };
  }

  if (trimmedPrompt.length > MAX_PROMPT_LENGTH) {
    return { valid: false, error: `Prompt must not exceed ${MAX_PROMPT_LENGTH} characters` };
  }

  return { valid: true };
}

/**
 * Validates prompt length against specified bounds
 * @param prompt - The prompt text to validate
 * @param minLength - Minimum allowed length
 * @param maxLength - Maximum allowed length
 * @returns true if length is within bounds, false otherwise
 * @example
 * ```typescript
 * const isValid = validatePromptLength("Hello world", 1, 100);
 * // Returns: true
 * ```
 */
export function validatePromptLength(prompt: string, minLength: number, maxLength: number): boolean {
  if (typeof prompt !== 'string') {return false;}
  const length = prompt.trim().length;
  return length >= minLength && length <= maxLength;
}

/**
 * Validates UUID v4 format
 * @param id - The UUID string to validate
 * @returns true if valid UUID v4, false otherwise
 * @example
 * ```typescript
 * const isValid = validateUUID("550e8400-e29b-41d4-a716-446655440000");
 * // Returns: true
 * ```
 */
export function validateUUID(id: string): boolean {
  if (typeof id !== 'string') {return false;}
  return UUID_V4_REGEX.test(id);
}

/**
 * Validates relevance score within allowed range
 * @param score - The relevance score to validate (0-1)
 * @returns true if score is within valid range, false otherwise
 * @example
 * ```typescript
 * const isValid = validateRelevanceScore(0.75);
 * // Returns: true
 * ```
 */
export function validateRelevanceScore(score: number): boolean {
  if (typeof score !== 'number' || isNaN(score)) {return false;}
  return score >= MIN_RELEVANCE_SCORE && score <= MAX_RELEVANCE_SCORE;
}

/**
 * Validates a complete PromptRefinementSession object
 * @param session - Unknown value that should be a PromptRefinementSession
 * @returns true if valid session, false otherwise
 * @example
 * ```typescript
 * const sessionData = JSON.parse(localStorage.getItem('session'));
 * if (validateSession(sessionData)) {
 *   // Safe to use as PromptRefinementSession
 * }
 * ```
 */
export function validateSession(session: unknown): session is PromptRefinementSession {
  if (!session || typeof session !== 'object') {return false;}
  
  const s = session as Record<string, unknown>;

  // Validate required string fields
  if (!validateUUID(s.id)) {return false;}
  if (typeof s.originalPrompt !== 'string') {return false;}
  if (!validatePromptInput(s.originalPrompt).valid) {return false;}
  
  // Validate refinedPrompt (can be null or string)
  if (s.refinedPrompt !== null && typeof s.refinedPrompt !== 'string') {return false;}
  
  // Validate createdAt as Date
  if (!(s.createdAt instanceof Date) && !isValidDateString(s.createdAt)) {return false;}
  
  // Validate status
  if (!isValidRefinementStatus(s.status)) {return false;}
  
  // Validate arrays
  if (!Array.isArray(s.analysisResults) || !s.analysisResults.every(isPromptAnalysis)) {return false;}
  if (!Array.isArray(s.improvements) || !s.improvements.every(isPromptImprovement)) {return false;}
  if (!Array.isArray(s.educationTips) || !s.educationTips.every(isEducationTip)) {return false;}

  return true;
}

// Type Guards for Runtime Type Checking

/**
 * Type guard to check if a value is a valid PromptAnalysis
 * @param value - Unknown value to check
 * @returns true if value is PromptAnalysis, false otherwise
 */
export function isPromptAnalysis(value: unknown): value is PromptAnalysis {
  if (!value || typeof value !== 'object') {return false;}
  
  const analysis = value as Record<string, unknown>;
  
  return (
    validateUUID(analysis.id) &&
    isValidAnalysisType(analysis.type) &&
    typeof analysis.issue === 'string' &&
    isValidSeverity(analysis.severity) &&
    typeof analysis.suggestion === 'string' &&
    (analysis.originalText === undefined || typeof analysis.originalText === 'string') &&
    (analysis.position === undefined || isValidPosition(analysis.position))
  );
}

/**
 * Type guard to check if a value is a valid PromptImprovement
 * @param value - Unknown value to check
 * @returns true if value is PromptImprovement, false otherwise
 */
export function isPromptImprovement(value: unknown): value is PromptImprovement {
  if (!value || typeof value !== 'object') {return false;}
  
  const improvement = value as Record<string, unknown>;
  
  return (
    validateUUID(improvement.id) &&
    isValidImprovementType(improvement.type) &&
    typeof improvement.description === 'string' &&
    typeof improvement.before === 'string' &&
    typeof improvement.after === 'string' &&
    typeof improvement.rationale === 'string'
  );
}

/**
 * Type guard to check if a value is a valid EducationTip
 * @param value - Unknown value to check
 * @returns true if value is EducationTip, false otherwise
 */
export function isEducationTip(value: unknown): value is EducationTip {
  if (!value || typeof value !== 'object') {return false;}
  
  const tip = value as Record<string, unknown>;
  
  return (
    validateUUID(tip.id) &&
    typeof tip.technique === 'string' &&
    typeof tip.title === 'string' &&
    typeof tip.description === 'string' &&
    typeof tip.example === 'string' &&
    isValidEducationCategory(tip.category) &&
    validateRelevanceScore(tip.relevanceScore)
  );
}

// Helper Functions for Type Validation

function isValidRefinementStatus(value: unknown): value is RefinementStatus {
  return typeof value === 'string' && 
    ['draft', 'analyzing', 'refined', 'error'].includes(value);
}

function isValidAnalysisType(value: unknown): value is AnalysisType {
  return typeof value === 'string' && 
    ['vagueness', 'missing_context', 'unclear_constraints', 'poor_structure', 'tone_inconsistency', 'missing_examples'].includes(value);
}

function isValidImprovementType(value: unknown): value is ImprovementType {
  return typeof value === 'string' && 
    ['context_added', 'constraints_clarified', 'structure_improved', 'examples_added', 'tone_adjusted', 'specificity_increased'].includes(value);
}

function isValidEducationCategory(value: unknown): value is EducationCategory {
  return typeof value === 'string' && 
    ['fundamentals', 'advanced_techniques', 'domain_specific', 'troubleshooting', 'best_practices'].includes(value);
}

function isValidSeverity(value: unknown): value is 'low' | 'medium' | 'high' {
  return typeof value === 'string' && ['low', 'medium', 'high'].includes(value);
}

function isValidPosition(value: unknown): value is { start: number; end: number } {
  if (!value || typeof value !== 'object') {return false;}
  const pos = value as Record<string, unknown>;
  return typeof pos.start === 'number' && 
         typeof pos.end === 'number' && 
         pos.start >= 0 && 
         pos.end >= pos.start;
}

function isValidDateString(value: unknown): boolean {
  if (typeof value !== 'string') {return false;}
  const date = new Date(value);
  return !isNaN(date.getTime());
}

// Additional Validation Utilities

/**
 * Creates a ValidationErrors object for form validation
 * @param errors - Object with field names as keys and error messages as values
 * @returns ValidationErrors object
 */
export function createValidationErrors(errors: Record<string, string>): ValidationErrors {
  return errors;
}

/**
 * Checks if ValidationErrors object has any errors
 * @param errors - ValidationErrors object to check
 * @returns true if there are any validation errors, false otherwise
 */
export function hasValidationErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}