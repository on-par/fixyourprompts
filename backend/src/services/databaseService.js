
import Database from 'better-sqlite3';
import { randomUUID } from 'crypto';

const db = new Database('fixyourprompts.db');

const insertPromptSession = db.prepare(
  'INSERT INTO PromptSession (id, created_at, original_prompt, refined_prompt, analysis_summary) VALUES (?, ?, ?, ?, ?)'
);

/**
 * Saves a prompt refinement session to the database.
 * @param {{original_prompt: string, refined_prompt: string, explanation: string}} sessionData The data for the session.
 * @returns {{id: string}} The ID of the saved session.
 */
function savePromptSession(sessionData) {
  const { original_prompt, refined_prompt, explanation } = sessionData;
  const id = randomUUID();
  const created_at = new Date().toISOString();

  try {
    insertPromptSession.run(id, created_at, original_prompt, refined_prompt, explanation);
    return { id };
  } catch (error) {
    console.error('Failed to save prompt session:', error);
    // We can choose to not throw an error here, as saving the session is not critical to the user experience.
  }
}

export { savePromptSession };
