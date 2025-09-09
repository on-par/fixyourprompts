
import fetch from 'node-fetch';

const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://ollama:11434/api/generate';

/**
 * Sends a prompt to the Ollama API for refinement.
 * @param {string} prompt The user's prompt.
 * @returns {Promise<{refined_prompt: string, explanation: string}>} The refined prompt and explanation.
 */
async function refineWithOllama(prompt) {
  const systemPrompt = `You are a prompt refiner. Your task is to take a user's prompt and refine it to be more structured and effective. Return a JSON object with the following structure: { "refined_prompt": "<refined_prompt_text>", "explanation": "<explanation_text>" }. The user's prompt is: "${prompt}"`;

  const response = await fetch(OLLAMA_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama2:7b-chat-q2_K',
      prompt: systemPrompt,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama API request failed with status ${response.status}`);
  }

  const data = await response.json();
  const jsonMatch = data.response.match(/\{.*\}/s);
  if (!jsonMatch) {
    throw new Error('Could not find JSON object in Ollama response.');
  }
  return JSON.parse(jsonMatch[0]);
}

export { refineWithOllama };
