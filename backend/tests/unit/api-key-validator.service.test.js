import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import apiKeyValidatorService from '../../src/services/api-key-validator.service.js';

// Mock fetch globally
vi.mock('node-fetch', () => ({
  default: vi.fn()
}));

import fetch from 'node-fetch';

describe('ApiKeyValidatorService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('validateOpenAI', () => {
    it('should return valid for successful OpenAI key validation', async () => {
      fetch.mockResolvedValueOnce({
        status: 200,
        json: async () => ({ data: [] })
      });

      const result = await apiKeyValidatorService.validateOpenAI('sk-test123');
      
      expect(result.valid).toBe(true);
      expect(result.message).toBe('OpenAI API key is valid');
      expect(fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/models',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer sk-test123'
          })
        })
      );
    });

    it('should return invalid for 401 response', async () => {
      fetch.mockResolvedValueOnce({
        status: 401,
        json: async () => ({ error: 'Unauthorized' })
      });

      const result = await apiKeyValidatorService.validateOpenAI('invalid-key');
      
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Invalid OpenAI API key');
    });

    it('should handle network errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await apiKeyValidatorService.validateOpenAI('sk-test123');
      
      expect(result.valid).toBe(false);
      expect(result.message).toContain('OpenAI validation error');
    });

    it('should handle timeout', async () => {
      const abortError = new Error('Request aborted');
      abortError.name = 'AbortError';
      fetch.mockRejectedValueOnce(abortError);

      const result = await apiKeyValidatorService.validateOpenAI('sk-test123');
      
      expect(result.valid).toBe(false);
      expect(result.message).toBe('OpenAI validation timeout');
    });
  });

  describe('validateAnthropic', () => {
    it('should return valid for successful Anthropic key validation', async () => {
      fetch.mockResolvedValueOnce({
        status: 200,
        json: async () => ({ content: [{ text: 'test' }] })
      });

      const result = await apiKeyValidatorService.validateAnthropic('sk-ant-test123');
      
      expect(result.valid).toBe(true);
      expect(result.message).toBe('Anthropic API key is valid');
      expect(fetch).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/messages',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'x-api-key': 'sk-ant-test123',
            'anthropic-version': '2023-06-01'
          })
        })
      );
    });

    it('should return valid for expected 400 error with valid key', async () => {
      fetch.mockResolvedValueOnce({
        status: 400,
        json: async () => ({ 
          error: { 
            type: 'invalid_request_error',
            message: 'Max tokens too small' 
          }
        })
      });

      const result = await apiKeyValidatorService.validateAnthropic('sk-ant-test123');
      
      expect(result.valid).toBe(true);
      expect(result.message).toBe('Anthropic API key is valid');
    });

    it('should return invalid for 401 response', async () => {
      fetch.mockResolvedValueOnce({
        status: 401,
        json: async () => ({ error: 'Unauthorized' })
      });

      const result = await apiKeyValidatorService.validateAnthropic('invalid-key');
      
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Invalid Anthropic API key');
    });

    it('should handle network errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await apiKeyValidatorService.validateAnthropic('sk-ant-test123');
      
      expect(result.valid).toBe(false);
      expect(result.message).toContain('Anthropic validation error');
    });
  });

  describe('validateOpenRouter', () => {
    it('should return valid for successful OpenRouter key validation', async () => {
      fetch.mockResolvedValueOnce({
        status: 200,
        json: async () => ({ 
          data: { 
            label: 'Test Key',
            usage: 0,
            limit: 100
          }
        })
      });

      const result = await apiKeyValidatorService.validateOpenRouter('sk-or-test123');
      
      expect(result.valid).toBe(true);
      expect(result.message).toBe('OpenRouter API key is valid');
      expect(fetch).toHaveBeenCalledWith(
        'https://openrouter.ai/api/v1/auth/key',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer sk-or-test123'
          })
        })
      );
    });

    it('should return invalid for 401 response', async () => {
      fetch.mockResolvedValueOnce({
        status: 401,
        json: async () => ({ error: 'Unauthorized' })
      });

      const result = await apiKeyValidatorService.validateOpenRouter('invalid-key');
      
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Invalid OpenRouter API key');
    });

    it('should return invalid for 403 response', async () => {
      fetch.mockResolvedValueOnce({
        status: 403,
        json: async () => ({ error: 'Forbidden' })
      });

      const result = await apiKeyValidatorService.validateOpenRouter('invalid-key');
      
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Invalid OpenRouter API key');
    });

    it('should handle invalid response structure', async () => {
      fetch.mockResolvedValueOnce({
        status: 200,
        json: async () => ({ invalid: 'structure' })
      });

      const result = await apiKeyValidatorService.validateOpenRouter('sk-or-test123');
      
      expect(result.valid).toBe(false);
      expect(result.message).toBe('OpenRouter API key validation response invalid');
    });
  });

  describe('validate', () => {
    it('should route to correct validator based on provider', async () => {
      fetch.mockResolvedValue({
        status: 200,
        json: async () => ({ data: [] })
      });

      await apiKeyValidatorService.validate('openai', 'sk-test');
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('openai.com'),
        expect.any(Object)
      );

      vi.clearAllMocks();
      fetch.mockResolvedValue({
        status: 200,
        json: async () => ({ content: [] })
      });

      await apiKeyValidatorService.validate('anthropic', 'sk-ant-test');
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('anthropic.com'),
        expect.any(Object)
      );

      vi.clearAllMocks();
      fetch.mockResolvedValue({
        status: 200,
        json: async () => ({ data: { label: 'test' } })
      });

      await apiKeyValidatorService.validate('openrouter', 'sk-or-test');
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('openrouter.ai'),
        expect.any(Object)
      );
    });

    it('should handle empty keys', async () => {
      const result = await apiKeyValidatorService.validate('openai', '');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('API key cannot be empty');
    });

    it('should handle whitespace-only keys', async () => {
      const result = await apiKeyValidatorService.validate('openai', '   ');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('API key cannot be empty');
    });

    it('should handle unknown providers', async () => {
      const result = await apiKeyValidatorService.validate('unknown', 'key');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Unknown provider: unknown');
    });

    it('should be case-insensitive for provider names', async () => {
      fetch.mockResolvedValue({
        status: 200,
        json: async () => ({ data: [] })
      });

      await apiKeyValidatorService.validate('OpenAI', 'sk-test');
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('openai.com'),
        expect.any(Object)
      );

      vi.clearAllMocks();
      await apiKeyValidatorService.validate('ANTHROPIC', 'sk-test');
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('anthropic.com'),
        expect.any(Object)
      );
    });
  });
});