/**
 * API Keys Context
 * 
 * Provides global state management for API keys including:
 * - Current API keys for all providers
 * - Selected provider for prompt processing
 * - Loading and error states
 * - Hooks for components to interact with API key state
 */

import React, { createContext, useContext, useReducer, useCallback, useEffect, ReactNode } from 'react';
import { ApiKeyRecord, ProviderType, ValidationResult } from '../types/services';
import { apiKeyService } from '../services/ApiKeyService';

// ============================================
// State Types
// ============================================

interface ApiKeysState {
  /** List of all user's API keys */
  keys: ApiKeyRecord[];
  /** Currently selected provider for AI operations */
  selectedProvider: ProviderType | null;
  /** Available providers (those with valid keys) */
  availableProviders: ProviderType[];
  /** Loading states for different operations */
  loading: {
    list: boolean;
    store: boolean;
    update: boolean;
    delete: boolean;
    validate: boolean;
  };
  /** Error state */
  error: string | null;
  /** Whether the initial load has completed */
  initialized: boolean;
}

// ============================================
// Action Types
// ============================================

type ApiKeysAction =
  | { type: 'SET_LOADING'; operation: keyof ApiKeysState['loading']; value: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SET_KEYS'; keys: ApiKeyRecord[] }
  | { type: 'ADD_KEY'; key: ApiKeyRecord }
  | { type: 'UPDATE_KEY'; key: ApiKeyRecord }
  | { type: 'REMOVE_KEY'; provider: ProviderType }
  | { type: 'SET_SELECTED_PROVIDER'; provider: ProviderType | null }
  | { type: 'SET_AVAILABLE_PROVIDERS'; providers: ProviderType[] }
  | { type: 'SET_INITIALIZED'; value: boolean }
  | { type: 'RESET_STATE' };

// ============================================
// Context Interface
// ============================================

interface ApiKeysContextValue {
  state: ApiKeysState;
  
  // Key management actions
  loadKeys: () => Promise<void>;
  storeKey: (provider: ProviderType, key: string) => Promise<ApiKeyRecord>;
  updateKey: (provider: ProviderType, key: string) => Promise<ApiKeyRecord>;
  deleteKey: (provider: ProviderType) => Promise<void>;
  validateKey: (provider: ProviderType, key: string) => Promise<ValidationResult>;
  
  // Provider selection
  selectProvider: (provider: ProviderType | null) => void;
  
  // Utility functions
  hasValidKey: (provider: ProviderType) => boolean;
  getKeyForProvider: (provider: ProviderType) => ApiKeyRecord | null;
  
  // State management
  clearError: () => void;
  reset: () => void;
}

// ============================================
// Initial State
// ============================================

const initialState: ApiKeysState = {
  keys: [],
  selectedProvider: null,
  availableProviders: [],
  loading: {
    list: false,
    store: false,
    update: false,
    delete: false,
    validate: false
  },
  error: null,
  initialized: false
};

// ============================================
// Reducer
// ============================================

function apiKeysReducer(state: ApiKeysState, action: ApiKeysAction): ApiKeysState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.operation]: action.value
        }
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.error
      };

    case 'SET_KEYS': {
      const validProviders = action.keys
        .filter(key => key.isValid)
        .map(key => key.provider);
      
      return {
        ...state,
        keys: action.keys,
        availableProviders: validProviders,
        // Reset selected provider if it's no longer available
        selectedProvider: validProviders.includes(state.selectedProvider!) 
          ? state.selectedProvider 
          : validProviders[0] || null
      };
    }

    case 'ADD_KEY': {
      const newKeys = [...state.keys, action.key];
      const validProviders = newKeys
        .filter(key => key.isValid)
        .map(key => key.provider);
      
      return {
        ...state,
        keys: newKeys,
        availableProviders: validProviders,
        // Auto-select new provider if none selected
        selectedProvider: state.selectedProvider || (action.key.isValid ? action.key.provider : state.selectedProvider)
      };
    }

    case 'UPDATE_KEY': {
      const newKeys = state.keys.map(key => 
        key.provider === action.key.provider ? action.key : key
      );
      const validProviders = newKeys
        .filter(key => key.isValid)
        .map(key => key.provider);
      
      return {
        ...state,
        keys: newKeys,
        availableProviders: validProviders,
        // Reset selected provider if it's no longer valid
        selectedProvider: validProviders.includes(state.selectedProvider!) 
          ? state.selectedProvider 
          : validProviders[0] || null
      };
    }

    case 'REMOVE_KEY': {
      const newKeys = state.keys.filter(key => key.provider !== action.provider);
      const validProviders = newKeys
        .filter(key => key.isValid)
        .map(key => key.provider);
      
      return {
        ...state,
        keys: newKeys,
        availableProviders: validProviders,
        // Reset selected provider if it was the deleted one
        selectedProvider: state.selectedProvider === action.provider 
          ? validProviders[0] || null 
          : state.selectedProvider
      };
    }

    case 'SET_SELECTED_PROVIDER':
      return {
        ...state,
        selectedProvider: action.provider
      };

    case 'SET_AVAILABLE_PROVIDERS':
      return {
        ...state,
        availableProviders: action.providers
      };

    case 'SET_INITIALIZED':
      return {
        ...state,
        initialized: action.value
      };

    case 'RESET_STATE':
      return initialState;

    default:
      return state;
  }
}

