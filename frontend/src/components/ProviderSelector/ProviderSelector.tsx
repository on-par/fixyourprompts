/**
 * Provider Selector Component
 * 
 * A dropdown component for selecting AI providers:
 * - Shows only providers with valid API keys
 * - Updates global provider selection state
 * - Displays provider status and information
 * - Handles empty states gracefully
 * - Accessible and keyboard-friendly
 */

import React, { useCallback } from 'react';
import { useApiKeys } from '../../context/ApiKeysContext';
import { ProviderType } from '../../types/services';
import './ProviderSelector.css';

export interface ProviderSelectorProps {
  /** Optional className for custom styling */
  className?: string;
  /** Whether the selector is disabled */
  disabled?: boolean;
  /** Callback when provider selection changes */
  onProviderChange?: (provider: ProviderType | null) => void;
  /** Show settings link */
  showSettingsLink?: boolean;
  /** Callback to open settings */
  onOpenSettings?: () => void;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
}

const PROVIDER_LABELS: Record<ProviderType, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  openrouter: 'OpenRouter'
};

const PROVIDER_DESCRIPTIONS: Record<ProviderType, string> = {
  openai: 'GPT models',
  anthropic: 'Claude models',
  openrouter: 'Multiple models'
};

export const ProviderSelector: React.FC<ProviderSelectorProps> = ({
  className = '',
  disabled = false,
  onProviderChange,
  showSettingsLink = true,
  onOpenSettings,
  size = 'medium'
}) => {
  const { state, selectProvider } = useApiKeys();

  // ============================================
  // Event Handlers
  // ============================================

  const handleProviderChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    const provider = value === '' ? null : value as ProviderType;
    
    selectProvider(provider);
    onProviderChange?.(provider);
  }, [selectProvider, onProviderChange]);

  const handleSettingsClick = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    onOpenSettings?.();
  }, [onOpenSettings]);

  // ============================================
  // Computed Values
  // ============================================

  const hasAvailableProviders = state.availableProviders.length > 0;
  const isLoading = state.loading.list && !state.initialized;
  const isDisabled = disabled || isLoading || !hasAvailableProviders;

  // ============================================
  // Styles
  // ============================================

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          padding: '0.5rem 0.75rem',
          fontSize: '0.875rem'
        };
      case 'large':
        return {
          padding: '1rem 1.25rem',
          fontSize: '1.125rem'
        };
      default:
        return {
          padding: '0.75rem 1rem',
          fontSize: '1rem'
        };
    }
  };

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    minWidth: '200px'
  };

  const labelStyles: React.CSSProperties = {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '0.25rem'
  };

  const selectContainerStyles: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  };

  const selectStyles: React.CSSProperties = {
    ...getSizeStyles(),
    flex: 1,
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    backgroundColor: 'white',
    color: '#374151',
    outline: 'none',
    transition: 'all 0.2s ease',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.6 : 1
  };

  const settingsLinkStyles: React.CSSProperties = {
    fontSize: '0.75rem',
    color: '#6b7280',
    textDecoration: 'none',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    border: 'none',
    backgroundColor: 'transparent'
  };

  const helperTextStyles: React.CSSProperties = {
    fontSize: '0.75rem',
    color: '#6b7280',
    marginTop: '0.25rem'
  };

  const emptyStateStyles: React.CSSProperties = {
    padding: '1rem',
    textAlign: 'center',
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    color: '#6b7280'
  };

  // ============================================
  // Render Helpers
  // ============================================

  const renderEmptyState = () => (
    <div style={emptyStateStyles}>
      <p style={{ margin: '0 0 0.5rem 0', fontWeight: '500' }}>
        No API keys configured
      </p>
      <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem' }}>
        Add an API key to start using AI providers
      </p>
      {showSettingsLink && onOpenSettings && (
        <button
          style={{
            ...settingsLinkStyles,
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '6px'
          }}
          onClick={onOpenSettings}
        >
          Add API Key
        </button>
      )}
    </div>
  );

  const renderProviderOption = (provider: ProviderType) => {
    const keyRecord = state.keys.find(k => k.provider === provider);
    const label = PROVIDER_LABELS[provider];
    const description = PROVIDER_DESCRIPTIONS[provider];
    
    return (
      <option key={provider} value={provider}>
        {label} • {description}
        {keyRecord && !keyRecord.isValid ? ' (Invalid)' : ''}
      </option>
    );
  };

  // ============================================
  // Render
  // ============================================

  if (!hasAvailableProviders && state.initialized) {
    return (
      <div className={`provider-selector ${className}`} style={containerStyles}>
        <label style={labelStyles}>AI Provider</label>
        {renderEmptyState()}
      </div>
    );
  }

  return (
    <div className={`provider-selector ${className}`} style={containerStyles}>
      <label htmlFor="provider-select" style={labelStyles}>
        AI Provider
      </label>
      
      <div style={selectContainerStyles}>
        <select
          id="provider-select"
          style={selectStyles}
          value={state.selectedProvider || ''}
          onChange={handleProviderChange}
          disabled={isDisabled}
          aria-label="Select AI provider"
        >
          {isLoading ? (
            <option value="">Loading providers...</option>
          ) : !hasAvailableProviders ? (
            <option value="">No providers available</option>
          ) : (
            <>
              <option value="">Select a provider...</option>
              {state.availableProviders.map(renderProviderOption)}
            </>
          )}
        </select>

        {showSettingsLink && onOpenSettings && (
          <button
            style={settingsLinkStyles}
            onClick={handleSettingsClick}
            title="Manage API keys"
            aria-label="Open API key settings"
          >
            ⚙️
          </button>
        )}
      </div>

      {/* Helper text */}
      {hasAvailableProviders && state.selectedProvider && (
        <div style={helperTextStyles}>
          Using {PROVIDER_LABELS[state.selectedProvider]} for AI operations
        </div>
      )}

      {hasAvailableProviders && !state.selectedProvider && (
        <div style={helperTextStyles}>
          Select a provider to enable AI features
        </div>
      )}

      {isLoading && (
        <div style={helperTextStyles}>
          Loading available providers...
        </div>
      )}
    </div>
  );
};

export default ProviderSelector;