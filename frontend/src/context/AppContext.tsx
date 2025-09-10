import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { 
  AppState, 
  PromptRefinementSession, 
  UserPreferences, 
  EducationTip, 
  RefinementError 
} from '../types/core';

type AppAction =
  | { type: 'SET_CURRENT_SESSION'; payload: PromptRefinementSession }
  | { type: 'CLEAR_CURRENT_SESSION' }
  | { type: 'ADD_TO_HISTORY'; payload: PromptRefinementSession }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<UserPreferences> }
  | { type: 'SET_EDUCATION_CONTENT'; payload: EducationTip[] }
  | { type: 'RESET_STATE' };

interface AppContextValue {
  state: AppState;
  setCurrentSession: (session: PromptRefinementSession) => void;
  clearCurrentSession: () => void;
  addToHistory: (session: PromptRefinementSession) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  setEducationContent: (content: EducationTip[]) => void;
  resetState: () => void;
}

const initialUserPreferences: UserPreferences = {
  showEducationTips: true,
  preferredComplexityLevel: 'intermediate',
  darkMode: false
};

const initialState: AppState = {
  currentSession: null,
  sessionHistory: [],
  educationContentLibrary: [],
  userPreferences: initialUserPreferences
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_CURRENT_SESSION':
      return {
        ...state,
        currentSession: action.payload
      };
    
    case 'CLEAR_CURRENT_SESSION':
      return {
        ...state,
        currentSession: null
      };
    
    case 'ADD_TO_HISTORY':
      return {
        ...state,
        sessionHistory: [...state.sessionHistory, action.payload]
      };
    
    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        userPreferences: {
          ...state.userPreferences,
          ...action.payload
        }
      };
    
    case 'SET_EDUCATION_CONTENT':
      return {
        ...state,
        educationContentLibrary: action.payload
      };
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
}

const AppContext = createContext<AppContextValue | null>(null);

interface AppProviderProps {
  children: ReactNode;
  initialState?: Partial<AppState>;
}

export function AppProvider({ children, initialState: overrideState }: AppProviderProps) {
  const mergedInitialState = overrideState ? { ...initialState, ...overrideState } : initialState;
  const [state, dispatch] = useReducer(appReducer, mergedInitialState);

  const setCurrentSession = useCallback((session: PromptRefinementSession) => {
    dispatch({ type: 'SET_CURRENT_SESSION', payload: session });
  }, []);

  const clearCurrentSession = useCallback(() => {
    dispatch({ type: 'CLEAR_CURRENT_SESSION' });
  }, []);

  const addToHistory = useCallback((session: PromptRefinementSession) => {
    dispatch({ type: 'ADD_TO_HISTORY', payload: session });
  }, []);

  const updatePreferences = useCallback((preferences: Partial<UserPreferences>) => {
    dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences });
  }, []);

  const setEducationContent = useCallback((content: EducationTip[]) => {
    dispatch({ type: 'SET_EDUCATION_CONTENT', payload: content });
  }, []);

  const resetState = useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
  }, []);

  const value: AppContextValue = {
    state,
    setCurrentSession,
    clearCurrentSession,
    addToHistory,
    updatePreferences,
    setEducationContent,
    resetState
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

export { AppContext };