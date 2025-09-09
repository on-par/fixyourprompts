
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import { server } from '../../src/server'; // Assuming server is exported from here

describe('POST /refine contract test', () => {
  let request;

  beforeAll(async () => {
    await new Promise(resolve => setTimeout(resolve, 5000));
    await server.ready();
    request = supertest(server.server);
  });

  afterAll(async () => {
    await server.close();
  });

  it('should return a 400 response when missing required fields', async () => {
    const response = await request
      .post('/refine')
      .send({ prompt: 'write me a function' });

    expect(response.status).toBe(400);
  });

  it('should return a 400 response when missing API key', async () => {
    const response = await request
      .post('/refine')
      .send({ 
        prompt: 'write me a function',
        provider: 'openai'
      });

    expect(response.status).toBe(400);
  });

  it('should return a 400 response when missing provider', async () => {
    const response = await request
      .post('/refine')
      .send({ 
        prompt: 'write me a function',
        apiKey: 'test-key'
      });

    expect(response.status).toBe(400);
  });

  it('should validate request schema and reject invalid provider', async () => {
    const response = await request
      .post('/refine')
      .send({ 
        prompt: 'write me a function',
        apiKey: 'test-key',
        provider: 'invalid-provider'
      });

    expect(response.status).toBe(400);
  });
});
