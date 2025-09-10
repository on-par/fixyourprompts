import apiKeyModel from '../models/api-key.model.js';
import apiKeyValidatorService from '../services/api-key-validator.service.js';

const VALID_PROVIDERS = ['openai', 'anthropic', 'openrouter'];

// Rate limiting state (in-memory for simplicity)
const rateLimitCache = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10;

function isRateLimited(userId) {
  const now = Date.now();
  const userRequests = rateLimitCache.get(userId) || [];
  
  // Remove requests older than the window
  const validRequests = userRequests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);
  
  if (validRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }
  
  // Add current request
  validRequests.push(now);
  rateLimitCache.set(userId, validRequests);
  
  return false;
}

function validateProvider(provider) {
  return VALID_PROVIDERS.includes(provider?.toLowerCase());
}

function getUserId(request) {
  return request.headers['user-id'];
}

async function apiKeysRoutes(fastify, options) {
  // Store API Key - POST /api/keys
  fastify.post('/api/keys', {
    schema: {
      body: {
        type: 'object',
        required: ['provider', 'key'],
        properties: {
          provider: {
            type: 'string',
            enum: VALID_PROVIDERS
          },
          key: {
            type: 'string',
            minLength: 1
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const userId = getUserId(request);
      const { provider, key } = request.body;

      if (!userId) {
        return reply.code(401).send({ error: 'User ID is required' });
      }

      if (!validateProvider(provider)) {
        return reply.code(400).send({ error: 'Invalid provider. Must be one of: openai, anthropic, openrouter' });
      }

      if (!key || key.trim() === '') {
        return reply.code(400).send({ error: 'API key is required' });
      }

      // Check if key already exists for this user and provider
      const existingKey = apiKeyModel.findByUserAndProvider(userId, provider);
      if (existingKey) {
        return reply.code(409).send({ error: `API key for provider ${provider} already exists for this user` });
      }

      // Validate the API key
      const validationResult = await apiKeyValidatorService.validate(provider, key);
      if (!validationResult.valid) {
        return reply.code(400).send({ 
          error: 'Invalid API key', 
          message: validationResult.message 
        });
      }

      // Store the key
      const savedKey = apiKeyModel.create({
        userId,
        provider,
        apiKey: key,
        isValid: validationResult.valid
      });

      return reply.code(201).send(savedKey);

    } catch (error) {
      fastify.log.error(error);
      if (error.message.includes('already exists')) {
        return reply.code(409).send({ error: error.message });
      }
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // List API Keys - GET /api/keys
  fastify.get('/api/keys', async (request, reply) => {
    try {
      const userId = getUserId(request);

      if (!userId) {
        return reply.code(401).send({ error: 'User ID is required' });
      }

      const keys = apiKeyModel.listByUser(userId);
      return reply.send(keys);

    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Update API Key - PUT /api/keys/:provider
  fastify.put('/api/keys/:provider', {
    schema: {
      params: {
        type: 'object',
        required: ['provider'],
        properties: {
          provider: {
            type: 'string'
          }
        }
      },
      body: {
        type: 'object',
        required: ['key'],
        properties: {
          key: {
            type: 'string',
            minLength: 1
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const userId = getUserId(request);
      const { provider } = request.params;
      const { key } = request.body;

      if (!userId) {
        return reply.code(401).send({ error: 'User ID is required' });
      }

      if (!validateProvider(provider)) {
        return reply.code(400).send({ error: 'Invalid provider. Must be one of: openai, anthropic, openrouter' });
      }

      if (!key || key.trim() === '') {
        return reply.code(400).send({ error: 'API key is required' });
      }

      // Check if key exists
      const existingKey = apiKeyModel.findByUserAndProvider(userId, provider);
      if (!existingKey) {
        return reply.code(404).send({ error: `API key for provider ${provider} not found` });
      }

      // Validate the new API key
      const validationResult = await apiKeyValidatorService.validate(provider, key);
      if (!validationResult.valid) {
        return reply.code(400).send({ 
          error: 'Invalid API key', 
          message: validationResult.message 
        });
      }

      // Update the key
      const updatedKey = apiKeyModel.update(userId, provider, {
        apiKey: key,
        isValid: validationResult.valid
      });

      return reply.send(updatedKey);

    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Delete API Key - DELETE /api/keys/:provider
  fastify.delete('/api/keys/:provider', {
    schema: {
      params: {
        type: 'object',
        required: ['provider'],
        properties: {
          provider: {
            type: 'string'
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const userId = getUserId(request);
      const { provider } = request.params;

      if (!userId) {
        return reply.code(401).send({ error: 'User ID is required' });
      }

      if (!validateProvider(provider)) {
        return reply.code(400).send({ error: 'Invalid provider. Must be one of: openai, anthropic, openrouter' });
      }

      // Check if key exists and delete it
      const deleted = apiKeyModel.delete(userId, provider);
      if (!deleted) {
        return reply.code(404).send({ error: `API key for provider ${provider} not found` });
      }

      return reply.code(204).send();

    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Validate API Key - POST /api/keys/validate
  fastify.post('/api/keys/validate', {
    schema: {
      body: {
        type: 'object',
        required: ['provider', 'key'],
        properties: {
          provider: {
            type: 'string',
            enum: VALID_PROVIDERS
          },
          key: {
            type: 'string',
            minLength: 1
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const userId = getUserId(request);
      const { provider, key } = request.body;

      if (!userId) {
        return reply.code(401).send({ error: 'User ID is required' });
      }

      // Apply rate limiting
      if (isRateLimited(userId)) {
        return reply.code(429).send({ 
          error: 'Rate limit exceeded. Maximum 10 validation requests per minute.' 
        });
      }

      if (!validateProvider(provider)) {
        return reply.code(400).send({ error: 'Invalid provider. Must be one of: openai, anthropic, openrouter' });
      }

      if (!key || key.trim() === '') {
        return reply.code(400).send({ error: 'API key is required' });
      }

      // Validate the API key without storing it
      const validationResult = await apiKeyValidatorService.validate(provider, key);

      return reply.send(validationResult);

    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
}

export default apiKeysRoutes;