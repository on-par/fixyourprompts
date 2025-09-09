import React, { useId } from 'react';
import type { PromptInputProps } from '../../types/components';

/**
 * PromptInput component for entering and submitting prompts for analysis
 * 
 * Features:
 * - Multi-line textarea input
 * - Character count display with maxLength support
 * - Submit via button or Ctrl+Enter keyboard shortcut
 * - Accessible error handling and ARIA labeling
 * - Whitespace trimming on submission
 * - Disabled state support
 */
export const PromptInput: React.FC<PromptInputProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = 'Enter your prompt here...',
  maxLength,
  disabled = false,
  error
}) => {
  const textareaId = useId();
  const errorId = useId();

  // Handle textarea change events
  const handleTextareaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    let newValue = event.target.value;
    
    // Respect maxLength constraint if provided
    if (maxLength && newValue.length > maxLength) {
      newValue = newValue.substring(0, maxLength);
    }
    
    onChange(newValue);
  };

  // Handle form submission via button click
  const handleSubmitClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const trimmedValue = value.trim();
    onSubmit(trimmedValue);
  };

  // Handle keyboard shortcuts (Ctrl+Enter for submission)
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault();
      const trimmedValue = value.trim();
      onSubmit(trimmedValue);
    }
  };

  const characterCount = value.length;
  const isOverLimit = maxLength ? characterCount > maxLength : false;

  return (
    <div className="prompt-input-container">
      <div className="textarea-wrapper">
        <textarea
          id={textareaId}
          value={value}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          aria-label="Enter your prompt for analysis"
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : undefined}
          rows={4}
          style={{
            width: '100%',
            minHeight: '120px',
            padding: '12px',
            border: `2px solid ${error ? '#ef4444' : '#d1d5db'}`,
            borderRadius: '8px',
            fontSize: '16px',
            fontFamily: 'system-ui, sans-serif',
            resize: 'vertical',
            outline: 'none',
            transition: 'border-color 0.2s ease',
            backgroundColor: disabled ? '#f9fafb' : 'white',
            color: disabled ? '#9ca3af' : 'black'
          }}
        />
        
        {maxLength && (
          <div 
            style={{
              textAlign: 'right',
              fontSize: '14px',
              color: isOverLimit ? '#ef4444' : '#6b7280',
              marginTop: '4px'
            }}
          >
            {characterCount}/{maxLength}
          </div>
        )}
      </div>

      {error && (
        <div
          id={errorId}
          role="alert"
          style={{
            color: '#ef4444',
            fontSize: '14px',
            marginTop: '8px'
          }}
        >
          {error}
        </div>
      )}

      <div style={{ marginTop: '16px' }}>
        <button
          type="button"
          onClick={handleSubmitClick}
          disabled={disabled}
          style={{
            backgroundColor: disabled ? '#d1d5db' : '#3b82f6',
            color: disabled ? '#9ca3af' : 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s ease'
          }}
        >
          Analyze Prompt
        </button>
      </div>
    </div>
  );
};