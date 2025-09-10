/**
 * Unit Tests for PromptAnalyzer Service
 * 
 * RED PHASE: These tests are written FIRST and will FAIL until implementation exists.
 * They define the expected behavior of the PromptAnalyzer service before any code is written.
 * 
 * Tests validate the PromptAnalyzerContract interface from types/services.ts
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PromptAnalyzerContract } from '../types/services';

// Import the service implementation (this will fail initially - that's intentional!)
import { PromptAnalyzer } from './PromptAnalyzer';

describe('PromptAnalyzer Service', () => {
  let promptAnalyzer: PromptAnalyzerContract;

  beforeEach(() => {
    // This will fail initially since PromptAnalyzer doesn't exist yet
    promptAnalyzer = new PromptAnalyzer();
  });

  describe('analyzePrompt method', () => {
    it('should analyze a simple valid prompt and return analysis results', async () => {
      const testPrompt = "Write a blog post about AI";
      
      const results = await promptAnalyzer.analyzePrompt(testPrompt);
      
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      
      // Validate structure of first analysis result
      const firstResult = results[0];
      expect(firstResult).toHaveProperty('id');
      expect(firstResult).toHaveProperty('type');
      expect(firstResult).toHaveProperty('issue');
      expect(firstResult).toHaveProperty('severity');
      expect(firstResult).toHaveProperty('suggestion');
      expect(typeof firstResult.id).toBe('string');
      expect(['vagueness', 'missing_context', 'unclear_constraints', 'poor_structure', 'tone_inconsistency', 'missing_examples']).toContain(firstResult.type);
      expect(['low', 'medium', 'high']).toContain(firstResult.severity);
    });

    it('should identify vagueness issues in overly general prompts', async () => {
      const vaguePrompt = "Do something";
      
      const results = await promptAnalyzer.analyzePrompt(vaguePrompt);
      
      expect(results).toBeDefined();
      const vaguenessIssues = results.filter(r => r.type === 'vagueness');
      expect(vaguenessIssues.length).toBeGreaterThan(0);
      expect(vaguenessIssues[0].severity).toBe('high');
    });

    it('should identify missing context issues', async () => {
      const contextlessPrompt = "Fix this code";
      
      const results = await promptAnalyzer.analyzePrompt(contextlessPrompt);
      
      expect(results).toBeDefined();
      const contextIssues = results.filter(r => r.type === 'missing_context');
      expect(contextIssues.length).toBeGreaterThan(0);
    });

    it('should identify poor structure issues', async () => {
      const poorlyStructuredPrompt = "write me a thing that does stuff and also make it good and fast and efficient and user-friendly and modern";
      
      const results = await promptAnalyzer.analyzePrompt(poorlyStructuredPrompt);
      
      expect(results).toBeDefined();
      const structureIssues = results.filter(r => r.type === 'poor_structure');
      expect(structureIssues.length).toBeGreaterThan(0);
    });

    it('should handle empty prompts gracefully', async () => {
      const emptyPrompt = "";
      
      const results = await promptAnalyzer.analyzePrompt(emptyPrompt);
      
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.type === 'vagueness')).toBe(true);
      expect(results.some(r => r.severity === 'high')).toBe(true);
    });

    it('should handle very long prompts', async () => {
      const longPrompt = "A".repeat(5000);
      
      const results = await promptAnalyzer.analyzePrompt(longPrompt);
      
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      // Long prompts might have structure or clarity issues
      expect(results.length).toBeGreaterThan(0);
    });

    it('should handle prompts with special characters and unicode', async () => {
      const specialPrompt = "Write a story about émojis 🚀 and spëcial characters @#$%";
      
      const results = await promptAnalyzer.analyzePrompt(specialPrompt);
      
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      // Should not crash and should return some analysis
    });

    it('should include position data when available', async () => {
      const testPrompt = "Write a blog post about AI technology";
      
      const results = await promptAnalyzer.analyzePrompt(testPrompt);
      
      expect(results).toBeDefined();
      // At least some results should include position data
      const resultsWithPosition = results.filter(r => r.position);
      if (resultsWithPosition.length > 0) {
        const positionResult = resultsWithPosition[0];
        expect(positionResult.position).toHaveProperty('start');
        expect(positionResult.position).toHaveProperty('end');
        expect(typeof positionResult.position!.start).toBe('number');
        expect(typeof positionResult.position!.end).toBe('number');
        expect(positionResult.position!.start).toBeLessThanOrEqual(positionResult.position!.end);
      }
    });

    it('should return results within reasonable time', async () => {
      const testPrompt = "Create a comprehensive marketing strategy for a new product launch";
      const startTime = performance.now();
      
      const results = await promptAnalyzer.analyzePrompt(testPrompt);
      
      const endTime = performance.now();
      const analysisTime = endTime - startTime;
      
      expect(results).toBeDefined();
      expect(analysisTime).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });

  describe('identifyIssues method', () => {
    it('should quickly identify issues in a prompt without detailed analysis', () => {
      const testPrompt = "Do something";
      
      const issues = promptAnalyzer.identifyIssues(testPrompt);
      
      expect(issues).toBeDefined();
      expect(Array.isArray(issues)).toBe(true);
      expect(issues.length).toBeGreaterThan(0);
      
      // Validate structure of first issue
      const firstIssue = issues[0];
      expect(firstIssue).toHaveProperty('type');
      expect(firstIssue).toHaveProperty('severity');
      expect(firstIssue).toHaveProperty('message');
      expect(['vagueness', 'missing_context', 'unclear_constraints', 'poor_structure', 'tone_inconsistency', 'missing_examples']).toContain(firstIssue.type);
      expect(['low', 'medium', 'high']).toContain(firstIssue.severity);
      expect(typeof firstIssue.message).toBe('string');
    });

    it('should identify multiple issue types in complex prompts', () => {
      const complexPrompt = "make something good";
      
      const issues = promptAnalyzer.identifyIssues(complexPrompt);
      
      expect(issues).toBeDefined();
      expect(issues.length).toBeGreaterThan(1);
      
      // Should identify both vagueness and missing context
      const issueTypes = issues.map(issue => issue.type);
      expect(issueTypes).toContain('vagueness');
      expect(issueTypes).toContain('missing_context');
    });

    it('should handle empty prompts', () => {
      const emptyPrompt = "";
      
      const issues = promptAnalyzer.identifyIssues(emptyPrompt);
      
      expect(issues).toBeDefined();
      expect(Array.isArray(issues)).toBe(true);
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].severity).toBe('high');
    });

    it('should handle whitespace-only prompts', () => {
      const whitespacePrompt = "   \n\t  ";
      
      const issues = promptAnalyzer.identifyIssues(whitespacePrompt);
      
      expect(issues).toBeDefined();
      expect(issues.length).toBeGreaterThan(0);
      expect(issues.some(issue => issue.type === 'vagueness')).toBe(true);
    });

    it('should include position data when issues are location-specific', () => {
      const testPrompt = "Write a blog post but make it good somehow";
      
      const issues = promptAnalyzer.identifyIssues(testPrompt);
      
      expect(issues).toBeDefined();
      const issuesWithPosition = issues.filter(issue => issue.position);
      // Some issues should have position data for specific problematic text
      if (issuesWithPosition.length > 0) {
        const positionIssue = issuesWithPosition[0];
        expect(positionIssue.position).toHaveProperty('start');
        expect(positionIssue.position).toHaveProperty('end');
      }
    });

    it('should be faster than detailed analysis', () => {
      const testPrompt = "Create a comprehensive solution for this problem";
      const startTime = performance.now();
      
      const issues = promptAnalyzer.identifyIssues(testPrompt);
      
      const endTime = performance.now();
      const processingTime = endTime - startTime;
      
      expect(issues).toBeDefined();
      expect(processingTime).toBeLessThan(100); // Should be very fast (under 100ms)
    });
  });

  describe('calculateComplexityScore method', () => {
    it('should return a complexity score between 0 and 100 for valid prompts', () => {
      const testPrompt = "Write a detailed analysis of machine learning algorithms";
      
      const score = promptAnalyzer.calculateComplexityScore(testPrompt);
      
      expect(typeof score).toBe('number');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should give higher scores to more complex prompts', () => {
      const simplePrompt = "Hello";
      const complexPrompt = "Create a comprehensive machine learning model that analyzes customer behavior patterns, incorporates real-time data processing, handles edge cases for different user segments, and provides actionable insights with confidence intervals and statistical significance testing";
      
      const simpleScore = promptAnalyzer.calculateComplexityScore(simplePrompt);
      const complexScore = promptAnalyzer.calculateComplexityScore(complexPrompt);
      
      expect(typeof simpleScore).toBe('number');
      expect(typeof complexScore).toBe('number');
      expect(complexScore).toBeGreaterThan(simpleScore);
    });

    it('should handle empty prompts', () => {
      const emptyPrompt = "";
      
      const score = promptAnalyzer.calculateComplexityScore(emptyPrompt);
      
      expect(typeof score).toBe('number');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
      expect(score).toBe(0); // Empty prompt should have zero complexity
    });

    it('should handle single word prompts', () => {
      const singleWord = "Help";
      
      const score = promptAnalyzer.calculateComplexityScore(singleWord);
      
      expect(typeof score).toBe('number');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
      expect(score).toBeLessThan(20); // Single word should be low complexity
    });

    it('should consider prompt length in complexity calculation', () => {
      const shortPrompt = "Write code";
      const mediumPrompt = "Write a Python function that processes user input and returns formatted output";
      const longPrompt = "Write a comprehensive Python application that includes user authentication, data processing, error handling, logging, unit tests, documentation, and deployment scripts";
      
      const shortScore = promptAnalyzer.calculateComplexityScore(shortPrompt);
      const mediumScore = promptAnalyzer.calculateComplexityScore(mediumPrompt);
      const longScore = promptAnalyzer.calculateComplexityScore(longPrompt);
      
      expect(shortScore).toBeLessThan(mediumScore);
      expect(mediumScore).toBeLessThan(longScore);
    });

    it('should consider technical terms and domain-specific language', () => {
      const simplePrompt = "Make a list of colors";
      const technicalPrompt = "Implement a recursive algorithm with memoization for dynamic programming optimization";
      
      const simpleScore = promptAnalyzer.calculateComplexityScore(simplePrompt);
      const technicalScore = promptAnalyzer.calculateComplexityScore(technicalPrompt);
      
      expect(technicalScore).toBeGreaterThan(simpleScore);
    });

    it('should handle special characters and unicode', () => {
      const specialPrompt = "Créate a sölution with émojis 🚀 and spëcial characters @#$%";
      
      const score = promptAnalyzer.calculateComplexityScore(specialPrompt);
      
      expect(typeof score).toBe('number');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should be consistent for identical prompts', () => {
      const testPrompt = "Analyze customer feedback and provide recommendations";
      
      const score1 = promptAnalyzer.calculateComplexityScore(testPrompt);
      const score2 = promptAnalyzer.calculateComplexityScore(testPrompt);
      
      expect(score1).toBe(score2);
    });

    it('should complete calculation quickly', () => {
      const testPrompt = "Create a detailed project plan with milestones, resource allocation, risk assessment, and stakeholder communication strategy";
      const startTime = performance.now();
      
      const score = promptAnalyzer.calculateComplexityScore(testPrompt);
      
      const endTime = performance.now();
      const calculationTime = endTime - startTime;
      
      expect(typeof score).toBe('number');
      expect(calculationTime).toBeLessThan(50); // Should be very fast (under 50ms)
    });
  });

  describe('error handling and edge cases', () => {
    it('should throw meaningful error when initialized incorrectly', () => {
      expect(() => {
        // This tests that proper error handling exists for invalid initialization
        new (PromptAnalyzer as any)(null);
      }).toThrow();
    });

    it('should handle null input gracefully', async () => {
      await expect(async () => {
        await promptAnalyzer.analyzePrompt(null as any);
      }).rejects.toThrow();
      
      expect(() => {
        promptAnalyzer.identifyIssues(null as any);
      }).toThrow();
      
      expect(() => {
        promptAnalyzer.calculateComplexityScore(null as any);
      }).toThrow();
    });

    it('should handle undefined input gracefully', async () => {
      await expect(async () => {
        await promptAnalyzer.analyzePrompt(undefined as any);
      }).rejects.toThrow();
      
      expect(() => {
        promptAnalyzer.identifyIssues(undefined as any);
      }).toThrow();
      
      expect(() => {
        promptAnalyzer.calculateComplexityScore(undefined as any);
      }).toThrow();
    });

    it('should handle extremely long prompts without crashing', async () => {
      const extremelyLongPrompt = "A".repeat(100000);
      
      // Should not crash, but might have reasonable limits
      await expect(async () => {
        await promptAnalyzer.analyzePrompt(extremelyLongPrompt);
      }).not.toThrow();
      
      expect(() => {
        promptAnalyzer.identifyIssues(extremelyLongPrompt);
      }).not.toThrow();
      
      expect(() => {
        promptAnalyzer.calculateComplexityScore(extremelyLongPrompt);
      }).not.toThrow();
    });
  });
});