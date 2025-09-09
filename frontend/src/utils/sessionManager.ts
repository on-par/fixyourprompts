/**
 * Session management utilities implementing SessionSerializerContract
 * Handles serialization, deserialization, and validation of PromptRefinementSession objects
 */

import { PromptRefinementSession } from '../types/core';
import { SessionSerializerContract } from '../types/services';
import { validateSession } from './validation';

/**
 * Session serializer implementation
 * Handles JSON serialization/deserialization with proper Date handling
 */
export class SessionSerializer implements SessionSerializerContract {
  /**
   * Serializes a session to JSON string format suitable for storage
   * @param session - The session to serialize
   * @returns Serialized session data
   */
  serialize(session: PromptRefinementSession): string {
    const serializable = {
      ...session,
      createdAt: session.createdAt.toISOString()
    };
    
    return JSON.stringify(serializable);
  }

  /**
   * Deserializes session data from storage format
   * @param data - Serialized session data
   * @returns Deserialized session object
   */
  deserialize(data: string): PromptRefinementSession {
    const parsed = JSON.parse(data);
    
    const session = {
      ...parsed,
      createdAt: new Date(parsed.createdAt)
    };
    
    if (!this.validateSession(session)) {
      throw new Error('Invalid session data structure');
    }
    
    return session;
  }

  /**
   * Validates that an object is a valid session
   * @param session - Object to validate
   * @returns Type guard confirming session validity
   */
  validateSession(session: unknown): session is PromptRefinementSession {
    return validateSession(session);
  }
}

/**
 * Default session serializer instance
 */
export const sessionSerializer = new SessionSerializer();