// ============================================
// Context Creation
// ============================================

const ApiKeysContext = createContext<ApiKeysContextValue | null>(null);

// ============================================
// Provider Component
// ============================================

interface ApiKeysProviderProps {
  children: ReactNode;
  userId?: string;
}

export const ApiKeysProvider: React.FC<ApiKeysProviderProps> = ({ 
  children, 
  userId = 'default-user' 
}) => {
  const [state, dispatch] = useReducer(apiKeysReducer, initialState);

  // Update service configuration when userId changes
  useEffect(() => {
    apiKeyService.updateConfig({ userId });
  }, [userId]);

  // Load keys on mount
  useEffect(() => {
    loadKeys();
  }, []);

  // ============================================
  // Action Implementations
  // ============================================

  const loadKeys = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', operation: 'list', value: true });
    dispatch({ type: 'SET_ERROR', error: null });

    try {
      const keys = await apiKeyService.listApiKeys();
      dispatch({ type: 'SET_KEYS', keys });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load API keys';
      dispatch({ type: 'SET_ERROR', error: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', operation: 'list', value: false });
      dispatch({ type: 'SET_INITIALIZED', value: true });
    }
  }, []);

  const storeKey = useCallback(async (provider: ProviderType, key: string): Promise<ApiKeyRecord> => {
    dispatch({ type: 'SET_LOADING', operation: 'store', value: true });
    dispatch({ type: 'SET_ERROR', error: null });

    try {
      const newKey = await apiKeyService.storeApiKey({ provider, key });
      dispatch({ type: 'ADD_KEY', key: newKey });
      return newKey;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to store API key';
      dispatch({ type: 'SET_ERROR', error: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', operation: 'store', value: false });
    }
  }, []);

  const updateKey = useCallback(async (provider: ProviderType, key: string): Promise<ApiKeyRecord> => {
    dispatch({ type: 'SET_LOADING', operation: 'update', value: true });
    dispatch({ type: 'SET_ERROR', error: null });

    try {
      const updatedKey = await apiKeyService.updateApiKey(provider, { key });
      dispatch({ type: 'UPDATE_KEY', key: updatedKey });
      return updatedKey;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update API key';
      dispatch({ type: 'SET_ERROR', error: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', operation: 'update', value: false });
    }
  }, []);

  const deleteKey = useCallback(async (provider: ProviderType): Promise<void> => {
    dispatch({ type: 'SET_LOADING', operation: 'delete', value: true });
    dispatch({ type: 'SET_ERROR', error: null });

    try {
      await apiKeyService.deleteApiKey(provider);
      dispatch({ type: 'REMOVE_KEY', provider });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete API key';
      dispatch({ type: 'SET_ERROR', error: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', operation: 'delete', value: false });
    }
  }, []);

  const validateKey = useCallback(async (provider: ProviderType, key: string): Promise<ValidationResult> => {
    dispatch({ type: 'SET_LOADING', operation: 'validate', value: true });
    dispatch({ type: 'SET_ERROR', error: null });

    try {
      const result = await apiKeyService.validateApiKey({ provider, key });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to validate API key';
      dispatch({ type: 'SET_ERROR', error: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', operation: 'validate', value: false });
    }
  }, []);

  const selectProvider = useCallback((provider: ProviderType | null) => {
    dispatch({ type: 'SET_SELECTED_PROVIDER', provider });
  }, []);

  const hasValidKey = useCallback((provider: ProviderType): boolean => {
    return state.keys.some(key => key.provider === provider && key.isValid);
  }, [state.keys]);

  const getKeyForProvider = useCallback((provider: ProviderType): ApiKeyRecord | null => {
    return state.keys.find(key => key.provider === provider) || null;
  }, [state.keys]);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', error: null });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
  }, []);

  // ============================================
  // Context Value
  // ============================================

  const contextValue: ApiKeysContextValue = {
    state,
    loadKeys,
    storeKey,
    updateKey,
    deleteKey,
    validateKey,
    selectProvider,
    hasValidKey,
    getKeyForProvider,
    clearError,
    reset
  };

  return (
    <ApiKeysContext.Provider value={contextValue}>
      {children}
    </ApiKeysContext.Provider>
  );
};

// ============================================
// Hook
// ============================================

export const useApiKeys = (): ApiKeysContextValue => {
  const context = useContext(ApiKeysContext);
  
  if (!context) {
    throw new Error('useApiKeys must be used within an ApiKeysProvider');
  }
  
  return context;
};

export default ApiKeysContext;