import fetch from 'node-fetch';

// AI Provider configuration
const AI_PROVIDER = process.env.AI_PROVIDER || 'openai'; // 'openai', 'anthropic', or 'openrouter'
const API_KEY = process.env.API_KEY;

// Provider-specific configurations
const PROVIDERS = {
  openai: {
    url: 'https://api.openai.com/v1/chat/completions',
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    headers: (apiKey) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    }),
    formatRequest: (systemPrompt, userPrompt, model) => ({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    }),
    extractResponse: (data) => {
      return data.choices[0].message.content;
    }
  },
  
  anthropic: {
    url: 'https://api.anthropic.com/v1/messages',
    model: process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307',
    headers: (apiKey) => ({
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    }),
    formatRequest: (systemPrompt, userPrompt, model) => ({
      model,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 1000,
      temperature: 0.7
    }),
    extractResponse: (data) => {
      return data.content[0].text;
    }
  },
  
  openrouter: {
    url: 'https://openrouter.ai/api/v1/chat/completions',
    model: process.env.OPENROUTER_MODEL || 'mistralai/mistral-7b-instruct',
    headers: (apiKey) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.APP_URL || 'http://localhost',
      'X-Title': 'FixYourPrompts'
    }),
    formatRequest: (systemPrompt, userPrompt, model) => ({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    }),
    extractResponse: (data) => {
      return data.choices[0].message.content;
    }
  }
};

/**
 * Refines a prompt using the specified AI provider
 * @param {string} prompt The user's prompt to refine
 * @param {string} apiKey The API key for the provider
 * @param {string} providerName The AI provider to use (openai, anthropic, openrouter)
 * @returns {Promise<{refined_prompt: string, explanation: string}>} The refined prompt and explanation
 */
async function refinePrompt(prompt, apiKey, providerName) {
  // Use provided values or fall back to environment variables
  const selectedProvider = providerName || AI_PROVIDER;
  const selectedApiKey = apiKey || API_KEY;
  
  if (!selectedApiKey) {
    throw new Error(`API key required. Please provide your API key for ${selectedProvider}.`);
  }

  const provider = PROVIDERS[selectedProvider];
  if (!provider) {
    throw new Error(`Unsupported AI provider: ${selectedProvider}. Supported: openai, anthropic, openrouter`);
  }

  const systemPrompt = `You are an expert prompt engineer. Your task is to take a user's rough, vague prompt and refine it into a clear, structured, and effective prompt that will produce better results from AI systems.

Your response must be a valid JSON object with exactly this structure:
{
  "refined_prompt": "The improved, detailed prompt with clear context, specific requirements, and constraints",
  "explanation": "A brief explanation of why these changes improve the prompt and what techniques were applied"
}

Focus on:
1. Adding clear context and background
2. Specifying the desired output format
3. Including relevant constraints and requirements
4. Breaking down complex requests into clear steps
5. Adding examples where helpful
6. Clarifying ambiguous terms

The refined prompt should be immediately usable and significantly more effective than the original.`;

  const userPrompt = `Please refine this prompt: "${prompt}"`;

  try {
    const requestBody = provider.formatRequest(systemPrompt, userPrompt, provider.model);
    
    const response = await fetch(provider.url, {
      method: 'POST',
      headers: provider.headers(selectedApiKey),
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error Response:`, errorText);
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const content = provider.extractResponse(data);
    
    // Parse the JSON response
    let result;
    try {
      // Try to extract JSON from the response (in case it's wrapped in markdown or other text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', content);
      // Fallback: create a structured response from the text
      result = {
        refined_prompt: content.substring(0, Math.min(500, content.length)),
        explanation: 'The AI response was reformatted. The above is an improved version of your prompt.'
      };
    }

    // Validate the response structure
    if (!result.refined_prompt || !result.explanation) {
      throw new Error('Invalid response structure from AI');
    }

    return result;
  } catch (error) {
    console.error(`Error calling ${selectedProvider} API:`, error);
    throw error;
  }
}

export { refinePrompt };