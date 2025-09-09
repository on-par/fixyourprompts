/**
 * PromptOutput Component Tests
 * 
 * TDD RED PHASE: These tests are written FIRST and will FAIL until the component is implemented.
 * 
 * This test suite comprehensively tests the PromptOutput React component behavior:
 * - Rendering session data correctly
 * - Handling different session statuses
 * - Copy to clipboard functionality
 * - Button interactions and callbacks
 * - Conditional rendering based on props
 * - Edge cases and error states
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Import the component and types (these imports will FAIL initially - that's expected in RED phase)
// import { PromptOutput } from '../../../src/components/PromptOutput';
import { PromptOutputProps } from '../../../src/types/components';
import { PromptRefinementSession } from '../../../src/types/core';

// Temporary mock component for RED phase - this will be replaced with actual component
const PromptOutput = ({ session, onCopyRefined, onStartNewSession }: PromptOutputProps) => {
  throw new Error('PromptOutput component not implemented yet');
};

// Mock test data utilities
const createMockSession = (overrides?: Partial<PromptRefinementSession>): PromptRefinementSession => ({
  id: 'test-session-123',
  createdAt: new Date('2023-10-01T12:00:00Z'),
  originalPrompt: 'Write a summary',
  refinedPrompt: 'Write a comprehensive, well-structured summary that includes key points, supporting details, and clear conclusions based on the provided information.',
  analysisResults: [
    {
      id: 'analysis-1',
      type: 'vagueness',
      issue: 'The prompt lacks specificity about what type of summary is needed',
      severity: 'medium' as const,
      suggestion: 'Specify the type of summary, length, and key elements to include',
      originalText: 'Write a summary',
      position: { start: 0, end: 15 }
    }
  ],
  improvements: [
    {
      id: 'improvement-1',
      type: 'specificity_increased',
      description: 'Added specific requirements for summary structure and content',
      before: 'Write a summary',
      after: 'Write a comprehensive, well-structured summary',
      rationale: 'Specificity helps ensure the AI understands exactly what type of summary is needed'
    }
  ],
  educationTips: [
    {
      id: 'tip-1',
      technique: 'Context Setting',
      title: 'Adding Structure to Prompts',
      description: 'Well-structured prompts lead to better outputs',
      example: 'Instead of "Write a summary", use "Write a 3-paragraph summary with introduction, key points, and conclusion"',
      category: 'fundamentals',
      relevanceScore: 0.9
    }
  ],
  status: 'refined' as const,
  ...overrides
});

const createDefaultProps = (overrides?: Partial<PromptOutputProps>): PromptOutputProps => ({
  session: createMockSession(),
  onCopyRefined: vi.fn(),
  onStartNewSession: vi.fn(),
  showComparison: true,
  ...overrides
});

// Mock clipboard API
const mockClipboard = {
  writeText: vi.fn().mockResolvedValue(undefined)
};

describe('PromptOutput Component', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    // Mock clipboard API
    Object.defineProperty(navigator, 'clipboard', {
      value: mockClipboard,
      writable: true
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render the component with session data', () => {
      const props = createDefaultProps();
      render(<PromptOutput {...props} />);

      // Should display original prompt
      expect(screen.getByText('Original Prompt')).toBeInTheDocument();
      expect(screen.getByText('Write a summary')).toBeInTheDocument();

      // Should display refined prompt
      expect(screen.getByText('Refined Prompt')).toBeInTheDocument();
      expect(screen.getByText(/Write a comprehensive, well-structured summary/)).toBeInTheDocument();
    });

    it('should render with minimal required props', () => {
      const minimalSession = createMockSession({
        refinedPrompt: null,
        analysisResults: [],
        improvements: [],
        educationTips: []
      });
      const props = createDefaultProps({
        session: minimalSession,
        showComparison: false
      });

      render(<PromptOutput {...props} />);

      expect(screen.getByText('Original Prompt')).toBeInTheDocument();
      expect(screen.getByText('Write a summary')).toBeInTheDocument();
    });

    it('should display session metadata correctly', () => {
      const props = createDefaultProps();
      render(<PromptOutput {...props} />);

      // Should show session ID (possibly truncated or formatted)
      expect(screen.getByText(/test-session-123/)).toBeInTheDocument();
      
      // Should show creation date
      expect(screen.getByText(/Oct 1, 2023/)).toBeInTheDocument();
    });
  });

  describe('Session Status Handling', () => {
    it('should show analyzing state correctly', () => {
      const analyzingSession = createMockSession({
        status: 'analyzing',
        refinedPrompt: null
      });
      const props = createDefaultProps({ session: analyzingSession });

      render(<PromptOutput {...props} />);

      expect(screen.getByText(/Analyzing/)).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      
      // Copy button should be disabled during analysis
      const copyButton = screen.getByRole('button', { name: /copy/i });
      expect(copyButton).toBeDisabled();
    });

    it('should show refined state correctly', () => {
      const refinedSession = createMockSession({ status: 'refined' });
      const props = createDefaultProps({ session: refinedSession });

      render(<PromptOutput {...props} />);

      expect(screen.queryByText(/Analyzing/)).not.toBeInTheDocument();
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      
      // Copy button should be enabled
      const copyButton = screen.getByRole('button', { name: /copy/i });
      expect(copyButton).not.toBeDisabled();
    });

    it('should show error state correctly', () => {
      const errorSession = createMockSession({
        status: 'error',
        refinedPrompt: null
      });
      const props = createDefaultProps({ session: errorSession });

      render(<PromptOutput {...props} />);

      expect(screen.getByText(/Error/)).toBeInTheDocument();
      expect(screen.getByText(/Unable to refine prompt/)).toBeInTheDocument();
      
      // Should show retry option
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });

  describe('Copy Functionality', () => {
    it('should call onCopyRefined when copy button is clicked', async () => {
      const mockOnCopyRefined = vi.fn();
      const props = createDefaultProps({
        onCopyRefined: mockOnCopyRefined
      });

      render(<PromptOutput {...props} />);

      const copyButton = screen.getByRole('button', { name: /copy refined prompt/i });
      await user.click(copyButton);

      expect(mockOnCopyRefined).toHaveBeenCalledTimes(1);
      expect(mockOnCopyRefined).toHaveBeenCalledWith(
        'Write a comprehensive, well-structured summary that includes key points, supporting details, and clear conclusions based on the provided information.'
      );
    });

    it('should copy text to clipboard when copy button is clicked', async () => {
      const props = createDefaultProps();
      render(<PromptOutput {...props} />);

      const copyButton = screen.getByRole('button', { name: /copy refined prompt/i });
      await user.click(copyButton);

      expect(mockClipboard.writeText).toHaveBeenCalledTimes(1);
      expect(mockClipboard.writeText).toHaveBeenCalledWith(
        'Write a comprehensive, well-structured summary that includes key points, supporting details, and clear conclusions based on the provided information.'
      );
    });

    it('should show success feedback after successful copy', async () => {
      const props = createDefaultProps();
      render(<PromptOutput {...props} />);

      const copyButton = screen.getByRole('button', { name: /copy refined prompt/i });
      await user.click(copyButton);

      await waitFor(() => {
        expect(screen.getByText(/Copied!/)).toBeInTheDocument();
      });

      // Success message should disappear after timeout
      await waitFor(() => {
        expect(screen.queryByText(/Copied!/)).not.toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should handle copy failure gracefully', async () => {
      mockClipboard.writeText.mockRejectedValueOnce(new Error('Clipboard access denied'));
      const props = createDefaultProps();
      render(<PromptOutput {...props} />);

      const copyButton = screen.getByRole('button', { name: /copy refined prompt/i });
      await user.click(copyButton);

      await waitFor(() => {
        expect(screen.getByText(/Failed to copy/)).toBeInTheDocument();
      });
    });

    it('should not allow copying when no refined prompt exists', () => {
      const sessionWithoutRefinement = createMockSession({
        refinedPrompt: null,
        status: 'analyzing'
      });
      const props = createDefaultProps({ session: sessionWithoutRefinement });

      render(<PromptOutput {...props} />);

      const copyButton = screen.getByRole('button', { name: /copy/i });
      expect(copyButton).toBeDisabled();
    });
  });

  describe('Button Interactions', () => {
    it('should call onStartNewSession when new session button is clicked', async () => {
      const mockOnStartNewSession = vi.fn();
      const props = createDefaultProps({
        onStartNewSession: mockOnStartNewSession
      });

      render(<PromptOutput {...props} />);

      const newSessionButton = screen.getByRole('button', { name: /start new session/i });
      await user.click(newSessionButton);

      expect(mockOnStartNewSession).toHaveBeenCalledTimes(1);
    });

    it('should show confirmation dialog before starting new session', async () => {
      const mockOnStartNewSession = vi.fn();
      const props = createDefaultProps({
        onStartNewSession: mockOnStartNewSession
      });

      render(<PromptOutput {...props} />);

      const newSessionButton = screen.getByRole('button', { name: /start new session/i });
      await user.click(newSessionButton);

      // Should show confirmation dialog
      expect(screen.getByText(/Start a new session?/)).toBeInTheDocument();
      expect(screen.getByText(/This will clear your current work/)).toBeInTheDocument();

      // Confirm the action
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      expect(mockOnStartNewSession).toHaveBeenCalledTimes(1);
    });
  });

  describe('Comparison View', () => {
    it('should show comparison view when showComparison is true', () => {
      const props = createDefaultProps({ showComparison: true });
      render(<PromptOutput {...props} />);

      expect(screen.getByText('Original Prompt')).toBeInTheDocument();
      expect(screen.getByText('Refined Prompt')).toBeInTheDocument();
      
      // Should show side-by-side or diff view
      expect(screen.getByTestId('prompt-comparison')).toBeInTheDocument();
    });

    it('should hide comparison view when showComparison is false', () => {
      const props = createDefaultProps({ showComparison: false });
      render(<PromptOutput {...props} />);

      // Should only show refined prompt
      expect(screen.getByText('Refined Prompt')).toBeInTheDocument();
      expect(screen.queryByText('Original Prompt')).not.toBeInTheDocument();
      expect(screen.queryByTestId('prompt-comparison')).not.toBeInTheDocument();
    });

    it('should highlight differences between original and refined prompts', () => {
      const props = createDefaultProps({ showComparison: true });
      render(<PromptOutput {...props} />);

      // Should show highlighted additions in refined prompt
      const additions = screen.getAllByTestId('diff-addition');
      expect(additions.length).toBeGreaterThan(0);
      
      // Check for specific highlighted text
      expect(screen.getByText('comprehensive, well-structured')).toHaveClass('diff-addition');
    });
  });

  describe('Analysis and Improvements Display', () => {
    it('should display analysis results', () => {
      const props = createDefaultProps();
      render(<PromptOutput {...props} />);

      expect(screen.getByText('Analysis Results')).toBeInTheDocument();
      expect(screen.getByText('The prompt lacks specificity about what type of summary is needed')).toBeInTheDocument();
      expect(screen.getByText('Vagueness')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
    });

    it('should display improvements made', () => {
      const props = createDefaultProps();
      render(<PromptOutput {...props} />);

      expect(screen.getByText('Improvements Made')).toBeInTheDocument();
      expect(screen.getByText('Added specific requirements for summary structure and content')).toBeInTheDocument();
      expect(screen.getByText('Specificity helps ensure the AI understands exactly what type of summary is needed')).toBeInTheDocument();
    });

    it('should display education tips', () => {
      const props = createDefaultProps();
      render(<PromptOutput {...props} />);

      expect(screen.getByText('Education Tips')).toBeInTheDocument();
      expect(screen.getByText('Adding Structure to Prompts')).toBeInTheDocument();
      expect(screen.getByText('Well-structured prompts lead to better outputs')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null refined prompt gracefully', () => {
      const sessionWithNullRefinement = createMockSession({
        refinedPrompt: null
      });
      const props = createDefaultProps({ session: sessionWithNullRefinement });

      render(<PromptOutput {...props} />);

      expect(screen.getByText('Original Prompt')).toBeInTheDocument();
      expect(screen.queryByText('Refined Prompt')).not.toBeInTheDocument();
      expect(screen.getByText(/No refined prompt available/)).toBeInTheDocument();
    });

    it('should handle empty analysis results array', () => {
      const sessionWithoutAnalysis = createMockSession({
        analysisResults: []
      });
      const props = createDefaultProps({ session: sessionWithoutAnalysis });

      render(<PromptOutput {...props} />);

      expect(screen.getByText(/No analysis results available/)).toBeInTheDocument();
    });

    it('should handle empty improvements array', () => {
      const sessionWithoutImprovements = createMockSession({
        improvements: []
      });
      const props = createDefaultProps({ session: sessionWithoutImprovements });

      render(<PromptOutput {...props} />);

      expect(screen.getByText(/No improvements made/)).toBeInTheDocument();
    });

    it('should handle very long prompts correctly', () => {
      const longPrompt = 'A'.repeat(5000);
      const sessionWithLongPrompt = createMockSession({
        originalPrompt: longPrompt,
        refinedPrompt: longPrompt + ' with improvements'
      });
      const props = createDefaultProps({ session: sessionWithLongPrompt });

      render(<PromptOutput {...props} />);

      // Should truncate or handle long text appropriately
      expect(screen.getByTestId('original-prompt-container')).toBeInTheDocument();
      expect(screen.getByTestId('refined-prompt-container')).toBeInTheDocument();
    });

    it('should handle special characters and formatting in prompts', () => {
      const promptWithSpecialChars = 'Test prompt with\n\nline breaks\n\n• bullet points\n• more bullets\n\nAnd **markdown** formatting';
      const sessionWithFormatting = createMockSession({
        originalPrompt: promptWithSpecialChars,
        refinedPrompt: promptWithSpecialChars + '\n\nWith additional improvements'
      });
      const props = createDefaultProps({ session: sessionWithFormatting });

      render(<PromptOutput {...props} />);

      // Should preserve formatting
      expect(screen.getByText(/line breaks/)).toBeInTheDocument();
      expect(screen.getByText(/bullet points/)).toBeInTheDocument();
      expect(screen.getByText(/markdown/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      const props = createDefaultProps();
      render(<PromptOutput {...props} />);

      expect(screen.getByRole('region', { name: /prompt output/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /copy refined prompt/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /start new session/i })).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const props = createDefaultProps();
      render(<PromptOutput {...props} />);

      const copyButton = screen.getByRole('button', { name: /copy refined prompt/i });
      const newSessionButton = screen.getByRole('button', { name: /start new session/i });

      // Should be focusable with keyboard
      copyButton.focus();
      expect(document.activeElement).toBe(copyButton);

      // Should be able to activate with Enter
      fireEvent.keyDown(copyButton, { key: 'Enter', code: 'Enter' });
      expect(props.onCopyRefined).toHaveBeenCalled();

      // Should be able to navigate between buttons
      await user.tab();
      expect(document.activeElement).toBe(newSessionButton);
    });

    it('should announce status changes to screen readers', async () => {
      const props = createDefaultProps();
      const { rerender } = render(<PromptOutput {...props} />);

      // Should have live region for status updates
      expect(screen.getByRole('status')).toBeInTheDocument();

      // Update to analyzing status
      const analyzingSession = createMockSession({ status: 'analyzing' });
      rerender(<PromptOutput {...props} session={analyzingSession} />);

      await waitFor(() => {
        expect(screen.getByRole('status')).toHaveTextContent(/analyzing/i);
      });
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily when props are the same', () => {
      const props = createDefaultProps();
      const { rerender } = render(<PromptOutput {...props} />);

      const initialRenderCount = screen.getByTestId('render-count').textContent;
      
      // Re-render with same props
      rerender(<PromptOutput {...props} />);
      
      expect(screen.getByTestId('render-count').textContent).toBe(initialRenderCount);
    });

    it('should handle rapid prop changes gracefully', () => {
      const props = createDefaultProps();
      const { rerender } = render(<PromptOutput {...props} />);

      // Rapidly change session status multiple times
      for (let i = 0; i < 10; i++) {
        const updatedSession = createMockSession({
          status: i % 2 === 0 ? 'analyzing' : 'refined'
        });
        rerender(<PromptOutput {...props} session={updatedSession} />);
      }

      // Component should still be functional
      expect(screen.getByRole('region', { name: /prompt output/i })).toBeInTheDocument();
    });
  });
});