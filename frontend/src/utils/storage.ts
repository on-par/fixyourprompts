/**
 * Storage utilities for the FixYourPrompts application
 * Implements the StorageContract interface with localStorage persistence
 */

import { PromptRefinementSession, UserPreferences } from '../types/core';
import { StorageContract } from '../types/services';
import { validateSession } from './validation';

// Storage keys for localStorage
const STORAGE_KEYS = {
  SESSIONS: 'fixyourprompts_sessions',
  PREFERENCES: 'fixyourprompts_preferences'
} as const;

/**
 * Default user preferences
 */
const DEFAULT_PREFERENCES: UserPreferences = {
  showEducationTips: true,
  preferredComplexityLevel: 'beginner',
  darkMode: false
};

/**
 * Storage service implementation using localStorage
 * Handles persistence of sessions and user preferences with proper error handling
 */
export class StorageService implements StorageContract {
  /**
   * Saves a session to local storage
   * @param session - The session to save
   */
  saveSession(session: PromptRefinementSession): void {
    try {
      // Validate the session before saving
      if (!validateSession(session)) {
        throw new Error('Invalid session data');
      }

      // Load existing sessions
      const existingSessions = this.loadSessions();
      
      // Find if session already exists (update case)
      const existingIndex = existingSessions.findIndex(s => s.id === session.id);
      
      if (existingIndex >= 0) {
        // Update existing session
        existingSessions[existingIndex] = session;
      } else {
        // Add new session
        existingSessions.push(session);
      }

      // Serialize and save
      const serializedSessions = JSON.stringify(existingSessions, this.dateReplacer);
      localStorage.setItem(STORAGE_KEYS.SESSIONS, serializedSessions);
    } catch (error) {
      console.error('Failed to save session:', error);
      throw new Error('Unable to save session to storage');
    }
  }

  /**
   * Loads all saved sessions from local storage
   * @returns Array of saved sessions
   */
  loadSessions(): PromptRefinementSession[] {
    try {
      const serializedSessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      
      if (!serializedSessions) {
        return [];
      }

      // Parse with date reviver
      const parsedSessions = JSON.parse(serializedSessions, this.dateReviver);
      
      // Validate each session and filter out invalid ones
      if (!Array.isArray(parsedSessions)) {
        console.warn('Invalid sessions data format, returning empty array');
        return [];
      }

      const validSessions = parsedSessions.filter((session: unknown) => {
        const isValid = validateSession(session);
        if (!isValid) {
          console.warn('Invalid session found and filtered out:', session);
        }
        return isValid;
      }) as PromptRefinementSession[];

      return validSessions;
    } catch (error) {
      console.error('Failed to load sessions:', error);
      // Return empty array on error rather than throwing
      return [];
    }
  }

  /**
   * Clears all saved sessions from local storage
   */
  clearSessions(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.SESSIONS);
    } catch (error) {
      console.error('Failed to clear sessions:', error);
      throw new Error('Unable to clear sessions from storage');
    }
  }

  /**
   * Saves user preferences to local storage
   * @param prefs - User preferences to save
   */
  savePreferences(prefs: UserPreferences): void {
    try {
      // Validate preferences structure
      if (!this.validatePreferences(prefs)) {
        throw new Error('Invalid preferences data');
      }

      const serializedPrefs = JSON.stringify(prefs);
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, serializedPrefs);
    } catch (error) {
      console.error('Failed to save preferences:', error);
      throw new Error('Unable to save preferences to storage');
    }
  }

  /**
   * Loads user preferences from local storage
   * @returns User preferences or null if none saved
   */
  loadPreferences(): UserPreferences | null {
    try {
      const serializedPrefs = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      
      if (!serializedPrefs) {
        return null;
      }

      const parsedPrefs = JSON.parse(serializedPrefs);
      
      // Validate and merge with defaults
      if (this.validatePreferences(parsedPrefs)) {
        return { ...DEFAULT_PREFERENCES, ...parsedPrefs };
      } else {
        console.warn('Invalid preferences found, returning null');
        return null;
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
      return null;
    }
  }

  /**
   * Custom JSON replacer function to handle Date objects during serialization
   * @param key - Object key
   * @param value - Object value
   * @returns Serialized value
   */
  private dateReplacer(key: string, value: any): any {
    if (value instanceof Date) {
      return { __date: value.toISOString() };
    }
    return value;
  }

  /**
   * Custom JSON reviver function to restore Date objects during deserialization
   * @param key - Object key
   * @param value - Object value
   * @returns Deserialized value
   */
  private dateReviver(key: string, value: any): any {
    if (value && typeof value === 'object' && value.__date) {
      return new Date(value.__date);
    }
    return value;
  }

  /**
   * Validates user preferences object
   * @param prefs - Object to validate as UserPreferences
   * @returns true if valid UserPreferences, false otherwise
   */
  private validatePreferences(prefs: unknown): prefs is UserPreferences {
    if (!prefs || typeof prefs !== 'object') {
      return false;
    }

    const p = prefs as any;

    return (
      typeof p.showEducationTips === 'boolean' &&
      (p.preferredComplexityLevel === 'beginner' || 
       p.preferredComplexityLevel === 'intermediate' || 
       p.preferredComplexityLevel === 'advanced') &&
      typeof p.darkMode === 'boolean'
    );
  }
}

/**
 * Singleton instance of the storage service
 */
export const storageService = new StorageService();

/**
 * Default export for convenience
 */
export default storageService;