/**
 * API Key Service Implementation
 * 
 * This service handles HTTP communication with the backend API for managing
 * user-provided API keys for AI providers (OpenAI, Anthropic, OpenRouter).
 * 
 * Features:
 * - Store, retrieve, update, and delete API keys
 * - Validate API keys before storing
 * - Error handling and retry logic
 * - Type-safe HTTP client
 */

import {
  ApiKeyServiceContract,
  ApiKeyRecord,
  ValidationResult,
  StoreApiKeyRequest,
  UpdateApiKeyRequest,
  ValidateApiKeyRequest,
  ProviderType
} from '../types/services';

/**
 * Configuration for the API Key service
 */
interface ApiKeyServiceConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  userId: string;
}

/**
 * HTTP response wrapper
 */
interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Service for managing user API keys
 */
export class ApiKeyService implements ApiKeyServiceContract {
  private config: ApiKeyServiceConfig;

  constructor(config: Partial<ApiKeyServiceConfig> = {}) {
    this.config = {
      baseUrl: config.baseUrl || 'http://localhost:8080',
      timeout: config.timeout || 10000,
      retryAttempts: config.retryAttempts || 3,
      userId: config.userId || 'default-user'
    };
  }

  /**
   * Makes an HTTP request with error handling and retries
   */
  private async makeRequest<T>(
    url: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<T> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(`${this.config.baseUrl}${url}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'user-id': this.config.userId,
          ...options.headers
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData: ApiResponse<never> = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}`;
        throw new Error(`API request failed: ${errorMessage}`);
      }

      // Handle 204 No Content responses
      if (response.status === 204) {
        return undefined as T;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }

      // Retry on network errors
      if (retryCount < this.config.retryAttempts && 
          error instanceof Error && 
          (error.message.includes('fetch') || error.message.includes('network'))) {
        
        console.warn(`Request failed, retrying (${retryCount + 1}/${this.config.retryAttempts}):`, error.message);
        await this.delay(Math.pow(2, retryCount) * 1000); // Exponential backoff
        return this.makeRequest<T>(url, options, retryCount + 1);
      }

      throw error;
    }
  }

  /**
   * Utility function for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Stores a new API key for a provider
   */
  async storeApiKey(request: StoreApiKeyRequest): Promise<ApiKeyRecord> {
    if (!request.provider || !request.key?.trim()) {
      throw new Error('Provider and API key are required');
    }

    return this.makeRequest<ApiKeyRecord>('/api/keys', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  /**
   * Lists all API keys for the current user
   */
  async listApiKeys(): Promise<ApiKeyRecord[]> {
    return this.makeRequest<ApiKeyRecord[]>('/api/keys', {
      method: 'GET'
    });
  }

  /**
   * Updates an existing API key for a provider
   */
  async updateApiKey(provider: ProviderType, request: UpdateApiKeyRequest): Promise<ApiKeyRecord> {
    if (!provider || !request.key?.trim()) {
      throw new Error('Provider and API key are required');
    }

    return this.makeRequest<ApiKeyRecord>(`/api/keys/${provider}`, {
      method: 'PUT',
      body: JSON.stringify(request)
    });
  }

  /**
   * Deletes an API key for a provider
   */
  async deleteApiKey(provider: ProviderType): Promise<void> {
    if (!provider) {
      throw new Error('Provider is required');
    }

    return this.makeRequest<void>(`/api/keys/${provider}`, {
      method: 'DELETE'
    });
  }

  /**
   * Validates an API key without storing it
   */
  async validateApiKey(request: ValidateApiKeyRequest): Promise<ValidationResult> {
    if (!request.provider || !request.key?.trim()) {
      throw new Error('Provider and API key are required');
    }

    return this.makeRequest<ValidationResult>('/api/keys/validate', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  /**
   * Gets the decrypted API key for a provider
   * Note: This method would typically not expose the raw key to the frontend
   * It's included for completeness but should be used carefully
   */
  async getDecryptedKey(provider: ProviderType): Promise<string | null> {
    if (!provider) {
      throw new Error('Provider is required');
    }

    try {
      const keys = await this.listApiKeys();
      const keyRecord = keys.find(k => k.provider === provider);
      
      if (!keyRecord || !keyRecord.isValid) {
        return null;
      }

      // In a real implementation, this would require additional backend support
      // For now, we'll return an indicator that the key exists
      // The actual key retrieval should happen server-side
      return keyRecord.maskedKey; // This is just the masked version
    } catch (error) {
      console.error('Failed to get decrypted key:', error);
      return null;
    }
  }

  /**
   * Checks if a valid API key exists for a provider
   */
  async hasValidKey(provider: ProviderType): Promise<boolean> {
    try {
      const keys = await this.listApiKeys();
      return keys.some(k => k.provider === provider && k.isValid);
    } catch (error) {
      console.error('Failed to check for valid key:', error);
      return false;
    }
  }

  /**
   * Gets the list of providers with valid keys
   */
  async getAvailableProviders(): Promise<ProviderType[]> {
    try {
      const keys = await this.listApiKeys();
      return keys
        .filter(k => k.isValid)
        .map(k => k.provider);
    } catch (error) {
      console.error('Failed to get available providers:', error);
      return [];
    }
  }

  /**
   * Updates the service configuration
   */
  updateConfig(newConfig: Partial<ApiKeyServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Default instance for use throughout the application
// Create default instance with environment configuration
export const apiKeyService = new ApiKeyService({
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: Number(import.meta.env.VITE_API_KEY_VALIDATION_TIMEOUT) || 10000,
  retryAttempts: Number(import.meta.env.VITE_API_RETRY_MAX_ATTEMPTS) || 3,
  userId: import.meta.env.VITE_DEFAULT_USER_ID || 'default-user'
});

export default apiKeyService;