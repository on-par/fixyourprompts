/**
 * PromptInput Component Tests
 * 
 * These are FAILING tests written in the RED phase of TDD.
 * The PromptInput component doesn't exist yet - these tests define
 * the expected behavior that will guide the implementation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Import the component that doesn't exist yet - this will cause the test to fail
import { PromptInput } from '../PromptInput';
import type { PromptInputProps } from '../../types/components';

// Test utilities
const renderWithProviders = (ui: React.ReactElement) => {
  // Add any necessary providers here (Context, Redux, etc.)
  return render(ui);
};

// Default props for testing
const defaultProps: PromptInputProps = {
  value: '',
  onChange: vi.fn(),
  onSubmit: vi.fn(),
  placeholder: 'Enter your prompt here...',
  maxLength: 1000,
  disabled: false,
  error: undefined,
};

describe('PromptInput Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render with default placeholder text', () => {
      renderWithProviders(<PromptInput {...defaultProps} />);
      
      expect(screen.getByPlaceholderText('Enter your prompt here...')).toBeInTheDocument();
    });

    it('should render with custom placeholder text', () => {
      const customPlaceholder = 'Type your AI prompt...';
      renderWithProviders(
        <PromptInput {...defaultProps} placeholder={customPlaceholder} />
      );
      
      expect(screen.getByPlaceholderText(customPlaceholder)).toBeInTheDocument();
    });

    it('should render as a textarea element for multi-line input', () => {
      renderWithProviders(<PromptInput {...defaultProps} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
      expect(textarea.tagName.toLowerCase()).toBe('textarea');
    });

    it('should display the current value', () => {
      const testValue = 'Test prompt content';
      renderWithProviders(<PromptInput {...defaultProps} value={testValue} />);
      
      expect(screen.getByDisplayValue(testValue)).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onChange when user types in the input', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();
      
      renderWithProviders(
        <PromptInput {...defaultProps} onChange={mockOnChange} />
      );
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'New text');
      
      expect(mockOnChange).toHaveBeenCalled();
      expect(mockOnChange).toHaveBeenLastCalledWith(expect.stringContaining('New text'));
    });

    it('should call onSubmit when form is submitted via button click', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      const testValue = 'Submit this prompt';
      
      renderWithProviders(
        <PromptInput {...defaultProps} value={testValue} onSubmit={mockOnSubmit} />
      );
      
      const submitButton = screen.getByRole('button', { name: /submit|analyze/i });
      await user.click(submitButton);
      
      expect(mockOnSubmit).toHaveBeenCalledWith(testValue);
    });

    it('should call onSubmit when Enter key is pressed with Ctrl modifier', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      const testValue = 'Keyboard submit test';
      
      renderWithProviders(
        <PromptInput {...defaultProps} value={testValue} onSubmit={mockOnSubmit} />
      );
      
      const textarea = screen.getByRole('textbox');
      await user.click(textarea);
      await user.keyboard('{Control>}{Enter}{/Control}');
      
      expect(mockOnSubmit).toHaveBeenCalledWith(testValue);
    });

    it('should not call onSubmit when Enter is pressed without modifier', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      
      renderWithProviders(
        <PromptInput {...defaultProps} onSubmit={mockOnSubmit} />
      );
      
      const textarea = screen.getByRole('textbox');
      await user.click(textarea);
      await user.keyboard('{Enter}');
      
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Props Handling', () => {
    it('should respect maxLength constraint', () => {
      const maxLength = 500;
      renderWithProviders(
        <PromptInput {...defaultProps} maxLength={maxLength} />
      );
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('maxLength', maxLength.toString());
    });

    it('should display character count when maxLength is provided', () => {
      const maxLength = 100;
      const currentValue = 'Test prompt';
      
      renderWithProviders(
        <PromptInput {...defaultProps} value={currentValue} maxLength={maxLength} />
      );
      
      expect(screen.getByText(`${currentValue.length}/${maxLength}`)).toBeInTheDocument();
    });

    it('should be disabled when disabled prop is true', () => {
      renderWithProviders(<PromptInput {...defaultProps} disabled={true} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeDisabled();
    });

    it('should disable submit button when disabled prop is true', () => {
      renderWithProviders(<PromptInput {...defaultProps} disabled={true} />);
      
      const submitButton = screen.getByRole('button', { name: /submit|analyze/i });
      expect(submitButton).toBeDisabled();
    });

    it('should display error message when error prop is provided', () => {
      const errorMessage = 'Prompt is too short';
      renderWithProviders(
        <PromptInput {...defaultProps} error={errorMessage} />
      );
      
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should add error styling when error prop is provided', () => {
      const errorMessage = 'Invalid prompt format';
      renderWithProviders(
        <PromptInput {...defaultProps} error={errorMessage} />
      );
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderWithProviders(<PromptInput {...defaultProps} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-label', expect.stringContaining('prompt'));
    });

    it('should associate error message with input via aria-describedby', () => {
      const errorMessage = 'Field is required';
      renderWithProviders(
        <PromptInput {...defaultProps} error={errorMessage} />
      );
      
      const textarea = screen.getByRole('textbox');
      const errorElement = screen.getByRole('alert');
      
      expect(textarea).toHaveAttribute('aria-describedby', errorElement.id);
    });

    it('should be focusable and receive focus', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PromptInput {...defaultProps} />);
      
      const textarea = screen.getByRole('textbox');
      await user.click(textarea);
      
      expect(textarea).toHaveFocus();
    });

    it('should support keyboard navigation to submit button', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PromptInput {...defaultProps} />);
      
      await user.tab(); // Focus textarea
      await user.tab(); // Focus submit button
      
      const submitButton = screen.getByRole('button', { name: /submit|analyze/i });
      expect(submitButton).toHaveFocus();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty input submission gracefully', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      
      renderWithProviders(
        <PromptInput {...defaultProps} value="" onSubmit={mockOnSubmit} />
      );
      
      const submitButton = screen.getByRole('button', { name: /submit|analyze/i });
      await user.click(submitButton);
      
      expect(mockOnSubmit).toHaveBeenCalledWith('');
    });

    it('should trim whitespace before submission', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      const valueWithWhitespace = '  Test prompt with spaces  ';
      
      renderWithProviders(
        <PromptInput {...defaultProps} value={valueWithWhitespace} onSubmit={mockOnSubmit} />
      );
      
      const submitButton = screen.getByRole('button', { name: /submit|analyze/i });
      await user.click(submitButton);
      
      expect(mockOnSubmit).toHaveBeenCalledWith('Test prompt with spaces');
    });

    it('should handle extremely long text input', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();
      const longText = 'a'.repeat(2000);
      
      renderWithProviders(
        <PromptInput {...defaultProps} maxLength={1000} onChange={mockOnChange} />
      );
      
      const textarea = screen.getByRole('textbox');
      await user.clear(textarea);
      await user.type(textarea, longText);
      
      expect(mockOnChange).toHaveBeenCalled();
      // Should respect maxLength constraint
      expect(textarea.value).toHaveLength(1000);
    });

    it('should handle special characters in input', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();
      const specialCharacters = '!@#$%^&*()[]{}|\\:";\'<>?,./ ñáéíóú';
      
      renderWithProviders(
        <PromptInput {...defaultProps} onChange={mockOnChange} />
      );
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, specialCharacters);
      
      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should maintain focus after error state changes', async () => {
      const { rerender } = renderWithProviders(
        <PromptInput {...defaultProps} />
      );
      
      const textarea = screen.getByRole('textbox');
      textarea.focus();
      expect(textarea).toHaveFocus();
      
      // Rerender with error
      rerender(<PromptInput {...defaultProps} error="Test error" />);
      
      expect(textarea).toHaveFocus();
    });
  });

  describe('Performance', () => {
    it('should not cause excessive re-renders when typing', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();
      
      renderWithProviders(
        <PromptInput {...defaultProps} onChange={mockOnChange} />
      );
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'test');
      
      // Should call onChange for each character typed (4 times for 'test')
      expect(mockOnChange).toHaveBeenCalledTimes(4);
    });

    it('should debounce rapid keystrokes appropriately', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();
      
      renderWithProviders(
        <PromptInput {...defaultProps} onChange={mockOnChange} />
      );
      
      const textarea = screen.getByRole('textbox');
      
      // Type rapidly
      await user.type(textarea, 'rapid typing test', { delay: 1 });
      
      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe('Form Integration', () => {
    it('should work within a form element', () => {
      renderWithProviders(
        <form>
          <PromptInput {...defaultProps} />
        </form>
      );
      
      const form = screen.getByRole('textbox').closest('form');
      expect(form).toBeInTheDocument();
    });

    it('should prevent default form submission on Enter+Ctrl', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      const formSubmitHandler = vi.fn((e) => e.preventDefault());
      
      renderWithProviders(
        <form onSubmit={formSubmitHandler}>
          <PromptInput {...defaultProps} onSubmit={mockOnSubmit} />
        </form>
      );
      
      const textarea = screen.getByRole('textbox');
      await user.click(textarea);
      await user.keyboard('{Control>}{Enter}{/Control}');
      
      expect(mockOnSubmit).toHaveBeenCalled();
      expect(formSubmitHandler).not.toHaveBeenCalled();
    });
  });
});