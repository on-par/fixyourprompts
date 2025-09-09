/**
 * Comprehensive failing tests for EducationPanel React component
 * 
 * This is TDD RED phase - these tests are written BEFORE implementation
 * and are expected to FAIL until the component is built.
 * 
 * Tests cover:
 * - Basic rendering and tip display
 * - Category filtering functionality
 * - User level filtering
 * - Expand/collapse interactions
 * - Accessibility features
 * - Edge cases and error handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EducationPanelProps } from '../../../src/types/components';
import { EducationTip, EducationCategory } from '../../../src/types/core';
import EducationPanel from '../../../src/components/EducationPanel';

// Mock education tip data for comprehensive testing
const mockEducationTips: EducationTip[] = [
  {
    id: 'tip-1',
    technique: 'Context Setting',
    title: 'Provide Clear Context',
    description: 'Always establish the context and background for your prompt to help the AI understand what you need.',
    example: 'Instead of "Write code", try "Write a Python function that validates email addresses using regex"',
    category: 'fundamentals' as EducationCategory,
    relevanceScore: 0.9
  },
  {
    id: 'tip-2',
    technique: 'Constraint Definition',
    title: 'Define Clear Constraints',
    description: 'Specify limitations, requirements, and boundaries for the AI response.',
    example: 'Add constraints like "in 200 words or less" or "suitable for beginners"',
    category: 'fundamentals' as EducationCategory,
    relevanceScore: 0.8
  },
  {
    id: 'tip-3',
    technique: 'Reverse Prompting',
    title: 'Work Backwards from Desired Output',
    description: 'Start with your ideal output and reverse-engineer the prompt structure needed.',
    example: 'If you want a formal business email, specify tone, structure, and key points upfront',
    category: 'advanced_techniques' as EducationCategory,
    relevanceScore: 0.7
  },
  {
    id: 'tip-4',
    technique: 'Chain of Thought',
    title: 'Request Step-by-Step Reasoning',
    description: 'Ask the AI to show its thinking process for complex problems.',
    example: 'Add "Think through this step-by-step" or "Show your reasoning"',
    category: 'advanced_techniques' as EducationCategory,
    relevanceScore: 0.6
  },
  {
    id: 'tip-5',
    technique: 'Domain Expertise',
    title: 'Specify Domain Context',
    description: 'Indicate the specific field or domain for specialized knowledge.',
    example: 'For medical advice: "As a healthcare professional would explain..."',
    category: 'domain_specific' as EducationCategory,
    relevanceScore: 0.8
  }
];

const mockFundamentalsCategory: EducationCategory = 'fundamentals';
const mockAdvancedCategory: EducationCategory = 'advanced_techniques';
const mockDomainSpecificCategory: EducationCategory = 'domain_specific';

describe('EducationPanel Component', () => {
  let mockOnTipExpand: ReturnType<typeof vi.fn>;
  let defaultProps: EducationPanelProps;

  beforeEach(() => {
    mockOnTipExpand = vi.fn();
    defaultProps = {
      tips: mockEducationTips,
      userLevel: 'intermediate',
      onTipExpand: mockOnTipExpand
    };
  });

  describe('Basic Rendering', () => {
    it('should render education panel with all provided tips', () => {
      render(<EducationPanel {...defaultProps} />);
      
      // Should display all tip titles
      expect(screen.getByText('Provide Clear Context')).toBeInTheDocument();
      expect(screen.getByText('Define Clear Constraints')).toBeInTheDocument();
      expect(screen.getByText('Work Backwards from Desired Output')).toBeInTheDocument();
      expect(screen.getByText('Request Step-by-Step Reasoning')).toBeInTheDocument();
      expect(screen.getByText('Specify Domain Context')).toBeInTheDocument();
    });

    it('should display technique names for each tip', () => {
      render(<EducationPanel {...defaultProps} />);
      
      expect(screen.getByText('Context Setting')).toBeInTheDocument();
      expect(screen.getByText('Constraint Definition')).toBeInTheDocument();
      expect(screen.getByText('Reverse Prompting')).toBeInTheDocument();
      expect(screen.getByText('Chain of Thought')).toBeInTheDocument();
      expect(screen.getByText('Domain Expertise')).toBeInTheDocument();
    });

    it('should show tip descriptions initially collapsed', () => {
      render(<EducationPanel {...defaultProps} />);
      
      // Descriptions should not be visible initially (collapsed state)
      expect(screen.queryByText('Always establish the context and background')).not.toBeInTheDocument();
      expect(screen.queryByText('Specify limitations, requirements, and boundaries')).not.toBeInTheDocument();
    });

    it('should display relevance scores for each tip', () => {
      render(<EducationPanel {...defaultProps} />);
      
      // Should show relevance indicators (assuming they're displayed as percentages)
      expect(screen.getByText('90%')).toBeInTheDocument(); // 0.9 * 100
      expect(screen.getByText('80%')).toBeInTheDocument(); // 0.8 * 100
      expect(screen.getByText('70%')).toBeInTheDocument(); // 0.7 * 100
      expect(screen.getByText('60%')).toBeInTheDocument(); // 0.6 * 100
    });
  });

  describe('Category Filtering', () => {
    it('should show only fundamentals tips when fundamentals category is provided', () => {
      const propsWithCategory = {
        ...defaultProps,
        category: mockFundamentalsCategory
      };
      
      render(<EducationPanel {...propsWithCategory} />);
      
      // Should show fundamentals tips
      expect(screen.getByText('Context Setting')).toBeInTheDocument();
      expect(screen.getByText('Constraint Definition')).toBeInTheDocument();
      
      // Should not show advanced or domain-specific tips
      expect(screen.queryByText('Reverse Prompting')).not.toBeInTheDocument();
      expect(screen.queryByText('Chain of Thought')).not.toBeInTheDocument();
      expect(screen.queryByText('Domain Expertise')).not.toBeInTheDocument();
    });

    it('should show only advanced technique tips when advanced category is provided', () => {
      const propsWithCategory = {
        ...defaultProps,
        category: mockAdvancedCategory
      };
      
      render(<EducationPanel {...propsWithCategory} />);
      
      // Should show advanced tips
      expect(screen.getByText('Reverse Prompting')).toBeInTheDocument();
      expect(screen.getByText('Chain of Thought')).toBeInTheDocument();
      
      // Should not show fundamentals or domain-specific tips
      expect(screen.queryByText('Context Setting')).not.toBeInTheDocument();
      expect(screen.queryByText('Constraint Definition')).not.toBeInTheDocument();
      expect(screen.queryByText('Domain Expertise')).not.toBeInTheDocument();
    });

    it('should show only domain-specific tips when domain-specific category is provided', () => {
      const propsWithCategory = {
        ...defaultProps,
        category: mockDomainSpecificCategory
      };
      
      render(<EducationPanel {...propsWithCategory} />);
      
      // Should show domain-specific tips
      expect(screen.getByText('Domain Expertise')).toBeInTheDocument();
      
      // Should not show other categories
      expect(screen.queryByText('Context Setting')).not.toBeInTheDocument();
      expect(screen.queryByText('Reverse Prompting')).not.toBeInTheDocument();
    });

    it('should show all tips when no category filter is provided', () => {
      render(<EducationPanel {...defaultProps} />);
      
      // Should show all tips regardless of category
      expect(screen.getByText('Context Setting')).toBeInTheDocument();
      expect(screen.getByText('Reverse Prompting')).toBeInTheDocument();
      expect(screen.getByText('Domain Expertise')).toBeInTheDocument();
    });
  });

  describe('User Level Filtering', () => {
    it('should appropriately display tips for beginner user level', () => {
      const beginnerProps = {
        ...defaultProps,
        userLevel: 'beginner' as const
      };
      
      render(<EducationPanel {...beginnerProps} />);
      
      // Should prioritize fundamentals for beginners
      // Implementation should show simpler tips more prominently
      expect(screen.getByText('Context Setting')).toBeInTheDocument();
      expect(screen.getByText('Constraint Definition')).toBeInTheDocument();
    });

    it('should appropriately display tips for intermediate user level', () => {
      const intermediateProps = {
        ...defaultProps,
        userLevel: 'intermediate' as const
      };
      
      render(<EducationPanel {...intermediateProps} />);
      
      // Should show a mix of fundamental and advanced tips
      expect(screen.getByText('Context Setting')).toBeInTheDocument();
      expect(screen.getByText('Reverse Prompting')).toBeInTheDocument();
    });

    it('should appropriately display tips for advanced user level', () => {
      const advancedProps = {
        ...defaultProps,
        userLevel: 'advanced' as const
      };
      
      render(<EducationPanel {...advancedProps} />);
      
      // Should emphasize advanced techniques
      expect(screen.getByText('Reverse Prompting')).toBeInTheDocument();
      expect(screen.getByText('Chain of Thought')).toBeInTheDocument();
    });
  });

  describe('Expand/Collapse Functionality', () => {
    it('should expand tip details when tip is clicked', async () => {
      render(<EducationPanel {...defaultProps} />);
      
      const tipTitle = screen.getByText('Provide Clear Context');
      fireEvent.click(tipTitle);
      
      await waitFor(() => {
        expect(screen.getByText('Always establish the context and background for your prompt to help the AI understand what you need.')).toBeInTheDocument();
      });
    });

    it('should show examples when tip is expanded', async () => {
      render(<EducationPanel {...defaultProps} />);
      
      const tipTitle = screen.getByText('Define Clear Constraints');
      fireEvent.click(tipTitle);
      
      await waitFor(() => {
        expect(screen.getByText('Add constraints like "in 200 words or less" or "suitable for beginners"')).toBeInTheDocument();
      });
    });

    it('should call onTipExpand callback when tip is expanded', async () => {
      render(<EducationPanel {...defaultProps} />);
      
      const tipTitle = screen.getByText('Work Backwards from Desired Output');
      fireEvent.click(tipTitle);
      
      await waitFor(() => {
        expect(mockOnTipExpand).toHaveBeenCalledWith(mockEducationTips[2]);
      });
    });

    it('should collapse expanded tip when clicked again', async () => {
      render(<EducationPanel {...defaultProps} />);
      
      const tipTitle = screen.getByText('Provide Clear Context');
      
      // Expand
      fireEvent.click(tipTitle);
      await waitFor(() => {
        expect(screen.getByText('Always establish the context and background')).toBeInTheDocument();
      });
      
      // Collapse
      fireEvent.click(tipTitle);
      await waitFor(() => {
        expect(screen.queryByText('Always establish the context and background')).not.toBeInTheDocument();
      });
    });

    it('should allow multiple tips to be expanded simultaneously', async () => {
      render(<EducationPanel {...defaultProps} />);
      
      const firstTip = screen.getByText('Provide Clear Context');
      const secondTip = screen.getByText('Define Clear Constraints');
      
      fireEvent.click(firstTip);
      fireEvent.click(secondTip);
      
      await waitFor(() => {
        expect(screen.getByText('Always establish the context and background')).toBeInTheDocument();
        expect(screen.getByText('Specify limitations, requirements, and boundaries')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty tips array gracefully', () => {
      const emptyProps = {
        ...defaultProps,
        tips: []
      };
      
      render(<EducationPanel {...emptyProps} />);
      
      expect(screen.getByText(/no education tips available/i)).toBeInTheDocument();
    });

    it('should handle tips with missing or null examples', () => {
      const tipsWithoutExamples: EducationTip[] = [
        {
          id: 'tip-no-example',
          technique: 'Test Technique',
          title: 'Test Title',
          description: 'Test description without example',
          example: '', // Empty example
          category: 'fundamentals' as EducationCategory,
          relevanceScore: 0.5
        }
      ];
      
      const propsWithoutExamples = {
        ...defaultProps,
        tips: tipsWithoutExamples
      };
      
      render(<EducationPanel {...propsWithoutExamples} />);
      
      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test Technique')).toBeInTheDocument();
    });

    it('should handle invalid category filter gracefully', () => {
      const propsWithInvalidCategory = {
        ...defaultProps,
        // @ts-expect-error - Testing invalid category
        category: 'invalid_category' as EducationCategory
      };
      
      render(<EducationPanel {...propsWithInvalidCategory} />);
      
      // Should show no tips or fallback message
      expect(screen.getByText(/no tips found for this category/i)).toBeInTheDocument();
    });

    it('should handle tips with zero relevance score', () => {
      const tipsWithZeroRelevance: EducationTip[] = [
        {
          id: 'tip-zero-relevance',
          technique: 'Zero Relevance Technique',
          title: 'Not Relevant Tip',
          description: 'This tip has zero relevance',
          example: 'Example for zero relevance tip',
          category: 'fundamentals' as EducationCategory,
          relevanceScore: 0
        }
      ];
      
      const propsWithZeroRelevance = {
        ...defaultProps,
        tips: tipsWithZeroRelevance
      };
      
      render(<EducationPanel {...propsWithZeroRelevance} />);
      
      // Should still display the tip but with 0% relevance
      expect(screen.getByText('Not Relevant Tip')).toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument();
    });
  });

  describe('Accessibility Features', () => {
    it('should have proper ARIA labels for expandable content', () => {
      render(<EducationPanel {...defaultProps} />);
      
      const expandableElements = screen.getAllByRole('button');
      expandableElements.forEach(element => {
        expect(element).toHaveAttribute('aria-expanded');
      });
    });

    it('should support keyboard navigation for expanding tips', async () => {
      render(<EducationPanel {...defaultProps} />);
      
      const firstTipButton = screen.getAllByRole('button')[0];
      firstTipButton.focus();
      
      fireEvent.keyDown(firstTipButton, { key: 'Enter' });
      
      await waitFor(() => {
        expect(firstTipButton).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('should support keyboard navigation with Space key', async () => {
      render(<EducationPanel {...defaultProps} />);
      
      const firstTipButton = screen.getAllByRole('button')[0];
      firstTipButton.focus();
      
      fireEvent.keyDown(firstTipButton, { key: ' ' });
      
      await waitFor(() => {
        expect(firstTipButton).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('should have proper heading hierarchy', () => {
      render(<EducationPanel {...defaultProps} />);
      
      // Main panel should have a heading
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
      
      // Individual tips should have subheadings
      const tipHeadings = screen.getAllByRole('heading', { level: 3 });
      expect(tipHeadings.length).toBeGreaterThan(0);
    });

    it('should have descriptive aria-label for relevance scores', () => {
      render(<EducationPanel {...defaultProps} />);
      
      const relevanceScores = screen.getAllByLabelText(/relevance score/i);
      expect(relevanceScores.length).toBeGreaterThan(0);
    });
  });

  describe('Component Props Validation', () => {
    it('should work without onTipExpand callback', () => {
      const propsWithoutCallback = {
        tips: mockEducationTips,
        userLevel: 'beginner' as const
      };
      
      expect(() => {
        render(<EducationPanel {...propsWithoutCallback} />);
      }).not.toThrow();
    });

    it('should handle all user levels correctly', () => {
      const userLevels: Array<'beginner' | 'intermediate' | 'advanced'> = ['beginner', 'intermediate', 'advanced'];
      
      userLevels.forEach(level => {
        const props = {
          ...defaultProps,
          userLevel: level
        };
        
        expect(() => {
          render(<EducationPanel {...props} />);
        }).not.toThrow();
      });
    });
  });

  describe('Performance and Optimization', () => {
    it('should not re-render unnecessarily when tips prop reference changes but content is same', () => {
      const { rerender } = render(<EducationPanel {...defaultProps} />);
      
      // Create new array with same content
      const sameTips = [...mockEducationTips];
      
      rerender(<EducationPanel {...defaultProps} tips={sameTips} />);
      
      // Component should handle this efficiently (implementation detail)
      expect(screen.getByText('Provide Clear Context')).toBeInTheDocument();
    });

    it('should efficiently filter large numbers of tips', () => {
      // Create many tips to test performance
      const manyTips: EducationTip[] = Array.from({ length: 100 }, (_, i) => ({
        id: `tip-${i}`,
        technique: `Technique ${i}`,
        title: `Tip Title ${i}`,
        description: `Description for tip ${i}`,
        example: `Example ${i}`,
        category: 'fundamentals' as EducationCategory,
        relevanceScore: Math.random()
      }));
      
      const propsWithManyTips = {
        ...defaultProps,
        tips: manyTips,
        category: mockFundamentalsCategory
      };
      
      expect(() => {
        render(<EducationPanel {...propsWithManyTips} />);
      }).not.toThrow();
      
      // Should render efficiently without performance issues
      expect(screen.getByText('Tip Title 0')).toBeInTheDocument();
    });
  });
});