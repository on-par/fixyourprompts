/**
 * Unit Tests for EducationContent Service
 * 
 * RED Phase of TDD - These tests WILL FAIL initially
 * They define the expected behavior of the EducationContentContract
 * 
 * Test Framework: Vitest
 * Test Subject: EducationContentContract implementation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import type { EducationContentContract } from '../../types/services';
import type { 
  EducationCategory, 
  PromptAnalysis 
} from '../../types/core';

// This import will fail initially - that's expected in RED phase
// The implementation should be created at this path
import { EducationContentService } from '../EducationContentService';

describe('EducationContent Service', () => {
  let educationService: EducationContentContract;

  beforeEach(() => {
    // This will fail initially as the service doesn't exist yet
    educationService = new EducationContentService();
  });

  describe('getRelevantTips', () => {
    it('should return relevant tips based on vagueness analysis', () => {
      const prompt = 'Help me with my project';
      const analyses: PromptAnalysis[] = [
        {
          id: 'analysis-1',
          type: 'vagueness',
          issue: 'Prompt lacks specificity',
          severity: 'high',
          suggestion: 'Add more specific details about the project',
          originalText: 'Help me with my project'
        }
      ];

      const tips = educationService.getRelevantTips(prompt, analyses);

      expect(tips).toBeInstanceOf(Array);
      expect(tips.length).toBeGreaterThan(0);
      expect(tips.some(tip => 
        tip.category === 'fundamentals' && 
        tip.technique.toLowerCase().includes('specificity')
      )).toBe(true);
    });

    it('should return tips for missing context analysis', () => {
      const prompt = 'Write code';
      const analyses: PromptAnalysis[] = [
        {
          id: 'analysis-2',
          type: 'missing_context',
          issue: 'No background information provided',
          severity: 'medium',
          suggestion: 'Include context about the programming language and use case',
          originalText: 'Write code'
        }
      ];

      const tips = educationService.getRelevantTips(prompt, analyses);

      expect(tips).toBeInstanceOf(Array);
      expect(tips.length).toBeGreaterThan(0);
      expect(tips.some(tip => 
        tip.category === 'fundamentals' &&
        tip.description.toLowerCase().includes('context')
      )).toBe(true);
    });

    it('should return tips for structure-related issues', () => {
      const prompt = 'Do this thing then that thing maybe something else';
      const analyses: PromptAnalysis[] = [
        {
          id: 'analysis-3',
          type: 'poor_structure',
          issue: 'Unorganized request structure',
          severity: 'medium',
          suggestion: 'Break down the request into clear steps',
          originalText: prompt
        }
      ];

      const tips = educationService.getRelevantTips(prompt, analyses);

      expect(tips).toBeInstanceOf(Array);
      expect(tips.some(tip => 
        tip.category === 'best_practices' &&
        tip.technique.toLowerCase().includes('structure')
      )).toBe(true);
    });

    it('should return advanced technique tips for complex scenarios', () => {
      const prompt = 'Complex analytical task requiring deep reasoning';
      const analyses: PromptAnalysis[] = [
        {
          id: 'analysis-4',
          type: 'unclear_constraints',
          issue: 'Missing output format specifications',
          severity: 'high',
          suggestion: 'Specify desired output format and constraints'
        },
        {
          id: 'analysis-5',
          type: 'missing_examples',
          issue: 'Would benefit from examples',
          severity: 'medium',
          suggestion: 'Provide example inputs and expected outputs'
        }
      ];

      const tips = educationService.getRelevantTips(prompt, analyses);

      expect(tips).toBeInstanceOf(Array);
      expect(tips.some(tip => 
        tip.category === 'advanced_techniques'
      )).toBe(true);
    });

    it('should return empty array for empty analyses', () => {
      const prompt = 'A well-crafted prompt';
      const analyses: PromptAnalysis[] = [];

      const tips = educationService.getRelevantTips(prompt, analyses);

      expect(tips).toBeInstanceOf(Array);
      expect(tips.length).toEqual(0);
    });

    it('should return empty array for empty prompt', () => {
      const prompt = '';
      const analyses: PromptAnalysis[] = [
        {
          id: 'analysis-6',
          type: 'vagueness',
          issue: 'Empty prompt',
          severity: 'high',
          suggestion: 'Provide a clear request'
        }
      ];

      const tips = educationService.getRelevantTips(prompt, analyses);

      expect(tips).toBeInstanceOf(Array);
      expect(tips.length).toEqual(0);
    });

    it('should return tips with relevance scores between 0 and 1', () => {
      const prompt = 'Help me improve my writing';
      const analyses: PromptAnalysis[] = [
        {
          id: 'analysis-7',
          type: 'vagueness',
          issue: 'Writing type not specified',
          severity: 'medium',
          suggestion: 'Specify what type of writing needs improvement'
        }
      ];

      const tips = educationService.getRelevantTips(prompt, analyses);

      expect(tips.length).toBeGreaterThan(0);
      tips.forEach(tip => {
        expect(tip.relevanceScore).toBeGreaterThanOrEqual(0);
        expect(tip.relevanceScore).toBeLessThanOrEqual(1);
        expect(typeof tip.relevanceScore).toBe('number');
      });
    });

    it('should prioritize tips by relevance score in descending order', () => {
      const prompt = 'Create a detailed analysis';
      const analyses: PromptAnalysis[] = [
        {
          id: 'analysis-8',
          type: 'missing_context',
          issue: 'Analysis subject not specified',
          severity: 'high',
          suggestion: 'Specify what needs to be analyzed'
        }
      ];

      const tips = educationService.getRelevantTips(prompt, analyses);

      expect(tips.length).toBeGreaterThan(1);
      for (let i = 0; i < tips.length - 1; i++) {
        expect(tips[i].relevanceScore).toBeGreaterThanOrEqual(tips[i + 1].relevanceScore);
      }
    });
  });

  describe('getAllCategories', () => {
    it('should return all available education categories', () => {
      const categories = educationService.getAllCategories();

      expect(categories).toBeInstanceOf(Array);
      expect(categories.length).toEqual(5);
      expect(categories).toContain('fundamentals');
      expect(categories).toContain('advanced_techniques');
      expect(categories).toContain('domain_specific');
      expect(categories).toContain('troubleshooting');
      expect(categories).toContain('best_practices');
    });

    it('should return categories in consistent order', () => {
      const categories1 = educationService.getAllCategories();
      const categories2 = educationService.getAllCategories();

      expect(categories1).toEqual(categories2);
    });

    it('should return unique categories without duplicates', () => {
      const categories = educationService.getAllCategories();
      const uniqueCategories = [...new Set(categories)];

      expect(categories.length).toEqual(uniqueCategories.length);
    });
  });

  describe('getTipsByCategory', () => {
    it('should return tips for fundamentals category', () => {
      const tips = educationService.getTipsByCategory('fundamentals');

      expect(tips).toBeInstanceOf(Array);
      expect(tips.length).toBeGreaterThan(0);
      tips.forEach(tip => {
        expect(tip.category).toBe('fundamentals');
        expect(typeof tip.id).toBe('string');
        expect(typeof tip.technique).toBe('string');
        expect(typeof tip.title).toBe('string');
        expect(typeof tip.description).toBe('string');
        expect(typeof tip.example).toBe('string');
        expect(typeof tip.relevanceScore).toBe('number');
      });
    });

    it('should return tips for advanced_techniques category', () => {
      const tips = educationService.getTipsByCategory('advanced_techniques');

      expect(tips).toBeInstanceOf(Array);
      expect(tips.length).toBeGreaterThan(0);
      tips.forEach(tip => {
        expect(tip.category).toBe('advanced_techniques');
      });
    });

    it('should return tips for domain_specific category', () => {
      const tips = educationService.getTipsByCategory('domain_specific');

      expect(tips).toBeInstanceOf(Array);
      expect(tips.length).toBeGreaterThan(0);
      tips.forEach(tip => {
        expect(tip.category).toBe('domain_specific');
      });
    });

    it('should return tips for troubleshooting category', () => {
      const tips = educationService.getTipsByCategory('troubleshooting');

      expect(tips).toBeInstanceOf(Array);
      expect(tips.length).toBeGreaterThan(0);
      tips.forEach(tip => {
        expect(tip.category).toBe('troubleshooting');
      });
    });

    it('should return tips for best_practices category', () => {
      const tips = educationService.getTipsByCategory('best_practices');

      expect(tips).toBeInstanceOf(Array);
      expect(tips.length).toBeGreaterThan(0);
      tips.forEach(tip => {
        expect(tip.category).toBe('best_practices');
      });
    });

    it('should return empty array for invalid category', () => {
      // TypeScript will catch this at compile time, but testing runtime behavior
      const tips = educationService.getTipsByCategory('invalid_category' as EducationCategory);

      expect(tips).toBeInstanceOf(Array);
      expect(tips.length).toEqual(0);
    });

    it('should return different tip counts for different categories', () => {
      const fundamentalsTips = educationService.getTipsByCategory('fundamentals');
      const advancedTips = educationService.getTipsByCategory('advanced_techniques');

      // Each category should have some tips, but counts may differ
      expect(fundamentalsTips.length).toBeGreaterThan(0);
      expect(advancedTips.length).toBeGreaterThan(0);
    });
  });

  describe('Integration and Edge Cases', () => {
    it('should handle multiple analysis types and return diverse tips', () => {
      const prompt = 'Build something cool';
      const analyses: PromptAnalysis[] = [
        {
          id: 'analysis-multi-1',
          type: 'vagueness',
          issue: 'Unclear what to build',
          severity: 'high',
          suggestion: 'Specify the type of project or application'
        },
        {
          id: 'analysis-multi-2',
          type: 'missing_context',
          issue: 'No technology stack specified',
          severity: 'medium',
          suggestion: 'Include preferred technologies or frameworks'
        },
        {
          id: 'analysis-multi-3',
          type: 'unclear_constraints',
          issue: 'No timeline or scope defined',
          severity: 'low',
          suggestion: 'Add project constraints and timeline'
        }
      ];

      const tips = educationService.getRelevantTips(prompt, analyses);

      expect(tips.length).toBeGreaterThan(0);
      // Should have tips addressing different issue types
      const categories = new Set(tips.map(tip => tip.category));
      expect(categories.size).toBeGreaterThan(1);
    });

    it('should handle null or undefined inputs gracefully', () => {
      // These should throw TypeScript errors but we test runtime safety
      expect(() => {
        educationService.getRelevantTips(null as any, []);
      }).toThrow();

      expect(() => {
        educationService.getRelevantTips('test', null as any);
      }).toThrow();

      expect(() => {
        educationService.getTipsByCategory(null as any);
      }).toThrow();
    });

    it('should maintain consistent tip IDs across calls', () => {
      const tips1 = educationService.getTipsByCategory('fundamentals');
      const tips2 = educationService.getTipsByCategory('fundamentals');

      expect(tips1.length).toEqual(tips2.length);
      tips1.forEach((tip, index) => {
        expect(tip.id).toEqual(tips2[index].id);
      });
    });

    it('should provide meaningful tip content for each category', () => {
      const categories: EducationCategory[] = ['fundamentals', 'advanced_techniques', 'domain_specific', 'troubleshooting', 'best_practices'];

      categories.forEach(category => {
        const tips = educationService.getTipsByCategory(category);
        expect(tips.length).toBeGreaterThan(0);
        
        tips.forEach(tip => {
          expect(tip.technique.length).toBeGreaterThan(0);
          expect(tip.title.length).toBeGreaterThan(0);
          expect(tip.description.length).toBeGreaterThan(10); // Meaningful description
          expect(tip.example.length).toBeGreaterThan(10); // Meaningful example
        });
      });
    });
  });
});