/**
 * API Key Settings Component
 * 
 * Provides a comprehensive interface for managing AI provider API keys:
 * - Add new API keys for OpenAI, Anthropic, and OpenRouter
 * - View and manage existing keys (masked for security)
 * - Validate keys before saving
 * - Update or delete existing keys
 * - Clear error handling and user feedback
 */

import React, { useState, useCallback } from 'react';
import { useApiKeys } from '../../context/ApiKeysContext';
import { ProviderType, ApiKeyRecord } from '../../types/services';
import './ApiKeySettings.css';

export interface ApiKeySettingsProps {
  /** Optional className for custom styling */
  className?: string;
  /** Callback when settings are closed */
  onClose?: () => void;
  /** Whether to show as a modal */
  isModal?: boolean;
}

interface FormState {
  provider: ProviderType | '';
  key: string;
  isEditing: ProviderType | null;
}

const PROVIDERS: { value: ProviderType; label: string; description: string }[] = [
  { 
    value: 'openai', 
    label: 'OpenAI', 
    description: 'GPT-4, GPT-3.5, and other OpenAI models' 
  },
  { 
    value: 'anthropic', 
    label: 'Anthropic', 
    description: 'Claude models and AI assistant' 
  },
  { 
    value: 'openrouter', 
    label: 'OpenRouter', 
    description: 'Access to multiple AI models through one API' 
  }
];

