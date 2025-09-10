import { useState, useCallback, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { 
  PromptRefinementSession, 
  PromptAnalysis, 
  RefinementStatus, 
  RefinementError,
  EducationTip
} from '../types/core';
import { RefinementResult } from '../types/services';
import { PromptAnalyzer } from '../services/PromptAnalyzer';
import { PromptRefiner } from '../services/PromptRefiner';
import { EducationContentService } from '../services/EducationContentService';
import { StorageService } from '../utils/storage';
import { v4 as uuidv4 } from 'uuid';

export interface UseRefinementResult {
  currentPrompt: string;
  setCurrentPrompt: (prompt: string) => void;
  currentSession: PromptRefinementSession | null;
  isAnalyzing: boolean;
  isRefining: boolean;
  error: RefinementError | null;
  analyzePrompt: () => Promise<void>;
  refinePrompt: () => Promise<void>;
  resetSession: () => void;
  clearError: () => void;
  getEducationTips: () => EducationTip[];
}

export interface UseSessionHistoryResult {
  sessionHistory: PromptRefinementSession[];
  saveCurrentSession: () => void;
  loadSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  clearHistory: () => void;
}

const promptAnalyzer = new PromptAnalyzer();
const promptRefiner = new PromptRefiner();
const educationService = new EducationContentService();
const storageService = new StorageService();

/**
 * Main hook for managing prompt refinement workflow
 */
export function useRefinement(): UseRefinementResult {
  const { state, setCurrentSession, clearCurrentSession } = useAppContext();
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState<RefinementError | null>(null);

  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  const analyzePrompt = useCallback(async (): Promise<void> => {
    if (!currentPrompt.trim()) {
      setError({
        type: 'validation',
        message: 'Please enter a prompt to analyze',
        recoverable: true
      });
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Create new session
      const newSession: PromptRefinementSession = {
        id: uuidv4(),
        createdAt: new Date(),
        originalPrompt: currentPrompt.trim(),
        refinedPrompt: null,
        analysisResults: [],
        improvements: [],
        educationTips: [],
        status: 'analyzing'
      };

      setCurrentSession(newSession);

      // Perform analysis
      const analyses = await promptAnalyzer.analyzePrompt(currentPrompt.trim());
      
      // Get relevant education tips
      const educationTips = await educationService.getRelevantTips(
        currentPrompt.trim(),
        analyses,
        state.userPreferences.preferredComplexityLevel
      );

      // Update session with results
      const updatedSession: PromptRefinementSession = {
        ...newSession,
        analysisResults: analyses,
        educationTips,
        status: analyses.length > 0 ? 'draft' : 'refined'
      };

      setCurrentSession(updatedSession);

    } catch (err) {
      const refinementError: RefinementError = {
        type: 'analysis',
        message: err instanceof Error ? err.message : 'Analysis failed',
        originalPrompt: currentPrompt,
        recoverable: true
      };
      setError(refinementError);
      clearCurrentSession();
    } finally {
      setIsAnalyzing(false);
    }
  }, [currentPrompt, setCurrentSession, clearCurrentSession, state.userPreferences.preferredComplexityLevel]);

  const refinePrompt = useCallback(async (): Promise<void> => {
    if (!state.currentSession || state.currentSession.analysisResults.length === 0) {
      setError({
        type: 'refinement',
        message: 'No analysis results available for refinement',
        recoverable: true
      });
      return;
    }

    setIsRefining(true);
    setError(null);

    try {
      // Perform refinement
      const refinementResult: RefinementResult = await promptRefiner.refinePrompt(
        state.currentSession.originalPrompt,
        state.currentSession.analysisResults
      );

      // Update session with refined prompt
      const updatedSession: PromptRefinementSession = {
        ...state.currentSession,
        refinedPrompt: refinementResult.refinedPrompt,
        improvements: refinementResult.improvements,
        status: 'refined'
      };

      setCurrentSession(updatedSession);

    } catch (err) {
      const refinementError: RefinementError = {
        type: 'refinement',
        message: err instanceof Error ? err.message : 'Refinement failed',
        originalPrompt: state.currentSession.originalPrompt,
        recoverable: true
      };
      setError(refinementError);
    } finally {
      setIsRefining(false);
    }
  }, [state.currentSession, setCurrentSession]);

  const resetSession = useCallback((): void => {
    setCurrentPrompt('');
    clearCurrentSession();
    setError(null);
    setIsAnalyzing(false);
    setIsRefining(false);
  }, [clearCurrentSession]);

  const getEducationTips = useCallback((): EducationTip[] => {
    if (!state.currentSession) {return [];}
    return state.currentSession.educationTips;
  }, [state.currentSession]);

  return {
    currentPrompt,
    setCurrentPrompt,
    currentSession: state.currentSession,
    isAnalyzing,
    isRefining,
    error,
    analyzePrompt,
    refinePrompt,
    resetSession,
    clearError,
    getEducationTips
  };
}

/**
 * Hook for managing session history and persistence
 */
export function useSessionHistory(): UseSessionHistoryResult {
  const { state, addToHistory, setCurrentSession } = useAppContext();
  const [sessionHistory, setSessionHistory] = useState<PromptRefinementSession[]>([]);

  // Load session history from storage on mount
  useEffect(() => {
    try {
      const storedSessions = storageService.loadSessions();
      setSessionHistory(storedSessions);
    } catch (error) {
      console.error('Failed to load session history:', error);
    }
  }, []);

  const saveCurrentSession = useCallback((): void => {
    if (!state.currentSession) {
      return;
    }

    try {
      storageService.saveSession(state.currentSession);
      addToHistory(state.currentSession);
      setSessionHistory(prev => {
        const existingIndex = prev.findIndex(s => s.id === state.currentSession!.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = state.currentSession!;
          return updated;
        }
        return [...prev, state.currentSession!];
      });
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }, [state.currentSession, addToHistory]);

  const loadSession = useCallback((sessionId: string): void => {
    try {
      const session = storageService.getSessionById(sessionId);
      if (session) {
        setCurrentSession(session);
      }
    } catch (error) {
      console.error('Failed to load session:', error);
    }
  }, [setCurrentSession]);

  const deleteSession = useCallback((sessionId: string): void => {
    try {
      storageService.deleteSession(sessionId);
      setSessionHistory(prev => prev.filter(s => s.id !== sessionId));
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  }, []);

  const clearHistory = useCallback((): void => {
    try {
      storageService.clearSessions();
      setSessionHistory([]);
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  }, []);

  return {
    sessionHistory,
    saveCurrentSession,
    loadSession,
    deleteSession,
    clearHistory
  };
}

/**
 * Hook for managing user preferences
 */
export function usePreferences() {
  const { state, updatePreferences } = useAppContext();

  const toggleDarkMode = useCallback((): void => {
    updatePreferences({ darkMode: !state.userPreferences.darkMode });
  }, [state.userPreferences.darkMode, updatePreferences]);

  const toggleEducationTips = useCallback((): void => {
    updatePreferences({ showEducationTips: !state.userPreferences.showEducationTips });
  }, [state.userPreferences.showEducationTips, updatePreferences]);

  const setComplexityLevel = useCallback((level: 'beginner' | 'intermediate' | 'advanced'): void => {
    updatePreferences({ preferredComplexityLevel: level });
  }, [updatePreferences]);

  return {
    preferences: state.userPreferences,
    toggleDarkMode,
    toggleEducationTips,
    setComplexityLevel,
    updatePreferences
  };
}

/**
 * Hook for handling workflow orchestration and error recovery
 */
export function useWorkflow() {
  const refinement = useRefinement();
  const sessionHistory = useSessionHistory();

  const startNewRefinement = useCallback(async (prompt: string): Promise<void> => {
    refinement.resetSession();
    refinement.setCurrentPrompt(prompt);
    await refinement.analyzePrompt();
  }, [refinement]);

  const completeRefinement = useCallback(async (): Promise<void> => {
    if (refinement.currentSession?.analysisResults.length) {
      await refinement.refinePrompt();
      sessionHistory.saveCurrentSession();
    }
  }, [refinement, sessionHistory]);

  const retryOnError = useCallback(async (): Promise<void> => {
    if (refinement.error?.type === 'analysis') {
      refinement.clearError();
      await refinement.analyzePrompt();
    } else if (refinement.error?.type === 'refinement') {
      refinement.clearError();
      await refinement.refinePrompt();
    }
  }, [refinement]);

  return {
    ...refinement,
    ...sessionHistory,
    startNewRefinement,
    completeRefinement,
    retryOnError
  };
}