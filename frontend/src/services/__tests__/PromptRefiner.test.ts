/**
 * Unit Tests for PromptRefiner Service
 * 
 * RED PHASE: These tests are intentionally FAILING and serve as specifications
 * for the PromptRefiner service implementation. They define expected behavior
 * before any implementation exists.
 * 
 * Test Framework: Vitest
 * Test Environment: jsdom
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { 
  PromptRefinerContract,
  PromptAnalysis,
  PromptImprovement,
  RefinementResult,
  PromptIssue,
  AnalysisType,
  ImprovementType
} from '../../types/services';

// This import will FAIL until the PromptRefiner service is implemented
// This is intentional for TDD RED phase
import { PromptRefiner } from '../PromptRefiner';

describe('PromptRefiner Service', () => {
  let promptRefiner: PromptRefinerContract;

  beforeEach(() => {
    // This will FAIL until the service is implemented
    promptRefiner = new PromptRefiner();
  });

  describe('refinePrompt method', () => {
    it('should successfully refine a prompt with vagueness analysis', async () => {
      // Arrange
      const originalPrompt = "Write something good";
      const analyses: PromptAnalysis[] = [
        {
          id: 'analysis-1',
          type: 'vagueness',
          issue: 'Prompt lacks specificity about what to write',
          severity: 'high',
          suggestion: 'Specify the type of content, length, and purpose',
          originalText: 'something good',
          position: { start: 6, end: 20 }
        }
      ];

      // Act
      const result = await promptRefiner.refinePrompt(originalPrompt, analyses);

      // Assert
      expect(result).toBeDefined();
      expect(result.refinedPrompt).toBeTruthy();
      expect(result.refinedPrompt).not.toBe(originalPrompt);
      expect(result.improvements).toHaveLength(1);
      expect(result.confidenceScore).toBeGreaterThan(0);
      expect(result.confidenceScore).toBeLessThanOrEqual(1);
      expect(result.processingTime).toBeGreaterThan(0);
    });

    it('should handle multiple analysis types in refinement', async () => {
      // Arrange
      const originalPrompt = "Do AI stuff";
      const analyses: PromptAnalysis[] = [
        {
          id: 'analysis-1',
          type: 'vagueness',
          issue: 'Extremely vague request',
          severity: 'high',
          suggestion: 'Specify the AI task and expected output'
        },
        {
          id: 'analysis-2',
          type: 'missing_context',
          issue: 'No context about the domain or use case',
          severity: 'medium',
          suggestion: 'Provide background information and context'
        },
        {
          id: 'analysis-3',
          type: 'missing_examples',
          issue: 'No examples provided to clarify expectations',
          severity: 'low',
          suggestion: 'Include specific examples of desired output'
        }
      ];

      // Act
      const result = await promptRefiner.refinePrompt(originalPrompt, analyses);

      // Assert
      expect(result.improvements).toHaveLength(3);
      expect(result.improvements.map(i => i.type)).toContain('specificity_increased');
      expect(result.improvements.map(i => i.type)).toContain('context_added');
      expect(result.improvements.map(i => i.type)).toContain('examples_added');
      expect(result.refinedPrompt.length).toBeGreaterThan(originalPrompt.length);
    });

    it('should return high confidence for well-structured analysis', async () => {
      // Arrange
      const originalPrompt = "Generate text";
      const analyses: PromptAnalysis[] = [
        {
          id: 'analysis-1',
          type: 'unclear_constraints',
          issue: 'No constraints specified',
          severity: 'medium',
          suggestion: 'Add length, format, and style constraints',
          position: { start: 0, end: 13 }
        }
      ];

      // Act
      const result = await promptRefiner.refinePrompt(originalPrompt, analyses);

      // Assert
      expect(result.confidenceScore).toBeGreaterThan(0.7);
    });

    it('should handle empty analyses array gracefully', async () => {
      // Arrange
      const originalPrompt = "Write a detailed technical documentation for a REST API";
      const analyses: PromptAnalysis[] = [];

      // Act
      const result = await promptRefiner.refinePrompt(originalPrompt, analyses);

      // Assert
      expect(result.refinedPrompt).toBe(originalPrompt);
      expect(result.improvements).toHaveLength(0);
      expect(result.confidenceScore).toBe(1.0);
      expect(result.processingTime).toBeGreaterThan(0);
    });

    it('should reject invalid inputs with appropriate errors', async () => {
      // Arrange & Act & Assert
      await expect(
        promptRefiner.refinePrompt("", [])
      ).rejects.toThrow('Original prompt cannot be empty');

      await expect(
        promptRefiner.refinePrompt("Valid prompt", null as any)
      ).rejects.toThrow('Analyses must be an array');
    });

    it('should handle extremely long prompts', async () => {
      // Arrange
      const longPrompt = "A".repeat(4096); // Max length
      const analyses: PromptAnalysis[] = [
        {
          id: 'analysis-1',
          type: 'poor_structure',
          issue: 'Prompt needs better structure',
          severity: 'low',
          suggestion: 'Break into sections with clear headings'
        }
      ];

      // Act
      const result = await promptRefiner.refinePrompt(longPrompt, analyses);

      // Assert
      expect(result.refinedPrompt.length).toBeLessThanOrEqual(4096);
      expect(result.improvements).toHaveLength(1);
    });
  });

  describe('generateImprovements method', () => {
    it('should generate appropriate improvements for vagueness issues', () => {
      // Arrange
      const prompt = "Make it better";
      const issues: PromptIssue[] = [
        {
          type: 'vagueness',
          severity: 'high',
          message: 'Prompt is too vague',
          position: { start: 0, end: 14 }
        }
      ];

      // Act
      const improvements = promptRefiner.generateImprovements(prompt, issues);

      // Assert
      expect(improvements).toHaveLength(1);
      expect(improvements[0].type).toBe('specificity_increased');
      expect(improvements[0].description).toBeTruthy();
      expect(improvements[0].before).toBe(prompt);
      expect(improvements[0].after).not.toBe(prompt);
      expect(improvements[0].rationale).toBeTruthy();
    });

    it('should generate multiple improvements for multiple issues', () => {
      // Arrange
      const prompt = "Do something";
      const issues: PromptIssue[] = [
        {
          type: 'vagueness',
          severity: 'high',
          message: 'Too vague'
        },
        {
          type: 'missing_context',
          severity: 'medium',
          message: 'No context provided'
        },
        {
          type: 'tone_inconsistency',
          severity: 'low',
          message: 'Tone could be more professional'
        }
      ];

      // Act
      const improvements = promptRefiner.generateImprovements(prompt, issues);

      // Assert
      expect(improvements).toHaveLength(3);
      expect(improvements.map(i => i.type)).toContain('specificity_increased');
      expect(improvements.map(i => i.type)).toContain('context_added');
      expect(improvements.map(i => i.type)).toContain('tone_adjusted');
    });

    it('should handle empty issues array', () => {
      // Arrange
      const prompt = "Well-structured prompt with clear instructions";
      const issues: PromptIssue[] = [];

      // Act
      const improvements = promptRefiner.generateImprovements(prompt, issues);

      // Assert
      expect(improvements).toHaveLength(0);
    });

    it('should prioritize high severity issues', () => {
      // Arrange
      const prompt = "Test prompt";
      const issues: PromptIssue[] = [
        {
          type: 'vagueness',
          severity: 'low',
          message: 'Minor vagueness'
        },
        {
          type: 'missing_context',
          severity: 'high',
          message: 'Critical context missing'
        },
        {
          type: 'poor_structure',
          severity: 'medium',
          message: 'Structure could be better'
        }
      ];

      // Act
      const improvements = promptRefiner.generateImprovements(prompt, issues);

      // Assert
      expect(improvements).toHaveLength(3);
      // Should handle high severity first (context_added should appear first or be more detailed)
      const highSeverityImprovement = improvements.find(i => i.type === 'context_added');
      expect(highSeverityImprovement).toBeDefined();
      expect(highSeverityImprovement!.rationale.length).toBeGreaterThan(20);
    });

    it('should validate input parameters', () => {
      // Arrange & Act & Assert
      expect(() => 
        promptRefiner.generateImprovements("", [])
      ).toThrow('Prompt cannot be empty');

      expect(() => 
        promptRefiner.generateImprovements("Valid prompt", null as any)
      ).toThrow('Issues must be an array');
    });
  });

  describe('applyRefinements method', () => {
    it('should apply single improvement correctly', () => {
      // Arrange
      const originalPrompt = "Write text";
      const improvements: PromptImprovement[] = [
        {
          id: 'improvement-1',
          type: 'specificity_increased',
          description: 'Made prompt more specific',
          before: 'Write text',
          after: 'Write a 500-word technical article about machine learning',
          rationale: 'Specified length, type, and topic'
        }
      ];

      // Act
      const result = promptRefiner.applyRefinements(originalPrompt, improvements);

      // Assert
      expect(result).toBe('Write a 500-word technical article about machine learning');
    });

    it('should apply multiple improvements in sequence', () => {
      // Arrange
      const originalPrompt = "Create content";
      const improvements: PromptImprovement[] = [
        {
          id: 'improvement-1',
          type: 'specificity_increased',
          description: 'Added specificity',
          before: 'Create content',
          after: 'Create blog content',
          rationale: 'Specified content type'
        },
        {
          id: 'improvement-2',
          type: 'context_added',
          description: 'Added context',
          before: 'Create blog content',
          after: 'Create blog content about web development',
          rationale: 'Added topic context'
        },
        {
          id: 'improvement-3',
          type: 'constraints_clarified',
          description: 'Added constraints',
          before: 'Create blog content about web development',
          after: 'Create a 1000-word blog post about web development best practices',
          rationale: 'Added length and scope constraints'
        }
      ];

      // Act
      const result = promptRefiner.applyRefinements(originalPrompt, improvements);

      // Assert
      expect(result).toBe('Create a 1000-word blog post about web development best practices');
    });

    it('should handle overlapping improvements correctly', () => {
      // Arrange
      const originalPrompt = "Do AI task";
      const improvements: PromptImprovement[] = [
        {
          id: 'improvement-1',
          type: 'specificity_increased',
          description: 'Made specific',
          before: 'Do AI task',
          after: 'Perform text analysis task',
          rationale: 'Specified AI task type'
        },
        {
          id: 'improvement-2',
          type: 'context_added',
          description: 'Added context',
          before: 'Perform text analysis task',
          after: 'Perform sentiment analysis on customer reviews',
          rationale: 'Added specific context and data source'
        }
      ];

      // Act
      const result = promptRefiner.applyRefinements(originalPrompt, improvements);

      // Assert
      expect(result).toBe('Perform sentiment analysis on customer reviews');
      expect(result).not.toContain('Do AI task');
    });

    it('should return original prompt when no improvements provided', () => {
      // Arrange
      const originalPrompt = "Well-structured prompt";
      const improvements: PromptImprovement[] = [];

      // Act
      const result = promptRefiner.applyRefinements(originalPrompt, improvements);

      // Assert
      expect(result).toBe(originalPrompt);
    });

    it('should handle malformed improvements gracefully', () => {
      // Arrange
      const originalPrompt = "Test prompt";
      const improvements: PromptImprovement[] = [
        {
          id: 'improvement-1',
          type: 'specificity_increased',
          description: 'Test improvement',
          before: 'Non-existent text',
          after: 'Replacement text',
          rationale: 'Test rationale'
        }
      ];

      // Act
      const result = promptRefiner.applyRefinements(originalPrompt, improvements);

      // Assert
      // Should return original when improvement doesn't match
      expect(result).toBe(originalPrompt);
    });

    it('should validate input parameters', () => {
      // Arrange & Act & Assert
      expect(() => 
        promptRefiner.applyRefinements("", [])
      ).toThrow('Original prompt cannot be empty');

      expect(() => 
        promptRefiner.applyRefinements("Valid prompt", null as any)
      ).toThrow('Improvements must be an array');
    });

    it('should preserve prompt structure when applying improvements', () => {
      // Arrange
      const originalPrompt = `Task: Generate report
Context: Annual performance
Requirements: 10 pages`;
      
      const improvements: PromptImprovement[] = [
        {
          id: 'improvement-1',
          type: 'specificity_increased',
          description: 'Made more specific',
          before: 'Generate report',
          after: 'Generate detailed financial report',
          rationale: 'Added report type'
        }
      ];

      // Act
      const result = promptRefiner.applyRefinements(originalPrompt, improvements);

      // Assert
      expect(result).toContain('Task: Generate detailed financial report');
      expect(result).toContain('Context: Annual performance');
      expect(result).toContain('Requirements: 10 pages');
    });
  });

  describe('Integration scenarios', () => {
    it('should handle end-to-end refinement workflow', async () => {
      // Arrange - Start with a poor prompt
      const originalPrompt = "Fix the code";
      
      // Simulate analysis results
      const analyses: PromptAnalysis[] = [
        {
          id: 'analysis-1',
          type: 'vagueness',
          issue: 'No specification of what to fix',
          severity: 'high',
          suggestion: 'Specify the type of issues to address'
        },
        {
          id: 'analysis-2',
          type: 'missing_context',
          issue: 'No context about the codebase',
          severity: 'medium',
          suggestion: 'Provide programming language and error details'
        }
      ];

      // Act
      const refinementResult = await promptRefiner.refinePrompt(originalPrompt, analyses);
      
      // Assert - Should produce a much better prompt
      expect(refinementResult.refinedPrompt.length).toBeGreaterThan(originalPrompt.length * 2);
      expect(refinementResult.improvements).toHaveLength(2);
      expect(refinementResult.confidenceScore).toBeGreaterThan(0.6);
    });

    it('should maintain consistency across multiple method calls', () => {
      // Arrange
      const prompt = "Create documentation";
      const issues: PromptIssue[] = [
        {
          type: 'vagueness',
          severity: 'high',
          message: 'Too vague'
        }
      ];

      // Act
      const improvements = promptRefiner.generateImprovements(prompt, issues);
      const refinedPrompt = promptRefiner.applyRefinements(prompt, improvements);

      // Assert
      expect(improvements).toHaveLength(1);
      expect(refinedPrompt).not.toBe(prompt);
      expect(improvements[0].after).toBe(refinedPrompt);
    });
  });

  describe('Error handling and edge cases', () => {
    it('should handle service unavailability gracefully', async () => {
      // Arrange - Simulate service failure
      const mockRefiner = {
        refinePrompt: vi.fn().mockRejectedValue(new Error('Service unavailable')),
        generateImprovements: vi.fn(),
        applyRefinements: vi.fn()
      } as unknown as PromptRefinerContract;

      // Act & Assert
      await expect(
        mockRefiner.refinePrompt("test", [])
      ).rejects.toThrow('Service unavailable');
    });

    it('should handle concurrent refinement requests', async () => {
      // Arrange
      const prompts = [
        "Create API",
        "Write tests", 
        "Deploy app"
      ];
      
      const analyses = prompts.map(p => [{
        id: 'test-analysis',
        type: 'vagueness' as AnalysisType,
        issue: 'Vague prompt',
        severity: 'medium' as const,
        suggestion: 'Be more specific'
      }]);

      // Act
      const promises = prompts.map((prompt, i) => 
        promptRefiner.refinePrompt(prompt, analyses[i])
      );
      
      const results = await Promise.all(promises);

      // Assert
      expect(results).toHaveLength(3);
      results.forEach((result, i) => {
        expect(result.refinedPrompt).not.toBe(prompts[i]);
        expect(result.improvements).toHaveLength(1);
      });
    });
  });
});