export const ApiKeySettings: React.FC<ApiKeySettingsProps> = ({ 
  className = '',
  onClose,
  isModal = false
}) => {
  const { 
    state, 
    storeKey, 
    updateKey, 
    deleteKey, 
    validateKey, 
    clearError 
  } = useApiKeys();

  const [form, setForm] = useState<FormState>({
    provider: '',
    key: '',
    isEditing: null
  });

  const [validationState, setValidationState] = useState<{
    isValidating: boolean;
    result: { valid: boolean; message: string } | null;
  }>({
    isValidating: false,
    result: null
  });

  // ============================================
  // Event Handlers
  // ============================================

  const handleProviderChange = useCallback((provider: ProviderType | '') => {
    setForm(prev => ({ ...prev, provider }));
    setValidationState({ isValidating: false, result: null });
    clearError();
  }, [clearError]);

  const handleKeyChange = useCallback((key: string) => {
    setForm(prev => ({ ...prev, key }));
    setValidationState({ isValidating: false, result: null });
    clearError();
  }, [clearError]);

  const handleValidateKey = useCallback(async () => {
    if (!form.provider || !form.key.trim()) {
      return;
    }

    setValidationState({ isValidating: true, result: null });

    try {
      const result = await validateKey(form.provider as ProviderType, form.key);
      setValidationState({ 
        isValidating: false, 
        result 
      });
    } catch (error) {
      setValidationState({ 
        isValidating: false, 
        result: { 
          valid: false, 
          message: error instanceof Error ? error.message : 'Validation failed' 
        }
      });
    }
  }, [form.provider, form.key, validateKey]);

  const handleSaveKey = useCallback(async () => {
    if (!form.provider || !form.key.trim()) {
      return;
    }

    try {
      if (form.isEditing) {
        await updateKey(form.isEditing, form.key);
      } else {
        await storeKey(form.provider as ProviderType, form.key);
      }

      // Reset form
      setForm({ provider: '', key: '', isEditing: null });
      setValidationState({ isValidating: false, result: null });
    } catch (error) {
      // Error is handled by context
      console.error('Failed to save key:', error);
    }
  }, [form, storeKey, updateKey]);

  const handleEditKey = useCallback((keyRecord: ApiKeyRecord) => {
    setForm({
      provider: keyRecord.provider,
      key: '',
      isEditing: keyRecord.provider
    });
    setValidationState({ isValidating: false, result: null });
    clearError();
  }, [clearError]);

  const handleDeleteKey = useCallback(async (provider: ProviderType) => {
    if (!confirm(`Are you sure you want to delete the ${provider} API key?`)) {
      return;
    }

    try {
      await deleteKey(provider);
    } catch (error) {
      console.error('Failed to delete key:', error);
    }
  }, [deleteKey]);

  const handleCancelEdit = useCallback(() => {
    setForm({ provider: '', key: '', isEditing: null });
    setValidationState({ isValidating: false, result: null });
    clearError();
  }, [clearError]);

  // ============================================
  // Helper Functions
  // ============================================

  const getProviderLabel = (provider: ProviderType): string => {
    return PROVIDERS.find(p => p.value === provider)?.label || provider;
  };

  const isFormValid = form.provider && form.key.trim().length > 0;
  const canSave = isFormValid && (!validationState.result || validationState.result.valid);

  // ============================================
  // Styles
  // ============================================

  const containerStyles: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '2rem',
    maxWidth: '600px',
    width: '100%',
    boxShadow: isModal ? '0 20px 25px -5px rgba(0, 0, 0, 0.1)' : 'none',
    border: isModal ? 'none' : '1px solid #e5e7eb'
  };

  const headerStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #e5e7eb'
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: 0
  };

  const closeButtonStyles: React.CSSProperties = {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '0.5rem',
    borderRadius: '6px',
    display: onClose ? 'block' : 'none'
  };

  const sectionStyles: React.CSSProperties = {
    marginBottom: '2rem'
  };

  const sectionTitleStyles: React.CSSProperties = {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '1rem'
  };

  const formStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  };

  const inputGroupStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  };

  const labelStyles: React.CSSProperties = {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151'
  };

  const selectStyles: React.CSSProperties = {
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s'
  };

  const inputStyles: React.CSSProperties = {
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '1rem',
    outline: 'none',
    fontFamily: 'monospace',
    transition: 'border-color 0.2s'
  };

  const buttonRowStyles: React.CSSProperties = {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '1rem'
  };

  const buttonStyles: React.CSSProperties = {
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '500',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s'
  };

  const primaryButtonStyles: React.CSSProperties = {
    ...buttonStyles,
    backgroundColor: '#3b82f6',
    color: 'white'
  };

  const secondaryButtonStyles: React.CSSProperties = {
    ...buttonStyles,
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: '1px solid #d1d5db'
  };

  const keyListStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  };

  const keyItemStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb'
  };

  const keyInfoStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
  };

  const keyProviderStyles: React.CSSProperties = {
    fontWeight: '500',
    color: '#1f2937'
  };

  const keyValueStyles: React.CSSStyle = {
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    color: '#6b7280'
  };

  const keyActionsStyles: React.CSSProperties = {
    display: 'flex',
    gap: '0.5rem'
  };

  const errorStyles: React.CSSProperties = {
    color: '#dc2626',
    fontSize: '0.875rem',
    marginTop: '0.5rem'
  };

  const successStyles: React.CSSProperties = {
    color: '#059669',
    fontSize: '0.875rem',
    marginTop: '0.5rem'
  };

  // ============================================
  // Render
  // ============================================

  return (
    <div className={`api-key-settings ${className}`} style={containerStyles}>
      {/* Header */}
      <div style={headerStyles}>
        <h2 style={titleStyles}>API Key Settings</h2>
        {onClose && (
          <button
            style={closeButtonStyles}
            onClick={onClose}
            aria-label="Close settings"
          >
            ✕
          </button>
        )}
      </div>

      {/* Global Error */}
      {state.error && (
        <div style={errorStyles} role="alert">
          {state.error}
        </div>
      )}

      {/* Add/Edit Form */}
      <div style={sectionStyles}>
        <h3 style={sectionTitleStyles}>
          {form.isEditing ? `Update ${getProviderLabel(form.isEditing)} Key` : 'Add New API Key'}
        </h3>
        
        <form style={formStyles} onSubmit={(e) => e.preventDefault()}>
          {!form.isEditing && (
            <div style={inputGroupStyles}>
              <label style={labelStyles} htmlFor="provider-select">
                AI Provider
              </label>
              <select
                id="provider-select"
                style={selectStyles}
                value={form.provider}
                onChange={(e) => handleProviderChange(e.target.value as ProviderType | '')}
                disabled={state.loading.store || state.loading.update}
              >
                <option value="">Select a provider...</option>
                {PROVIDERS.map(provider => (
                  <option key={provider.value} value={provider.value}>
                    {provider.label} - {provider.description}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={inputGroupStyles}>
            <label style={labelStyles} htmlFor="api-key-input">
              API Key
            </label>
            <input
              id="api-key-input"
              type="password"
              style={inputStyles}
              value={form.key}
              onChange={(e) => handleKeyChange(e.target.value)}
              placeholder={form.isEditing ? 'Enter new API key...' : 'Enter your API key...'}
              disabled={state.loading.store || state.loading.update}
            />
            
            {validationState.result && (
              <div style={validationState.result.valid ? successStyles : errorStyles}>
                {validationState.result.message}
              </div>
            )}
          </div>

          <div style={buttonRowStyles}>
            <button
              type="button"
              style={secondaryButtonStyles}
              onClick={handleValidateKey}
              disabled={!isFormValid || validationState.isValidating || state.loading.validate}
            >
              {validationState.isValidating || state.loading.validate ? 'Validating...' : 'Validate'}
            </button>
            
            <button
              type="button"
              style={primaryButtonStyles}
              onClick={handleSaveKey}
              disabled={!canSave || state.loading.store || state.loading.update}
            >
              {(state.loading.store || state.loading.update) 
                ? (form.isEditing ? 'Updating...' : 'Saving...') 
                : (form.isEditing ? 'Update' : 'Save')
              }
            </button>

            {form.isEditing && (
              <button
                type="button"
                style={secondaryButtonStyles}
                onClick={handleCancelEdit}
                disabled={state.loading.store || state.loading.update}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Existing Keys */}
      <div style={sectionStyles}>
        <h3 style={sectionTitleStyles}>Your API Keys</h3>
        
        {state.loading.list ? (
          <p>Loading keys...</p>
        ) : state.keys.length === 0 ? (
          <p style={{ color: '#6b7280', fontStyle: 'italic' }}>
            No API keys configured yet. Add one above to get started.
          </p>
        ) : (
          <div style={keyListStyles}>
            {state.keys.map(key => (
              <div key={`${key.provider}-${key.id}`} style={keyItemStyles}>
                <div style={keyInfoStyles}>
                  <div style={keyProviderStyles}>
                    {getProviderLabel(key.provider)}
                    {key.isValid ? ' ✓' : ' ✗'}
                  </div>
                  <div style={keyValueStyles}>
                    {key.maskedKey}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                    Added: {new Date(key.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div style={keyActionsStyles}>
                  <button
                    style={secondaryButtonStyles}
                    onClick={() => handleEditKey(key)}
                    disabled={state.loading.update || state.loading.delete}
                  >
                    Update
                  </button>
                  <button
                    style={{ ...secondaryButtonStyles, color: '#dc2626' }}
                    onClick={() => handleDeleteKey(key.provider)}
                    disabled={state.loading.update || state.loading.delete}
                  >
                    {state.loading.delete ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiKeySettings;