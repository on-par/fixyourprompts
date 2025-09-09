
import { refinePrompt } from '../services/aiService.js';
import { savePromptSession } from '../services/databaseService.js';

async function refineRoutes(server, options) {
  const refineSchema = {
    body: {
      type: 'object',
      required: ['prompt', 'apiKey', 'provider'],
      properties: {
        prompt: { type: 'string', maxLength: 4096 },
        apiKey: { type: 'string', minLength: 1 },
        provider: { type: 'string', enum: ['openai', 'anthropic', 'openrouter'] },
      },
    },
    response: {
      200: {
        type: 'object',
        required: ['original_prompt', 'refined_prompt', 'explanation'],
        properties: {
          original_prompt: { type: 'string' },
          refined_prompt: { type: 'string' },
          explanation: { type: 'string' },
        },
      },
    },
  };

  server.post('/refine', { schema: refineSchema }, async (request, reply) => {
    const { prompt, apiKey, provider } = request.body;

    try {
      // 1. Refine the prompt using the AI service
      const { refined_prompt, explanation } = await refinePrompt(prompt, apiKey, provider);

      // 2. Save the session to the database (fire and forget)
      savePromptSession({
        original_prompt: prompt,
        refined_prompt,
        explanation,
      });

      // 3. Return the results to the user
      return {
        original_prompt: prompt,
        refined_prompt,
        explanation,
      };
    } catch (error) {
      server.log.error(error, 'Failed to refine prompt');
      reply.status(500).send({ error: 'Failed to refine prompt' });
    }
  });
}

export default refineRoutes;
