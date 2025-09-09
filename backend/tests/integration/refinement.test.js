
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import supertest from 'supertest';
import { server } from '../../src/server.js';

// Mock the aiService to avoid requiring real API keys
vi.mock('../../src/services/aiService.js', () => ({
  refinePrompt: vi.fn(() => Promise.resolve({
    refined_prompt: 'Create a Python script that performs data analysis with specific requirements: read CSV files, calculate statistics, generate visualizations, and output results with proper error handling.',
    explanation: 'The original prompt was too vague. The refined version specifies the programming language, data format, required functionality, and quality standards needed for a complete implementation.'
  }))
}));

describe('Prompt Refinement Integration Test', () => {
  let request;

  beforeAll(async () => {
    await server.ready();
    request = supertest(server.server);
  });

  afterAll(async () => {
    await server.close();
  });

  it('should refine a vague prompt into a structured one with valid API call', async () => {
    const vaguePrompt = 'write me code';
    const response = await request
      .post('/refine')
      .send({ 
        prompt: vaguePrompt,
        apiKey: 'test-api-key',
        provider: 'openai'
      });

    expect(response.status).toBe(200);
    expect(response.body.original_prompt).toBe(vaguePrompt);
    expect(response.body.refined_prompt).not.toBe(vaguePrompt);
    expect(response.body.refined_prompt.length).toBeGreaterThan(vaguePrompt.length);
    expect(response.body.explanation).not.toBe('');
    expect(response.body.refined_prompt).toContain('Python');
    expect(response.body.explanation).toContain('refined');
  });

  it('should handle API errors gracefully', async () => {
    // This test validates error handling when AI service fails
    const { refinePrompt } = await import('../../src/services/aiService.js');
    vi.mocked(refinePrompt).mockRejectedValueOnce(new Error('API rate limit exceeded'));

    const response = await request
      .post('/refine')
      .send({ 
        prompt: 'test prompt',
        apiKey: 'test-api-key',
        provider: 'openai'
      });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error');
  });
});
