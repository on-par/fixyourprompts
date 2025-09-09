/**
 * AnalysisPanel Component Tests
 * 
 * TDD RED PHASE: These tests are written FIRST and will FAIL until the component is implemented.
 * 
 * This test suite comprehensively tests the AnalysisPanel React component behavior:
 * - Rendering analysis results list correctly
 * - Displaying different analysis types with proper styling
 * - Showing severity levels with visual indicators
 * - Handling onAnalysisSelect callback interactions
 * - Supporting compact view mode
 * - Showing suggestions and issue descriptions
 * - Handling empty analyses array gracefully
 * - Accessibility features and keyboard navigation
 * - Edge cases and error states
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Import the component and types
import { AnalysisPanel } from '../../../src/components/AnalysisPanel';
import { AnalysisPanelProps } from '../../../src/types/components';
import { PromptAnalysis } from '../../../src/types/core';

// Mock test data utilities
const createMockAnalysis = (overrides?: Partial<PromptAnalysis>): PromptAnalysis => ({
  id: 'analysis-1',
  type: 'vagueness',
  issue: 'The prompt lacks specificity about what type of output is needed',
  severity: 'medium' as const,
  suggestion: 'Add specific requirements and constraints to clarify the expected output',
  originalText: 'Write something',
  position: { start: 0, end: 14 },
  ...overrides
});

const createMockAnalyses = (): PromptAnalysis[] => [
  createMockAnalysis({
    id: 'analysis-1',
    type: 'vagueness',
    issue: 'The prompt lacks specificity about what type of output is needed',
    severity: 'high',
    suggestion: 'Add specific requirements and constraints to clarify the expected output',
    originalText: 'Write something',
    position: { start: 0, end: 14 }
  }),
  createMockAnalysis({
    id: 'analysis-2',
    type: 'missing_context',
    issue: 'Missing background information that would help produce better results',
    severity: 'medium',
    suggestion: 'Provide relevant context, background, or domain-specific information',
    originalText: undefined,
    position: undefined
  }),
  createMockAnalysis({
    id: 'analysis-3',
    type: 'unclear_constraints',
    issue: 'No clear limitations or requirements specified',
    severity: 'low',
    suggestion: 'Define specific constraints like length, format, or style requirements',
    originalText: 'Write something good',
    position: { start: 14, end: 18 }
  }),
  createMockAnalysis({
    id: 'analysis-4',
    type: 'poor_structure',
    issue: 'The prompt structure could be improved for clarity',
    severity: 'medium',
    suggestion: 'Organize the prompt with clear sections and logical flow',
    originalText: 'Write something good for me to use',
    position: { start: 0, end: 33 }
  }),
  createMockAnalysis({
    id: 'analysis-5',
    type: 'tone_inconsistency',
    issue: 'Mixed or unclear tone throughout the prompt',
    severity: 'low',
    suggestion: 'Maintain consistent tone and voice throughout the prompt',
    originalText: 'Write something good for me to use please',
    position: { start: 33, end: 40 }
  }),
  createMockAnalysis({
    id: 'analysis-6',
    type: 'missing_examples',
    issue: 'Would benefit from examples to illustrate expected output',
    severity: 'high',
    suggestion: 'Include 1-2 examples of the desired output format or style',
    originalText: undefined,
    position: undefined
  })
];

const createDefaultProps = (overrides?: Partial<AnalysisPanelProps>): AnalysisPanelProps => ({
  analyses: createMockAnalyses(),
  onAnalysisSelect: vi.fn(),
  compact: false,
  ...overrides
});

describe('AnalysisPanel Component', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render the component with analysis results', () => {
      const props = createDefaultProps();
      render(<AnalysisPanel {...props} />);

      // Should display the panel title or heading
      expect(screen.getByText('Analysis Results')).toBeInTheDocument();
      
      // Should render all analysis items
      expect(screen.getByText('The prompt lacks specificity about what type of output is needed')).toBeInTheDocument();
      expect(screen.getByText('Missing background information that would help produce better results')).toBeInTheDocument();
      expect(screen.getByText('No clear limitations or requirements specified')).toBeInTheDocument();
    });

    it('should render with minimal required props', () => {
      const props: AnalysisPanelProps = {
        analyses: [createMockAnalysis()]
      };

      render(<AnalysisPanel {...props} />);

      expect(screen.getByText('The prompt lacks specificity about what type of output is needed')).toBeInTheDocument();
    });

    it('should display analysis count indicator', () => {
      const props = createDefaultProps();
      render(<AnalysisPanel {...props} />);

      // Should show total number of analyses
      expect(screen.getByText(/6 issues found/i)).toBeInTheDocument();
    });
  });

  describe('Analysis Types Display', () => {
    it('should display different analysis types with proper styling', () => {
      const props = createDefaultProps();
      render(<AnalysisPanel {...props} />);

      // Should show analysis type labels/badges
      expect(screen.getByText('Vagueness')).toBeInTheDocument();
      expect(screen.getByText('Missing Context')).toBeInTheDocument();
      expect(screen.getByText('Unclear Constraints')).toBeInTheDocument();
      expect(screen.getByText('Poor Structure')).toBeInTheDocument();
      expect(screen.getByText('Tone Inconsistency')).toBeInTheDocument();
      expect(screen.getByText('Missing Examples')).toBeInTheDocument();

      // Should have appropriate CSS classes for different types
      expect(screen.getByText('Vagueness')).toHaveClass('analysis-type-vagueness');
      expect(screen.getByText('Missing Context')).toHaveClass('analysis-type-missing_context');
      expect(screen.getByText('Poor Structure')).toHaveClass('analysis-type-poor_structure');
    });

    it('should display analysis types with proper icons', () => {
      const props = createDefaultProps();
      render(<AnalysisPanel {...props} />);

      // Should show appropriate icons for each type
      expect(screen.getByTestId('vagueness-icon')).toBeInTheDocument();
      expect(screen.getByTestId('missing_context-icon')).toBeInTheDocument();
      expect(screen.getByTestId('unclear_constraints-icon')).toBeInTheDocument();
      expect(screen.getByTestId('poor_structure-icon')).toBeInTheDocument();
      expect(screen.getByTestId('tone_inconsistency-icon')).toBeInTheDocument();
      expect(screen.getByTestId('missing_examples-icon')).toBeInTheDocument();
    });
  });

  describe('Severity Levels Display', () => {
    it('should display high severity items with proper styling', () => {
      const props = createDefaultProps();
      render(<AnalysisPanel {...props} />);

      const highSeverityItems = screen.getAllByTestId(/high-severity/);
      expect(highSeverityItems).toHaveLength(2); // vagueness and missing_examples

      highSeverityItems.forEach(item => {
        expect(item).toHaveClass('severity-high');
        expect(item).toHaveAttribute('aria-label', expect.stringContaining('high severity'));
      });

      // Should show high severity indicator (e.g., red color, exclamation mark)
      expect(screen.getAllByTestId('high-severity-indicator')).toHaveLength(2);
    });

    it('should display medium severity items with proper styling', () => {
      const props = createDefaultProps();
      render(<AnalysisPanel {...props} />);

      const mediumSeverityItems = screen.getAllByTestId(/medium-severity/);
      expect(mediumSeverityItems).toHaveLength(2); // missing_context and poor_structure

      mediumSeverityItems.forEach(item => {
        expect(item).toHaveClass('severity-medium');
        expect(item).toHaveAttribute('aria-label', expect.stringContaining('medium severity'));
      });

      // Should show medium severity indicator (e.g., orange color)
      expect(screen.getAllByTestId('medium-severity-indicator')).toHaveLength(2);
    });

    it('should display low severity items with proper styling', () => {
      const props = createDefaultProps();
      render(<AnalysisPanel {...props} />);

      const lowSeverityItems = screen.getAllByTestId(/low-severity/);
      expect(lowSeverityItems).toHaveLength(2); // unclear_constraints and tone_inconsistency

      lowSeverityItems.forEach(item => {
        expect(item).toHaveClass('severity-low');
        expect(item).toHaveAttribute('aria-label', expect.stringContaining('low severity'));
      });

      // Should show low severity indicator (e.g., yellow color)
      expect(screen.getAllByTestId('low-severity-indicator')).toHaveLength(2);
    });

    it('should sort analyses by severity (high to low)', () => {
      const props = createDefaultProps();
      render(<AnalysisPanel {...props} />);

      const analysisItems = screen.getAllByTestId(/analysis-item/);
      
      // First items should be high severity
      expect(analysisItems[0]).toHaveAttribute('data-severity', 'high');
      expect(analysisItems[1]).toHaveAttribute('data-severity', 'high');
      
      // Middle items should be medium severity
      expect(analysisItems[2]).toHaveAttribute('data-severity', 'medium');
      expect(analysisItems[3]).toHaveAttribute('data-severity', 'medium');
      
      // Last items should be low severity
      expect(analysisItems[4]).toHaveAttribute('data-severity', 'low');
      expect(analysisItems[5]).toHaveAttribute('data-severity', 'low');
    });
  });

  describe('Click Interactions and Selection', () => {
    it('should call onAnalysisSelect when an analysis item is clicked', async () => {
      const mockOnAnalysisSelect = vi.fn();
      const props = createDefaultProps({
        onAnalysisSelect: mockOnAnalysisSelect
      });

      render(<AnalysisPanel {...props} />);

      const firstAnalysisItem = screen.getByTestId('analysis-item-analysis-1');
      await user.click(firstAnalysisItem);

      expect(mockOnAnalysisSelect).toHaveBeenCalledTimes(1);
      expect(mockOnAnalysisSelect).toHaveBeenCalledWith(props.analyses[0]);
    });

    it('should handle clicks on different analysis items correctly', async () => {
      const mockOnAnalysisSelect = vi.fn();
      const props = createDefaultProps({
        onAnalysisSelect: mockOnAnalysisSelect
      });

      render(<AnalysisPanel {...props} />);

      // Click on second analysis item
      const secondAnalysisItem = screen.getByTestId('analysis-item-analysis-2');
      await user.click(secondAnalysisItem);

      expect(mockOnAnalysisSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'analysis-2',
          type: 'missing_context'
        })
      );

      // Click on third analysis item
      const thirdAnalysisItem = screen.getByTestId('analysis-item-analysis-3');
      await user.click(thirdAnalysisItem);

      expect(mockOnAnalysisSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'analysis-3',
          type: 'unclear_constraints'
        })
      );

      expect(mockOnAnalysisSelect).toHaveBeenCalledTimes(2);
    });

    it('should not call onAnalysisSelect when callback is not provided', async () => {
      const props = createDefaultProps({
        onAnalysisSelect: undefined
      });

      render(<AnalysisPanel {...props} />);

      const analysisItem = screen.getByTestId('analysis-item-analysis-1');
      await user.click(analysisItem);

      // Should not throw error when no callback provided
      expect(() => fireEvent.click(analysisItem)).not.toThrow();
    });

    it('should show visual feedback for selected analysis item', async () => {
      const props = createDefaultProps();
      render(<AnalysisPanel {...props} />);

      const analysisItem = screen.getByTestId('analysis-item-analysis-1');
      await user.click(analysisItem);

      expect(analysisItem).toHaveClass('selected');
      expect(analysisItem).toHaveAttribute('aria-selected', 'true');
    });

    it('should handle rapid clicking without issues', async () => {
      const mockOnAnalysisSelect = vi.fn();
      const props = createDefaultProps({
        onAnalysisSelect: mockOnAnalysisSelect
      });

      render(<AnalysisPanel {...props} />);

      const analysisItem = screen.getByTestId('analysis-item-analysis-1');
      
      // Rapid clicks
      for (let i = 0; i < 5; i++) {
        await user.click(analysisItem);
      }

      expect(mockOnAnalysisSelect).toHaveBeenCalledTimes(5);
    });
  });

  describe('Compact View Mode', () => {
    it('should display compact view when compact prop is true', () => {
      const props = createDefaultProps({ compact: true });
      render(<AnalysisPanel {...props} />);

      const container = screen.getByTestId('analysis-panel-container');
      expect(container).toHaveClass('compact');

      // Should show condensed information
      expect(screen.getByText('6 issues')).toBeInTheDocument();
      expect(screen.queryByText('Analysis Results')).not.toBeInTheDocument();
    });

    it('should display expanded view when compact prop is false', () => {
      const props = createDefaultProps({ compact: false });
      render(<AnalysisPanel {...props} />);

      const container = screen.getByTestId('analysis-panel-container');
      expect(container).not.toHaveClass('compact');

      // Should show full information
      expect(screen.getByText('Analysis Results')).toBeInTheDocument();
      expect(screen.getByText('6 issues found')).toBeInTheDocument();
    });

    it('should show truncated suggestions in compact mode', () => {
      const props = createDefaultProps({ compact: true });
      render(<AnalysisPanel {...props} />);

      // Suggestions should be truncated or hidden in compact mode
      const suggestions = screen.queryAllByTestId('analysis-suggestion');
      suggestions.forEach(suggestion => {
        expect(suggestion).toHaveClass('truncated');
      });
    });

    it('should show full suggestions in expanded mode', () => {
      const props = createDefaultProps({ compact: false });
      render(<AnalysisPanel {...props} />);

      // Full suggestion text should be visible
      expect(screen.getByText('Add specific requirements and constraints to clarify the expected output')).toBeInTheDocument();
      expect(screen.getByText('Provide relevant context, background, or domain-specific information')).toBeInTheDocument();
    });
  });

  describe('Suggestions and Issue Descriptions', () => {
    it('should display issue descriptions for all analyses', () => {
      const props = createDefaultProps();
      render(<AnalysisPanel {...props} />);

      // Should show all issue descriptions
      expect(screen.getByText('The prompt lacks specificity about what type of output is needed')).toBeInTheDocument();
      expect(screen.getByText('Missing background information that would help produce better results')).toBeInTheDocument();
      expect(screen.getByText('No clear limitations or requirements specified')).toBeInTheDocument();
      expect(screen.getByText('The prompt structure could be improved for clarity')).toBeInTheDocument();
      expect(screen.getByText('Mixed or unclear tone throughout the prompt')).toBeInTheDocument();
      expect(screen.getByText('Would benefit from examples to illustrate expected output')).toBeInTheDocument();
    });

    it('should display suggestions for all analyses', () => {
      const props = createDefaultProps();
      render(<AnalysisPanel {...props} />);

      // Should show all suggestions
      expect(screen.getByText('Add specific requirements and constraints to clarify the expected output')).toBeInTheDocument();
      expect(screen.getByText('Provide relevant context, background, or domain-specific information')).toBeInTheDocument();
      expect(screen.getByText('Define specific constraints like length, format, or style requirements')).toBeInTheDocument();
      expect(screen.getByText('Organize the prompt with clear sections and logical flow')).toBeInTheDocument();
      expect(screen.getByText('Maintain consistent tone and voice throughout the prompt')).toBeInTheDocument();
      expect(screen.getByText('Include 1-2 examples of the desired output format or style')).toBeInTheDocument();
    });

    it('should show expandable suggestion details', async () => {
      const props = createDefaultProps();
      render(<AnalysisPanel {...props} />);

      const expandButton = screen.getByTestId('expand-suggestion-analysis-1');
      await user.click(expandButton);

      // Should show expanded suggestion content
      expect(screen.getByTestId('expanded-suggestion-analysis-1')).toBeInTheDocument();
      expect(screen.getByText(/detailed explanation/i)).toBeInTheDocument();
    });

    it('should highlight original text when position is provided', () => {
      const props = createDefaultProps();
      render(<AnalysisPanel {...props} />);

      // Should show highlighted text sections for analyses with position
      expect(screen.getByTestId('highlighted-text-analysis-1')).toBeInTheDocument();
      expect(screen.getByTestId('highlighted-text-analysis-3')).toBeInTheDocument();
      expect(screen.getByTestId('highlighted-text-analysis-4')).toBeInTheDocument();
      expect(screen.getByTestId('highlighted-text-analysis-5')).toBeInTheDocument();

      // Should not show highlighted text for analyses without position
      expect(screen.queryByTestId('highlighted-text-analysis-2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('highlighted-text-analysis-6')).not.toBeInTheDocument();
    });
  });

  describe('Empty State Handling', () => {
    it('should handle empty analyses array gracefully', () => {
      const props = createDefaultProps({
        analyses: []
      });

      render(<AnalysisPanel {...props} />);

      expect(screen.getByText('No Analysis Results')).toBeInTheDocument();
      expect(screen.getByText('No issues found in your prompt. Great job!')).toBeInTheDocument();
      expect(screen.getByTestId('empty-state-illustration')).toBeInTheDocument();
    });

    it('should show appropriate message for empty state', () => {
      const props = createDefaultProps({
        analyses: []
      });

      render(<AnalysisPanel {...props} />);

      expect(screen.getByText(/Your prompt looks good to go/i)).toBeInTheDocument();
    });

    it('should not display analysis count for empty state', () => {
      const props = createDefaultProps({
        analyses: []
      });

      render(<AnalysisPanel {...props} />);

      expect(screen.queryByText(/issues found/)).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      const props = createDefaultProps();
      render(<AnalysisPanel {...props} />);

      expect(screen.getByRole('region', { name: /analysis panel/i })).toBeInTheDocument();
      expect(screen.getByRole('list', { name: /analysis results/i })).toBeInTheDocument();
      
      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(6);

      // Each analysis item should have proper labeling
      listItems.forEach((item, index) => {
        expect(item).toHaveAttribute('aria-label', expect.stringContaining('analysis'));
      });
    });

    it('should support keyboard navigation', async () => {
      const mockOnAnalysisSelect = vi.fn();
      const props = createDefaultProps({
        onAnalysisSelect: mockOnAnalysisSelect
      });

      render(<AnalysisPanel {...props} />);

      const firstItem = screen.getByTestId('analysis-item-analysis-1');
      const secondItem = screen.getByTestId('analysis-item-analysis-2');

      // Should be focusable with keyboard
      firstItem.focus();
      expect(document.activeElement).toBe(firstItem);

      // Should activate with Enter
      fireEvent.keyDown(firstItem, { key: 'Enter', code: 'Enter' });
      expect(mockOnAnalysisSelect).toHaveBeenCalledWith(props.analyses[0]);

      // Should activate with Space
      await user.tab();
      expect(document.activeElement).toBe(secondItem);
      fireEvent.keyDown(secondItem, { key: ' ', code: 'Space' });
      expect(mockOnAnalysisSelect).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'analysis-2' })
      );
    });

    it('should have proper tabIndex for interactive elements', () => {
      const props = createDefaultProps();
      render(<AnalysisPanel {...props} />);

      const analysisItems = screen.getAllByTestId(/analysis-item/);
      analysisItems.forEach(item => {
        expect(item).toHaveAttribute('tabindex', '0');
      });

      const expandButtons = screen.getAllByTestId(/expand-suggestion/);
      expandButtons.forEach(button => {
        expect(button).toHaveAttribute('tabindex', '0');
      });
    });

    it('should announce selection changes to screen readers', async () => {
      const props = createDefaultProps();
      render(<AnalysisPanel {...props} />);

      const analysisItem = screen.getByTestId('analysis-item-analysis-1');
      await user.click(analysisItem);

      // Should have live region for announcements
      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveTextContent(/selected analysis.*vagueness/i);
    });

    it('should provide screen reader friendly severity indicators', () => {
      const props = createDefaultProps();
      render(<AnalysisPanel {...props} />);

      // High severity items should have screen reader text
      const highSeverityItems = screen.getAllByTestId(/high-severity/);
      highSeverityItems.forEach(item => {
        expect(item).toHaveAttribute('aria-label', expect.stringContaining('high severity'));
      });

      // Should have visually hidden text for screen readers
      expect(screen.getAllByText('High severity issue', { exact: false })).toHaveLength(2);
      expect(screen.getAllByText('Medium severity issue', { exact: false })).toHaveLength(2);
      expect(screen.getAllByText('Low severity issue', { exact: false })).toHaveLength(2);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle null analyses gracefully', () => {
      // @ts-expect-error Testing edge case with null
      const props = createDefaultProps({ analyses: null });

      expect(() => render(<AnalysisPanel {...props} />)).not.toThrow();
      
      // Should show empty state
      expect(screen.getByText('No Analysis Results')).toBeInTheDocument();
    });

    it('should handle analyses with missing required fields', () => {
      const malformedAnalyses = [
        {
          // Missing required fields
          id: 'malformed-1'
        } as PromptAnalysis,
        createMockAnalysis({
          id: 'valid-1',
          issue: '', // Empty issue
          suggestion: '' // Empty suggestion
        })
      ];

      const props = createDefaultProps({ analyses: malformedAnalyses });

      expect(() => render(<AnalysisPanel {...props} />)).not.toThrow();

      // Should show some indication of the malformed data
      expect(screen.getByText(/Unknown issue/i)).toBeInTheDocument();
      expect(screen.getByText(/No suggestion available/i)).toBeInTheDocument();
    });

    it('should handle extremely long issue descriptions', () => {
      const longIssue = 'A'.repeat(1000);
      const analysisWithLongIssue = createMockAnalysis({
        issue: longIssue,
        suggestion: 'B'.repeat(800)
      });

      const props = createDefaultProps({
        analyses: [analysisWithLongIssue]
      });

      render(<AnalysisPanel {...props} />);

      // Should truncate or handle long text appropriately
      const issueElement = screen.getByTestId('analysis-issue');
      expect(issueElement).toHaveClass('truncated');
    });

    it('should handle invalid severity values gracefully', () => {
      const analysisWithInvalidSeverity = createMockAnalysis({
        // @ts-expect-error Testing invalid severity
        severity: 'invalid'
      });

      const props = createDefaultProps({
        analyses: [analysisWithInvalidSeverity]
      });

      expect(() => render(<AnalysisPanel {...props} />)).not.toThrow();

      // Should default to medium severity or show error indicator
      const analysisItem = screen.getByTestId('analysis-item-analysis-1');
      expect(analysisItem).toHaveAttribute('data-severity', 'medium');
    });

    it('should handle invalid analysis types', () => {
      const analysisWithInvalidType = createMockAnalysis({
        // @ts-expect-error Testing invalid type
        type: 'invalid_type'
      });

      const props = createDefaultProps({
        analyses: [analysisWithInvalidType]
      });

      render(<AnalysisPanel {...props} />);

      // Should show generic type or "Unknown" label
      expect(screen.getByText('Unknown Type')).toBeInTheDocument();
    });

    it('should handle special characters in analysis content', () => {
      const analysisWithSpecialChars = createMockAnalysis({
        issue: 'Issue with <script>alert("xss")</script> and \n\n line breaks',
        suggestion: 'Suggestion with **markdown** and • bullet points'
      });

      const props = createDefaultProps({
        analyses: [analysisWithSpecialChars]
      });

      render(<AnalysisPanel {...props} />);

      // Should safely render special characters without executing scripts
      expect(screen.getByText(/Issue with.*script.*alert/)).toBeInTheDocument();
      expect(screen.queryByText('xss')).not.toBeInTheDocument(); // XSS should be prevented
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily when props are the same', () => {
      const props = createDefaultProps();
      const { rerender } = render(<AnalysisPanel {...props} />);

      const initialRenderCount = screen.getByTestId('render-count').textContent;
      
      // Re-render with same props
      rerender(<AnalysisPanel {...props} />);
      
      expect(screen.getByTestId('render-count').textContent).toBe(initialRenderCount);
    });

    it('should handle large number of analyses efficiently', () => {
      const manyAnalyses: PromptAnalysis[] = [];
      for (let i = 0; i < 100; i++) {
        manyAnalyses.push(createMockAnalysis({
          id: `analysis-${i}`,
          issue: `Issue number ${i}`,
          suggestion: `Suggestion number ${i}`
        }));
      }

      const props = createDefaultProps({ analyses: manyAnalyses });

      const startTime = performance.now();
      render(<AnalysisPanel {...props} />);
      const endTime = performance.now();

      // Should render within reasonable time (less than 100ms for 100 items)
      expect(endTime - startTime).toBeLessThan(100);

      // Should show all items or proper pagination
      expect(screen.getByText(/100 issues found/i)).toBeInTheDocument();
    });
  });
});