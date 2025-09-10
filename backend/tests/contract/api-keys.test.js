import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { server } from '../../src/server.js';
import apiKeyModel from '../../src/models/api-key.model.js';

// Mock the API key validator to avoid external API calls during tests
vi.mock('../../src/services/api-key-validator.service.js', () => ({
  default: {
    validate: vi.fn().mockResolvedValue({ valid: true, message: 'Valid key' })
  }
}));

describe('API Keys Contract Tests', () => {
  const testUserId = 'test-user-123';
  
  beforeEach(async () => {
    // Clean up any existing test data
    await apiKeyModel.delete(testUserId, 'openai');
    await apiKeyModel.delete(testUserId, 'anthropic');
    await apiKeyModel.delete(testUserId, 'openrouter');
  });

  afterEach(async () => {
    // Clean up test data
    await apiKeyModel.delete(testUserId, 'openai');
    await apiKeyModel.delete(testUserId, 'anthropic');
    await apiKeyModel.delete(testUserId, 'openrouter');
  });

  describe('POST /api/keys - Store API Key', () => {
    it('should store a new OpenAI API key', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/keys',
        headers: {
          'user-id': testUserId
        },
        payload: {
          provider: 'openai',
          key: 'sk-test123456789abcdef'
        }
      });

      expect(response.statusCode).toBe(201);
      
      const body = JSON.parse(response.body);
      expect(body).toMatchObject({
        provider: 'openai',
        maskedKey: 'sk-...cdef',
        isValid: true,
        userId: testUserId
      });
      expect(body.id).toBeDefined();
      expect(body.createdAt).toBeDefined();
    });

    it('should store a new Anthropic API key', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/keys',
        headers: {
          'user-id': testUserId
        },
        payload: {
          provider: 'anthropic',
          key: 'sk-ant-test123456789abcdef'
        }
      });

      expect(response.statusCode).toBe(201);
      
      const body = JSON.parse(response.body);
      expect(body).toMatchObject({
        provider: 'anthropic',
        maskedKey: 'sk-...cdef',
        isValid: true,
        userId: testUserId
      });
    });

    it('should store a new OpenRouter API key', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/keys',
        headers: {
          'user-id': testUserId
        },
        payload: {
          provider: 'openrouter',
          key: 'sk-or-test123456789abcdef'
        }
      });

      expect(response.statusCode).toBe(201);
      
      const body = JSON.parse(response.body);
      expect(body).toMatchObject({
        provider: 'openrouter',
        maskedKey: 'sk-...cdef',
        isValid: true,
        userId: testUserId
      });
    });

    it('should return 400 for invalid provider', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/keys',
        headers: {
          'user-id': testUserId
        },
        payload: {
          provider: 'invalid',
          key: 'sk-test123456789abcdef'
        }
      });

      expect(response.statusCode).toBe(400);
      
      const body = JSON.parse(response.body);
      expect(body.message).toContain('must be equal to one of the allowed values');
    });

    it('should return 400 for missing key', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/keys',
        headers: {
          'user-id': testUserId
        },
        payload: {
          provider: 'openai'
        }
      });

      expect(response.statusCode).toBe(400);
      
      const body = JSON.parse(response.body);
      expect(body.message).toContain('must have required property');
    });

    it('should return 409 when key already exists for provider', async () => {
      // First request should succeed
      await server.inject({
        method: 'POST',
        url: '/api/keys',
        headers: {
          'user-id': testUserId
        },
        payload: {
          provider: 'openai',
          key: 'sk-test123456789abcdef'
        }
      });

      // Second request should fail
      const response = await server.inject({
        method: 'POST',
        url: '/api/keys',
        headers: {
          'user-id': testUserId
        },
        payload: {
          provider: 'openai',
          key: 'sk-different123456789'
        }
      });

      expect(response.statusCode).toBe(409);
      
      const body = JSON.parse(response.body);
      expect(body.error).toContain('already exists');
    });
  });

  describe('GET /api/keys - List API Keys', () => {
    it('should return empty array when no keys exist', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/keys',
        headers: {
          'user-id': testUserId
        }
      });

      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      expect(body).toEqual([]);
    });

    it('should return user keys with masked values', async () => {
      // Create test keys
      await apiKeyModel.create({
        userId: testUserId,
        provider: 'openai',
        apiKey: 'sk-test123456789abcdef',
        isValid: true
      });

      await apiKeyModel.create({
        userId: testUserId,
        provider: 'anthropic',
        apiKey: 'sk-ant-test123456789abcdef',
        isValid: false
      });

      const response = await server.inject({
        method: 'GET',
        url: '/api/keys',
        headers: {
          'user-id': testUserId
        }
      });

      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      expect(body).toHaveLength(2);
      
      const openaiKey = body.find(k => k.provider === 'openai');
      const anthropicKey = body.find(k => k.provider === 'anthropic');
      
      expect(openaiKey).toMatchObject({
        provider: 'openai',
        maskedKey: 'sk-...cdef',
        isValid: true,
        userId: testUserId
      });
      
      expect(anthropicKey).toMatchObject({
        provider: 'anthropic',
        maskedKey: 'sk-...cdef',
        isValid: false,
        userId: testUserId
      });

      // Ensure actual keys are not exposed
      expect(openaiKey.key).toBeUndefined();
      expect(anthropicKey.key).toBeUndefined();
    });
  });

  describe('PUT /api/keys/:provider - Update API Key', () => {
    beforeEach(async () => {
      // Create an existing key for update tests
      await apiKeyModel.create({
        userId: testUserId,
        provider: 'openai',
        apiKey: 'sk-old123456789abcdef',
        isValid: true
      });
    });

    it('should update existing API key', async () => {
      const response = await server.inject({
        method: 'PUT',
        url: '/api/keys/openai',
        headers: {
          'user-id': testUserId
        },
        payload: {
          key: 'sk-new123456789abcdef'
        }
      });

      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      expect(body).toMatchObject({
        provider: 'openai',
        maskedKey: 'sk-...cdef',
        isValid: true,
        userId: testUserId
      });
    });

    it('should return 404 when key does not exist', async () => {
      const response = await server.inject({
        method: 'PUT',
        url: '/api/keys/anthropic',
        headers: {
          'user-id': testUserId
        },
        payload: {
          key: 'sk-new123456789abcdef'
        }
      });

      expect(response.statusCode).toBe(404);
      
      const body = JSON.parse(response.body);
      expect(body.error).toContain('not found');
    });

    it('should return 400 for invalid provider', async () => {
      const response = await server.inject({
        method: 'PUT',
        url: '/api/keys/invalid',
        headers: {
          'user-id': testUserId
        },
        payload: {
          key: 'sk-new123456789abcdef'
        }
      });

      expect(response.statusCode).toBe(400);
      
      const body = JSON.parse(response.body);
      expect(body.error).toContain('Invalid provider');
    });
  });

  describe('DELETE /api/keys/:provider - Delete API Key', () => {
    beforeEach(async () => {
      // Create an existing key for delete tests
      await apiKeyModel.create({
        userId: testUserId,
        provider: 'openai',
        apiKey: 'sk-test123456789abcdef',
        isValid: true
      });
    });

    it('should delete existing API key', async () => {
      const response = await server.inject({
        method: 'DELETE',
        url: '/api/keys/openai',
        headers: {
          'user-id': testUserId
        }
      });

      expect(response.statusCode).toBe(204);
      expect(response.body).toBe('');

      // Verify key is deleted
      const getResponse = await server.inject({
        method: 'GET',
        url: '/api/keys',
        headers: {
          'user-id': testUserId
        }
      });

      const body = JSON.parse(getResponse.body);
      expect(body).toEqual([]);
    });

    it('should return 404 when key does not exist', async () => {
      const response = await server.inject({
        method: 'DELETE',
        url: '/api/keys/anthropic',
        headers: {
          'user-id': testUserId
        }
      });

      expect(response.statusCode).toBe(404);
      
      const body = JSON.parse(response.body);
      expect(body.error).toContain('not found');
    });

    it('should return 400 for invalid provider', async () => {
      const response = await server.inject({
        method: 'DELETE',
        url: '/api/keys/invalid',
        headers: {
          'user-id': testUserId
        }
      });

      expect(response.statusCode).toBe(400);
      
      const body = JSON.parse(response.body);
      expect(body.error).toContain('Invalid provider');
    });
  });

  describe('POST /api/keys/validate - Validate API Key', () => {
    it('should validate API key without storing', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/keys/validate',
        headers: {
          'user-id': testUserId
        },
        payload: {
          provider: 'openai',
          key: 'sk-test123456789abcdef'
        }
      });

      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      expect(body).toMatchObject({
        valid: true,
        message: 'Valid key'
      });

      // Ensure key was not stored
      const getResponse = await server.inject({
        method: 'GET',
        url: '/api/keys',
        headers: {
          'user-id': testUserId
        }
      });

      const getBody = JSON.parse(getResponse.body);
      expect(getBody).toEqual([]);
    });

    it('should return 400 for invalid provider', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/keys/validate',
        headers: {
          'user-id': testUserId
        },
        payload: {
          provider: 'invalid',
          key: 'sk-test123456789abcdef'
        }
      });

      expect(response.statusCode).toBe(400);
      
      const body = JSON.parse(response.body);
      expect(body.message).toContain('must be equal to one of the allowed values');
    });

    it('should return 400 for missing key', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/keys/validate',
        headers: {
          'user-id': testUserId
        },
        payload: {
          provider: 'openai'
        }
      });

      expect(response.statusCode).toBe(400);
      
      const body = JSON.parse(response.body);
      expect(body.message).toContain('must have required property');
    });
  });
});